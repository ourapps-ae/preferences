# Source mapping

Reference revision: `19905b75dbea89fbfd424d67fe26c81aaed0e018`. Paths are under the `recipe/` folder of `ourapps-ae/OurPoker` unless they name another `ourapps-ae` component.

What the recipe stores per device for this purpose: `lang` (picked language), `sound` (on or off) and, on Apple only, `cameraDeviceID`. The microphone and camera on-off choice and the microphone device are not stored in the recipe (`micOn` and `camOn` start true each session, `implementation/web/video.ts` in `ourapps-ae/video-calls` lines 18-19, `VideoSession.swift` lines 46-47). They are added here as preferences (`generated-platform`) because the batch asks for camera and microphone choices; the video component can read them but must be changed to do so.

## Files

- `implementation/web/preferences.ts` <-
  - language: `web/src/i18n.ts` lines 13-31 (`localStorage` `lang`, `pickedLanguage`, `pickLanguage`, null goes back to the browser's language). Resolving the picked code to a supported language (line 12, `selectLanguage`) stays in the translations component.
  - sound: `web/src/sound.ts` lines 13 and 25-29 (`sound` is `"off"` or otherwise on, `setSound` writes `"on"` or `"off"`). Stopping playing sounds on mute (line 28 `stopAll`) stays in sound-cues; here a subscriber does it.
  - `availableDeviceId`: `implementation/apple/Sources/VideoSession.swift` in `ourapps-ae/video-calls` lines 89-92 (`availableCameraID`), from `ios/OurPoker/Sources/MediaToggles.swift` lines 13-26.
  - `createPreferences`, `subscribe`, `reset`, defaults as settings, `microphoneOn`, `cameraOn`, `microphoneDeviceId`, `exportAll`, `importAll`: new.
- `implementation/apple/Sources/Preferences.swift` <- `ios/OurPoker/Sources/Strings.swift` lines 8-20 (`picked` and `pick` over `UserDefaults` `lang`), `ios/OurPoker/Sources/Sound.swift` lines 11-31 (`SoundSetting`: `sound` read with `object(forKey:) as? Bool ?? true`, written as a Bool), `implementation/apple/Sources/VideoSession.swift` in `ourapps-ae/video-calls` lines 56-75 and 111-113 (`cameraDeviceID`). `Platform.swift` holds no stored settings (only compile-time platform switches) so nothing was taken from it. Not extracted: the SwiftUI language menu (`HomeScreen.swift` lines 142-159), the `Language` bundle switching and observation (`Strings.swift` lines 20-36), and `Sound.stopAll`.
- `implementation/android/src/main/java/ae/preferences/Preferences.kt` <- `android/app/src/main/java/app/ourapps/ourpoker/AppLanguage.kt` lines 14-19 (`picked`, `pick` over `SharedPreferences` `lang`), `Sound.kt` lines 44-53 (`SoundSetting`: boolean `sound`, default true). Not extracted: the locale wrapping (`wrap`, lines 24-30), the `StateFlow` and the language menu (`ui/HomeScreen.kt`). Not compiled on the authoring machine (no kotlinc).

## Left behind in the recipe

- The toggle buttons (`web/src/screens.ts` lines 161-179, `MediaToggles.swift`, `ui/MediaToggles.kt`): they belong to controls and video-calls.
- Hints and tutorial flags (`beginner`, `handPanel`, `tut.*` in `web/src/guide.ts`, `TableModel.swift` lines 61-107, `TableViewModel.kt` lines 240-257): they belong to guided-tour and the recipe.
- The server address override `serverURL` (`TableModel.swift` line 148) and the session mode: application settings, not person's preferences.
