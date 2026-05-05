# CLAUDE.md — ioBroker.govee-smart

> Gemeinsame ioBroker-Wissensbasis: `../CLAUDE.md` (lokal, nicht im Git). Standards dort, Projekt-Spezifisches hier.
> Vollständige API-Recherche: `/Volumes/ssd/ioBroker/Ressourcen/govee-smart/` (LAN-Protokoll, MQTT AWS IoT, ptReal BLE, Scene-Speed, Segment-Detection, Snapshot-ptReal, API-Referenz, Features-Roadmap, Konkurrenz)

## Projekt

**ioBroker Govee Smart Adapter** — Steuert Govee WiFi-Geräte: Lights (LED-Strips, Lampen, Panels), Sensoren (Thermometer/Hygrometer), Appliances (Heater, Humidifier, Kettle, Ice Maker, Fan, Purifier). LAN first für Lights, App-API + OpenAPI-MQTT für Sensoren/Appliances, Cloud REST v2 für Capabilities + Steuer-Fallback.

- **Version:** 2.5.4 (released 2026-05-05, npm latest)
- **GitHub:** https://github.com/krobipd/ioBroker.govee-smart
- **npm:** https://www.npmjs.com/package/iobroker.govee-smart
- **Runtime-Deps:** `@iobroker/adapter-core`, `mqtt`, `node-forge`
- **Tests:** 677 custom (src/lib/*.test.ts) + 57 package + integration, lint clean
- **Wiki:** komplett auditiert + bilingual EN/DE (https://github.com/krobipd/ioBroker.govee-smart/wiki)

## KRITISCH: LAN-first für Lights ist unantastbar!

- **LAN-States für Lights (power, brightness, colorRgb, colorTemperature) dürfen NIE von Cloud überschrieben werden**
- State-Definitionen: LAN-fähige Geräte → immer `getDefaultLanStates()` als Basis
- State-Werte: `loadCloudStates()` (main.ts:1340) filtert LAN-State-IDs für LAN-fähige Geräte (`if (device.lanIp && lanStateIds.has(...)) continue;`)
- `applyOnlineCap` (device-manager.ts:1490) macht Multi-Source-Online-Merge mit `lastSeenOnNetwork`-Tracking — robust gegen LAN/MQTT/Cloud-Widersprüche
- Cloud ist NUR für: Capabilities, Szenen, Snapshots, Toggles, Segmente, Sensor-Capabilities

## Kanal-Priorität pro Gerätetyp

| Feature                            | LAN UDP                    | AWS IoT MQTT (Status) | OpenAPI-MQTT (Events) | Cloud REST v2      | App-API           |
| ---------------------------------- | -------------------------- | --------------------- | --------------------- | ------------------ | ----------------- |
| Lights: Steuern                    | **primär**                 | —                     | —                     | Fallback           | —                 |
| Lights: Status anfragen            | **primär**                 | —                     | —                     | Fallback           | —                 |
| Lights: Status-Push                | —                          | **einzige Quelle**    | —                     | —                  | —                 |
| Lights: Szenen + Snapshots         | **ptReal** (BLE-Pakete)    | —                     | —                     | Fallback           | —                 |
| Lights: Segmente                   | **ptReal** (`33 05 15`)    | AA-A5 Status-Echo     | —                     | Fallback           | —                 |
| Geräteliste + Capabilities         | —                          | —                     | —                     | **einzige Quelle** | —                 |
| Sensor-Werte (Temp, Humidity)      | —                          | —                     | —                     | —                  | **einzige Quelle**|
| Appliance-Events (lackWater etc.)  | —                          | —                     | **einzige Quelle**    | —                  | —                 |

> **MQTT ist nur Status-Push.** Commands werden über LAN oder Cloud gesendet, nie über MQTT.
> **Sensoren/Appliances haben kein LAN-Protokoll** — Werte über App-API (alle 2 min) + OpenAPI-MQTT-Events.

## govee-appliances ist DEPRECATED

Seit v2.0.0 (2026-04-25) gemerged in govee-smart. Repo `iobroker.govee-appliances` archiviert. Falls Code-Pfade noch von „Koexistenz" reden — das ist Legacy. APPLIANCE_TYPES filter, MQTT-ClientID-Trennung, Rate-Budget-Sharing waren v1.x. Aktuell: ein Adapter macht alles. Memory: `project_govee_appliances_deprecated`.

## Credential-Stufen (graceful degradation)

| Eingabe          | Funktionsumfang                                                    |
| ---------------- | ------------------------------------------------------------------ |
| Nichts           | LAN-only: Discovery, Power, Brightness, Color, Status              |
| + API Key        | + Geräteliste mit Namen, Capabilities, Szenen, Snapshots, Segmente |
| + Email/Passwort | + Echtzeit Status-Push via MQTT                                    |

## Architektur

```
src/main.ts                   → Lifecycle, StateChange, Cloud State Loading, Local Snapshots, Dropdown-Reset
src/lib/segment-wizard.ts     → SegmentWizard + WizardHost — misst echte Strip-Länge, erkennt Lücken (v1.7.0 done-Flow)
src/lib/cloud-retry.ts        → CloudRetryLoop + CloudRetryHost-Interface (v1.6.3 extracted for testability)
src/lib/device-manager.ts     → Device-Map, Cloud-Loading, MQTT Status+Segment Handling, resolveSegmentCount (v1.7.0)
src/lib/capability-mapper.ts  → Capability → State Definition + buildDeviceStateDefs + Quirks + Scene Speed (907 Zeilen)
src/lib/command-router.ts     → Command Routing LAN → Cloud + Segment ptReal + Snapshot ptReal (677 Zeilen)
src/lib/state-manager.ts      → State CRUD + Cleanup + Channel Routing + Groups Online + manual-state sync (v1.7.0)
src/lib/govee-lan-client.ts   → LAN UDP (Discovery + Control + Status + ptReal BLE + Segments + Speed) (711 Zeilen)
src/lib/govee-mqtt-client.ts  → AWS IoT MQTT (Auth + Status-Push, kein Command-Senden) (391 Zeilen)
src/lib/types.ts              → Interfaces + Shared Utilities (rgbToHex, hexToRgb, classifyError) (435 Zeilen)
src/lib/govee-api-client.ts   → Undocumented API (Scene/Music/DIY Libraries, Snapshots, SKU Features) (364 Zeilen)
src/lib/govee-cloud-client.ts → Cloud REST API v2 (Devices, Capabilities, Szenen+Snapshots, Control)
src/lib/sku-cache.ts          → Persistent SKU cache (device data, scene/music/DIY libraries, snapshots) (145 Zeilen)
src/lib/rate-limiter.ts       → Rate-Limits für Cloud REST Calls
src/lib/local-snapshots.ts    → Local Snapshot Store (LAN-based save/restore, JSON files)
src/lib/device-registry.ts    → SKU-specific overrides aus devices.json (status-aware: verified/reported/seed)
src/lib/diagnostics.ts        → Ringbuffer pro Device (logs/MQTT-Pakete/API-Responses) für strukturiertes Diagnostics-JSON
src/lib/http-client.ts        → Shared HTTPS request (httpsRequest + HttpError)
```

## State Tree

Ordnername = immer `sku_shortid` (z.B. `h61be_1d6f`). Cloud-Name nur in `common.name`. Gruppen unter `groups/`.

```
govee-smart.0.
├── info.connection
├── info.mqttConnected
├── info.cloudConnected
├── devices.
│   └── h61be_1d6f.                  (SKU + letzte 4 Hex der Device-ID)
│       ├── info.name / .model / .serial / .online / .ip
│       ├── info.diagnostics_export   (Button: Diagnostik-JSON exportieren)
│       ├── info.diagnostics_result   (String: Diagnostik-JSON Ausgabe, read-only)
│       ├── control.power / .brightness / .colorRgb / .colorTemperature
│       ├── control.gradient_toggle   (Boolean: Gradient ein/aus)
│       ├── scenes.light_scene        (Dropdown: Szenen vom Gerät, lokal via ptReal)
│       ├── scenes.diy_scene          (Dropdown: User-DIY-Szenen, lokal via ptReal)
│       ├── scenes.scene_speed        (Number: Speed 0-N, nur bei Szenen mit supSpeed)
│       ├── music.music_mode / .music_sensitivity / .music_auto_color
│       ├── snapshots.snapshot           (Dropdown: Cloud-Snapshots, lokal via ptReal)
│       ├── snapshots.snapshot_local     (Dropdown: Lokale Snapshots)
│       ├── snapshots.snapshot_save      (Text: Neuen lokalen Snapshot speichern)
│       ├── snapshots.snapshot_delete    (Text: Lokalen Snapshot löschen)
│       └── segments.count / .command / .0.color / .0.brightness (dynamisch)
└── groups.
    ├── info.online                  (Cloud-Verbindungsstatus, allgemein für alle Gruppen)
    └── basegroup_1311.
        ├── info.name / .members / .membersUnreachable (dynamisch)
        ├── control.power / .brightness / .colorRgb / .colorTemperature (Fan-Out → LAN)
        ├── scenes.light_scene       (Fan-Out → ptReal, Name-basiertes Matching)
        └── music.music_mode         (Fan-Out → ptReal, Name-basiertes Matching)
```

## Szenen-Architektur (WICHTIG!)

Szenen kommen vom **separaten Scenes-Endpoint** (`POST /device/scenes`), NICHT aus den Device-Capabilities!

**Response-Format:** `{payload: {capabilities: [{type, instance, parameters: {options: [{name, value}]}}]}}`

- `lightScene` Options → Szenen-Dropdown mit Index-basierter Auswahl
- `snapshot` Options → Snapshot-Dropdown (User-gespeicherte Zustände)
- Snapshots auch als Fallback aus Device-Capabilities `dynamic_scene`/`snapshot`/`parameters.options`
- **Aktivierung:** User wählt Index → `device.scenes[idx-1].value` → direkt als `capability.value` an Control-Endpoint

### Scene Library (undokumentierte API)

- **Endpoint:** `GET https://app2.govee.com/appsku/v1/light-effect-libraries?sku=<SKU>`
- **Auth:** KEINE! Nur AppVersion + User-Agent Header nötig (public endpoint)
- Liefert erweiterte Szenen-Daten inkl. `sceneCode` für ptReal BLE-over-LAN
- Geladen via `GoveeApiClient` (eigenständiger HTTP-Client, unabhängig von MQTT)
- Response: `{data: {categories: [{scenes: [{sceneName, sceneCode, sceneId, sceneParamId}]}]}}`

## Cloud REST API v2

**Base URL:** `https://openapi.api.govee.com`
**Auth:** Header `Govee-API-Key: <key>`

### Rate Limits

- 10/min/Gerät, 10.000/Tag (allgemein)
- Appliances: **100/Tag** (!)
- Rate-Limiter schützt, Cloud nur als letzter Ausweg

### Unit-Normalisierung

Cloud API liefert nicht-standard Units: `unit.percent` → `%`, `unit.kelvin` → `K`, `unit.celsius` → `°C`

## AWS IoT MQTT

### Auth-Flow (v2 Headers erforderlich!)

1. Login: `POST app2.govee.com/.../v1/login` → token + accountId + topic
   - Headers: User-Agent, clientId, appVersion, timezone, country, envId, iotVersion
2. IoT Key: `GET app2.govee.com/.../iot/key` → endpoint + P12 cert
3. Connect: Mutual TLS, Client-ID `AP/<accountId>/<uuid>`

### Topics

- Subscribe: Account-Topic → Echtzeit Status aller Geräte
- Publish: Device-Topic → Befehle (turn, brightness, colorwc)

## LAN UDP

| Funktion  | Adresse           | Port |
| --------- | ----------------- | ---- |
| Discovery | `239.255.255.250` | 4001 |
| Antworten | Client            | 4002 |
| Commands  | Geräte-IP         | 4003 |

Nur Lights mit aktivierter LAN-Funktion in Govee Home App.

## Admin UI

Single Page, drei Sektionen:

**1. LAN (immer aktiv)** — "Geräte mit aktivierter LAN-Funktion werden automatisch gefunden"
**2. Cloud API (optional)** — API Key → "Ermöglicht Szenen, Segmente und Gerätenamen"
**3. Govee Account (optional)** — Email + Passwort → "Ermöglicht Echtzeit Status-Updates"
**4. Donation**

## Design-Prinzipien

1. **LAN first** — schnellster Kanal, Kern des Adapters, Cloud darf NIE LAN-States überschreiben
2. **MQTT für Echtzeit** — Status-Push only (kein Command-Sending)
3. **Cloud nur wo nötig** — Definitionen, Szenen, Snapshots, Segmente
4. **Graceful degradation** — ohne Credentials: LAN-only funktioniert
5. **Capability-driven** — States aus API generiert, nichts hardcodiert
6. **Szenen als echte Dropdowns** — Index-basiert, value-Payload aus Cloud; nur wenn Daten vorhanden
7. **Stabile Ordner** — `sku_shortid`, Cloud-Name nur in `common.name`
8. **Gruppen-Ordner** — BaseGroup unter `groups/`, Devices unter `devices/`
9. **Nahtlos** — User merkt nicht welcher Kanal
10. **ptReal Scene Activation** — Szenen mit sceneCode aus Scene Library werden via BLE-over-LAN (ptReal) aktiviert statt Cloud; Name-Matching mit Suffix-Stripping (-A/-B)
11. **Keine null-Werte** — Alle States haben `def` in StateDefinition + werden beim Erstellen initialisiert
12. **Stale State Cleanup** — `cleanupAllChannelStates()` entfernt alte States aus allen Channels (control, scenes, music, snapshots) + leere Channels; handelt auch Migration von altem Single-Control-Layout
13. **Error-Dedup** — `classifyError()` + `lastErrorCategory` in DeviceManager; warn nur bei Kategorie-Wechsel
14. **Rate-Limited Startup** — Scene-Loading über `rateLimiter.tryExecute()` auch beim Cloud-Init
15. **Segment-Routing** — `segmentColor:N`/`segmentBrightness:N` → LAN ptReal first (`33 05 15`), Cloud fallback; Batch-Command → multi-segment bitmask in einem Paket
16. **Shared Utilities** — `normalizeDeviceId()` + `classifyError()` in types.ts, nicht dupliziert
17. **Kein Fire-and-forget** — Alle async void-Calls haben `.catch()` Handler
18. **Dropdown-Reset** — Moduswechsel (Scene/DIY/Snapshot/Music/Color) setzt alle ANDEREN Dropdowns auf "---" (0) zurück
19. **Generic Capability Routing** — States mit `native.capabilityType/Instance` werden automatisch via Cloud API geroutet (toggle, dynamic_scene, etc.)
20. **Batch Segment Command** — `segments.command` State: `1-5:#ff0000:20`, `all:#00ff00`, `0,3,7::50` — max 2 API-Calls statt N×2
21. **MQTT Auth-Backoff** — Nach 3 konsekutiven Login-Fehlern Reconnect stoppen, actionable Warning
22. **Error-Dedup überall** — MQTT + Cloud: first warn, repeat debug; Recovery-Meldung bei Wiederherstellung
23. **MQTT Login-Klassifizierung** — Govee-Response wird differenziert: Credential-Fehler → Auth-Backoff, Rate-Limit/Account-Issues/Abnormal → weiter reconnecten (kein "check email/password")
24. **info.ip State** — LAN IP-Adresse pro Gerät unter `info.ip`, auto-aktualisiert bei LAN-Discovery via `onLanIpChanged` Callback
25. **Network Interface Selection** — `networkInterface` Config (IP-Selector im Admin), bindet Multicast + Listen auf gewähltes Interface; Ports fix (Govee-Protokoll)
26. **MQTT before Cloud** — MQTT wird vor Cloud initialisiert, damit Scene Library beim ersten loadFromCloud verfügbar ist
27. **Ready-Message Ordering** — `checkAllReady()` prüft MQTT+Cloud bevor Ready geloggt wird; Safety-Timeout **60s** (seit v1.6.0, war 30s) mit ehrlicher "noch im Aufbau"-Meldung für nicht-bereite Channels
28. **SKU Cache** — `sku-cache.ts` persistiert Device-Daten + Libraries lokal; nach erstem Start null Cloud-Calls nötig. `loadFromCache()` mergt in bereits vorhandene LAN-Geräte (Name, Capabilities, Szenen). **Seit v1.6.0:** `scenesChecked`-Flag verhindert Endlos-Refetch bei legitim leeren Scenes; `lastSeenOnNetwork`-Timestamp + `pruneStale(14)` entfernt stale Einträge; Hard-Filter bei Cloud-Load überspringt Einträge ohne capabilities
29. **Local Snapshots** — `local-snapshots.ts` speichert Gerätezustand per LAN als JSON inkl. Per-Segment Color+Brightness; Restore replayed einzelne LAN-Commands (power, brightness, color, colorTemp, segmentColor:N, segmentBrightness:N)
30. **Device Quirks** — `device-registry.ts` lädt `devices.json` und korrigiert falsche API-Daten (`colorTempRange`, `brokenPlatformApi`). Status-aware: `seed`-Quirks greifen nur mit dem Adapter-Toggle „experimentalQuirks"
31. **Scene Speed** — `sceneLibrary` enthält `speedInfo` mit `moveIn[]`-Arrays; Speed-Byte steht an Position `pageLength - 5` im scenceParam; `applySceneSpeed()` ersetzt Speed-Bytes vor dem Senden; `scenes.scene_speed` State (0-N) wird auf nächste Scene-Aktivierung angewendet
32. **Multi-Channel State Tree** — States aufgeteilt in 4 Channels: `control` (Basis), `scenes` (Szenen), `music` (Musik), `snapshots` (Aktionen); Routing über `def.channel` in StateDefinition, Pfad-Auflösung via `resolveStatePath()`
33. **Groups Fan-Out** — BaseGroup fan-out: Capabilities = Intersection der Mitgliedsgeräte; Befehle → LAN/ptReal pro Mitglied; `info.members` + dynamisches `info.membersUnreachable`; keine Snapshots/Diagnostics
34. **Dynamic Segments** — Segment-Anzahl aus Capability-Daten, überschüssige Segment-Channels werden gelöscht
35. **Diagnostics Export** — `info.diagnostics_export` Button pro Gerät erzeugt strukturiertes JSON (Capabilities, Szenen, Libraries, Quirks, State) für GitHub Issues
36. **Community Quirks** — Beiträge zu `devices.json` laufen ab v2.0 über GitHub Issues + Pull Requests (siehe CONTRIBUTING.md). Eine externe `community-quirks.json` gibt es nicht mehr
37. **Separated Concerns (seit 1.1.0)** — CommandRouter (Routing), GoveeApiClient (undoc API), http-client (shared HTTP), capability-mapper (State-Definitionen) als eigenständige Module
38. **MQTT Segment State-Sync** — `parseMqttSegmentData()` dekodiert AA A5 BLE-Pakete aus `op.command` → Per-Segment Brightness+RGB in ioBroker States; nur bei Geräten mit `segmentCount > 0`, nur bei Gradient/Color-Modus (Scene/Music liefert keine AA A5)
39. **Snapshot ptReal** — `fetchSnapshots()` holt BLE-Pakete von `/bff-app/v1/devices/snapshots`, gespeichert als `snapshotBleCmds` auf Device + SKU-Cache; Aktivierung lokal via `sendPtReal()`, Cloud-Fallback wenn keine BLE-Daten
40. **Scene Variants** — `fetchSceneLibrary()` iteriert alle `lightEffects` pro Szene (nicht nur [0]); Multi-Varianten werden als "Name-Suffix" gespeichert (z.B. "Aurora-A", "Aurora-B"); bestehende Name-Matching-Logik mit Suffix-Stripping funktioniert weiterhin
41. **Manual Segments (v1.6.0)** — `segments.manual_mode` + `segments.manual_list` pro Gerät für gekürzte LED-Strips. `parseSegmentList()` in types.ts akzeptiert `"0-9"`, `"0-8,10-14"`, Kommas, whitespace; validiert primär gegen device.segmentCount-1, Backstop 0-99. Toggle-Change triggert `handleManualSegmentsChange` in main.ts → `createSegmentStates` baut Segment-Tree neu, löscht überflüssige States. `parseSegmentBatch "all"` und `parseMqttSegmentData`-Filter honor `device.manualSegments` wenn manualMode=true
42. **Segment Detection Wizard (v1.7.0 redesign)** — jsonConfig `tabs`-Layout mit Tab "Segment-Erkennung". Der Wizard MISST die echte Strip-Länge unabhängig von Cloud (läuft bis zum Protokoll-Limit 55 oder bis User "Fertig – Strip zu Ende" klickt). Drei Action-Buttons: `yes`/`no`/`done`. `onMessage`-Handler routet `getSegmentDevices` / `segmentWizard` (start/yes/no/done/abort). In-Memory `SegmentWizardSession`, Baseline-Capture, flashSegment(idx) bright-white, 5-Min-Idle-Timeout, globaler Session-Lock. Ergebnis wird via `applyWizardResult`-Host-Callback angewendet: setzt `device.segmentCount`, setzt `manualMode` nur bei erkannten Lücken, persistiert Cache
43. **Cloud-Retry-Loop (v1.6.0)** — `CloudLoadResult` union type (`ok`/`transient`/`rate-limited`/`auth-failed`). Bei Fail: `handleCloudFailure` entscheidet — Auth-Fail stoppt permanent, Rate-Limit wartet Retry-After, transient 5min. Retry ruft `retryCloudOnce` auf, "Govee Cloud connection restored"-Log bei Erfolg. Cloud-Init via Promise.race 60s-Timeout
44. **Segment-Count Single-Source-of-Truth (v1.7.0)** — `resolveSegmentCount(device)` ist DIE eine Funktion für die Segmentzahl. Priorität: `device.segmentCount` (wenn gesetzt — aus Cache oder MQTT gelernt) → Min über positive `segment_color_setting`-Caps → 0. Warum Min: Govee meldet Brightness + ColorRgb separat, diese widersprechen sich (H70D1: 10 vs 15 echter Wert 10). MQTT AA A5 darf nach oben korrigieren; jede Änderung wird sofort im SKU-Cache persistiert (überlebt Restart). Cache persistiert auch `manualMode`+`manualSegments` — Cut-Strip-Einstellungen gehen nicht mehr verloren
45. **Dropdown Dual-Write (v1.11.0)** — Alle Dropdown-States (light_scene, diy_scene, snapshot_cloud, snapshot_local, music_mode, scene) sind `type: "mixed"` mit eindeutiger `common.states`-Map (`buildUniqueLabelMap` mit `(2)`/`(3)`-Suffix bei Duplikaten). `onStateChange` ruft `resolveDropdownInput` als erste Stage — löst Number/Number-String/Klartext-String case-insensitive auf den kanonischen Key auf, ack mit canonical Key zurück. Ein Code-Pfad für alle Dropdowns, keine Sonderfälle. Ohne dieses Pattern wirft js-controller `expects type string but received number`-Warning bei Number-Schreibung und Klartext bleibt schlicht ohne Wirkung

## Logging-Philosophie (seit 0.9.4)

- **Startup:** `Starting with channels: LAN, Cloud, MQTT — please wait...`
- **Ready:** Summary mit Per-Device-Details (LAN IP, Kanäle, Szenen-Anzahl)
- **Keine Redundanz:** Jede Info nur einmal (im Ready-Summary)
- **debug:** Routine (LAN scan, Discovery, Cache, State-Ops) — kein "LAN scan sent", keine "Default xxx" Zeilen
- **info:** Nur Start, Verbindungen, Ready-Summary, Snapshot-Ops
- **MQTT:** Erstverbindung = info, Reconnect-Versuche = debug, Restored = info

## Patterns aus v2.x Bug-Fix-Welle (für künftige Releases beherzigen)

46. **Race-Condition State-Delete (v2.5.2)** — Bei States die abhängig vom dynamischen Zustand „existieren oder nicht" sein sollen (z.B. `groups.*.info.membersUnreachable` nur wenn unreachable members) gibt's einen js-controller-WARN „has no existing object" wenn parallele async-Update-Pfade die Object-Lifecycle togglen. Lösung: state IMMER existent halten + bei „nichts zu zeigen" empty-string schreiben. Kein Object-Lifecycle-Toggle, keine Race. Detail: `state-manager.ts:800 updateGroupMembersUnreachable`.
47. **Echo-Cap defensive (v2.5.3)** — Wenn ein BLE-Paket-Echo (z.B. Wizard `segmentBatch` mit 0..SEGMENT_HARD_MAX) Indices oberhalb des echten `device.segmentCount` enthält, schreibt das ohne Filter in nicht-existierende States → js-controller WARN-Spam. `onSegmentBatchUpdate` + `onMqttSegmentUpdate` filtern jetzt defensiv `if (cap === 0 || idx >= cap) continue;`. Detail: `main.ts:234`.
48. **No-Channel Init-Race (v2.5.3)** — Cloud-only Geräte (z.B. H61A8 ohne LAN) auf user-Befehl direkt nach Restart: Cloud-Client noch null → CommandRouter warnt „No channel available". False alarm. Fix: wenn `channels.cloud === true && cloudClient === null` → debug + still verworfen. WARN nur wenn permanent kein Channel. Detail: `command-router.ts:204`.
49. **429 RATE_LIMIT Bug (v2.5.1)** — `classifyError` prüft err.message für Patterns; HttpError(429, "Too many requests") matcht „Rate limited" nicht → UNKNOWN. Cloud-Client hat jetzt expliziten Branch `if (err instanceof HttpError && err.statusCode === 429) lastErrorCategory = RATE_LIMIT`. Sonst zeigt der Ready-Hint die generische „Cloud request failed"-Meldung statt „rate-limited by Govee". Detail: `govee-cloud-client.ts:240`.
50. **httpsRequest + mqtt.connect-DI (v2.5.1, v2.5.4)** — GoveeCloudClient + GoveeMqttClient haben optionale Konstruktor-Parameter `httpsRequestImpl: HttpsRequestFn = httpsRequest` und `mqttConnectImpl: MqttConnectFn = mqtt.connect`. main.ts unverändert (default = real). Tests injizieren Fakes für unit-tests ohne Network. Pattern für andere I/O-Module übernehmbar.
51. **Button-State = Write-true-Pattern** — `role: "button"`-States im ioBroker werden NICHT durch Klick-auf-Knopf-Eintrag im Object-Browser ausgelöst — User muss `true` auf den State schreiben. In Wiki und User-Doku entsprechend formulieren („setze X auf true", nie „klicke auf X"). Memory: `feedback_iobroker_button_role_write`.
52. **Wiki-User-Doku-Sicht** — Wiki ist USER-doku, nicht DEV-doku. Knapp formulieren, ioBroker-Grundkenntnisse voraussetzen. Keine „in ioBroker-Objekte → Bearbeiten → Wert auf true → Speichern"-Megaschritte. Memory: `feedback_iobroker_button_role_write`.
53. **Mocha ESM-Loader-Falle bei test-helpers** — In dieser test-suite tripped der ESM-Loader wenn der alphabetisch ERSTE test-file einen non-`.test.ts` sibling importiert. Folge-Imports ohne explicit Extension werfen `ERR_MODULE_NOT_FOUND`. test-helpers.ts funktioniert in govee-cloud/govee-mqtt-tests (alphabetisch nach device-manager). Workaround: Helpers in device-manager.test.ts INLINE lassen, JSDoc-Kommentar im File. Memory: `feedback_mocha_esm_loader_bug`.

## Tests (677 custom + 57 package + integration)

```
test/testCapabilityMapper.ts → Capability Mapping + Cloud State Value Mapping + Quirks + Groups + Drift (80)
  - mapCapabilities: on_off, range, color, scenes, property, toggle, LAN defaults
  - mapCapabilities branches: segment, dynamic_scene, music, work_mode, unknown, edge cases
  - mapCloudStateValue: all types, null/undefined, unknown capability, edge cases
  - applyQuirksToStates: known SKU, unknown SKU, non-colorTemp
  - buildDeviceStateDefs groups: no members, control intersection, scene/music intersection, Cloud-only caps, unreachable
  - Drift: API schema violations — non-array/malformed/null/undefined, missing parameters, string coercion
test/testCloudRetry.ts       → Cloud-Retry-Loop state machine (24)
  - handleResult: transient / rate-limited / auth-failed / ok
  - Retry scheduling: retryAfterMs respect, 5-min transient backoff, auth stops permanently
  - onCloudRestored callback firing order
test/testDeviceManager.ts    → Device Manager + CommandRouter + Drift (123)
  - LAN discovery, IP update, MQTT status, unknown device/IP handling
  - sendCommand channel routing: LAN→Cloud fallback, ptReal scene, segment→LAN ptReal, gradient, snapshot ptReal
  - toCloudValue: power, brightness, color hex→int, scene/snapshot/diy index lookup, segments
  - parseSegmentBatch: range, all, comma, brightness-only, clamp, invalid, mixed
  - findCapabilityForCommand: all command types, unknown, empty caps, non-array, malformed entries
  - Drift: malformed cloud device list, non-string sku/device, non-array caps, null entries
  - logDedup: category tracking, warn vs debug
  - handleMqttStatus edge cases + segment sync (AA A5 callback path)
  - handleLanStatus edge cases: zero brightness, colorTemInKelvin 0
  - DIY scene via LAN: library match, no match fallback
  - colorTemperature via LAN, no channel warning
  - generateDiagnostics: all data, quirks
  - parseMqttSegmentData: single packet, multi-packet indices, limit, non-AA-A5 filter, empty/zero/invalid, full 5-packet
  - resolveSegmentCount: cache-wins, Cloud-min fallback, widersprüchliche Caps
  - getEffectiveSegmentIndices: manualMode on/off, empty, edge cases
test/testDeviceRegistry.ts   → DeviceRegistry / devices.json loader (~25)
  - getQuirks/getEntry/getStatus/getName, status-Filter (verified/reported active, seed gated by experimentalQuirks toggle), case-insensitive lookup, applyColorTempQuirk against runtime
test/testDiagnostics.ts      → Diagnostics ring buffer (logs/MQTT-Pakete/Endpoint-Responses)
test/testLocalSnapshots.ts   → Local Snapshots + Drift (17)
  - Create dir, empty device, save/retrieve, overwrite, multiple, delete, non-existent, per-device, corrupt, colorTemp
  - Segment data: save/retrieve with segments, backwards compat, overwrite
  - Drift: non-string deviceId/sku must not throw
test/testLanClient.ts        → LAN Client BLE Packet Builder (35)
  - buildScenePackets: activation, little-endian, A3 data, XOR checksum, empty param
  - buildGradientPacket: ON, OFF, checksum
  - buildMusicModePacket: Energic, Spectrum, Rolling, Rhythm, checksum
  - buildDiyPackets: activation-only, A1 data, checksums
  - buildSegmentBitmask / SegmentColorPacket / SegmentBrightnessPacket: verified against real captures
  - flashSingleSegment + restoreAllSegments atomic datagram builds
  - applySceneSpeed: single page, multi-page, no match, empty/invalid, out-of-range
test/testRateLimiter.ts      → Rate Limiter (11)
  - Limits, daily usage, queueing, priority sorting, stop/clear, counter tracking
test/testSegmentWizard.ts    → Segment-Detection-Wizard state machine (39)
  - runStep routing: start / yes / no / done / abort / unknown action
  - start: device-not-found, no-segment-capability, already-active guard, baseline capture, initial flash
  - answer: visible vs dark tracking, advance, auto-finalize at SEGMENT_HARD_MAX
  - done: requires at least one answer, finalizes with contiguous or gaps
  - finish: applyWizardResult host call, restoreBaseline, session close
  - compactIndices: range-notation output
  - Idle timeout: 5-min auto-abort, clearIdleTimer on dispose
test/testSkuCache.ts         → SKU Cache + Drift (23)
  - Create dir, empty cache, save/loadAll, overwrite, separate devices, same SKU, clear, corrupt, normalized ID, libraries, null features
  - pruneStale: age-based eviction, scenesChecked-guard
  - segmentCount / manualMode / manualSegments round-trip (cut-strip persistence)
  - Drift: non-string deviceId/sku must not throw
test/testTypes.ts            → Shared Utilities + Drift (57)
  - normalizeDeviceId: colons, lowercase, empty string, undefined/null/number/object safe returns
  - rgbToHex / hexToRgb / rgbIntToHex: standard + edge cases
  - classifyError: NETWORK, TIMEOUT, AUTH, RATE_LIMIT, UNKNOWN, string/non-Error, .code property
  - parseSegmentList: comma / range / mixed / whitespace / dedupe / sort / invalid / reversed / per-device-max / hard-backstop
test/testStateManager.ts     → State Manager (49)
  - devicePrefix: SKU+shortId, BaseGroup folder, special chars, colons
  - createDeviceStates: device+info+control, native props, defaults, unit/min/max, no IP, BaseGroup no model/serial/ip/online
  - createDeviceStates channels: scenes / music / snapshot routing, multi-channel
  - createGroupsOnlineState: create + update
  - group members: info.members with groupMembers, empty members, diagnostics cleanup
  - updateGroupMembersUnreachable: create when unreachable, delete when all reachable
  - resolveStatePath: control, scenes, music, snapshots, diagnostics, unknown→control
  - updateDeviceState / cleanupDevices / cleanupAllChannelStates (stale removal, empty channel, migration, dropdown reset)
  - createSegmentStates: per-segment states, default, excess cleanup, no fields, manual-mode list normalisation
test/testPackageFiles.ts     → @iobroker/testing (57)
```

## Versionshistorie (letzte 7)

| Version | Highlights |
| ------- | ---------- |
| 2.5.4 | mqtt.connect-DI als optionaler Konstruktor-Parameter (analog httpsRequest in v2.5.1), 7 neue Mock-Tests für getIotKey-Pfad + persisted-credentials reuse (670→677 Tests) |
| 2.5.3 | Issue #8 (tukey42) Fix: Segment-Wizard-WARN-Spam für indices oberhalb device.segmentCount weg (defensive Cap-Filter in onSegmentBatchUpdate + onMqttSegmentUpdate). Plus: „No channel available"-WARN bei Cloud-Init-Race (Cloud-only Gerät direkt nach Restart) ist jetzt debug — false alarm |
| 2.5.2 | membersUnreachable-WARN-Spam alle 2 min weg: state IMMER existent halten + bei alle-reachable empty-string statt safeDeleteState (Race-condition zwischen parallelen Updates). Plus: H61A8 Outdoor Neon LED Strip 10m verified (Issue #11) |
| 2.5.1 | 429 RATE_LIMIT Bug-Fix: HttpError-statusCode jetzt explizit als RATE_LIMIT klassifiziert (classifyError schaut nur in err.message und „Too many requests" matchte nichts). Plus: httpsRequest-DI in CloudClient + MqttClient, +33 Mock-Tests |
| 2.5.0 | F4 final — MessageRouter-Extraktion: lib/message-router.ts mit Host-Interface. main.ts ~150 Zeilen kleiner, onMessage/handleMessage/runMqttAuthAction isoliert testbar |
| 2.4.1 | F4 weiter — GroupFanoutHandler-Extraktion: lib/group-fanout.ts mit Host-Interface |
| 2.4.0 | F4 partial — SnapshotHandler-Extraktion: lib/snapshot-handler.ts mit Host-Interface |

(ältere in `CHANGELOG_OLD.md` des Repos)

## Konkurrenz-Lage (Stand 2026-05)

- Schwester-Adapter `iobroker.govee` ist veraltet (nur LAN, keine MQTT, keine Sensoren/Appliances) — diese Implementation ist die einzige Govee-Lösung im Latest-Repo mit voller Multi-Channel + ptReal + Wizard.
- ioBroker.repositories PR #5824 für Latest-Aufnahme offen seit v2.0.0-Ära, wartet auf mcm1957-Review.

## Befehle

```bash
npm run build        # Production (esbuild)
npm run build:test   # Test build (tsc)
npm test             # Build + mocha
npm run lint         # ESLint + Prettier
```
