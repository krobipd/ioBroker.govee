import { expect } from "chai";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import {
  DeviceRegistry,
  _resetDeviceRegistry,
  applyColorTempQuirk,
  getDeviceQuirks,
  getDeviceTier,
  initDeviceRegistry,
} from "./device-registry";

const SAMPLE = {
  devices: {
    H60A1: {
      name: "LED Bulb",
      type: "light",
      status: "seed",
      quirks: { colorTempRange: { min: 2200, max: 6500 } },
    },
    H6022: {
      name: "LED Bulb (RGBWW)",
      type: "light",
      status: "seed",
      quirks: { colorTempRange: { min: 2700, max: 6500 } },
    },
    H6141: {
      name: "LED Strip",
      type: "light",
      status: "seed",
      quirks: { brokenPlatformApi: true },
    },
    H61BE: {
      name: "Glide Wall Light Wide",
      type: "light",
      status: "verified",
      since: "1.0.0",
    },
    H5179: {
      name: "Wifi Thermometer",
      type: "thermometer",
      status: "verified",
      since: "2.0.0",
    },
    H7160: {
      name: "Smart Space Heater",
      type: "heater",
      status: "reported",
      quirks: { brokenPlatformApi: true },
    },
  },
} as const;

describe("DeviceRegistry", () => {
  describe("Loading", () => {
    it("loads inline data without filesystem access", () => {
      const reg = new DeviceRegistry({ data: SAMPLE as never });
      expect(reg.getKnownSkus()).to.have.lengthOf(6);
    });

    it("loads from a JSON file on disk", () => {
      const tmp = path.join(os.tmpdir(), `dr-test-${Date.now()}.json`);
      fs.writeFileSync(tmp, JSON.stringify(SAMPLE));
      try {
        const reg = new DeviceRegistry({ filePath: tmp });
        expect(reg.getKnownSkus()).to.have.lengthOf(6);
      } finally {
        fs.unlinkSync(tmp);
      }
    });

    it("returns empty registry on missing file (no throw)", () => {
      const reg = new DeviceRegistry({
        filePath: "/nonexistent/path/devices.json",
      });
      expect(reg.getKnownSkus()).to.have.lengthOf(0);
    });

    it("returns empty registry on invalid JSON (no throw)", () => {
      const tmp = path.join(os.tmpdir(), `dr-bad-${Date.now()}.json`);
      fs.writeFileSync(tmp, "{ not valid json");
      try {
        const reg = new DeviceRegistry({ filePath: tmp });
        expect(reg.getKnownSkus()).to.have.lengthOf(0);
      } finally {
        fs.unlinkSync(tmp);
      }
    });

    it("ignores entries without a devices object", () => {
      const reg = new DeviceRegistry({ data: { devices: undefined } as never });
      expect(reg.getKnownSkus()).to.have.lengthOf(0);
    });

    it("ignores non-object entries within the devices map", () => {
      const reg = new DeviceRegistry({
        data: {
          devices: {
            H1234: null as never,
            H5678: "broken" as never,
            H6022: { name: "x", type: "light", status: "seed" },
          },
        } as never,
      });
      expect(reg.getKnownSkus()).to.deep.equal(["H6022"]);
    });
  });

  describe("Status filter (default: experimental=false)", () => {
    it("activates verified entries (no quirks set)", () => {
      const reg = new DeviceRegistry({ data: SAMPLE as never });
      expect(reg.getEntry("H5179")?.status).to.equal("verified");
      expect(reg.getQuirks("H5179")).to.be.undefined;
    });

    it("activates reported quirks", () => {
      const reg = new DeviceRegistry({ data: SAMPLE as never });
      expect(reg.getQuirks("H7160")).to.deep.equal({
        brokenPlatformApi: true,
      });
    });

    it("hides seed quirks by default", () => {
      const reg = new DeviceRegistry({ data: SAMPLE as never });
      expect(reg.getQuirks("H60A1")).to.be.undefined;
      expect(reg.getQuirks("H6022")).to.be.undefined;
      expect(reg.getQuirks("H6141")).to.be.undefined;
    });
  });

  describe("Status filter (experimental=true)", () => {
    it("activates seed quirks when experimental flag is on", () => {
      const reg = new DeviceRegistry({
        data: SAMPLE as never,
        experimental: true,
      });
      expect(reg.getQuirks("H60A1")).to.deep.equal({
        colorTempRange: { min: 2200, max: 6500 },
      });
      expect(reg.getQuirks("H6141")).to.deep.equal({
        brokenPlatformApi: true,
      });
    });
  });

  describe("Lookup helpers", () => {
    const reg = new DeviceRegistry({ data: SAMPLE as never });

    it("getStatus returns the trust tier", () => {
      expect(reg.getStatus("H61BE")).to.equal("verified");
      expect(reg.getStatus("H7160")).to.equal("reported");
      expect(reg.getStatus("H6022")).to.equal("seed");
    });

    it("getStatus returns undefined for unknown SKU", () => {
      expect(reg.getStatus("H9999")).to.be.undefined;
    });

    it("getName returns the Govee app name", () => {
      expect(reg.getName("H61BE")).to.equal("Glide Wall Light Wide");
      expect(reg.getName("H5179")).to.equal("Wifi Thermometer");
    });

    it("getName returns undefined for unknown SKU", () => {
      expect(reg.getName("H9999")).to.be.undefined;
    });

    it("getEntry returns the full entry", () => {
      const e = reg.getEntry("H5179");
      expect(e).to.exist;
      expect(e!.name).to.equal("Wifi Thermometer");
      expect(e!.type).to.equal("thermometer");
      expect(e!.status).to.equal("verified");
      expect(e!.since).to.equal("2.0.0");
    });

    it("SKU lookup is case-insensitive", () => {
      expect(reg.getQuirks("h7160")).to.deep.equal({ brokenPlatformApi: true });
      expect(reg.getStatus("h61be")).to.equal("verified");
      expect(reg.getName("h7160")).to.equal("Smart Space Heater");
    });

    it("getKnownSkus returns all SKUs regardless of status", () => {
      // Lexicographic order — '2' (0x32) sorts before 'A' (0x41),
      // so H6022 < H60A1 < H6141 < H61BE.
      const skus = reg.getKnownSkus().sort();
      expect(skus).to.deep.equal(["H5179", "H6022", "H60A1", "H6141", "H61BE", "H7160"]);
    });

    it("safe against non-string SKU input", () => {
      expect(reg.getQuirks(undefined as never)).to.be.undefined;
      expect(reg.getQuirks(null as never)).to.be.undefined;
      expect(reg.getQuirks(42 as never)).to.be.undefined;
      expect(reg.getStatus({} as never)).to.be.undefined;
    });
  });

  describe("applyColorTempQuirk (instance method)", () => {
    it("clamps to quirk range when seed is active", () => {
      const reg = new DeviceRegistry({
        data: SAMPLE as never,
        experimental: true,
      });
      expect(reg.applyColorTempQuirk("H60A1", 2000, 9000)).to.deep.equal({
        min: 2200,
        max: 6500,
      });
    });

    it("returns API-reported range when no quirk applies", () => {
      const reg = new DeviceRegistry({ data: SAMPLE as never });
      expect(reg.applyColorTempQuirk("H61BE", 2000, 9000)).to.deep.equal({
        min: 2000,
        max: 9000,
      });
    });

    it("returns API-reported range for unknown SKU", () => {
      const reg = new DeviceRegistry({ data: SAMPLE as never });
      expect(reg.applyColorTempQuirk("H9999", 2000, 9000)).to.deep.equal({
        min: 2000,
        max: 9000,
      });
    });
  });

  describe("Module-level singleton", () => {
    beforeEach(() => _resetDeviceRegistry());
    afterEach(() => _resetDeviceRegistry());

    it("getDeviceQuirks returns undefined before init", () => {
      expect(getDeviceQuirks("H5179")).to.be.undefined;
    });

    it("applyColorTempQuirk falls through to API range before init", () => {
      expect(applyColorTempQuirk("H60A1", 2000, 9000)).to.deep.equal({
        min: 2000,
        max: 9000,
      });
    });

    it("initDeviceRegistry installs the singleton", () => {
      initDeviceRegistry({ data: SAMPLE as never });
      expect(getDeviceQuirks("H7160")).to.deep.equal({ brokenPlatformApi: true });
    });

    it("module-level applyColorTempQuirk uses the singleton when set", () => {
      initDeviceRegistry({
        data: SAMPLE as never,
        experimental: true,
      });
      expect(applyColorTempQuirk("H60A1", 2000, 9000)).to.deep.equal({
        min: 2200,
        max: 6500,
      });
    });

    it("_resetDeviceRegistry clears the singleton", () => {
      initDeviceRegistry({ data: SAMPLE as never });
      _resetDeviceRegistry();
      expect(getDeviceQuirks("H5179")).to.be.undefined;
    });

    it("getDeviceTier returns 'unknown' before init", () => {
      expect(getDeviceTier("H5179")).to.equal("unknown");
    });

    it("getDeviceTier maps registry status to tier label after init", () => {
      initDeviceRegistry({ data: SAMPLE as never, experimental: true });
      // SAMPLE has H60A1=seed, H7160=verified or similar — verify the mapping
      expect(getDeviceTier("H60A1")).to.equal("seed");
      // Unknown SKU → "unknown" sentinel, not undefined
      expect(getDeviceTier("HZZZZ")).to.equal("unknown");
    });

    it("getDeviceTier is case-insensitive on the SKU", () => {
      initDeviceRegistry({ data: SAMPLE as never });
      expect(getDeviceTier("h60a1")).to.equal("seed");
      expect(getDeviceTier("H60A1")).to.equal("seed");
    });
  });
});
