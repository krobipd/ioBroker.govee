import { errMessage } from "./types";
import type { GoveeMqttClient } from "./govee-mqtt-client";
import { VERIFICATION_REQUEST_THROTTLE_MS } from "./timing-constants";

/**
 * Host-Interface für MessageRouter.
 *
 * Pattern analog SnapshotHandler/GroupFanoutHandler. main.ts bleibt
 * schlank, der onMessage/sendTo-Pfad ist isoliert testbar.
 */
export interface MessageRouterHost {
  /** Adapter logger. */
  log: ioBroker.Logger;
  /** Liefert die Adapter-Konfiguration für den runMqttAuthAction-Pfad. */
  getConfig: () => { goveeEmail: string; goveePassword: string; mqttVerificationCode?: string };
  /** Sendet die JSON-Response zurück an den Caller (sendMessageResponse-Pfad). */
  sendResponse: (obj: ioBroker.Message, data: unknown) => void;
  /** Factory für ein One-Shot-MqttClient (für Login-Test). */
  createMqttProbeClient: () => GoveeMqttClient;
  /** Liefert die Liste der Devices die Segmente haben (für getSegmentDevices). */
  getSegmentDeviceList: () => Array<{ value: string; label: string }>;
  /** Wizard-Step-Routing — main.ts behält den Wizard-State. */
  runWizardStep: (action: string, deviceKey: string) => Promise<Record<string, unknown>>;
}

/**
 * Router für ioBroker.Message events (sendTo aus dem Admin-UI).
 *
 * Dispatcht 3 Commands:
 *  - `getSegmentDevices` — selectSendTo-Datenquelle für den Wizard
 *  - `segmentWizard` — Wizard-Step (start/yes/no/done/abort)
 *  - `mqttAuth` — Login-Test + Verification-Code-Anforderung
 */
export class MessageRouter {
  /** Last time `requestCode` was triggered — guards against double-click email spam. */
  private lastVerificationRequestMs = 0;

  /**
   * @param host Adapter dependencies via Host-Interface
   */
  constructor(private readonly host: MessageRouterHost) {}

  /**
   * Sync entry-point — registered as `this.on("message", ...)`. Wraps
   * the async handler in a catch so unhandled rejections können den
   * Adapter nicht crashen.
   *
   * @param obj Inkommende ioBroker-Message
   */
  onMessage(obj: ioBroker.Message): void {
    if (!obj?.command) {
      return;
    }
    this.handleMessage(obj).catch(e => {
      this.host.log.warn(`onMessage handler crashed for ${obj.command}: ${errMessage(e)}`);
      this.host.sendResponse(obj, { error: e instanceof Error ? e.message : String(e) });
    });
  }

  /**
   * Async handler — dispatcht zu den 3 Sub-Handlern.
   *
   * @param obj Inkommende ioBroker-Message
   */
  private async handleMessage(obj: ioBroker.Message): Promise<void> {
    try {
      if (obj.command === "getSegmentDevices") {
        this.host.sendResponse(obj, this.host.getSegmentDeviceList());
        return;
      }
      if (obj.command === "segmentWizard") {
        const payload = (obj.message ?? {}) as { action?: string; device?: string };
        const response = await this.host.runWizardStep(payload.action ?? "", payload.device ?? "");
        this.host.sendResponse(obj, response);
        return;
      }
      if (obj.command === "mqttAuth") {
        const payload = (obj.message ?? {}) as { action?: string };
        const response = await this.runMqttAuthAction(payload.action ?? "");
        this.host.sendResponse(obj, response);
        return;
      }
    } catch (e) {
      this.host.log.warn(`onMessage failed for ${obj.command}: ${errMessage(e)}`);
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
  private async runMqttAuthAction(action: string): Promise<{ result: string }> {
    const config = this.host.getConfig();
    if (!config.goveeEmail || !config.goveePassword) {
      return { result: "Email + Passwort in den Adapter-Einstellungen nötig." };
    }
    if (action === "test") {
      const probe = this.host.createMqttProbeClient();
      probe.setVerificationCode(config.mqttVerificationCode ?? "");
      try {
        let connected = false;
        await probe.connect(
          () => {},
          isConnected => {
            connected = isConnected;
          },
        );
        probe.disconnect();
        return {
          result: connected
            ? "Login erfolgreich — Echtzeit-Status-Updates aktiv."
            : "Login angenommen, MQTT-Verbindung steht aber noch nicht — Adapter neu starten.",
        };
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (/Verification required/i.test(msg)) {
          return {
            result:
              "Govee verlangt 2-Faktor-Bestätigung. Bitte 'Verifizierungs-Code anfordern' klicken, Code aus der E-Mail eintragen und Speichern.",
          };
        }
        if (/Verification code invalid/i.test(msg)) {
          return { result: "2-Faktor-Code ungültig oder abgelaufen — bitte einen neuen Code anfordern." };
        }
        if (/email not registered/i.test(msg)) {
          return { result: "Diese E-Mail ist bei Govee nicht registriert." };
        }
        if (/Login failed/i.test(msg)) {
          return { result: "Passwort wurde von Govee abgelehnt." };
        }
        if (/Rate limited/i.test(msg)) {
          return { result: "Govee meldet Rate-Limit — bitte später erneut versuchen." };
        }
        if (/Account temporarily locked/i.test(msg)) {
          return { result: "Govee-Account vorübergehend gesperrt — Govee Home App öffnen und Status prüfen." };
        }
        return { result: `Login fehlgeschlagen: ${msg}` };
      }
    }
    if (action === "requestCode") {
      const now = Date.now();
      if (now - this.lastVerificationRequestMs < VERIFICATION_REQUEST_THROTTLE_MS) {
        const wait = Math.ceil((VERIFICATION_REQUEST_THROTTLE_MS - (now - this.lastVerificationRequestMs)) / 1000);
        return { result: `Bitte ${wait}s warten — gerade wurde schon ein Code angefordert.` };
      }
      this.lastVerificationRequestMs = now;
      const probe = this.host.createMqttProbeClient();
      try {
        await probe.requestVerificationCode();
        return { result: "Code wurde an deine Govee-E-Mail-Adresse gesendet (Spam-Ordner prüfen)." };
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        return { result: `Govee hat den Code-Versand abgelehnt: ${msg}` };
      }
    }
    return { result: `Unbekannte Aktion '${action}'.` };
  }
}
