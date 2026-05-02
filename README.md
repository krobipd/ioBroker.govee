# ioBroker.govee-smart

[![npm version](https://img.shields.io/npm/v/iobroker.govee-smart)](https://www.npmjs.com/package/iobroker.govee-smart)
![Node](https://img.shields.io/badge/node-%3E%3D20-brightgreen)
![TypeScript](https://img.shields.io/badge/TypeScript-strict-blue)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)
[![npm downloads](https://img.shields.io/npm/dt/iobroker.govee-smart)](https://www.npmjs.com/package/iobroker.govee-smart)
![Installations](https://iobroker.live/badges/govee-smart-installed.svg)
[![Ko-fi](https://img.shields.io/badge/Ko--fi-Support-ff5e5b?logo=ko-fi)](https://ko-fi.com/krobipd)
[![PayPal](https://img.shields.io/badge/Donate-PayPal-blue.svg)](https://paypal.me/krobipd)

<img src="admin/govee-smart.svg" width="100" alt="govee-smart" />

Control all [Govee](https://www.govee.com/) WiFi products from ioBroker — lights, sensors and appliances. Bluetooth-only devices are not supported.

The adapter uses every channel Govee offers and picks whichever delivers the fastest, most reliable answer:

- **LAN** (UDP) — primary for lights with LAN mode enabled
- **AWS IoT MQTT** — real-time status push when you supply your Govee account
- **OpenAPI MQTT** — push events for sensors and appliances (lackWater, iceFull etc.)
- **Cloud REST v2** — capabilities, scenes, control fallback
- **App API** — sensor readings (Govee's OpenAPI v2 returns empty for thermometers, the App API doesn't)

The Wiki lists every supported model and its test status:

- [Devices (English)](https://github.com/krobipd/ioBroker.govee-smart/wiki/Devices)
- [Geräte (Deutsch)](https://github.com/krobipd/ioBroker.govee-smart/wiki/Geraete)

---

## Documentation

Full user documentation lives in the **[Wiki](https://github.com/krobipd/ioBroker.govee-smart/wiki)**.

| Topic                                                                       | English                                                                                               | Deutsch                                                                                                 |
| --------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| Landing page                                                                | [Home](https://github.com/krobipd/ioBroker.govee-smart/wiki/Home)                                     | [Startseite](https://github.com/krobipd/ioBroker.govee-smart/wiki/Startseite)                           |
| Channels, credentials, API key, experimental devices                        | [Setup](https://github.com/krobipd/ioBroker.govee-smart/wiki/Setup)                                   | [Einrichtung](https://github.com/krobipd/ioBroker.govee-smart/wiki/Einrichtung)                         |
| Supported models, status meanings, contributing yours                       | [Devices](https://github.com/krobipd/ioBroker.govee-smart/wiki/Devices)                               | [Geräte](https://github.com/krobipd/ioBroker.govee-smart/wiki/Geraete)                                  |
| Every datapoint, where it lands, what it does                               | [State tree](https://github.com/krobipd/ioBroker.govee-smart/wiki/State-Tree)                         | [Datenpunkte](https://github.com/krobipd/ioBroker.govee-smart/wiki/Datenpunkte)                         |
| Thermometers, heaters, kettles, etc. — state tree, updates, troubleshooting | [Sensors and Appliances](https://github.com/krobipd/ioBroker.govee-smart/wiki/Sensors-and-Appliances) | [Sensoren und Appliances](https://github.com/krobipd/ioBroker.govee-smart/wiki/Sensoren-und-Appliances) |
| Lights — segment count, wizard, cut strips, batch commands                  | [Segments](https://github.com/krobipd/ioBroker.govee-smart/wiki/Segments)                             | [Segmente](https://github.com/krobipd/ioBroker.govee-smart/wiki/Segmente)                               |
| Lights — scene library, speed slider, Cloud vs local snapshots              | [Scenes and Snapshots](https://github.com/krobipd/ioBroker.govee-smart/wiki/Scenes-and-Snapshots)     | [Szenen und Snapshots](https://github.com/krobipd/ioBroker.govee-smart/wiki/Szenen-und-Snapshots)       |
| Lights — group fan-out, capability intersection                             | [Groups](https://github.com/krobipd/ioBroker.govee-smart/wiki/Groups)                                 | [Gruppen](https://github.com/krobipd/ioBroker.govee-smart/wiki/Gruppen)                                 |
| Folder naming, startup, diagnostics, troubleshooting                        | [Behavior](https://github.com/krobipd/ioBroker.govee-smart/wiki/Behavior)                             | [Verhalten](https://github.com/krobipd/ioBroker.govee-smart/wiki/Verhalten)                             |

---

## Features

- **Capability-driven** — states are generated from what the Govee API reports for each device. No SKU hardcoding, no hand-maintained device list to fall behind.
- **LAN-first for lights** — UDP multicast discovery, sub-50 ms commands, status updates via AWS IoT MQTT
- **Cloud + MQTT push for sensors and appliances** — readings via the App API, events via the OpenAPI MQTT broker
- **Per-segment color and brightness** for LED strips with the right capability, including batch commands and an interactive segment detection wizard for cut strips
- **Scenes, DIY scenes, music mode, gradient toggle** — activated locally via BLE-over-LAN where possible, Cloud fallback otherwise
- **Cloud and local snapshots** — Govee-app snapshots and ioBroker-side snapshots side by side
- **Groups** — bridge Govee groups into ioBroker with capability intersection across members
- **Diagnostics export button per device** — one-click JSON dump for bug reports
- **Graceful degradation** — works LAN-only without any credentials; each tier unlocks more
- **Rate-limited Cloud usage** — daily and per-minute budgets aligned to Govee's quota

---

## Requirements

- Node.js >= 20
- ioBroker js-controller >= 7.0.7
- ioBroker Admin >= 7.7.22
- A Govee account and at least one Govee WiFi device. LAN control needs a light with LAN mode enabled in the Govee Home app — see Govee's [LAN-supported device list](https://app-h5.govee.com/user-manual/wlan-guide).

---

## Credential levels

| Level               | Credentials      | What works                                                                                                                                       |
| ------------------- | ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| **LAN only**        | none             | Lights with LAN mode: power, brightness, color, color temperature, local snapshots                                                               |
| **+ Cloud API key** | API key          | + device names, capabilities, scenes, segments, Cloud snapshots, basic groups, sensor and appliance readings, push events for sensors/appliances |
| **+ Govee account** | email + password | + real-time status push for lights via AWS IoT MQTT, full group control                                                                          |

Sensors and appliances always need at least the API key — they have no LAN protocol. See the [Setup page](https://github.com/krobipd/ioBroker.govee-smart/wiki/Setup) for how to get one.

---

## Ports

| Port | Protocol | Direction                            | Purpose              |
| ---- | -------- | ------------------------------------ | -------------------- |
| 4001 | UDP      | Outbound (multicast 239.255.255.250) | LAN device discovery |
| 4002 | UDP      | Inbound                              | LAN device responses |
| 4003 | UDP      | Outbound                             | LAN device commands  |

All ports are fixed by the Govee LAN protocol and cannot be changed.

---

## Device tiers

Each device shows where its model sits in the catalogue under `diag.tier`:

| Tier         | Meaning                                                                                                                            |
| ------------ | ---------------------------------------------------------------------------------------------------------------------------------- |
| **verified** | Confirmed on real hardware — known per-SKU corrections active.                                                                     |
| **reported** | Community-reported, treated as verified.                                                                                           |
| **seed**     | Beta. Known per-SKU corrections only apply when **Enable experimental device support** is on in adapter settings.                  |
| **unknown**  | The model isn't in the catalogue yet. Press `diag.export` on the device and post the resulting JSON in a GitHub issue so it can be added. |

The adapter writes one log line per model on startup if the model is `seed` (without the toggle) or `unknown` — once per startup, not on every reconnect.

---

## Troubleshooting

Common issues (no devices discovered, empty scenes dropdown, segment colors not changing, limited group commands, delayed status updates) are covered on the Wiki [Behavior](https://github.com/krobipd/ioBroker.govee-smart/wiki/Behavior) / [Verhalten](https://github.com/krobipd/ioBroker.govee-smart/wiki/Verhalten) page.

For anything else, press **`diag.export`** on the affected device, copy the JSON from `diag.result`, and open a [GitHub Issue](https://github.com/krobipd/ioBroker.govee-smart/issues).

---

## Acknowledgments

This adapter's MQTT authentication and BLE-over-LAN (ptReal) protocol implementation was informed by research from [govee2mqtt](https://github.com/wez/govee2mqtt) by Wez Furlong. Their reverse-engineering of the Govee AWS IoT MQTT protocol and undocumented API endpoints was invaluable.

---

## Changelog

### **WORK IN PROGRESS**

- Security fix: in v2.1.0 your saved MQTT login (token + certificate) was accidentally stored unencrypted. Now actually encrypted at rest as intended.
- Diagnostics datapoints renamed from `info.diagnostics_*` to `diag.export` / `diag.result` / `diag.tier`. Old datapoints are removed on first start — adjust scripts that referenced the old names.
- The `diag.export` JSON now also shows failed Cloud calls (with status code) and recent log lines for the device, so a single JSON dump is enough for a bug report.
- 2-Factor verification warning no longer repeats on every reconnect attempt. You'll see it once when Govee actually wants a code, not every minute while the adapter retries.
- The MQTT connection is no longer dropped every few hours when the access token rotates — refreshed in the background. No more spurious 2FA warning after the adapter has been running a while.

### 2.1.0 (2026-05-01)

- Govee accounts that require email verification on login can now be used. Adapter settings have a button to request the code, plus a field to paste it.
- The MQTT login is remembered across restarts, so the verification email is not re-sent on every reboot.
- Reconnects no longer look like a brand-new login to Govee, which used to trigger a verification email even for already-verified accounts.
- `info.online` now reflects reality for sensors and appliances. Fixes thermometers (e.g. H5179) staying at offline while their values kept updating.
- New per-device datapoint shows whether your model is verified, community-reported, beta or unknown. Unknown SKUs get a one-time hint to file a diag.export.
- Scene / DIY-scene / snapshot dropdowns now appear from the first start instead of waiting for the first Cloud call to come back.
- The Refresh Cloud Data button reloads the scene / music / DIY libraries again (had been skipped since v1.10.1).
- Min js-controller `>=7.0.7`, min admin `>=7.7.22`.

### 2.0.3 (2026-04-26)

- Min js-controller `>=6.0.11`, admin `>=7.6.20` (correcting an accidental bump in 2.0.2).

### 2.0.2 (2026-04-26)

- Sensor and appliance events (lack-of-water, ice-bucket-full, etc.) now arrive reliably across reconnects. Govee used to treat each reconnect as a new connection and drop the subscription.
- Min js-controller `>=7.0.23`.

### 2.0.1 (2026-04-26)

- Sensor values and events now land under `sensor/` and `events/` (were both under `control/` in v2.0.0). Removes `no existing object` warnings in the log on first start.
- Snapshots and scenes only attach to lights now — thermometers, heaters and kettles no longer get `snapshot_local` / `snapshot_save` / `snapshot_delete`.
- The `N experimental device(s) detected` boot-time log line is gone. The hint now fires once per lifetime per SKU, only when that SKU actually shows up.
- Less info-level log noise on startup (the routine `OpenAPI MQTT connected` line was removed; recovery messages stay).

### 2.0.0 (2026-04-26)

- Major release — Govee appliances and sensors (thermometers like H5179, heaters, kettles, ice makers) are now handled here alongside lights.
- The standalone `iobroker.govee-appliances` adapter is deprecated and rolls into here. Install govee-smart 2.0.0+ and uninstall govee-appliances when convenient.
- New **"Enable experimental device support"** checkbox in the adapter config — applies known per-model corrections to devices that are catalogued but not yet confirmed by a tester.
- New state `info.openapiMqttConnected` showing whether the push channel for sensor / appliance events is up; `info.mqttConnected` keeps tracking the channel used for lights.

Older entries are in [CHANGELOG_OLD.md](CHANGELOG_OLD.md).

## Support

- [Wiki](https://github.com/krobipd/ioBroker.govee-smart/wiki) — user documentation (EN / DE)
- [GitHub Issues](https://github.com/krobipd/ioBroker.govee-smart/issues) — bug reports, feature requests
- [ioBroker Forum](https://forum.iobroker.net/) — general questions

### Support Development

This adapter is free and open source. If you find it useful, consider buying me a coffee:

[![Ko-fi](https://img.shields.io/badge/Ko--fi-Support-ff5e5b?style=for-the-badge&logo=ko-fi)](https://ko-fi.com/krobipd)
[![PayPal](https://img.shields.io/badge/Donate-PayPal-blue.svg?style=for-the-badge)](https://paypal.me/krobipd)

---

## License

MIT License

Copyright (c) 2026 krobi <krobi@power-dreams.com>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

---

_Developed with assistance from Claude.ai_
