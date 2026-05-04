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
var device_manager_exports = {};
__export(device_manager_exports, {
  DeviceManager: () => DeviceManager,
  SEGMENT_HARD_MAX: () => SEGMENT_HARD_MAX,
  buildCapabilitiesFromAppEntry: () => buildCapabilitiesFromAppEntry,
  getEffectiveSegmentIndices: () => getEffectiveSegmentIndices,
  parseMqttSegmentData: () => parseMqttSegmentData,
  resolveSegmentCount: () => resolveSegmentCount
});
module.exports = __toCommonJS(device_manager_exports);
var import_capability_mapper = require("./capability-mapper");
var import_command_router = require("./command-router");
var import_device_registry = require("./device-registry");
var import_diagnostics = require("./diagnostics");
var import_types = require("./types");
var import_http_client = require("./http-client");
function parseMqttSegmentData(commands) {
  if (!Array.isArray(commands)) {
    return [];
  }
  const segments = [];
  let highestPacket = 0;
  for (const cmd of commands) {
    if (typeof cmd !== "string") {
      continue;
    }
    const bytes = Buffer.from(cmd, "base64");
    if (bytes.length < 20 || bytes[0] !== 170 || bytes[1] !== 165) {
      continue;
    }
    const packetNum = bytes[2];
    if (packetNum < 1 || packetNum > 5) {
      continue;
    }
    if (packetNum > highestPacket) {
      highestPacket = packetNum;
    }
    const baseIndex = (packetNum - 1) * 4;
    for (let slot = 0; slot < 4; slot++) {
      const segIdx = baseIndex + slot;
      const offset = 3 + slot * 4;
      segments.push({
        index: segIdx,
        brightness: bytes[offset],
        r: bytes[offset + 1],
        g: bytes[offset + 2],
        b: bytes[offset + 3]
      });
    }
  }
  while (segments.length > 0) {
    const tail = segments[segments.length - 1];
    if (tail.brightness === 0 && tail.r === 0 && tail.g === 0 && tail.b === 0) {
      segments.pop();
    } else {
      break;
    }
  }
  return segments;
}
function getEffectiveSegmentIndices(device) {
  var _a;
  if (device.manualMode && Array.isArray(device.manualSegments) && device.manualSegments.length > 0) {
    return device.manualSegments.slice();
  }
  const count = (_a = device.segmentCount) != null ? _a : 0;
  if (count <= 0) {
    return [];
  }
  return Array.from({ length: count }, (_, i) => i);
}
function resolveSegmentCount(device) {
  if (typeof device.segmentCount === "number" && device.segmentCount > 0) {
    return device.segmentCount;
  }
  const caps = Array.isArray(device.capabilities) ? device.capabilities : [];
  let min = Number.POSITIVE_INFINITY;
  for (const c of caps) {
    if (!c || typeof c.type !== "string" || !c.type.includes("segment_color_setting")) {
      continue;
    }
    const params = c.parameters;
    const fields = Array.isArray(params == null ? void 0 : params.fields) ? params.fields : [];
    for (const f of fields) {
      if (!f || typeof f !== "object") {
        continue;
      }
      const fn = f.fieldName;
      const er = f.elementRange;
      const rawMax = er && typeof er.max === "number" ? er.max : -1;
      if (fn === "segment" && rawMax >= 0) {
        const n = rawMax + 1;
        if (n > 0 && n < min) {
          min = n;
        }
      }
    }
  }
  return Number.isFinite(min) ? min : 0;
}
const SEGMENT_HARD_MAX = 55;
class DeviceManager {
  log;
  devices = /* @__PURE__ */ new Map();
  commandRouter;
  diagnostics;
  /** SKUs we already nudged about — log only once per adapter lifetime, per SKU. */
  nudgedSeedSkus = /* @__PURE__ */ new Set();
  cloudClient = null;
  apiClient = null;
  skuCache = null;
  onDeviceUpdate = null;
  onDeviceListChanged = null;
  onCloudCapabilities = null;
  /** Per-source dedup so a Cloud NETWORK error doesn't shadow an App-API one. */
  lastErrorCategory = null;
  lastAppApiErrorCategory = null;
  /**
   * @param log    ioBroker logger
   * @param timers Adapter timer wrapper (forwarded to CommandRouter for
   *   onUnload-safe delays).
   */
  constructor(log, timers) {
    this.log = log;
    this.commandRouter = new import_command_router.CommandRouter(log, timers);
    this.diagnostics = new import_diagnostics.DiagnosticsCollector();
  }
  /**
   * Expose the diagnostics collector so adapter-side hooks (MQTT,
   * Cloud, log wrapper) can write into the per-device ring buffers.
   */
  getDiagnostics() {
    return this.diagnostics;
  }
  /**
   * Pull the HTTP status code out of any error shape we know about
   * (HttpError, Govee API responses with `.statusCode` / `.status`).
   * Returns undefined for network errors / generic failures so the
   * diagnostics entry shows "no status — likely network/timeout".
   *
   * @param e Caught error value
   */
  extractStatus(e) {
    if (e instanceof import_http_client.HttpError) {
      return e.statusCode;
    }
    if (typeof e === "object" && e !== null) {
      const x = e;
      if (typeof x.statusCode === "number") {
        return x.statusCode;
      }
      if (typeof x.status === "number") {
        return x.status;
      }
    }
    return void 0;
  }
  /**
   * Register the LAN client
   *
   * @param client LAN UDP client instance
   */
  setLanClient(client) {
    this.commandRouter.setLanClient(client);
  }
  /**
   * Register the undocumented API client for scene/music/DIY libraries
   *
   * @param client API client instance
   */
  setApiClient(client) {
    this.apiClient = client;
  }
  /**
   * Register the Cloud client
   *
   * @param client Cloud API client instance
   */
  setCloudClient(client) {
    this.cloudClient = client;
    this.commandRouter.setCloudClient(client);
  }
  /**
   * Register the rate limiter for cloud calls
   *
   * @param limiter Rate limiter instance
   */
  setRateLimiter(limiter) {
    this.commandRouter.setRateLimiter(limiter);
  }
  /**
   * Register the SKU cache for persistent device data
   *
   * @param cache SKU cache instance
   */
  setSkuCache(cache) {
    this.skuCache = cache;
  }
  /**
   * Set callbacks for device state changes and list changes.
   *
   * @param onUpdate Called when a device state changes (from any channel)
   * @param onListChanged Called when the device list changes (new/removed devices)
   */
  setCallbacks(onUpdate, onListChanged) {
    this.onDeviceUpdate = onUpdate;
    this.onDeviceListChanged = onListChanged;
  }
  /** Get all known devices */
  getDevices() {
    return Array.from(this.devices.values());
  }
  /**
   * Load devices from local SKU cache.
   * Returns true if any devices were loaded (= Cloud not needed).
   */
  loadFromCache() {
    var _a;
    if (!this.skuCache) {
      return false;
    }
    const cached = this.skuCache.loadAll();
    if (cached.length === 0) {
      return false;
    }
    let changed = false;
    for (const entry of cached) {
      const key = this.deviceKey(entry.sku, entry.deviceId);
      const existing = this.devices.get(key);
      if (existing) {
        existing.name = entry.name || existing.name;
        existing.type = entry.type || existing.type;
        existing.capabilities = entry.capabilities;
        existing.scenes = entry.scenes;
        existing.diyScenes = entry.diyScenes;
        existing.snapshots = entry.snapshots;
        existing.sceneLibrary = entry.sceneLibrary;
        existing.musicLibrary = entry.musicLibrary;
        existing.diyLibrary = entry.diyLibrary;
        existing.skuFeatures = entry.skuFeatures;
        existing.snapshotBleCmds = entry.snapshotBleCmds;
        existing.scenesChecked = entry.scenesChecked;
        existing.lastSeenOnNetwork = entry.lastSeenOnNetwork;
        existing.segmentCount = entry.segmentCount;
        existing.manualMode = entry.manualMode;
        existing.manualSegments = entry.manualSegments;
        existing.channels.cloud = entry.capabilities.length > 0;
        changed = true;
      } else {
        this.devices.set(key, this.cachedToGoveeDevice(entry));
        changed = true;
      }
    }
    if (changed) {
      this.log.info(`Loaded ${cached.length} device(s) from cache`);
    }
    const hasLight = Array.from(this.devices.values()).some((d) => d.type === "devices.types.light");
    if (hasLight) {
      this.log.debug("Cache loaded \u2014 will refresh scenes/snapshots via Cloud");
      return false;
    }
    for (const device of this.devices.values()) {
      this.populateScenesFromLibrary(device);
    }
    if (changed) {
      (_a = this.onDeviceListChanged) == null ? void 0 : _a.call(this, this.getDevices());
    }
    return cached.length > 0;
  }
  /**
   * Load devices from Cloud API and save to cache.
   * Only called when cache is empty (first start) or manual refresh.
   */
  async loadFromCloud() {
    var _a;
    if (!this.cloudClient) {
      return { ok: false, reason: "transient" };
    }
    try {
      const rawCloudDevices = await this.cloudClient.getDevices();
      const cloudDevices = Array.isArray(rawCloudDevices) ? rawCloudDevices.filter(
        (cd) => cd && typeof cd.sku === "string" && typeof cd.device === "string" && Array.isArray(cd.capabilities) && cd.capabilities.length > 0
      ) : [];
      if (Array.isArray(rawCloudDevices) && rawCloudDevices.length !== cloudDevices.length) {
        this.log.info(
          `Cloud: received ${rawCloudDevices.length} devices raw, ${cloudDevices.length} after filter (skipped stale entries without capabilities)`
        );
      }
      let changed = this.mergeCloudDevices(cloudDevices);
      for (const cd of cloudDevices) {
        const caps = Array.isArray(cd.capabilities) ? cd.capabilities : [];
        const hasSceneCap = (0, import_capability_mapper.hasDynamicSceneCapability)(caps, "lightScene") || (0, import_capability_mapper.hasDynamicSceneCapability)(caps, "diyScene") || (0, import_capability_mapper.hasDynamicSceneCapability)(caps, "snapshot");
        const isLight = cd.type === "devices.types.light" || hasSceneCap;
        if (isLight) {
          const device = this.devices.get(this.deviceKey(cd.sku, cd.device));
          if (device) {
            if (await this.loadDeviceScenes(device, cd)) {
              changed = true;
            }
            if (await this.loadDeviceLibraries(device, cd.sku)) {
              changed = true;
            }
            device.scenesChecked = true;
          }
        }
      }
      if (this.skuCache && cloudDevices.length > 0) {
        this.skuCache.pruneStale(14);
      }
      this.saveDevicesToCache();
      for (const device of this.devices.values()) {
        this.populateScenesFromLibrary(device);
      }
      if (changed) {
        (_a = this.onDeviceListChanged) == null ? void 0 : _a.call(this, this.getDevices());
      }
      this.lastErrorCategory = null;
      return { ok: true };
    } catch (err) {
      this.logDedup("Cloud device list failed", err);
      if (err instanceof import_http_client.HttpError && err.statusCode === 429) {
        const retryAfterRaw = err.headers["retry-after"];
        const retryAfterSec = typeof retryAfterRaw === "string" && /^\d+$/.test(retryAfterRaw) ? parseInt(retryAfterRaw, 10) : 60;
        return {
          ok: false,
          reason: "rate-limited",
          retryAfterMs: retryAfterSec * 1e3
        };
      }
      const category = (0, import_types.classifyError)(err);
      if (category === "AUTH") {
        return {
          ok: false,
          reason: "auth-failed",
          message: err instanceof Error ? err.message : String(err)
        };
      }
      return { ok: false, reason: "transient" };
    }
  }
  /**
   * Re-fetch scenes, snapshots AND libraries for all known light devices
   * without re-running the full Cloud bootstrap. Used by the
   * `info.refresh_cloud_data` button: "new snapshot/scene was saved in
   * the Govee Home app, show it here".
   *
   * v1.10.1 had skipped libraries to keep the per-click call count low —
   * but for users on accounts where a library actually grew (new
   * scene-set rolled out by Govee, new sceneCode minted) the only way
   * back to fresh data was a full adapter restart. v2.1.0 reinstates the
   * library refresh on the same button and forces past the
   * `length === 0` guards inside `loadDeviceLibraries`.
   *
   * @returns true when any device's scene/snapshot/library data changed
   */
  async refreshSceneData() {
    var _a;
    if (!this.cloudClient) {
      return false;
    }
    let anyChanged = false;
    const lights = Array.from(this.devices.values()).filter((d) => d.type === "devices.types.light");
    for (const dev of lights) {
      this.diagnostics.addLog(dev.deviceId, "info", `User-triggered refresh-cloud-data for ${dev.sku}`);
    }
    for (const device of lights) {
      const cd = {
        sku: device.sku,
        device: device.deviceId,
        deviceName: device.name,
        type: device.type,
        capabilities: Array.isArray(device.capabilities) ? device.capabilities : []
      };
      if (await this.loadDeviceScenes(device, cd)) {
        anyChanged = true;
      }
      if (await this.loadDeviceLibraries(
        device,
        cd.sku,
        /* force */
        true
      )) {
        anyChanged = true;
      }
    }
    if (anyChanged) {
      this.saveDevicesToCache();
      for (const device of this.devices.values()) {
        this.populateScenesFromLibrary(device);
      }
      (_a = this.onDeviceListChanged) == null ? void 0 : _a.call(this, this.getDevices());
    }
    return anyChanged;
  }
  /**
   * Merge Cloud device list into local device map.
   * Updates existing devices, adds new ones.
   *
   * @param cloudDevices Devices from Cloud API
   * @returns true if any new devices were added
   */
  mergeCloudDevices(cloudDevices) {
    let changed = false;
    if (!Array.isArray(cloudDevices)) {
      return false;
    }
    for (const cd of cloudDevices) {
      if (!cd || typeof cd.sku !== "string" || typeof cd.device !== "string") {
        continue;
      }
      const existing = this.devices.get(this.deviceKey(cd.sku, cd.device));
      if (existing) {
        existing.name = cd.deviceName || existing.name;
        existing.capabilities = Array.isArray(cd.capabilities) ? cd.capabilities : [];
        existing.type = cd.type;
        existing.channels.cloud = true;
      } else {
        const device = this.cloudDeviceToGoveeDevice(cd);
        this.devices.set(this.deviceKey(cd.sku, cd.device), device);
        changed = true;
        this.log.debug(`Cloud: New device ${cd.deviceName} (${cd.sku})`);
        this.maybeNudgeSeedSku(cd.sku, cd.deviceName);
      }
      const quirks = (0, import_device_registry.getDeviceQuirks)(cd.sku);
      if (quirks == null ? void 0 : quirks.brokenPlatformApi) {
        this.log.debug(`${cd.sku} has known broken platform API metadata \u2014 capabilities may be incomplete`);
      }
    }
    return changed;
  }
  /**
   * Load scenes, DIY scenes, and snapshots for a device from Cloud API.
   *
   * @param device Target device to populate
   * @param cd Cloud device data with capabilities
   * @returns true if any scene data changed
   */
  async loadDeviceScenes(device, cd) {
    var _a;
    this.diagnostics.addLog(cd.device, "debug", `loadDeviceScenes called for ${cd.sku}`);
    const loadScenes = async () => {
      try {
        const { lightScenes, diyScenes, snapshots } = await this.cloudClient.getScenes(cd.sku, cd.device);
        if (lightScenes.length > 0) {
          device.scenes = lightScenes;
        }
        if (diyScenes.length > 0) {
          device.diyScenes = diyScenes;
        }
        if (snapshots.length > 0) {
          device.snapshots = snapshots;
        }
      } catch (e) {
        this.diagnostics.recordApiFailure(cd.device, "/router/api/v1/device/scenes", e, this.extractStatus(e));
        this.log.debug(`Could not load scenes for ${cd.sku}: ${e instanceof Error ? e.message : String(e)}`);
      }
    };
    await this.commandRouter.executeRateLimited(loadScenes, 2);
    if (device.diyScenes.length === 0) {
      const loadDiy = async () => {
        try {
          const diy = await this.cloudClient.getDiyScenes(cd.sku, cd.device);
          if (diy.length > 0) {
            device.diyScenes = diy;
          }
        } catch (e) {
          this.diagnostics.recordApiFailure(cd.device, "/router/api/v1/device/diy-scenes", e, this.extractStatus(e));
          this.log.debug(`Could not load DIY scenes for ${cd.sku}: ${e instanceof Error ? e.message : String(e)}`);
        }
      };
      await this.commandRouter.executeRateLimited(loadDiy, 2);
    }
    if (device.snapshots.length === 0) {
      const caps = Array.isArray(cd.capabilities) ? cd.capabilities : [];
      const snapCap = caps.find(
        (c) => {
          var _a2;
          return c && c.type === "devices.capabilities.dynamic_scene" && c.instance === "snapshot" && Array.isArray((_a2 = c.parameters) == null ? void 0 : _a2.options);
        }
      );
      if ((_a = snapCap == null ? void 0 : snapCap.parameters) == null ? void 0 : _a.options) {
        device.snapshots = snapCap.parameters.options.filter((o) => o && typeof o.name === "string" && o.value !== void 0 && o.value !== null).map((o) => ({
          name: o.name,
          value: typeof o.value === "number" ? o.value : o.value
        }));
        this.log.debug(`Snapshots from capabilities for ${cd.sku}: ${device.snapshots.length}`);
      }
    }
    return device.scenes.length > 0 || device.diyScenes.length > 0 || device.snapshots.length > 0;
  }
  /**
   * Load scene/music/DIY libraries and SKU features from undocumented API.
   *
   * Each fetch runs through the rate-limiter so a fresh install with 10
   * devices doesn't slam app2.govee.com with 40 back-to-back requests —
   * those endpoints are undocumented and aggressive callers can get the
   * account temporarily locked.
   *
   * @param device Target device to populate
   * @param sku Product model
   * @param force When true, refetch every endpoint regardless of cache —
   *   used by the user-triggered refresh button so a stale library
   *   actually gets replaced
   * @returns true if any library data changed
   */
  async loadDeviceLibraries(device, sku, force = false) {
    if (!this.apiClient) {
      return false;
    }
    this.diagnostics.addLog(device.deviceId, "debug", `loadDeviceLibraries called for ${sku} (force=${force})`);
    let changed = false;
    const runLimited = async (fn) => {
      await this.commandRouter.executeRateLimited(fn, 2);
    };
    if (force || device.sceneLibrary.length === 0) {
      await runLimited(async () => {
        const ep = `/light-effect-libraries?sku=${sku}`;
        try {
          const lib = await this.apiClient.fetchSceneLibrary(sku);
          this.diagnostics.recordApiSuccess(device.deviceId, ep, { count: lib.length, names: lib.map((s) => s.name) });
          if (lib.length > 0) {
            device.sceneLibrary = lib;
            changed = true;
            this.log.debug(`Scene library for ${sku}: ${lib.length} scenes`);
          }
        } catch (e) {
          this.diagnostics.recordApiFailure(device.deviceId, ep, e, this.extractStatus(e));
          this.log.debug(`Could not load scene library for ${sku}: ${e instanceof Error ? e.message : String(e)}`);
        }
      });
    }
    if (force || device.musicLibrary.length === 0) {
      await runLimited(async () => {
        const ep = `/light-effect-libraries-music?sku=${sku}`;
        try {
          const lib = await this.apiClient.fetchMusicLibrary(sku);
          this.diagnostics.recordApiSuccess(device.deviceId, ep, { count: lib.length, names: lib.map((m) => m.name) });
          if (lib.length > 0) {
            device.musicLibrary = lib;
            changed = true;
            this.log.debug(`Music library for ${sku}: ${lib.length} modes`);
          }
        } catch (e) {
          this.diagnostics.recordApiFailure(device.deviceId, ep, e, this.extractStatus(e));
          this.log.debug(`Could not load music library for ${sku}: ${e instanceof Error ? e.message : String(e)}`);
        }
      });
    }
    if (force || device.diyLibrary.length === 0) {
      await runLimited(async () => {
        const ep = `/diy-effect-libraries?sku=${sku}`;
        try {
          const lib = await this.apiClient.fetchDiyLibrary(sku);
          this.diagnostics.recordApiSuccess(device.deviceId, ep, { count: lib.length, names: lib.map((d) => d.name) });
          if (lib.length > 0) {
            device.diyLibrary = lib;
            changed = true;
            this.log.debug(`DIY library for ${sku}: ${lib.length} effects`);
          }
        } catch (e) {
          this.diagnostics.recordApiFailure(device.deviceId, ep, e, this.extractStatus(e));
          this.log.debug(`Could not load DIY library for ${sku}: ${e instanceof Error ? e.message : String(e)}`);
        }
      });
    }
    if (force || !device.skuFeatures) {
      await runLimited(async () => {
        const ep = `/sku-features?sku=${sku}`;
        try {
          const features = await this.apiClient.fetchSkuFeatures(sku);
          this.diagnostics.recordApiSuccess(device.deviceId, ep, features);
          if (features) {
            device.skuFeatures = features;
            changed = true;
            this.log.debug(`SKU features for ${sku}: ${JSON.stringify(features).slice(0, 200)}`);
          }
        } catch (e) {
          this.diagnostics.recordApiFailure(device.deviceId, ep, e, this.extractStatus(e));
          this.log.debug(`Could not load SKU features for ${sku}: ${e instanceof Error ? e.message : String(e)}`);
        }
      });
    }
    if (!device.snapshotBleCmds && device.snapshots.length > 0) {
      await runLimited(async () => {
        try {
          const snaps = await this.apiClient.fetchSnapshots(sku, device.deviceId);
          if (snaps.length > 0) {
            device.snapshotBleCmds = device.snapshots.map((ds) => {
              var _a;
              const match = snaps.find((s) => s.name === ds.name);
              return (_a = match == null ? void 0 : match.bleCmds) != null ? _a : [];
            });
            changed = true;
            this.log.debug(`Snapshot BLE for ${sku}: ${snaps.length} snapshots with local data`);
          }
        } catch (e) {
          this.log.debug(`Could not load snapshot BLE for ${sku}: ${e instanceof Error ? e.message : String(e)}`);
        }
      });
    }
    return changed;
  }
  /**
   * Load group membership from undocumented API and attach to BaseGroup devices.
   * Resolves member device references against the current device map.
   *
   * @returns true if any group memberships were resolved
   */
  async loadGroupMembers() {
    var _a;
    if (!this.apiClient) {
      return false;
    }
    if (!this.apiClient.hasBearerToken()) {
      this.log.debug("Group membership requires Email+Password \u2014 skipping member resolution");
      return false;
    }
    try {
      const apiGroups = await this.apiClient.fetchGroupMembers();
      if (apiGroups.length === 0) {
        this.log.debug("No group membership data from API");
        return false;
      }
      let changed = false;
      for (const group of this.devices.values()) {
        if (group.sku !== "BaseGroup") {
          continue;
        }
        const apiGroup = apiGroups.find((g) => String(g.groupId) === group.deviceId);
        if (!apiGroup) {
          continue;
        }
        const members = [];
        for (const m of apiGroup.devices) {
          const resolved = this.findDeviceBySkuAndId(m.sku, m.deviceId);
          if (resolved) {
            members.push({ sku: resolved.sku, deviceId: resolved.deviceId });
          } else {
            this.log.debug(`Group "${group.name}": member ${m.sku}/${m.deviceId} not in device map`);
          }
        }
        group.groupMembers = members;
        if (members.length > 0) {
          changed = true;
        }
        this.log.debug(`Group "${group.name}": ${members.length}/${apiGroup.devices.length} members resolved`);
      }
      if (changed) {
        (_a = this.onDeviceListChanged) == null ? void 0 : _a.call(this, this.getDevices());
      }
      return changed;
    } catch (e) {
      this.log.debug(`Could not load group members: ${e instanceof Error ? e.message : String(e)}`);
      return false;
    }
  }
  /** Save all devices to SKU cache, skipping only those never confirmed via Cloud yet. */
  saveDevicesToCache() {
    if (!this.skuCache) {
      return;
    }
    let cachedCount = 0;
    let skippedCount = 0;
    for (const device of this.devices.values()) {
      const isLight = device.type === "devices.types.light";
      if (isLight && !device.scenesChecked) {
        skippedCount++;
        this.log.debug(`Not caching ${device.name} (${device.sku}) \u2014 scenes not yet checked`);
      } else {
        this.skuCache.save(this.goveeDeviceToCached(device));
        cachedCount++;
      }
    }
    if (skippedCount > 0) {
      this.log.debug(`Cached ${cachedCount} device(s), skipped ${skippedCount} not yet checked`);
    } else {
      this.log.debug(`Cached ${cachedCount} device(s) \u2014 next start uses cache`);
    }
  }
  /**
   * Handle LAN device discovery — match against known devices or create new.
   *
   * @param lanDevice Discovered LAN device
   */
  handleLanDiscovery(lanDevice) {
    var _a, _b, _c;
    let matched;
    for (const dev of this.devices.values()) {
      if ((0, import_types.normalizeDeviceId)(dev.deviceId) === (0, import_types.normalizeDeviceId)(lanDevice.device)) {
        matched = dev;
        break;
      }
      if (dev.sku === lanDevice.sku && !dev.lanIp) {
        matched = dev;
        break;
      }
    }
    if (matched) {
      const ipChanged = matched.lanIp !== lanDevice.ip;
      const wasOffline = matched.state.online !== true;
      matched.lanIp = lanDevice.ip;
      matched.channels.lan = true;
      matched.lastSeenOnNetwork = Date.now();
      if (ipChanged) {
        this.log.debug(`LAN: ${matched.name} (${matched.sku}) at ${lanDevice.ip}`);
        (_a = this.onLanIpChanged) == null ? void 0 : _a.call(this, matched, lanDevice.ip);
      }
      if (wasOffline) {
        matched.state.online = true;
        (_b = this.onDeviceUpdate) == null ? void 0 : _b.call(this, matched, { online: true });
      }
    } else {
      const shortId = (0, import_types.normalizeDeviceId)(lanDevice.device).slice(-4);
      const device = {
        sku: lanDevice.sku,
        deviceId: lanDevice.device,
        name: `${lanDevice.sku}_${shortId}`,
        type: "devices.types.light",
        lanIp: lanDevice.ip,
        capabilities: [],
        scenes: [],
        diyScenes: [],
        snapshots: [],
        sceneLibrary: [],
        musicLibrary: [],
        diyLibrary: [],
        skuFeatures: null,
        lastSeenOnNetwork: Date.now(),
        state: { online: true },
        channels: { lan: true, mqtt: false, cloud: false }
      };
      this.devices.set(this.deviceKey(lanDevice.sku, lanDevice.device), device);
      this.diagnostics.addLog(lanDevice.device, "info", `LAN-discovered at ${lanDevice.ip}`);
      this.log.debug(`LAN: New device ${lanDevice.sku} at ${lanDevice.ip}`);
      this.maybeNudgeSeedSku(lanDevice.sku, device.name);
      (_c = this.onDeviceListChanged) == null ? void 0 : _c.call(this, this.getDevices());
    }
  }
  /**
   * Log the device's trust tier — once per SKU per adapter lifetime, so
   * device reconnects don't spam the log. Behaviour by tier:
   *   - verified / reported: silent (the catalog backs the device, no
   *     action needed). The tier is still surfaced via the
   *     `diag.tier` state for any user who wants to check.
   *   - seed (toggle off): warn — points the user at the experimental
   *     toggle that gates the per-SKU corrections we'd otherwise apply.
   *   - seed (toggle on): info — confirms quirks are active.
   *   - unknown: warn — asks for a diagnostics export so we can add the
   *     SKU to the catalogue.
   *
   * @param sku Govee SKU
   * @param displayName Device name as shown in Govee Home
   */
  maybeNudgeSeedSku(sku, displayName) {
    const upper = (typeof sku === "string" ? sku : "").toUpperCase();
    if (!upper || this.nudgedSeedSkus.has(upper)) {
      return;
    }
    this.nudgedSeedSkus.add(upper);
    const tier = (0, import_device_registry.getDeviceTier)(upper);
    const label = displayName ? `${displayName} (${upper})` : upper;
    switch (tier) {
      case "verified":
      case "reported":
        return;
      case "seed":
        if ((0, import_device_registry.isSeedAndDormant)(upper)) {
          this.log.warn(
            `Device ${label} is in beta and needs the "Experimentelle Ger\xE4te-Unterst\xFCtzung aktivieren" toggle in adapter settings to apply known per-SKU corrections.`
          );
        } else {
          this.log.info(`Device ${label} is in beta \u2014 experimental quirks are active.`);
        }
        return;
      case "unknown":
        this.log.warn(
          `Device ${label} is not in the supported device list. Please trigger diag.export and post the resulting JSON in a GitHub issue so the SKU can be added.`
        );
        return;
    }
  }
  /**
   * Handle MQTT status update — update device state.
   *
   * @param update MQTT status message
   */
  handleMqttStatus(update) {
    var _a, _b, _c, _d, _e;
    const device = this.findDeviceBySkuAndId(update.sku, update.device);
    if (!device) {
      this.log.debug(`MQTT: Unknown device ${update.sku} ${update.device}`);
      return;
    }
    device.channels.mqtt = true;
    device.lastSeenOnNetwork = Date.now();
    const state = { online: true };
    if (update.state) {
      const onOff = (0, import_types.coerceFiniteNumber)(update.state.onOff);
      if (onOff !== null) {
        state.power = onOff === 1;
      }
      const brightness = (0, import_types.coerceFiniteNumber)(update.state.brightness);
      if (brightness !== null) {
        state.brightness = brightness;
      }
      if (update.state.color && typeof update.state.color === "object") {
        const r = (0, import_types.coerceFiniteNumber)(update.state.color.r);
        const g = (0, import_types.coerceFiniteNumber)(update.state.color.g);
        const b = (0, import_types.coerceFiniteNumber)(update.state.color.b);
        if (r !== null && g !== null && b !== null) {
          state.colorRgb = (0, import_types.rgbToHex)(r, g, b);
        }
      }
      const ctk = (0, import_types.coerceFiniteNumber)(update.state.colorTemInKelvin);
      if (ctk !== null && ctk > 0) {
        state.colorTemperature = ctk;
      }
    }
    Object.assign(device.state, state);
    (_a = this.onDeviceUpdate) == null ? void 0 : _a.call(this, device, state);
    if ((_b = update.op) == null ? void 0 : _b.command) {
      const segData = parseMqttSegmentData(update.op.command);
      if (segData.length > 0) {
        const maxSeen = Math.max(...segData.map((s) => s.index)) + 1;
        const current = (_c = device.segmentCount) != null ? _c : 0;
        if (maxSeen > current) {
          this.log.info(
            `${device.name}: detected ${maxSeen} segments via MQTT (was ${current}) \u2014 rebuilding state tree`
          );
          device.segmentCount = maxSeen;
          if (this.skuCache) {
            this.skuCache.save(this.goveeDeviceToCached(device));
          }
          (_d = this.onSegmentCountGrown) == null ? void 0 : _d.call(this, device);
          return;
        }
      }
      const filtered = device.manualMode && Array.isArray(device.manualSegments) && device.manualSegments.length > 0 ? segData.filter((s) => device.manualSegments.includes(s.index)) : segData;
      if (filtered.length > 0) {
        (_e = this.onMqttSegmentUpdate) == null ? void 0 : _e.call(this, device, filtered);
      }
    }
  }
  /**
   * Handle LAN status response.
   *
   * @param ip Source IP address
   * @param status LAN status data
   * @param status.onOff Power state (1=on, 0=off)
   * @param status.brightness Brightness 0-100
   * @param status.color RGB color values
   * @param status.color.r Red channel 0-255
   * @param status.color.g Green channel 0-255
   * @param status.color.b Blue channel 0-255
   * @param status.colorTemInKelvin Color temperature in Kelvin
   */
  handleLanStatus(ip, status) {
    var _a;
    let device;
    for (const dev of this.devices.values()) {
      if (dev.lanIp === ip) {
        device = dev;
        break;
      }
    }
    if (!device) {
      return;
    }
    device.lastSeenOnNetwork = Date.now();
    const { r, g, b } = status.color;
    const state = {
      online: true,
      power: status.onOff === 1,
      brightness: status.brightness,
      colorRgb: (0, import_types.rgbToHex)(r, g, b),
      colorTemperature: status.colorTemInKelvin || void 0
    };
    Object.assign(device.state, state);
    (_a = this.onDeviceUpdate) == null ? void 0 : _a.call(this, device, state);
  }
  /**
   * Set the callback for batch segment state sync.
   * Forwards to the internal CommandRouter.
   *
   * @param callback Called when a segment batch command updates segment states
   */
  set onSegmentBatchUpdate(callback) {
    this.commandRouter.onSegmentBatchUpdate = callback;
  }
  /**
   * Send a command to a device — routes through LAN → Cloud.
   *
   * @param device Target device
   * @param command Command type
   * @param value Command value
   */
  async sendCommand(device, command, value) {
    return this.commandRouter.sendCommand(device, command, value);
  }
  /**
   * Send a generic capability command via Cloud API.
   * Used for capability types not explicitly handled (toggle, dynamic_scene, etc.)
   *
   * @param device Target device
   * @param capabilityType Full capability type (e.g. "devices.capabilities.toggle")
   * @param capabilityInstance Capability instance name (e.g. "gradientToggle")
   * @param value Command value
   */
  async sendCapabilityCommand(device, capabilityType, capabilityInstance, value) {
    return this.commandRouter.sendCapabilityCommand(device, capabilityType, capabilityInstance, value);
  }
  /** Callback when device LAN IP changes */
  onLanIpChanged;
  /** Callback when MQTT delivers per-segment state data (AA A5 BLE packets) */
  onMqttSegmentUpdate;
  /**
   * Callback when the device's physical segment count turns out to be
   * larger than the Cloud-reported value (observed via MQTT AA A5 stream).
   * The adapter rebuilds the state tree in response so the extra indices
   * appear as datapoints.
   */
  onSegmentCountGrown;
  /**
   * Convert Cloud device to internal device model
   *
   * @param cd Cloud API device data
   */
  cloudDeviceToGoveeDevice(cd) {
    return {
      sku: cd.sku,
      deviceId: cd.device,
      name: cd.deviceName || cd.sku,
      type: cd.type || "unknown",
      capabilities: Array.isArray(cd.capabilities) ? cd.capabilities : [],
      scenes: [],
      diyScenes: [],
      snapshots: [],
      sceneLibrary: [],
      musicLibrary: [],
      diyLibrary: [],
      skuFeatures: null,
      state: { online: true },
      channels: { lan: false, mqtt: false, cloud: true }
    };
  }
  /**
   * Find device by SKU and device ID (handles format differences)
   *
   * @param sku Product model
   * @param deviceId Device identifier
   */
  findDeviceBySkuAndId(sku, deviceId) {
    const direct = this.devices.get(this.deviceKey(sku, deviceId));
    if (direct) {
      return direct;
    }
    const normalizedId = (0, import_types.normalizeDeviceId)(deviceId);
    for (const dev of this.devices.values()) {
      if (dev.sku === sku && (0, import_types.normalizeDeviceId)(dev.deviceId) === normalizedId) {
        return dev;
      }
    }
    return void 0;
  }
  /**
   * Generate unique key for a device
   *
   * @param sku Product model
   * @param deviceId Device identifier
   */
  deviceKey(sku, deviceId) {
    return `${sku}_${(0, import_types.normalizeDeviceId)(deviceId)}`;
  }
  /**
   * Log error with dedup — only warn on category change, debug on repeat.
   *
   * @param context Error context description
   * @param err Error to log
   */
  logDedup(context, err) {
    const category = (0, import_types.classifyError)(err);
    const msg = `${context}: ${err instanceof Error ? err.message : String(err)}`;
    if (category !== this.lastErrorCategory) {
      this.lastErrorCategory = category;
      this.log.warn(msg);
    } else {
      this.log.debug(`${msg} (repeated)`);
    }
  }
  /**
   * Fill device.scenes from sceneLibrary when Cloud scenes are missing.
   * ptReal activation matches by name, so sceneLibrary names are sufficient.
   *
   * @param device Device to populate scenes for
   */
  populateScenesFromLibrary(device) {
    if (device.scenes.length === 0 && device.sceneLibrary.length > 0) {
      device.scenes = device.sceneLibrary.map((entry) => ({
        name: entry.name,
        value: {}
        // ptReal uses sceneLibrary directly, Cloud payload not needed
      }));
      this.log.debug(`${device.sku}: ${device.scenes.length} scenes from library (Cloud scenes missing)`);
    }
  }
  /**
   * Convert cached data to a GoveeDevice (runtime fields set to defaults)
   *
   * @param cached Cached device data
   */
  cachedToGoveeDevice(cached) {
    return {
      sku: cached.sku,
      deviceId: cached.deviceId,
      name: cached.name,
      type: cached.type,
      capabilities: cached.capabilities,
      scenes: cached.scenes,
      diyScenes: cached.diyScenes,
      snapshots: cached.snapshots,
      sceneLibrary: cached.sceneLibrary,
      musicLibrary: cached.musicLibrary,
      diyLibrary: cached.diyLibrary,
      skuFeatures: cached.skuFeatures,
      snapshotBleCmds: cached.snapshotBleCmds,
      scenesChecked: cached.scenesChecked,
      lastSeenOnNetwork: cached.lastSeenOnNetwork,
      // Restore learned count so it wins over Cloud capability on next start.
      segmentCount: cached.segmentCount,
      manualMode: cached.manualMode,
      manualSegments: cached.manualSegments,
      sceneSpeed: cached.sceneSpeed,
      state: { online: false },
      channels: { lan: false, mqtt: false, cloud: false }
    };
  }
  /**
   * Persist a device's current runtime state to the SKU cache.
   * Safe no-op when no cache is configured.
   *
   * @param device Target device
   */
  persistDeviceToCache(device) {
    if (!this.skuCache) {
      return;
    }
    this.skuCache.save(this.goveeDeviceToCached(device));
  }
  /**
   * Extract cacheable data from a GoveeDevice.
   *
   * @param device Runtime device
   */
  goveeDeviceToCached(device) {
    return {
      sku: device.sku,
      deviceId: device.deviceId,
      name: device.name,
      type: device.type,
      capabilities: device.capabilities,
      scenes: device.scenes,
      diyScenes: device.diyScenes,
      snapshots: device.snapshots,
      sceneLibrary: device.sceneLibrary,
      musicLibrary: device.musicLibrary,
      diyLibrary: device.diyLibrary,
      skuFeatures: device.skuFeatures,
      snapshotBleCmds: device.snapshotBleCmds,
      scenesChecked: device.scenesChecked,
      lastSeenOnNetwork: device.lastSeenOnNetwork,
      segmentCount: typeof device.segmentCount === "number" && device.segmentCount > 0 ? device.segmentCount : void 0,
      manualMode: device.manualMode ? true : void 0,
      manualSegments: device.manualMode && Array.isArray(device.manualSegments) && device.manualSegments.length > 0 ? device.manualSegments.slice() : void 0,
      sceneSpeed: typeof device.sceneSpeed === "number" && device.sceneSpeed > 0 ? device.sceneSpeed : void 0,
      cachedAt: Date.now()
    };
  }
  /**
   * Generate diagnostics data for a device — structured JSON for GitHub
   * issue submission. Delegates to the DiagnosticsCollector so the JSON
   * also includes ring-buffer context (recent logs, MQTT packets, last
   * API responses).
   *
   * @param device Target device
   * @param adapterVersion Adapter version string
   */
  generateDiagnostics(device, adapterVersion) {
    return this.diagnostics.generate(device, adapterVersion);
  }
  /**
   * Poll the undocumented app-API for sensor-like devices (H5179 et al.)
   * where OpenAPI v2 `/device/state` returns empty. Each entry is converted
   * to synthetic capabilities and routed back through the same callback as
   * regular Cloud state, so the existing setState pipeline picks it up
   * without a special-case branch.
   *
   * Bearer token comes from the MQTT login flow — without MQTT credentials
   * (Email + Password) this is a no-op.
   *
   * @returns Number of devices that received an update
   */
  async pollAppApi() {
    var _a;
    if (!this.apiClient || !this.apiClient.hasBearerToken()) {
      return 0;
    }
    if (!this.hasDeviceNeedingAppApi()) {
      return 0;
    }
    let entries;
    try {
      entries = await this.apiClient.fetchDeviceList();
    } catch (err) {
      const category = (0, import_types.classifyError)(err);
      const msg = `App API fetch failed: ${err instanceof Error ? err.message : String(err)}`;
      if (category !== this.lastAppApiErrorCategory) {
        this.lastAppApiErrorCategory = category;
        this.log.warn(msg);
      } else {
        this.log.debug(msg);
      }
      return 0;
    }
    this.lastAppApiErrorCategory = null;
    let updated = 0;
    for (const entry of entries) {
      const device = this.devices.get(this.deviceKey(entry.sku, entry.device));
      if (!device) {
        continue;
      }
      const caps = buildCapabilitiesFromAppEntry(entry);
      if (caps.length === 0) {
        continue;
      }
      (_a = this.onCloudCapabilities) == null ? void 0 : _a.call(this, device, caps);
      this.applyOnlineCap(device, caps);
      this.diagnostics.setApiResponse(device.deviceId, "/device/rest/devices/v1/list", entry);
      updated++;
    }
    return updated;
  }
  /**
   * Pull the `devices.capabilities.online` entry (if any) out of a
   * synthetic capability list and apply it directly to
   * `device.state.online` plus `lastSeenOnNetwork`. Surfaces via
   * onDeviceUpdate so the adapter's `info.online` state matches the
   * App-API / OpenAPI-MQTT signal. If no online cap is in the list but
   * the list is non-empty (i.e. fresh data arrived), the device is
   * considered online — same convention as the LAN/MQTT paths.
   *
   * @param device Target device
   * @param caps Capability list from the source pipeline
   */
  applyOnlineCap(device, caps) {
    var _a;
    let online;
    for (const c of caps) {
      if (c && typeof c.type === "string" && (c.type === "devices.capabilities.online" || c.type === "online") && c.state && typeof c.state.value === "boolean") {
        online = c.state.value;
        break;
      }
    }
    if (online === void 0 && caps.length > 0) {
      online = true;
    }
    if (online === void 0) {
      return;
    }
    if (device.state.online === online && online === true) {
      device.lastSeenOnNetwork = Date.now();
      return;
    }
    device.state.online = online;
    if (online) {
      device.lastSeenOnNetwork = Date.now();
    }
    (_a = this.onDeviceUpdate) == null ? void 0 : _a.call(this, device, { online });
  }
  /**
   * Hook callback for sources that emit `CloudStateCapability[]` updates
   * outside the normal Cloud-poll path (App-API, OpenAPI-MQTT). Caller is
   * responsible for wiring it to the adapter-side state-write path.
   *
   * @param cb Callback receiving (device, caps)
   */
  setOnCloudCapabilities(cb) {
    this.onCloudCapabilities = cb;
  }
  /**
   * Whether at least one device in the registry would consume App-API
   * readings (sensors, appliances). Used to skip the App-API poll on
   * Lights-only installations.
   */
  hasDeviceNeedingAppApi() {
    for (const dev of this.devices.values()) {
      if (dev.type !== "devices.types.light" && dev.sku !== "BaseGroup") {
        return true;
      }
    }
    return false;
  }
  /**
   * Process a parsed OpenAPI-MQTT event by forwarding its capabilities
   * through the same hook used by App-API polls. Called from the
   * adapter-side OpenAPI-MQTT message handler.
   *
   * @param event Parsed event from the OpenAPI-MQTT broker
   * @param event.sku Govee SKU (e.g. "H5179")
   * @param event.device MAC-style device identifier
   * @param event.capabilities Capability list synthesised from the broker payload
   */
  handleOpenApiEvent(event) {
    var _a;
    if (!event || typeof event.sku !== "string" || typeof event.device !== "string") {
      return;
    }
    if (!Array.isArray(event.capabilities) || event.capabilities.length === 0) {
      return;
    }
    const device = this.devices.get(this.deviceKey(event.sku, event.device));
    if (!device) {
      return;
    }
    (_a = this.onCloudCapabilities) == null ? void 0 : _a.call(this, device, event.capabilities);
    this.applyOnlineCap(device, event.capabilities);
  }
}
function buildCapabilitiesFromAppEntry(entry) {
  const caps = [];
  const last = entry.lastData;
  if (!last) {
    return caps;
  }
  if (typeof last.online === "boolean") {
    caps.push({
      type: "devices.capabilities.online",
      instance: "online",
      state: { value: last.online }
    });
  }
  if (typeof last.tem === "number" && Number.isFinite(last.tem)) {
    caps.push({
      type: "devices.capabilities.property",
      instance: "sensorTemperature",
      state: { value: last.tem / 100 }
    });
  }
  if (typeof last.hum === "number" && Number.isFinite(last.hum)) {
    caps.push({
      type: "devices.capabilities.property",
      instance: "sensorHumidity",
      state: { value: last.hum / 100 }
    });
  }
  if (typeof last.battery === "number" && Number.isFinite(last.battery)) {
    caps.push({
      type: "devices.capabilities.property",
      instance: "battery",
      state: { value: last.battery }
    });
  } else if (entry.settings && typeof entry.settings.battery === "number" && Number.isFinite(entry.settings.battery)) {
    caps.push({
      type: "devices.capabilities.property",
      instance: "battery",
      state: { value: entry.settings.battery }
    });
  }
  return caps;
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  DeviceManager,
  SEGMENT_HARD_MAX,
  buildCapabilitiesFromAppEntry,
  getEffectiveSegmentIndices,
  parseMqttSegmentData,
  resolveSegmentCount
});
//# sourceMappingURL=device-manager.js.map
