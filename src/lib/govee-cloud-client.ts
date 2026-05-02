import { httpsRequest, HttpError } from "./http-client";
import type {
  CloudDevice,
  CloudDeviceListResponse,
  CloudDeviceStateResponse,
  CloudScene,
  CloudScenesResponse,
  CloudStateCapability,
} from "./types";

const BASE_URL = "https://openapi.api.govee.com";

/**
 * Govee Cloud API v2 client.
 * Used for device list, capabilities, scenes, segments, and as control fallback.
 */
export class GoveeCloudClient {
  private readonly apiKey: string;
  private readonly log: ioBroker.Logger;
  /**
   * Diagnostics hook — receives (deviceId, endpoint, body) for each
   * response. Optional; the adapter wires it to a DiagnosticsCollector
   * for `diag.export`.
   */
  private onResponse: ((deviceId: string, endpoint: string, body: unknown) => void) | null = null;

  /**
   * @param apiKey Govee API key
   * @param log ioBroker logger
   */
  constructor(apiKey: string, log: ioBroker.Logger) {
    this.apiKey = apiKey;
    this.log = log;
  }

  /**
   * Register a hook called after every successful Cloud API response.
   * Used to populate the DiagnosticsCollector ring buffer.
   *
   * @param cb Callback receiving (deviceId, endpoint, body)
   */
  setResponseHook(cb: ((deviceId: string, endpoint: string, body: unknown) => void) | null): void {
    this.onResponse = cb;
  }

  /** Fetch all devices with their capabilities */
  async getDevices(): Promise<CloudDevice[]> {
    const resp = await this.request<CloudDeviceListResponse>("GET", "/router/api/v1/user/devices");
    // Defensive — API can drift. Guard for non-array to protect downstream iteration.
    return Array.isArray(resp?.data) ? resp.data : [];
  }

  /**
   * Fetch current state of a device
   *
   * @param sku Product model
   * @param device Device identifier
   */
  async getDeviceState(sku: string, device: string): Promise<CloudStateCapability[]> {
    const resp = await this.request<CloudDeviceStateResponse>("POST", "/router/api/v1/device/state", {
      requestId: `state_${Date.now()}`,
      payload: { sku, device },
    });
    this.onResponse?.(device, "/router/api/v1/device/state", resp);
    const caps = resp?.data?.capabilities;
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
  async controlDevice(
    sku: string,
    device: string,
    capabilityType: string,
    instance: string,
    value: unknown,
  ): Promise<void> {
    const reqBody = {
      requestId: `ctrl_${Date.now()}`,
      payload: {
        sku,
        device,
        capability: {
          type: capabilityType,
          instance,
          value,
        },
      },
    };
    const resp = await this.request("POST", "/router/api/v1/device/control", reqBody);
    this.onResponse?.(device, "/router/api/v1/device/control", { request: reqBody.payload.capability, response: resp });
  }

  /**
   * Fetch dynamic scenes and snapshots for a device.
   * The scenes endpoint returns capabilities with options.
   *
   * @param sku Product model
   * @param device Device identifier
   */
  async getScenes(
    sku: string,
    device: string,
  ): Promise<{
    lightScenes: CloudScene[];
    diyScenes: CloudScene[];
    snapshots: CloudScene[];
  }> {
    const resp = await this.request<CloudScenesResponse>("POST", "/router/api/v1/device/scenes", {
      requestId: "scenes",
      payload: { sku, device },
    });
    this.onResponse?.(device, "/router/api/v1/device/scenes", resp);

    const lightScenes: CloudScene[] = [];
    const diyScenes: CloudScene[] = [];
    const snapshots: CloudScene[] = [];

    const caps = Array.isArray(resp?.payload?.capabilities) ? resp.payload.capabilities : [];
    for (const cap of caps) {
      if (!cap || typeof cap.instance !== "string") {
        continue;
      }
      const opts = Array.isArray(cap.parameters?.options) ? cap.parameters.options : [];
      this.log.debug(`Scenes endpoint: instance=${cap.instance}, options=${opts.length}`);
      const mapped: CloudScene[] = opts
        .filter(
          (o): o is { name: string; value: Record<string, unknown> } =>
            !!o && typeof o.name === "string" && typeof o.value === "object",
        )
        .map(o => ({
          name: o.name,
          value: o.value,
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
  async getDiyScenes(sku: string, device: string): Promise<CloudScene[]> {
    const resp = await this.request<CloudScenesResponse>("POST", "/router/api/v1/device/diy-scenes", {
      requestId: "diy-scenes",
      payload: { sku, device },
    });
    this.onResponse?.(device, "/router/api/v1/device/diy-scenes", resp);

    const scenes: CloudScene[] = [];
    const caps = Array.isArray(resp?.payload?.capabilities) ? resp.payload.capabilities : [];
    for (const cap of caps) {
      if (!cap || typeof cap.instance !== "string") {
        continue;
      }
      const opts = Array.isArray(cap.parameters?.options) ? cap.parameters.options : [];
      this.log.debug(`DIY-Scenes endpoint: instance=${cap.instance}, options=${opts.length}`);
      scenes.push(
        ...opts
          .filter(
            (o): o is { name: string; value: Record<string, unknown> } =>
              !!o && typeof o.name === "string" && typeof o.value === "object",
          )
          .map(o => ({ name: o.name, value: o.value })),
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
  private async request<T>(method: string, path: string, body?: unknown): Promise<T> {
    this.log.debug(`Cloud API: ${method} ${path}`);
    try {
      return await httpsRequest<T>({
        method: method as "GET" | "POST",
        url: new URL(path, BASE_URL).toString(),
        headers: { "Govee-API-Key": this.apiKey },
        body,
      });
    } catch (err) {
      // Enhance 429 errors with retry-after info
      if (err instanceof HttpError && err.statusCode === 429) {
        const retryAfter = String(err.headers["retry-after"] ?? "unknown");
        throw new HttpError(`Rate limited — retry after ${retryAfter}s`, 429, err.headers);
      }
      throw err;
    }
  }
}
