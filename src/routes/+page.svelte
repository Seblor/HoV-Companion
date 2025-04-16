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
    console.log(link);
    downloadLink = link ?? "";
  });
</script>

<main class="container">
  <h1 class="text-3xl m-2">Welcome to Tauri + Svelte</h1>

  <form class="row" onsubmit={greet}>
    <input id="greet-input" placeholder="Enter a name..." bind:value={name} />
    <button type="submit" class="btn">Greet</button>
  </form>
  <p>{greetMsg}</p>
  <p>{downloadLink}</p>
</main>

<style>
.container {
  margin: 0;
  padding-top: 10vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  text-align: center;
}

</style>
