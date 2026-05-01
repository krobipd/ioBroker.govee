import { expect } from "chai";
import { DiagnosticsCollector } from "./diagnostics";
import { _resetDeviceRegistry, initDeviceRegistry } from "./device-registry";
import type { GoveeDevice } from "./types";

function makeDevice(overrides: Partial<GoveeDevice> = {}): GoveeDevice {
  return {
    sku: "H61BE",
    deviceId: "23:3E:CA:39:32:35:1D:6F",
    name: "Test Light",
    type: "devices.types.light",
    capabilities: [],
    scenes: [],
    diyScenes: [],
    snapshots: [],
    sceneLibrary: [],
    musicLibrary: [],
    diyLibrary: [],
    skuFeatures: null,
    state: { online: true },
    channels: { lan: true, mqtt: true, cloud: true },
    ...overrides,
  };
}

describe("DiagnosticsCollector", () => {
  describe("addLog", () => {
    it("appends entries with timestamp + level + msg", () => {
      const c = new DiagnosticsCollector();
      c.addLog("dev1", "warn", "First warning");
      const result = c.generate(makeDevice({ deviceId: "dev1" }), "2.0.0");
      const logs = result.recentLogs as Array<Record<string, unknown>>;
      expect(logs).to.have.lengthOf(1);
      expect(logs[0].level).to.equal("warn");
      expect(logs[0].msg).to.equal("First warning");
      expect(logs[0].ts).to.match(/^\d{4}-\d{2}-\d{2}T/);
    });

    it("bounds at 20 entries — newest 20 retained", () => {
      const c = new DiagnosticsCollector();
      for (let i = 0; i < 25; i++) {
        c.addLog("dev1", "info", `entry ${i}`);
      }
      const result = c.generate(makeDevice({ deviceId: "dev1" }), "2.0.0");
      const logs = result.recentLogs as Array<{ msg: string }>;
      expect(logs).to.have.lengthOf(20);
      expect(logs[0].msg).to.equal("entry 5");
      expect(logs[19].msg).to.equal("entry 24");
    });

    it("ignores empty/non-string deviceId", () => {
      const c = new DiagnosticsCollector();
      c.addLog("", "info", "msg");
      c.addLog(undefined as never, "info", "msg");
      const result = c.generate(makeDevice(), "2.0.0");
      expect(result.recentLogs).to.deep.equal([]);
    });

    it("ignores non-string msg without crashing", () => {
      const c = new DiagnosticsCollector();
      c.addLog("dev1", "info", 42 as never);
      c.addLog("dev1", "info", { obj: 1 } as never);
      const result = c.generate(makeDevice({ deviceId: "dev1" }), "2.0.0");
      expect(result.recentLogs).to.deep.equal([]);
    });
  });

  describe("addMqttPacket", () => {
    it("captures packets with topic + hex", () => {
      const c = new DiagnosticsCollector();
      c.addMqttPacket("dev1", "GA/abc/123", "qqgFAQEEAAAAA=");
      const result = c.generate(makeDevice({ deviceId: "dev1" }), "2.0.0");
      const packets = result.lastMqttPackets as Array<Record<string, unknown>>;
      expect(packets).to.have.lengthOf(1);
      expect(packets[0].topic).to.equal("GA/abc/123");
      expect(packets[0].hex).to.equal("qqgFAQEEAAAAA=");
    });

    it("bounds at 10 packets — newest 10 retained", () => {
      const c = new DiagnosticsCollector();
      for (let i = 0; i < 15; i++) {
        c.addMqttPacket("dev1", "GA/topic", `hex${i}`);
      }
      const result = c.generate(makeDevice({ deviceId: "dev1" }), "2.0.0");
      const packets = result.lastMqttPackets as Array<{ hex: string }>;
      expect(packets).to.have.lengthOf(10);
      expect(packets[0].hex).to.equal("hex5");
      expect(packets[9].hex).to.equal("hex14");
    });

    it("rejects empty hex strings", () => {
      const c = new DiagnosticsCollector();
      c.addMqttPacket("dev1", "topic", "");
      const result = c.generate(makeDevice({ deviceId: "dev1" }), "2.0.0");
      expect(result.lastMqttPackets).to.deep.equal([]);
    });
  });

  describe("setApiResponse", () => {
    it("stores last response per endpoint", () => {
      const c = new DiagnosticsCollector();
      c.setApiResponse("dev1", "/api/state", { code: 200, foo: "bar" });
      const result = c.generate(makeDevice({ deviceId: "dev1" }), "2.0.0");
      const last = result.lastApiResponse as Record<string, unknown>;
      const entry = last["/api/state"] as Record<string, unknown>;
      expect(entry).to.exist;
      expect(entry.body).to.deep.equal({ code: 200, foo: "bar" });
      expect(entry.endpoint).to.equal("/api/state");
    });

    it("overwrites the previous response for the same endpoint", () => {
      const c = new DiagnosticsCollector();
      c.setApiResponse("dev1", "/api/state", { v: 1 });
      c.setApiResponse("dev1", "/api/state", { v: 2 });
      const result = c.generate(makeDevice({ deviceId: "dev1" }), "2.0.0");
      const last = result.lastApiResponse as Record<string, { body: unknown }>;
      expect(last["/api/state"].body).to.deep.equal({ v: 2 });
    });

    it("evicts oldest endpoint when more than 5 are tracked", () => {
      const c = new DiagnosticsCollector();
      c.setApiResponse("dev1", "/a", { v: 1 });
      c.setApiResponse("dev1", "/b", { v: 1 });
      c.setApiResponse("dev1", "/c", { v: 1 });
      c.setApiResponse("dev1", "/d", { v: 1 });
      c.setApiResponse("dev1", "/e", { v: 1 });
      c.setApiResponse("dev1", "/f", { v: 1 });
      const result = c.generate(makeDevice({ deviceId: "dev1" }), "2.0.0");
      const last = result.lastApiResponse as Record<string, unknown>;
      expect(last["/a"]).to.be.undefined;
      expect(last["/f"]).to.exist;
    });

    it("truncates large bodies with marker", () => {
      const c = new DiagnosticsCollector();
      const big = "x".repeat(20000);
      c.setApiResponse("dev1", "/api/big", { huge: big });
      const result = c.generate(makeDevice({ deviceId: "dev1" }), "2.0.0");
      const last = result.lastApiResponse as Record<string, { body: unknown }>;
      expect(typeof last["/api/big"].body).to.equal("string");
      expect(last["/api/big"].body as string).to.include("<truncated");
    });

    it("falls back to String() when body is non-serialisable", () => {
      const c = new DiagnosticsCollector();
      const cyclic: Record<string, unknown> = {};
      cyclic.self = cyclic;
      c.setApiResponse("dev1", "/api/cycle", cyclic);
      const result = c.generate(makeDevice({ deviceId: "dev1" }), "2.0.0");
      const last = result.lastApiResponse as Record<string, { body: unknown }>;
      expect(typeof last["/api/cycle"].body).to.equal("string");
    });
  });

  describe("forget / clear", () => {
    it("forget(deviceId) drops only that device's buffers", () => {
      const c = new DiagnosticsCollector();
      c.addLog("dev1", "info", "a");
      c.addLog("dev2", "info", "b");
      c.forget("dev1");
      expect(c.generate(makeDevice({ deviceId: "dev1" }), "2.0.0").recentLogs).to.deep.equal([]);
      expect((c.generate(makeDevice({ deviceId: "dev2" }), "2.0.0").recentLogs as Array<unknown>).length).to.equal(1);
    });

    it("clear() empties all buffers", () => {
      const c = new DiagnosticsCollector();
      c.addLog("dev1", "info", "a");
      c.addMqttPacket("dev2", "topic", "hex");
      c.clear();
      expect(c.generate(makeDevice({ deviceId: "dev1" }), "2.0.0").recentLogs).to.deep.equal([]);
      expect(c.generate(makeDevice({ deviceId: "dev2" }), "2.0.0").lastMqttPackets).to.deep.equal([]);
    });
  });

  describe("generate — output shape", () => {
    beforeEach(() => {
      initDeviceRegistry({
        data: {
          devices: {
            H6141: {
              name: "LED Strip",
              type: "light",
              status: "seed",
              quirks: { brokenPlatformApi: true },
            },
          },
        } as never,
        experimental: true,
      });
    });
    afterEach(() => _resetDeviceRegistry());

    it("contains all v1.x top-level fields plus the v2 ring buffers", () => {
      const c = new DiagnosticsCollector();
      const result = c.generate(makeDevice(), "2.0.0");
      const keys = Object.keys(result).sort();
      expect(keys).to.include.members([
        "adapter",
        "version",
        "exportedAt",
        "device",
        "capabilities",
        "scenes",
        "diyScenes",
        "snapshots",
        "sceneLibrary",
        "musicLibrary",
        "diyLibrary",
        "quirks",
        "skuFeatures",
        "state",
        "recentLogs",
        "lastMqttPackets",
        "lastApiResponse",
      ]);
    });

    it("attaches active quirks for known SKUs", () => {
      const c = new DiagnosticsCollector();
      const result = c.generate(makeDevice({ sku: "H6141" }), "2.0.0");
      expect(result.quirks).to.deep.equal({ brokenPlatformApi: true });
    });

    it("returns null quirks for unknown SKU", () => {
      const c = new DiagnosticsCollector();
      const result = c.generate(makeDevice({ sku: "H9999" }), "2.0.0");
      expect(result.quirks).to.be.null;
    });

    it("yields empty buffers if no hooks fired", () => {
      const c = new DiagnosticsCollector();
      const result = c.generate(makeDevice(), "2.0.0");
      expect(result.recentLogs).to.deep.equal([]);
      expect(result.lastMqttPackets).to.deep.equal([]);
      expect(result.lastApiResponse).to.deep.equal({});
    });
  });
});
