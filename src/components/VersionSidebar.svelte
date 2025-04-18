<script>
import { checkForUpdate } from "$lib/client/queries";
import { openPath } from "@tauri-apps/plugin-opener";
</script>

<div class="flex flex-col justify-center items-center h-22 gap-2">
  {#await checkForUpdate() then versionInfo}
    <span>v{versionInfo.currentVersion}</span>
    {#if versionInfo.newUpdateAvailable}
      <button
        class="btn btn-primary btn-sm"
        onclick={() =>
          openPath("https://github.com/Seblor/HoV-Companion/releases/latest")}
        >New version available!
        <span class="icon-[tabler--external-link]"></span></button
      >
    {:else}
      Made with ❤️ by Seblor
    {/if}
  {/await}
</div>
