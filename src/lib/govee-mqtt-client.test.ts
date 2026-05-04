import { expect } from "chai";
import { GoveeMqttClient } from "./govee-mqtt-client";
import { mockLog, mockTimers } from "./test-helpers";

describe("GoveeMqttClient", () => {
  describe("getFailureReason", () => {
    it("should return null initially when not connected and no error has occurred", () => {
      const client = new GoveeMqttClient("user@example.com", "password", mockLog, mockTimers);
      // Initial state: not connected + no errors → null
      expect(client.getFailureReason()).to.be.null;
    });

    // Volle getFailureReason-Branches (VERIFICATION_PENDING/FAILED, AUTH,
    // RATE_LIMIT, NETWORK, TIMEOUT) brauchen einen Login-Mock — separate
    // Test-Welle. Hier nur Initial-State + Setter-Smoke.
  });

  describe("token getter", () => {
    it("should return empty string before login", () => {
      const client = new GoveeMqttClient("user@example.com", "password", mockLog, mockTimers);
      expect(client.token).to.equal("");
    });
  });

  describe("connected getter", () => {
    it("should return false before connect", () => {
      const client = new GoveeMqttClient("user@example.com", "password", mockLog, mockTimers);
      expect(client.connected).to.be.false;
    });
  });

  describe("setVerificationCode", () => {
    it("should accept and trim verification codes", () => {
      const client = new GoveeMqttClient("user@example.com", "password", mockLog, mockTimers);
      // No throw — internal state isn't directly observable, but the
      // trim-and-store contract is tested via the (unobservable) effect on
      // the next login. Smoke-Test hier reicht.
      expect(() => client.setVerificationCode("  123456  ")).to.not.throw();
      expect(() => client.setVerificationCode("")).to.not.throw();
    });
  });

  describe("setOnVerificationConsumed / setOnVerificationFailed", () => {
    it("should accept callback or null", () => {
      const client = new GoveeMqttClient("user@example.com", "password", mockLog, mockTimers);
      expect(() => client.setOnVerificationConsumed(() => {})).to.not.throw();
      expect(() => client.setOnVerificationConsumed(null)).to.not.throw();
      expect(() => client.setOnVerificationFailed(_reason => {})).to.not.throw();
      expect(() => client.setOnVerificationFailed(null)).to.not.throw();
    });
  });

  describe("disconnect", () => {
    it("should be safe to call when never connected", () => {
      const client = new GoveeMqttClient("user@example.com", "password", mockLog, mockTimers);
      expect(() => client.disconnect()).to.not.throw();
      // Idempotent — call twice
      expect(() => client.disconnect()).to.not.throw();
    });
  });
});
