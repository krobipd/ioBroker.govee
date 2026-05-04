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
var snapshot_handler_exports = {};
__export(snapshot_handler_exports, {
  SnapshotHandler: () => SnapshotHandler
});
module.exports = __toCommonJS(snapshot_handler_exports);
class SnapshotHandler {
  constructor(host) {
    this.host = host;
  }
  /**
   * Save current device state as a local snapshot.
   *
   * @param device Target device
   * @param name Snapshot name
   */
  async save(device, name) {
    var _a;
    const prefix = this.host.devicePrefix(device);
    const ns = this.host.namespace;
    const [powerState, brightState, colorState, ctState] = await Promise.all([
      this.host.getState(`${ns}.${prefix}.control.power`),
      this.host.getState(`${ns}.${prefix}.control.brightness`),
      this.host.getState(`${ns}.${prefix}.control.colorRgb`),
      this.host.getState(`${ns}.${prefix}.control.colorTemperature`)
    ]);
    let segments;
    const segCount = (_a = device.segmentCount) != null ? _a : 0;
    if (segCount > 0) {
      const segReads = [];
      for (let i = 0; i < segCount; i++) {
        segReads.push(
          Promise.all([
            this.host.getState(`${ns}.${prefix}.segments.${i}.color`),
            this.host.getState(`${ns}.${prefix}.segments.${i}.brightness`)
          ])
        );
      }
      const segResults = await Promise.all(segReads);
      segments = segResults.map(([segColor, segBright]) => ({
        color: typeof (segColor == null ? void 0 : segColor.val) === "string" ? segColor.val : "#000000",
        brightness: typeof (segBright == null ? void 0 : segBright.val) === "number" ? segBright.val : 100
      }));
    }
    const snapshot = {
      name,
      power: (powerState == null ? void 0 : powerState.val) === true,
      brightness: typeof (brightState == null ? void 0 : brightState.val) === "number" ? brightState.val : 0,
      colorRgb: typeof (colorState == null ? void 0 : colorState.val) === "string" ? colorState.val : "#000000",
      colorTemperature: typeof (ctState == null ? void 0 : ctState.val) === "number" ? ctState.val : 0,
      segments,
      savedAt: Date.now()
    };
    this.host.store.saveSnapshot(device.sku, device.deviceId, snapshot);
    this.host.log.info(`Local snapshot saved: "${name}" for ${device.name}`);
    this.host.refreshDeviceStates(device);
  }
  /**
   * Restore a local snapshot by index.
   *
   * @param device Target device
   * @param val Dropdown index value
   */
  async restore(device, val) {
    const idx = parseInt(String(val), 10);
    if (idx < 1) {
      return;
    }
    const snaps = this.host.store.getSnapshots(device.sku, device.deviceId);
    const snap = snaps[idx - 1];
    if (!snap) {
      this.host.log.warn(`Local snapshot index ${idx} not found for ${device.name}`);
      return;
    }
    this.host.log.info(`Restoring local snapshot "${snap.name}" for ${device.name}`);
    await this.host.sendCommand(device, "power", snap.power);
    if (snap.power) {
      await this.host.sendCommand(device, "brightness", snap.brightness);
      if (snap.colorTemperature > 0) {
        await this.host.sendCommand(device, "colorTemperature", snap.colorTemperature);
      } else {
        await this.host.sendCommand(device, "colorRgb", snap.colorRgb);
      }
      if (snap.segments && snap.segments.length > 0) {
        for (let i = 0; i < snap.segments.length; i++) {
          const seg = snap.segments[i];
          await this.host.sendCommand(device, `segmentColor:${i}`, seg.color);
          await this.host.sendCommand(device, `segmentBrightness:${i}`, seg.brightness);
        }
      }
    }
  }
  /**
   * Delete a local snapshot by name.
   *
   * @param device Target device
   * @param name Snapshot name to delete
   */
  delete(device, name) {
    if (this.host.store.deleteSnapshot(device.sku, device.deviceId, name)) {
      this.host.log.info(`Local snapshot deleted: "${name}" for ${device.name}`);
      this.host.refreshDeviceStates(device);
    } else {
      this.host.log.warn(`Local snapshot "${name}" not found for ${device.name}`);
    }
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  SnapshotHandler
});
//# sourceMappingURL=snapshot-handler.js.map
