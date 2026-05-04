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
var govee_cloud_client_exports = {};
__export(govee_cloud_client_exports, {
  GoveeCloudClient: () => GoveeCloudClient
});
module.exports = __toCommonJS(govee_cloud_client_exports);
var import_http_client = require("./http-client");
var import_types = require("./types");
const BASE_URL = "https://openapi.api.govee.com";
class GoveeCloudClient {
  apiKey;
  log;
  httpsRequestImpl;
  /**
   * Diagnostics hook — receives (deviceId, endpoint, body) for each
   * response. Optional; the adapter wires it to a DiagnosticsCollector
   * for `diag.export`.
   */
  onResponse = null;
  /**
   * Letzte Fehler-Kategorie für getFailureReason() — gesetzt bei jedem
   * HTTP-Fehler im request-Pfad.
   */
  lastErrorCategory = null;
  /**
   * @param apiKey Govee API key
   * @param log ioBroker logger
   * @param httpsRequestImpl optional DI für Tests — Default ist die echte httpsRequest
   */
  constructor(apiKey, log, httpsRequestImpl = import_http_client.httpsRequest) {
    this.apiKey = apiKey;
    this.log = log;
    this.httpsRequestImpl = httpsRequestImpl;
  }
  /**
   * Short user-facing reason for "Cloud not connected", or null wenn der
   * Client noch keinen Fehler gesehen hat. Analog zu mqtt-client —
   * `logDeviceSummary` nutzt das damit der Adapter klare Diagnose-Texte
   * statt „see earlier errors" loggen kann.
   */
  getFailureReason() {
    switch (this.lastErrorCategory) {
      case "AUTH":
        return "API key rejected \u2014 check Govee API key";
      case "RATE_LIMIT":
        return "rate-limited by Govee \u2014 will retry";
      case "NETWORK":
        return "cannot reach Govee servers \u2014 will retry";
      case "TIMEOUT":
        return "Cloud request timeout";
      case "UNKNOWN":
        return "Cloud request failed \u2014 see earlier log";
      case null:
      default:
        return null;
    }
  }
  /**
   * Register a hook called after every successful Cloud API response.
   * Used to populate the DiagnosticsCollector ring buffer.
   *
   * @param cb Callback receiving (deviceId, endpoint, body)
   */
  setResponseHook(cb) {
    this.onResponse = cb;
  }
  /** Fetch all devices with their capabilities */
  async getDevices() {
    const resp = await this.request("GET", "/router/api/v1/user/devices");
    return Array.isArray(resp == null ? void 0 : resp.data) ? resp.data : [];
  }
  /**
   * Fetch current state of a device
   *
   * @param sku Product model
   * @param device Device identifier
   */
  async getDeviceState(sku, device) {
    var _a, _b;
    const resp = await this.request("POST", "/router/api/v1/device/state", {
      requestId: `state_${Date.now()}`,
      payload: { sku, device }
    });
    (_a = this.onResponse) == null ? void 0 : _a.call(this, device, "/router/api/v1/device/state", resp);
    const caps = (_b = resp == null ? void 0 : resp.data) == null ? void 0 : _b.capabilities;
    return Array.isArray(caps) ? caps : [];
  }
  /**
   * Send a control command to a device
   *
   * @param sku Product model
   * @param device Device ID
   * @param capabilityType Full capability type string
   * @param instance Capability instance name
   * @param value Value to set
   */
  async controlDevice(sku, device, capabilityType, instance, value) {
    var _a;
    const reqBody = {
      requestId: `ctrl_${Date.now()}`,
      payload: {
        sku,
        device,
        capability: {
          type: capabilityType,
          instance,
          value
        }
      }
    };
    const resp = await this.request("POST", "/router/api/v1/device/control", reqBody);
    (_a = this.onResponse) == null ? void 0 : _a.call(this, device, "/router/api/v1/device/control", { request: reqBody.payload.capability, response: resp });
  }
  /**
   * Fetch dynamic scenes and snapshots for a device.
   * The scenes endpoint returns capabilities with options.
   *
   * @param sku Product model
   * @param device Device identifier
   */
  async getScenes(sku, device) {
    var _a, _b, _c;
    const resp = await this.request("POST", "/router/api/v1/device/scenes", {
      requestId: "scenes",
      payload: { sku, device }
    });
    (_a = this.onResponse) == null ? void 0 : _a.call(this, device, "/router/api/v1/device/scenes", resp);
    const lightScenes = [];
    const diyScenes = [];
    const snapshots = [];
    const caps = Array.isArray((_b = resp == null ? void 0 : resp.payload) == null ? void 0 : _b.capabilities) ? resp.payload.capabilities : [];
    for (const cap of caps) {
      if (!cap || typeof cap.instance !== "string") {
        continue;
      }
      const opts = Array.isArray((_c = cap.parameters) == null ? void 0 : _c.options) ? cap.parameters.options : [];
      this.log.debug(`Scenes endpoint: instance=${cap.instance}, options=${opts.length}`);
      const mapped = opts.filter(
        (o) => !!o && typeof o.name === "string" && typeof o.value === "object"
      ).map((o) => ({
        name: o.name,
        value: o.value
      }));
      if (cap.instance === "lightScene") {
        lightScenes.push(...mapped);
      } else if (cap.instance === "diyScene") {
        diyScenes.push(...mapped);
      } else if (cap.instance === "snapshot") {
        snapshots.push(...mapped);
      }
    }
    return { lightScenes, diyScenes, snapshots };
  }
  /**
   * Fetch DIY scenes for a device from the dedicated diy-scenes endpoint.
   *
   * @param sku Product model
   * @param device Device identifier
   */
  async getDiyScenes(sku, device) {
    var _a, _b, _c;
    const resp = await this.request("POST", "/router/api/v1/device/diy-scenes", {
      requestId: "diy-scenes",
      payload: { sku, device }
    });
    (_a = this.onResponse) == null ? void 0 : _a.call(this, device, "/router/api/v1/device/diy-scenes", resp);
    const scenes = [];
    const caps = Array.isArray((_b = resp == null ? void 0 : resp.payload) == null ? void 0 : _b.capabilities) ? resp.payload.capabilities : [];
    for (const cap of caps) {
      if (!cap || typeof cap.instance !== "string") {
        continue;
      }
      const opts = Array.isArray((_c = cap.parameters) == null ? void 0 : _c.options) ? cap.parameters.options : [];
      this.log.debug(`DIY-Scenes endpoint: instance=${cap.instance}, options=${opts.length}`);
      scenes.push(
        ...opts.filter(
          (o) => !!o && typeof o.name === "string" && typeof o.value === "object"
        ).map((o) => ({ name: o.name, value: o.value }))
      );
    }
    return scenes;
  }
  /**
   * Make an HTTPS request to the Govee Cloud API
   *
   * @param method HTTP method (GET, POST)
   * @param path API endpoint path
   * @param body Optional request body
   */
  async request(method, path, body) {
    var _a;
    this.log.debug(`Cloud API: ${method} ${path}`);
    try {
      const result = await this.httpsRequestImpl({
        method,
        url: new URL(path, BASE_URL).toString(),
        headers: { "Govee-API-Key": this.apiKey },
        body
      });
      this.lastErrorCategory = null;
      return result;
    } catch (err) {
      if (err instanceof import_http_client.HttpError && err.statusCode === 429) {
        this.lastErrorCategory = "RATE_LIMIT";
        const retryAfter = String((_a = err.headers["retry-after"]) != null ? _a : "unknown");
        throw new import_http_client.HttpError(`Rate limited \u2014 retry after ${retryAfter}s`, 429, err.headers);
      }
      this.lastErrorCategory = (0, import_types.classifyError)(err);
      throw err;
    }
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  GoveeCloudClient
});
//# sourceMappingURL=govee-cloud-client.js.map
