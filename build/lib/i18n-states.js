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
var i18n_states_exports = {};
__export(i18n_states_exports, {
  STATE_DESCS: () => STATE_DESCS,
  STATE_LABELS: () => STATE_LABELS,
  STATE_NAMES: () => STATE_NAMES,
  tDesc: () => tDesc,
  tLabel: () => tLabel,
  tName: () => tName
});
module.exports = __toCommonJS(i18n_states_exports);
const STATE_NAMES = {
  // ---- Lights: control ----
  power: {
    en: "Power",
    de: "Ein/Aus",
    ru: "\u041F\u0438\u0442\u0430\u043D\u0438\u0435",
    pt: "Ligar/Desligar",
    nl: "Aan/Uit",
    fr: "Marche/Arr\xEAt",
    it: "Accensione",
    es: "Encendido",
    pl: "Zasilanie",
    uk: "\u0416\u0438\u0432\u043B\u0435\u043D\u043D\u044F",
    "zh-cn": "\u7535\u6E90"
  },
  brightness: {
    en: "Brightness",
    de: "Helligkeit",
    ru: "\u042F\u0440\u043A\u043E\u0441\u0442\u044C",
    pt: "Brilho",
    nl: "Helderheid",
    fr: "Luminosit\xE9",
    it: "Luminosit\xE0",
    es: "Brillo",
    pl: "Jasno\u015B\u0107",
    uk: "\u042F\u0441\u043A\u0440\u0430\u0432\u0456\u0441\u0442\u044C",
    "zh-cn": "\u4EAE\u5EA6"
  },
  colorRgb: {
    en: "Color RGB",
    de: "Farbe RGB",
    ru: "\u0426\u0432\u0435\u0442 RGB",
    pt: "Cor RGB",
    nl: "Kleur RGB",
    fr: "Couleur RGB",
    it: "Colore RGB",
    es: "Color RGB",
    pl: "Kolor RGB",
    uk: "\u041A\u043E\u043B\u0456\u0440 RGB",
    "zh-cn": "RGB \u989C\u8272"
  },
  colorTemperature: {
    en: "Color Temperature",
    de: "Farbtemperatur",
    ru: "\u0426\u0432\u0435\u0442\u043E\u0432\u0430\u044F \u0442\u0435\u043C\u043F\u0435\u0440\u0430\u0442\u0443\u0440\u0430",
    pt: "Temperatura de cor",
    nl: "Kleurtemperatuur",
    fr: "Temp\xE9rature de couleur",
    it: "Temperatura colore",
    es: "Temperatura de color",
    pl: "Temperatura barwowa",
    uk: "\u041A\u043E\u043B\u044C\u043E\u0440\u043E\u0432\u0430 \u0442\u0435\u043C\u043F\u0435\u0440\u0430\u0442\u0443\u0440\u0430",
    "zh-cn": "\u8272\u6E29"
  },
  color: {
    en: "Color",
    de: "Farbe",
    ru: "\u0426\u0432\u0435\u0442",
    pt: "Cor",
    nl: "Kleur",
    fr: "Couleur",
    it: "Colore",
    es: "Color",
    pl: "Kolor",
    uk: "\u041A\u043E\u043B\u0456\u0440",
    "zh-cn": "\u989C\u8272"
  },
  // ---- Lights: scenes / music / snapshots ----
  scene: {
    en: "Scene",
    de: "Szene",
    ru: "\u0421\u0446\u0435\u043D\u0430",
    pt: "Cena",
    nl: "Sc\xE8ne",
    fr: "Sc\xE8ne",
    it: "Scena",
    es: "Escena",
    pl: "Scena",
    uk: "\u0421\u0446\u0435\u043D\u0430",
    "zh-cn": "\u573A\u666F"
  },
  lightScene: {
    en: "Light Scene",
    de: "Lichtszene",
    ru: "\u0421\u0432\u0435\u0442\u043E\u0432\u0430\u044F \u0441\u0446\u0435\u043D\u0430",
    pt: "Cena de luz",
    nl: "Lichtsc\xE8ne",
    fr: "Sc\xE8ne lumineuse",
    it: "Scena luce",
    es: "Escena de luz",
    pl: "Scena \u015Bwietlna",
    uk: "\u0421\u0432\u0456\u0442\u043B\u043E\u0432\u0430 \u0441\u0446\u0435\u043D\u0430",
    "zh-cn": "\u706F\u5149\u573A\u666F"
  },
  sceneSpeed: {
    en: "Scene Speed",
    de: "Szenen-Geschwindigkeit",
    ru: "\u0421\u043A\u043E\u0440\u043E\u0441\u0442\u044C \u0441\u0446\u0435\u043D\u044B",
    pt: "Velocidade da cena",
    nl: "Sc\xE8nesnelheid",
    fr: "Vitesse de la sc\xE8ne",
    it: "Velocit\xE0 scena",
    es: "Velocidad de escena",
    pl: "Pr\u0119dko\u015B\u0107 sceny",
    uk: "\u0428\u0432\u0438\u0434\u043A\u0456\u0441\u0442\u044C \u0441\u0446\u0435\u043D\u0438",
    "zh-cn": "\u573A\u666F\u901F\u5EA6"
  },
  diyScene: {
    en: "DIY Scene",
    de: "DIY-Szene",
    ru: "DIY-\u0441\u0446\u0435\u043D\u0430",
    pt: "Cena DIY",
    nl: "DIY-sc\xE8ne",
    fr: "Sc\xE8ne DIY",
    it: "Scena DIY",
    es: "Escena DIY",
    pl: "Scena DIY",
    uk: "DIY-\u0441\u0446\u0435\u043D\u0430",
    "zh-cn": "DIY \u573A\u666F"
  },
  musicMode: {
    en: "Music Mode",
    de: "Musik-Modus",
    ru: "\u0420\u0435\u0436\u0438\u043C \u043C\u0443\u0437\u044B\u043A\u0438",
    pt: "Modo m\xFAsica",
    nl: "Muziekmodus",
    fr: "Mode musique",
    it: "Modalit\xE0 musica",
    es: "Modo m\xFAsica",
    pl: "Tryb muzyki",
    uk: "\u0420\u0435\u0436\u0438\u043C \u043C\u0443\u0437\u0438\u043A\u0438",
    "zh-cn": "\u97F3\u4E50\u6A21\u5F0F"
  },
  musicSensitivity: {
    en: "Music Sensitivity",
    de: "Musik-Empfindlichkeit",
    ru: "\u0427\u0443\u0432\u0441\u0442\u0432\u0438\u0442\u0435\u043B\u044C\u043D\u043E\u0441\u0442\u044C \u043A \u043C\u0443\u0437\u044B\u043A\u0435",
    pt: "Sensibilidade musical",
    nl: "Muziekgevoeligheid",
    fr: "Sensibilit\xE9 musicale",
    it: "Sensibilit\xE0 musica",
    es: "Sensibilidad musical",
    pl: "Czu\u0142o\u015B\u0107 muzyki",
    uk: "\u0427\u0443\u0442\u043B\u0438\u0432\u0456\u0441\u0442\u044C \u0434\u043E \u043C\u0443\u0437\u0438\u043A\u0438",
    "zh-cn": "\u97F3\u4E50\u7075\u654F\u5EA6"
  },
  musicAutoColor: {
    en: "Music Auto Color",
    de: "Musik Auto-Farbe",
    ru: "\u0410\u0432\u0442\u043E\u0446\u0432\u0435\u0442 \u043C\u0443\u0437\u044B\u043A\u0438",
    pt: "Cor autom\xE1tica da m\xFAsica",
    nl: "Muziek auto-kleur",
    fr: "Couleur auto musique",
    it: "Colore automatico musica",
    es: "Color autom\xE1tico de m\xFAsica",
    pl: "Auto-kolor muzyki",
    uk: "\u0410\u0432\u0442\u043E-\u043A\u043E\u043B\u0456\u0440 \u043C\u0443\u0437\u0438\u043A\u0438",
    "zh-cn": "\u97F3\u4E50\u81EA\u52A8\u989C\u8272"
  },
  cloudSnapshot: {
    en: "Cloud Snapshot",
    de: "Cloud-Snapshot",
    ru: "Cloud-\u0441\u043D\u0430\u043F\u0448\u043E\u0442",
    pt: "Cloud Snapshot",
    nl: "Cloud-snapshot",
    fr: "Cloud snapshot",
    it: "Cloud snapshot",
    es: "Cloud snapshot",
    pl: "Cloud snapshot",
    uk: "Cloud-\u0437\u043D\u0456\u043C\u043E\u043A",
    "zh-cn": "Cloud \u5FEB\u7167"
  },
  localSnapshot: {
    en: "Local Snapshot",
    de: "Lokaler Snapshot",
    ru: "\u041B\u043E\u043A\u0430\u043B\u044C\u043D\u044B\u0439 \u0441\u043D\u0430\u043F\u0448\u043E\u0442",
    pt: "Snapshot local",
    nl: "Lokale snapshot",
    fr: "Snapshot local",
    it: "Snapshot locale",
    es: "Snapshot local",
    pl: "Lokalny snapshot",
    uk: "\u041B\u043E\u043A\u0430\u043B\u044C\u043D\u0438\u0439 \u0437\u043D\u0456\u043C\u043E\u043A",
    "zh-cn": "\u672C\u5730\u5FEB\u7167"
  },
  saveLocalSnapshot: {
    en: "Save Local Snapshot",
    de: "Lokalen Snapshot speichern",
    ru: "\u0421\u043E\u0445\u0440\u0430\u043D\u0438\u0442\u044C \u043B\u043E\u043A\u0430\u043B\u044C\u043D\u044B\u0439 \u0441\u043D\u0430\u043F\u0448\u043E\u0442",
    pt: "Guardar snapshot local",
    nl: "Lokale snapshot opslaan",
    fr: "Sauvegarder snapshot local",
    it: "Salva snapshot locale",
    es: "Guardar snapshot local",
    pl: "Zapisz lokalny snapshot",
    uk: "\u0417\u0431\u0435\u0440\u0435\u0433\u0442\u0438 \u043B\u043E\u043A\u0430\u043B\u044C\u043D\u0438\u0439 \u0437\u043D\u0456\u043C\u043E\u043A",
    "zh-cn": "\u4FDD\u5B58\u672C\u5730\u5FEB\u7167"
  },
  deleteLocalSnapshot: {
    en: "Delete Local Snapshot",
    de: "Lokalen Snapshot l\xF6schen",
    ru: "\u0423\u0434\u0430\u043B\u0438\u0442\u044C \u043B\u043E\u043A\u0430\u043B\u044C\u043D\u044B\u0439 \u0441\u043D\u0430\u043F\u0448\u043E\u0442",
    pt: "Apagar snapshot local",
    nl: "Lokale snapshot verwijderen",
    fr: "Supprimer snapshot local",
    it: "Elimina snapshot locale",
    es: "Eliminar snapshot local",
    pl: "Usu\u0144 lokalny snapshot",
    uk: "\u0412\u0438\u0434\u0430\u043B\u0438\u0442\u0438 \u043B\u043E\u043A\u0430\u043B\u044C\u043D\u0438\u0439 \u0437\u043D\u0456\u043C\u043E\u043A",
    "zh-cn": "\u5220\u9664\u672C\u5730\u5FEB\u7167"
  },
  // ---- Appliances / Sensors ----
  workMode: {
    en: "Work Mode",
    de: "Betriebsmodus",
    ru: "\u0420\u0435\u0436\u0438\u043C \u0440\u0430\u0431\u043E\u0442\u044B",
    pt: "Modo de trabalho",
    nl: "Werkmodus",
    fr: "Mode de fonctionnement",
    it: "Modalit\xE0 di lavoro",
    es: "Modo de trabajo",
    pl: "Tryb pracy",
    uk: "\u0420\u0435\u0436\u0438\u043C \u0440\u043E\u0431\u043E\u0442\u0438",
    "zh-cn": "\u5DE5\u4F5C\u6A21\u5F0F"
  },
  modeValue: {
    en: "Mode Value",
    de: "Modus-Wert",
    ru: "\u0417\u043D\u0430\u0447\u0435\u043D\u0438\u0435 \u0440\u0435\u0436\u0438\u043C\u0430",
    pt: "Valor do modo",
    nl: "Moduswaarde",
    fr: "Valeur du mode",
    it: "Valore modalit\xE0",
    es: "Valor del modo",
    pl: "Warto\u015B\u0107 trybu",
    uk: "\u0417\u043D\u0430\u0447\u0435\u043D\u043D\u044F \u0440\u0435\u0436\u0438\u043C\u0443",
    "zh-cn": "\u6A21\u5F0F\u503C"
  },
  targetTemperature: {
    en: "Target Temperature",
    de: "Zieltemperatur",
    ru: "\u0426\u0435\u043B\u0435\u0432\u0430\u044F \u0442\u0435\u043C\u043F\u0435\u0440\u0430\u0442\u0443\u0440\u0430",
    pt: "Temperatura alvo",
    nl: "Doeltemperatuur",
    fr: "Temp\xE9rature cible",
    it: "Temperatura obiettivo",
    es: "Temperatura objetivo",
    pl: "Temperatura docelowa",
    uk: "\u0426\u0456\u043B\u044C\u043E\u0432\u0430 \u0442\u0435\u043C\u043F\u0435\u0440\u0430\u0442\u0443\u0440\u0430",
    "zh-cn": "\u76EE\u6807\u6E29\u5EA6"
  },
  temperature: {
    en: "Temperature",
    de: "Temperatur",
    ru: "\u0422\u0435\u043C\u043F\u0435\u0440\u0430\u0442\u0443\u0440\u0430",
    pt: "Temperatura",
    nl: "Temperatuur",
    fr: "Temp\xE9rature",
    it: "Temperatura",
    es: "Temperatura",
    pl: "Temperatura",
    uk: "\u0422\u0435\u043C\u043F\u0435\u0440\u0430\u0442\u0443\u0440\u0430",
    "zh-cn": "\u6E29\u5EA6"
  },
  humidity: {
    en: "Humidity",
    de: "Luftfeuchtigkeit",
    ru: "\u0412\u043B\u0430\u0436\u043D\u043E\u0441\u0442\u044C",
    pt: "Humidade",
    nl: "Luchtvochtigheid",
    fr: "Humidit\xE9",
    it: "Umidit\xE0",
    es: "Humedad",
    pl: "Wilgotno\u015B\u0107",
    uk: "\u0412\u043E\u043B\u043E\u0433\u0456\u0441\u0442\u044C",
    "zh-cn": "\u6E7F\u5EA6"
  },
  battery: {
    en: "Battery",
    de: "Batterie",
    ru: "\u0410\u043A\u043A\u0443\u043C\u0443\u043B\u044F\u0442\u043E\u0440",
    pt: "Bateria",
    nl: "Batterij",
    fr: "Batterie",
    it: "Batteria",
    es: "Bater\xEDa",
    pl: "Bateria",
    uk: "\u0410\u043A\u0443\u043C\u0443\u043B\u044F\u0442\u043E\u0440",
    "zh-cn": "\u7535\u6C60"
  },
  co2: {
    en: "CO\u2082",
    de: "CO\u2082",
    ru: "CO\u2082",
    pt: "CO\u2082",
    nl: "CO\u2082",
    fr: "CO\u2082",
    it: "CO\u2082",
    es: "CO\u2082",
    pl: "CO\u2082",
    uk: "CO\u2082",
    "zh-cn": "CO\u2082"
  },
  online: {
    en: "Online",
    de: "Online",
    ru: "\u041E\u043D\u043B\u0430\u0439\u043D",
    pt: "Online",
    nl: "Online",
    fr: "En ligne",
    it: "Online",
    es: "Conectado",
    pl: "Online",
    uk: "\u041E\u043D\u043B\u0430\u0439\u043D",
    "zh-cn": "\u5728\u7EBF"
  },
  lackOfWater: {
    en: "Lack of Water",
    de: "Wassermangel",
    ru: "\u041D\u0435\u0434\u043E\u0441\u0442\u0430\u0442\u043E\u043A \u0432\u043E\u0434\u044B",
    pt: "Falta de \xE1gua",
    nl: "Watertekort",
    fr: "Manque d'eau",
    it: "Mancanza d'acqua",
    es: "Falta de agua",
    pl: "Brak wody",
    uk: "\u0411\u0440\u0430\u043A \u0432\u043E\u0434\u0438",
    "zh-cn": "\u7F3A\u6C34"
  },
  iceBucketFull: {
    en: "Ice Bucket Full",
    de: "Eisbeh\xE4lter voll",
    ru: "\u041A\u043E\u043D\u0442\u0435\u0439\u043D\u0435\u0440 \u043B\u044C\u0434\u0430 \u043F\u043E\u043B\u043E\u043D",
    pt: "Recipiente de gelo cheio",
    nl: "IJsbak vol",
    fr: "Bac \xE0 glace plein",
    it: "Cestello ghiaccio pieno",
    es: "Cubo de hielo lleno",
    pl: "Pojemnik na l\xF3d pe\u0142ny",
    uk: "\u041A\u043E\u043D\u0442\u0435\u0439\u043D\u0435\u0440 \u0434\u043B\u044F \u043B\u044C\u043E\u0434\u0443 \u043F\u043E\u0432\u043D\u0438\u0439",
    "zh-cn": "\u51B0\u6876\u5DF2\u6EE1"
  },
  bodyDetected: {
    en: "Body Detected",
    de: "Person erkannt",
    ru: "\u041E\u0431\u043D\u0430\u0440\u0443\u0436\u0435\u043D\u043E \u0442\u0435\u043B\u043E",
    pt: "Corpo detetado",
    nl: "Persoon gedetecteerd",
    fr: "Pr\xE9sence d\xE9tect\xE9e",
    it: "Corpo rilevato",
    es: "Cuerpo detectado",
    pl: "Wykryto osob\u0119",
    uk: "\u0412\u0438\u044F\u0432\u043B\u0435\u043D\u043E \u0442\u0456\u043B\u043E",
    "zh-cn": "\u68C0\u6D4B\u5230\u4EBA\u4F53"
  },
  dirtDetected: {
    en: "Dirt Detected",
    de: "Schmutz erkannt",
    ru: "\u041E\u0431\u043D\u0430\u0440\u0443\u0436\u0435\u043D\u043E \u0437\u0430\u0433\u0440\u044F\u0437\u043D\u0435\u043D\u0438\u0435",
    pt: "Sujeira detetada",
    nl: "Vuil gedetecteerd",
    fr: "Salet\xE9 d\xE9tect\xE9e",
    it: "Sporco rilevato",
    es: "Suciedad detectada",
    pl: "Wykryto brud",
    uk: "\u0412\u0438\u044F\u0432\u043B\u0435\u043D\u043E \u0437\u0430\u0431\u0440\u0443\u0434\u043D\u0435\u043D\u043D\u044F",
    "zh-cn": "\u68C0\u6D4B\u5230\u6C61\u57A2"
  },
  // ---- Diagnostics ----
  exportDiagnostics: {
    en: "Export Diagnostics",
    de: "Diagnostik exportieren",
    ru: "\u042D\u043A\u0441\u043F\u043E\u0440\u0442 \u0434\u0438\u0430\u0433\u043D\u043E\u0441\u0442\u0438\u043A\u0438",
    pt: "Exportar diagn\xF3stico",
    nl: "Diagnose exporteren",
    fr: "Exporter le diagnostic",
    it: "Esporta diagnostica",
    es: "Exportar diagn\xF3stico",
    pl: "Eksportuj diagnostyk\u0119",
    uk: "\u0415\u043A\u0441\u043F\u043E\u0440\u0442 \u0434\u0456\u0430\u0433\u043D\u043E\u0441\u0442\u0438\u043A\u0438",
    "zh-cn": "\u5BFC\u51FA\u8BCA\u65AD"
  },
  diagnosticsJson: {
    en: "Diagnostics JSON",
    de: "Diagnostik JSON",
    ru: "\u0414\u0438\u0430\u0433\u043D\u043E\u0441\u0442\u0438\u043A\u0430 JSON",
    pt: "Diagn\xF3stico JSON",
    nl: "Diagnose JSON",
    fr: "Diagnostic JSON",
    it: "Diagnostica JSON",
    es: "Diagn\xF3stico JSON",
    pl: "Diagnostyka JSON",
    uk: "\u0414\u0456\u0430\u0433\u043D\u043E\u0441\u0442\u0438\u043A\u0430 JSON",
    "zh-cn": "\u8BCA\u65AD JSON"
  },
  deviceTier: {
    en: "Device Tier",
    de: "Ger\xE4te-Stufe",
    ru: "\u0423\u0440\u043E\u0432\u0435\u043D\u044C \u0443\u0441\u0442\u0440\u043E\u0439\u0441\u0442\u0432\u0430",
    pt: "N\xEDvel do dispositivo",
    nl: "Apparaatniveau",
    fr: "Niveau de l'appareil",
    it: "Livello del dispositivo",
    es: "Nivel del dispositivo",
    pl: "Poziom urz\u0105dzenia",
    uk: "\u0420\u0456\u0432\u0435\u043D\u044C \u043F\u0440\u0438\u0441\u0442\u0440\u043E\u044E",
    "zh-cn": "\u8BBE\u5907\u7B49\u7EA7"
  },
  // ---- Segments ----
  manualSegmentsActive: {
    en: "Manual Segments Active",
    de: "Manuelle Segmente aktiv",
    ru: "\u0420\u0443\u0447\u043D\u044B\u0435 \u0441\u0435\u0433\u043C\u0435\u043D\u0442\u044B \u0430\u043A\u0442\u0438\u0432\u043D\u044B",
    pt: "Segmentos manuais ativos",
    nl: "Handmatige segmenten actief",
    fr: "Segments manuels actifs",
    it: "Segmenti manuali attivi",
    es: "Segmentos manuales activos",
    pl: "R\u0119czne segmenty aktywne",
    uk: "\u0420\u0443\u0447\u043D\u0456 \u0441\u0435\u0433\u043C\u0435\u043D\u0442\u0438 \u0430\u043A\u0442\u0438\u0432\u043D\u0456",
    "zh-cn": "\u624B\u52A8\u5206\u6BB5\u5DF2\u542F\u7528"
  },
  manualSegmentList: {
    en: "Manual Segment List",
    de: "Manuelle Segmentliste",
    ru: "\u0421\u043F\u0438\u0441\u043E\u043A \u0440\u0443\u0447\u043D\u044B\u0445 \u0441\u0435\u0433\u043C\u0435\u043D\u0442\u043E\u0432",
    pt: "Lista de segmentos manuais",
    nl: "Handmatige segmentlijst",
    fr: "Liste des segments manuels",
    it: "Elenco segmenti manuali",
    es: "Lista de segmentos manuales",
    pl: "Lista r\u0119cznych segment\xF3w",
    uk: "\u0421\u043F\u0438\u0441\u043E\u043A \u0440\u0443\u0447\u043D\u0438\u0445 \u0441\u0435\u0433\u043C\u0435\u043D\u0442\u0456\u0432",
    "zh-cn": "\u624B\u52A8\u5206\u6BB5\u5217\u8868"
  },
  batchSegmentCommand: {
    en: "Batch Segment Command",
    de: "Batch-Segment-Befehl",
    ru: "\u041A\u043E\u043C\u0430\u043D\u0434\u0430 batch-\u0441\u0435\u0433\u043C\u0435\u043D\u0442",
    pt: "Comando batch de segmento",
    nl: "Batch segment-commando",
    fr: "Commande batch segments",
    it: "Comando batch segmenti",
    es: "Comando batch de segmentos",
    pl: "Polecenie batch-segment",
    uk: "\u041A\u043E\u043C\u0430\u043D\u0434\u0430 batch-\u0441\u0435\u0433\u043C\u0435\u043D\u0442",
    "zh-cn": "\u6279\u91CF\u5206\u6BB5\u547D\u4EE4"
  },
  // ---- Channel names ----
  ledSegments: {
    en: "LED Segments",
    de: "LED-Segmente",
    ru: "LED-\u0441\u0435\u0433\u043C\u0435\u043D\u0442\u044B",
    pt: "Segmentos LED",
    nl: "LED-segmenten",
    fr: "Segments LED",
    it: "Segmenti LED",
    es: "Segmentos LED",
    pl: "Segmenty LED",
    uk: "LED-\u0441\u0435\u0433\u043C\u0435\u043D\u0442\u0438",
    "zh-cn": "LED \u5206\u6BB5"
  },
  deviceInformation: {
    en: "Device Information",
    de: "Ger\xE4te-Informationen",
    ru: "\u0418\u043D\u0444\u043E\u0440\u043C\u0430\u0446\u0438\u044F \u043E\u0431 \u0443\u0441\u0442\u0440\u043E\u0439\u0441\u0442\u0432\u0435",
    pt: "Informa\xE7\xF5es do dispositivo",
    nl: "Apparaatgegevens",
    fr: "Informations sur l'appareil",
    it: "Informazioni dispositivo",
    es: "Informaci\xF3n del dispositivo",
    pl: "Informacje o urz\u0105dzeniu",
    uk: "\u0406\u043D\u0444\u043E\u0440\u043C\u0430\u0446\u0456\u044F \u043F\u0440\u043E \u043F\u0440\u0438\u0441\u0442\u0440\u0456\u0439",
    "zh-cn": "\u8BBE\u5907\u4FE1\u606F"
  },
  groups: {
    en: "Groups",
    de: "Gruppen",
    ru: "\u0413\u0440\u0443\u043F\u043F\u044B",
    pt: "Grupos",
    nl: "Groepen",
    fr: "Groupes",
    it: "Gruppi",
    es: "Grupos",
    pl: "Grupy",
    uk: "\u0413\u0440\u0443\u043F\u0438",
    "zh-cn": "\u5206\u7EC4"
  },
  groupsStatus: {
    en: "Groups Status",
    de: "Gruppen-Status",
    ru: "\u0421\u0442\u0430\u0442\u0443\u0441 \u0433\u0440\u0443\u043F\u043F",
    pt: "Estado dos grupos",
    nl: "Groepsstatus",
    fr: "\xC9tat des groupes",
    it: "Stato gruppi",
    es: "Estado de grupos",
    pl: "Status grup",
    uk: "\u0421\u0442\u0430\u0442\u0443\u0441 \u0433\u0440\u0443\u043F",
    "zh-cn": "\u5206\u7EC4\u72B6\u6001"
  }
};
function tName(key) {
  return STATE_NAMES[key];
}
const STATE_DESCS = {
  cloudSnapshotDesc: {
    en: "Snapshots you saved in the Govee Home app. Selecting one replays that state on the device.",
    de: "Snapshots, die Du in der Govee-Home-App gespeichert hast. Bei Auswahl wird der Zustand auf dem Ger\xE4t wiederhergestellt.",
    ru: "\u0421\u043D\u0430\u043F\u0448\u043E\u0442\u044B, \u0441\u043E\u0445\u0440\u0430\u043D\u0451\u043D\u043D\u044B\u0435 \u0432 \u043F\u0440\u0438\u043B\u043E\u0436\u0435\u043D\u0438\u0438 Govee Home. \u0412\u044B\u0431\u043E\u0440 \u0432\u043E\u0441\u043F\u0440\u043E\u0438\u0437\u0432\u043E\u0434\u0438\u0442 \u0441\u043E\u0441\u0442\u043E\u044F\u043D\u0438\u0435 \u043D\u0430 \u0443\u0441\u0442\u0440\u043E\u0439\u0441\u0442\u0432\u0435.",
    pt: "Snapshots guardados na app Govee Home. Selecionar um rep\xF5e o estado no dispositivo.",
    nl: "Snapshots die je in de Govee Home-app hebt opgeslagen. Bij keuze wordt de toestand op het apparaat hersteld.",
    fr: "Snapshots enregistr\xE9s dans l'app Govee Home. S\xE9lectionner un snapshot rejoue l'\xE9tat sur l'appareil.",
    it: "Snapshot salvati nell'app Govee Home. Selezionandone uno si ripristina lo stato sul dispositivo.",
    es: "Snapshots guardados en la app Govee Home. Al seleccionar uno se reproduce el estado en el dispositivo.",
    pl: "Snapshoty zapisane w aplikacji Govee Home. Wyb\xF3r jednego odtwarza stan na urz\u0105dzeniu.",
    uk: "\u0417\u043D\u0456\u043C\u043A\u0438, \u0437\u0431\u0435\u0440\u0435\u0436\u0435\u043D\u0456 \u0432 \u0434\u043E\u0434\u0430\u0442\u043A\u0443 Govee Home. \u0412\u0438\u0431\u0456\u0440 \u0432\u0456\u0434\u0442\u0432\u043E\u0440\u044E\u0454 \u0441\u0442\u0430\u043D \u043D\u0430 \u043F\u0440\u0438\u0441\u0442\u0440\u043E\u0457.",
    "zh-cn": "\u5728 Govee Home \u5E94\u7528\u4E2D\u4FDD\u5B58\u7684\u5FEB\u7167\u3002\u9009\u62E9\u540E\u4F1A\u5728\u8BBE\u5907\u4E0A\u6062\u590D\u8BE5\u72B6\u6001\u3002"
  },
  localSnapshotDesc: {
    en: "Snapshots saved by this adapter on the ioBroker server. Independent of the Govee Home app.",
    de: "Snapshots, die dieser Adapter lokal auf dem ioBroker-Server gespeichert hat. Unabh\xE4ngig von der Govee-Home-App.",
    ru: "\u0421\u043D\u0430\u043F\u0448\u043E\u0442\u044B, \u0441\u043E\u0445\u0440\u0430\u043D\u0451\u043D\u043D\u044B\u0435 \u044D\u0442\u0438\u043C \u0430\u0434\u0430\u043F\u0442\u0435\u0440\u043E\u043C \u043D\u0430 \u0441\u0435\u0440\u0432\u0435\u0440\u0435 ioBroker. \u041D\u0435\u0437\u0430\u0432\u0438\u0441\u0438\u043C\u043E \u043E\u0442 \u043F\u0440\u0438\u043B\u043E\u0436\u0435\u043D\u0438\u044F Govee Home.",
    pt: "Snapshots guardados por este adaptador no servidor ioBroker. Independente da app Govee Home.",
    nl: "Snapshots die deze adapter op de ioBroker-server opslaat. Onafhankelijk van de Govee Home-app.",
    fr: "Snapshots enregistr\xE9s par cet adaptateur sur le serveur ioBroker. Ind\xE9pendants de l'app Govee Home.",
    it: "Snapshot salvati da questo adattatore sul server ioBroker. Indipendenti dall'app Govee Home.",
    es: "Snapshots guardados por este adaptador en el servidor ioBroker. Independiente de la app Govee Home.",
    pl: "Snapshoty zapisane przez ten adapter na serwerze ioBroker. Niezale\u017Cne od aplikacji Govee Home.",
    uk: "\u0417\u043D\u0456\u043C\u043A\u0438, \u0437\u0431\u0435\u0440\u0435\u0436\u0435\u043D\u0456 \u0446\u0438\u043C \u0430\u0434\u0430\u043F\u0442\u0435\u0440\u043E\u043C \u043D\u0430 \u0441\u0435\u0440\u0432\u0435\u0440\u0456 ioBroker. \u041D\u0435\u0437\u0430\u043B\u0435\u0436\u043D\u043E \u0432\u0456\u0434 \u0434\u043E\u0434\u0430\u0442\u043A\u0430 Govee Home.",
    "zh-cn": "\u7531\u672C\u9002\u914D\u5668\u4FDD\u5B58\u5728 ioBroker \u670D\u52A1\u5668\u4E0A\u7684\u5FEB\u7167\u3002\u4E0E Govee Home \u5E94\u7528\u65E0\u5173\u3002"
  },
  saveLocalSnapshotDesc: {
    en: "Write a name to save the current device state (power, brightness, colour, per-segment colours) as a new local snapshot.",
    de: "Namen schreiben, um den aktuellen Ger\xE4tezustand (Power, Helligkeit, Farbe, Segment-Farben) als neuen lokalen Snapshot zu speichern.",
    ru: "\u0417\u0430\u043F\u0438\u0448\u0438 \u0438\u043C\u044F, \u0447\u0442\u043E\u0431\u044B \u0441\u043E\u0445\u0440\u0430\u043D\u0438\u0442\u044C \u0442\u0435\u043A\u0443\u0449\u0435\u0435 \u0441\u043E\u0441\u0442\u043E\u044F\u043D\u0438\u0435 \u0443\u0441\u0442\u0440\u043E\u0439\u0441\u0442\u0432\u0430 (\u043F\u0438\u0442\u0430\u043D\u0438\u0435, \u044F\u0440\u043A\u043E\u0441\u0442\u044C, \u0446\u0432\u0435\u0442, \u0446\u0432\u0435\u0442\u0430 \u0441\u0435\u0433\u043C\u0435\u043D\u0442\u043E\u0432) \u043A\u0430\u043A \u043D\u043E\u0432\u044B\u0439 \u043B\u043E\u043A\u0430\u043B\u044C\u043D\u044B\u0439 \u0441\u043D\u0430\u043F\u0448\u043E\u0442.",
    pt: "Escreve um nome para guardar o estado atual do dispositivo (liga\xE7\xE3o, brilho, cor, cores por segmento) como novo snapshot local.",
    nl: "Schrijf een naam om de huidige toestand (aan, helderheid, kleur, segmentkleuren) als nieuwe lokale snapshot op te slaan.",
    fr: "\xC9crivez un nom pour enregistrer l'\xE9tat actuel (marche, luminosit\xE9, couleur, couleurs par segment) comme nouveau snapshot local.",
    it: "Scrivi un nome per salvare lo stato attuale (accensione, luminosit\xE0, colore, colori per segmento) come nuovo snapshot locale.",
    es: "Escribe un nombre para guardar el estado actual (encendido, brillo, color, colores por segmento) como nuevo snapshot local.",
    pl: "Wpisz nazw\u0119, aby zapisa\u0107 bie\u017C\u0105cy stan urz\u0105dzenia (zasilanie, jasno\u015B\u0107, kolor, kolory segment\xF3w) jako nowy lokalny snapshot.",
    uk: "\u0412\u0432\u0435\u0434\u0438 \u043D\u0430\u0437\u0432\u0443, \u0449\u043E\u0431 \u0437\u0431\u0435\u0440\u0435\u0433\u0442\u0438 \u043F\u043E\u0442\u043E\u0447\u043D\u0438\u0439 \u0441\u0442\u0430\u043D \u043F\u0440\u0438\u0441\u0442\u0440\u043E\u044E (\u0436\u0438\u0432\u043B\u0435\u043D\u043D\u044F, \u044F\u0441\u043A\u0440\u0430\u0432\u0456\u0441\u0442\u044C, \u043A\u043E\u043B\u0456\u0440, \u043A\u043E\u043B\u044C\u043E\u0440\u0438 \u0441\u0435\u0433\u043C\u0435\u043D\u0442\u0456\u0432) \u044F\u043A \u043D\u043E\u0432\u0438\u0439 \u043B\u043E\u043A\u0430\u043B\u044C\u043D\u0438\u0439 \u0437\u043D\u0456\u043C\u043E\u043A.",
    "zh-cn": "\u8F93\u5165\u540D\u79F0\u4EE5\u5C06\u5F53\u524D\u8BBE\u5907\u72B6\u6001\uFF08\u7535\u6E90\u3001\u4EAE\u5EA6\u3001\u989C\u8272\u3001\u5404\u5206\u6BB5\u989C\u8272\uFF09\u4FDD\u5B58\u4E3A\u65B0\u7684\u672C\u5730\u5FEB\u7167\u3002"
  },
  deleteLocalSnapshotDesc: {
    en: "Write a local snapshot name to delete it. Does not affect Govee Home app snapshots.",
    de: "Namen eines lokalen Snapshots schreiben, um ihn zu l\xF6schen. Govee-Home-App-Snapshots werden nicht ber\xFChrt.",
    ru: "\u0417\u0430\u043F\u0438\u0448\u0438 \u0438\u043C\u044F \u043B\u043E\u043A\u0430\u043B\u044C\u043D\u043E\u0433\u043E \u0441\u043D\u0430\u043F\u0448\u043E\u0442\u0430, \u0447\u0442\u043E\u0431\u044B \u0443\u0434\u0430\u043B\u0438\u0442\u044C \u0435\u0433\u043E. \u0421\u043D\u0430\u043F\u0448\u043E\u0442\u044B Govee Home \u043D\u0435 \u0437\u0430\u0442\u0440\u0430\u0433\u0438\u0432\u0430\u044E\u0442\u0441\u044F.",
    pt: "Escreve o nome de um snapshot local para o apagar. N\xE3o afeta os snapshots da app Govee Home.",
    nl: "Schrijf de naam van een lokale snapshot om hem te verwijderen. Geen effect op Govee Home-snapshots.",
    fr: "\xC9crivez le nom d'un snapshot local pour le supprimer. N'affecte pas les snapshots Govee Home.",
    it: "Scrivi il nome di uno snapshot locale per eliminarlo. Non tocca gli snapshot dell'app Govee Home.",
    es: "Escribe el nombre de un snapshot local para borrarlo. No afecta los snapshots de la app Govee Home.",
    pl: "Wpisz nazw\u0119 lokalnego snapshotu, aby go usun\u0105\u0107. Nie wp\u0142ywa na snapshoty Govee Home.",
    uk: "\u0412\u0432\u0435\u0434\u0438 \u043D\u0430\u0437\u0432\u0443 \u043B\u043E\u043A\u0430\u043B\u044C\u043D\u043E\u0433\u043E \u0437\u043D\u0456\u043C\u043A\u0430, \u0449\u043E\u0431 \u0439\u043E\u0433\u043E \u0432\u0438\u0434\u0430\u043B\u0438\u0442\u0438. \u0417\u043D\u0456\u043C\u043A\u0438 Govee Home \u043D\u0435 \u0437\u0430\u0447\u0456\u043F\u0430\u044E\u0442\u044C\u0441\u044F.",
    "zh-cn": "\u8F93\u5165\u672C\u5730\u5FEB\u7167\u540D\u79F0\u4EE5\u5220\u9664\u8BE5\u5FEB\u7167\u3002\u4E0D\u4F1A\u5F71\u54CD Govee Home \u5E94\u7528\u7684\u5FEB\u7167\u3002"
  },
  manualSegmentsDesc: {
    en: "Enable manual segment list (e.g. for cut LED strips with fewer physical segments than reported)",
    de: "Manuelle Segmentliste aktivieren (z.B. f\xFCr gek\xFCrzte LED-Strips mit weniger physischen Segmenten als gemeldet)",
    ru: "\u0412\u043A\u043B\u044E\u0447\u0438\u0442\u044C \u0440\u0443\u0447\u043D\u043E\u0439 \u0441\u043F\u0438\u0441\u043E\u043A \u0441\u0435\u0433\u043C\u0435\u043D\u0442\u043E\u0432 (\u043D\u0430\u043F\u0440\u0438\u043C\u0435\u0440, \u0434\u043B\u044F \u043E\u0431\u0440\u0435\u0437\u0430\u043D\u043D\u044B\u0445 LED-strip \u0441 \u043C\u0435\u043D\u044C\u0448\u0438\u043C \u0447\u0438\u0441\u043B\u043E\u043C \u0444\u0438\u0437\u0438\u0447\u0435\u0441\u043A\u0438\u0445 \u0441\u0435\u0433\u043C\u0435\u043D\u0442\u043E\u0432)",
    pt: "Ativar lista manual de segmentos (p.ex. para LED-strips cortadas com menos segmentos f\xEDsicos do que reportado)",
    nl: "Handmatige segmentlijst inschakelen (bv. voor ingekorte LED-strips met minder fysieke segmenten)",
    fr: "Activer la liste manuelle des segments (p. ex. pour des bandes LED coup\xE9es avec moins de segments physiques)",
    it: "Abilita la lista manuale dei segmenti (es. per strisce LED tagliate con meno segmenti fisici)",
    es: "Activa la lista manual de segmentos (p. ej. para tiras LED cortadas con menos segmentos f\xEDsicos)",
    pl: "W\u0142\u0105cz r\u0119czn\u0105 list\u0119 segment\xF3w (np. dla skr\xF3conych LED-strips z mniejsz\u0105 liczb\u0105 fizycznych segment\xF3w)",
    uk: "\u0423\u0432\u0456\u043C\u043A\u043D\u0443\u0442\u0438 \u0440\u0443\u0447\u043D\u0438\u0439 \u043F\u0435\u0440\u0435\u043B\u0456\u043A \u0441\u0435\u0433\u043C\u0435\u043D\u0442\u0456\u0432 (\u043D\u0430\u043F\u0440\u0438\u043A\u043B\u0430\u0434, \u0434\u043B\u044F \u043E\u0431\u0440\u0456\u0437\u0430\u043D\u0438\u0445 LED-strips \u0456\u0437 \u043C\u0435\u043D\u0448\u043E\u044E \u043A\u0456\u043B\u044C\u043A\u0456\u0441\u0442\u044E \u0441\u0435\u0433\u043C\u0435\u043D\u0442\u0456\u0432)",
    "zh-cn": "\u542F\u7528\u624B\u52A8\u5206\u6BB5\u5217\u8868\uFF08\u4F8B\u5982\u526A\u77ED\u7684 LED \u706F\u5E26\uFF0C\u7269\u7406\u5206\u6BB5\u6570\u5C11\u4E8E\u62A5\u544A\u503C\uFF09"
  },
  manualListDesc: {
    en: 'Comma-separated indices + ranges, e.g. "0-9" or "0-8,10-14" (only used when manual_mode=true)',
    de: 'Komma-getrennte Indizes + Bereiche, z.B. \u201E0-9" oder \u201E0-8,10-14" (nur aktiv wenn manual_mode=true)',
    ru: '\u0418\u043D\u0434\u0435\u043A\u0441\u044B \u0438 \u0434\u0438\u0430\u043F\u0430\u0437\u043E\u043D\u044B \u0447\u0435\u0440\u0435\u0437 \u0437\u0430\u043F\u044F\u0442\u0443\u044E, \u043D\u0430\u043F\u0440. "0-9" \u0438\u043B\u0438 "0-8,10-14" (\u0438\u0441\u043F\u043E\u043B\u044C\u0437\u0443\u0435\u0442\u0441\u044F \u0442\u043E\u043B\u044C\u043A\u043E \u043F\u0440\u0438 manual_mode=true)',
    pt: '\xCDndices e intervalos separados por v\xEDrgulas, p.ex. "0-9" ou "0-8,10-14" (apenas se manual_mode=true)',
    nl: `Door komma's gescheiden indices + ranges, bv. "0-9" of "0-8,10-14" (alleen als manual_mode=true)`,
    fr: "Indices + plages s\xE9par\xE9s par des virgules, p. ex. \xAB 0-9 \xBB ou \xAB 0-8,10-14 \xBB (seulement si manual_mode=true)",
    it: 'Indici e intervalli separati da virgole, es. "0-9" o "0-8,10-14" (solo con manual_mode=true)',
    es: '\xCDndices + rangos separados por coma, p. ej. "0-9" o "0-8,10-14" (s\xF3lo con manual_mode=true)',
    pl: 'Indeksy + zakresy oddzielone przecinkami, np. \u201E0-9" lub \u201E0-8,10-14" (tylko gdy manual_mode=true)',
    uk: '\u0406\u043D\u0434\u0435\u043A\u0441\u0438 + \u0434\u0456\u0430\u043F\u0430\u0437\u043E\u043D\u0438 \u0447\u0435\u0440\u0435\u0437 \u043A\u043E\u043C\u0443, \u043D\u0430\u043F\u0440\u0438\u043A\u043B\u0430\u0434 "0-9" \u0430\u0431\u043E "0-8,10-14" (\u0442\u0456\u043B\u044C\u043A\u0438 \u043A\u043E\u043B\u0438 manual_mode=true)',
    "zh-cn": '\u7528\u9017\u53F7\u5206\u9694\u7684\u7D22\u5F15\u6216\u8303\u56F4\uFF0C\u4F8B\u5982 "0-9" \u6216 "0-8,10-14"\uFF08\u4EC5\u5728 manual_mode=true \u65F6\u4F7F\u7528\uFF09'
  },
  batchCommandDesc: {
    en: "Format: segments:color:brightness \u2014 e.g. 1-5:#ff0000:20, all:#00ff00, 0,3,7::50",
    de: "Format: Segmente:Farbe:Helligkeit \u2014 z.B. 1-5:#ff0000:20, all:#00ff00, 0,3,7::50",
    ru: "\u0424\u043E\u0440\u043C\u0430\u0442: segments:color:brightness \u2014 \u043D\u0430\u043F\u0440\u0438\u043C\u0435\u0440 1-5:#ff0000:20, all:#00ff00, 0,3,7::50",
    pt: "Formato: segmentos:cor:brilho \u2014 p.ex. 1-5:#ff0000:20, all:#00ff00, 0,3,7::50",
    nl: "Format: segmenten:kleur:helderheid \u2014 bv. 1-5:#ff0000:20, all:#00ff00, 0,3,7::50",
    fr: "Format : segments:couleur:luminosit\xE9 \u2014 p. ex. 1-5:#ff0000:20, all:#00ff00, 0,3,7::50",
    it: "Formato: segmenti:colore:luminosit\xE0 \u2014 es. 1-5:#ff0000:20, all:#00ff00, 0,3,7::50",
    es: "Formato: segmentos:color:brillo \u2014 p. ej. 1-5:#ff0000:20, all:#00ff00, 0,3,7::50",
    pl: "Format: segmenty:kolor:jasno\u015B\u0107 \u2014 np. 1-5:#ff0000:20, all:#00ff00, 0,3,7::50",
    uk: "\u0424\u043E\u0440\u043C\u0430\u0442: segments:color:brightness \u2014 \u043D\u0430\u043F\u0440\u0438\u043A\u043B\u0430\u0434 1-5:#ff0000:20, all:#00ff00, 0,3,7::50",
    "zh-cn": "\u683C\u5F0F\uFF1Asegments:color:brightness \u2014 \u4F8B\u5982 1-5:#ff0000:20\u3001all:#00ff00\u30010,3,7::50"
  }
};
function tDesc(key) {
  return STATE_DESCS[key];
}
const STATE_LABELS = {
  deviceTierVerified: {
    en: "Verified \u2014 confirmed by a tester",
    de: "Verifiziert \u2014 von einem Tester best\xE4tigt",
    ru: "Verified \u2014 \u043F\u043E\u0434\u0442\u0432\u0435\u0440\u0436\u0434\u0435\u043D\u043E \u0442\u0435\u0441\u0442\u0435\u0440\u043E\u043C",
    pt: "Verificado \u2014 confirmado por um tester",
    nl: "Geverifieerd \u2014 bevestigd door een tester",
    fr: "V\xE9rifi\xE9 \u2014 confirm\xE9 par un testeur",
    it: "Verificato \u2014 confermato da un tester",
    es: "Verificado \u2014 confirmado por un tester",
    pl: "Zweryfikowane \u2014 potwierdzone przez testera",
    uk: "\u041F\u0435\u0440\u0435\u0432\u0456\u0440\u0435\u043D\u043E \u2014 \u043F\u0456\u0434\u0442\u0432\u0435\u0440\u0434\u0436\u0435\u043D\u043E \u0442\u0435\u0441\u0442\u0435\u0440\u043E\u043C",
    "zh-cn": "\u5DF2\u9A8C\u8BC1 \u2014 \u7ECF\u6D4B\u8BD5\u8005\u786E\u8BA4"
  },
  deviceTierReported: {
    en: "Reported \u2014 community-reported, treated as verified",
    de: "Gemeldet \u2014 von der Community gemeldet, wie verifiziert behandelt",
    ru: "Reported \u2014 \u043E\u0442\u043C\u0435\u0447\u0435\u043D\u043E \u0441\u043E\u043E\u0431\u0449\u0435\u0441\u0442\u0432\u043E\u043C, \u043E\u0431\u0440\u0430\u0431\u0430\u0442\u044B\u0432\u0430\u0435\u0442\u0441\u044F \u043A\u0430\u043A verified",
    pt: "Reportado \u2014 reportado pela comunidade, tratado como verificado",
    nl: "Gerapporteerd \u2014 door community gemeld, behandeld als geverifieerd",
    fr: "Signal\xE9 \u2014 signal\xE9 par la communaut\xE9, trait\xE9 comme v\xE9rifi\xE9",
    it: "Segnalato \u2014 segnalato dalla community, trattato come verificato",
    es: "Reportado \u2014 reportado por la comunidad, tratado como verificado",
    pl: "Zg\u0142oszone \u2014 zg\u0142oszone przez spo\u0142eczno\u015B\u0107, traktowane jak zweryfikowane",
    uk: "Reported \u2014 \u043F\u043E\u0432\u0456\u0434\u043E\u043C\u043B\u0435\u043D\u043E \u0441\u043F\u0456\u043B\u044C\u043D\u043E\u0442\u043E\u044E, \u043E\u0431\u0440\u043E\u0431\u043B\u044F\u0454\u0442\u044C\u0441\u044F \u044F\u043A verified",
    "zh-cn": "\u5DF2\u4E0A\u62A5 \u2014 \u793E\u533A\u4E0A\u62A5\uFF0C\u6309\u5DF2\u9A8C\u8BC1\u5904\u7406"
  },
  deviceTierSeed: {
    en: "Seed \u2014 beta, needs experimental toggle in adapter settings",
    de: "Seed \u2014 Beta, ben\xF6tigt den Experimental-Toggle in den Adapter-Einstellungen",
    ru: "Seed \u2014 beta, \u043D\u0443\u0436\u0435\u043D experimental-toggle \u0432 \u043D\u0430\u0441\u0442\u0440\u043E\u0439\u043A\u0430\u0445 \u0430\u0434\u0430\u043F\u0442\u0435\u0440\u0430",
    pt: "Seed \u2014 beta, precisa do toggle experimental nas defini\xE7\xF5es do adaptador",
    nl: "Seed \u2014 b\xE8ta, vereist experimentele schakelaar in adapterinstellingen",
    fr: "Seed \u2014 b\xEAta, n\xE9cessite le toggle exp\xE9rimental dans les param\xE8tres",
    it: "Seed \u2014 beta, richiede il toggle experimental nelle impostazioni",
    es: "Seed \u2014 beta, requiere el toggle experimental en los ajustes",
    pl: "Seed \u2014 beta, wymaga prze\u0142\u0105cznika experimental w ustawieniach",
    uk: "Seed \u2014 beta, \u043F\u043E\u0442\u0440\u0456\u0431\u0435\u043D experimental-toggle \u0443 \u043D\u0430\u043B\u0430\u0448\u0442\u0443\u0432\u0430\u043D\u043D\u044F\u0445",
    "zh-cn": "Seed \u2014 beta\uFF0C\u9700\u8981\u5728\u9002\u914D\u5668\u8BBE\u7F6E\u4E2D\u542F\u7528 experimental \u5F00\u5173"
  },
  deviceTierUnknown: {
    en: "Unknown SKU \u2014 please run diag.export and post in a GitHub issue",
    de: "Unbekanntes SKU \u2014 bitte diag.export ausf\xFChren und in einem GitHub-Issue posten",
    ru: "\u041D\u0435\u0438\u0437\u0432\u0435\u0441\u0442\u043D\u044B\u0439 SKU \u2014 \u0432\u044B\u043F\u043E\u043B\u043D\u0438 diag.export \u0438 \u043E\u0442\u043A\u0440\u043E\u0439 GitHub-issue",
    pt: "SKU desconhecido \u2014 corre diag.export e abre uma GitHub issue",
    nl: "Onbekende SKU \u2014 voer diag.export uit en open een GitHub-issue",
    fr: "SKU inconnu \u2014 lance diag.export et ouvre une issue GitHub",
    it: "SKU sconosciuto \u2014 esegui diag.export e apri una issue su GitHub",
    es: "SKU desconocido \u2014 ejecuta diag.export y abre una issue en GitHub",
    pl: "Nieznane SKU \u2014 uruchom diag.export i otw\xF3rz issue na GitHubie",
    uk: "\u041D\u0435\u0432\u0456\u0434\u043E\u043C\u0435 SKU \u2014 \u0432\u0438\u043A\u043E\u043D\u0430\u0439 diag.export \u0456 \u0432\u0456\u0434\u043A\u0440\u0438\u0439 GitHub-issue",
    "zh-cn": "\u672A\u77E5 SKU \u2014 \u8BF7\u8FD0\u884C diag.export \u5E76\u63D0\u4EA4 GitHub issue"
  }
};
function tLabel(key) {
  return STATE_LABELS[key];
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  STATE_DESCS,
  STATE_LABELS,
  STATE_NAMES,
  tDesc,
  tLabel,
  tName
});
//# sourceMappingURL=i18n-states.js.map
