<script lang="ts">
import {
	downloadUE4SS,
	getGamePath,
	checkIsGamePathValid,
	checkIsUE4SSInstalled,
	installCompanionMods,
} from "$lib/client/queries";
import { gameDir, modsDir, modsList } from "$lib/client/stores";
import { open } from "@tauri-apps/plugin-dialog";

let gamePath = $state("");
let isPathValid = $state(false);
let isUE4SSInstalled = $state(false);

if ($gameDir) {
	gamePath = $gameDir ?? "";
} else {
	updateModloaderInstallState();
}

modsList.subscribe(() => {
	checkIsUE4SSInstalled(gamePath).then((installed) => {
		isUE4SSInstalled = installed;
	});
});

$effect(() => {
	checkIsGamePathValid(gamePath).then((correct) => {
		isPathValid = correct;
		if (correct) {
			gameDir.set(gamePath);
		}
	});
	updateModloaderInstallState();
});

async function updateModloaderInstallState() {
	isUE4SSInstalled = await checkIsUE4SSInstalled(gamePath);
}

async function selectGameDir() {
	const dir = await open({
		multiple: false,
		directory: true,
	});

	if (dir) {
		gamePath = dir;
	}
}
</script>

<div class="flex flex-col grow justify-between mx-2">
  <div class="w-full flex items-center gap-4">
    <div class="grow m-8">
      <label class="label-text" for="game-path">Game install path</label>
      <div class="flex gap-2">
        <input
          type="text"
          placeholder="<Steam Library>/steamapps/common/Heroes of Valor Playtest"
          class={`input grow ${isPathValid ? "" : "is-invalid"}`}
          disabled
          id="game-path"
          bind:value={gamePath}
        />
        <button
          class="btn btn-square btn-soft shrink"
          onclick={selectGameDir}
          aria-label="Select Game Directory"
        >
          <span class="size-8 icon-[tabler--folder-open]"></span>
        </button>
      </div>
      <span class="helper-text">
        {isPathValid
          ? "Game path is correct"
          : "Game path is incorrect, please select the correct directory"}
      </span>
    </div>
  </div>
  <div class="divider"></div>
  <div class="flex flex-col grow items-center gap-2 m-8">
    <button
      class="btn"
      disabled={!isPathValid || isUE4SSInstalled}
      onclick={() => downloadUE4SS(gamePath)}>Install Mod Loader</button
    >
    {#if isUE4SSInstalled}
      <span class="helper-text">
        <span class="icon-[tabler--check] text-success"></span>
        The mod loader is already installed
      </span>
    {/if}
  </div>
</div>
