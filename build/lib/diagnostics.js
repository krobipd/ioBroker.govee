"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var diagnostics_exports = {};
__export(diagnostics_exports, {
  DiagnosticsCollector: () => DiagnosticsCollector
});
module.exports = __toCommonJS(diagnostics_exports);
var import_device_registry = require("./device-registry");
const MAX_LOGS = 20;
const MAX_PACKETS = 10;
const MAX_RESPONSE_ENDPOINTS = 12;
const MAX_RESPONSES_PER_ENDPOINT = 3;
const MAX_BODY_BYTES = 8192;
class DiagnosticsCollector {
  buffers = /* @__PURE__ */ new Map();
  /**
   * Lazily initialise the ring buffers for a device id.
   *
   * @param deviceId Govee device id (the buffer key)
   */
  get(deviceId) {
    let b = this.buffers.get(deviceId);
    if (!b) {
      b = { logs: [], packets: [], responses: /* @__PURE__ */ new Map() };
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
  addLog(deviceId, level, msg) {
    if (typeof deviceId !== "string" || !deviceId) {
      return;
    }
    if (typeof msg !== "string") {
      return;
    }
    const b = this.get(deviceId);
    b.logs.push({ ts: (/* @__PURE__ */ new Date()).toISOString(), level, msg });
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
  addMqttPacket(deviceId, topic, hex) {
    if (typeof deviceId !== "string" || !deviceId) {
      return;
    }
    if (typeof hex !== "string" || !hex) {
      return;
    }
    const b = this.get(deviceId);
    b.packets.push({ ts: (/* @__PURE__ */ new Date()).toISOString(), topic: String(topic), hex });
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
  recordApiSuccess(deviceId, endpoint, body, statusCode) {
    if (typeof deviceId !== "string" || !deviceId) {
      return;
    }
    if (typeof endpoint !== "string" || !endpoint) {
      return;
    }
    const stored = this.cloneAndCap(body);
    this.appendResponse(this.get(deviceId), {
      ts: (/* @__PURE__ */ new Date()).toISOString(),
      endpoint,
      ok: true,
      statusCode: statusCode != null ? statusCode : 200,
      body: stored
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
  recordApiFailure(deviceId, endpoint, error, statusCode) {
    if (typeof deviceId !== "string" || !deviceId) {
      return;
    }
    if (typeof endpoint !== "string" || !endpoint) {
      return;
    }
    const errMsg = error instanceof Error ? error.message : String(error);
    this.appendResponse(this.get(deviceId), {
      ts: (/* @__PURE__ */ new Date()).toISOString(),
      endpoint,
      ok: false,
      statusCode,
      body: { error: errMsg, status: statusCode }
    });
  }
  /**
   * @deprecated Use {@link recordApiSuccess} instead. Kept as a shim so
   *   in-flight callers don't break during the v2.1.0 → v2.1.1 refactor.
   * @param deviceId Govee device id
   * @param endpoint Endpoint identifier
   * @param body Response body
   */
  setApiResponse(deviceId, endpoint, body) {
    this.recordApiSuccess(deviceId, endpoint, body);
  }
  /** @param body Body to clone-via-JSON and cap at MAX_BODY_BYTES. */
  cloneAndCap(body) {
    try {
      const serialised = JSON.stringify(body);
      if (typeof serialised === "string" && serialised.length > MAX_BODY_BYTES) {
        return `<truncated ${serialised.length}b: ${serialised.slice(0, MAX_BODY_BYTES)}\u2026>`;
      }
      if (typeof serialised === "string") {
        return JSON.parse(serialised);
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
  appendResponse(b, entry) {
    var _a;
    const list = (_a = b.responses.get(entry.endpoint)) != null ? _a : [];
    list.push(entry);
    if (list.length > MAX_RESPONSES_PER_ENDPOINT) {
      list.splice(0, list.length - MAX_RESPONSES_PER_ENDPOINT);
    }
    b.responses.set(entry.endpoint, list);
    if (b.responses.size > MAX_RESPONSE_ENDPOINTS) {
      const first = b.responses.keys().next().value;
      if (first !== void 0) {
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
  forget(deviceId) {
    this.buffers.delete(deviceId);
  }
  /** Drop all buffers — useful in tests. */
  clear() {
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
  generate(device, adapterVersion) {
    var _a, _b, _c, _d;
    const quirks = (0, import_device_registry.getDeviceQuirks)(device.sku);
    const b = this.buffers.get(device.deviceId);
    return {
      adapter: "iobroker.govee-smart",
      version: adapterVersion,
      exportedAt: (/* @__PURE__ */ new Date()).toISOString(),
      device: {
        sku: device.sku,
        deviceId: device.deviceId,
        name: device.name,
        type: device.type,
        segmentCount: (_a = device.segmentCount) != null ? _a : null,
        channels: { ...device.channels },
        lanIp: (_b = device.lanIp) != null ? _b : null
      },
      capabilities: device.capabilities,
      scenes: {
        count: device.scenes.length,
        names: device.scenes.map((s) => s.name)
      },
      diyScenes: {
        count: device.diyScenes.length,
        names: device.diyScenes.map((s) => s.name)
      },
      snapshots: {
        count: device.snapshots.length,
        names: device.snapshots.map((s) => s.name)
      },
      sceneLibrary: {
        count: device.sceneLibrary.length,
        entries: device.sceneLibrary.map((s) => {
          var _a2, _b2;
          return {
            name: s.name,
            sceneCode: s.sceneCode,
            hasParam: !!s.scenceParam,
            speedSupported: (_b2 = (_a2 = s.speedInfo) == null ? void 0 : _a2.supSpeed) != null ? _b2 : false
          };
        })
      },
      musicLibrary: {
        count: device.musicLibrary.length,
        entries: device.musicLibrary.map((m) => {
          var _a2;
          return {
            name: m.name,
            musicCode: m.musicCode,
            mode: (_a2 = m.mode) != null ? _a2 : null
          };
        })
      },
      diyLibrary: {
        count: device.diyLibrary.length,
        entries: device.diyLibrary.map((d) => ({
          name: d.name,
          diyCode: d.diyCode
        }))
      },
      quirks: quirks != null ? quirks : null,
      skuFeatures: device.skuFeatures,
      state: { ...device.state },
      recentLogs: (_c = b == null ? void 0 : b.logs.slice()) != null ? _c : [],
      lastMqttPackets: (_d = b == null ? void 0 : b.packets.slice()) != null ? _d : [],
      // History per endpoint (most-recent at the end). Each entry has
      // {ts, ok, statusCode, body}. body holds either the success
      // response or `{error, status}` for failed calls.
      apiHistory: b ? Object.fromEntries(Array.from(b.responses.entries()).map(([k, v]) => [k, v.slice()])) : {}
    };
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  DiagnosticsCollector
});
//# sourceMappingURL=diagnostics.js.map
