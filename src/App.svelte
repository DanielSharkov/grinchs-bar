<script lang="ts">
import Sounds from './Sounds.svelte';
import GameBoard from './GameBoard.svelte';
import PreparationMenu from './PreparationMenu.svelte';
import Revolver from './Revolver.svelte';
import GrinchsBar from './engine';
</script>

<svelte:body on:click|once={() => GrinchsBar.consentOfUserGiven()}/>

<Sounds />
{#if !$GrinchsBar.userConsentForSound}
	<div class="modal-container user-consent">
		<div class="modal">
			<h1>
				<span>Click</span>
				<span style="opacity: 0.5">anywhere</span>
				<span>to start</span>
				<span style="opacity: 0.5">the game</span>
			</h1>
		</div>
	</div>
{:else}
	<Revolver />
	<PreparationMenu />
	<GameBoard />
{/if}

<style>
.user-consent {
	background-color: #000;
}
.user-consent .modal {
	margin: auto;
	pointer-events: none;
}
.user-consent h1 {
	animation: ease-in-out 0.8s both alternate infinite blink;
}
@keyframes blink {
	to { opacity: 0.5 }
}
</style>
