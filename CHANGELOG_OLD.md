# Older Changes
## 2.2.0 (2026-05-04)

- 2FA-Verifizierung triggert keinen Restart mehr. MQTT-Pushes typsicher, Sensor-Datenpunkte im richtigen Kanal (`sensor/`, `events/` statt `control/`).
- Ready-Log zeigt was operational ist: Channel-Status (LAN+Cloud+MQTT+Cloud-events), Lichter-Online-Count, Sensoren mit Datenmarker. Wartet auf den ersten Sensor-Poll.
- Persistente UDP-Sockets, abbrechbare HTTP-Calls, HTTP keep-alive (~200 ms schneller), Backoff-Jitter gegen Thundering Herd.
- Memory-Leaks beim Device-Remove geschlossen — Diagnostics-Buffer und State-Tree werden gemeinsam aufgeräumt wenn ein Gerät aus dem Govee-Account verschwindet.
- Kein WARN-Spam mehr für Group-State `info.membersUnreachable`. Plus XOR-Validierung für MQTT-BLE-Pakete, type-Guards an allen API-Boundaries, `tier: 2`.

## 2.1.4 (2026-05-03)

- Online status correct again after adapter restart — lights flip to online with the first LAN scan, sensors with the first cloud poll (5 s after start instead of 2 minutes).

## 2.1.3 (2026-05-03)

- Critical fix: no more restart-loop after entering the verification code. The cached login is now stored in a state, not in the adapter config — saving the config doesn't trigger a restart anymore.
- Saving email + password in the adapter config works again. The previous loop made it look like only the "Test login" button worked.
- Honest startup messages: when MQTT really doesn't connect within the first minute, the log says why ("login rejected", "verification needed", etc.) instead of "still pending".
- Verification warning shortened. The full step-by-step instructions live in the Wiki, the log only states the action.
- "MQTT connected to AWS IoT" → "MQTT connected". "OpenAPI MQTT" → "Cloud-events" in user-facing logs.

## 2.1.2 (2026-05-02)

- The verification message no longer claims your account has 2FA when it doesn't. Govee asks for a one-time check the first time it sees this client — same dialog, but the wording matches reality now.
- Adapters upgrading from v2.1.0 had stored MQTT credentials as plain text by mistake. The corrupted leftover bytes are now cleared on first start, so the verification flow only runs once.
- New device added to the catalogue: H61D5 (LED Strip).

## 2.1.1 (2026-05-02)

- Security fix: in v2.1.0 your saved MQTT login (token + certificate) was accidentally stored unencrypted. Now actually encrypted at rest as intended.
- Diagnostics datapoints renamed from `info.diagnostics_*` to `diag.export` / `diag.result` / `diag.tier`. Old datapoints are removed on first start — adjust scripts that referenced the old names.
- The `diag.export` JSON now also shows failed Cloud calls (with status code) and recent log lines for the device, so a single JSON dump is enough for a bug report.
- 2-Factor verification warning no longer repeats on every reconnect attempt. You'll see it once when Govee actually wants a code, not every minute while the adapter retries.
- The MQTT connection is no longer dropped every few hours when the access token rotates — refreshed in the background. No more spurious 2FA warning after the adapter has been running a while.

## 2.1.0 (2026-05-01)

- Govee accounts that require email verification on login can now be used. Adapter settings have a button to request the code, plus a field to paste it.
- The MQTT login is remembered across restarts, so the verification email is not re-sent on every reboot.
- Reconnects no longer look like a brand-new login to Govee, which used to trigger a verification email even for already-verified accounts.
- `info.online` now reflects reality for sensors and appliances. Fixes thermometers (e.g. H5179) staying at offline while their values kept updating.
- New per-device datapoint shows whether your model is verified, community-reported, beta or unknown. Unknown SKUs get a one-time hint to file a diag.export.
- Scene / DIY-scene / snapshot dropdowns now appear from the first start instead of waiting for the first Cloud call to come back.
- The Refresh Cloud Data button reloads the scene / music / DIY libraries again (had been skipped since v1.10.1).
- Min js-controller `>=7.0.7`, min admin `>=7.7.22`.

## 2.0.3 (2026-04-26)

- Min js-controller `>=6.0.11`, admin `>=7.6.20` (correcting an accidental bump in 2.0.2).

## 2.0.2 (2026-04-26)

- Sensor and appliance events (lack-of-water, ice-bucket-full, etc.) now arrive reliably across reconnects. Govee used to treat each reconnect as a new connection and drop the subscription.
- Min js-controller `>=7.0.23`.

## 2.0.1 (2026-04-26)

- Sensor values and events now land under `sensor/` and `events/` (were both under `control/` in v2.0.0). Removes `no existing object` warnings in the log on first start.
- Snapshots and scenes only attach to lights now — thermometers, heaters and kettles no longer get `snapshot_local` / `snapshot_save` / `snapshot_delete`.
- The `N experimental device(s) detected` boot-time log line is gone. The hint now fires once per lifetime per SKU, only when that SKU actually shows up.
- Less info-level log noise on startup (the routine `OpenAPI MQTT connected` line was removed; recovery messages stay).

## 2.0.0 (2026-04-26)

- Major release — Govee appliances and sensors (thermometers like H5179, heaters, kettles, ice makers) are now handled here alongside lights.
- The standalone `iobroker.govee-appliances` adapter is deprecated and rolls into here. Install govee-smart 2.0.0+ and uninstall govee-appliances when convenient.
- New **"Enable experimental device support"** checkbox in the adapter config — applies known per-model corrections to devices that are catalogued but not yet confirmed by a tester.
- New state `info.openapiMqttConnected` showing whether the push channel for sensor / appliance events is up; `info.mqttConnected` keeps tracking the channel used for lights.

## 1.11.0 (2026-04-25)

- Scene / DIY-scene / snapshot / music-mode dropdowns now accept the entry name (case-insensitive) as well as the numeric index. No more type-mismatch warning when scripts write a number.
- Duplicate scene names from the cloud are auto-disambiguated with `" (2)"`, `" (3)"` suffixes; reverse-lookup is deterministic.
- The adapter acks back the canonical key after activation, so the dropdown stays in sync regardless of how the value was written.

## 1.10.1 (2026-04-20)

- Refresh-Cloud-Data button is now much faster (about 2 calls per device instead of ~7) — the static library endpoints often returned 403 anyway and only produced rate-limiter backlogs.

## 1.10.0 (2026-04-20)

- Multi-packet A3 BLE scenes (`scenceParam`) are now activated via Cloud on devices without segments; bulbs and Curtain Lights silently dropped those packets before, so complex scenes never played.
- Powering a device off resets every mode dropdown to `"---"` — both ioBroker and Govee-app initiated off events.

## 1.9.1 (2026-04-20)

- Fix: existing snapshots were sometimes wiped from the dropdown after a Cloud refresh — the Govee API occasionally returns scenes but zero snapshots, the cleanup now keeps the last-known-good list.

## 1.9.0 (2026-04-20)

- **BREAKING** — `snapshots.snapshot` renamed to `snapshots.snapshot_cloud` (clearer alongside the local-snapshot states). Update scripts and VIS widgets; the old state is removed on first start.
- Scenes and snapshots are re-fetched from the Cloud on every adapter start. A stale `scenesChecked` flag could hide new Govee-app snapshots until the cache was wiped.
- New `info.refresh_cloud_data` button to trigger the same fresh fetch without restarting the adapter.
- All four snapshot states carry a `common.desc` so the object browser distinguishes Govee-app from ioBroker snapshots.

## 1.8.0 (2026-04-20)

- Status writes parallelised, per-write object probe dropped; MQTT pushes cost much less on large device lists.
- `cleanupAllChannelStates` uses one broad view instead of four per-device queries.
- `handleSnapshotSave` reads device + segment state in parallel.
- Rate-limiter daily reset aligned to UTC midnight so the budget flips with Govee's clock.
- Local snapshots write with `fsync` — SIGKILL during adapter stop no longer drops just-saved snapshots.
- Library fetches go through the rate-limiter; fresh installs with many devices no longer burst-call `app2.govee.com`.
- Wizard text fully localised (EN/DE) via `system.config.language`, English fallback for other admin languages.
- govee-appliances coexistence detection covers all instances (`.0`, `.1`, …) not just `.0`.
- MQTT client keeps a stable per-process session UUID across reconnects so AWS IoT can take over cleanly.
- Memory-leak prevention — every adapter-level map is reaped on device removal.
- Internal — shared `govee-constants.ts`, `stateToCommand` lookup table, `crypto.randomUUID` for sessions.

## 1.7.8 (2026-04-19)

- MQTT bearer-token going stale after reconnect — api-client refreshed on every fresh login.
- LAN devStatus poll skipped when MQTT is connected (MQTT push is authoritative).
- Process-level `unhandledRejection` / `uncaughtException` handlers as last line of defence.
- Hygiene — `seenDeviceIps` evicts on IP change, `stateCreationQueue` bounded to startup, `info.*Connected` reset on unload, diagnostics export throttled 2s per device.

## 1.7.7 (2026-04-19)

- Wizard result and MQTT-learned segment count lost on every restart — cache load now merges segment fields into LAN-discovered devices.
- Cache writes use `fsync` to survive SIGKILL during adapter stop.

## 1.7.6 (2026-04-19)

- `manual_mode` rollback on invalid `manual_list` no longer bounces the rejected value back into the state.
- Wizard translations in 9 admin languages completed; machine-translation glitches hand-corrected.
- `info` channel keeps its "Device Information" display name; "~100 ms" latency claim dropped from LAN section.
- Internal cleanup — `applyManualSegments` helper, targeted state refresh on snapshot ops, prefix-map cleanup on device removal, dead `loadDeviceScenes` paths removed.

## 1.7.5 (2026-04-19)

- Wiki link in adapter settings — Markdown in staticText wasn't rendered, replaced with two staticLink buttons (DE + EN).

## 1.7.4 (2026-04-19)

- Language-aware Wiki link at the top of the main configuration tab.

## 1.7.3 (2026-04-19)

- `common.messagebox=true` for onMessage wizard (latest-repo review compliance).
- Color-mode preamble delays routed through adapter timer wrapper (onUnload-safe).

## 1.7.2 (2026-04-19)

- Test infrastructure aligned with ioBroker standard — plain-JS `package.js` + `integration.js`.

## 1.7.1 (2026-04-19)

- Segment commands force color mode before sending — previously silently ignored in Scene/Gradient/Music mode.
- Side effect: automatic segment-count learning once you touch any segment control.

## 1.7.0 (2026-04-19)

- Reliable segment count via single source of truth (cache → MQTT-learned → min of Cloud-advertised), persists across restarts.
- Wizard redesigned — three buttons (visible/dark/end-of-strip), measures real length up to protocol limit 55, detects gaps for cut strips.
- Wizard forces color mode before each flash so the flash isn't ignored in Scene/Gradient/Music mode.
- Cut-strip settings (`manual_mode`, `manual_list`) are part of the SKU cache and survive restarts.
- Cloud-internal contradictions resolved conservatively — take the smaller value, let MQTT correct upwards.

## 1.6.7 (2026-04-19)

- Race when MQTT reveals more segments than Cloud — the discovery push skips the segment-state sync so new datapoints are created first; the next AA A5 push populates the tree.

## 1.6.6 (2026-04-19)

- Under-reported segment count — adapter now bumps `segmentCount` from MQTT `AA A5` packets and rebuilds the state tree (fixes 20 m strips where Cloud says 15).
- `parseMqttSegmentData` no longer caps output at Cloud's segmentCount; trailing all-zero padding slots are stripped.
- Wizard flash dims segments 0-55 (Govee bitmask max) so under-reported strips leave no residual lit segments.
- `manual_list` validation accepts indices up to 55, not just Cloud-reported count.

## 1.6.5 (2026-04-19)

- Wizard flash — all three BLE packets bundled into one `ptReal` UDP datagram (separate datagrams were dropped under back-pressure).
- Wizard switches the strip ON + global brightness 100 before the first flash; baseline is captured and restored on abort/finish.
- New `info.wizardStatus` state written on every wizard step; admin panel uses `type: "state"` for live progress (Admin 7.1+).

## 1.6.4 (2026-04-18)

- Wizard UX rewrite — dropdown shows only online devices, persistent status box, multi-line info toasts with Yes/No guidance.
- Status box via `textSendTo` (refreshes on device re-select); button responses use `message` field (previously silent because of wrong field name).

## 1.6.3 (2026-04-18)

- Segment Detection Wizard crash on Start — `parseSegmentBatch` guards against non-string values; v1.6.2 restart-loop fixed.
- Harden all async event handlers against unhandled rejections — `.catch` on `ready`/`stateChange`/`onMessage`.
- Boundary-type hardening across Cloud/API/MQTT/LAN — `Array.isArray` + `typeof` guards, NaN/clamp on color helpers.
- Extract segment-wizard and cloud-retry-loop into dedicated testable modules.
- 511 tests (was 427).

## 1.6.2 (2026-04-18)

- jsonConfig schema warnings for Segment Detection Wizard — removed unsupported `button` property, aligned variant/color to admin schema, set `xs=12` for mobile layout.

## 1.6.1 (2026-04-18)

- Segment Detection Wizard in admin UI — jsonConfig button type was `"sendto"` (lowercase) instead of `"sendTo"`, causing validation errors.
- LED strip dropdown showed as free-text input because `selectSendTo` expects the array directly, not wrapped in `{list: ...}`.

## 1.6.0 (2026-04-18)

- Manual segment override for cut LED strips — declare existing indices via `segments.manual_mode` + `segments.manual_list` (ranges, gaps).
- Segment Detection Wizard in admin UI — flashes each segment, user confirms visibility, writes result as `manual_list`.
- Cloud-Retry-Loop with rate-limit handling — `Retry-After` honoured, auth-failures stop permanently, transient errors retry after 5 min.
- SKU-cache pruning — 14-day aging + `scenesChecked` flag + hard-filter of stale entries.
- Startup grace period for MQTT+Cloud extended 30s → 60s.
- `info.mqttConnected` not updating on disconnect.
- 427 tests (was 399).

## 1.5.2 (2026-04-17)

- Harden all Cloud API boundaries against schema drift — `typeof`/`Array.isArray` guards and string coercion on every external field access.
- `CloudCapability.parameters` is optional now — API may omit it even when docs require it.
- `normalizeDeviceId` and cache file naming safe against non-string input.
- 45 new drift-regression tests (399 total).

## 1.5.1 (2026-04-15)

- Device type matching — scenes only loaded via fallback because type comparison never matched Cloud API format.
- Dynamic API rate-limit sharing with other Govee adapters on the same account.
- Filter non-light device types (heaters, fans, sensors) — this adapter handles lights only.
- 354 tests (was 352).

## 1.5.0 (2026-04-14)

- Local segment control via BLE-over-LAN (ptReal) — segments now controlled locally (~100 ms) instead of Cloud (5-10 s).
- Scene variants — all light effects per scene (A/B/C/D) instead of only the first variant.
- Local snapshot activation via ptReal BLE packets — Cloud snapshots now activated locally.
- Scene speed control via slider for supported scenes.
- Per-segment color and brightness in local snapshots — full visual state without Cloud.
- 352 tests (was 327).

## 1.4.1 (2026-04-13)

- Group member resolution returning empty (API field name mismatch: `gId`/`name` vs `groupId`/`groupName`).
- Bearer token pre-check with descriptive log message for group membership loading.
- Debug logging when group membership API returns no data.

## 1.4.0 (2026-04-13)

- Group handling redesigned — fan-out commands to member devices via LAN/ptReal instead of Cloud-only power toggle.
- Group capabilities computed as intersection of member devices (power, brightness, color, scenes, music).
- New `info.members` state with group member device IDs.
- New dynamic `info.membersUnreachable` state (only created when unreachable members exist).
- Snapshots and diagnostics removed from groups (not applicable to virtual devices).
- Undocumented API headers updated to current Govee app version (7.3.30).
- 327 tests (was 314).

## 1.3.0 (2026-04-12)

- MQTT segment state sync — per-segment brightness and color updated in real-time via MQTT BLE notifications.
- Non-functional scene speed slider removed (byte layout unknown, no project worldwide implements this).
- Dead code removed — unused types, methods, write-only fields (8 audit findings).

## 1.2.0 (2026-04-12)

- Segment color commands not working (ptReal accepted but not rendered) — rerouted via Cloud API.
- Dropdown states not resetting on mode switch — scene/music/snapshot/color changes now reset all other dropdowns.
- Group online states replaced with single `groups.info.online` reflecting Cloud connection status.
- Channel annotations added to state tree documentation.
- Acknowledgments for govee2mqtt project added.

## 1.1.2 (2026-04-12)

- Dead MQTT command code removed (MQTT is status-push only, never sent commands).
- `noMqtt` device quirk removed (no longer needed without MQTT commands).
- Dead `CloudApiError` re-export removed.
- Inline hex parsing replaced with shared `hexToRgb()` utility.
- LAN fallback simplified to Cloud-only (was LAN → MQTT → Cloud).

## 1.1.1 (2026-04-12)

- **BREAKING** — diagnostics states moved from `snapshots/` to `info/` channel (where device information belongs).
- Community quirks loaded from persistent data directory instead of adapter directory (survives updates).
- Diagnostics export and community quirks documented in README.
- Redundant CI checkout removed, `no-floating-promises` lint rule, unused devDependencies removed, duplicate news entry fixed.

## 1.1.0 (2026-04-11)

- Diagnostics export per device — structured JSON for GitHub issue submission.
- Community quirks database — external `community-quirks.json` for user-contributed SKU overrides.
- Array bounds checks in scene/DIY/snapshot index lookups (prevents crash on invalid indices).
- Segment batch parsing edge cases — negative indices, empty device list growth.
- Internal refactoring. No user-facing changes.

## 1.0.1 (2026-04-11)

- Segment capability matching — color and brightness commands now route to correct API capabilities.
- Segment count uses maximum across all segment capabilities instead of first found.
- Hardcoded 15-segment fallback replaced with safe default.
- Missing `clearTimeout` for one-shot timers in `onUnload`.

## 1.0.0 (2026-04-11)

- **BREAKING** — multi-channel state tree split into `control`, `scenes`, `music`, `snapshots`.
- **BREAKING** — `pollInterval` setting removed (Cloud polling was removed in 0.9.3).
- Incomplete cache detection — type check `"devices.types.light"` never matched Cloud's `"light"`.
- Dead code removed — unused methods, config fields, `LanDevice` version fields.
- Dynamic segment count from capabilities, excess segments cleaned up on startup.
- Groups minimal — BaseGroup only has `info.name` + `info.online`.

## 0.9.6 (2026-04-11)

- Scenes missing for most devices due to incomplete cache from rate-limited Cloud fetch.
- MQTT "account abnormal" incorrectly treated as wrong credentials (now keeps reconnecting instead of stopping).
- Ready message waits for LAN scan and state creation before logging.
- Per-device detail lines removed from ready summary (redundant with state tree).
- Scenes filled from scene library when Cloud scenes are missing (ptReal fallback).

## 0.9.5 (2026-04-11)

- Device names not updating from cache when LAN discovery runs first.

## 0.9.4 (2026-04-11)

- Startup and ready logging improved — clear channel summary, per-device details with LAN IPs and scene counts.
- Excessive debug noise removed — default value checks, periodic LAN scan messages.
- MQTT first-connect promoted to info level for better visibility.

## 0.9.3 (2026-04-09)

- Local snapshots — save/restore device state via LAN without Cloud.
- Device quirks system — correct wrong API data for specific SKUs.
- Scene speed control infrastructure (speed adjustment pending live testing).
- 254 tests.

## 0.9.2 (2026-04-09)

- SKU cache — device data persisted locally, zero Cloud calls after first start.
- Periodic Cloud polling removed (was every 60 s).
- Authenticated endpoint support for music/DIY libraries and SKU feature flags.
- MQTT login classification for account-blocked scenarios.

## 0.9.1 (2026-04-09)

- ptReal BLE-over-LAN scene activation — local scenes without Cloud API.
- Initialization order — MQTT before Cloud for scene library on first cycle.
- Ready message only appears after all channels are fully initialized.

## 0.9.0 (2026-04-09)

- Dedicated DIY-scenes endpoint for user-created scenes.
- Music mode controls — dropdown, sensitivity slider, auto-color toggle.
- Scene library per SKU from undocumented API (78-159 scenes per device).
- Ready message waits for MQTT before logging channel summary.
- Scene library — correct endpoint path, no auth required, query parameters preserved.

## 0.8.3 (2026-04-09)

- Internal release-script fix. No user-facing changes.

## 0.8.2 (2026-04-08)

- `build/` removed from git tracking, `.gitignore` fixed, redundant `CHANGELOG.md` removed.

## 0.8.1 (2026-04-06)

- Ready message no longer shows disconnected channels as active.
- Network interface default selection in admin UI fixed.

## 0.8.0 (2026-04-06)

- Network interface selection for LAN discovery (multi-NIC / VLAN support).

## 0.7.0 (2026-04-06)

- IP address per device under `info.ip`, auto-updated on LAN discovery.
- Batch segment control documentation (format, examples, notes).

## 0.6.4 (2026-04-06)

- Misleading "check email/password" for non-credential Govee login errors fixed.
- MQTT login errors classified by actual Govee response (rate-limit, credential, account issue).

## 0.6.3 (2026-04-06)

- MQTT auth backoff (stops after 3 failures), error dedup, recovery logging.
- Cloud connection recovery detection.
- Improved error classification (OS-level error codes).

## 0.6.2 (2026-04-05)

- Test suite expanded from 78 to 175 tests.

## 0.6.1 (2026-04-05)

- Snapshots not appearing fixed; DIY scene dropdown prepared.

## 0.6.0 (2026-04-06)

- Batch segment control via `segments.command` state (e.g. `"1-5:#ff0000:20"`).
- Generic capability routing — `gradient_toggle`, `diy_scene`, `music_mode`.
- Scene dropdown auto-reset on color/colorTemp change.

## 0.5.0 (2026-04-06)

- Segment control commands now routed via Cloud API.
- Rate-limited Cloud startup, error-dedup logging.
- Scene/snapshot refresh on each Cloud poll.
- Startup "ready" only after all channels initialized.

## 0.4.1 (2026-04-06)

- Null state values — sensible defaults for all control states.
- Stale control states removed on startup.
- `light_scene` / `snapshot` states only created when data is available.

## 0.4.0 (2026-04-06)

- Scenes and snapshots as real dropdowns (78-237 scenes per device).
- Cloud state loading for Cloud-only states.
- Cloud never overwrites LAN states.
- New `info.mqttConnected` and `info.cloudConnected`.
- Cleaner logging with device/group summary.

## 0.3.0 (2026-04-06)

- Stable device folder naming (`sku_shortId`), LAN-first controls.
- MQTT login v2, groups folder, Cloud unit normalization.

## 0.2.1 (2026-04-06)

- Duplicate SKU collision — LAN-only devices now use SKU with short device-ID suffix.
- Deploy workflow — build step before npm publish.

## 0.2.0 (2026-04-06)

- Device folders use Cloud device name (falls back to SKU without API key).
- Control states moved to `control/` channel.
- New `info.serial` state with device ID.

## 0.1.2 (2026-04-05)

- LAN discovery race condition — listen socket ready before first scan.

## 0.1.1 (2026-04-05)

- LAN-only devices missing control states.
- LAN status matching by source IP.
- Device status requested immediately after LAN discovery.

## 0.1.0 (2026-04-05)

- Initial release.
- LAN UDP discovery and control.
- AWS IoT MQTT real-time status and control.
- Cloud API v2 for capabilities, scenes, segments.
- Automatic channel routing (LAN > MQTT > Cloud).
