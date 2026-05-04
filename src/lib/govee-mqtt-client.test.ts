import { expect } from "chai";
import { GoveeMqttClient } from "./govee-mqtt-client";
import { type HttpRequestOptions, type HttpsRequestFn } from "./http-client";
import { mockLog, mockTimers } from "./test-helpers";

/**
 * Timer-Mock der NICHT sofort feuert — wichtig für connect()-Tests, sonst
 * würde scheduleReconnect → setTimeout → sofort callback → erneuter
 * connect → infinite loop. Hier nur queue, never call.
 */
const noopTimers = {
  setInterval: () => undefined,
  clearInterval: () => undefined,
  setTimeout: () => undefined,
  clearTimeout: () => undefined,
} as never;

interface FakeHttpsRequest {
  fn: HttpsRequestFn;
  calls: HttpRequestOptions[];
}

function makeFakeHttps(respond: (call: HttpRequestOptions, idx: number) => unknown): FakeHttpsRequest {
  const calls: HttpRequestOptions[] = [];
  const fn: HttpsRequestFn = <T>(options: HttpRequestOptions): Promise<T> => {
    calls.push(options);
    const result = respond(options, calls.length - 1);
    if (result instanceof Error) {
      return Promise.reject(result);
    }
    return Promise.resolve(result as T);
  };
  return { fn, calls };
}

describe("GoveeMqttClient", () => {
  describe("getFailureReason", () => {
    it("should return null initially when not connected and no error has occurred", () => {
      const client = new GoveeMqttClient("user@example.com", "password", mockLog, mockTimers);
      expect(client.getFailureReason()).to.be.null;
    });
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
      expect(() => client.disconnect()).to.not.throw();
    });
  });

  describe("requestVerificationCode", () => {
    it("should POST to /verification with email + type=8", async () => {
      const fake = makeFakeHttps(() => ({}));
      const client = new GoveeMqttClient("test@example.com", "secret", mockLog, mockTimers, fake.fn);
      await client.requestVerificationCode();
      expect(fake.calls).to.have.lengthOf(1);
      expect(fake.calls[0].method).to.equal("POST");
      expect(fake.calls[0].url).to.include("/account/rest/account/v1/verification");
      const body = fake.calls[0].body as { type: number; email: string };
      expect(body.type).to.equal(8);
      expect(body.email).to.equal("test@example.com");
    });

    it("should set Govee headers (User-Agent + clientId etc.)", async () => {
      const fake = makeFakeHttps(() => ({}));
      const client = new GoveeMqttClient("test@example.com", "secret", mockLog, mockTimers, fake.fn);
      await client.requestVerificationCode();
      const headers = fake.calls[0].headers;
      expect(headers["User-Agent"]).to.match(/GoveeHome/);
      expect(headers.clientId).to.be.a("string");
      expect(headers.appVersion).to.be.a("string");
    });

    it("should propagate errors", async () => {
      const fake = makeFakeHttps(() => new Error("HTTP 500"));
      const client = new GoveeMqttClient("test@example.com", "secret", mockLog, mockTimers, fake.fn);
      try {
        await client.requestVerificationCode();
        expect.fail("expected throw");
      } catch (e) {
        expect((e as Error).message).to.equal("HTTP 500");
      }
    });
  });

  describe("connect — login error paths", () => {
    it("should silently return on 454 (verification pending) without code, fire onVerificationFailed('pending')", async () => {
      const fake = makeFakeHttps(() => ({ status: 454, message: "verification required" }));
      const client = new GoveeMqttClient("test@example.com", "secret", mockLog, noopTimers, fake.fn);
      let verificationFailedReason: string | null = null;
      client.setOnVerificationFailed(reason => {
        verificationFailedReason = reason;
      });
      let connectionCalls = 0;
      let lastConnectedFlag: boolean | null = null;
      await client.connect(
        () => {},
        connected => {
          connectionCalls++;
          lastConnectedFlag = connected;
        },
      );
      expect(verificationFailedReason).to.equal("pending");
      expect(connectionCalls).to.be.greaterThan(0);
      expect(lastConnectedFlag).to.be.false;
      expect(client.getFailureReason()).to.equal("Govee asked for verification — request a code in adapter settings");
    });

    it("should silently return on 455 (verification failed) and fire onVerificationFailed('failed')", async () => {
      const fake = makeFakeHttps(() => ({ status: 455, message: "verification code invalid" }));
      const client = new GoveeMqttClient("test@example.com", "secret", mockLog, noopTimers, fake.fn);
      let verificationFailedReason: string | null = null;
      client.setOnVerificationFailed(reason => {
        verificationFailedReason = reason;
      });
      await client.connect(
        () => {},
        () => {},
      );
      expect(verificationFailedReason).to.equal("failed");
      expect(client.getFailureReason()).to.equal("verification code rejected — request a fresh code");
    });

    it("should treat 454 with verification code submitted as VERIFICATION_FAILED (code expired)", async () => {
      const fake = makeFakeHttps(() => ({ status: 454, message: "verification required" }));
      const client = new GoveeMqttClient("test@example.com", "secret", mockLog, noopTimers, fake.fn);
      client.setVerificationCode("123456");
      let verificationFailedReason: string | null = null;
      client.setOnVerificationFailed(reason => {
        verificationFailedReason = reason;
      });
      await client.connect(
        () => {},
        () => {},
      );
      // Status 454 + code-was-sent → "Verification code invalid or expired" → classifyError → VERIFICATION_FAILED
      expect(verificationFailedReason).to.equal("failed");
      expect(client.getFailureReason()).to.equal("verification code rejected — request a fresh code");
    });

    it("should set AUTH failure reason on 401", async () => {
      const fake = makeFakeHttps(() => ({ status: 401, message: "wrong password" }));
      const client = new GoveeMqttClient("test@example.com", "secret", mockLog, noopTimers, fake.fn);
      await client.connect(
        () => {},
        () => {},
      );
      expect(client.getFailureReason()).to.equal("login failed (will retry)");
    });

    it("should report 'login rejected — check email/password' after 3 consecutive AUTH failures", async () => {
      const fake = makeFakeHttps(() => ({ status: 401, message: "wrong password" }));
      const client = new GoveeMqttClient("test@example.com", "secret", mockLog, noopTimers, fake.fn);
      // 3× connect → authFailCount erreicht MAX_AUTH_FAILURES
      await client.connect(
        () => {},
        () => {},
      );
      await client.connect(
        () => {},
        () => {},
      );
      await client.connect(
        () => {},
        () => {},
      );
      expect(client.getFailureReason()).to.equal("login rejected — check email/password");
    });

    it("should set RATE_LIMIT failure reason on 429", async () => {
      const fake = makeFakeHttps(() => ({ status: 429, message: "too many requests" }));
      const client = new GoveeMqttClient("test@example.com", "secret", mockLog, noopTimers, fake.fn);
      await client.connect(
        () => {},
        () => {},
      );
      expect(client.getFailureReason()).to.equal("rate-limited by Govee — will retry");
    });

    it("should set NETWORK failure reason on ECONNREFUSED", async () => {
      const err: Error & { code?: string } = new Error("ECONNREFUSED");
      err.code = "ECONNREFUSED";
      const fake = makeFakeHttps(() => err);
      const client = new GoveeMqttClient("test@example.com", "secret", mockLog, noopTimers, fake.fn);
      await client.connect(
        () => {},
        () => {},
      );
      expect(client.getFailureReason()).to.equal("cannot reach Govee servers — will retry");
    });

    it("should fire onVerificationConsumed when login succeeds with a code", async () => {
      // Login succeeds (returns client object) — wir kommen also über die 454-Branch hinaus.
      // getIotKey wird der zweite Call sein und FAILT mit network — darum kommt mqtt.connect
      // nie ins Spiel, aber onVerificationConsumed wurde schon vor dem getIotKey-Aufruf gefeuert.
      let callIdx = 0;
      const fake = makeFakeHttps((_opts, _idx) => {
        if (callIdx++ === 0) {
          return {
            client: {
              accountId: "acc-123",
              topic: "GA/account/topic-xyz",
              token: "bearer-token-abc",
              token_expire_cycle: 3600,
            },
          };
        }
        return new Error("network");
      });
      const client = new GoveeMqttClient("test@example.com", "secret", mockLog, noopTimers, fake.fn);
      client.setVerificationCode("123456");
      let consumedFired = false;
      client.setOnVerificationConsumed(() => {
        consumedFired = true;
      });
      await client.connect(
        () => {},
        () => {},
      );
      expect(consumedFired).to.be.true;
      expect(client.token).to.equal("bearer-token-abc");
    });

    it("should set lastErrorCategory back to null after VERIFICATION_PENDING when next login succeeds", async () => {
      // Erst: 454-PENDING gesetzt
      let callIdx = 0;
      const fake = makeFakeHttps((_opts, _idx) => {
        const i = callIdx++;
        if (i === 0) {
          return { status: 454, message: "verification required" };
        }
        // Nächste Calls: erfolgreicher login + getIotKey-fail
        if (i === 1) {
          return {
            client: {
              accountId: "acc-1",
              topic: "GA/topic-1",
              token: "tok-1",
              token_expire_cycle: 3600,
            },
          };
        }
        return new Error("network");
      });
      const client = new GoveeMqttClient("test@example.com", "secret", mockLog, noopTimers, fake.fn);
      await client.connect(
        () => {},
        () => {},
      );
      expect(client.getFailureReason()).to.match(/verification/i);
      // Login klappt jetzt — getIotKey-Fail produziert eine NETWORK-category (oder UNKNOWN)
      await client.connect(
        () => {},
        () => {},
      );
      // login war erfolgreich; iot-key-call schlug fehl → category != VERIFICATION_PENDING
      expect(client.getFailureReason()).to.not.equal("Govee asked for verification — request a code in adapter settings");
    });
  });

  describe("connect — login response validation", () => {
    it("should treat missing accountId in successful login as failure", async () => {
      const fake = makeFakeHttps(() => ({
        client: {
          // accountId missing
          topic: "GA/account/topic-xyz",
          token: "bearer",
          token_expire_cycle: 3600,
        },
      }));
      const client = new GoveeMqttClient("test@example.com", "secret", mockLog, noopTimers, fake.fn);
      let lastConnectedFlag: boolean | null = null;
      await client.connect(
        () => {},
        connected => {
          lastConnectedFlag = connected;
        },
      );
      expect(lastConnectedFlag).to.be.false;
    });

    it("should treat missing topic in successful login as failure", async () => {
      const fake = makeFakeHttps(() => ({
        client: {
          accountId: "acc",
          // topic missing
          token: "bearer",
          token_expire_cycle: 3600,
        },
      }));
      const client = new GoveeMqttClient("test@example.com", "secret", mockLog, noopTimers, fake.fn);
      let lastConnectedFlag: boolean | null = null;
      await client.connect(
        () => {},
        connected => {
          lastConnectedFlag = connected;
        },
      );
      expect(lastConnectedFlag).to.be.false;
    });
  });
});
