package ae.preferences

// SharedPreferences in the application: the four methods below map straight onto it.
interface PreferenceStorage {
    fun getString(key: String): String?
    fun getBoolean(key: String, default: Boolean): Boolean
    fun putString(key: String, value: String)
    fun putBoolean(key: String, value: Boolean)
    fun remove(key: String)
}

data class PreferenceDefaults(val sound: Boolean = true, val microphoneOn: Boolean = true, val cameraOn: Boolean = true)

data class PreferenceKeys(
    val language: String = "lang",
    val sound: String = "sound",
    val microphoneOn: String = "micOn",
    val cameraOn: String = "camOn",
    val cameraDeviceId: String = "cameraDeviceID",
    val microphoneDeviceId: String = "microphoneDeviceID",
)

// What a person chose on this device: language, sound, camera and microphone. The default keys:
// "lang" (a string), "sound" (a boolean, on unless turned off).
class DevicePreferences(
    private val storage: PreferenceStorage,
    private val defaults: PreferenceDefaults = PreferenceDefaults(),
    private val keys: PreferenceKeys = PreferenceKeys(),
) {
    // Called with the name of the preference after each change.
    var didChange: (String) -> Unit = {}

    // A language code the person picked, or null to follow the device.
    var language: String?
        get() = text(keys.language)
        set(value) = put(value, keys.language, "language")
    var cameraDeviceId: String?
        get() = text(keys.cameraDeviceId)
        set(value) = put(value, keys.cameraDeviceId, "cameraDeviceId")
    var microphoneDeviceId: String?
        get() = text(keys.microphoneDeviceId)
        set(value) = put(value, keys.microphoneDeviceId, "microphoneDeviceId")
    var sound: Boolean
        get() = storage.getBoolean(keys.sound, defaults.sound)
        set(value) { storage.putBoolean(keys.sound, value); didChange("sound") }
    var microphoneOn: Boolean
        get() = storage.getBoolean(keys.microphoneOn, defaults.microphoneOn)
        set(value) { storage.putBoolean(keys.microphoneOn, value); didChange("microphoneOn") }
    var cameraOn: Boolean
        get() = storage.getBoolean(keys.cameraOn, defaults.cameraOn)
        set(value) { storage.putBoolean(keys.cameraOn, value); didChange("cameraOn") }

    // Forget every choice: back to the device's language, default sound and automatic devices.
    fun reset() {
        listOf(keys.language to "language", keys.sound to "sound", keys.microphoneOn to "microphoneOn", keys.cameraOn to "cameraOn",
            keys.cameraDeviceId to "cameraDeviceId", keys.microphoneDeviceId to "microphoneDeviceId").forEach { (key, name) ->
            storage.remove(key)
            didChange(name)
        }
    }

    private fun text(key: String): String? = storage.getString(key)?.takeIf { it.isNotEmpty() }

    private fun put(value: String?, key: String, name: String) {
        if (!value.isNullOrEmpty()) storage.putString(key, value) else storage.remove(key)
        didChange(name)
    }
}

// A saved camera or microphone that is no longer plugged in falls back to automatic ("").
fun availableDeviceId(selected: String?, available: List<String>): String = if (selected != null && selected in available) selected else ""
