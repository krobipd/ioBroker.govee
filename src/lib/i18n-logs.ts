/**
 * Localized log strings — info/warn/error end up in the ioBroker Admin log
 * viewer (user-facing). Translations in 11 languages, matching
 * `admin/i18n/<lang>/translations.json`.
 *
 * Active language is read once in `main.onReady` from `system.config.language`
 * and passed into every helper class that emits user-visible logs. A language
 * change in Admin needs an adapter restart — acceptable, users don't switch
 * languages every minute.
 *
 * Debug logs stay English (maintainer diagnostics, not visible at default
 * loglevel). Stack traces stay in their original form (code paths aren't
 * translatable).
 */

const SUPPORTED_LANGS = ["en", "de", "ru", "pt", "nl", "fr", "it", "es", "pl", "uk", "zh-cn"] as const;
type Lang = (typeof SUPPORTED_LANGS)[number];

// Module-level active language. ioBroker spawns one Node process per adapter
// instance, so module state is effectively per-instance — no cross-instance
// leakage. main.onReady calls setActiveLang() once after reading
// system.config.language; helper classes then call tLog(key, params) without
// having to plumb the language through every constructor.
let activeLang: Lang = "en";

/**
 * Sets the active language for `tLog()`. Called once from `main.onReady` with
 * the value from `system.config.language`. Unknown values fall back to `en`.
 *
 * @param lang ioBroker system language (`'en'`, `'de'`, …).
 */
export function setActiveLang(lang: string): void {
  activeLang = (SUPPORTED_LANGS as readonly string[]).includes(lang) ? (lang as Lang) : "en";
}

/**
 * Token substitution: `{name}` in the template is replaced by `params.name`.
 * Accepts null/undefined explicitly — callers don't need to pre-branch.
 *
 * @param template Log string with `{key}` placeholders.
 * @param params   Values for the placeholders; null → `(none)`, undefined →
 *                 token literal.
 */
function fmt(template: string, params?: Record<string, string | number | null | undefined>): string {
  if (!params) {
    return template;
  }
  return template.replace(/\{(\w+)\}/g, (_, key: string) => {
    const v = params[key];
    if (v === null) {
      return "(none)";
    }
    if (v === undefined) {
      return `{${key}}`;
    }
    return String(v);
  });
}

/**
 * All user-visible info/warn/error strings. Keys are speaking; each value is a
 * bundle with 11 languages. Tech internals (`mode='X'`, module prefixes) are
 * deliberately left out — user logs should be user-readable, not developer
 * diagnostics.
 */
export const LOG_STRINGS = {
  // ---- Lifecycle -------------------------------------------------------
  starting: {
    en: "Starting ({channels})",
    de: "Starte ({channels})",
    ru: "Запуск ({channels})",
    pt: "A iniciar ({channels})",
    nl: "Starten ({channels})",
    fr: "Démarrage ({channels})",
    it: "Avvio ({channels})",
    es: "Iniciando ({channels})",
    pl: "Start ({channels})",
    uk: "Запуск ({channels})",
    "zh-cn": "正在启动 ({channels})",
  },
  ready: {
    en: "Govee adapter ready — {summary} — channels: {channels}",
    de: "Govee-Adapter bereit — {summary} — Kanäle: {channels}",
    ru: "Govee-адаптер готов — {summary} — каналы: {channels}",
    pt: "Adaptador Govee pronto — {summary} — canais: {channels}",
    nl: "Govee-adapter klaar — {summary} — kanalen: {channels}",
    fr: "Adaptateur Govee prêt — {summary} — canaux : {channels}",
    it: "Adattatore Govee pronto — {summary} — canali: {channels}",
    es: "Adaptador Govee listo — {summary} — canales: {channels}",
    pl: "Adapter Govee gotowy — {summary} — kanały: {channels}",
    uk: "Govee-адаптер готовий — {summary} — канали: {channels}",
    "zh-cn": "Govee 适配器就绪 — {summary} — 通道：{channels}",
  },
  // ---- Cloud / MQTT connection state -----------------------------------
  cloudNotConnected: {
    en: "Cloud not connected — {reason}",
    de: "Cloud nicht verbunden — {reason}",
    ru: "Cloud не подключен — {reason}",
    pt: "Cloud não ligado — {reason}",
    nl: "Cloud niet verbonden — {reason}",
    fr: "Cloud non connecté — {reason}",
    it: "Cloud non connesso — {reason}",
    es: "Cloud no conectado — {reason}",
    pl: "Cloud niepołączony — {reason}",
    uk: "Cloud не під’єднано — {reason}",
    "zh-cn": "Cloud 未连接 — {reason}",
  },
  cloudNotConnectedNoReason: {
    en: "Cloud not connected — see earlier errors",
    de: "Cloud nicht verbunden — siehe vorhergehende Fehler",
    ru: "Cloud не подключен — см. предыдущие ошибки",
    pt: "Cloud não ligado — ver erros anteriores",
    nl: "Cloud niet verbonden — zie eerdere fouten",
    fr: "Cloud non connecté — voir erreurs précédentes",
    it: "Cloud non connesso — vedi errori precedenti",
    es: "Cloud no conectado — ver errores anteriores",
    pl: "Cloud niepołączony — patrz wcześniejsze błędy",
    uk: "Cloud не під’єднано — див. попередні помилки",
    "zh-cn": "Cloud 未连接 — 请查看先前的错误",
  },
  mqttNotConnected: {
    en: "MQTT not connected — {reason}",
    de: "MQTT nicht verbunden — {reason}",
    ru: "MQTT не подключен — {reason}",
    pt: "MQTT não ligado — {reason}",
    nl: "MQTT niet verbonden — {reason}",
    fr: "MQTT non connecté — {reason}",
    it: "MQTT non connesso — {reason}",
    es: "MQTT no conectado — {reason}",
    pl: "MQTT niepołączony — {reason}",
    uk: "MQTT не під’єднано — {reason}",
    "zh-cn": "MQTT 未连接 — {reason}",
  },
  mqttNotConnectedNoReason: {
    en: "MQTT not connected — see earlier errors",
    de: "MQTT nicht verbunden — siehe vorhergehende Fehler",
    ru: "MQTT не подключен — см. предыдущие ошибки",
    pt: "MQTT não ligado — ver erros anteriores",
    nl: "MQTT niet verbonden — zie eerdere fouten",
    fr: "MQTT non connecté — voir erreurs précédentes",
    it: "MQTT non connesso — vedi errori precedenti",
    es: "MQTT no conectado — ver errores anteriores",
    pl: "MQTT niepołączony — patrz wcześniejsze błędy",
    uk: "MQTT не під’єднано — див. попередні помилки",
    "zh-cn": "MQTT 未连接 — 请查看先前的错误",
  },
  mqttConnected: {
    en: "MQTT connected",
    de: "MQTT verbunden",
    ru: "MQTT подключен",
    pt: "MQTT ligado",
    nl: "MQTT verbonden",
    fr: "MQTT connecté",
    it: "MQTT connesso",
    es: "MQTT conectado",
    pl: "MQTT połączony",
    uk: "MQTT під’єднано",
    "zh-cn": "MQTT 已连接",
  },
  mqttConnectionRestored: {
    en: "MQTT connection restored",
    de: "MQTT-Verbindung wiederhergestellt",
    ru: "MQTT-соединение восстановлено",
    pt: "Ligação MQTT restaurada",
    nl: "MQTT-verbinding hersteld",
    fr: "Connexion MQTT restaurée",
    it: "Connessione MQTT ripristinata",
    es: "Conexión MQTT restaurada",
    pl: "Połączenie MQTT przywrócone",
    uk: "MQTT-з’єднання відновлено",
    "zh-cn": "MQTT 连接已恢复",
  },
  mqttSubscribeFailed: {
    en: "MQTT subscribe failed: {error}",
    de: "MQTT-Subscribe fehlgeschlagen: {error}",
    ru: "MQTT subscribe не удался: {error}",
    pt: "MQTT subscribe falhou: {error}",
    nl: "MQTT subscribe mislukt: {error}",
    fr: "MQTT subscribe a échoué : {error}",
    it: "MQTT subscribe fallito: {error}",
    es: "MQTT subscribe falló: {error}",
    pl: "MQTT subscribe nieudany: {error}",
    uk: "MQTT subscribe не вдався: {error}",
    "zh-cn": "MQTT 订阅失败：{error}",
  },
  mqttVerificationNeeded: {
    en: "MQTT not connected: Govee asked for verification — request a code in adapter settings",
    de: "MQTT nicht verbunden: Govee verlangt eine Verifizierung — Code in den Adapter-Einstellungen anfordern",
    ru: "MQTT не подключен: Govee требует verification — запросите код в настройках адаптера",
    pt: "MQTT não ligado: Govee pediu verificação — pedir um código nas definições do adaptador",
    nl: "MQTT niet verbonden: Govee vraagt om verificatie — vraag een code aan in de adapterinstellingen",
    fr: "MQTT non connecté : Govee demande une vérification — demandez un code dans les paramètres de l’adaptateur",
    it: "MQTT non connesso: Govee chiede una verifica — richiedi un codice nelle impostazioni dell’adattatore",
    es: "MQTT no conectado: Govee pide verificación — solicita un código en los ajustes del adaptador",
    pl: "MQTT niepołączony: Govee wymaga weryfikacji — poproś o kod w ustawieniach adaptera",
    uk: "MQTT не під’єднано: Govee вимагає підтвердження — запитайте код у налаштуваннях адаптера",
    "zh-cn": "MQTT 未连接：Govee 要求验证 — 请在适配器设置中申请验证码",
  },
  mqttVerificationRejected: {
    en: "MQTT not connected: verification code rejected — request a fresh code",
    de: "MQTT nicht verbunden: Verifizierungs-Code abgelehnt — neuen Code anfordern",
    ru: "MQTT не подключен: verification-код отклонён — запросите новый",
    pt: "MQTT não ligado: código de verificação rejeitado — peça um novo",
    nl: "MQTT niet verbonden: verificatiecode geweigerd — vraag een nieuwe aan",
    fr: "MQTT non connecté : code de vérification rejeté — demandez un nouveau code",
    it: "MQTT non connesso: codice di verifica rifiutato — richiedi un nuovo codice",
    es: "MQTT no conectado: código de verificación rechazado — solicita uno nuevo",
    pl: "MQTT niepołączony: kod weryfikacyjny odrzucony — poproś o nowy",
    uk: "MQTT не під’єднано: код підтвердження відхилено — запитайте новий",
    "zh-cn": "MQTT 未连接：验证码被拒绝 — 请申请新验证码",
  },
  mqttLoginRejected: {
    en: "MQTT not connected: login rejected — check email/password",
    de: "MQTT nicht verbunden: Login abgelehnt — Email/Passwort prüfen",
    ru: "MQTT не подключен: вход отклонён — проверьте email/пароль",
    pt: "MQTT não ligado: login recusado — verificar email/palavra-passe",
    nl: "MQTT niet verbonden: aanmelding geweigerd — controleer e-mail/wachtwoord",
    fr: "MQTT non connecté : connexion refusée — vérifiez email/mot de passe",
    it: "MQTT non connesso: login rifiutato — verificare email/password",
    es: "MQTT no conectado: inicio de sesión rechazado — comprobar email/contraseña",
    pl: "MQTT niepołączony: logowanie odrzucone — sprawdź email/hasło",
    uk: "MQTT не під’єднано: вхід відхилено — перевірте email/пароль",
    "zh-cn": "MQTT 未连接：登录被拒 — 请检查邮箱/密码",
  },
  cloudEventsRestored: {
    en: "Cloud-events connection restored",
    de: "Cloud-Events-Verbindung wiederhergestellt",
    ru: "Cloud-events соединение восстановлено",
    pt: "Ligação Cloud-events restaurada",
    nl: "Cloud-events-verbinding hersteld",
    fr: "Connexion Cloud-events restaurée",
    it: "Connessione Cloud-events ripristinata",
    es: "Conexión Cloud-events restaurada",
    pl: "Połączenie Cloud-events przywrócone",
    uk: "Cloud-events з’єднання відновлено",
    "zh-cn": "Cloud-events 连接已恢复",
  },
  cloudEventsSubscribeFailed: {
    en: "Cloud-events subscribe failed: {error}",
    de: "Cloud-Events-Subscribe fehlgeschlagen: {error}",
    ru: "Cloud-events subscribe не удался: {error}",
    pt: "Cloud-events subscribe falhou: {error}",
    nl: "Cloud-events subscribe mislukt: {error}",
    fr: "Cloud-events subscribe a échoué : {error}",
    it: "Cloud-events subscribe fallito: {error}",
    es: "Cloud-events subscribe falló: {error}",
    pl: "Cloud-events subscribe nieudany: {error}",
    uk: "Cloud-events subscribe не вдався: {error}",
    "zh-cn": "Cloud-events 订阅失败：{error}",
  },
  cloudEventsAuthFailed: {
    en: "Cloud-events auth failed repeatedly — check API key",
    de: "Cloud-Events Auth wiederholt fehlgeschlagen — API-Key prüfen",
    ru: "Cloud-events auth повторно не удался — проверьте API-ключ",
    pt: "Auth de Cloud-events falhou repetidamente — verificar API key",
    nl: "Cloud-events-auth herhaaldelijk mislukt — controleer API-sleutel",
    fr: "L’auth Cloud-events a échoué plusieurs fois — vérifiez la clé API",
    it: "Auth Cloud-events fallita ripetutamente — verifica API key",
    es: "Auth Cloud-events falló repetidamente — comprobar API key",
    pl: "Auth Cloud-events wielokrotnie nieudana — sprawdź klucz API",
    uk: "Cloud-events auth неодноразово не вдалася — перевірте API-ключ",
    "zh-cn": "Cloud-events 验证多次失败 — 请检查 API 密钥",
  },
  // ---- LAN -------------------------------------------------------------
  lanBindingInterface: {
    en: "LAN binding to network interface {bindAddr}",
    de: "LAN bindet auf Interface {bindAddr}",
    ru: "LAN привязан к сетевому интерфейсу {bindAddr}",
    pt: "LAN ligado à interface de rede {bindAddr}",
    nl: "LAN gebonden aan interface {bindAddr}",
    fr: "LAN lié à l'interface {bindAddr}",
    it: "LAN collegato all’interfaccia {bindAddr}",
    es: "LAN enlazado a la interfaz {bindAddr}",
    pl: "LAN powiązany z interfejsem {bindAddr}",
    uk: "LAN прив’язано до інтерфейсу {bindAddr}",
    "zh-cn": "LAN 绑定到网络接口 {bindAddr}",
  },
  lanPortInUse: {
    en: "LAN listen port {port} already in use — second instance? Status updates will be lost.",
    de: "LAN-Port {port} ist belegt — zweite Instanz? Status-Updates gehen verloren.",
    ru: "LAN-порт {port} занят — вторая инстанция? Статус-обновления будут потеряны.",
    pt: "Porta LAN {port} já em uso — segunda instância? Atualizações de estado perdem-se.",
    nl: "LAN-poort {port} al in gebruik — tweede instantie? Status-updates gaan verloren.",
    fr: "Port LAN {port} déjà utilisé — seconde instance ? Les mises à jour seront perdues.",
    it: "Porta LAN {port} già in uso — seconda istanza? Gli aggiornamenti di stato andranno persi.",
    es: "Puerto LAN {port} ya en uso — ¿segunda instancia? Las actualizaciones de estado se perderán.",
    pl: "Port LAN {port} jest już zajęty — druga instancja? Aktualizacje statusu zostaną utracone.",
    uk: "LAN-порт {port} вже використовується — друга інстанція? Оновлення статусу будуть втрачені.",
    "zh-cn": "LAN 端口 {port} 已被占用 — 第二个实例？状态更新将丢失。",
  },
  // ---- Cache / data state ----------------------------------------------
  usingCachedData: {
    en: "Using cached device data — no Cloud calls needed",
    de: "Geräte-Daten aus Cache — keine Cloud-Calls nötig",
    ru: "Используются кешированные данные устройств — Cloud не нужен",
    pt: "Usando dados em cache — sem chamadas à Cloud",
    nl: "Apparaatgegevens uit cache — geen Cloud-aanroepen nodig",
    fr: "Données d’appareil en cache — pas d’appel Cloud nécessaire",
    it: "Dati dispositivo dalla cache — nessuna chiamata Cloud necessaria",
    es: "Datos de dispositivo desde caché — sin llamadas Cloud",
    pl: "Dane urządzeń z cache — bez wywołań Cloud",
    uk: "Дані пристроїв із кешу — без викликів до Cloud",
    "zh-cn": "使用缓存的设备数据 — 无需 Cloud 调用",
  },
  loadedFromCache: {
    en: "Loaded {count} device(s) from cache",
    de: "{count} Gerät(e) aus Cache geladen",
    ru: "Загружено {count} устройств(а) из кеша",
    pt: "Carregados {count} dispositivos do cache",
    nl: "{count} apparaat(en) uit cache geladen",
    fr: "{count} appareil(s) chargé(s) depuis le cache",
    it: "Caricati {count} dispositivi dalla cache",
    es: "Cargados {count} dispositivos desde caché",
    pl: "Załadowano {count} urządzeń z cache",
    uk: "Завантажено {count} пристроїв із кешу",
    "zh-cn": "从缓存加载了 {count} 个设备",
  },
  cachePruned: {
    en: "Cache: pruned {count} stale entries (not seen on network for {days}+ days)",
    de: "Cache: {count} veraltete Einträge entfernt (nicht im Netz seit {days}+ Tagen)",
    ru: "Cache: удалено {count} устаревших записей (не видно в сети {days}+ дней)",
    pt: "Cache: removidas {count} entradas obsoletas (sem rede há {days}+ dias)",
    nl: "Cache: {count} verouderde items verwijderd (niet gezien in {days}+ dagen)",
    fr: "Cache : {count} entrées obsolètes supprimées (absentes du réseau depuis {days}+ jours)",
    it: "Cache: rimosse {count} voci obsolete (non viste sulla rete da {days}+ giorni)",
    es: "Cache: eliminadas {count} entradas obsoletas (sin red desde hace {days}+ días)",
    pl: "Cache: usunięto {count} przestarzałych wpisów (brak w sieci od {days}+ dni)",
    uk: "Cache: видалено {count} застарілих записів (немає в мережі понад {days} днів)",
    "zh-cn": "缓存：清理了 {count} 个过期条目（{days}+ 天未在网络中出现）",
  },
  cacheNotWritable: {
    en: "Cache directory not writable ({path}): {error}",
    de: "Cache-Verzeichnis nicht beschreibbar ({path}): {error}",
    ru: "Каталог cache недоступен для записи ({path}): {error}",
    pt: "Pasta de cache sem permissão de escrita ({path}): {error}",
    nl: "Cachemap niet schrijfbaar ({path}): {error}",
    fr: "Dossier cache non inscriptible ({path}) : {error}",
    it: "Cartella cache non scrivibile ({path}): {error}",
    es: "Directorio de caché no escribible ({path}): {error}",
    pl: "Katalog cache bez praw zapisu ({path}): {error}",
    uk: "Каталог cache без прав запису ({path}): {error}",
    "zh-cn": "缓存目录不可写（{path}）：{error}",
  },
  cacheWriteFailed: {
    en: "Cache write failed for {sku}: {error}",
    de: "Cache-Schreiben fehlgeschlagen für {sku}: {error}",
    ru: "Cache запись не удалась для {sku}: {error}",
    pt: "Falha ao escrever cache para {sku}: {error}",
    nl: "Cache schrijven mislukt voor {sku}: {error}",
    fr: "Écriture cache échouée pour {sku} : {error}",
    it: "Scrittura cache fallita per {sku}: {error}",
    es: "Fallo al escribir caché para {sku}: {error}",
    pl: "Zapis cache nie powiódł się dla {sku}: {error}",
    uk: "Запис cache не вдався для {sku}: {error}",
    "zh-cn": "{sku} 的缓存写入失败：{error}",
  },
  // ---- Snapshots / Diagnostics -----------------------------------------
  snapshotDirNotWritable: {
    en: "Snapshot directory not writable ({path}): {error}",
    de: "Snapshot-Verzeichnis nicht beschreibbar ({path}): {error}",
    ru: "Каталог snapshot недоступен для записи ({path}): {error}",
    pt: "Pasta de snapshots sem permissão de escrita ({path}): {error}",
    nl: "Snapshot-map niet schrijfbaar ({path}): {error}",
    fr: "Dossier snapshots non inscriptible ({path}) : {error}",
    it: "Cartella snapshot non scrivibile ({path}): {error}",
    es: "Directorio de snapshots no escribible ({path}): {error}",
    pl: "Katalog snapshot bez praw zapisu ({path}): {error}",
    uk: "Каталог snapshot без прав запису ({path}): {error}",
    "zh-cn": "快照目录不可写（{path}）：{error}",
  },
  snapshotWriteFailed: {
    en: "Snapshot write failed for {sku}: {error}",
    de: "Snapshot-Schreiben fehlgeschlagen für {sku}: {error}",
    ru: "Snapshot запись не удалась для {sku}: {error}",
    pt: "Falha ao escrever snapshot para {sku}: {error}",
    nl: "Snapshot schrijven mislukt voor {sku}: {error}",
    fr: "Écriture snapshot échouée pour {sku} : {error}",
    it: "Scrittura snapshot fallita per {sku}: {error}",
    es: "Fallo al escribir snapshot para {sku}: {error}",
    pl: "Zapis snapshot nie powiódł się dla {sku}: {error}",
    uk: "Запис snapshot не вдався для {sku}: {error}",
    "zh-cn": "{sku} 的快照写入失败：{error}",
  },
  diagnosticsExported: {
    en: "Diagnostics exported for {name} ({sku})",
    de: "Diagnostik exportiert für {name} ({sku})",
    ru: "Диагностика экспортирована для {name} ({sku})",
    pt: "Diagnóstico exportado para {name} ({sku})",
    nl: "Diagnose geëxporteerd voor {name} ({sku})",
    fr: "Diagnostic exporté pour {name} ({sku})",
    it: "Diagnostica esportata per {name} ({sku})",
    es: "Diagnóstico exportado para {name} ({sku})",
    pl: "Diagnostyka wyeksportowana dla {name} ({sku})",
    uk: "Діагностика експортована для {name} ({sku})",
    "zh-cn": "已为 {name}（{sku}）导出诊断",
  },
  // ---- Refresh / data update -------------------------------------------
  refreshNoCloudClient: {
    en: "Refresh cloud data: no Cloud client configured (API key missing) — nothing to do",
    de: "Cloud-Refresh: kein Cloud-Client konfiguriert (API-Key fehlt) — nichts zu tun",
    ru: "Cloud refresh: нет Cloud-клиента (нет API-ключа) — ничего делать",
    pt: "Refresh cloud: sem Cloud-client (falta API key) — nada a fazer",
    nl: "Cloud-refresh: geen Cloud-client (API-sleutel ontbreekt) — niets te doen",
    fr: "Refresh cloud : pas de Cloud-client (clé API manquante) — rien à faire",
    it: "Refresh cloud: nessun Cloud-client (manca API key) — nulla da fare",
    es: "Refresh cloud: sin Cloud-client (falta API key) — nada que hacer",
    pl: "Refresh cloud: brak klienta Cloud (brak klucza API) — nic do zrobienia",
    uk: "Cloud refresh: немає Cloud-client (немає API-ключа) — нічого робити",
    "zh-cn": "Cloud 刷新：未配置 Cloud 客户端（缺少 API 密钥） — 无操作",
  },
  refreshStart: {
    en: "Refresh cloud data: re-fetching scenes and snapshots for all devices",
    de: "Cloud-Refresh: Szenen und Snapshots werden für alle Geräte neu geladen",
    ru: "Cloud refresh: повторный fetch сцен и snapshots для всех устройств",
    pt: "Refresh cloud: a recarregar cenas e snapshots de todos os dispositivos",
    nl: "Cloud-refresh: scènes en snapshots voor alle apparaten opnieuw ophalen",
    fr: "Refresh cloud : rechargement des scènes et snapshots pour tous les appareils",
    it: "Refresh cloud: ricarico scene e snapshot per tutti i dispositivi",
    es: "Refresh cloud: recargando escenas y snapshots para todos los dispositivos",
    pl: "Refresh cloud: ponowne pobieranie scen i snapshotów dla wszystkich urządzeń",
    uk: "Cloud refresh: повторне завантаження сцен і snapshots для всіх пристроїв",
    "zh-cn": "Cloud 刷新：正在为所有设备重新获取场景和快照",
  },
  refreshFailed: {
    en: "Refresh cloud data failed: {error}",
    de: "Cloud-Refresh fehlgeschlagen: {error}",
    ru: "Cloud refresh не удался: {error}",
    pt: "Refresh cloud falhou: {error}",
    nl: "Cloud-refresh mislukt: {error}",
    fr: "Refresh cloud a échoué : {error}",
    it: "Refresh cloud fallito: {error}",
    es: "Refresh cloud falló: {error}",
    pl: "Refresh cloud nie powiódł się: {error}",
    uk: "Cloud refresh не вдався: {error}",
    "zh-cn": "Cloud 刷新失败：{error}",
  },
  // ---- Commands / per-device errors ------------------------------------
  unknownDropdownValue: {
    en: "Unknown dropdown value for {id}: {value} — ignoring",
    de: "Unbekannter Dropdown-Wert für {id}: {value} — wird ignoriert",
    ru: "Неизвестное dropdown-значение для {id}: {value} — игнорируется",
    pt: "Valor de dropdown desconhecido para {id}: {value} — ignorado",
    nl: "Onbekende dropdown-waarde voor {id}: {value} — genegeerd",
    fr: "Valeur dropdown inconnue pour {id} : {value} — ignorée",
    it: "Valore dropdown sconosciuto per {id}: {value} — ignorato",
    es: "Valor de dropdown desconocido para {id}: {value} — ignorado",
    pl: "Nieznana wartość dropdown dla {id}: {value} — ignorowana",
    uk: "Невідоме значення dropdown для {id}: {value} — ігнорується",
    "zh-cn": "{id} 的下拉值未知：{value} — 已忽略",
  },
  commandFailed: {
    en: "Command failed for {name}: {error}",
    de: "Befehl fehlgeschlagen für {name}: {error}",
    ru: "Команда не удалась для {name}: {error}",
    pt: "Comando falhou para {name}: {error}",
    nl: "Commando mislukt voor {name}: {error}",
    fr: "Commande échouée pour {name} : {error}",
    it: "Comando fallito per {name}: {error}",
    es: "Comando falló para {name}: {error}",
    pl: "Komenda nieudana dla {name}: {error}",
    uk: "Команда не вдалася для {name}: {error}",
    "zh-cn": "{name} 的命令失败：{error}",
  },
  noChannelAvailable: {
    en: "No channel available for {name} ({sku})",
    de: "Kein Kanal verfügbar für {name} ({sku})",
    ru: "Нет канала для {name} ({sku})",
    pt: "Sem canal disponível para {name} ({sku})",
    nl: "Geen kanaal beschikbaar voor {name} ({sku})",
    fr: "Aucun canal disponible pour {name} ({sku})",
    it: "Nessun canale disponibile per {name} ({sku})",
    es: "Sin canal disponible para {name} ({sku})",
    pl: "Brak dostępnego kanału dla {name} ({sku})",
    uk: "Немає каналу для {name} ({sku})",
    "zh-cn": "{name}（{sku}）无可用通道",
  },
  invalidSegmentCommand: {
    en: 'Invalid segment command "{command}" for {name}',
    de: 'Ungültiger Segment-Befehl „{command}" für {name}',
    ru: 'Неверная segment-команда "{command}" для {name}',
    pt: 'Comando de segmento inválido "{command}" para {name}',
    nl: 'Ongeldig segment-commando "{command}" voor {name}',
    fr: "Commande de segment invalide « {command} » pour {name}",
    it: 'Comando segmento non valido "{command}" per {name}',
    es: 'Comando de segmento inválido "{command}" para {name}',
    pl: 'Niepoprawne polecenie segmentu „{command}" dla {name}',
    uk: "Невірна segment-команда «{command}» для {name}",
    "zh-cn": "{name} 的分段命令无效：{command}",
  },
  invalidSceneIndex: {
    en: "{sku}: invalid scene index {value}",
    de: "{sku}: ungültiger Scene-Index {value}",
    ru: "{sku}: неверный scene-индекс {value}",
    pt: "{sku}: índice de cena inválido {value}",
    nl: "{sku}: ongeldige scene-index {value}",
    fr: "{sku} : index de scène invalide {value}",
    it: "{sku}: indice scena non valido {value}",
    es: "{sku}: índice de escena inválido {value}",
    pl: "{sku}: nieprawidłowy indeks sceny {value}",
    uk: "{sku}: невірний індекс сцени {value}",
    "zh-cn": "{sku}：无效的场景索引 {value}",
  },
  invalidSnapshotIndex: {
    en: "{sku}: invalid snapshot index {value}",
    de: "{sku}: ungültiger Snapshot-Index {value}",
    ru: "{sku}: неверный snapshot-индекс {value}",
    pt: "{sku}: índice de snapshot inválido {value}",
    nl: "{sku}: ongeldige snapshot-index {value}",
    fr: "{sku} : index de snapshot invalide {value}",
    it: "{sku}: indice snapshot non valido {value}",
    es: "{sku}: índice de snapshot inválido {value}",
    pl: "{sku}: nieprawidłowy indeks snapshot {value}",
    uk: "{sku}: невірний індекс snapshot {value}",
    "zh-cn": "{sku}：无效的快照索引 {value}",
  },
  invalidSegmentIndex: {
    en: "{sku}: invalid segment index in {command}",
    de: "{sku}: ungültiger Segment-Index in {command}",
    ru: "{sku}: неверный segment-индекс в {command}",
    pt: "{sku}: índice de segmento inválido em {command}",
    nl: "{sku}: ongeldige segment-index in {command}",
    fr: "{sku} : index de segment invalide dans {command}",
    it: "{sku}: indice segmento non valido in {command}",
    es: "{sku}: índice de segmento inválido en {command}",
    pl: "{sku}: nieprawidłowy indeks segmentu w {command}",
    uk: "{sku}: невірний індекс сегмента у {command}",
    "zh-cn": "{sku}：{command} 中分段索引无效",
  },
  // ---- Manual segments / setup -----------------------------------------
  manualSegmentsDisabled: {
    en: "{name}: manual segments disabled — strip treated as contiguous",
    de: "{name}: manuelle Segmente deaktiviert — Strip wird als ungeteilt behandelt",
    ru: "{name}: ручные сегменты отключены — strip трактуется как непрерывный",
    pt: "{name}: segmentos manuais desativados — strip tratado como contínuo",
    nl: "{name}: handmatige segmenten uitgeschakeld — strip behandeld als aaneengesloten",
    fr: "{name} : segments manuels désactivés — strip traitée comme continue",
    it: "{name}: segmenti manuali disattivati — strip trattato come continuo",
    es: "{name}: segmentos manuales desactivados — strip tratado como continuo",
    pl: "{name}: ręczne segmenty wyłączone — strip traktowany jako ciągły",
    uk: "{name}: ручні сегменти вимкнено — strip обробляється як цілий",
    "zh-cn": "{name}：手动分段已禁用 — 灯带视为连续",
  },
  manualListInvalid: {
    en: "{name}: manual_list invalid ({reason}) — disabling manual mode",
    de: "{name}: manual_list ungültig ({reason}) — manueller Modus wird deaktiviert",
    ru: "{name}: manual_list неверный ({reason}) — manual-mode отключается",
    pt: "{name}: manual_list inválido ({reason}) — desativando modo manual",
    nl: "{name}: manual_list ongeldig ({reason}) — handmatige modus uit",
    fr: "{name} : manual_list invalide ({reason}) — désactivation du mode manuel",
    it: "{name}: manual_list non valido ({reason}) — disattivazione modalità manuale",
    es: "{name}: manual_list inválido ({reason}) — desactivando modo manual",
    pl: "{name}: manual_list nieprawidłowy ({reason}) — tryb ręczny wyłączany",
    uk: "{name}: manual_list невірний ({reason}) — ручний режим вимкнено",
    "zh-cn": "{name}：manual_list 无效（{reason}） — 手动模式已禁用",
  },
  // ---- Migration -------------------------------------------------------
  migrateLegacyCredentials: {
    en: "Removing legacy plaintext MQTT credentials from native (one-time migration)",
    de: "Entferne alte Klartext-MQTT-Credentials aus native (Einmal-Migration)",
    ru: "Удаление устаревших plaintext MQTT-credentials из native (одноразовая миграция)",
    pt: "A remover credenciais MQTT em texto simples antigas (migração única)",
    nl: "Oude plaintext MQTT-credentials uit native verwijderen (eenmalige migratie)",
    fr: "Suppression des anciennes credentials MQTT en clair (migration ponctuelle)",
    it: "Rimozione credenziali MQTT in chiaro legacy da native (migrazione una tantum)",
    es: "Eliminando credenciales MQTT en texto plano legacy (migración única)",
    pl: "Usuwanie starych MQTT-credentials w plaintext (jednorazowa migracja)",
    uk: "Видалення старих plaintext MQTT-credentials із native (одноразова міграція)",
    "zh-cn": "正在从 native 中移除旧的明文 MQTT 凭据（一次性迁移）",
  },
  // ---- Device tier / segments (device-manager) -------------------------
  deviceBetaInactive: {
    en: 'Device {label} is in beta and needs the "Enable experimental device support" toggle in adapter settings to apply known per-SKU corrections.',
    de: 'Gerät {label} ist im Beta-Status und braucht den Toggle „Experimentelle Geräte-Unterstützung aktivieren" in den Adapter-Einstellungen, damit SKU-spezifische Korrekturen greifen.',
    ru: 'Устройство {label} в бета-статусе и требует включения переключателя „Experimental device support" в настройках адаптера, чтобы применялись SKU-коррекции.',
    pt: 'Dispositivo {label} em beta — ative "Experimental device support" nas definições do adaptador para aplicar correções por SKU.',
    nl: 'Apparaat {label} is in bèta en heeft de "Experimental device support"-schakelaar in de adapterinstellingen nodig voor SKU-correcties.',
    fr: "Appareil {label} en bêta — activez « Experimental device support » dans les paramètres de l’adaptateur pour les corrections par SKU.",
    it: 'Dispositivo {label} in beta — attivare "Experimental device support" nelle impostazioni dell’adattatore per le correzioni per SKU.',
    es: 'Dispositivo {label} en beta — activa "Experimental device support" en los ajustes del adaptador para correcciones por SKU.',
    pl: 'Urządzenie {label} w beta — włącz przełącznik „Experimental device support" w ustawieniach adaptera, aby zastosować korekty per SKU.',
    uk: 'Пристрій {label} у бета-статусі — увімкніть „Experimental device support" у налаштуваннях адаптера, щоб застосувати корекції за SKU.',
    "zh-cn": '设备 {label} 处于 beta 状态 — 在适配器设置中启用 "Experimental device support" 开关后才会应用 SKU 修正。',
  },
  deviceUnknown: {
    en: "Device {label} is not in the supported device list. Please trigger diag.export and post the resulting JSON in a GitHub issue so the SKU can be added.",
    de: "Gerät {label} steht nicht in der unterstützten Geräte-Liste. Bitte diag.export auslösen und das JSON in einem GitHub-Issue posten, damit die SKU aufgenommen werden kann.",
    ru: "Устройство {label} нет в списке поддерживаемых. Запусти diag.export и пришли JSON в GitHub-issue, чтобы SKU был добавлен.",
    pt: "Dispositivo {label} não está na lista de suportados. Aciona diag.export e publica o JSON num GitHub issue para a SKU ser adicionada.",
    nl: "Apparaat {label} staat niet in de lijst met ondersteunde apparaten. Start diag.export en post de JSON in een GitHub-issue zodat de SKU toegevoegd kan worden.",
    fr: "Appareil {label} ne figure pas dans la liste des appareils pris en charge. Lancez diag.export et postez le JSON dans une issue GitHub pour ajouter le SKU.",
    it: "Dispositivo {label} non è nella lista dei dispositivi supportati. Esegui diag.export e pubblica il JSON in una issue GitHub per aggiungere la SKU.",
    es: "Dispositivo {label} no está en la lista de soportados. Ejecuta diag.export y publica el JSON en una issue de GitHub para añadir la SKU.",
    pl: "Urządzenie {label} nie znajduje się na liście obsługiwanych. Uruchom diag.export i opublikuj JSON w GitHub-issue, aby dodać SKU.",
    uk: "Пристрій {label} відсутній у списку підтримуваних. Запустіть diag.export і надішліть JSON у GitHub-issue, щоб SKU додали.",
    "zh-cn": "设备 {label} 不在支持列表中。请触发 diag.export 并将结果 JSON 提交到 GitHub issue，以便添加该 SKU。",
  },
  segmentsDetected: {
    en: "{name}: detected {count} segments via MQTT (was {previous}) — rebuilding state tree",
    de: "{name}: {count} Segmente per MQTT erkannt (vorher {previous}) — State-Baum wird neu aufgebaut",
    ru: "{name}: обнаружено {count} сегментов через MQTT (было {previous}) — state-дерево перестраивается",
    pt: "{name}: detetados {count} segmentos via MQTT (antes {previous}) — a reconstruir árvore de estados",
    nl: "{name}: {count} segmenten gedetecteerd via MQTT (was {previous}) — state-boom wordt opnieuw opgebouwd",
    fr: "{name} : {count} segments détectés via MQTT (avant {previous}) — reconstruction de l'arbre d'états",
    it: "{name}: rilevati {count} segmenti via MQTT (prima {previous}) — ricostruzione albero degli stati",
    es: "{name}: detectados {count} segmentos vía MQTT (antes {previous}) — reconstruyendo árbol de estados",
    pl: "{name}: wykryto {count} segmentów przez MQTT (było {previous}) — odbudowa drzewa stanów",
    uk: "{name}: виявлено {count} сегментів через MQTT (було {previous}) — перебудова дерева станів",
    "zh-cn": "{name}：通过 MQTT 检测到 {count} 个分段（之前为 {previous}）— 正在重建状态树",
  },
  // ---- Beta / quirks ---------------------------------------------------
  deviceBeta: {
    en: "Device {label} is in beta — experimental quirks are active.",
    de: "Gerät {label} ist im Beta-Status — experimentelle Quirks sind aktiv.",
    ru: "Устройство {label} в бета-статусе — экспериментальные quirks активны.",
    pt: "Dispositivo {label} em beta — quirks experimentais ativos.",
    nl: "Apparaat {label} is in bèta — experimentele quirks zijn actief.",
    fr: "Appareil {label} en bêta — quirks expérimentaux actifs.",
    it: "Dispositivo {label} in beta — quirks sperimentali attivi.",
    es: "Dispositivo {label} en beta — quirks experimentales activos.",
    pl: "Urządzenie {label} w beta — eksperymentalne quirks aktywne.",
    uk: "Пристрій {label} у бета-статусі — експериментальні quirks активні.",
    "zh-cn": "设备 {label} 处于 beta 状态 — 实验性 quirks 已启用。",
  },
} as const;

/**
 * Look up a log string in the currently active language (set via
 * {@link setActiveLang}), with EN fallback.
 *
 * @param key    Translation key in {@link LOG_STRINGS}.
 * @param params Token values for `{name}` placeholders in the template.
 */
export function tLog(
  key: keyof typeof LOG_STRINGS,
  params?: Record<string, string | number | null | undefined>,
): string {
  const bundle = LOG_STRINGS[key];
  const template = bundle[activeLang] ?? bundle.en;
  return fmt(template, params);
}
