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
var govee_api_client_exports = {};
__export(govee_api_client_exports, {
  GoveeApiClient: () => GoveeApiClient,
  parseLastData: () => parseLastData,
  parseSettings: () => parseSettings
});
module.exports = __toCommonJS(govee_api_client_exports);
var import_http_client = require("./http-client.js");
var import_govee_constants = require("./govee-constants.js");
class GoveeApiClient {
  bearerToken = null;
  /**
   * Update the bearer token (obtained from MQTT login).
   *
   * @param token Bearer token string
   */
  setBearerToken(token) {
    this.bearerToken = token;
  }
  /** Check if bearer token is available (set after MQTT login) */
  hasBearerToken() {
    return !!this.bearerToken;
  }
  /** Auth headers for the bearer-token-protected sensor endpoints. */
  authHeaders() {
    var _a;
    return {
      Authorization: `Bearer ${(_a = this.bearerToken) != null ? _a : ""}`,
      appVersion: import_govee_constants.GOVEE_APP_VERSION,
      clientId: import_govee_constants.GOVEE_CLIENT_ID,
      clientType: import_govee_constants.GOVEE_CLIENT_TYPE,
      "User-Agent": import_govee_constants.GOVEE_USER_AGENT
    };
  }
  /**
   * Fetch the per-account device list from the undocumented sensor
   * endpoint. One call returns every device the Govee Home app sees for
   * this account, with `lastDeviceData` + `deviceSettings` embedded as
   * stringified JSON. Cheap and safe to poll on a conservative schedule.
   *
   * Endpoint: `POST /device/rest/devices/v1/list` (empty body).
   * Auth: bearer token only.
   *
   * Used primarily for SKUs where OpenAPI v2 `/device/state` returns
   * empty (H5179 et al.). Returns `[]` when no token is set.
   *
   * @returns Parsed entries; never throws on a single malformed entry.
   */
  async fetchDeviceList() {
    if (!this.bearerToken) {
      return [];
    }
    const resp = await (0, import_http_client.httpsRequest)({
      method: "POST",
      url: `${import_govee_constants.GOVEE_APP_BASE_URL}/device/rest/devices/v1/list`,
      headers: this.authHeaders(),
      body: {}
    });
    const out = [];
    const list = Array.isArray(resp == null ? void 0 : resp.devices) ? resp.devices : [];
    for (const d of list) {
      if (!d || typeof d.sku !== "string" || typeof d.device !== "string") {
        continue;
      }
      const entry = {
        sku: d.sku,
        device: d.device,
        deviceName: typeof d.deviceName === "string" ? d.deviceName : d.sku,
        deviceId: typeof d.deviceId === "number" ? d.deviceId : void 0,
        versionHard: typeof d.versionHard === "string" ? d.versionHard : void 0,
        versionSoft: typeof d.versionSoft === "string" ? d.versionSoft : void 0
      };
      const ext = d.deviceExt;
      if (ext && typeof ext === "object") {
        entry.lastData = parseLastData(ext.lastDeviceData);
        entry.settings = parseSettings(ext.deviceSettings);
      }
      out.push(entry);
    }
    return out;
  }
  /**
   * Fetch scene library for a specific SKU from undocumented API.
   * Public endpoint — no authentication required, only AppVersion header.
   *
   * @param sku Product model (e.g. "H61BE")
   */
  async fetchSceneLibrary(sku) {
    var _a, _b, _c, _d, _e, _f;
    const url = `https://app2.govee.com/appsku/v1/light-effect-libraries?sku=${encodeURIComponent(sku)}`;
    const resp = await (0, import_http_client.httpsRequest)({
      method: "GET",
      url,
      headers: {
        appVersion: import_govee_constants.GOVEE_APP_VERSION,
        "User-Agent": import_govee_constants.GOVEE_USER_AGENT
      }
    });
    const scenes = [];
    const categories = Array.isArray((_a = resp == null ? void 0 : resp.data) == null ? void 0 : _a.categories) ? resp.data.categories : [];
    for (const cat of categories) {
      const catScenes = Array.isArray(cat == null ? void 0 : cat.scenes) ? cat.scenes : [];
      for (const s of catScenes) {
        if (!s || typeof s.sceneName !== "string" || !s.sceneName) {
          continue;
        }
        const effects = Array.isArray(s.lightEffects) ? s.lightEffects : [];
        if (effects.length === 0) {
          const code = (_b = s.sceneCode) != null ? _b : 0;
          if (code > 0) {
            scenes.push({ name: s.sceneName, sceneCode: code });
          }
          continue;
        }
        const multiVariant = effects.length > 1;
        for (const effect of effects) {
          const code = (_d = (_c = effect.sceneCode) != null ? _c : s.sceneCode) != null ? _d : 0;
          if (code <= 0) {
            continue;
          }
          const name = multiVariant && effect.scenceName ? `${s.sceneName}-${effect.scenceName}` : s.sceneName;
          const si = effect.speedInfo;
          scenes.push({
            name,
            sceneCode: code,
            scenceParam: effect.scenceParam || void 0,
            speedInfo: (si == null ? void 0 : si.supSpeed) ? {
              supSpeed: true,
              speedIndex: (_e = si.speedIndex) != null ? _e : 0,
              config: (_f = si.config) != null ? _f : ""
            } : void 0
          });
        }
      }
    }
    return scenes;
  }
  /**
   * Fetch music effect library for a specific SKU (requires auth).
   * Returns music modes with BLE data for ptReal local control.
   *
   * @param sku Product model (e.g. "H61BE")
   */
  async fetchMusicLibrary(sku) {
    var _a, _b, _c;
    if (!this.bearerToken) {
      return [];
    }
    const url = `https://app2.govee.com/appsku/v1/music-effect-libraries?sku=${encodeURIComponent(sku)}`;
    const resp = await (0, import_http_client.httpsRequest)({ method: "GET", url, headers: this.authHeaders() });
    const modes = [];
    let modeIdx = 0;
    const musicCats = Array.isArray((_a = resp == null ? void 0 : resp.data) == null ? void 0 : _a.categories) ? resp.data.categories : [];
    for (const cat of musicCats) {
      const catScenes = Array.isArray(cat == null ? void 0 : cat.scenes) ? cat.scenes : [];
      for (const s of catScenes) {
        if (!s || typeof s.sceneName !== "string" || !s.sceneName) {
          continue;
        }
        const effects = Array.isArray(s.lightEffects) ? s.lightEffects : [];
        const effect = effects[0];
        const code = (_c = (_b = effect == null ? void 0 : effect.sceneCode) != null ? _b : s.sceneCode) != null ? _c : 0;
        if (code > 0) {
          modes.push({
            name: s.sceneName,
            musicCode: code,
            scenceParam: (effect == null ? void 0 : effect.scenceParam) || void 0,
            mode: modeIdx
          });
        }
        modeIdx++;
      }
    }
    return modes;
  }
  /**
   * Fetch DIY light effect library for a specific SKU (requires auth).
   * Returns DIY scene definitions with BLE data for ptReal local control.
   *
   * @param sku Product model (e.g. "H61BE")
   */
  async fetchDiyLibrary(sku) {
    var _a, _b, _c;
    if (!this.bearerToken) {
      return [];
    }
    const url = `https://app2.govee.com/appsku/v1/diy-light-effect-libraries?sku=${encodeURIComponent(sku)}`;
    const resp = await (0, import_http_client.httpsRequest)({ method: "GET", url, headers: this.authHeaders() });
    const diys = [];
    const diyCats = Array.isArray((_a = resp == null ? void 0 : resp.data) == null ? void 0 : _a.categories) ? resp.data.categories : [];
    for (const cat of diyCats) {
      const catScenes = Array.isArray(cat == null ? void 0 : cat.scenes) ? cat.scenes : [];
      for (const s of catScenes) {
        if (!s || typeof s.sceneName !== "string" || !s.sceneName) {
          continue;
        }
        const effects = Array.isArray(s.lightEffects) ? s.lightEffects : [];
        const effect = effects[0];
        const code = (_c = (_b = effect == null ? void 0 : effect.sceneCode) != null ? _b : s.sceneCode) != null ? _c : 0;
        if (code > 0) {
          diys.push({
            name: s.sceneName,
            diyCode: code,
            scenceParam: (effect == null ? void 0 : effect.scenceParam) || void 0
          });
        }
      }
    }
    return diys;
  }
  /**
   * Fetch supported features for a specific SKU (requires auth).
   * Returns feature flags indicating what the device supports.
   *
   * @param sku Product model (e.g. "H61BE")
   */
  async fetchSkuFeatures(sku) {
    var _a;
    if (!this.bearerToken) {
      return null;
    }
    const url = `https://app2.govee.com/appsku/v1/sku-supported-feature?sku=${encodeURIComponent(sku)}`;
    const resp = await (0, import_http_client.httpsRequest)({ method: "GET", url, headers: this.authHeaders() });
    return (_a = resp.data) != null ? _a : null;
  }
  /**
   * Fetch snapshot BLE commands for local activation via ptReal.
   * Each snapshot contains one or more cmds with Base64 BLE packets.
   *
   * @param sku Product model
   * @param deviceId Device identifier (colon-separated)
   */
  async fetchSnapshots(sku, deviceId) {
    var _a;
    if (!this.bearerToken) {
      return [];
    }
    const url = `https://app2.govee.com/bff-app/v1/devices/snapshots?sku=${encodeURIComponent(sku)}&device=${encodeURIComponent(deviceId)}&snapshotId=-1`;
    const resp = await (0, import_http_client.httpsRequest)({ method: "GET", url, headers: this.authHeaders() });
    const results = [];
    const snaps = Array.isArray((_a = resp == null ? void 0 : resp.data) == null ? void 0 : _a.snapshots) ? resp.data.snapshots : [];
    for (const snap of snaps) {
      if (!snap || typeof snap.name !== "string" || !snap.name) {
        continue;
      }
      const allCmdPackets = [];
      const cmds = Array.isArray(snap.cmds) ? snap.cmds : [];
      for (const cmd of cmds) {
        if (!cmd || typeof cmd.bleCmds !== "string" || !cmd.bleCmds) {
          continue;
        }
        try {
          const parsed = JSON.parse(cmd.bleCmds);
          if (typeof (parsed == null ? void 0 : parsed.bleCmd) === "string" && parsed.bleCmd.length > 0) {
            allCmdPackets.push(parsed.bleCmd.split(","));
          }
        } catch {
        }
      }
      if (allCmdPackets.length > 0) {
        results.push({ name: snap.name, bleCmds: allCmdPackets });
      }
    }
    return results;
  }
  /**
   * Fetch group membership from undocumented exec-plat/home endpoint.
   * Returns groups with their member device references.
   */
  async fetchGroupMembers() {
    var _a;
    if (!this.bearerToken) {
      return [];
    }
    const url = "https://app2.govee.com/bff-app/v1/exec-plat/home";
    const resp = await (0, import_http_client.httpsRequest)({ method: "GET", url, headers: this.authHeaders() });
    const groups = [];
    const components = Array.isArray((_a = resp == null ? void 0 : resp.data) == null ? void 0 : _a.components) ? resp.data.components : [];
    for (const comp of components) {
      const compGroups = Array.isArray(comp == null ? void 0 : comp.groups) ? comp.groups : [];
      for (const g of compGroups) {
        if (!g || typeof g.gId !== "number") {
          continue;
        }
        const devices = [];
        const gDevices = Array.isArray(g.devices) ? g.devices : [];
        for (const d of gDevices) {
          if (d && typeof d.sku === "string" && typeof d.device === "string" && d.sku && d.device) {
            devices.push({ sku: d.sku, deviceId: d.device });
          }
        }
        if (devices.length > 0) {
          groups.push({
            groupId: g.gId,
            name: typeof g.name === "string" ? g.name : "",
            devices
          });
        }
      }
    }
    return groups;
  }
}
function parseLastData(raw) {
  if (typeof raw !== "string" || !raw) {
    return void 0;
  }
  try {
    const obj = JSON.parse(raw);
    const out = {};
    if (typeof obj.online === "boolean") {
      out.online = obj.online;
    } else if (obj.online === 1 || obj.online === 0) {
      out.online = obj.online === 1;
    }
    if (typeof obj.tem === "number" && Number.isFinite(obj.tem)) {
      out.tem = obj.tem;
    }
    if (typeof obj.hum === "number" && Number.isFinite(obj.hum)) {
      out.hum = obj.hum;
    }
    if (typeof obj.battery === "number" && Number.isFinite(obj.battery)) {
      out.battery = obj.battery;
    }
    if (typeof obj.lastTime === "number" && Number.isFinite(obj.lastTime)) {
      out.lastTime = obj.lastTime;
    }
    return out;
  } catch {
    return void 0;
  }
}
function parseSettings(raw) {
  if (typeof raw !== "string" || !raw) {
    return void 0;
  }
  try {
    const obj = JSON.parse(raw);
    return obj && typeof obj === "object" ? obj : void 0;
  } catch {
    return void 0;
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  GoveeApiClient,
  parseLastData,
  parseSettings
});
//# sourceMappingURL=govee-api-client.js.map
