<script lang="ts">
  import {
    downloadUE4SS,
    getGamePath,
    checkIsGamePathValid,
    status,
    checkIsUE4SSInstalled,
  } from "$lib/client/queries";
  import { open } from "@tauri-apps/plugin-dialog";

  let gamePath = $state("");
  let isPathValid = $state(false);
  let isUE4SSInstalled = $state(false);

  if (localStorage.getItem("gamePath")) {
    gamePath = localStorage.getItem("gamePath") ?? "";
  } else {
    getGamePath().then(async (path) => {
      gamePath = path ?? "";
      isPathValid = await checkIsGamePathValid(path ?? "");
    });
  }

  $effect(() => {
    console.log("Game path changed", gamePath);
    checkIsGamePathValid(gamePath).then((correct) => {
      isPathValid = correct;
      if (correct) {
        localStorage.setItem("gamePath", gamePath);
      }
    });
    checkIsUE4SSInstalled(gamePath).then((installed) => {
      isUE4SSInstalled = installed;
    });
  });

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

<div class="flex flex-col grow justify-between m-2 gap-8">
  <div class="w-full flex items-center gap-4">
    <div class="grow">
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
          class="btn btn-square btn-primary btn-soft shrink"
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
  <div class="flex flex-col grow items-center gap-2">
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
