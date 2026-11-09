import ae.preferences.DevicePreferences
import ae.preferences.PreferenceDefaults
import ae.preferences.PreferenceStorage
import ae.preferences.availableDeviceId

class MemoryStorage : PreferenceStorage {
    val data = mutableMapOf<String, Any>()
    override fun getString(key: String): String? = data[key] as String?
    override fun getBoolean(key: String, default: Boolean): Boolean = data[key] as Boolean? ?: default
    override fun putString(key: String, value: String) { data[key] = value }
    override fun putBoolean(key: String, value: Boolean) { data[key] = value }
    override fun remove(key: String) { data.remove(key) }
}

// The cases of tests/fixtures/devices.json, written out so no JSON library is needed.
fun main() {
    check(availableDeviceId(null, listOf("cam-a", "cam-b")) == "")
    check(availableDeviceId("cam-b", listOf("cam-a", "cam-b")) == "cam-b")
    check(availableDeviceId("cam-z", listOf("cam-a", "cam-b")) == "")
    check(availableDeviceId("cam-a", listOf()) == "")

    val storage = MemoryStorage()
    val p = DevicePreferences(storage)
    check(p.language == null && p.sound && p.microphoneOn && p.cameraOn && p.cameraDeviceId == null && p.microphoneDeviceId == null)
    check(!DevicePreferences(MemoryStorage(), PreferenceDefaults(sound = false)).sound)
    val heard = mutableListOf<String>()
    p.didChange = { heard.add(it) }
    p.language = "fr"
    p.sound = false
    p.cameraDeviceId = "cam-b"
    check(storage.data["lang"] == "fr" && storage.data["sound"] == false && storage.data["cameraDeviceID"] == "cam-b")
    check(DevicePreferences(storage).language == "fr" && !DevicePreferences(storage).sound)
    check(heard == listOf("language", "sound", "cameraDeviceId"))
    p.language = null
    p.cameraDeviceId = ""
    check(!storage.data.containsKey("lang") && !storage.data.containsKey("cameraDeviceID"))
    p.microphoneOn = false
    p.cameraOn = false
    check(!p.microphoneOn && !p.cameraOn)
    heard.clear()
    p.reset()
    check(storage.data.isEmpty() && p.sound && p.microphoneOn && heard.size == 6)
    println("preference assertions passed")
}
