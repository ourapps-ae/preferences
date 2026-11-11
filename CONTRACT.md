# Preferences component

## Purpose and facilities
`preferences` keeps what a person chose on one device: the language they picked (or none, to follow the device), whether sound is on, whether the microphone and the camera are on, and which camera and microphone they chose (none means automatic). It reads and writes the device's own storage, tells listeners when a value changes, resets everything to the defaults, and works out whether a saved device is still plugged in. The buttons that change these values belong to controls and video-calls; choosing the text of a language belongs to translations.

Facilities: `preferences` (Per-device language, sound, camera and microphone choices with storage and change notification).

## User inputs
Three settings give the defaults for a device that has never chosen: `defaultSound` (default true), `defaultMicrophoneOn` (true) and `defaultCameraOn` (true). Language and device choices have no default beyond "follow the device" and "automatic".

- `defaultSound` (boolean; optional; default `True`)
- `defaultMicrophoneOn` (boolean; optional; default `True`)
- `defaultCameraOn` (boolean; optional; default `True`)

## Artefacts and dependencies
`component.json` maps every `implementation/` source into `components/preferences/`:

- `implementation/android/src/main/java/ae/preferences/Preferences.kt` -> `components/preferences/android/src/main/java/ae/preferences/Preferences.kt`
- `implementation/apple/Sources/Preferences.swift` -> `components/preferences/apple/Sources/Preferences.swift`
- `implementation/web/preferences.ts` -> `components/preferences/web/preferences.ts`

Dependencies: none.
`tools.lock.json` pins verification tools: node 26.5, python3 3.12, swiftc 6.4, kotlinc 2.2, java 26.0. Licence wording remains deferred.

## Provided interfaces
- `interfaces/preferences.json` defines `preferences` (ae/preferences) version 1.0.0 as an OpenRPC 1.3.2 document: the TypeScript functions and `PreferenceStore.*` methods (tagged `typescript`) and the native `DevicePreferences` class (tagged `swift` and `kotlin`), with the preferences, defaults, keys and records as JSON Schema 2020-12.
- `interfaces/preference-record.schema.json` is the JSON Schema 2020-12 document of one exported record (ae/preference-record 1.0.0).

## Required interfaces
None.

## Integration
Web: `createPreferences(localStorage, defaults)`; read with `get`, change with `set`, react with `subscribe`. Sound-making code reads `get("sound")` before each sound, the video component reads the device and on-off choices when it connects and writes them when the person changes them, and the language component reads `get("language")` (null follows the browser). Apple and Android: `DevicePreferences` over `UserDefaults` or `SharedPreferences` (behind the small `PreferenceStorage` interface), with `didChange` for updates. `availableDeviceId` (all platforms) turns a saved device into `""` when it is no longer present. `examples/consumer.ts` is a settings model that applies the choices. The sound-cues and guided-tour components require this interface.

## Visual definition and connected examples
`visual/definition.json` maps its ports to the provided and required interfaces. `visual/examples/connected.json` connects the component to an illustrative application consumer. Both image formats and a text description are in `visual/output/`.

## Infrastructure
No service. Values live in the device's own storage (browser local storage, UserDefaults, SharedPreferences) and are never sent anywhere.

## Verification
Required-local: `node --test tests/web.test.ts` checks defaults, the default storage keys and on/off encoding, removal when returning to automatic, listeners, reset, missing devices, ndjson export and import with rejected lines, and the example. Platform: `python3 tests/native.py apple` compiles and runs the Swift checks; `python3 tests/native.py android` compiles the Kotlin checks (needs kotlinc, not installed on the authoring machine, so not run there).

- `node --test tests/web.test.ts` (web, required-local; tools: node 26.5)
- `python3 tests/native.py apple` (apple, platform; tools: python3 3.12, swiftc 6.4)
- `python3 tests/native.py android` (android, platform; tools: python3 3.12, kotlinc 2.2, java 26.0)

## Scenarios and presentation
A person picks French on the home screen: the next launch starts in French. They turn sound off: every later sound is skipped until they turn it on. They choose an external camera, unplug it and start the application: the camera falls back to automatic but the choice is kept for when it returns. They reset the hints and preferences: everything is back to the device's language and the defaults.

## Updates and removal
Patch updates replace files. The stored values are small per-device choices described in `migration.json`; the default keys are `lang`, `sound`, `micOn`, `camOn`, `cameraDeviceID` and `microphoneDeviceID`. Removal deletes the owned code; stored choices remain on the device until the application clears them.
