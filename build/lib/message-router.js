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
var message_router_exports = {};
__export(message_router_exports, {
  MessageRouter: () => MessageRouter
});
module.exports = __toCommonJS(message_router_exports);
var import_types = require("./types");
var import_timing_constants = require("./timing-constants");
class MessageRouter {
  /**
   * @param host Adapter dependencies via Host-Interface
   */
  constructor(host) {
    this.host = host;
  }
  /** Last time `requestCode` was triggered — guards against double-click email spam. */
  lastVerificationRequestMs = 0;
  /**
   * Sync entry-point — registered as `this.on("message", ...)`. Wraps
   * the async handler in a catch so unhandled rejections können den
   * Adapter nicht crashen.
   *
   * @param obj Inkommende ioBroker-Message
   */
  onMessage(obj) {
    if (!(obj == null ? void 0 : obj.command)) {
      return;
    }
    this.handleMessage(obj).catch((e) => {
      this.host.log.warn(`onMessage handler crashed for ${obj.command}: ${(0, import_types.errMessage)(e)}`);
      this.host.sendResponse(obj, { error: e instanceof Error ? e.message : String(e) });
    });
  }
  /**
   * Async handler — dispatcht zu den 3 Sub-Handlern.
   *
   * @param obj Inkommende ioBroker-Message
   */
  async handleMessage(obj) {
    var _a, _b, _c, _d, _e;
    try {
      if (obj.command === "getSegmentDevices") {
        this.host.sendResponse(obj, this.host.getSegmentDeviceList());
        return;
      }
      if (obj.command === "segmentWizard") {
        const payload = (_a = obj.message) != null ? _a : {};
        const response = await this.host.runWizardStep((_b = payload.action) != null ? _b : "", (_c = payload.device) != null ? _c : "");
        this.host.sendResponse(obj, response);
        return;
      }
      if (obj.command === "mqttAuth") {
        const payload = (_d = obj.message) != null ? _d : {};
        const response = await this.runMqttAuthAction((_e = payload.action) != null ? _e : "");
        this.host.sendResponse(obj, response);
        return;
      }
    } catch (e) {
      this.host.log.warn(`onMessage failed for ${obj.command}: ${(0, import_types.errMessage)(e)}`);
      this.host.sendResponse(obj, { error: e instanceof Error ? e.message : String(e) });
    }
  }
  /**
   * Handle the `mqttAuth` onMessage commands.
   *
   * Two actions:
   *   - `test`        — try a one-shot login mit der aktuellen Settings-Combo
   *                     und liefere ein einzelnes user-readable Ergebnis.
   *   - `requestCode` — POST an /verification, Govee mailt fresh code.
   *                     30s in-memory throttle gegen double-click email-spam.
   *
   * @param action Action-Name aus dem jsonConfig sendTo-Button
   */
  async runMqttAuthAction(action) {
    var _a;
    const config = this.host.getConfig();
    if (!config.goveeEmail || !config.goveePassword) {
      return { result: "Email + Passwort in den Adapter-Einstellungen n\xF6tig." };
    }
    if (action === "test") {
      const probe = this.host.createMqttProbeClient();
      probe.setVerificationCode((_a = config.mqttVerificationCode) != null ? _a : "");
      try {
        let connected = false;
        await probe.connect(
          () => {
          },
          (isConnected) => {
            connected = isConnected;
          }
        );
        probe.disconnect();
        return {
          result: connected ? "Login erfolgreich \u2014 Echtzeit-Status-Updates aktiv." : "Login angenommen, MQTT-Verbindung steht aber noch nicht \u2014 Adapter neu starten."
        };
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (/Verification required/i.test(msg)) {
          return {
            result: "Govee verlangt 2-Faktor-Best\xE4tigung. Bitte 'Verifizierungs-Code anfordern' klicken, Code aus der E-Mail eintragen und Speichern."
          };
        }
        if (/Verification code invalid/i.test(msg)) {
          return { result: "2-Faktor-Code ung\xFCltig oder abgelaufen \u2014 bitte einen neuen Code anfordern." };
        }
        if (/email not registered/i.test(msg)) {
          return { result: "Diese E-Mail ist bei Govee nicht registriert." };
        }
        if (/Login failed/i.test(msg)) {
          return { result: "Passwort wurde von Govee abgelehnt." };
        }
        if (/Rate limited/i.test(msg)) {
          return { result: "Govee meldet Rate-Limit \u2014 bitte sp\xE4ter erneut versuchen." };
        }
        if (/Account temporarily locked/i.test(msg)) {
          return { result: "Govee-Account vor\xFCbergehend gesperrt \u2014 Govee Home App \xF6ffnen und Status pr\xFCfen." };
        }
        return { result: `Login fehlgeschlagen: ${msg}` };
      }
    }
    if (action === "requestCode") {
      const now = Date.now();
      if (now - this.lastVerificationRequestMs < import_timing_constants.VERIFICATION_REQUEST_THROTTLE_MS) {
        const wait = Math.ceil((import_timing_constants.VERIFICATION_REQUEST_THROTTLE_MS - (now - this.lastVerificationRequestMs)) / 1e3);
        return { result: `Bitte ${wait}s warten \u2014 gerade wurde schon ein Code angefordert.` };
      }
      this.lastVerificationRequestMs = now;
      const probe = this.host.createMqttProbeClient();
      try {
        await probe.requestVerificationCode();
        return { result: "Code wurde an deine Govee-E-Mail-Adresse gesendet (Spam-Ordner pr\xFCfen)." };
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        return { result: `Govee hat den Code-Versand abgelehnt: ${msg}` };
      }
    }
    return { result: `Unbekannte Aktion '${action}'.` };
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  MessageRouter
});
//# sourceMappingURL=message-router.js.map
