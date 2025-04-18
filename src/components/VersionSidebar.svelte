<script>
import { checkForUpdate } from "$lib/client/queries";
</script>

<div class="flex rounded-2xl! justify-center h-12">
  {#await checkForUpdate() then versionInfo}
    <button>v{versionInfo.currentVersion}</button>
  {/await}
</div>
