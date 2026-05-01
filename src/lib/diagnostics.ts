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

/** Last response captured for a Cloud / App-API endpoint. */
export interface ApiResponseEntry {
  /** ISO timestamp */
  ts: string;
  /** Endpoint identifier (e.g. "/router/api/v1/device/state") */
  endpoint: string;
  /** Response body (JSON-serializable; truncated by collector if large) */
  body: unknown;
}

/** Per-device ring buffers. */
interface DeviceBuffers {
  logs: LogEntry[];
  packets: MqttPacketEntry[];
  /** Keyed by endpoint — keeps only the last response per distinct endpoint. */
  responses: Map<string, ApiResponseEntry>;
}

const MAX_LOGS = 20;
const MAX_PACKETS = 10;
const MAX_RESPONSE_ENDPOINTS = 5;
const MAX_BODY_BYTES = 8192;

/**
 * Collects diagnostic context per device and produces the
 * `info.diagnostics_result` JSON. Replaces the inline
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
   * Record the last response body for a Cloud/App-API endpoint. Older
   * responses for the same endpoint are overwritten (one slot per
   * endpoint, capped at MAX_RESPONSE_ENDPOINTS distinct endpoints).
   *
   * Body is shallow-copied + serialised so later mutations of the
   * caller's object do not change what we report. Large bodies get
   * truncated to MAX_BODY_BYTES with a marker so users see the prefix.
   *
   * @param deviceId Govee device id
   * @param endpoint Endpoint identifier
   * @param body Response body
   */
  setApiResponse(deviceId: string, endpoint: string, body: unknown): void {
    if (typeof deviceId !== "string" || !deviceId) {
      return;
    }
    if (typeof endpoint !== "string" || !endpoint) {
      return;
    }
    const b = this.get(deviceId);
    let stored: unknown = body;
    try {
      const serialised = JSON.stringify(body);
      if (typeof serialised === "string" && serialised.length > MAX_BODY_BYTES) {
        stored = `<truncated ${serialised.length}b: ${serialised.slice(0, MAX_BODY_BYTES)}…>`;
      } else if (typeof serialised === "string") {
        stored = JSON.parse(serialised) as unknown;
      }
    } catch {
      stored = String(body);
    }
    b.responses.set(endpoint, {
      ts: new Date().toISOString(),
      endpoint,
      body: stored,
    });
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
      lastApiResponse: b ? Object.fromEntries(b.responses) : {},
    };
  }
}
