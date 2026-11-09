import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { availableDeviceId, createPreferences, exportAll, importAll, type KeyValueStorage } from "../implementation/web/preferences.ts";
import { settingsModel } from "../examples/consumer.ts";

const devices = JSON.parse(readFileSync(new URL("fixtures/devices.json", import.meta.url), "utf8"));
const sample = readFileSync(new URL("fixtures/preferences.ndjson", import.meta.url), "utf8");
function memory(initial: Record<string, string> = {}): KeyValueStorage & { data: Map<string, string> } {
  const data = new Map(Object.entries(initial));
  return { data, getItem: (k) => data.get(k) ?? null, setItem: (k, v) => void data.set(k, v), removeItem: (k) => void data.delete(k) };
}
const defaults = { sound: true, microphoneOn: true, cameraOn: true };

test("a new device has the defaults: device language, sound on, devices on and automatic", () => {
  assert.deepEqual(createPreferences(memory()).all(), { language: null, sound: true, microphoneOn: true, cameraOn: true, cameraDeviceId: null, microphoneDeviceId: null });
  assert.equal(createPreferences(memory(), { sound: false, microphoneOn: false, cameraOn: false }).get("sound"), false);
});

test("choices are stored under the default keys and read back", () => {
  const storage = memory();
  const p = createPreferences(storage);
  p.set("language", "fr");
  p.set("sound", false);
  p.set("cameraDeviceId", "cam-b");
  assert.deepEqual([...storage.data], [["lang", "fr"], ["sound", "off"], ["cameraDeviceID", "cam-b"]]);
  const again = createPreferences(storage);
  assert.deepEqual([again.get("language"), again.get("sound"), again.get("cameraDeviceId")], ["fr", false, "cam-b"]);
});

test("the recipe's own stored values are understood: sound is on unless exactly off", () => {
  for (const [stored, expected] of [[undefined, true], ["on", true], ["off", false], ["garbage", true], ["", true]] as const) {
    const storage = memory(stored === undefined ? {} : { sound: stored });
    assert.equal(createPreferences(storage).get("sound"), expected, String(stored));
  }
});

test("going back to the device language or to automatic removes the stored value", () => {
  const storage = memory({ lang: "de", cameraDeviceID: "x" });
  const p = createPreferences(storage);
  p.set("language", null);
  p.set("cameraDeviceId", "");
  assert.equal(storage.data.size, 0);
  assert.equal(p.get("language"), null);
});

test("listeners hear every change with the value now in force, until they stop listening", () => {
  const p = createPreferences(memory());
  const heard: unknown[] = [];
  const stop = p.subscribe((name, value) => heard.push([name, value]));
  p.set("sound", false);
  p.set("microphoneOn", false);
  p.set("language", "es");
  stop();
  p.set("sound", true);
  assert.deepEqual(heard, [["sound", false], ["microphoneOn", false], ["language", "es"]]);
});

test("reset forgets everything and tells listeners the defaults", () => {
  const storage = memory();
  const p = createPreferences(storage);
  p.set("sound", false); p.set("language", "fr"); p.set("cameraOn", false);
  const heard: string[] = [];
  p.subscribe((name) => heard.push(name));
  p.reset();
  assert.equal(storage.data.size, 0);
  assert.deepEqual(p.all(), createPreferences(memory()).all());
  assert.equal(heard.length, 6);
});

test("a saved device that is gone falls back to automatic", () => {
  for (const [selected, available, expected] of devices.available) assert.equal(availableDeviceId(selected, available), expected);
});

test("export writes only choices that were made; import restores them on another device and refuses bad lines", () => {
  const storage = memory();
  assert.equal(exportAll(storage), "");
  const p = createPreferences(storage);
  p.set("language", "fr"); p.set("sound", false); p.set("cameraDeviceId", "cam-b");
  assert.equal(exportAll(storage), sample);
  const other = memory();
  assert.deepEqual(importAll(other, sample), { imported: 3, rejected: [] });
  assert.deepEqual(createPreferences(other).all(), createPreferences(storage).all());
  const mixed = importAll(memory(), '{"name":"sound","value":"loud"}\nnot json\n{"name":"colour","value":"red"}\n{"name":"language","value":""}\n{"name":"cameraOn","value":true}\n');
  assert.equal(mixed.imported, 1);
  assert.equal(mixed.rejected.length, 4);
});

test("example: choices apply when made and again after a restart, with a missing camera ignored", () => {
  const storage = memory();
  const present = ["cam-a"];
  const first = settingsModel(storage, defaults, () => present);
  first.preferences.set("sound", false);
  first.preferences.set("cameraDeviceId", "cam-a");
  first.preferences.set("language", "de");
  assert.deepEqual(first.applied, { soundOn: false, camera: "cam-a", language: "de" });
  present.pop();
  const restarted = settingsModel(storage, defaults, () => present);
  assert.deepEqual(restarted.applied, { soundOn: false, camera: "", language: "de" });
});
