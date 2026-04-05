import * as https from "node:https";
import type {
  CloudDevice,
  CloudDeviceListResponse,
  CloudDeviceStateResponse,
  CloudScene,
  CloudScenesResponse,
  CloudStateCapability,
} from "./types.js";

const BASE_URL = "https://openapi.api.govee.com";

/** Error with HTTP status code */
export class CloudApiError extends Error {
  readonly statusCode: number;
  constructor(message: string, statusCode: number) {
    super(message);
    this.name = "CloudApiError";
    this.statusCode = statusCode;
  }
}

/**
 * Govee Cloud API v2 client.
 * Used for device list, capabilities, scenes, segments, and as control fallback.
 */
export class GoveeCloudClient {
  private readonly apiKey: string;

  /**
   * @param apiKey Govee API key
   * @param _log ioBroker logger (reserved for future use)
   */
  constructor(apiKey: string, _log: ioBroker.Logger) {
    this.apiKey = apiKey;
  }

  /** Fetch all devices with their capabilities */
  async getDevices(): Promise<CloudDevice[]> {
    const resp = await this.request<CloudDeviceListResponse>(
      "GET",
      "/router/api/v1/user/devices",
    );
    return resp.data ?? [];
  }

  /**
   * Fetch current state of a device
   *
   * @param sku
   * @param device
   */
  async getDeviceState(
    sku: string,
    device: string,
  ): Promise<CloudStateCapability[]> {
    const resp = await this.request<CloudDeviceStateResponse>(
      "POST",
      "/router/api/v1/device/state",
      {
        requestId: "uuid",
        payload: { sku, device },
      },
    );
    return resp.data?.capabilities ?? [];
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
    await this.request("POST", "/router/api/v1/device/control", {
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
    });
  }

  /**
   * Fetch dynamic scenes for a device
   *
   * @param sku
   * @param device
   */
  async getScenes(sku: string, device: string): Promise<CloudScene[]> {
    const resp = await this.request<CloudScenesResponse>(
      "POST",
      "/router/api/v1/device/scenes",
      {
        requestId: "scenes",
        payload: { sku, device },
      },
    );
    return resp.data ?? [];
  }

  /** Check if the API key is valid */
  async checkConnection(): Promise<{
    success: boolean;
    message: string;
    deviceCount?: number;
  }> {
    try {
      const devices = await this.getDevices();
      return {
        success: true,
        message: `Connected — ${devices.length} device(s) found`,
        deviceCount: devices.length,
      };
    } catch (err) {
      return {
        success: false,
        message: err instanceof Error ? err.message : String(err),
      };
    }
  }

  /**
   * Make an HTTPS request to the Govee Cloud API
   *
   * @param method
   * @param path
   * @param body
   */
  private request<T>(method: string, path: string, body?: unknown): Promise<T> {
    return new Promise((resolve, reject) => {
      const url = new URL(path, BASE_URL);
      const postData = body ? JSON.stringify(body) : undefined;

      const options: https.RequestOptions = {
        method,
        hostname: url.hostname,
        path: url.pathname,
        headers: {
          "Content-Type": "application/json",
          "Govee-API-Key": this.apiKey,
          ...(postData
            ? { "Content-Length": Buffer.byteLength(postData) }
            : {}),
        },
        timeout: 15_000,
      };

      const req = https.request(options, (res) => {
        const chunks: Buffer[] = [];
        res.on("data", (chunk: Buffer) => chunks.push(chunk));
        res.on("end", () => {
          const raw = Buffer.concat(chunks).toString();
          const statusCode = res.statusCode ?? 0;

          if (statusCode === 429) {
            const retryAfter = res.headers["retry-after"];
            reject(
              new CloudApiError(
                `Rate limited — retry after ${retryAfter ?? "unknown"}s`,
                429,
              ),
            );
            return;
          }

          if (statusCode < 200 || statusCode >= 300) {
            reject(
              new CloudApiError(
                `HTTP ${statusCode}: ${raw.slice(0, 200)}`,
                statusCode,
              ),
            );
            return;
          }

          try {
            resolve(JSON.parse(raw) as T);
          } catch {
            reject(new Error(`Invalid JSON response: ${raw.slice(0, 200)}`));
          }
        });
      });

      req.on("error", reject);
      req.on("timeout", () => {
        req.destroy(new Error("Request timed out"));
      });

      if (postData) {
        req.write(postData);
      }
      req.end();
    });
  }
}
