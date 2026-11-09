import Foundation

func check(_ condition: Bool, _ message: String) {
    if !condition { FileHandle.standardError.write(Data("FAILED: \(message)\n".utf8)); exit(1) }
}

final class MemoryStorage: PreferenceStorage {
    var data: [String: Any] = [:]
    func object(forKey defaultName: String) -> Any? { data[defaultName] }
    func set(_ value: Any?, forKey defaultName: String) { data[defaultName] = value }
    func removeObject(forKey defaultName: String) { data[defaultName] = nil }
}

let fixture = try JSONSerialization.jsonObject(with: Data(contentsOf: URL(fileURLWithPath: "tests/fixtures/devices.json"))) as! [String: Any]
var count = 0
for row in fixture["available"] as! [[Any]] {
    let selected = row[0] as? String
    check(DevicePreferences.availableDeviceId(selected, among: row[1] as! [String]) == (row[2] as! String), "available \(row)")
    count += 1
}

let storage = MemoryStorage()
let p = DevicePreferences(storage: storage)
check(p.language == nil && p.sound && p.microphoneOn && p.cameraOn && p.cameraDeviceId == nil && p.microphoneDeviceId == nil, "defaults")
check(!DevicePreferences(storage: MemoryStorage(), defaults: PreferenceDefaults(sound: false, microphoneOn: true, cameraOn: true)).sound, "configured default")
var heard: [String] = []
p.didChange = { heard.append($0) }
p.language = "fr"
p.sound = false
p.cameraDeviceId = "cam-b"
check(storage.data["lang"] as? String == "fr", "default key lang")
check(storage.data["sound"] as? Bool == false, "recipe key sound is a Bool")
check(storage.data["cameraDeviceID"] as? String == "cam-b", "default key cameraDeviceID")
check(DevicePreferences(storage: storage).language == "fr" && !DevicePreferences(storage: storage).sound, "read back")
check(heard == ["language", "sound", "cameraDeviceId"], "listener told")
p.language = nil
p.cameraDeviceId = ""
check(storage.data["lang"] == nil && storage.data["cameraDeviceID"] == nil, "device language and automatic remove the value")
p.microphoneOn = false
p.cameraOn = false
check(!p.microphoneOn && !p.cameraOn, "devices off")
heard = []
p.reset()
check(storage.data.isEmpty && p.sound && p.microphoneOn && heard.count == 6, "reset")
print("\(count + 10) preference assertions passed")
