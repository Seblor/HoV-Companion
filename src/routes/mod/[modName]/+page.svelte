<script lang="ts">
  import { page } from "$app/state";
  import { editConfigVariable, getModConfig } from "$lib/client/queries";
  import { modsDir, modsList } from "$lib/client/stores";
  import { debounce } from "lodash";

  const modName = page.params.modName;
  let config: Awaited<ReturnType<typeof getModConfig>> = $state({});

  modsList.subscribe(() => {
    if ($modsDir) {
      getModConfig($modsDir, modName).then((configData) => {
        config = configData;
      });
    }
  });
</script>

<div class="flex justify-center grow min-h-full">
  {#if $modsDir && config && Object.keys(config).length > 0}
    <div class="flex justify-center flex-wrap h-fit gap-6 py-8 px-2">
      {#each Object.values(config) as param}
        <fieldset
          class="flex flex-col fieldset w-xs bg-base-100/50 border border-primary p-4 rounded-box gap-2 truncate"
        >
          <legend class="fieldset-legend text-2xl"
            >{param.varName
              .replaceAll("_", " ")
              .replace(/^./, (match) => match.toUpperCase())}</legend
          >
          {#if typeof param.value === "boolean"}
            <div class="flex justify-center items-center gap-1">
              <span
                class="label-text text-xl {param.value
                  ? 'text-white'
                  : 'text-primary'} transition-all duration-300"
              >
                OFF
              </span>
              <input
                type="checkbox"
                class="switch switch-xl switch-outline"
                checked={param.value}
                onchange={(event) => {
                  const newValue = (event.target as HTMLInputElement).checked;
                  editConfigVariable({
                    modsPath: $modsDir,
                    modName: modName,
                    variableName: param.varName,
                    newValue,
                  });
                }}
              />
              <span
                class="label-text text-xl {param.value
                  ? 'text-primary'
                  : 'text-white'} transition-all duration-300"
              >
                ON
              </span>
            </div>
          {:else if typeof param.value === "number"}
            <input
              type="number"
              class="input"
              value={param.value}
              oninput={debounce((event) => {
                const newValue = (event.target as HTMLInputElement).value;
                editConfigVariable({
                  modsPath: $modsDir,
                  modName: modName,
                  variableName: param.varName,
                  newValue: Number(newValue),
                });
              }, 1e3)}
            />
          {:else if typeof param.value === "string"}
            <input
              type="text"
              class="input"
              value={param.value}
              oninput={debounce((event) => {
                const newValue = (event.target as HTMLInputElement).value;
                editConfigVariable({
                  modsPath: $modsDir,
                  modName: modName,
                  variableName: param.varName,
                  newValue,
                });
              }, 1e3)}
            />
          {/if}
          {#if param.comment?.trim()}
            <span class="helper-text">{param.comment}</span>
          {/if}
        </fieldset>
      {/each}
    </div>
  {:else}
    <div class="flex grow justify-between items-center">
      <div class="flex flex-col grow items-center gap-8">
        <p class="text-3xl">This mod does not seem to be configurable</p>
        {#if config}
          <p class="helper-text">
            There is a configuration file, but it is empty or invalid.
          </p>
        {:else}
          <p class="helper-text">
            There is no <kbd class="kbd">options.txt</kbd> file in the mod's folder.
          </p>
        {/if}
      </div>
    </div>
  {/if}
</div>
