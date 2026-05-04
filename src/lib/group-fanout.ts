import { errMessage, type GoveeDevice } from "./types";

/**
 * Host-Interface für GroupFanoutHandler — die Adapter-Funktionen die der
 * Handler braucht ohne von der Adapter-Klasse direkt zu hängen.
 *
 * Pattern analog `WizardHost` und `SnapshotHandlerHost`. main.ts bleibt
 * schlank, der Group-Fan-Out-Pfad ist isoliert testbar.
 */
export interface GroupFanoutHost {
  /** Adapter logger. */
  log: ioBroker.Logger;
  /** Adapter-namespace prefix (z.B. "govee-smart.0"). */
  namespace: string;
  /** Device-Liste — typisch DeviceManager.getDevices(). */
  getDevices: () => GoveeDevice[];
  /** Send-command via LAN→Cloud-Routing (DeviceManager.sendCommand). */
  sendCommand: (device: GoveeDevice, command: string, value: unknown) => Promise<void>;
  /** Resolved object-prefix für ein Gerät. */
  devicePrefix: (device: GoveeDevice) => string;
  /** State-Suffix → Command-Name lookup (main.ts STATE_TO_COMMAND-Map). */
  stateToCommand: (stateSuffix: string) => string | undefined;
  /** Get-object — für common.states-Lookup beim scene/music Mapping. */
  getObject: (id: string) => Promise<ioBroker.Object | null | undefined>;
  /** Music-Command-Sender (kapselt die music_mode/sensitivity/auto_color STRUCT). */
  sendMusicCommand: (
    device: GoveeDevice,
    devicePrefix: string,
    stateSuffix: string,
    value: ioBroker.StateValue,
  ) => Promise<void>;
}

/**
 * Group fan-out handler — dispatcht Group-Commands an die einzelnen
 * Mitglieder mit Capability-Match. Vorher in main.ts als 4 private
 * Methoden mit ~100 Zeilen.
 *
 * Die scene/music-Spezial-Pfade matchen den Group-Dropdown-Namen gegen
 * den Member-Dropdown-Namen — nicht 1:1-Indizes, weil die Member
 * verschiedene Scene-Listen haben können.
 */
export class GroupFanoutHandler {
  /**
   * @param host Adapter dependencies via Host-Interface
   */
  constructor(private readonly host: GroupFanoutHost) {}

  /**
   * Fan out a group command to all online member devices.
   * Basic controls (power/brightness/color) gehen direkt durch.
   * Scenes/music werden Name-basiert gemappt.
   *
   * @param group BaseGroup-Device
   * @param stateSuffix State-Suffix (z.B. "control.power" oder "scenes.light_scene")
   * @param value Command-Value
   */
  async fanOut(group: GoveeDevice, stateSuffix: string, value: ioBroker.StateValue): Promise<void> {
    if (!group.groupMembers) {
      return;
    }
    const devices = this.host.getDevices();
    const members = this.resolveMembers(group, devices).filter(d => d.state.online);
    if (members.length === 0) {
      this.host.log.debug(`Group "${group.name}": no reachable members for fan-out`);
      return;
    }
    const command = this.host.stateToCommand(stateSuffix);
    if (!command) {
      return;
    }
    // Dropdown-Reset — kein Command nötig
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
        this.host.log.debug(`Group fan-out to ${member.name}: ${errMessage(err)}`);
      }
    }
  }

  /**
   * Resolve group member references to actual device objects.
   *
   * @param group BaseGroup device with groupMembers
   * @param devices Full device list to search
   */
  resolveMembers(group: GoveeDevice, devices: GoveeDevice[]): GoveeDevice[] {
    if (!group.groupMembers) {
      return [];
    }
    return group.groupMembers
      .map(m => devices.find(d => d.sku === m.sku && d.deviceId === m.deviceId))
      .filter((d): d is GoveeDevice => d !== undefined);
  }

  /**
   * Fan out a scene command: match group scene name → member scene index.
   *
   * @param group BaseGroup device
   * @param member Target member device
   * @param value Dropdown index value
   */
  private async fanOutScene(group: GoveeDevice, member: GoveeDevice, value: ioBroker.StateValue): Promise<void> {
    const groupPrefix = this.host.devicePrefix(group);
    const obj = await this.host.getObject(`${this.host.namespace}.${groupPrefix}.scenes.light_scene`);
    const groupStates = obj?.common?.states as Record<string, string> | undefined;
    const sceneName = groupStates?.[String(value)];
    if (!sceneName) {
      return;
    }
    const memberIdx = member.scenes.findIndex(s => s.name === sceneName);
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
  private async fanOutMusic(
    group: GoveeDevice,
    member: GoveeDevice,
    stateSuffix: string,
    value: ioBroker.StateValue,
  ): Promise<void> {
    // Sensitivity/auto_color werden direkt forwarded
    if (stateSuffix !== "music.music_mode") {
      await this.host.sendMusicCommand(member, this.host.devicePrefix(member), stateSuffix, value);
      return;
    }
    const groupPrefix = this.host.devicePrefix(group);
    const obj = await this.host.getObject(`${this.host.namespace}.${groupPrefix}.music.music_mode`);
    const groupStates = obj?.common?.states as Record<string, string> | undefined;
    const musicName = groupStates?.[String(value)];
    if (!musicName) {
      return;
    }
    const memberIdx = member.musicLibrary.findIndex(m => m.name === musicName);
    if (memberIdx >= 0) {
      await this.host.sendMusicCommand(member, this.host.devicePrefix(member), "music.music_mode", memberIdx + 1);
    }
  }
}
