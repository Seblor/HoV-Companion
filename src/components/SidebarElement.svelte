<script lang="ts">
import { page } from "$app/state";
import { setModEnabled } from "$lib/client/queries";
import { modsDir, modsList } from "$lib/client/stores";
import { MODS_ICONS } from "$lib/consts";

let props: {
	modName: string;
	isEnabled: boolean;
} = $props<{
	modName: string;
	isEnabled: boolean;
}>();

let stateChanging = $state(false);

modsList.subscribe(() => {
	stateChanging = false;
});

let pageTitle = $derived(
	page.url.pathname
		.split("/")
		.at(-1)
		?.replace(/^\w/, (c) => c.toUpperCase()) || "Home",
);

let isManaged = $derived(MODS_ICONS[props.modName] !== undefined);
</script>

<li class="w-full tooltip [--placement:right]">
  <!-- svelte-ignore a11y_invalid_attribute -->
  <a
    href="/mod/{props.modName}"
    class="flex rounded-2xl!
    {pageTitle === props.modName ? 'bg-white/10' : ''}
    {isManaged ? 'text-white' : 'text-white/50'} w-full tooltip-toggle truncate"
  >
    <input
      type="checkbox"
      class="switch switch-xs switch-primary switch-outline"
      checked={props.isEnabled}
      disabled={stateChanging}
      onclick={(event) => {
        if ($modsDir) {
          stateChanging = true;
          setModEnabled(
            $modsDir,
            props.modName,
            (event.target as HTMLInputElement)!.checked,
          );
        }
      }}
    />
    <span
      class="icon-[tabler--{MODS_ICONS[props.modName] ??
        'question-mark'}] size-6 min-w-6"
    ></span>
    <span class="left-10" aria-label="Tooltip">{props.modName}</span>
  </a>
  <span
    class="tooltip-content tooltip-shown:opacity-100 tooltip-shown:visible"
    role="tooltip"
  >
    <span class="tooltip-body bg-base-100 text-white">{props.modName}</span>
  </span>
</li>
