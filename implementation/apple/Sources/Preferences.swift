import Foundation

// UserDefaults has these three methods already.
protocol PreferenceStorage: AnyObject {
    func object(forKey defaultName: String) -> Any?
    func set(_ value: Any?, forKey defaultName: String)
    func removeObject(forKey defaultName: String)
}

extension UserDefaults: PreferenceStorage {}

struct PreferenceDefaults: Equatable {
    var sound = true
    var microphoneOn = true
    var cameraOn = true
}

struct PreferenceKeys {
    var language = "lang"
    var sound = "sound"
    var microphoneOn = "micOn"
    var cameraOn = "camOn"
    var cameraDeviceId = "cameraDeviceID"
    var microphoneDeviceId = "microphoneDeviceID"
}

// What a person chose on this device: language, sound, camera and microphone. The default keys:
// "lang" (a String), "sound" (a Bool, on unless turned off) and "cameraDeviceID" (a String).
final class DevicePreferences {
    private let storage: PreferenceStorage
    private let defaults: PreferenceDefaults
    private let keys: PreferenceKeys
    // Called with the name of the preference after each change.
    var didChange: (String) -> Void = { _ in }

    init(storage: PreferenceStorage = UserDefaults.standard, defaults: PreferenceDefaults = PreferenceDefaults(), keys: PreferenceKeys = PreferenceKeys()) {
        self.storage = storage
        self.defaults = defaults
        self.keys = keys
    }

    // A language code the person picked, or nil to follow the device.
    var language: String? {
        get { text(keys.language) }
        set { put(newValue, keys.language, "language") }
    }
    var cameraDeviceId: String? {
        get { text(keys.cameraDeviceId) }
        set { put(newValue, keys.cameraDeviceId, "cameraDeviceId") }
    }
    var microphoneDeviceId: String? {
        get { text(keys.microphoneDeviceId) }
        set { put(newValue, keys.microphoneDeviceId, "microphoneDeviceId") }
    }
    var sound: Bool {
        get { flag(keys.sound, defaults.sound) }
        set { storage.set(newValue, forKey: keys.sound); didChange("sound") }
    }
    var microphoneOn: Bool {
        get { flag(keys.microphoneOn, defaults.microphoneOn) }
        set { storage.set(newValue, forKey: keys.microphoneOn); didChange("microphoneOn") }
    }
    var cameraOn: Bool {
        get { flag(keys.cameraOn, defaults.cameraOn) }
        set { storage.set(newValue, forKey: keys.cameraOn); didChange("cameraOn") }
    }

    // Forget every choice: back to the device's language, default sound and automatic devices.
    func reset() {
        for (key, name) in [(keys.language, "language"), (keys.sound, "sound"), (keys.microphoneOn, "microphoneOn"), (keys.cameraOn, "cameraOn"),
                            (keys.cameraDeviceId, "cameraDeviceId"), (keys.microphoneDeviceId, "microphoneDeviceId")] {
            storage.removeObject(forKey: key)
            didChange(name)
        }
    }

    private func text(_ key: String) -> String? {
        guard let value = storage.object(forKey: key) as? String, !value.isEmpty else { return nil }
        return value
    }

    private func flag(_ key: String, _ fallback: Bool) -> Bool { storage.object(forKey: key) as? Bool ?? fallback }

    private func put(_ value: String?, _ key: String, _ name: String) {
        if let value, !value.isEmpty { storage.set(value, forKey: key) } else { storage.removeObject(forKey: key) }
        didChange(name)
    }

    // A saved camera or microphone that is no longer plugged in falls back to automatic ("").
    static func availableDeviceId(_ selected: String?, among available: [String]) -> String {
        if let selected, available.contains(selected) { return selected }
        return ""
    }
}
