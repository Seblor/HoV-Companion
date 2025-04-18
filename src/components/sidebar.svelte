<script lang="ts">
import { page } from "$app/state";
import { modsList } from "$lib/client/stores";
import { MODS_ICONS } from "$lib/consts";
import { HSStaticMethods } from "flyonui/flyonui";
import { onMount } from "svelte";
import SidebarElement from "./SidebarElement.svelte";

onMount(() => {
	HSStaticMethods.autoInit();
});

let managedMods = $derived(
	Object.entries($modsList).filter(([modName]) => MODS_ICONS[modName]), // Filter out unmanaged mods
);

let unmanagedMods = $derived(
	Object.entries($modsList).filter(([modName]) => !MODS_ICONS[modName]), // Filter out managed mods
);

let pageTitle = $derived(
	page.url.pathname
		.split("/")
		.at(-1)
		?.replace(/^\w/, (c) => c.toUpperCase()) || "Home",
);
</script>

<!-- Force leading dynamic icons to avoid tree shaking excluding those -->
<div class="hidden">
  <span class="icon-[tabler--question-mark]"></span>
  {#each Object.values(MODS_ICONS) as modIcon}
    <span class="icon-[tabler--file-pencil]"></span>
  {/each}
</div>

<aside
  class="drawer drawer-start hidden w-64 sm:absolute sm:z-0 border-base-content/25 border-r sm:flex sm:translate-x-0 pt-22"
  tabindex="-1"
>
  <!-- TODO : add `overflow-visible!` when the spec evolves (https://stackoverflow.com/questions/10903084/overflow-x-visible-doesnt-work-with-overflow-y-auto-any-workaround) -->
  <div class="drawer-body">
    <ul class="menu space-y-0.5 p-0">
      <div class="divider text-base-content/50">HoV Companion</div>
      <li class="w-full">
        <a
          href="/settings"
          class=" px-4 rounded-2xl {pageTitle === 'Settings'
            ? 'bg-white/10'
            : ''}"
        >
          <span class="icon-[tabler--settings] size-6"></span>
          Settings
        </a>
      </li>
      {#if managedMods.length}
        <div class="divider text-base-content/50">Managed Mods</div>
        {#each managedMods as [mod, isEnabled]}
          <SidebarElement {isEnabled} modName={mod} />
        {/each}
      {/if}
      {#if unmanagedMods.length}
        <div class="divider text-base-content/50">Unmanaged Mods</div>
        {#each unmanagedMods as [mod, isEnabled]}
          <SidebarElement {isEnabled} modName={mod} />
        {/each}
      {/if}
    </ul>
  </div>
</aside>
