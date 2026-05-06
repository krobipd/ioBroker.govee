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
var govee_constants_exports = {};
__export(govee_constants_exports, {
  GOVEE_APP_BASE_URL: () => GOVEE_APP_BASE_URL,
  GOVEE_APP_VERSION: () => GOVEE_APP_VERSION,
  GOVEE_CLIENT_TYPE: () => GOVEE_CLIENT_TYPE,
  GOVEE_USER_AGENT: () => GOVEE_USER_AGENT,
  deriveGoveeClientId: () => deriveGoveeClientId
});
module.exports = __toCommonJS(govee_constants_exports);
var import_uuid = require("uuid");
const GOVEE_APP_VERSION = "7.4.30";
const GOVEE_CLIENT_TYPE = "1";
const GOVEE_USER_AGENT = `GoveeHome/${GOVEE_APP_VERSION} (com.ihoment.GoVeeSensor; build:8; iOS 26.5.0) Alamofire/5.11.0`;
const GOVEE_APP_BASE_URL = "https://app2.govee.com";
function deriveGoveeClientId(email) {
  const seed = (email != null ? email : "").trim().toLowerCase() || "anonymous";
  return (0, import_uuid.v5)(seed, import_uuid.NIL).replace(/-/g, "");
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  GOVEE_APP_BASE_URL,
  GOVEE_APP_VERSION,
  GOVEE_CLIENT_TYPE,
  GOVEE_USER_AGENT,
  deriveGoveeClientId
});
//# sourceMappingURL=govee-constants.js.map
