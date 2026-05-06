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
var test_helpers_exports = {};
__export(test_helpers_exports, {
  QUIRK_TEST_REGISTRY: () => QUIRK_TEST_REGISTRY,
  createCallTracker: () => createCallTracker,
  createTestDevice: () => createTestDevice,
  dmCreateCallTracker: () => dmCreateCallTracker,
  dmCreateTestDevice: () => dmCreateTestDevice,
  dmLightCapabilities: () => dmLightCapabilities,
  dmMockLog: () => dmMockLog,
  lightCapabilities: () => lightCapabilities,
  mockLog: () => mockLog,
  mockTimers: () => mockTimers
});
module.exports = __toCommonJS(test_helpers_exports);
const mockLog = {
  info: () => {
  },
  warn: () => {
  },
  error: () => {
  },
  debug: () => {
  },
  silly: () => {
  },
  level: "info"
};
const mockTimers = {
  setInterval: () => void 0,
  clearInterval: () => void 0,
  setTimeout: (cb) => {
    cb();
    return void 0;
  },
  clearTimeout: () => void 0
};
function lightCapabilities() {
  return [
    { type: "devices.capabilities.on_off", instance: "powerSwitch", parameters: { dataType: "ENUM" } },
    {
      type: "devices.capabilities.range",
      instance: "brightness",
      parameters: { dataType: "INTEGER", range: { min: 0, max: 100, precision: 1 } }
    },
    { type: "devices.capabilities.color_setting", instance: "colorRgb", parameters: { dataType: "INTEGER" } },
    {
      type: "devices.capabilities.color_setting",
      instance: "colorTemperatureK",
      parameters: { dataType: "INTEGER", range: { min: 2e3, max: 9e3, precision: 1 } }
    },
    { type: "devices.capabilities.dynamic_scene", instance: "lightScene" },
    { type: "devices.capabilities.dynamic_scene", instance: "diyScene" },
    { type: "devices.capabilities.dynamic_scene", instance: "snapshot" },
    {
      type: "devices.capabilities.segment_color_setting",
      instance: "segmentedColorRgb",
      parameters: { dataType: "STRUCT", fields: [{ fieldName: "segment", range: { min: 0, max: 14 } }] }
    },
    {
      type: "devices.capabilities.segment_color_setting",
      instance: "segmentedBrightness",
      parameters: { dataType: "STRUCT", fields: [{ fieldName: "segment", range: { min: 0, max: 14 } }] }
    }
  ];
}
function createTestDevice(overrides = {}) {
  return {
    sku: "H6160",
    deviceId: "AA:BB:CC:DD:EE:FF:00:11",
    name: "Test Device",
    type: "devices.types.light",
    lanIp: "192.168.1.100",
    capabilities: lightCapabilities(),
    scenes: [
      { name: "Sunrise", value: { id: 1, paramId: "sunrise" } },
      { name: "Sunset", value: { id: 2, paramId: "sunset" } }
    ],
    diyScenes: [
      { name: "DIY1", value: { id: 100, paramId: "diy1" } },
      { name: "DIY2", value: { id: 101, paramId: "diy2" } }
    ],
    snapshots: [
      { name: "Snap1", value: 1 },
      { name: "Snap2", value: 2 }
    ],
    sceneLibrary: [],
    musicLibrary: [],
    diyLibrary: [],
    skuFeatures: null,
    lastSeenOnNetwork: Date.now(),
    state: { online: true },
    channels: { lan: true, mqtt: false, cloud: false },
    segmentCount: 15,
    ...overrides
  };
}
function createCallTracker() {
  const calls = [];
  return {
    calls,
    track: (method) => (...args) => {
      calls.push({ method, args });
    }
  };
}
const dmMockLog = {
  debug: () => {
  },
  info: () => {
  },
  warn: () => {
  },
  error: () => {
  },
  silly: () => {
  },
  level: "debug"
};
const QUIRK_TEST_REGISTRY = {
  devices: {
    H6141: { name: "LED Strip", type: "light", status: "seed", quirks: { brokenPlatformApi: true } },
    H5179: { name: "Thermometer", type: "sensor", status: "verified" },
    H61BE: { name: "LED Strip", type: "light", status: "verified" },
    H6056: { name: "LED Strip", type: "light", status: "verified" },
    H70D1: { name: "LED Strip", type: "light", status: "verified" }
  }
};
function dmLightCapabilities() {
  return [
    { type: "devices.capabilities.on_off", instance: "powerSwitch", parameters: { dataType: "ENUM" } },
    {
      type: "devices.capabilities.range",
      instance: "brightness",
      parameters: { dataType: "INTEGER", range: { min: 0, max: 100, precision: 1 } }
    },
    { type: "devices.capabilities.color_setting", instance: "colorRgb", parameters: { dataType: "INTEGER" } },
    {
      type: "devices.capabilities.color_setting",
      instance: "colorTemperatureK",
      parameters: { dataType: "INTEGER", range: { min: 2e3, max: 9e3, precision: 1 } }
    },
    { type: "devices.capabilities.dynamic_scene", instance: "lightScene", parameters: { dataType: "STRUCT" } },
    { type: "devices.capabilities.dynamic_scene", instance: "snapshot", parameters: { dataType: "STRUCT" } },
    { type: "devices.capabilities.dynamic_scene", instance: "diyScene", parameters: { dataType: "STRUCT" } },
    {
      type: "devices.capabilities.segment_color_setting",
      instance: "segmentedColorRgb",
      parameters: { dataType: "STRUCT" }
    },
    {
      type: "devices.capabilities.segment_color_setting",
      instance: "segmentedBrightness",
      parameters: { dataType: "STRUCT" }
    }
  ];
}
function dmCreateTestDevice(overrides = {}) {
  return {
    sku: "H6160",
    deviceId: "AABBCCDDEEFF0011",
    name: "Test Light",
    type: "devices.types.light",
    lanIp: "192.168.1.100",
    capabilities: dmLightCapabilities(),
    scenes: [
      { name: "Sunset", value: { id: 1, paramId: "abc" } },
      { name: "Rainbow", value: { id: 2, paramId: "def" } }
    ],
    diyScenes: [{ name: "MyDIY", value: { id: 100, paramId: "xyz" } }],
    snapshots: [
      { name: "Snap1", value: 3782580 },
      { name: "Snap2", value: 3782581 }
    ],
    sceneLibrary: [],
    musicLibrary: [],
    diyLibrary: [],
    skuFeatures: null,
    segmentCount: 15,
    state: { online: true },
    channels: { lan: true, mqtt: true, cloud: true },
    ...overrides
  };
}
function dmCreateCallTracker() {
  const calls = [];
  return {
    calls,
    track: (method) => (...args) => {
      calls.push({ method, args });
      return true;
    }
  };
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  QUIRK_TEST_REGISTRY,
  createCallTracker,
  createTestDevice,
  dmCreateCallTracker,
  dmCreateTestDevice,
  dmLightCapabilities,
  dmMockLog,
  lightCapabilities,
  mockLog,
  mockTimers
});
//# sourceMappingURL=test-helpers.js.map
