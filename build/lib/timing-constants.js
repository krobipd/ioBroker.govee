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
var timing_constants_exports = {};
__export(timing_constants_exports, {
  APP_API_INITIAL_DELAY_MS: () => APP_API_INITIAL_DELAY_MS,
  APP_API_POLL_INTERVAL_MS: () => APP_API_POLL_INTERVAL_MS,
  CACHE_MAX_AGE_DAYS: () => CACHE_MAX_AGE_DAYS,
  CLOUD_RETRY_TRANSIENT_MS: () => CLOUD_RETRY_TRANSIENT_MS,
  LAN_INITIAL_WAIT_MS: () => LAN_INITIAL_WAIT_MS,
  LAN_SCAN_INTERVAL_MS: () => LAN_SCAN_INTERVAL_MS,
  MQTT_MAX_AUTH_FAILURES: () => MQTT_MAX_AUTH_FAILURES,
  MQTT_RECONNECT_BASE_MS: () => MQTT_RECONNECT_BASE_MS,
  MQTT_RECONNECT_MAX_MS: () => MQTT_RECONNECT_MAX_MS,
  READY_TIMEOUT_MS: () => READY_TIMEOUT_MS,
  VERIFICATION_REQUEST_THROTTLE_MS: () => VERIFICATION_REQUEST_THROTTLE_MS
});
module.exports = __toCommonJS(timing_constants_exports);
const MQTT_RECONNECT_BASE_MS = 5e3;
const MQTT_RECONNECT_MAX_MS = 3e5;
const MQTT_MAX_AUTH_FAILURES = 3;
const LAN_SCAN_INTERVAL_MS = 3e4;
const LAN_INITIAL_WAIT_MS = 3e3;
const APP_API_POLL_INTERVAL_MS = 2 * 60 * 1e3;
const APP_API_INITIAL_DELAY_MS = 5e3;
const READY_TIMEOUT_MS = 6e4;
const VERIFICATION_REQUEST_THROTTLE_MS = 3e4;
const CLOUD_RETRY_TRANSIENT_MS = 5 * 60 * 1e3;
const CACHE_MAX_AGE_DAYS = 14;
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  APP_API_INITIAL_DELAY_MS,
  APP_API_POLL_INTERVAL_MS,
  CACHE_MAX_AGE_DAYS,
  CLOUD_RETRY_TRANSIENT_MS,
  LAN_INITIAL_WAIT_MS,
  LAN_SCAN_INTERVAL_MS,
  MQTT_MAX_AUTH_FAILURES,
  MQTT_RECONNECT_BASE_MS,
  MQTT_RECONNECT_MAX_MS,
  READY_TIMEOUT_MS,
  VERIFICATION_REQUEST_THROTTLE_MS
});
//# sourceMappingURL=timing-constants.js.map
