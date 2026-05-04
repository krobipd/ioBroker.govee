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
var group_fanout_exports = {};
__export(group_fanout_exports, {
  GroupFanoutHandler: () => GroupFanoutHandler
});
module.exports = __toCommonJS(group_fanout_exports);
var import_types = require("./types");
class GroupFanoutHandler {
  /**
   * @param host Adapter dependencies via Host-Interface
   */
  constructor(host) {
    this.host = host;
  }
  /**
   * Fan out a group command to all online member devices.
   * Basic controls (power/brightness/color) gehen direkt durch.
   * Scenes/music werden Name-basiert gemappt.
   *
   * @param group BaseGroup-Device
   * @param stateSuffix State-Suffix (z.B. "control.power" oder "scenes.light_scene")
   * @param value Command-Value
   */
  async fanOut(group, stateSuffix, value) {
    if (!group.groupMembers) {
      return;
    }
    const devices = this.host.getDevices();
    const members = this.resolveMembers(group, devices).filter((d) => d.state.online);
    if (members.length === 0) {
      this.host.log.debug(`Group "${group.name}": no reachable members for fan-out`);
      return;
    }
    const command = this.host.stateToCommand(stateSuffix);
    if (!command) {
      return;
    }
    if ((command === "lightScene" || command === "music") && (value === "0" || value === 0)) {
      return;
    }
    for (const member of members) {
      try {
        if (command === "lightScene") {
          await this.fanOutScene(group, member, value);
        } else if (command === "music") {
          await this.fanOutMusic(group, member, stateSuffix, value);
        } else {
          await this.host.sendCommand(member, command, value);
        }
      } catch (err) {
        this.host.log.debug(`Group fan-out to ${member.name}: ${(0, import_types.errMessage)(err)}`);
      }
    }
  }
  /**
   * Resolve group member references to actual device objects.
   *
   * @param group BaseGroup device with groupMembers
   * @param devices Full device list to search
   */
  resolveMembers(group, devices) {
    if (!group.groupMembers) {
      return [];
    }
    return group.groupMembers.map((m) => devices.find((d) => d.sku === m.sku && d.deviceId === m.deviceId)).filter((d) => d !== void 0);
  }
  /**
   * Fan out a scene command: match group scene name → member scene index.
   *
   * @param group BaseGroup device
   * @param member Target member device
   * @param value Dropdown index value
   */
  async fanOutScene(group, member, value) {
    var _a;
    const groupPrefix = this.host.devicePrefix(group);
    const obj = await this.host.getObject(`${this.host.namespace}.${groupPrefix}.scenes.light_scene`);
    const groupStates = (_a = obj == null ? void 0 : obj.common) == null ? void 0 : _a.states;
    const sceneName = groupStates == null ? void 0 : groupStates[String(value)];
    if (!sceneName) {
      return;
    }
    const memberIdx = member.scenes.findIndex((s) => s.name === sceneName);
    if (memberIdx >= 0) {
      await this.host.sendCommand(member, "lightScene", memberIdx + 1);
    }
  }
  /**
   * Fan out a music command: match group music name → member music index.
   *
   * @param group BaseGroup device
   * @param member Target member device
   * @param stateSuffix Music-state-suffix
   * @param value Command value
   */
  async fanOutMusic(group, member, stateSuffix, value) {
    var _a;
    if (stateSuffix !== "music.music_mode") {
      await this.host.sendMusicCommand(member, this.host.devicePrefix(member), stateSuffix, value);
      return;
    }
    const groupPrefix = this.host.devicePrefix(group);
    const obj = await this.host.getObject(`${this.host.namespace}.${groupPrefix}.music.music_mode`);
    const groupStates = (_a = obj == null ? void 0 : obj.common) == null ? void 0 : _a.states;
    const musicName = groupStates == null ? void 0 : groupStates[String(value)];
    if (!musicName) {
      return;
    }
    const memberIdx = member.musicLibrary.findIndex((m) => m.name === musicName);
    if (memberIdx >= 0) {
      await this.host.sendMusicCommand(member, this.host.devicePrefix(member), "music.music_mode", memberIdx + 1);
    }
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  GroupFanoutHandler
});
//# sourceMappingURL=group-fanout.js.map
