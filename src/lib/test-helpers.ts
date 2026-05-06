/**
 * Geteilte Test-Mocks und Factories für alle Test-Dateien.
 *
 * Vorher waren `mockLog`, `mockTimers`, `createTestDevice` etc. inline in
 * `device-manager.test.ts` — andere Tests dupliziert. Hier zentral.
 */

import type { CloudCapability, GoveeDevice } from "./types";

/** No-op Logger mit allen ioBroker.Logger-Methoden. */
export const mockLog: ioBroker.Logger = {
  info: () => {},
  warn: () => {},
  error: () => {},
  debug: () => {},
  silly: () => {},
  level: "info",
};

/**
 * Timer-Adapter für Tests.
 *
 * `setTimeout` feuert SOFORT — async-await-Pfade die auf `await new Promise(r => setTimeout(r, ...))`
 * basieren, würden sonst stallen. `setInterval` feuert NICHT — Tests die
 * Polling beobachten brauchen explizit eine andere Mock-Strategie.
 */
export const mockTimers = {
  setInterval: () => undefined,
  clearInterval: () => undefined,
  setTimeout: (cb: () => void) => {
    cb();
    return undefined;
  },
  clearTimeout: () => undefined,
} as never;

/**
 * Standard-Capability-Set für ein reguläres Light-Gerät (H6160-artig).
 * Reicht für die meisten Tests die Capabilities erwarten ohne sich für
 * Details zu interessieren.
 */
export function lightCapabilities(): CloudCapability[] {
  return [
    { type: "devices.capabilities.on_off", instance: "powerSwitch", parameters: { dataType: "ENUM" } },
    {
      type: "devices.capabilities.range",
      instance: "brightness",
      parameters: { dataType: "INTEGER", range: { min: 0, max: 100, precision: 1 } },
    },
    { type: "devices.capabilities.color_setting", instance: "colorRgb", parameters: { dataType: "INTEGER" } },
    {
      type: "devices.capabilities.color_setting",
      instance: "colorTemperatureK",
      parameters: { dataType: "INTEGER", range: { min: 2000, max: 9000, precision: 1 } },
    },
    { type: "devices.capabilities.dynamic_scene", instance: "lightScene" },
    { type: "devices.capabilities.dynamic_scene", instance: "diyScene" },
    { type: "devices.capabilities.dynamic_scene", instance: "snapshot" },
    {
      type: "devices.capabilities.segment_color_setting",
      instance: "segmentedColorRgb",
      parameters: { dataType: "STRUCT", fields: [{ fieldName: "segment", range: { min: 0, max: 14 } }] },
    },
    {
      type: "devices.capabilities.segment_color_setting",
      instance: "segmentedBrightness",
      parameters: { dataType: "STRUCT", fields: [{ fieldName: "segment", range: { min: 0, max: 14 } }] },
    },
  ] as CloudCapability[];
}

/**
 * Erstelle ein Test-GoveeDevice mit sinnvollen Defaults. Override-Pattern
 * via Spread: `createTestDevice({ sku: "H1234" })`.
 *
 * @param overrides Override einzelner Felder
 */
export function createTestDevice(overrides: Partial<GoveeDevice> = {}): GoveeDevice {
  return {
    sku: "H6160",
    deviceId: "AA:BB:CC:DD:EE:FF:00:11",
    name: "Test Device",
    type: "devices.types.light",
    lanIp: "192.168.1.100",
    capabilities: lightCapabilities(),
    scenes: [
      { name: "Sunrise", value: { id: 1, paramId: "sunrise" } },
      { name: "Sunset", value: { id: 2, paramId: "sunset" } },
    ],
    diyScenes: [
      { name: "DIY1", value: { id: 100, paramId: "diy1" } },
      { name: "DIY2", value: { id: 101, paramId: "diy2" } },
    ],
    snapshots: [
      { name: "Snap1", value: 1 },
      { name: "Snap2", value: 2 },
    ],
    sceneLibrary: [],
    musicLibrary: [],
    diyLibrary: [],
    skuFeatures: null,
    lastSeenOnNetwork: Date.now(),
    state: { online: true },
    channels: { lan: true, mqtt: false, cloud: false },
    segmentCount: 15,
    ...overrides,
  };
}

/**
 * Recorder für Mock-Method-Aufrufe in Tests.
 *
 * Nutzung:
 * ```ts
 * const tracker = createCallTracker();
 * mockObj.someMethod = tracker.track("someMethod");
 * // ... call code ...
 * expect(tracker.calls).to.deep.equal([{method: "someMethod", args: [...]}]);
 * ```
 */
export function createCallTracker(): {
  calls: Array<{ method: string; args: unknown[] }>;
  track: (method: string) => (...args: unknown[]) => void;
} {
  const calls: Array<{ method: string; args: unknown[] }> = [];
  return {
    calls,
    track:
      (method: string) =>
      (...args: unknown[]) => {
        calls.push({ method, args });
      },
  };
}

/**
 * Erstellt ein DM-Test-Device mit den Werten die device-manager.test.ts
 * erwartet — deviceId ohne Doppelpunkte, snapshot.value als grosse Zahl,
 * eigene mockLog-Variante (level "debug").
 */
export const dmMockLog: ioBroker.Logger = {
  debug: () => {},
  info: () => {},
  warn: () => {},
  error: () => {},
  silly: () => {},
  level: "debug",
};

export const QUIRK_TEST_REGISTRY = {
  devices: {
    H6141: { name: "LED Strip", type: "light", status: "seed", quirks: { brokenPlatformApi: true } },
    H5179: { name: "Thermometer", type: "sensor", status: "verified" },
    H61BE: { name: "LED Strip", type: "light", status: "verified" },
    H6056: { name: "LED Strip", type: "light", status: "verified" },
    H70D1: { name: "LED Strip", type: "light", status: "verified" },
  },
};

/** Standard light capabilities for device-manager tests (without segment field-ranges). */
export function dmLightCapabilities(): CloudCapability[] {
  return [
    { type: "devices.capabilities.on_off", instance: "powerSwitch", parameters: { dataType: "ENUM" } },
    {
      type: "devices.capabilities.range",
      instance: "brightness",
      parameters: { dataType: "INTEGER", range: { min: 0, max: 100, precision: 1 } },
    },
    { type: "devices.capabilities.color_setting", instance: "colorRgb", parameters: { dataType: "INTEGER" } },
    {
      type: "devices.capabilities.color_setting",
      instance: "colorTemperatureK",
      parameters: { dataType: "INTEGER", range: { min: 2000, max: 9000, precision: 1 } },
    },
    { type: "devices.capabilities.dynamic_scene", instance: "lightScene", parameters: { dataType: "STRUCT" } },
    { type: "devices.capabilities.dynamic_scene", instance: "snapshot", parameters: { dataType: "STRUCT" } },
    { type: "devices.capabilities.dynamic_scene", instance: "diyScene", parameters: { dataType: "STRUCT" } },
    {
      type: "devices.capabilities.segment_color_setting",
      instance: "segmentedColorRgb",
      parameters: { dataType: "STRUCT" },
    },
    {
      type: "devices.capabilities.segment_color_setting",
      instance: "segmentedBrightness",
      parameters: { dataType: "STRUCT" },
    },
  ];
}

/**
 * Test-Device mit Werten die device-manager.test.ts erwartet.
 *
 * @param overrides Felder die im resulting Device überschrieben werden sollen.
 */
export function dmCreateTestDevice(overrides: Partial<GoveeDevice> = {}): GoveeDevice {
  return {
    sku: "H6160",
    deviceId: "AABBCCDDEEFF0011",
    name: "Test Light",
    type: "devices.types.light",
    lanIp: "192.168.1.100",
    capabilities: dmLightCapabilities(),
    scenes: [
      { name: "Sunset", value: { id: 1, paramId: "abc" } },
      { name: "Rainbow", value: { id: 2, paramId: "def" } },
    ],
    diyScenes: [{ name: "MyDIY", value: { id: 100, paramId: "xyz" } }],
    snapshots: [
      { name: "Snap1", value: 3782580 },
      { name: "Snap2", value: 3782581 },
    ],
    sceneLibrary: [],
    musicLibrary: [],
    diyLibrary: [],
    skuFeatures: null,
    segmentCount: 15,
    state: { online: true },
    channels: { lan: true, mqtt: true, cloud: true },
    ...overrides,
  };
}

/** DM-tracker mit Boolean-return statt void (passt zu MQTT publish-Mocks). */
export function dmCreateCallTracker(): {
  calls: Array<{ method: string; args: unknown[] }>;
  track: (method: string) => (...args: unknown[]) => unknown;
} {
  const calls: Array<{ method: string; args: unknown[] }> = [];
  return {
    calls,
    track:
      (method: string) =>
      (...args: unknown[]) => {
        calls.push({ method, args });
        return true;
      },
  };
}
