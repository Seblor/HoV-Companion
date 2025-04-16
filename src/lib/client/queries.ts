import { exists, readDir, writeFile } from "@tauri-apps/plugin-fs";
import type { GithubRelease } from "../../app";
import { fetch } from "@tauri-apps/plugin-http";
import { downloadDir } from "@tauri-apps/api/path";
import { download } from "@tauri-apps/plugin-upload";
import { writable } from "svelte/store";
import { Command } from "@tauri-apps/plugin-shell";
import { humanFileSize } from "$lib/utils";
import { openPath } from "@tauri-apps/plugin-opener";

export const status = writable({
  name: '',
  progress: -1,
})

status.subscribe((value) => {
  console.log(value);
});

export async function getDownloadLink () {
  // const response = await fetch("https://api.github.com/repos/UE4SS-RE/RE-UE4SS/releases");
  // console.log(response.status);  // e.g. 200
  // console.log(response.statusText); // e.g. "OK"
  // const jsonData = await response.json();

  // const latestRelease: GithubRelease | null = jsonData.reduce((latest: GithubRelease | null, release: GithubRelease | null) => {
  //   if (latest?.published_at == null) {
  //     return release;
  //   }
  //   if (release?.published_at == null) {
  //     return latest;
  //   }
  //   const releaseDate = new Date(release.published_at);
  //   if (!latest || releaseDate > new Date(latest.published_at)) {
  //     return release;
  //   }
  //   return latest;
  // }, null);

  // return latestRelease?.assets.filter(asset => asset.name.startsWith('UE4SS'))[0]?.browser_download_url;

  return "https://github.com/UE4SS-RE/RE-UE4SS/releases/download/experimental-latest/UE4SS_v3.0.1-394-g437a8ff.zip"
}

export async function downloadUE4SS (gamePath: string): Promise<boolean> {

  if (!gamePath) {
    return false
  }

  const binaryPath = `${gamePath}\\HeroesOfValor\\Binaries\\Win64`

  status.set({
    name: "Getting link for UE4SS",
    progress: 0,
  });
  const link = await getDownloadLink();

  if (!link) return false;

  status.set({
    name: "Downloading UE4SS",
    progress: 0,
  });

  const downloading = download(link, `${await downloadDir()}/UE4SS.zip`, (progress) => {
    status.set({
      name: `Downloading UE4SS (${humanFileSize(progress.transferSpeed)}/s)`,
      progress: progress.progressTotal / progress.total,
    });
  })

  await downloading

  status.set({
    name: "Unpacking UE4SS",
    progress: 0,
  });

  console.log({ binaryPath });

  const result = await Command.create('extract-UE4SS', [
    "-xf",
    `${await downloadDir()}/UE4SS.zip`,
    "-C",
    binaryPath,
  ]).execute()

  status.set({
    name: "Done!",
    progress: -1,
  });

  console.log({ result });

  return true;
}

export async function getGamePath (): Promise<string | null> {
  const command = Command.create("get-game-path");

  try {
    const value = await command.execute()
    const installPath = value.stdout.split("\n").find(line => line.trim().startsWith("InstallLocation"))?.match(/(?:REG_SZ\s+)(.*)\r/)?.[1]
    return installPath ?? null
  } catch (error) {
    return null
  }
}

export async function checkIsGamePathValid (gamePath: string): Promise<boolean> {
  try {
    const win64DirEXists = await exists(`${gamePath}\\HeroesOfValor\\Binaries\\Win64`)
    if (!win64DirEXists) {
      return false
    }
    const win64Dircontent = await readDir(`${gamePath}\\HeroesOfValor\\Binaries\\Win64\\`)

    return win64Dircontent.find(item => item.isFile && /HeroesOfValor.*\.exe/i.test(item.name)) !== undefined
  } catch (error) {
    return false
  }
}

export async function checkIsUE4SSInstalled (gamePath: string): Promise<boolean> {
  try {
    const ue4ssDirExists = await exists(`${gamePath}\\HeroesOfValor\\Binaries\\Win64`)
    if (!ue4ssDirExists) {
      return false
    }
    const ue4ssDirContent = await readDir(`${gamePath}\\HeroesOfValor\\Binaries\\Win64`)

    return ue4ssDirContent.find(item => /UE4SS/i.test(item.name)) !== undefined
  } catch (error) {
    return false
  }
}

export async function isGameRunning (): Promise<boolean> {
  const command = Command.create("is-game-open");
  try {
    const value = await command.execute()
    return value.stdout.includes("HeroesOfValor")
  } catch (error) {
    return false
  }
}

export function startGame () {
  openPath("steam://run/3317910")
}
