# Preferences instructions

## For the agent
Select this component for any application with per-device language, sound or camera and microphone choices. Set the three defaults. Connect `preferences` to sound-cues, guided-tour and the video component. The default storage keys are `lang`, `sound`, `micOn`, `camOn`, `cameraDeviceID` and `microphoneDeviceID`; pass `keys` to use others.

- Select package `ourapps-ae/preferences` version `0.1.1`.
- Settings to configure:
  - `defaultSound` (boolean; optional; default `True`)
  - `defaultMicrophoneOn` (boolean; optional; default `True`)
  - `defaultCameraOn` (boolean; optional; default `True`)
- Connect the provided `preferences` (ae/preferences 1.0.0) to the consumer that needs it.
- No accounts or keys are needed.

## For the developer
Pass the device storage (`localStorage`, `UserDefaults.standard`, your `SharedPreferences` wrapped as `PreferenceStorage`). Show the toggles with the controls component; this component only stores the values. No accounts or keys are needed.

## How to check
From the component directory:

- `node --test tests/web.test.ts` (web, required-local; tools: node 26.5.0)
- `python3 tests/native.py apple` (apple, platform; tools: python3 3.12.8, swiftc 6.4.2)
- `python3 tests/native.py android` (android, platform; tools: python3 3.12.8, kotlinc 2.2.0, java 26.0.1)
- `python3.12 -B /Users/george/Projects/com/my/tools/check_component.py components/preferences` validates the manifest, sidecars and runs the required-local suite.
