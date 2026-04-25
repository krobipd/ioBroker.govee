import { httpsRequest } from "./http-client.js";
import {
  GOVEE_APP_BASE_URL,
  GOVEE_APP_VERSION,
  GOVEE_CLIENT_ID,
  GOVEE_CLIENT_TYPE,
  GOVEE_USER_AGENT,
} from "./govee-constants.js";

/**
 * Parsed `lastDeviceData` field from the undocumented device-list response.
 * Govee serializes this as a JSON string inside the outer JSON. Temperature
 * and humidity are integer hundredths (`tem: 2370` → 23.70 °C).
 */
export interface AppDeviceLastData {
  /** Online flag as reported by the cloud */
  online?: boolean;
  /** Last temperature in hundredths of a degree (`tem/100` = °C) */
  tem?: number;
  /** Last humidity in hundredths of a percent (`hum/100` = % RH) */
  hum?: number;
  /** Battery percentage — only some devices report it here */
  battery?: number;
  /** UNIX ms of the last data point */
  lastTime?: number;
}

/**
 * Parsed `deviceSettings` field. Fields are a union across SKUs — most are
 * optional, vendor may add more.
 */
export interface AppDeviceSettings {
  /** Upload interval in minutes */
  uploadRate?: number;
  /** Battery percentage (some firmware reports it here, others in lastData) */
  battery?: number;
  /** Currently associated WiFi SSID */
  wifiName?: string;
  /** Device WiFi MAC address */
  wifiMac?: string;
  /** WiFi firmware version */
  wifiSoftVersion?: string;
  /** WiFi hardware revision */
  wifiHardVersion?: string;
  /** BLE advertising name */
  bleName?: string;
  /** Temperature calibration offset (hundredths of degree) */
  temCali?: number;
  /** Humidity calibration offset (hundredths of percent) */
  humCali?: number;
  /** Lower temperature alarm threshold (hundredths of degree) */
  temMin?: number;
  /** Upper temperature alarm threshold (hundredths of degree) */
  temMax?: number;
  /** Lower humidity alarm threshold (hundredths of percent) */
  humMin?: number;
  /** Upper humidity alarm threshold (hundredths of percent) */
  humMax?: number;
  /** App displays Fahrenheit instead of Celsius (display-only) */
  fahOpen?: boolean;
  /** Vendor-defined extras */
  [key: string]: unknown;
}

/** One entry in the undocumented device-list response. */
export interface AppDeviceEntry {
  /** Govee SKU (e.g. "H5179") */
  sku: string;
  /** Device identifier (colon-separated MAC form) */
  device: string;
  /** Display name set in the Govee Home app */
  deviceName: string;
  /** Parsed `lastDeviceData` payload */
  lastData?: AppDeviceLastData;
  /** Parsed `deviceSettings` payload */
  settings?: AppDeviceSettings;
  /** Internal numeric device id (unused) */
  deviceId?: number;
  /** Hardware firmware version */
  versionHard?: string;
  /** Software firmware version */
  versionSoft?: string;
}

/**
 * Govee undocumented API client.
 *
 * Combines two roles that the v1.x adapter split across two clients:
 *   - Light-side: scene library, music library, DIY library, snapshot
 *     packets, SKU features, group members. Most endpoints are public
 *     (no auth) and only need the AppVersion + User-Agent headers.
 *   - Sensor-side: `POST /device/rest/devices/v1/list` for sensors like
 *     H5179 where OpenAPI v2 `/device/state` returns empty. Needs a
 *     bearer token from the MQTT login.
 *
 * Both roles share the same `app2.govee.com` host, the same auth
 * identity (when needed), and the same `setBearerToken()` lifecycle —
 * so they live in one class.
 */
export class GoveeApiClient {
  private bearerToken: string | null = null;

  /**
   * Update the bearer token (obtained from MQTT login).
   *
   * @param token Bearer token string
   */
  setBearerToken(token: string): void {
    this.bearerToken = token;
  }

  /** Check if bearer token is available (set after MQTT login) */
  hasBearerToken(): boolean {
    return !!this.bearerToken;
  }

  /** Auth headers for the bearer-token-protected sensor endpoints. */
  private authHeaders(): Record<string, string> {
    return {
      Authorization: `Bearer ${this.bearerToken ?? ""}`,
      appVersion: GOVEE_APP_VERSION,
      clientId: GOVEE_CLIENT_ID,
      clientType: GOVEE_CLIENT_TYPE,
      "User-Agent": GOVEE_USER_AGENT,
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
  async fetchDeviceList(): Promise<AppDeviceEntry[]> {
    if (!this.bearerToken) {
      return [];
    }
    const resp = await httpsRequest<{
      status?: number;
      message?: string;
      devices?: Array<{
        sku?: string;
        device?: string;
        deviceName?: string;
        deviceId?: number;
        versionHard?: string;
        versionSoft?: string;
        deviceExt?: {
          lastDeviceData?: string;
          deviceSettings?: string;
        };
      }>;
    }>({
      method: "POST",
      url: `${GOVEE_APP_BASE_URL}/device/rest/devices/v1/list`,
      headers: this.authHeaders(),
      body: {},
    });

    const out: AppDeviceEntry[] = [];
    const list = Array.isArray(resp?.devices) ? resp.devices : [];
    for (const d of list) {
      if (!d || typeof d.sku !== "string" || typeof d.device !== "string") {
        continue;
      }
      const entry: AppDeviceEntry = {
        sku: d.sku,
        device: d.device,
        deviceName: typeof d.deviceName === "string" ? d.deviceName : d.sku,
        deviceId: typeof d.deviceId === "number" ? d.deviceId : undefined,
        versionHard:
          typeof d.versionHard === "string" ? d.versionHard : undefined,
        versionSoft:
          typeof d.versionSoft === "string" ? d.versionSoft : undefined,
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
  async fetchSceneLibrary(sku: string): Promise<
    {
      name: string;
      sceneCode: number;
      scenceParam?: string;
      speedInfo?: {
        supSpeed: boolean;
        speedIndex: number;
        config: string;
      };
    }[]
  > {
    const url = `https://app2.govee.com/appsku/v1/light-effect-libraries?sku=${encodeURIComponent(sku)}`;
    const resp = await httpsRequest<{
      data?: {
        categories?: Array<{
          scenes?: Array<{
            sceneName?: string;
            sceneCode?: number;
            lightEffects?: Array<{
              sceneCode?: number;
              scenceName?: string;
              scenceParam?: string;
              speedInfo?: {
                supSpeed?: boolean;
                speedIndex?: number;
                config?: string;
              };
            }>;
          }>;
        }>;
      };
    }>({
      method: "GET",
      url,
      headers: {
        appVersion: GOVEE_APP_VERSION,
        "User-Agent": GOVEE_USER_AGENT,
      },
    });

    const scenes: {
      name: string;
      sceneCode: number;
      scenceParam?: string;
      speedInfo?: { supSpeed: boolean; speedIndex: number; config: string };
    }[] = [];
    const categories = Array.isArray(resp?.data?.categories)
      ? resp.data.categories
      : [];
    for (const cat of categories) {
      const catScenes = Array.isArray(cat?.scenes) ? cat.scenes : [];
      for (const s of catScenes) {
        if (!s || typeof s.sceneName !== "string" || !s.sceneName) {
          continue;
        }
        const effects = Array.isArray(s.lightEffects) ? s.lightEffects : [];
        if (effects.length === 0) {
          // No effects — use scene-level code
          const code = s.sceneCode ?? 0;
          if (code > 0) {
            scenes.push({ name: s.sceneName, sceneCode: code });
          }
          continue;
        }
        const multiVariant = effects.length > 1;
        for (const effect of effects) {
          const code = effect.sceneCode ?? s.sceneCode ?? 0;
          if (code <= 0) {
            continue;
          }
          const name =
            multiVariant && effect.scenceName
              ? `${s.sceneName}-${effect.scenceName}`
              : s.sceneName;
          const si = effect.speedInfo;
          scenes.push({
            name,
            sceneCode: code,
            scenceParam: effect.scenceParam || undefined,
            speedInfo: si?.supSpeed
              ? {
                  supSpeed: true,
                  speedIndex: si.speedIndex ?? 0,
                  config: si.config ?? "",
                }
              : undefined,
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
  async fetchMusicLibrary(
    sku: string,
  ): Promise<
    { name: string; musicCode: number; scenceParam?: string; mode?: number }[]
  > {
    if (!this.bearerToken) {
      return [];
    }
    const url = `https://app2.govee.com/appsku/v1/music-effect-libraries?sku=${encodeURIComponent(sku)}`;
    const resp = await httpsRequest<{
      data?: {
        categories?: Array<{
          categoryName?: string;
          scenes?: Array<{
            sceneName?: string;
            sceneCode?: number;
            lightEffects?: Array<{
              sceneCode?: number;
              scenceParam?: string;
            }>;
          }>;
        }>;
      };
    }>({ method: "GET", url, headers: this.authHeaders() });

    const modes: {
      name: string;
      musicCode: number;
      scenceParam?: string;
      mode?: number;
    }[] = [];
    let modeIdx = 0;
    const musicCats = Array.isArray(resp?.data?.categories)
      ? resp.data.categories
      : [];
    for (const cat of musicCats) {
      const catScenes = Array.isArray(cat?.scenes) ? cat.scenes : [];
      for (const s of catScenes) {
        if (!s || typeof s.sceneName !== "string" || !s.sceneName) {
          continue;
        }
        const effects = Array.isArray(s.lightEffects) ? s.lightEffects : [];
        const effect = effects[0];
        const code = effect?.sceneCode ?? s.sceneCode ?? 0;
        if (code > 0) {
          modes.push({
            name: s.sceneName,
            musicCode: code,
            scenceParam: effect?.scenceParam || undefined,
            mode: modeIdx,
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
  async fetchDiyLibrary(
    sku: string,
  ): Promise<{ name: string; diyCode: number; scenceParam?: string }[]> {
    if (!this.bearerToken) {
      return [];
    }
    const url = `https://app2.govee.com/appsku/v1/diy-light-effect-libraries?sku=${encodeURIComponent(sku)}`;
    const resp = await httpsRequest<{
      data?: {
        categories?: Array<{
          scenes?: Array<{
            sceneName?: string;
            sceneCode?: number;
            lightEffects?: Array<{
              sceneCode?: number;
              scenceParam?: string;
            }>;
          }>;
        }>;
      };
    }>({ method: "GET", url, headers: this.authHeaders() });

    const diys: { name: string; diyCode: number; scenceParam?: string }[] = [];
    const diyCats = Array.isArray(resp?.data?.categories)
      ? resp.data.categories
      : [];
    for (const cat of diyCats) {
      const catScenes = Array.isArray(cat?.scenes) ? cat.scenes : [];
      for (const s of catScenes) {
        if (!s || typeof s.sceneName !== "string" || !s.sceneName) {
          continue;
        }
        const effects = Array.isArray(s.lightEffects) ? s.lightEffects : [];
        const effect = effects[0];
        const code = effect?.sceneCode ?? s.sceneCode ?? 0;
        if (code > 0) {
          diys.push({
            name: s.sceneName,
            diyCode: code,
            scenceParam: effect?.scenceParam || undefined,
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
  async fetchSkuFeatures(sku: string): Promise<Record<string, unknown> | null> {
    if (!this.bearerToken) {
      return null;
    }
    const url = `https://app2.govee.com/appsku/v1/sku-supported-feature?sku=${encodeURIComponent(sku)}`;
    const resp = await httpsRequest<{
      data?: Record<string, unknown>;
    }>({ method: "GET", url, headers: this.authHeaders() });
    return resp.data ?? null;
  }

  /**
   * Fetch snapshot BLE commands for local activation via ptReal.
   * Each snapshot contains one or more cmds with Base64 BLE packets.
   *
   * @param sku Product model
   * @param deviceId Device identifier (colon-separated)
   */
  async fetchSnapshots(
    sku: string,
    deviceId: string,
  ): Promise<{ name: string; bleCmds: string[][] }[]> {
    if (!this.bearerToken) {
      return [];
    }
    const url = `https://app2.govee.com/bff-app/v1/devices/snapshots?sku=${encodeURIComponent(sku)}&device=${encodeURIComponent(deviceId)}&snapshotId=-1`;
    const resp = await httpsRequest<{
      data?: {
        snapshots?: Array<{
          name?: string;
          cmds?: Array<{
            bleCmds?: string;
          }>;
        }>;
      };
    }>({ method: "GET", url, headers: this.authHeaders() });

    const results: { name: string; bleCmds: string[][] }[] = [];
    const snaps = Array.isArray(resp?.data?.snapshots)
      ? resp.data.snapshots
      : [];
    for (const snap of snaps) {
      if (!snap || typeof snap.name !== "string" || !snap.name) {
        continue;
      }
      const allCmdPackets: string[][] = [];
      const cmds = Array.isArray(snap.cmds) ? snap.cmds : [];
      for (const cmd of cmds) {
        if (!cmd || typeof cmd.bleCmds !== "string" || !cmd.bleCmds) {
          continue;
        }
        try {
          const parsed = JSON.parse(cmd.bleCmds) as { bleCmd?: string };
          if (typeof parsed?.bleCmd === "string" && parsed.bleCmd.length > 0) {
            allCmdPackets.push(parsed.bleCmd.split(","));
          }
        } catch {
          // skip malformed bleCmds JSON
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
  async fetchGroupMembers(): Promise<
    {
      groupId: number;
      name: string;
      devices: { sku: string; deviceId: string }[];
    }[]
  > {
    if (!this.bearerToken) {
      return [];
    }
    const url = "https://app2.govee.com/bff-app/v1/exec-plat/home";
    const resp = await httpsRequest<{
      data?: {
        components?: Array<{
          groups?: Array<{
            gId?: number;
            name?: string;
            devices?: Array<{
              sku?: string;
              device?: string;
            }>;
          }>;
        }>;
      };
    }>({ method: "GET", url, headers: this.authHeaders() });

    const groups: {
      groupId: number;
      name: string;
      devices: { sku: string; deviceId: string }[];
    }[] = [];
    const components = Array.isArray(resp?.data?.components)
      ? resp.data.components
      : [];
    for (const comp of components) {
      const compGroups = Array.isArray(comp?.groups) ? comp.groups : [];
      for (const g of compGroups) {
        if (!g || typeof g.gId !== "number") {
          continue;
        }
        const devices: { sku: string; deviceId: string }[] = [];
        const gDevices = Array.isArray(g.devices) ? g.devices : [];
        for (const d of gDevices) {
          if (
            d &&
            typeof d.sku === "string" &&
            typeof d.device === "string" &&
            d.sku &&
            d.device
          ) {
            devices.push({ sku: d.sku, deviceId: d.device });
          }
        }
        if (devices.length > 0) {
          groups.push({
            groupId: g.gId,
            name: typeof g.name === "string" ? g.name : "",
            devices,
          });
        }
      }
    }
    return groups;
  }
}

/**
 * Decode the per-device `lastDeviceData` field. Govee serializes it as a
 * JSON string nested inside the outer JSON. Malformed or missing input
 * yields `undefined` rather than throwing — caller treats it as no data.
 *
 * @param raw Stringified JSON payload from `deviceExt.lastDeviceData`
 */
export function parseLastData(
  raw: string | undefined,
): AppDeviceLastData | undefined {
  if (typeof raw !== "string" || !raw) {
    return undefined;
  }
  try {
    const obj = JSON.parse(raw) as Record<string, unknown>;
    const out: AppDeviceLastData = {};
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
    return undefined;
  }
}

/**
 * Decode the per-device `deviceSettings` field. Returns a plain object —
 * downstream consumers must treat every property as optional. Malformed
 * or missing input yields `undefined`.
 *
 * @param raw Stringified JSON payload from `deviceExt.deviceSettings`
 */
export function parseSettings(
  raw: string | undefined,
): AppDeviceSettings | undefined {
  if (typeof raw !== "string" || !raw) {
    return undefined;
  }
  try {
    const obj = JSON.parse(raw) as AppDeviceSettings;
    return obj && typeof obj === "object" ? obj : undefined;
  } catch {
    return undefined;
  }
}
