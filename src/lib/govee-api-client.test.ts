import { expect } from "chai";
import { parseLastData, parseSettings } from "./govee-api-client";

/**
 * App-API parser tests — parseLastData/parseSettings are pure helpers that
 * decode the JSON-in-JSON Govee returns from
 * `POST /device/rest/devices/v1/list`. They live in govee-api-client.ts
 * (same module as the unified GoveeApiClient class).
 *
 * Capability-synthesis tests (`buildCapabilitiesFromAppEntry`) follow in
 * session 6 once the device-manager learns to consume App-API payloads.
 */
describe("AppApiClient — lastDeviceData parser", () => {
  it("parses the full H5179 payload captured from /device/rest/devices/v1/list", () => {
    const raw = '{"online":true,"tem":2370,"hum":4290,"lastTime":1776704461000}';
    const out = parseLastData(raw);
    expect(out).to.deep.equal({
      online: true,
      tem: 2370,
      hum: 4290,
      lastTime: 1776704461000,
    });
  });

  it("accepts numeric online=1/0 (older firmware variants)", () => {
    expect(parseLastData('{"online":1,"tem":100}')).to.deep.include({
      online: true,
    });
    expect(parseLastData('{"online":0}')).to.deep.include({ online: false });
  });

  it("ignores unexpected types for each field", () => {
    const raw = '{"online":"yes","tem":"warm","hum":4290}';
    const out = parseLastData(raw);
    expect(out).to.deep.equal({ hum: 4290 });
  });

  it("ignores NaN/Infinity in tem/hum", () => {
    expect(parseLastData('{"tem":null,"hum":null}')).to.deep.equal({});
  });

  it("returns undefined on malformed JSON", () => {
    expect(parseLastData("not json")).to.equal(undefined);
    expect(parseLastData("")).to.equal(undefined);
    expect(parseLastData(undefined)).to.equal(undefined);
  });

  it("preserves battery when present", () => {
    expect(parseLastData('{"battery":75,"tem":2000}')).to.deep.include({
      battery: 75,
    });
  });
});

describe("AppApiClient — deviceSettings parser", () => {
  it("parses the captured H5179 settings payload", () => {
    const raw =
      '{"uploadRate":10,"temMin":-2000,"battery":100,"wifiName":"krobisnet","temMax":6000,"humMin":0,"humMax":10000,"fahOpen":false}';
    const out = parseSettings(raw);
    expect(out).to.include({
      uploadRate: 10,
      temMin: -2000,
      battery: 100,
      wifiName: "krobisnet",
      fahOpen: false,
    });
  });

  it("returns undefined on malformed input", () => {
    expect(parseSettings("not json")).to.equal(undefined);
    expect(parseSettings(undefined)).to.equal(undefined);
    expect(parseSettings("")).to.equal(undefined);
  });
});
