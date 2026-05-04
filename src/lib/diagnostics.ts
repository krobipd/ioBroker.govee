import { getDeviceQuirks } from "./device-registry";
import type { GoveeDevice } from "./types";

/** Single log line captured for a device. */
export interface LogEntry {
  /** ISO timestamp */
  ts: string;
  /** ioBroker log level */
  level: "debug" | "info" | "warn" | "error";
  /** Free-form log message */
  msg: string;
}

/** A captured MQTT packet (op.command-array hex-joined). */
export interface MqttPacketEntry {
  /** ISO timestamp */
  ts: string;
  /** AWS-IoT topic the packet arrived on */
  topic: string;
  /** Hex-encoded packet bytes (lowercase, space-separated) */
  hex: string;
}

/** One captured API call (success or failure) for a Cloud / App-API endpoint. */
export interface ApiResponseEntry {
  /** ISO timestamp */
  ts: string;
  /** Endpoint identifier (e.g. "/router/api/v1/device/state") */
  endpoint: string;
  /** True = body holds the parsed response. False = body holds `{ error, status }`. */
  ok: boolean;
  /** HTTP status code if known. Useful for failed calls (e.g. 403 from /light-effect-libraries). */
  statusCode?: number;
  /** Response body on success. On failure: `{ error: string, status?: number }`. */
  body: unknown;
}

/** Per-device ring buffers. */
interface DeviceBuffers {
  logs: LogEntry[];
  packets: MqttPacketEntry[];
  /**
   * Per-endpoint history (most-recent at the end). Keeping multiple slots
   * is essential for diagnosing "the first call returned X, the refresh
   * call returned Y" cases — the single-slot design lost that timeline.
   */
  responses: Map<string, ApiResponseEntry[]>;
}

const MAX_LOGS = 20;
const MAX_PACKETS = 10;
const MAX_RESPONSE_ENDPOINTS = 12;
const MAX_RESPONSES_PER_ENDPOINT = 3;
const MAX_BODY_BYTES = 8192;

/**
 * Collects diagnostic context per device and produces the
 * `diag.result` JSON. Replaces the inline
 * `device-manager.generateDiagnostics()` so log/MQTT/API hooks can write
 * data without coupling to DeviceManager.
 *
 * Buffers are bounded — the collector survives long-running adapters
 * without unbounded memory growth.
 */
export class DiagnosticsCollector {
  private readonly buffers = new Map<string, DeviceBuffers>();

  /**
   * Lazily initialise the ring buffers for a device id.
   *
   * @param deviceId Govee device id (the buffer key)
   */
  private get(deviceId: string): DeviceBuffers {
    let b = this.buffers.get(deviceId);
    if (!b) {
      b = { logs: [], packets: [], responses: new Map() };
      this.buffers.set(deviceId, b);
    }
    return b;
  }

  /**
   * Append a log line for a device. Drops the oldest entry once the
   * buffer reaches MAX_LOGS.
   *
   * @param deviceId Govee device id
   * @param level ioBroker log level
   * @param msg Log message
   */
  addLog(deviceId: string, level: LogEntry["level"], msg: string): void {
    if (typeof deviceId !== "string" || !deviceId) {
      return;
    }
    if (typeof msg !== "string") {
      return;
    }
    const b = this.get(deviceId);
    b.logs.push({ ts: new Date().toISOString(), level, msg });
    if (b.logs.length > MAX_LOGS) {
      b.logs.splice(0, b.logs.length - MAX_LOGS);
    }
  }

  /**
   * Append an MQTT packet for a device. Bounded to MAX_PACKETS most-recent.
   *
   * @param deviceId Govee device id
   * @param topic Source topic (account or device)
   * @param hex Hex-encoded packet bytes
   */
  addMqttPacket(deviceId: string, topic: string, hex: string): void {
    if (typeof deviceId !== "string" || !deviceId) {
      return;
    }
    if (typeof hex !== "string" || !hex) {
      return;
    }
    const b = this.get(deviceId);
    b.packets.push({ ts: new Date().toISOString(), topic: String(topic), hex });
    if (b.packets.length > MAX_PACKETS) {
      b.packets.splice(0, b.packets.length - MAX_PACKETS);
    }
  }

  /**
   * Record a successful API call for a Cloud/App-API endpoint. Appends
   * to the per-endpoint history (most-recent at the end), keeping at
   * most MAX_RESPONSES_PER_ENDPOINT entries per endpoint and at most
   * MAX_RESPONSE_ENDPOINTS distinct endpoints overall.
   *
   * Body is shallow-copied + serialised so later mutations of the
   * caller's object do not change what we report. Large bodies get
   * truncated to MAX_BODY_BYTES with a marker so users see the prefix.
   *
   * @param deviceId Govee device id
   * @param endpoint Endpoint identifier
   * @param body Response body
   * @param statusCode Optional HTTP status (200 by default if omitted)
   */
  recordApiSuccess(deviceId: string, endpoint: string, body: unknown, statusCode?: number): void {
    if (typeof deviceId !== "string" || !deviceId) {
      return;
    }
    if (typeof endpoint !== "string" || !endpoint) {
      return;
    }
    const stored = this.cloneAndCap(body);
    this.appendResponse(this.get(deviceId), {
      ts: new Date().toISOString(),
      endpoint,
      ok: true,
      statusCode: statusCode ?? 200,
      body: stored,
    });
  }

  /**
   * Record a FAILED API call. Captures the error message + HTTP status
   * (if extractable) so the diag JSON shows "endpoint attempted, returned
   * 403 Forbidden" instead of silent gaps. Without this, the user can't
   * tell "endpoint never called" from "endpoint returned []" from
   * "endpoint rejected with 403".
   *
   * @param deviceId Govee device id
   * @param endpoint Endpoint identifier
   * @param error The thrown Error or any value
   * @param statusCode Optional HTTP status if extractable from the error
   */
  recordApiFailure(deviceId: string, endpoint: string, error: unknown, statusCode?: number): void {
    if (typeof deviceId !== "string" || !deviceId) {
      return;
    }
    if (typeof endpoint !== "string" || !endpoint) {
      return;
    }
    const errMsg = error instanceof Error ? error.message : String(error);
    this.appendResponse(this.get(deviceId), {
      ts: new Date().toISOString(),
      endpoint,
      ok: false,
      statusCode,
      body: { error: errMsg, status: statusCode },
    });
  }

  /**
   * @deprecated Use {@link recordApiSuccess} instead. Kept as a shim so
   *   in-flight callers don't break during the v2.1.0 → v2.1.1 refactor.
   * @param deviceId Govee device id
   * @param endpoint Endpoint identifier
   * @param body Response body
   */
  setApiResponse(deviceId: string, endpoint: string, body: unknown): void {
    this.recordApiSuccess(deviceId, endpoint, body);
  }

  /** @param body Body to clone-via-JSON and cap at MAX_BODY_BYTES. */
  private cloneAndCap(body: unknown): unknown {
    try {
      const serialised = JSON.stringify(body);
      if (typeof serialised === "string" && serialised.length > MAX_BODY_BYTES) {
        return `<truncated ${serialised.length}b: ${serialised.slice(0, MAX_BODY_BYTES)}…>`;
      }
      if (typeof serialised === "string") {
        return JSON.parse(serialised) as unknown;
      }
      return body;
    } catch {
      return String(body);
    }
  }

  /**
   * @param b Device buffers
   * @param entry New API response entry (success or failure) to append
   */
  private appendResponse(b: DeviceBuffers, entry: ApiResponseEntry): void {
    const list = b.responses.get(entry.endpoint) ?? [];
    list.push(entry);
    if (list.length > MAX_RESPONSES_PER_ENDPOINT) {
      list.splice(0, list.length - MAX_RESPONSES_PER_ENDPOINT);
    }
    b.responses.set(entry.endpoint, list);
    if (b.responses.size > MAX_RESPONSE_ENDPOINTS) {
      const first = b.responses.keys().next().value;
      if (first !== undefined) {
        b.responses.delete(first);
      }
    }
  }

  /**
   * Drop all buffers for a device — called when the adapter forgets a
   * device (cleanupDevices in device-manager). Keeps memory bounded.
   *
   * @param deviceId Govee device id
   */
  forget(deviceId: string): void {
    this.buffers.delete(deviceId);
  }

  /**
   * Drop buffers für alle Devices die NICHT in der live-Liste sind.
   *
   * Aufgerufen aus dem Adapter-cleanup-Pfad (reapStaleDevices) damit
   * Logs/Packets/Responses für längst entfernte Govee-App-Devices
   * nicht endlos im Speicher bleiben.
   *
   * @param liveDeviceIds Set der aktuell aktiven device-Ids
   */
  pruneOrphans(liveDeviceIds: Set<string>): void {
    for (const id of this.buffers.keys()) {
      if (!liveDeviceIds.has(id)) {
        this.buffers.delete(id);
      }
    }
  }

  /** Drop all buffers — useful in tests. */
  clear(): void {
    this.buffers.clear();
  }

  /**
   * Build the diagnostics-export JSON for a device. Combines static
   * device data + capabilities + scenes/libraries with the captured
   * ring-buffer context (logs, MQTT packets, API responses).
   *
   * Shape stays backwards-compatible with the v1.x format — the new
   * fields are added top-level so existing tooling that consumed the
   * old shape keeps working.
   *
   * @param device Target device
   * @param adapterVersion Adapter version string (e.g. "2.0.0")
   */
  generate(device: GoveeDevice, adapterVersion: string): Record<string, unknown> {
    const quirks = getDeviceQuirks(device.sku);
    const b = this.buffers.get(device.deviceId);
    return {
      adapter: "iobroker.govee-smart",
      version: adapterVersion,
      exportedAt: new Date().toISOString(),
      device: {
        sku: device.sku,
        deviceId: device.deviceId,
        name: device.name,
        type: device.type,
        segmentCount: device.segmentCount ?? null,
        channels: { ...device.channels },
        lanIp: device.lanIp ?? null,
      },
      capabilities: device.capabilities,
      scenes: {
        count: device.scenes.length,
        names: device.scenes.map(s => s.name),
      },
      diyScenes: {
        count: device.diyScenes.length,
        names: device.diyScenes.map(s => s.name),
      },
      snapshots: {
        count: device.snapshots.length,
        names: device.snapshots.map(s => s.name),
      },
      sceneLibrary: {
        count: device.sceneLibrary.length,
        entries: device.sceneLibrary.map(s => ({
          name: s.name,
          sceneCode: s.sceneCode,
          hasParam: !!s.scenceParam,
          speedSupported: s.speedInfo?.supSpeed ?? false,
        })),
      },
      musicLibrary: {
        count: device.musicLibrary.length,
        entries: device.musicLibrary.map(m => ({
          name: m.name,
          musicCode: m.musicCode,
          mode: m.mode ?? null,
        })),
      },
      diyLibrary: {
        count: device.diyLibrary.length,
        entries: device.diyLibrary.map(d => ({
          name: d.name,
          diyCode: d.diyCode,
        })),
      },
      quirks: quirks ?? null,
      skuFeatures: device.skuFeatures,
      state: { ...device.state },
      recentLogs: b?.logs.slice() ?? [],
      lastMqttPackets: b?.packets.slice() ?? [],
      // History per endpoint (most-recent at the end). Each entry has
      // {ts, ok, statusCode, body}. body holds either the success
      // response or `{error, status}` for failed calls.
      apiHistory: b ? Object.fromEntries(Array.from(b.responses.entries()).map(([k, v]) => [k, v.slice()])) : {},
    };
  }
}
