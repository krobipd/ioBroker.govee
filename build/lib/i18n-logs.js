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
var i18n_logs_exports = {};
__export(i18n_logs_exports, {
  LOG_STRINGS: () => LOG_STRINGS,
  setActiveLang: () => setActiveLang,
  tLog: () => tLog
});
module.exports = __toCommonJS(i18n_logs_exports);
const SUPPORTED_LANGS = ["en", "de", "ru", "pt", "nl", "fr", "it", "es", "pl", "uk", "zh-cn"];
let activeLang = "en";
function setActiveLang(lang) {
  activeLang = SUPPORTED_LANGS.includes(lang) ? lang : "en";
}
function fmt(template, params) {
  if (!params) {
    return template;
  }
  return template.replace(/\{(\w+)\}/g, (_, key) => {
    const v = params[key];
    if (v === null) {
      return "(none)";
    }
    if (v === void 0) {
      return `{${key}}`;
    }
    return String(v);
  });
}
const LOG_STRINGS = {
  // ---- Lifecycle -------------------------------------------------------
  starting: {
    en: "Starting ({channels})",
    de: "Starte ({channels})",
    ru: "\u0417\u0430\u043F\u0443\u0441\u043A ({channels})",
    pt: "A iniciar ({channels})",
    nl: "Starten ({channels})",
    fr: "D\xE9marrage ({channels})",
    it: "Avvio ({channels})",
    es: "Iniciando ({channels})",
    pl: "Start ({channels})",
    uk: "\u0417\u0430\u043F\u0443\u0441\u043A ({channels})",
    "zh-cn": "\u6B63\u5728\u542F\u52A8 ({channels})"
  },
  ready: {
    en: "Govee adapter ready \u2014 {summary} \u2014 channels: {channels}",
    de: "Govee-Adapter bereit \u2014 {summary} \u2014 Kan\xE4le: {channels}",
    ru: "Govee-\u0430\u0434\u0430\u043F\u0442\u0435\u0440 \u0433\u043E\u0442\u043E\u0432 \u2014 {summary} \u2014 \u043A\u0430\u043D\u0430\u043B\u044B: {channels}",
    pt: "Adaptador Govee pronto \u2014 {summary} \u2014 canais: {channels}",
    nl: "Govee-adapter klaar \u2014 {summary} \u2014 kanalen: {channels}",
    fr: "Adaptateur Govee pr\xEAt \u2014 {summary} \u2014 canaux : {channels}",
    it: "Adattatore Govee pronto \u2014 {summary} \u2014 canali: {channels}",
    es: "Adaptador Govee listo \u2014 {summary} \u2014 canales: {channels}",
    pl: "Adapter Govee gotowy \u2014 {summary} \u2014 kana\u0142y: {channels}",
    uk: "Govee-\u0430\u0434\u0430\u043F\u0442\u0435\u0440 \u0433\u043E\u0442\u043E\u0432\u0438\u0439 \u2014 {summary} \u2014 \u043A\u0430\u043D\u0430\u043B\u0438: {channels}",
    "zh-cn": "Govee \u9002\u914D\u5668\u5C31\u7EEA \u2014 {summary} \u2014 \u901A\u9053\uFF1A{channels}"
  },
  // ---- Cloud / MQTT connection state -----------------------------------
  cloudNotConnected: {
    en: "Cloud not connected \u2014 {reason}",
    de: "Cloud nicht verbunden \u2014 {reason}",
    ru: "Cloud \u043D\u0435 \u043F\u043E\u0434\u043A\u043B\u044E\u0447\u0435\u043D \u2014 {reason}",
    pt: "Cloud n\xE3o ligado \u2014 {reason}",
    nl: "Cloud niet verbonden \u2014 {reason}",
    fr: "Cloud non connect\xE9 \u2014 {reason}",
    it: "Cloud non connesso \u2014 {reason}",
    es: "Cloud no conectado \u2014 {reason}",
    pl: "Cloud niepo\u0142\u0105czony \u2014 {reason}",
    uk: "Cloud \u043D\u0435 \u043F\u0456\u0434\u2019\u0454\u0434\u043D\u0430\u043D\u043E \u2014 {reason}",
    "zh-cn": "Cloud \u672A\u8FDE\u63A5 \u2014 {reason}"
  },
  cloudNotConnectedNoReason: {
    en: "Cloud not connected \u2014 see earlier errors",
    de: "Cloud nicht verbunden \u2014 siehe vorhergehende Fehler",
    ru: "Cloud \u043D\u0435 \u043F\u043E\u0434\u043A\u043B\u044E\u0447\u0435\u043D \u2014 \u0441\u043C. \u043F\u0440\u0435\u0434\u044B\u0434\u0443\u0449\u0438\u0435 \u043E\u0448\u0438\u0431\u043A\u0438",
    pt: "Cloud n\xE3o ligado \u2014 ver erros anteriores",
    nl: "Cloud niet verbonden \u2014 zie eerdere fouten",
    fr: "Cloud non connect\xE9 \u2014 voir erreurs pr\xE9c\xE9dentes",
    it: "Cloud non connesso \u2014 vedi errori precedenti",
    es: "Cloud no conectado \u2014 ver errores anteriores",
    pl: "Cloud niepo\u0142\u0105czony \u2014 patrz wcze\u015Bniejsze b\u0142\u0119dy",
    uk: "Cloud \u043D\u0435 \u043F\u0456\u0434\u2019\u0454\u0434\u043D\u0430\u043D\u043E \u2014 \u0434\u0438\u0432. \u043F\u043E\u043F\u0435\u0440\u0435\u0434\u043D\u0456 \u043F\u043E\u043C\u0438\u043B\u043A\u0438",
    "zh-cn": "Cloud \u672A\u8FDE\u63A5 \u2014 \u8BF7\u67E5\u770B\u5148\u524D\u7684\u9519\u8BEF"
  },
  mqttNotConnected: {
    en: "MQTT not connected \u2014 {reason}",
    de: "MQTT nicht verbunden \u2014 {reason}",
    ru: "MQTT \u043D\u0435 \u043F\u043E\u0434\u043A\u043B\u044E\u0447\u0435\u043D \u2014 {reason}",
    pt: "MQTT n\xE3o ligado \u2014 {reason}",
    nl: "MQTT niet verbonden \u2014 {reason}",
    fr: "MQTT non connect\xE9 \u2014 {reason}",
    it: "MQTT non connesso \u2014 {reason}",
    es: "MQTT no conectado \u2014 {reason}",
    pl: "MQTT niepo\u0142\u0105czony \u2014 {reason}",
    uk: "MQTT \u043D\u0435 \u043F\u0456\u0434\u2019\u0454\u0434\u043D\u0430\u043D\u043E \u2014 {reason}",
    "zh-cn": "MQTT \u672A\u8FDE\u63A5 \u2014 {reason}"
  },
  mqttNotConnectedNoReason: {
    en: "MQTT not connected \u2014 see earlier errors",
    de: "MQTT nicht verbunden \u2014 siehe vorhergehende Fehler",
    ru: "MQTT \u043D\u0435 \u043F\u043E\u0434\u043A\u043B\u044E\u0447\u0435\u043D \u2014 \u0441\u043C. \u043F\u0440\u0435\u0434\u044B\u0434\u0443\u0449\u0438\u0435 \u043E\u0448\u0438\u0431\u043A\u0438",
    pt: "MQTT n\xE3o ligado \u2014 ver erros anteriores",
    nl: "MQTT niet verbonden \u2014 zie eerdere fouten",
    fr: "MQTT non connect\xE9 \u2014 voir erreurs pr\xE9c\xE9dentes",
    it: "MQTT non connesso \u2014 vedi errori precedenti",
    es: "MQTT no conectado \u2014 ver errores anteriores",
    pl: "MQTT niepo\u0142\u0105czony \u2014 patrz wcze\u015Bniejsze b\u0142\u0119dy",
    uk: "MQTT \u043D\u0435 \u043F\u0456\u0434\u2019\u0454\u0434\u043D\u0430\u043D\u043E \u2014 \u0434\u0438\u0432. \u043F\u043E\u043F\u0435\u0440\u0435\u0434\u043D\u0456 \u043F\u043E\u043C\u0438\u043B\u043A\u0438",
    "zh-cn": "MQTT \u672A\u8FDE\u63A5 \u2014 \u8BF7\u67E5\u770B\u5148\u524D\u7684\u9519\u8BEF"
  },
  mqttConnected: {
    en: "MQTT connected",
    de: "MQTT verbunden",
    ru: "MQTT \u043F\u043E\u0434\u043A\u043B\u044E\u0447\u0435\u043D",
    pt: "MQTT ligado",
    nl: "MQTT verbonden",
    fr: "MQTT connect\xE9",
    it: "MQTT connesso",
    es: "MQTT conectado",
    pl: "MQTT po\u0142\u0105czony",
    uk: "MQTT \u043F\u0456\u0434\u2019\u0454\u0434\u043D\u0430\u043D\u043E",
    "zh-cn": "MQTT \u5DF2\u8FDE\u63A5"
  },
  mqttConnectionRestored: {
    en: "MQTT connection restored",
    de: "MQTT-Verbindung wiederhergestellt",
    ru: "MQTT-\u0441\u043E\u0435\u0434\u0438\u043D\u0435\u043D\u0438\u0435 \u0432\u043E\u0441\u0441\u0442\u0430\u043D\u043E\u0432\u043B\u0435\u043D\u043E",
    pt: "Liga\xE7\xE3o MQTT restaurada",
    nl: "MQTT-verbinding hersteld",
    fr: "Connexion MQTT restaur\xE9e",
    it: "Connessione MQTT ripristinata",
    es: "Conexi\xF3n MQTT restaurada",
    pl: "Po\u0142\u0105czenie MQTT przywr\xF3cone",
    uk: "MQTT-\u0437\u2019\u0454\u0434\u043D\u0430\u043D\u043D\u044F \u0432\u0456\u0434\u043D\u043E\u0432\u043B\u0435\u043D\u043E",
    "zh-cn": "MQTT \u8FDE\u63A5\u5DF2\u6062\u590D"
  },
  mqttSubscribeFailed: {
    en: "MQTT subscribe failed: {error}",
    de: "MQTT-Subscribe fehlgeschlagen: {error}",
    ru: "MQTT subscribe \u043D\u0435 \u0443\u0434\u0430\u043B\u0441\u044F: {error}",
    pt: "MQTT subscribe falhou: {error}",
    nl: "MQTT subscribe mislukt: {error}",
    fr: "MQTT subscribe a \xE9chou\xE9 : {error}",
    it: "MQTT subscribe fallito: {error}",
    es: "MQTT subscribe fall\xF3: {error}",
    pl: "MQTT subscribe nieudany: {error}",
    uk: "MQTT subscribe \u043D\u0435 \u0432\u0434\u0430\u0432\u0441\u044F: {error}",
    "zh-cn": "MQTT \u8BA2\u9605\u5931\u8D25\uFF1A{error}"
  },
  mqttVerificationNeeded: {
    en: "MQTT not connected: Govee asked for verification \u2014 request a code in adapter settings",
    de: "MQTT nicht verbunden: Govee verlangt eine Verifizierung \u2014 Code in den Adapter-Einstellungen anfordern",
    ru: "MQTT \u043D\u0435 \u043F\u043E\u0434\u043A\u043B\u044E\u0447\u0435\u043D: Govee \u0442\u0440\u0435\u0431\u0443\u0435\u0442 verification \u2014 \u0437\u0430\u043F\u0440\u043E\u0441\u0438\u0442\u0435 \u043A\u043E\u0434 \u0432 \u043D\u0430\u0441\u0442\u0440\u043E\u0439\u043A\u0430\u0445 \u0430\u0434\u0430\u043F\u0442\u0435\u0440\u0430",
    pt: "MQTT n\xE3o ligado: Govee pediu verifica\xE7\xE3o \u2014 pedir um c\xF3digo nas defini\xE7\xF5es do adaptador",
    nl: "MQTT niet verbonden: Govee vraagt om verificatie \u2014 vraag een code aan in de adapterinstellingen",
    fr: "MQTT non connect\xE9 : Govee demande une v\xE9rification \u2014 demandez un code dans les param\xE8tres de l\u2019adaptateur",
    it: "MQTT non connesso: Govee chiede una verifica \u2014 richiedi un codice nelle impostazioni dell\u2019adattatore",
    es: "MQTT no conectado: Govee pide verificaci\xF3n \u2014 solicita un c\xF3digo en los ajustes del adaptador",
    pl: "MQTT niepo\u0142\u0105czony: Govee wymaga weryfikacji \u2014 popro\u015B o kod w ustawieniach adaptera",
    uk: "MQTT \u043D\u0435 \u043F\u0456\u0434\u2019\u0454\u0434\u043D\u0430\u043D\u043E: Govee \u0432\u0438\u043C\u0430\u0433\u0430\u0454 \u043F\u0456\u0434\u0442\u0432\u0435\u0440\u0434\u0436\u0435\u043D\u043D\u044F \u2014 \u0437\u0430\u043F\u0438\u0442\u0430\u0439\u0442\u0435 \u043A\u043E\u0434 \u0443 \u043D\u0430\u043B\u0430\u0448\u0442\u0443\u0432\u0430\u043D\u043D\u044F\u0445 \u0430\u0434\u0430\u043F\u0442\u0435\u0440\u0430",
    "zh-cn": "MQTT \u672A\u8FDE\u63A5\uFF1AGovee \u8981\u6C42\u9A8C\u8BC1 \u2014 \u8BF7\u5728\u9002\u914D\u5668\u8BBE\u7F6E\u4E2D\u7533\u8BF7\u9A8C\u8BC1\u7801"
  },
  mqttVerificationRejected: {
    en: "MQTT not connected: verification code rejected \u2014 request a fresh code",
    de: "MQTT nicht verbunden: Verifizierungs-Code abgelehnt \u2014 neuen Code anfordern",
    ru: "MQTT \u043D\u0435 \u043F\u043E\u0434\u043A\u043B\u044E\u0447\u0435\u043D: verification-\u043A\u043E\u0434 \u043E\u0442\u043A\u043B\u043E\u043D\u0451\u043D \u2014 \u0437\u0430\u043F\u0440\u043E\u0441\u0438\u0442\u0435 \u043D\u043E\u0432\u044B\u0439",
    pt: "MQTT n\xE3o ligado: c\xF3digo de verifica\xE7\xE3o rejeitado \u2014 pe\xE7a um novo",
    nl: "MQTT niet verbonden: verificatiecode geweigerd \u2014 vraag een nieuwe aan",
    fr: "MQTT non connect\xE9 : code de v\xE9rification rejet\xE9 \u2014 demandez un nouveau code",
    it: "MQTT non connesso: codice di verifica rifiutato \u2014 richiedi un nuovo codice",
    es: "MQTT no conectado: c\xF3digo de verificaci\xF3n rechazado \u2014 solicita uno nuevo",
    pl: "MQTT niepo\u0142\u0105czony: kod weryfikacyjny odrzucony \u2014 popro\u015B o nowy",
    uk: "MQTT \u043D\u0435 \u043F\u0456\u0434\u2019\u0454\u0434\u043D\u0430\u043D\u043E: \u043A\u043E\u0434 \u043F\u0456\u0434\u0442\u0432\u0435\u0440\u0434\u0436\u0435\u043D\u043D\u044F \u0432\u0456\u0434\u0445\u0438\u043B\u0435\u043D\u043E \u2014 \u0437\u0430\u043F\u0438\u0442\u0430\u0439\u0442\u0435 \u043D\u043E\u0432\u0438\u0439",
    "zh-cn": "MQTT \u672A\u8FDE\u63A5\uFF1A\u9A8C\u8BC1\u7801\u88AB\u62D2\u7EDD \u2014 \u8BF7\u7533\u8BF7\u65B0\u9A8C\u8BC1\u7801"
  },
  mqttLoginRejected: {
    en: "MQTT not connected: login rejected \u2014 check email/password",
    de: "MQTT nicht verbunden: Login abgelehnt \u2014 Email/Passwort pr\xFCfen",
    ru: "MQTT \u043D\u0435 \u043F\u043E\u0434\u043A\u043B\u044E\u0447\u0435\u043D: \u0432\u0445\u043E\u0434 \u043E\u0442\u043A\u043B\u043E\u043D\u0451\u043D \u2014 \u043F\u0440\u043E\u0432\u0435\u0440\u044C\u0442\u0435 email/\u043F\u0430\u0440\u043E\u043B\u044C",
    pt: "MQTT n\xE3o ligado: login recusado \u2014 verificar email/palavra-passe",
    nl: "MQTT niet verbonden: aanmelding geweigerd \u2014 controleer e-mail/wachtwoord",
    fr: "MQTT non connect\xE9 : connexion refus\xE9e \u2014 v\xE9rifiez email/mot de passe",
    it: "MQTT non connesso: login rifiutato \u2014 verificare email/password",
    es: "MQTT no conectado: inicio de sesi\xF3n rechazado \u2014 comprobar email/contrase\xF1a",
    pl: "MQTT niepo\u0142\u0105czony: logowanie odrzucone \u2014 sprawd\u017A email/has\u0142o",
    uk: "MQTT \u043D\u0435 \u043F\u0456\u0434\u2019\u0454\u0434\u043D\u0430\u043D\u043E: \u0432\u0445\u0456\u0434 \u0432\u0456\u0434\u0445\u0438\u043B\u0435\u043D\u043E \u2014 \u043F\u0435\u0440\u0435\u0432\u0456\u0440\u0442\u0435 email/\u043F\u0430\u0440\u043E\u043B\u044C",
    "zh-cn": "MQTT \u672A\u8FDE\u63A5\uFF1A\u767B\u5F55\u88AB\u62D2 \u2014 \u8BF7\u68C0\u67E5\u90AE\u7BB1/\u5BC6\u7801"
  },
  cloudEventsRestored: {
    en: "Cloud-events connection restored",
    de: "Cloud-Events-Verbindung wiederhergestellt",
    ru: "Cloud-events \u0441\u043E\u0435\u0434\u0438\u043D\u0435\u043D\u0438\u0435 \u0432\u043E\u0441\u0441\u0442\u0430\u043D\u043E\u0432\u043B\u0435\u043D\u043E",
    pt: "Liga\xE7\xE3o Cloud-events restaurada",
    nl: "Cloud-events-verbinding hersteld",
    fr: "Connexion Cloud-events restaur\xE9e",
    it: "Connessione Cloud-events ripristinata",
    es: "Conexi\xF3n Cloud-events restaurada",
    pl: "Po\u0142\u0105czenie Cloud-events przywr\xF3cone",
    uk: "Cloud-events \u0437\u2019\u0454\u0434\u043D\u0430\u043D\u043D\u044F \u0432\u0456\u0434\u043D\u043E\u0432\u043B\u0435\u043D\u043E",
    "zh-cn": "Cloud-events \u8FDE\u63A5\u5DF2\u6062\u590D"
  },
  cloudEventsSubscribeFailed: {
    en: "Cloud-events subscribe failed: {error}",
    de: "Cloud-Events-Subscribe fehlgeschlagen: {error}",
    ru: "Cloud-events subscribe \u043D\u0435 \u0443\u0434\u0430\u043B\u0441\u044F: {error}",
    pt: "Cloud-events subscribe falhou: {error}",
    nl: "Cloud-events subscribe mislukt: {error}",
    fr: "Cloud-events subscribe a \xE9chou\xE9 : {error}",
    it: "Cloud-events subscribe fallito: {error}",
    es: "Cloud-events subscribe fall\xF3: {error}",
    pl: "Cloud-events subscribe nieudany: {error}",
    uk: "Cloud-events subscribe \u043D\u0435 \u0432\u0434\u0430\u0432\u0441\u044F: {error}",
    "zh-cn": "Cloud-events \u8BA2\u9605\u5931\u8D25\uFF1A{error}"
  },
  cloudEventsAuthFailed: {
    en: "Cloud-events auth failed repeatedly \u2014 check API key",
    de: "Cloud-Events Auth wiederholt fehlgeschlagen \u2014 API-Key pr\xFCfen",
    ru: "Cloud-events auth \u043F\u043E\u0432\u0442\u043E\u0440\u043D\u043E \u043D\u0435 \u0443\u0434\u0430\u043B\u0441\u044F \u2014 \u043F\u0440\u043E\u0432\u0435\u0440\u044C\u0442\u0435 API-\u043A\u043B\u044E\u0447",
    pt: "Auth de Cloud-events falhou repetidamente \u2014 verificar API key",
    nl: "Cloud-events-auth herhaaldelijk mislukt \u2014 controleer API-sleutel",
    fr: "L\u2019auth Cloud-events a \xE9chou\xE9 plusieurs fois \u2014 v\xE9rifiez la cl\xE9 API",
    it: "Auth Cloud-events fallita ripetutamente \u2014 verifica API key",
    es: "Auth Cloud-events fall\xF3 repetidamente \u2014 comprobar API key",
    pl: "Auth Cloud-events wielokrotnie nieudana \u2014 sprawd\u017A klucz API",
    uk: "Cloud-events auth \u043D\u0435\u043E\u0434\u043D\u043E\u0440\u0430\u0437\u043E\u0432\u043E \u043D\u0435 \u0432\u0434\u0430\u043B\u0430\u0441\u044F \u2014 \u043F\u0435\u0440\u0435\u0432\u0456\u0440\u0442\u0435 API-\u043A\u043B\u044E\u0447",
    "zh-cn": "Cloud-events \u9A8C\u8BC1\u591A\u6B21\u5931\u8D25 \u2014 \u8BF7\u68C0\u67E5 API \u5BC6\u94A5"
  },
  // ---- LAN -------------------------------------------------------------
  lanBindingInterface: {
    en: "LAN binding to network interface {bindAddr}",
    de: "LAN bindet auf Interface {bindAddr}",
    ru: "LAN \u043F\u0440\u0438\u0432\u044F\u0437\u0430\u043D \u043A \u0441\u0435\u0442\u0435\u0432\u043E\u043C\u0443 \u0438\u043D\u0442\u0435\u0440\u0444\u0435\u0439\u0441\u0443 {bindAddr}",
    pt: "LAN ligado \xE0 interface de rede {bindAddr}",
    nl: "LAN gebonden aan interface {bindAddr}",
    fr: "LAN li\xE9 \xE0 l'interface {bindAddr}",
    it: "LAN collegato all\u2019interfaccia {bindAddr}",
    es: "LAN enlazado a la interfaz {bindAddr}",
    pl: "LAN powi\u0105zany z interfejsem {bindAddr}",
    uk: "LAN \u043F\u0440\u0438\u0432\u2019\u044F\u0437\u0430\u043D\u043E \u0434\u043E \u0456\u043D\u0442\u0435\u0440\u0444\u0435\u0439\u0441\u0443 {bindAddr}",
    "zh-cn": "LAN \u7ED1\u5B9A\u5230\u7F51\u7EDC\u63A5\u53E3 {bindAddr}"
  },
  lanPortInUse: {
    en: "LAN listen port {port} already in use \u2014 second instance? Status updates will be lost.",
    de: "LAN-Port {port} ist belegt \u2014 zweite Instanz? Status-Updates gehen verloren.",
    ru: "LAN-\u043F\u043E\u0440\u0442 {port} \u0437\u0430\u043D\u044F\u0442 \u2014 \u0432\u0442\u043E\u0440\u0430\u044F \u0438\u043D\u0441\u0442\u0430\u043D\u0446\u0438\u044F? \u0421\u0442\u0430\u0442\u0443\u0441-\u043E\u0431\u043D\u043E\u0432\u043B\u0435\u043D\u0438\u044F \u0431\u0443\u0434\u0443\u0442 \u043F\u043E\u0442\u0435\u0440\u044F\u043D\u044B.",
    pt: "Porta LAN {port} j\xE1 em uso \u2014 segunda inst\xE2ncia? Atualiza\xE7\xF5es de estado perdem-se.",
    nl: "LAN-poort {port} al in gebruik \u2014 tweede instantie? Status-updates gaan verloren.",
    fr: "Port LAN {port} d\xE9j\xE0 utilis\xE9 \u2014 seconde instance ? Les mises \xE0 jour seront perdues.",
    it: "Porta LAN {port} gi\xE0 in uso \u2014 seconda istanza? Gli aggiornamenti di stato andranno persi.",
    es: "Puerto LAN {port} ya en uso \u2014 \xBFsegunda instancia? Las actualizaciones de estado se perder\xE1n.",
    pl: "Port LAN {port} jest ju\u017C zaj\u0119ty \u2014 druga instancja? Aktualizacje statusu zostan\u0105 utracone.",
    uk: "LAN-\u043F\u043E\u0440\u0442 {port} \u0432\u0436\u0435 \u0432\u0438\u043A\u043E\u0440\u0438\u0441\u0442\u043E\u0432\u0443\u0454\u0442\u044C\u0441\u044F \u2014 \u0434\u0440\u0443\u0433\u0430 \u0456\u043D\u0441\u0442\u0430\u043D\u0446\u0456\u044F? \u041E\u043D\u043E\u0432\u043B\u0435\u043D\u043D\u044F \u0441\u0442\u0430\u0442\u0443\u0441\u0443 \u0431\u0443\u0434\u0443\u0442\u044C \u0432\u0442\u0440\u0430\u0447\u0435\u043D\u0456.",
    "zh-cn": "LAN \u7AEF\u53E3 {port} \u5DF2\u88AB\u5360\u7528 \u2014 \u7B2C\u4E8C\u4E2A\u5B9E\u4F8B\uFF1F\u72B6\u6001\u66F4\u65B0\u5C06\u4E22\u5931\u3002"
  },
  // ---- Cache / data state ----------------------------------------------
  usingCachedData: {
    en: "Using cached device data \u2014 no Cloud calls needed",
    de: "Ger\xE4te-Daten aus Cache \u2014 keine Cloud-Calls n\xF6tig",
    ru: "\u0418\u0441\u043F\u043E\u043B\u044C\u0437\u0443\u044E\u0442\u0441\u044F \u043A\u0435\u0448\u0438\u0440\u043E\u0432\u0430\u043D\u043D\u044B\u0435 \u0434\u0430\u043D\u043D\u044B\u0435 \u0443\u0441\u0442\u0440\u043E\u0439\u0441\u0442\u0432 \u2014 Cloud \u043D\u0435 \u043D\u0443\u0436\u0435\u043D",
    pt: "Usando dados em cache \u2014 sem chamadas \xE0 Cloud",
    nl: "Apparaatgegevens uit cache \u2014 geen Cloud-aanroepen nodig",
    fr: "Donn\xE9es d\u2019appareil en cache \u2014 pas d\u2019appel Cloud n\xE9cessaire",
    it: "Dati dispositivo dalla cache \u2014 nessuna chiamata Cloud necessaria",
    es: "Datos de dispositivo desde cach\xE9 \u2014 sin llamadas Cloud",
    pl: "Dane urz\u0105dze\u0144 z cache \u2014 bez wywo\u0142a\u0144 Cloud",
    uk: "\u0414\u0430\u043D\u0456 \u043F\u0440\u0438\u0441\u0442\u0440\u043E\u0457\u0432 \u0456\u0437 \u043A\u0435\u0448\u0443 \u2014 \u0431\u0435\u0437 \u0432\u0438\u043A\u043B\u0438\u043A\u0456\u0432 \u0434\u043E Cloud",
    "zh-cn": "\u4F7F\u7528\u7F13\u5B58\u7684\u8BBE\u5907\u6570\u636E \u2014 \u65E0\u9700 Cloud \u8C03\u7528"
  },
  loadedFromCache: {
    en: "Loaded {count} device(s) from cache",
    de: "{count} Ger\xE4t(e) aus Cache geladen",
    ru: "\u0417\u0430\u0433\u0440\u0443\u0436\u0435\u043D\u043E {count} \u0443\u0441\u0442\u0440\u043E\u0439\u0441\u0442\u0432(\u0430) \u0438\u0437 \u043A\u0435\u0448\u0430",
    pt: "Carregados {count} dispositivos do cache",
    nl: "{count} apparaat(en) uit cache geladen",
    fr: "{count} appareil(s) charg\xE9(s) depuis le cache",
    it: "Caricati {count} dispositivi dalla cache",
    es: "Cargados {count} dispositivos desde cach\xE9",
    pl: "Za\u0142adowano {count} urz\u0105dze\u0144 z cache",
    uk: "\u0417\u0430\u0432\u0430\u043D\u0442\u0430\u0436\u0435\u043D\u043E {count} \u043F\u0440\u0438\u0441\u0442\u0440\u043E\u0457\u0432 \u0456\u0437 \u043A\u0435\u0448\u0443",
    "zh-cn": "\u4ECE\u7F13\u5B58\u52A0\u8F7D\u4E86 {count} \u4E2A\u8BBE\u5907"
  },
  cachePruned: {
    en: "Cache: pruned {count} stale entries (not seen on network for {days}+ days)",
    de: "Cache: {count} veraltete Eintr\xE4ge entfernt (nicht im Netz seit {days}+ Tagen)",
    ru: "Cache: \u0443\u0434\u0430\u043B\u0435\u043D\u043E {count} \u0443\u0441\u0442\u0430\u0440\u0435\u0432\u0448\u0438\u0445 \u0437\u0430\u043F\u0438\u0441\u0435\u0439 (\u043D\u0435 \u0432\u0438\u0434\u043D\u043E \u0432 \u0441\u0435\u0442\u0438 {days}+ \u0434\u043D\u0435\u0439)",
    pt: "Cache: removidas {count} entradas obsoletas (sem rede h\xE1 {days}+ dias)",
    nl: "Cache: {count} verouderde items verwijderd (niet gezien in {days}+ dagen)",
    fr: "Cache : {count} entr\xE9es obsol\xE8tes supprim\xE9es (absentes du r\xE9seau depuis {days}+ jours)",
    it: "Cache: rimosse {count} voci obsolete (non viste sulla rete da {days}+ giorni)",
    es: "Cache: eliminadas {count} entradas obsoletas (sin red desde hace {days}+ d\xEDas)",
    pl: "Cache: usuni\u0119to {count} przestarza\u0142ych wpis\xF3w (brak w sieci od {days}+ dni)",
    uk: "Cache: \u0432\u0438\u0434\u0430\u043B\u0435\u043D\u043E {count} \u0437\u0430\u0441\u0442\u0430\u0440\u0456\u043B\u0438\u0445 \u0437\u0430\u043F\u0438\u0441\u0456\u0432 (\u043D\u0435\u043C\u0430\u0454 \u0432 \u043C\u0435\u0440\u0435\u0436\u0456 \u043F\u043E\u043D\u0430\u0434 {days} \u0434\u043D\u0456\u0432)",
    "zh-cn": "\u7F13\u5B58\uFF1A\u6E05\u7406\u4E86 {count} \u4E2A\u8FC7\u671F\u6761\u76EE\uFF08{days}+ \u5929\u672A\u5728\u7F51\u7EDC\u4E2D\u51FA\u73B0\uFF09"
  },
  cacheNotWritable: {
    en: "Cache directory not writable ({path}): {error}",
    de: "Cache-Verzeichnis nicht beschreibbar ({path}): {error}",
    ru: "\u041A\u0430\u0442\u0430\u043B\u043E\u0433 cache \u043D\u0435\u0434\u043E\u0441\u0442\u0443\u043F\u0435\u043D \u0434\u043B\u044F \u0437\u0430\u043F\u0438\u0441\u0438 ({path}): {error}",
    pt: "Pasta de cache sem permiss\xE3o de escrita ({path}): {error}",
    nl: "Cachemap niet schrijfbaar ({path}): {error}",
    fr: "Dossier cache non inscriptible ({path}) : {error}",
    it: "Cartella cache non scrivibile ({path}): {error}",
    es: "Directorio de cach\xE9 no escribible ({path}): {error}",
    pl: "Katalog cache bez praw zapisu ({path}): {error}",
    uk: "\u041A\u0430\u0442\u0430\u043B\u043E\u0433 cache \u0431\u0435\u0437 \u043F\u0440\u0430\u0432 \u0437\u0430\u043F\u0438\u0441\u0443 ({path}): {error}",
    "zh-cn": "\u7F13\u5B58\u76EE\u5F55\u4E0D\u53EF\u5199\uFF08{path}\uFF09\uFF1A{error}"
  },
  cacheWriteFailed: {
    en: "Cache write failed for {sku}: {error}",
    de: "Cache-Schreiben fehlgeschlagen f\xFCr {sku}: {error}",
    ru: "Cache \u0437\u0430\u043F\u0438\u0441\u044C \u043D\u0435 \u0443\u0434\u0430\u043B\u0430\u0441\u044C \u0434\u043B\u044F {sku}: {error}",
    pt: "Falha ao escrever cache para {sku}: {error}",
    nl: "Cache schrijven mislukt voor {sku}: {error}",
    fr: "\xC9criture cache \xE9chou\xE9e pour {sku} : {error}",
    it: "Scrittura cache fallita per {sku}: {error}",
    es: "Fallo al escribir cach\xE9 para {sku}: {error}",
    pl: "Zapis cache nie powi\xF3d\u0142 si\u0119 dla {sku}: {error}",
    uk: "\u0417\u0430\u043F\u0438\u0441 cache \u043D\u0435 \u0432\u0434\u0430\u0432\u0441\u044F \u0434\u043B\u044F {sku}: {error}",
    "zh-cn": "{sku} \u7684\u7F13\u5B58\u5199\u5165\u5931\u8D25\uFF1A{error}"
  },
  // ---- Snapshots / Diagnostics -----------------------------------------
  snapshotDirNotWritable: {
    en: "Snapshot directory not writable ({path}): {error}",
    de: "Snapshot-Verzeichnis nicht beschreibbar ({path}): {error}",
    ru: "\u041A\u0430\u0442\u0430\u043B\u043E\u0433 snapshot \u043D\u0435\u0434\u043E\u0441\u0442\u0443\u043F\u0435\u043D \u0434\u043B\u044F \u0437\u0430\u043F\u0438\u0441\u0438 ({path}): {error}",
    pt: "Pasta de snapshots sem permiss\xE3o de escrita ({path}): {error}",
    nl: "Snapshot-map niet schrijfbaar ({path}): {error}",
    fr: "Dossier snapshots non inscriptible ({path}) : {error}",
    it: "Cartella snapshot non scrivibile ({path}): {error}",
    es: "Directorio de snapshots no escribible ({path}): {error}",
    pl: "Katalog snapshot bez praw zapisu ({path}): {error}",
    uk: "\u041A\u0430\u0442\u0430\u043B\u043E\u0433 snapshot \u0431\u0435\u0437 \u043F\u0440\u0430\u0432 \u0437\u0430\u043F\u0438\u0441\u0443 ({path}): {error}",
    "zh-cn": "\u5FEB\u7167\u76EE\u5F55\u4E0D\u53EF\u5199\uFF08{path}\uFF09\uFF1A{error}"
  },
  snapshotWriteFailed: {
    en: "Snapshot write failed for {sku}: {error}",
    de: "Snapshot-Schreiben fehlgeschlagen f\xFCr {sku}: {error}",
    ru: "Snapshot \u0437\u0430\u043F\u0438\u0441\u044C \u043D\u0435 \u0443\u0434\u0430\u043B\u0430\u0441\u044C \u0434\u043B\u044F {sku}: {error}",
    pt: "Falha ao escrever snapshot para {sku}: {error}",
    nl: "Snapshot schrijven mislukt voor {sku}: {error}",
    fr: "\xC9criture snapshot \xE9chou\xE9e pour {sku} : {error}",
    it: "Scrittura snapshot fallita per {sku}: {error}",
    es: "Fallo al escribir snapshot para {sku}: {error}",
    pl: "Zapis snapshot nie powi\xF3d\u0142 si\u0119 dla {sku}: {error}",
    uk: "\u0417\u0430\u043F\u0438\u0441 snapshot \u043D\u0435 \u0432\u0434\u0430\u0432\u0441\u044F \u0434\u043B\u044F {sku}: {error}",
    "zh-cn": "{sku} \u7684\u5FEB\u7167\u5199\u5165\u5931\u8D25\uFF1A{error}"
  },
  diagnosticsExported: {
    en: "Diagnostics exported for {name} ({sku})",
    de: "Diagnostik exportiert f\xFCr {name} ({sku})",
    ru: "\u0414\u0438\u0430\u0433\u043D\u043E\u0441\u0442\u0438\u043A\u0430 \u044D\u043A\u0441\u043F\u043E\u0440\u0442\u0438\u0440\u043E\u0432\u0430\u043D\u0430 \u0434\u043B\u044F {name} ({sku})",
    pt: "Diagn\xF3stico exportado para {name} ({sku})",
    nl: "Diagnose ge\xEBxporteerd voor {name} ({sku})",
    fr: "Diagnostic export\xE9 pour {name} ({sku})",
    it: "Diagnostica esportata per {name} ({sku})",
    es: "Diagn\xF3stico exportado para {name} ({sku})",
    pl: "Diagnostyka wyeksportowana dla {name} ({sku})",
    uk: "\u0414\u0456\u0430\u0433\u043D\u043E\u0441\u0442\u0438\u043A\u0430 \u0435\u043A\u0441\u043F\u043E\u0440\u0442\u043E\u0432\u0430\u043D\u0430 \u0434\u043B\u044F {name} ({sku})",
    "zh-cn": "\u5DF2\u4E3A {name}\uFF08{sku}\uFF09\u5BFC\u51FA\u8BCA\u65AD"
  },
  // ---- Refresh / data update -------------------------------------------
  refreshNoCloudClient: {
    en: "Refresh cloud data: no Cloud client configured (API key missing) \u2014 nothing to do",
    de: "Cloud-Refresh: kein Cloud-Client konfiguriert (API-Key fehlt) \u2014 nichts zu tun",
    ru: "Cloud refresh: \u043D\u0435\u0442 Cloud-\u043A\u043B\u0438\u0435\u043D\u0442\u0430 (\u043D\u0435\u0442 API-\u043A\u043B\u044E\u0447\u0430) \u2014 \u043D\u0438\u0447\u0435\u0433\u043E \u0434\u0435\u043B\u0430\u0442\u044C",
    pt: "Refresh cloud: sem Cloud-client (falta API key) \u2014 nada a fazer",
    nl: "Cloud-refresh: geen Cloud-client (API-sleutel ontbreekt) \u2014 niets te doen",
    fr: "Refresh cloud : pas de Cloud-client (cl\xE9 API manquante) \u2014 rien \xE0 faire",
    it: "Refresh cloud: nessun Cloud-client (manca API key) \u2014 nulla da fare",
    es: "Refresh cloud: sin Cloud-client (falta API key) \u2014 nada que hacer",
    pl: "Refresh cloud: brak klienta Cloud (brak klucza API) \u2014 nic do zrobienia",
    uk: "Cloud refresh: \u043D\u0435\u043C\u0430\u0454 Cloud-client (\u043D\u0435\u043C\u0430\u0454 API-\u043A\u043B\u044E\u0447\u0430) \u2014 \u043D\u0456\u0447\u043E\u0433\u043E \u0440\u043E\u0431\u0438\u0442\u0438",
    "zh-cn": "Cloud \u5237\u65B0\uFF1A\u672A\u914D\u7F6E Cloud \u5BA2\u6237\u7AEF\uFF08\u7F3A\u5C11 API \u5BC6\u94A5\uFF09 \u2014 \u65E0\u64CD\u4F5C"
  },
  refreshStart: {
    en: "Refresh cloud data: re-fetching scenes and snapshots for all devices",
    de: "Cloud-Refresh: Szenen und Snapshots werden f\xFCr alle Ger\xE4te neu geladen",
    ru: "Cloud refresh: \u043F\u043E\u0432\u0442\u043E\u0440\u043D\u044B\u0439 fetch \u0441\u0446\u0435\u043D \u0438 snapshots \u0434\u043B\u044F \u0432\u0441\u0435\u0445 \u0443\u0441\u0442\u0440\u043E\u0439\u0441\u0442\u0432",
    pt: "Refresh cloud: a recarregar cenas e snapshots de todos os dispositivos",
    nl: "Cloud-refresh: sc\xE8nes en snapshots voor alle apparaten opnieuw ophalen",
    fr: "Refresh cloud : rechargement des sc\xE8nes et snapshots pour tous les appareils",
    it: "Refresh cloud: ricarico scene e snapshot per tutti i dispositivi",
    es: "Refresh cloud: recargando escenas y snapshots para todos los dispositivos",
    pl: "Refresh cloud: ponowne pobieranie scen i snapshot\xF3w dla wszystkich urz\u0105dze\u0144",
    uk: "Cloud refresh: \u043F\u043E\u0432\u0442\u043E\u0440\u043D\u0435 \u0437\u0430\u0432\u0430\u043D\u0442\u0430\u0436\u0435\u043D\u043D\u044F \u0441\u0446\u0435\u043D \u0456 snapshots \u0434\u043B\u044F \u0432\u0441\u0456\u0445 \u043F\u0440\u0438\u0441\u0442\u0440\u043E\u0457\u0432",
    "zh-cn": "Cloud \u5237\u65B0\uFF1A\u6B63\u5728\u4E3A\u6240\u6709\u8BBE\u5907\u91CD\u65B0\u83B7\u53D6\u573A\u666F\u548C\u5FEB\u7167"
  },
  refreshFailed: {
    en: "Refresh cloud data failed: {error}",
    de: "Cloud-Refresh fehlgeschlagen: {error}",
    ru: "Cloud refresh \u043D\u0435 \u0443\u0434\u0430\u043B\u0441\u044F: {error}",
    pt: "Refresh cloud falhou: {error}",
    nl: "Cloud-refresh mislukt: {error}",
    fr: "Refresh cloud a \xE9chou\xE9 : {error}",
    it: "Refresh cloud fallito: {error}",
    es: "Refresh cloud fall\xF3: {error}",
    pl: "Refresh cloud nie powi\xF3d\u0142 si\u0119: {error}",
    uk: "Cloud refresh \u043D\u0435 \u0432\u0434\u0430\u0432\u0441\u044F: {error}",
    "zh-cn": "Cloud \u5237\u65B0\u5931\u8D25\uFF1A{error}"
  },
  // ---- Commands / per-device errors ------------------------------------
  unknownDropdownValue: {
    en: "Unknown dropdown value for {id}: {value} \u2014 ignoring",
    de: "Unbekannter Dropdown-Wert f\xFCr {id}: {value} \u2014 wird ignoriert",
    ru: "\u041D\u0435\u0438\u0437\u0432\u0435\u0441\u0442\u043D\u043E\u0435 dropdown-\u0437\u043D\u0430\u0447\u0435\u043D\u0438\u0435 \u0434\u043B\u044F {id}: {value} \u2014 \u0438\u0433\u043D\u043E\u0440\u0438\u0440\u0443\u0435\u0442\u0441\u044F",
    pt: "Valor de dropdown desconhecido para {id}: {value} \u2014 ignorado",
    nl: "Onbekende dropdown-waarde voor {id}: {value} \u2014 genegeerd",
    fr: "Valeur dropdown inconnue pour {id} : {value} \u2014 ignor\xE9e",
    it: "Valore dropdown sconosciuto per {id}: {value} \u2014 ignorato",
    es: "Valor de dropdown desconocido para {id}: {value} \u2014 ignorado",
    pl: "Nieznana warto\u015B\u0107 dropdown dla {id}: {value} \u2014 ignorowana",
    uk: "\u041D\u0435\u0432\u0456\u0434\u043E\u043C\u0435 \u0437\u043D\u0430\u0447\u0435\u043D\u043D\u044F dropdown \u0434\u043B\u044F {id}: {value} \u2014 \u0456\u0433\u043D\u043E\u0440\u0443\u0454\u0442\u044C\u0441\u044F",
    "zh-cn": "{id} \u7684\u4E0B\u62C9\u503C\u672A\u77E5\uFF1A{value} \u2014 \u5DF2\u5FFD\u7565"
  },
  commandFailed: {
    en: "Command failed for {name}: {error}",
    de: "Befehl fehlgeschlagen f\xFCr {name}: {error}",
    ru: "\u041A\u043E\u043C\u0430\u043D\u0434\u0430 \u043D\u0435 \u0443\u0434\u0430\u043B\u0430\u0441\u044C \u0434\u043B\u044F {name}: {error}",
    pt: "Comando falhou para {name}: {error}",
    nl: "Commando mislukt voor {name}: {error}",
    fr: "Commande \xE9chou\xE9e pour {name} : {error}",
    it: "Comando fallito per {name}: {error}",
    es: "Comando fall\xF3 para {name}: {error}",
    pl: "Komenda nieudana dla {name}: {error}",
    uk: "\u041A\u043E\u043C\u0430\u043D\u0434\u0430 \u043D\u0435 \u0432\u0434\u0430\u043B\u0430\u0441\u044F \u0434\u043B\u044F {name}: {error}",
    "zh-cn": "{name} \u7684\u547D\u4EE4\u5931\u8D25\uFF1A{error}"
  },
  noChannelAvailable: {
    en: "No channel available for {name} ({sku})",
    de: "Kein Kanal verf\xFCgbar f\xFCr {name} ({sku})",
    ru: "\u041D\u0435\u0442 \u043A\u0430\u043D\u0430\u043B\u0430 \u0434\u043B\u044F {name} ({sku})",
    pt: "Sem canal dispon\xEDvel para {name} ({sku})",
    nl: "Geen kanaal beschikbaar voor {name} ({sku})",
    fr: "Aucun canal disponible pour {name} ({sku})",
    it: "Nessun canale disponibile per {name} ({sku})",
    es: "Sin canal disponible para {name} ({sku})",
    pl: "Brak dost\u0119pnego kana\u0142u dla {name} ({sku})",
    uk: "\u041D\u0435\u043C\u0430\u0454 \u043A\u0430\u043D\u0430\u043B\u0443 \u0434\u043B\u044F {name} ({sku})",
    "zh-cn": "{name}\uFF08{sku}\uFF09\u65E0\u53EF\u7528\u901A\u9053"
  },
  invalidSegmentCommand: {
    en: 'Invalid segment command "{command}" for {name}',
    de: 'Ung\xFCltiger Segment-Befehl \u201E{command}" f\xFCr {name}',
    ru: '\u041D\u0435\u0432\u0435\u0440\u043D\u0430\u044F segment-\u043A\u043E\u043C\u0430\u043D\u0434\u0430 "{command}" \u0434\u043B\u044F {name}',
    pt: 'Comando de segmento inv\xE1lido "{command}" para {name}',
    nl: 'Ongeldig segment-commando "{command}" voor {name}',
    fr: "Commande de segment invalide \xAB {command} \xBB pour {name}",
    it: 'Comando segmento non valido "{command}" per {name}',
    es: 'Comando de segmento inv\xE1lido "{command}" para {name}',
    pl: 'Niepoprawne polecenie segmentu \u201E{command}" dla {name}',
    uk: "\u041D\u0435\u0432\u0456\u0440\u043D\u0430 segment-\u043A\u043E\u043C\u0430\u043D\u0434\u0430 \xAB{command}\xBB \u0434\u043B\u044F {name}",
    "zh-cn": "{name} \u7684\u5206\u6BB5\u547D\u4EE4\u65E0\u6548\uFF1A{command}"
  },
  invalidSceneIndex: {
    en: "{sku}: invalid scene index {value}",
    de: "{sku}: ung\xFCltiger Scene-Index {value}",
    ru: "{sku}: \u043D\u0435\u0432\u0435\u0440\u043D\u044B\u0439 scene-\u0438\u043D\u0434\u0435\u043A\u0441 {value}",
    pt: "{sku}: \xEDndice de cena inv\xE1lido {value}",
    nl: "{sku}: ongeldige scene-index {value}",
    fr: "{sku} : index de sc\xE8ne invalide {value}",
    it: "{sku}: indice scena non valido {value}",
    es: "{sku}: \xEDndice de escena inv\xE1lido {value}",
    pl: "{sku}: nieprawid\u0142owy indeks sceny {value}",
    uk: "{sku}: \u043D\u0435\u0432\u0456\u0440\u043D\u0438\u0439 \u0456\u043D\u0434\u0435\u043A\u0441 \u0441\u0446\u0435\u043D\u0438 {value}",
    "zh-cn": "{sku}\uFF1A\u65E0\u6548\u7684\u573A\u666F\u7D22\u5F15 {value}"
  },
  invalidSnapshotIndex: {
    en: "{sku}: invalid snapshot index {value}",
    de: "{sku}: ung\xFCltiger Snapshot-Index {value}",
    ru: "{sku}: \u043D\u0435\u0432\u0435\u0440\u043D\u044B\u0439 snapshot-\u0438\u043D\u0434\u0435\u043A\u0441 {value}",
    pt: "{sku}: \xEDndice de snapshot inv\xE1lido {value}",
    nl: "{sku}: ongeldige snapshot-index {value}",
    fr: "{sku} : index de snapshot invalide {value}",
    it: "{sku}: indice snapshot non valido {value}",
    es: "{sku}: \xEDndice de snapshot inv\xE1lido {value}",
    pl: "{sku}: nieprawid\u0142owy indeks snapshot {value}",
    uk: "{sku}: \u043D\u0435\u0432\u0456\u0440\u043D\u0438\u0439 \u0456\u043D\u0434\u0435\u043A\u0441 snapshot {value}",
    "zh-cn": "{sku}\uFF1A\u65E0\u6548\u7684\u5FEB\u7167\u7D22\u5F15 {value}"
  },
  invalidSegmentIndex: {
    en: "{sku}: invalid segment index in {command}",
    de: "{sku}: ung\xFCltiger Segment-Index in {command}",
    ru: "{sku}: \u043D\u0435\u0432\u0435\u0440\u043D\u044B\u0439 segment-\u0438\u043D\u0434\u0435\u043A\u0441 \u0432 {command}",
    pt: "{sku}: \xEDndice de segmento inv\xE1lido em {command}",
    nl: "{sku}: ongeldige segment-index in {command}",
    fr: "{sku} : index de segment invalide dans {command}",
    it: "{sku}: indice segmento non valido in {command}",
    es: "{sku}: \xEDndice de segmento inv\xE1lido en {command}",
    pl: "{sku}: nieprawid\u0142owy indeks segmentu w {command}",
    uk: "{sku}: \u043D\u0435\u0432\u0456\u0440\u043D\u0438\u0439 \u0456\u043D\u0434\u0435\u043A\u0441 \u0441\u0435\u0433\u043C\u0435\u043D\u0442\u0430 \u0443 {command}",
    "zh-cn": "{sku}\uFF1A{command} \u4E2D\u5206\u6BB5\u7D22\u5F15\u65E0\u6548"
  },
  // ---- Manual segments / setup -----------------------------------------
  manualSegmentsDisabled: {
    en: "{name}: manual segments disabled \u2014 strip treated as contiguous",
    de: "{name}: manuelle Segmente deaktiviert \u2014 Strip wird als ungeteilt behandelt",
    ru: "{name}: \u0440\u0443\u0447\u043D\u044B\u0435 \u0441\u0435\u0433\u043C\u0435\u043D\u0442\u044B \u043E\u0442\u043A\u043B\u044E\u0447\u0435\u043D\u044B \u2014 strip \u0442\u0440\u0430\u043A\u0442\u0443\u0435\u0442\u0441\u044F \u043A\u0430\u043A \u043D\u0435\u043F\u0440\u0435\u0440\u044B\u0432\u043D\u044B\u0439",
    pt: "{name}: segmentos manuais desativados \u2014 strip tratado como cont\xEDnuo",
    nl: "{name}: handmatige segmenten uitgeschakeld \u2014 strip behandeld als aaneengesloten",
    fr: "{name} : segments manuels d\xE9sactiv\xE9s \u2014 strip trait\xE9e comme continue",
    it: "{name}: segmenti manuali disattivati \u2014 strip trattato come continuo",
    es: "{name}: segmentos manuales desactivados \u2014 strip tratado como continuo",
    pl: "{name}: r\u0119czne segmenty wy\u0142\u0105czone \u2014 strip traktowany jako ci\u0105g\u0142y",
    uk: "{name}: \u0440\u0443\u0447\u043D\u0456 \u0441\u0435\u0433\u043C\u0435\u043D\u0442\u0438 \u0432\u0438\u043C\u043A\u043D\u0435\u043D\u043E \u2014 strip \u043E\u0431\u0440\u043E\u0431\u043B\u044F\u0454\u0442\u044C\u0441\u044F \u044F\u043A \u0446\u0456\u043B\u0438\u0439",
    "zh-cn": "{name}\uFF1A\u624B\u52A8\u5206\u6BB5\u5DF2\u7981\u7528 \u2014 \u706F\u5E26\u89C6\u4E3A\u8FDE\u7EED"
  },
  manualListInvalid: {
    en: "{name}: manual_list invalid ({reason}) \u2014 disabling manual mode",
    de: "{name}: manual_list ung\xFCltig ({reason}) \u2014 manueller Modus wird deaktiviert",
    ru: "{name}: manual_list \u043D\u0435\u0432\u0435\u0440\u043D\u044B\u0439 ({reason}) \u2014 manual-mode \u043E\u0442\u043A\u043B\u044E\u0447\u0430\u0435\u0442\u0441\u044F",
    pt: "{name}: manual_list inv\xE1lido ({reason}) \u2014 desativando modo manual",
    nl: "{name}: manual_list ongeldig ({reason}) \u2014 handmatige modus uit",
    fr: "{name} : manual_list invalide ({reason}) \u2014 d\xE9sactivation du mode manuel",
    it: "{name}: manual_list non valido ({reason}) \u2014 disattivazione modalit\xE0 manuale",
    es: "{name}: manual_list inv\xE1lido ({reason}) \u2014 desactivando modo manual",
    pl: "{name}: manual_list nieprawid\u0142owy ({reason}) \u2014 tryb r\u0119czny wy\u0142\u0105czany",
    uk: "{name}: manual_list \u043D\u0435\u0432\u0456\u0440\u043D\u0438\u0439 ({reason}) \u2014 \u0440\u0443\u0447\u043D\u0438\u0439 \u0440\u0435\u0436\u0438\u043C \u0432\u0438\u043C\u043A\u043D\u0435\u043D\u043E",
    "zh-cn": "{name}\uFF1Amanual_list \u65E0\u6548\uFF08{reason}\uFF09 \u2014 \u624B\u52A8\u6A21\u5F0F\u5DF2\u7981\u7528"
  },
  // ---- Migration -------------------------------------------------------
  migrateLegacyCredentials: {
    en: "Removing legacy plaintext MQTT credentials from native (one-time migration)",
    de: "Entferne alte Klartext-MQTT-Credentials aus native (Einmal-Migration)",
    ru: "\u0423\u0434\u0430\u043B\u0435\u043D\u0438\u0435 \u0443\u0441\u0442\u0430\u0440\u0435\u0432\u0448\u0438\u0445 plaintext MQTT-credentials \u0438\u0437 native (\u043E\u0434\u043D\u043E\u0440\u0430\u0437\u043E\u0432\u0430\u044F \u043C\u0438\u0433\u0440\u0430\u0446\u0438\u044F)",
    pt: "A remover credenciais MQTT em texto simples antigas (migra\xE7\xE3o \xFAnica)",
    nl: "Oude plaintext MQTT-credentials uit native verwijderen (eenmalige migratie)",
    fr: "Suppression des anciennes credentials MQTT en clair (migration ponctuelle)",
    it: "Rimozione credenziali MQTT in chiaro legacy da native (migrazione una tantum)",
    es: "Eliminando credenciales MQTT en texto plano legacy (migraci\xF3n \xFAnica)",
    pl: "Usuwanie starych MQTT-credentials w plaintext (jednorazowa migracja)",
    uk: "\u0412\u0438\u0434\u0430\u043B\u0435\u043D\u043D\u044F \u0441\u0442\u0430\u0440\u0438\u0445 plaintext MQTT-credentials \u0456\u0437 native (\u043E\u0434\u043D\u043E\u0440\u0430\u0437\u043E\u0432\u0430 \u043C\u0456\u0433\u0440\u0430\u0446\u0456\u044F)",
    "zh-cn": "\u6B63\u5728\u4ECE native \u4E2D\u79FB\u9664\u65E7\u7684\u660E\u6587 MQTT \u51ED\u636E\uFF08\u4E00\u6B21\u6027\u8FC1\u79FB\uFF09"
  },
  // ---- Device tier / segments (device-manager) -------------------------
  deviceBetaInactive: {
    en: 'Device {label} is in beta and needs the "Enable experimental device support" toggle in adapter settings to apply known per-SKU corrections.',
    de: 'Ger\xE4t {label} ist im Beta-Status und braucht den Toggle \u201EExperimentelle Ger\xE4te-Unterst\xFCtzung aktivieren" in den Adapter-Einstellungen, damit SKU-spezifische Korrekturen greifen.',
    ru: '\u0423\u0441\u0442\u0440\u043E\u0439\u0441\u0442\u0432\u043E {label} \u0432 \u0431\u0435\u0442\u0430-\u0441\u0442\u0430\u0442\u0443\u0441\u0435 \u0438 \u0442\u0440\u0435\u0431\u0443\u0435\u0442 \u0432\u043A\u043B\u044E\u0447\u0435\u043D\u0438\u044F \u043F\u0435\u0440\u0435\u043A\u043B\u044E\u0447\u0430\u0442\u0435\u043B\u044F \u201EExperimental device support" \u0432 \u043D\u0430\u0441\u0442\u0440\u043E\u0439\u043A\u0430\u0445 \u0430\u0434\u0430\u043F\u0442\u0435\u0440\u0430, \u0447\u0442\u043E\u0431\u044B \u043F\u0440\u0438\u043C\u0435\u043D\u044F\u043B\u0438\u0441\u044C SKU-\u043A\u043E\u0440\u0440\u0435\u043A\u0446\u0438\u0438.',
    pt: 'Dispositivo {label} em beta \u2014 ative "Experimental device support" nas defini\xE7\xF5es do adaptador para aplicar corre\xE7\xF5es por SKU.',
    nl: 'Apparaat {label} is in b\xE8ta en heeft de "Experimental device support"-schakelaar in de adapterinstellingen nodig voor SKU-correcties.',
    fr: "Appareil {label} en b\xEAta \u2014 activez \xAB Experimental device support \xBB dans les param\xE8tres de l\u2019adaptateur pour les corrections par SKU.",
    it: 'Dispositivo {label} in beta \u2014 attivare "Experimental device support" nelle impostazioni dell\u2019adattatore per le correzioni per SKU.',
    es: 'Dispositivo {label} en beta \u2014 activa "Experimental device support" en los ajustes del adaptador para correcciones por SKU.',
    pl: 'Urz\u0105dzenie {label} w beta \u2014 w\u0142\u0105cz prze\u0142\u0105cznik \u201EExperimental device support" w ustawieniach adaptera, aby zastosowa\u0107 korekty per SKU.',
    uk: '\u041F\u0440\u0438\u0441\u0442\u0440\u0456\u0439 {label} \u0443 \u0431\u0435\u0442\u0430-\u0441\u0442\u0430\u0442\u0443\u0441\u0456 \u2014 \u0443\u0432\u0456\u043C\u043A\u043D\u0456\u0442\u044C \u201EExperimental device support" \u0443 \u043D\u0430\u043B\u0430\u0448\u0442\u0443\u0432\u0430\u043D\u043D\u044F\u0445 \u0430\u0434\u0430\u043F\u0442\u0435\u0440\u0430, \u0449\u043E\u0431 \u0437\u0430\u0441\u0442\u043E\u0441\u0443\u0432\u0430\u0442\u0438 \u043A\u043E\u0440\u0435\u043A\u0446\u0456\u0457 \u0437\u0430 SKU.',
    "zh-cn": '\u8BBE\u5907 {label} \u5904\u4E8E beta \u72B6\u6001 \u2014 \u5728\u9002\u914D\u5668\u8BBE\u7F6E\u4E2D\u542F\u7528 "Experimental device support" \u5F00\u5173\u540E\u624D\u4F1A\u5E94\u7528 SKU \u4FEE\u6B63\u3002'
  },
  deviceUnknown: {
    en: "Device {label} is not in the supported device list. Please trigger diag.export and post the resulting JSON in a GitHub issue so the SKU can be added.",
    de: "Ger\xE4t {label} steht nicht in der unterst\xFCtzten Ger\xE4te-Liste. Bitte diag.export ausl\xF6sen und das JSON in einem GitHub-Issue posten, damit die SKU aufgenommen werden kann.",
    ru: "\u0423\u0441\u0442\u0440\u043E\u0439\u0441\u0442\u0432\u043E {label} \u043D\u0435\u0442 \u0432 \u0441\u043F\u0438\u0441\u043A\u0435 \u043F\u043E\u0434\u0434\u0435\u0440\u0436\u0438\u0432\u0430\u0435\u043C\u044B\u0445. \u0417\u0430\u043F\u0443\u0441\u0442\u0438 diag.export \u0438 \u043F\u0440\u0438\u0448\u043B\u0438 JSON \u0432 GitHub-issue, \u0447\u0442\u043E\u0431\u044B SKU \u0431\u044B\u043B \u0434\u043E\u0431\u0430\u0432\u043B\u0435\u043D.",
    pt: "Dispositivo {label} n\xE3o est\xE1 na lista de suportados. Aciona diag.export e publica o JSON num GitHub issue para a SKU ser adicionada.",
    nl: "Apparaat {label} staat niet in de lijst met ondersteunde apparaten. Start diag.export en post de JSON in een GitHub-issue zodat de SKU toegevoegd kan worden.",
    fr: "Appareil {label} ne figure pas dans la liste des appareils pris en charge. Lancez diag.export et postez le JSON dans une issue GitHub pour ajouter le SKU.",
    it: "Dispositivo {label} non \xE8 nella lista dei dispositivi supportati. Esegui diag.export e pubblica il JSON in una issue GitHub per aggiungere la SKU.",
    es: "Dispositivo {label} no est\xE1 en la lista de soportados. Ejecuta diag.export y publica el JSON en una issue de GitHub para a\xF1adir la SKU.",
    pl: "Urz\u0105dzenie {label} nie znajduje si\u0119 na li\u015Bcie obs\u0142ugiwanych. Uruchom diag.export i opublikuj JSON w GitHub-issue, aby doda\u0107 SKU.",
    uk: "\u041F\u0440\u0438\u0441\u0442\u0440\u0456\u0439 {label} \u0432\u0456\u0434\u0441\u0443\u0442\u043D\u0456\u0439 \u0443 \u0441\u043F\u0438\u0441\u043A\u0443 \u043F\u0456\u0434\u0442\u0440\u0438\u043C\u0443\u0432\u0430\u043D\u0438\u0445. \u0417\u0430\u043F\u0443\u0441\u0442\u0456\u0442\u044C diag.export \u0456 \u043D\u0430\u0434\u0456\u0448\u043B\u0456\u0442\u044C JSON \u0443 GitHub-issue, \u0449\u043E\u0431 SKU \u0434\u043E\u0434\u0430\u043B\u0438.",
    "zh-cn": "\u8BBE\u5907 {label} \u4E0D\u5728\u652F\u6301\u5217\u8868\u4E2D\u3002\u8BF7\u89E6\u53D1 diag.export \u5E76\u5C06\u7ED3\u679C JSON \u63D0\u4EA4\u5230 GitHub issue\uFF0C\u4EE5\u4FBF\u6DFB\u52A0\u8BE5 SKU\u3002"
  },
  segmentsDetected: {
    en: "{name}: detected {count} segments via MQTT (was {previous}) \u2014 rebuilding state tree",
    de: "{name}: {count} Segmente per MQTT erkannt (vorher {previous}) \u2014 State-Baum wird neu aufgebaut",
    ru: "{name}: \u043E\u0431\u043D\u0430\u0440\u0443\u0436\u0435\u043D\u043E {count} \u0441\u0435\u0433\u043C\u0435\u043D\u0442\u043E\u0432 \u0447\u0435\u0440\u0435\u0437 MQTT (\u0431\u044B\u043B\u043E {previous}) \u2014 state-\u0434\u0435\u0440\u0435\u0432\u043E \u043F\u0435\u0440\u0435\u0441\u0442\u0440\u0430\u0438\u0432\u0430\u0435\u0442\u0441\u044F",
    pt: "{name}: detetados {count} segmentos via MQTT (antes {previous}) \u2014 a reconstruir \xE1rvore de estados",
    nl: "{name}: {count} segmenten gedetecteerd via MQTT (was {previous}) \u2014 state-boom wordt opnieuw opgebouwd",
    fr: "{name} : {count} segments d\xE9tect\xE9s via MQTT (avant {previous}) \u2014 reconstruction de l'arbre d'\xE9tats",
    it: "{name}: rilevati {count} segmenti via MQTT (prima {previous}) \u2014 ricostruzione albero degli stati",
    es: "{name}: detectados {count} segmentos v\xEDa MQTT (antes {previous}) \u2014 reconstruyendo \xE1rbol de estados",
    pl: "{name}: wykryto {count} segment\xF3w przez MQTT (by\u0142o {previous}) \u2014 odbudowa drzewa stan\xF3w",
    uk: "{name}: \u0432\u0438\u044F\u0432\u043B\u0435\u043D\u043E {count} \u0441\u0435\u0433\u043C\u0435\u043D\u0442\u0456\u0432 \u0447\u0435\u0440\u0435\u0437 MQTT (\u0431\u0443\u043B\u043E {previous}) \u2014 \u043F\u0435\u0440\u0435\u0431\u0443\u0434\u043E\u0432\u0430 \u0434\u0435\u0440\u0435\u0432\u0430 \u0441\u0442\u0430\u043D\u0456\u0432",
    "zh-cn": "{name}\uFF1A\u901A\u8FC7 MQTT \u68C0\u6D4B\u5230 {count} \u4E2A\u5206\u6BB5\uFF08\u4E4B\u524D\u4E3A {previous}\uFF09\u2014 \u6B63\u5728\u91CD\u5EFA\u72B6\u6001\u6811"
  },
  // ---- Beta / quirks ---------------------------------------------------
  deviceBeta: {
    en: "Device {label} is in beta \u2014 experimental quirks are active.",
    de: "Ger\xE4t {label} ist im Beta-Status \u2014 experimentelle Quirks sind aktiv.",
    ru: "\u0423\u0441\u0442\u0440\u043E\u0439\u0441\u0442\u0432\u043E {label} \u0432 \u0431\u0435\u0442\u0430-\u0441\u0442\u0430\u0442\u0443\u0441\u0435 \u2014 \u044D\u043A\u0441\u043F\u0435\u0440\u0438\u043C\u0435\u043D\u0442\u0430\u043B\u044C\u043D\u044B\u0435 quirks \u0430\u043A\u0442\u0438\u0432\u043D\u044B.",
    pt: "Dispositivo {label} em beta \u2014 quirks experimentais ativos.",
    nl: "Apparaat {label} is in b\xE8ta \u2014 experimentele quirks zijn actief.",
    fr: "Appareil {label} en b\xEAta \u2014 quirks exp\xE9rimentaux actifs.",
    it: "Dispositivo {label} in beta \u2014 quirks sperimentali attivi.",
    es: "Dispositivo {label} en beta \u2014 quirks experimentales activos.",
    pl: "Urz\u0105dzenie {label} w beta \u2014 eksperymentalne quirks aktywne.",
    uk: "\u041F\u0440\u0438\u0441\u0442\u0440\u0456\u0439 {label} \u0443 \u0431\u0435\u0442\u0430-\u0441\u0442\u0430\u0442\u0443\u0441\u0456 \u2014 \u0435\u043A\u0441\u043F\u0435\u0440\u0438\u043C\u0435\u043D\u0442\u0430\u043B\u044C\u043D\u0456 quirks \u0430\u043A\u0442\u0438\u0432\u043D\u0456.",
    "zh-cn": "\u8BBE\u5907 {label} \u5904\u4E8E beta \u72B6\u6001 \u2014 \u5B9E\u9A8C\u6027 quirks \u5DF2\u542F\u7528\u3002"
  }
};
function tLog(key, params) {
  var _a;
  const bundle = LOG_STRINGS[key];
  const template = (_a = bundle[activeLang]) != null ? _a : bundle.en;
  return fmt(template, params);
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  LOG_STRINGS,
  setActiveLang,
  tLog
});
//# sourceMappingURL=i18n-logs.js.map
