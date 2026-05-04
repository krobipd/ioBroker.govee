import type { LocalSnapshot, LocalSnapshotStore, SnapshotSegment } from "./local-snapshots";
import type { GoveeDevice } from "./types";

/**
 * Host-Interface — die Adapter-Funktionen die der SnapshotHandler braucht
 * ohne von der Adapter-Klasse direkt zu hängen.
 *
 * Pattern analog `WizardHost` in segment-wizard.ts. Vorteil: testbar mit
 * Mocks, dependencies-flow ist explizit.
 */
export interface SnapshotHandlerHost {
  /** Adapter logger. */
  log: ioBroker.Logger;
  /** Local snapshot persistence (file-based JSON store). */
  store: LocalSnapshotStore;
  /** Adapter-namespace prefix (z.B. "govee-smart.0"). */
  namespace: string;
  /** Resolved object-prefix für ein Gerät (z.B. "devices.h61be_525f"). */
  devicePrefix: (device: GoveeDevice) => string;
  /** State-read (volles ID `<namespace>.<prefix>.<channel>.<state>`). */
  getState: (id: string) => Promise<ioBroker.State | null | undefined>;
  /** Send-command via LAN→Cloud-Routing (DeviceManager.sendCommand). */
  sendCommand: (device: GoveeDevice, command: string, value: unknown) => Promise<void>;
  /** Targeted state-tree refresh nach save/delete (snapshot_local Dropdown). */
  refreshDeviceStates: (device: GoveeDevice) => void;
}

/**
 * Lokaler Snapshot-Manager — kapselt save/restore/delete für die
 * snapshot_save / snapshot_local / snapshot_delete Dropdown-States.
 *
 * Vorher in `main.ts` als 3 private Methoden mit ~105 Zeilen. Hier in
 * eigenen Klasse mit Host-Interface — testbar isoliert, main.ts wird
 * kleiner, Maintainability gesteigert.
 */
export class SnapshotHandler {
  /**
   * @param host Adapter dependencies via Host-Interface (testbar via Mocks)
   */
  constructor(private readonly host: SnapshotHandlerHost) {}

  /**
   * Save current device state as a local snapshot.
   *
   * @param device Target device
   * @param name Snapshot name
   */
  async save(device: GoveeDevice, name: string): Promise<void> {
    const prefix = this.host.devicePrefix(device);
    const ns = this.host.namespace;

    // Read device-level state in parallel
    const [powerState, brightState, colorState, ctState] = await Promise.all([
      this.host.getState(`${ns}.${prefix}.control.power`),
      this.host.getState(`${ns}.${prefix}.control.brightness`),
      this.host.getState(`${ns}.${prefix}.control.colorRgb`),
      this.host.getState(`${ns}.${prefix}.control.colorTemperature`),
    ]);

    // Read per-segment states in parallel — sequenziell wären 20×2 reads
    // ~80 ms; parallel = single round-trip.
    let segments: SnapshotSegment[] | undefined;
    const segCount = device.segmentCount ?? 0;
    if (segCount > 0) {
      const segReads: Promise<[ioBroker.State | null | undefined, ioBroker.State | null | undefined]>[] = [];
      for (let i = 0; i < segCount; i++) {
        segReads.push(
          Promise.all([
            this.host.getState(`${ns}.${prefix}.segments.${i}.color`),
            this.host.getState(`${ns}.${prefix}.segments.${i}.brightness`),
          ]),
        );
      }
      const segResults = await Promise.all(segReads);
      segments = segResults.map(([segColor, segBright]) => ({
        color: typeof segColor?.val === "string" ? segColor.val : "#000000",
        brightness: typeof segBright?.val === "number" ? segBright.val : 100,
      }));
    }

    const snapshot: LocalSnapshot = {
      name,
      power: powerState?.val === true,
      brightness: typeof brightState?.val === "number" ? brightState.val : 0,
      colorRgb: typeof colorState?.val === "string" ? colorState.val : "#000000",
      colorTemperature: typeof ctState?.val === "number" ? ctState.val : 0,
      segments,
      savedAt: Date.now(),
    };

    this.host.store.saveSnapshot(device.sku, device.deviceId, snapshot);
    this.host.log.info(`Local snapshot saved: "${name}" for ${device.name}`);
    // Targeted refresh — only this device's snapshot_local dropdown changed.
    this.host.refreshDeviceStates(device);
  }

  /**
   * Restore a local snapshot by index.
   *
   * @param device Target device
   * @param val Dropdown index value
   */
  async restore(device: GoveeDevice, val: ioBroker.StateValue): Promise<void> {
    const idx = parseInt(String(val), 10);
    if (idx < 1) {
      return;
    }
    const snaps = this.host.store.getSnapshots(device.sku, device.deviceId);
    const snap = snaps[idx - 1];
    if (!snap) {
      this.host.log.warn(`Local snapshot index ${idx} not found for ${device.name}`);
      return;
    }
    this.host.log.info(`Restoring local snapshot "${snap.name}" for ${device.name}`);

    // Send each state via LAN → Cloud routing
    await this.host.sendCommand(device, "power", snap.power);
    if (snap.power) {
      await this.host.sendCommand(device, "brightness", snap.brightness);
      if (snap.colorTemperature > 0) {
        await this.host.sendCommand(device, "colorTemperature", snap.colorTemperature);
      } else {
        await this.host.sendCommand(device, "colorRgb", snap.colorRgb);
      }
      // Restore per-segment states via ptReal
      if (snap.segments && snap.segments.length > 0) {
        for (let i = 0; i < snap.segments.length; i++) {
          const seg = snap.segments[i];
          await this.host.sendCommand(device, `segmentColor:${i}`, seg.color);
          await this.host.sendCommand(device, `segmentBrightness:${i}`, seg.brightness);
        }
      }
    }
  }

  /**
   * Delete a local snapshot by name.
   *
   * @param device Target device
   * @param name Snapshot name to delete
   */
  delete(device: GoveeDevice, name: string): void {
    if (this.host.store.deleteSnapshot(device.sku, device.deviceId, name)) {
      this.host.log.info(`Local snapshot deleted: "${name}" for ${device.name}`);
      // Targeted refresh — only this device's snapshot_local dropdown changed.
      this.host.refreshDeviceStates(device);
    } else {
      this.host.log.warn(`Local snapshot "${name}" not found for ${device.name}`);
    }
  }
}
