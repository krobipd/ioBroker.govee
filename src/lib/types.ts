/** Adapter configuration from ioBroker native config */
export interface AdapterConfig {
  /** Govee Cloud API key (optional — enables scenes, segments, device names) */
  apiKey: string;
  /** Govee account email (optional — enables MQTT real-time status) */
  goveeEmail: string;
  /** Govee account password (optional — enables MQTT real-time status) */
  goveePassword: string;
  /** Cloud device list refresh interval in seconds */
  pollInterval: number;
}

// --- Cloud API v2 Types ---

/** Device from Cloud API GET /router/api/v1/user/devices */
export interface CloudDevice {
  sku: string;
  device: string;
  deviceName: string;
  type: string;
  capabilities: CloudCapability[];
}

/** A single capability from the Cloud API */
export interface CloudCapability {
  type: string;
  instance: string;
  parameters: CapabilityParameters;
}

/** Parameter definition for a capability */
export interface CapabilityParameters {
  dataType: "ENUM" | "INTEGER" | "STRUCT";
  options?: CapabilityOption[];
  range?: { min: number; max: number; precision: number };
  unit?: string;
  fields?: CapabilityField[];
}

/** ENUM option */
export interface CapabilityOption {
  name: string;
  value: number | string | Record<string, unknown>;
}

/** STRUCT field definition */
export interface CapabilityField {
  fieldName: string;
  dataType: "ENUM" | "INTEGER" | "STRUCT";
  options?: CapabilityOption[];
  range?: { min: number; max: number; precision: number };
  required?: boolean;
}

/** Cloud API device list response */
export interface CloudDeviceListResponse {
  code: number;
  message: string;
  data: CloudDevice[];
}

/** Cloud API device state response */
export interface CloudDeviceStateResponse {
  code: number;
  message: string;
  data: {
    sku: string;
    device: string;
    capabilities: CloudStateCapability[];
  };
}

/** A capability value from state response */
export interface CloudStateCapability {
  type: string;
  instance: string;
  state: { value: unknown };
}

/** Cloud API scenes response */
export interface CloudScenesResponse {
  code: number;
  message: string;
  data: CloudScene[];
}

/** A scene from the Cloud API */
export interface CloudScene {
  sceneName: string;
  sceneId: number;
  sceneParamId?: string;
}

// --- AWS IoT MQTT Types ---

/** Login response from app2.govee.com */
export interface GoveeLoginResponse {
  client: {
    token: string;
    accountId: string;
    topic: string;
  };
}

/** IoT key response from app2.govee.com */
export interface GoveeIotKeyResponse {
  data: {
    endpoint: string;
    p12: string;
    p12Pass: string;
  };
}

/** MQTT status update received on account topic */
export interface MqttStatusUpdate {
  sku: string;
  device: string;
  state?: {
    onOff?: number;
    brightness?: number;
    color?: { r: number; g: number; b: number };
    colorTemInKelvin?: number;
  };
  op?: {
    command?: string[];
  };
}

/** MQTT command message */
export interface MqttCommand {
  msg: {
    cmd: string;
    data: Record<string, unknown>;
    cmdVersion: number;
    transaction: string;
    type: number;
  };
}

// --- LAN API Types ---

/** LAN discovery response */
export interface LanDevice {
  ip: string;
  device: string;
  sku: string;
  bleVersionHard: string;
  bleVersionSoft: string;
  wifiVersionHard: string;
  wifiVersionSoft: string;
}

/** LAN status response */
export interface LanStatus {
  onOff: number;
  brightness: number;
  color: { r: number; g: number; b: number };
  colorTemInKelvin: number;
}

/** LAN command message wrapper */
export interface LanMessage {
  msg: {
    cmd: string;
    data: Record<string, unknown>;
  };
}

// --- Internal Device Model ---

/** Unified device representation used by device-manager */
export interface GoveeDevice {
  /** Product model (e.g. H6160) */
  sku: string;
  /** Unique device ID (8-byte hex) */
  deviceId: string;
  /** Display name (from Cloud or SKU fallback) */
  name: string;
  /** Device type from Cloud (e.g. "light") */
  type: string;
  /** LAN IP address if discovered */
  lanIp?: string;
  /** MQTT device topic for publishing commands */
  mqttTopic?: string;
  /** Capabilities from Cloud API */
  capabilities: CloudCapability[];
  /** Available scenes (from Cloud) */
  scenes: CloudScene[];
  /** Last known state */
  state: DeviceState;
  /** Which channels are available */
  channels: {
    lan: boolean;
    mqtt: boolean;
    cloud: boolean;
  };
}

/** Current device state */
export interface DeviceState {
  online: boolean;
  power?: boolean;
  brightness?: number;
  colorRgb?: string;
  colorTemperature?: number;
  scene?: string;
  [key: string]: unknown;
}

/** Timer/callback interfaces for helper classes */
export interface TimerAdapter {
  setInterval(callback: () => void, ms: number): ioBroker.Interval | undefined;
  clearInterval(timer: ioBroker.Interval): void;
  setTimeout(callback: () => void, ms: number): ioBroker.Timeout | undefined;
  clearTimeout(timer: ioBroker.Timeout): void;
}
