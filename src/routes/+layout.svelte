<script lang="ts">
	import "../app.css";
	import { afterNavigate } from "$app/navigation";
	import { HSOverlay, HSStaticMethods } from "flyonui/flyonui";
	import { page } from "$app/state";
	import { startGame } from "$lib/client/queries";
	import { onMount, tick } from "svelte";
	import { isGameRunning, modsList, status } from "$lib/client/stores";
	import Sidebar from "../components/Sidebar.svelte";
	import { debounce, throttle } from "lodash";
    import { get } from "svelte/store";

	afterNavigate(() => {
		// Runs after navigating between pages
		HSStaticMethods.autoInit();
	});
	let { children } = $props();

	let pageTitle = $derived(
		page.url.pathname
			.split("/")
			.at(-1)
			?.replace(/^\w/, (c) => c.toUpperCase()) || "Home",
	);

	let modal: HSOverlay | null = null;
	let isModalOpen = false;
	let nextModalOpenState = false;

	onMount(async () => {
		const element = document.querySelector("#loading-modal") as HTMLElement;
		if (element) {
			modal = new HSOverlay(element);
		}
		await tick();
		await new Promise((resolve) => setTimeout(resolve, 100));
		HSStaticMethods.autoInit();
	});

	status.subscribe((s) => {
		if (s.progress === -1) {
			modal?.close();
			isModalOpen = false;
		} else if (s.progress !== -1) {
			modal?.open();
			isModalOpen = true;
		}
	});

	modsList.subscribe(() => {
		if (get(status).progress === -1) {
			modal?.close();
			isModalOpen = false;
		} else {
			modal?.open();
			isModalOpen = true;
		}
	});
</script>

<!-- LOADING RADIAL PROGRESS MODAL -->
<div
	id="loading-modal"
	class="overlay modal overlay-open:opacity-100 overlay-open:duration-300 modal-middle hidden pointer-events-auto bg-black/50 outline-0"
	role="dialog"
	data-overlay-keyboard="false"
	tabindex="-1"
>
	<div class="modal-dialog overlay-open:opacity-100 overlay-open:duration-300">
		<div class="modal-content">
			<div class="modal-body flex flex-col items-center gap-2 overflow-hidden">
				<div
					class={`radial-progress transition-none after:transition-none ${$status.progress <= 0 ? "animate-spin" : ""}`}
					style={`--value:${Math.max(0, Math.round($status.progress * 100))};
       --size:8rem;
       --thickness: 0.5rem;`}
					role="progressbar"
					aria-label="60% Radial Progressbar"
				>
					<div
						class={`flex flex-col items-center p-4 ${$status.progress <= 0 ? "animate-reverse-spin" : ""}`}
					>
						<div class="mx-auto">
							{Math.max(0, Math.round($status.progress * 100))}%
						</div>
						<span class="text-secondary text-center text-xs max-h-16"
							>{$status.name}</span
						>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>

<div
	class="flex flex-col min-w-full bg-base-100 h-screen max-h-screen justify-stretch"
>
	<nav
		class="navbar bg-base-100 max-sm:rounded-box max-sm:shadow-sm sm:border-b border-base-content/25 sm:z-1 relative overflow-auto shrink-0"
	>
		<div class="flex items-center w-64">
			<!-- svelte-ignore a11y_invalid_attribute -->
			<a
				class="flex items-center link text-base-content link-neutral text-xl font-semibold no-underline"
				href="/"
			>
				<img src="/favicon.png" alt="Logo" class="h-12 w-12 me-2" />
				HoV Companion
			</a>
		</div>
		<div class="grow flex justify-center">
			<button
				class="btn btn-primary"
				disabled={$isGameRunning}
				onclick={startGame}>Fight!</button
			>
		</div>
	</nav>

	<div class="flex grow min-h-0">
		<Sidebar />

		<div class="flex flex-col pl-64 min-h-0 grow bg-base-200 overflow-auto">
			<div
				class="flex justify-center text-4xl bg-base-100/70 border-base-content/25 border-b p-3"
			>
				{pageTitle}
			</div>
			<!-- <div
				class="flex grow overflow-auto"
				style="height: calc(100% - var(--spacing) * 17)"
			> -->
			<div class="flex grow overflow-auto min-h-fit">
				{@render children()}
			</div>
		</div>
	</div>
</div>

<style>
</style>
