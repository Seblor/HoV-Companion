import {
  copyFile,
  exists,
  mkdir,
  readDir,
  readTextFile,
  remove,
  writeTextFile,
} from "@tauri-apps/plugin-fs";
import { downloadDir, resolveResource } from "@tauri-apps/api/path";
import { download } from "@tauri-apps/plugin-upload";
import { get } from "svelte/store";
import { Command } from "@tauri-apps/plugin-shell";
import { humanFileSize } from "$lib/utils";
import { openPath } from "@tauri-apps/plugin-opener";
import { modsDir, status } from "./stores";
import { getVersion } from "@tauri-apps/api/app";

export async function getDownloadLink () {
  // const response = await fetch("https://api.github.com/repos/UE4SS-RE/RE-UE4SS/releases");
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

  return "https://github.com/UE4SS-RE/RE-UE4SS/releases/download/experimental-latest/UE4SS_v3.0.1-394-g437a8ff.zip";
}

export async function downloadUE4SS (gamePath: string): Promise<boolean> {
  if (!gamePath) {
    console.log("No game path found");
    return false;
  }

  const binaryPath = `${gamePath}\\HeroesOfValor\\Binaries\\Win64`;

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

  const downloading = download(
    link,
    `${await downloadDir()}/UE4SS.zip`,
    (progress) => {
      status.set({
        name: `Downloading UE4SS (${humanFileSize(progress.transferSpeed)}/s)`,
        progress: progress.progressTotal / progress.total,
      });
    },
  );

  await downloading;

  status.set({
    name: "Unpacking UE4SS",
    progress: 0,
  });

  await Command.create("extract-UE4SS", [
    "-xf",
    `${await downloadDir()}/UE4SS.zip`,
    "-C",
    binaryPath,
  ]).execute();

  status.set({
    name: "Unpacking UE4SS",
    progress: 1,
  });

  const modsDirectory = await getModsDir(gamePath);

  if (!modsDirectory) {
    console.log('No mods dir found');
    return false;
  }

  modsDir.set(modsDirectory);

  status.set({
    name: "Removing unused files",
    progress: 0,
  });

  cleanDefaultModsDir(modsDirectory)

  status.set({
    name: "Adding default mods",
    progress: 0,
  });

  installCompanionMods(modsDirectory)

  status.set({
    name: "Done!",
    progress: -1,
  });

  return true;
}

// Clear all defaults mods except the "shared" library
export async function cleanDefaultModsDir (modsDir: string) {
  const modsDirExists = await exists(modsDir);
  if (!modsDirExists) {
    return;
  }

  const modsDirContent = await readDir(modsDir);
  for (const item of modsDirContent) {
    if (item.name !== "shared") {
      remove(`${modsDir}\\${item.name}`, { recursive: true }); // Remove all mods
    }
  }
}

// Copy all the mods from the "src/assets/Mods" directory to the mods directory
export async function installCompanionMods (modsDir: string) {
  const modsDirExists = await exists(modsDir);
  if (!modsDirExists) {
    return;
  }

  const modsToInstall = await resolveResource('resources/Mods');
  await copyRecursive(modsToInstall, modsDir)
}

export async function copyRecursive (fromPath: string, toPath: string) {
  const fromDirContent = await readDir(fromPath);
  for (const item of fromDirContent) {
    if (item.isFile) {
      await copyFile(`${fromPath}\\${item.name}`, `${toPath}\\${item.name}`);
    } else if (item.isDirectory) {
      const newDir = `${toPath}\\${item.name}`;
      if (!(await exists(newDir))) {
        await mkdir(newDir);
      }
      await copyRecursive(`${fromPath}\\${item.name}`, `${toPath}\\${item.name}`);
    }
  }
  return true;
}

export async function getGamePath (): Promise<string | null> {
  const command = Command.create("get-game-path");

  try {
    const value = await command.execute();
    const installPath = value.stdout
      .split("\n")
      .find((line) => line.trim().startsWith("InstallLocation"))
      ?.match(/(?:REG_SZ\s+)(.*)\r/)?.[1];
    return installPath ?? null;
  } catch (error) {
    return null;
  }
}

export async function checkIsGamePathValid (gamePath: string): Promise<boolean> {
  try {
    const win64DirEXists = await exists(
      `${gamePath}\\HeroesOfValor\\Binaries\\Win64`,
    );
    if (!win64DirEXists) {
      return false;
    }
    const win64Dircontent = await readDir(
      `${gamePath}\\HeroesOfValor\\Binaries\\Win64\\`,
    );

    return (
      win64Dircontent.find(
        (item) => item.isFile && /HeroesOfValor.*\.exe/i.test(item.name),
      ) !== undefined
    );
  } catch (error) {
    return false;
  }
}

export async function checkIsUE4SSInstalled (
  gamePath: string,
): Promise<boolean> {
  try {
    const ue4ssDirExists = await exists(
      `${gamePath}\\HeroesOfValor\\Binaries\\Win64`,
    );
    if (!ue4ssDirExists) {
      return false;
    }
    const ue4ssDirContent = await readDir(
      `${gamePath}\\HeroesOfValor\\Binaries\\Win64`,
    );

    return (
      ue4ssDirContent.find((item) => /UE4SS/i.test(item.name)) !== undefined
    );
  } catch (error) {
    return false;
  }
}

function getPossibleDirectories (gamePath: string): string[] {
  return [
    `${gamePath}\\HeroesOfValor\\Binaries\\Win64\\Mods`,
    `${gamePath}\\HeroesOfValor\\Binaries\\Win64\\UE4SS\\Mods`,
    `${gamePath}\\HeroesOfValor\\Binaries\\Win64\\ue4ss\\Mods`,
  ];
}

export async function getModsDir (gamePath: string): Promise<string | null> {
  if (!gamePath) {
    return null;
  }
  const possibleDirectories = getPossibleDirectories(gamePath);
  try {
    let modsDirectory = null;
    for (const directory of possibleDirectories) {
      const modsDirExists = await exists(directory);
      if (modsDirExists) {
        modsDirectory = directory;
      }
    }
    return modsDirectory;
  } catch (error) {
    return null;
  }
}

export async function getMods (
  modsDir: string,
): Promise<Record<string, boolean>> {
  try {
    if (!(await exists(modsDir))) {
      return {};
    }
    const modsDirContent = await readDir(modsDir);

    const modsList = modsDirContent
      .filter((item) => item.isDirectory && item.name !== "shared")
      .map((item) => item.name);
    const modsTxt = modsDirContent.find(
      (item) => item.isFile && item.name === "mods.txt",
    );

    const mods: Record<string, boolean> = {};

    for (const mod of modsList) {
      mods[mod] =
        await exists(
          `${modsDir}\\${mod}\\enabled.txt`,);
    }

    return mods;
  } catch (error) {
    return {};
  }
}

export async function setModEnabled (
  modsDir: string,
  modName: string,
  shouldEnable: boolean) {
  const modEnabledFile = `${modsDir}\\${modName}\\enabled.txt`;
  const isAlreadyEnabled = await exists(`${modsDir}\\${modName}\\enabled.txt`,);
  if (shouldEnable && !isAlreadyEnabled) {

    status.set({
      name: `Enabling ${modName}`,
      progress: 0,
    });

    await writeTextFile(modEnabledFile, "");

    status.set({
      name: `Enabling ${modName}`,
      progress: -1,
    });
  } else if (!shouldEnable && isAlreadyEnabled) {

    status.set({
      name: `Disabling ${modName}`,
      progress: 0,
    });

    await remove(modEnabledFile);

    status.set({
      name: `Disabling ${modName}`,
      progress: -1,
    });
  }
}

export async function checkIsGameRunning (): Promise<boolean> {
  const command = Command.create("is-game-open");
  try {
    const value = await command.execute();
    return value.stdout.includes("HeroesOfValor");
  } catch (error) {
    return false;
  }
}

/**
 * Gets the mod's config. Returns null if the mod isn't found.
 */
export async function getModConfig (
  modsPath: string,
  modName: string,
): Promise<Record<string, ConfigVariable> | null> {
  const modConfigPath = `${modsPath}\\${modName}\\config.txt`;
  if (await exists(modConfigPath)) {
    const config = await readTextFile(modConfigPath);
    return luaToObject(config);
  }
  return null;
}

export function luaToObject (
  lua: string,
): Record<string, ConfigVariable> | null {
  const lines = lua.split("\n");
  const obj: Record<string, ConfigVariable> = {};

  const parser =
    /^\s*(?<varName>\w+)\s*=\s*(?<val>(["']).*\3|\d+|true|false)\s*(--(?<comment>.*))?$|\s*--.*$|^\s*$/m;
  for (const line of lines) {
    const match = line.match(parser);
    if (match?.groups) {
      const { varName, val, comment } = match.groups;
      if (varName && val) {
        let value: string | number | boolean = val;
        if (/^\d+$/.test(val)) {
          value = Number.parseInt(val, 10);
        } else if (/^true|false$/i.test(val)) {
          value = val.toLowerCase() === "true";
        } else if (/^(["']).*\1$/.test(val)) {
          value = val.slice(1, -1);
        }
        obj[varName] = { varName, value, comment };
      }
    }
  }

  return obj;
}

export async function editConfigVariable ({
  modsPath,
  modName,
  variableName,
  newValue,
}: {
  modsPath: string;
  modName: string;
  variableName: string;
  newValue: string | number | boolean;
}) {

  status.set({
    name: "Editing config",
    progress: 0,
  });

  const modConfigPath = `${modsPath}\\${modName}\\config.txt`;
  if (!await exists(modConfigPath)) {
    return;
  }
  const config = (await readTextFile(modConfigPath)).split("\n");
  const parser =
    /^\s*(?<varName>\w+)\s*=\s*(?<val>(["']).*\3|\d+|true|false)\s*(--(?<comment>.*))?$|\s*--.*$|^\s*$/m;

  const commentsToAdd: Record<string, string> = {};
  let maxVarNameLength = 0;
  let maxValueLength = 0;

  const newConfig = config.map((line, index) => {
    const match = line.match(parser);
    if (match?.groups?.varName && match?.groups?.val) {
      const { varName, val, comment } = match.groups;
      maxVarNameLength = Math.max(maxVarNameLength, varName.length);
      maxValueLength = Math.max(maxValueLength, (varName === variableName ? String(newValue) : val).length);

      let valueToAssign: string | number | boolean = varName === variableName ? newValue : val;

      if (varName === variableName) {
        if (typeof newValue === "string") {
          valueToAssign = `"${newValue}"`;
        } else if (typeof newValue === "number") {
          valueToAssign = newValue.toString();
        } else if (typeof newValue === "boolean") {
          valueToAssign = newValue ? "true" : "false";
        }
      }

      maxVarNameLength = Math.max(maxVarNameLength, varName.length);
      maxValueLength = Math.max(maxValueLength, (varName === variableName ? String(valueToAssign) : val).length);

      if (comment?.trim()) {
        commentsToAdd[index] = comment.trim();
      }

      return `${varName} = ${valueToAssign}`;
    }
    return line;
  })

  // Reformat each line with proper space alignments
  for (const [index, line] of newConfig.entries()) {
    const match = line.match(parser);
    if (match?.groups?.varName && match?.groups?.val) {
      const { varName, val } = match.groups;
      const comment = commentsToAdd[index] ?? "";
      newConfig[index] = `${varName}${" ".repeat(maxVarNameLength - varName.length + 1)}= ${val}${" ".repeat(maxValueLength - val.length + 1)}${comment ? `-- ${comment}` : ""}`;
    }
  }

  await writeTextFile(modConfigPath, newConfig.join("\n"));

  status.set({
    name: "Editing config",
    progress: -1,
  });
}

export function startGame () {
  openPath("steam://run/3317910");
}

export async function checkForUpdate (): Promise<{ newUpdateAvailable: boolean, latestUpdateVersion: string, currentVersion: string }> {
  const apiUrl = 'https://api.github.com/repos/Seblor/HoV-Companion/releases/latest';

  const response = await fetch(apiUrl);
  const data = await response.json();
  const latestVersion = data.tag_name;
  const currentVersion = await getVersion();
  if (latestVersion === currentVersion || latestVersion === `v${currentVersion}`) {
    return { newUpdateAvailable: false, latestUpdateVersion: latestVersion, currentVersion };
  }
  return { newUpdateAvailable: latestVersion !== undefined, latestUpdateVersion: latestVersion, currentVersion };
}


type ConfigVariable = {
  varName: string;
  value: string | number | boolean;
  comment: string | null;
};
