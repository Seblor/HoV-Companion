<script>
  import { openPath } from "@tauri-apps/plugin-opener";
  import { localDataDir } from "@tauri-apps/api/path";
  import { path } from "@tauri-apps/api";
</script>

<div class="flex justify-center">
  <button
    class="btn"
    onclick={async () => {
      openPath(
        await path.normalize(
          `${await localDataDir()}/HeroesOfValor/Saved/Logs`,
        ),
      );
    }}
    >Open logs directory <span class="icon-[tabler--external-link]"
    ></span></button
  >
</div>
