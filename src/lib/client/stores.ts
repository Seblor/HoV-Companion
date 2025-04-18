import { writable } from "svelte/store";
import { checkIsGameRunning, getMods, getModsDir } from "./queries";
import { watchImmediate, type UnwatchFn } from "@tauri-apps/plugin-fs";
import { debounce } from "lodash";

export const status = writable({
  name: "",
  progress: -1,
});

export const gameDir = writable<string | null>(
  localStorage.getItem("gamePath") || null,
);
export const modsDir = writable<string | null>(null);
export const isGameRunning = writable(false);
export const modsList = writable<Record<string, boolean>>({});

let unwatcher: UnwatchFn | null = null;

gameDir.subscribe(async (value) => {
  localStorage.setItem("gamePath", value ?? "");
  modsDir.set(await getModsDir(value ?? ""));
});

modsDir.subscribe(async (value) => {
  if (!value) {
    return;
  }
  const mods = await getMods(value);
  modsList.set(mods);

  unwatcher?.();

  unwatcher = await watchImmediate(
    value,
    debounce(async (event) => {
      const mods = await getMods(value);
      modsList.set(mods);
    }, 500),
    {
      recursive: true,
    },
  );
});

setInterval(async () => {
  isGameRunning.set(await checkIsGameRunning());
}, 1e3);
