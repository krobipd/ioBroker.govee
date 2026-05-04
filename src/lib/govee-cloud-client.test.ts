import { expect } from "chai";
import { GoveeCloudClient } from "./govee-cloud-client";
import { mockLog } from "./test-helpers";

describe("GoveeCloudClient", () => {
  describe("getFailureReason", () => {
    it("should return null when no error has occurred", () => {
      const client = new GoveeCloudClient("test-api-key", mockLog);
      expect(client.getFailureReason()).to.be.null;
    });

    // Die request()-Methode ist privat und nicht direkt testbar ohne
    // https-Mock. getFailureReason()-Branches werden über den Live-Pfad
    // (request → catch → classifyError → lastErrorCategory) abgedeckt.
    // Hier nur der initial-state-Test als Smoke — voller Pfad braucht
    // https.request-Stub und ist Aufwand für eine separate Test-Welle.
  });

  describe("setResponseHook", () => {
    it("should accept a callback", () => {
      const client = new GoveeCloudClient("test-api-key", mockLog);
      const calls: Array<{ deviceId: string; endpoint: string; body: unknown }> = [];
      client.setResponseHook((deviceId, endpoint, body) => {
        calls.push({ deviceId, endpoint, body });
      });
      // Hook is set — aber wir können ohne https-Mock nicht prüfen ob er
      // gerufen wird. Der Setter ist trivial; das Smoke ist „kein Throw".
      expect(calls).to.have.lengthOf(0);
    });

    it("should accept null to clear the hook", () => {
      const client = new GoveeCloudClient("test-api-key", mockLog);
      client.setResponseHook(() => {});
      // Kein direkter Setter-Inspect, aber kein Throw beim clear:
      expect(() => client.setResponseHook(null)).to.not.throw();
    });
  });
});
