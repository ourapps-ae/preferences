// What a person chose on this device: language, sound, camera and microphone. Kept on the device
// only; nothing is sent anywhere. The toggle buttons that change these belong to controls and
// video-calls; this component keeps the values, their defaults and their storage.
export type Preferences = {
  // A language code the person picked, or null to follow the device.
  language: string | null;
  sound: boolean;
  microphoneOn: boolean;
  cameraOn: boolean;
  // A chosen device id, or null for automatic.
  cameraDeviceId: string | null;
  microphoneDeviceId: string | null;
};
export type PreferenceName = keyof Preferences;
export type PreferenceDefaults = { sound: boolean; microphoneOn: boolean; cameraOn: boolean };
export type KeyValueStorage = { getItem(key: string): string | null; setItem(key: string, value: string): void; removeItem(key: string): void };

// The default storage keys; a caller may pass others.
export const DEFAULT_KEYS: Record<PreferenceName, string> = {
  language: "lang", sound: "sound", microphoneOn: "micOn", cameraOn: "camOn", cameraDeviceId: "cameraDeviceID", microphoneDeviceId: "microphoneDeviceID",
};
export const DEFAULT_PREFERENCE_DEFAULTS: PreferenceDefaults = { sound: true, microphoneOn: true, cameraOn: true };
const BOOLEANS: PreferenceName[] = ["sound", "microphoneOn", "cameraOn"];
const TEXTS: PreferenceName[] = ["language", "cameraDeviceId", "microphoneDeviceId"];

export type PreferenceStore = {
  get<N extends PreferenceName>(name: N): Preferences[N];
  set<N extends PreferenceName>(name: N, value: Preferences[N]): void;
  all(): Preferences;
  // Forget every choice: back to the device's language, default sound and automatic devices.
  reset(): void;
  subscribe(listener: (name: PreferenceName, value: Preferences[PreferenceName]) => void): () => void;
};

export function createPreferences(storage: KeyValueStorage, defaults: PreferenceDefaults = DEFAULT_PREFERENCE_DEFAULTS, keys: Record<PreferenceName, string> = DEFAULT_KEYS): PreferenceStore {
  const listeners = new Set<(name: PreferenceName, value: Preferences[PreferenceName]) => void>();
  const get = <N extends PreferenceName>(name: N): Preferences[N] => {
    const raw = storage.getItem(keys[name]);
    if (BOOLEANS.includes(name)) {
      // Only an explicit "off" turns a choice off; anything else is the default.
      if (raw === "off") return false as Preferences[N];
      if (raw === "on") return true as Preferences[N];
      return defaults[name as keyof PreferenceDefaults] as Preferences[N];
    }
    return (raw === null || raw === "" ? null : raw) as Preferences[N];
  };
  const set = <N extends PreferenceName>(name: N, value: Preferences[N]) => {
    if (BOOLEANS.includes(name)) storage.setItem(keys[name], value ? "on" : "off");
    else if (value === null || value === "") storage.removeItem(keys[name]);
    else storage.setItem(keys[name], String(value));
    const now = get(name);
    for (const listener of listeners) listener(name, now);
  };
  return {
    get, set,
    all: () => ({ language: get("language"), sound: get("sound"), microphoneOn: get("microphoneOn"), cameraOn: get("cameraOn"), cameraDeviceId: get("cameraDeviceId"), microphoneDeviceId: get("microphoneDeviceId") }),
    reset() {
      for (const name of Object.keys(keys) as PreferenceName[]) {
        storage.removeItem(keys[name]);
        const now = get(name);
        for (const listener of listeners) listener(name, now);
      }
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => void listeners.delete(listener);
    },
  };
}

// A saved camera or microphone that is no longer plugged in falls back to automatic ("").
export function availableDeviceId(selected: string | null, available: readonly string[]): string {
  return selected !== null && available.includes(selected) ? selected : "";
}

// Portable form, one JSON object per line: {"name": "sound", "value": false}. Only choices that were
// made are written; defaults stay defaults.
export function exportAll(storage: KeyValueStorage, keys: Record<PreferenceName, string> = DEFAULT_KEYS): string {
  const lines: string[] = [];
  for (const name of Object.keys(keys) as PreferenceName[]) {
    const raw = storage.getItem(keys[name]);
    if (raw === null) continue;
    lines.push(JSON.stringify({ name, value: BOOLEANS.includes(name) ? raw === "on" : raw }));
  }
  return lines.length ? lines.join("\n") + "\n" : "";
}

export type ImportResult = { imported: number; rejected: string[] };

export function importAll(storage: KeyValueStorage, text: string, keys: Record<PreferenceName, string> = DEFAULT_KEYS): ImportResult {
  const store = createPreferences(storage, DEFAULT_PREFERENCE_DEFAULTS, keys);
  let imported = 0;
  const rejected: string[] = [];
  for (const line of text.split("\n")) {
    if (!line.trim()) continue;
    try {
      const record = JSON.parse(line) as { name?: unknown; value?: unknown };
      const name = record.name as PreferenceName;
      if (BOOLEANS.includes(name) && typeof record.value === "boolean") store.set(name as "sound", record.value);
      else if (TEXTS.includes(name) && typeof record.value === "string" && record.value !== "") store.set(name as "language", record.value);
      else { rejected.push(line); continue; }
      imported++;
    } catch {
      rejected.push(line);
    }
  }
  return { imported, rejected };
}
