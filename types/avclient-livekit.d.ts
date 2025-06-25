import LiveKitAVClient from "../src/LiveKitAVClient";

/**
 * FoundryVTT Type Extensions
 */

interface ApplicationOptions {
  template?: string;
  classes?: string[];
  width?: number;
  height?: number;
  top?: number;
  left?: number;
  scale?: number;
  popOut?: boolean;
  minimizable?: boolean;
  resizable?: boolean;
  id?: string;
  title?: string;
  scrollY?: string[];
  tabs?: TabsOptions[];
  dragDrop?: DragDropOptions[];
  filters?: SearchFilterOptions[];
  closeOnSubmit?: boolean;
  submitOnChange?: boolean;
  submitOnClose?: boolean;
  editable?: boolean;
}

interface TabsOptions {
  navSelector?: string;
  contentSelector?: string;
  initial?: string;
  callback?: (event: Event, tabs: any, active: string) => void;
}

interface DragDropOptions {
  dragSelector?: string;
  dropSelector?: string;
  permissions?: object;
  callbacks?: object;
}

interface SearchFilterOptions {
  inputSelector?: string;
  contentSelector?: string;
  initial?: string;
  callback?: (event: Event, query: string, rgx: RegExp, html: JQuery) => void;
}

interface FoundryPosition {
  width?: number;
  height?: number;
  top?: number;
  left?: number;
  scale?: number;
}

interface FoundrySettings {
  get(namespace: string, key: string): unknown;
  set(namespace: string, key: string, value: unknown): Promise<unknown>;
  register(namespace: string, key: string, data: FoundrySettingConfig): void;
  settings: Map<string, FoundrySettingConfig>;
}

interface FoundryGame {
  settings: FoundrySettings;
  user?: {
    can(permission: string): boolean;
    isGM: boolean;
  };
  i18n?: {
    localize(key: string): string;
  };
  webrtc?: {
    client?: {
      _liveKitClient?: {
        liveKitServerTypes?: Record<string, unknown>;
      };
      settings?: FoundrySettings;
    };
  };
  release?: {
    version: string;
  };
  data?: {
    version?: string;
  };
}

interface FoundryUI {
  webrtc?: {
    getUserCameraView?(userId: string): HTMLElement | undefined;
    getUserVideoElement?(userId: string): HTMLVideoElement | undefined;
  };
}

/**
 * Interfaces
 */

// LiveKit connection settings
interface ConnectionSettings {
  url: string;
  room: string;
  username: string;
  password: string;
}

interface LiveKitServerType {
  key: string;
  label: string;
  details?: string;
  url?: string;
  urlRequired: boolean;
  usernameRequired: boolean;
  passwordRequired: boolean;
  tokenFunction: LiveKitTokenFunction;
}

interface LiveKitServerTypes {
  [key: string]: LiveKitServerType;
}

interface LiveKitTokenFunction {
  (
    apiKey: string,
    secretKey: string,
    roomName: string,
    userName: string,
    metadata: string
  ): Promise<string>;
}

// Custom voice modes to remove ACTIVITY
interface LiveKitVoiceModes {
  ALWAYS: "always";
  PTT: "ptt";
}

// Custom foundry socket message
interface SocketMessage {
  action: "breakout" | "connect" | "disconnect" | "render";
  userId?: string;
  breakoutRoom?: string;
}

/**
 * Types
 */

interface FoundrySettingConfig {
  namespace: string;
  key: string;
  name?: string;
  hint?: string;
  type: Function | typeof String | typeof Number | typeof Boolean;
  config: boolean;
  scope: string;
  choices?: Record<string, string>;
  range?: { min: number; max: number; step: number };
  filePicker?: boolean | string;
}

type LiveKitSettingsConfig = FoundrySettingConfig & {
  id?: string;
  value?: unknown;
  settingType?: string;
  isCheckbox?: boolean;
  isSelect?: boolean;
  isRange?: boolean;
  isNumber?: boolean;
  filePickerType?: string;
};

/**
 * Global settings
 */

// Set AVSettings.VoiceModes to custom type
declare global {
  namespace AVSettings {
    interface Overrides {
      VoiceModes: LiveKitVoiceModes;
    }
  }
}

// Set game.webrtc.client to LiveKitAVClient
declare global {
  interface WebRTCConfig {
    clientClass: typeof LiveKitAVClient;
  }
}
