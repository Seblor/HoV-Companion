<script lang="ts">
import { getDownloadLink } from "$lib/client/queries";
import { invoke } from "@tauri-apps/api/core";

let name = $state("");
let greetMsg = $state("");

async function greet(event: Event) {
	event.preventDefault();
	// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
	greetMsg = await invoke("greet", { name });
}

let downloadLink = $state("");

getDownloadLink().then((link) => {
	downloadLink = link ?? "";
});
</script>

<main class="flex flex-col justify-center items-center size-full" style="flex-flow: wrap;">
  <h1 class="text-3xl m-2">
    Welcome to the <span class="italic text-amber-400 font-bold"
      >Heroes of Valor</span
    > Companion!
  </h1>
  <p class="helper-text">
    You can get started by going to the <kbd class="kbd"
      ><a href="/settings">Settings</a></kbd
    > section
  </p>
  <img src="/logo.png" alt="app logo" class="size-64" />
</main>
