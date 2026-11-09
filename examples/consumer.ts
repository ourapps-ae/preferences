import { availableDeviceId, createPreferences, type KeyValueStorage, type PreferenceDefaults } from "../implementation/web/preferences.ts";

// A settings screen's model: the person's choices, applied to the sound engine and the camera
// whenever they change, restored from the same storage after a restart.
export function settingsModel(storage: KeyValueStorage, defaults: PreferenceDefaults, devices: () => string[]) {
  const preferences = createPreferences(storage, defaults);
  const applied = { soundOn: preferences.get("sound"), camera: availableDeviceId(preferences.get("cameraDeviceId"), devices()), language: preferences.get("language") };
  preferences.subscribe((name, value) => {
    if (name === "sound") applied.soundOn = value as boolean;
    if (name === "cameraDeviceId") applied.camera = availableDeviceId(value as string | null, devices());
    if (name === "language") applied.language = value as string | null;
  });
  return { preferences, applied };
}
