<script lang="ts" context="module">
export function showPreparationMenu() {
	playMusic('intro')
	preparationMenuVisible.set(true);
}
export async function hidePreparationMenu() {
	preparationMenuVisible.set(false);
	await stopMusic('intro', 2000);
}
const preparationMenuVisible = writable(false);
</script>

<script lang="ts">
import GrinchsBar from './engine';
import StartScreenCardsBackground from './StartScreenCardsBackground.svelte';
import type { TransitionConfig } from 'svelte/transition';
import { cubicInOut, cubicOut } from 'svelte/easing';
import { playMusic, stopMusic } from './Sounds.svelte';
import { writable } from 'svelte/store';
import { flip } from 'svelte/animate';

// function playerPreparationInAnim(_: Element): TransitionConfig {
// 	return {
// 		delay: 500,
// 		duration: 1500,
// 		easing: cubicInOut,
// 		css: (t) => `opacity: ${t}; transform: translateY(${6-6*t}rem) scale(${0.85 + (0.15 * t)});`,
// 	}
// }

function playerPreparationInAnim(_: Element): TransitionConfig {
	return {
		delay: 500,
		duration: 2000,
		easing: cubicOut,
		css: (t) => `opacity: ${t}; transform: scale(${2 - (1 * t)}); filter: blur(${10 - (10 * t)}px);`,
	}
}

function playerPreparationOutAnim(_: Element): TransitionConfig {
	return {
		duration: 1500,
		easing: cubicInOut,
		css: (t) => `opacity: ${t}; transform: scale(${0.85 + (0.15 * t)});`,
	}
}

function playerOverviewEntryAnim(node: Element): TransitionConfig {
	const actualHeight = node.clientHeight;
	return {
		duration: 200,
		easing: cubicInOut,
		css: (t) => `opacity: ${t}; overflow: hidden; height: ${actualHeight * t}px; margin-top: ${1 * t}rem;`,
	}
}

function gameLogoInAnim(_: Element): TransitionConfig {
	return {
		duration: 1500,
		easing: cubicInOut,
		css: (t) => `opacity: ${t}; transform: translateY(-${8-8*t}rem) scale(${2 - (1 * t)});`,
	}
}

$:gameNotStartable = $GrinchsBar.players.length < 2 || $GrinchsBar.players.some((p) => !p.name);
</script>

{#if $preparationMenuVisible}
	<StartScreenCardsBackground />

	<div class="modal-container">
		<div class="players-overview" in:playerPreparationInAnim|global out:playerPreparationOutAnim>
			<div class="header" in:gameLogoInAnim|global>
				<div id="GameLogo">
					<h1>Grinch's Bar</h1>
					<img src="banner.png" alt="banner">
				</div>
			</div>

			<div class="players-list">
				{#each $GrinchsBar.players as player, playerIndex (player.name)}
					<div class="entry" animate:flip={{ easing: cubicInOut }} transition:playerOverviewEntryAnim>
						<input
							type="text"
							value={player.name}
							on:change={(event) => GrinchsBar.updatePlayerName(playerIndex, event.currentTarget.value)}
						/>
						<button class="remove-player button-3d red small no-underline" on:click={() => GrinchsBar.removePlayer(playerIndex)}>❌</button>
					</div>
				{/each}
				<div class="add-player entry">
					<button class=" button-3d" on:click={() => GrinchsBar.addPlayer()}>
						+ Add Player
					</button>
				</div>
			</div>

			<div class="actions">
				<button class="start-game button-3d solid-green" disabled={gameNotStartable} on:click={() => GrinchsBar.startGame()}>
					Start Game
				</button>
			</div>
		</div>
	</div>
{/if}

<style>
#GameLogo {
	z-index: 1;
	position: relative;
	display: flex;
	justify-content: center;
	justify-items: center;
	pointer-events: none;
	transform-style: preserve-3d;
	animation: logoFloating 4s infinite alternate ease-in-out;
}
@keyframes logoFloating {
	0% { transform: rotate3d(0, 0, 0, 0deg) scale(1) }
	50% { transform: rotate3d(35, 5, 5, 10deg) scale(1.02) }
	100% { transform: rotate3d(0, 0, 0, 0deg) scale(0.98) }
	100% { transform: rotate3d(30, 1, 5, -10deg) scale(1.02) }
	100% { transform: rotate3d(0, 0, 0, 0deg) scale(0.98) }
}
#GameLogo > img {
	z-index: -1;
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	object-fit: contain;
	object-position: center;
	filter: drop-shadow(0 1px 1px #604c3d) drop-shadow(0 0 2px #281503) drop-shadow(0 4px 16px #361e08);
}
#GameLogo > h1 {
	margin: 3rem 5rem;
	font-size: 2.5rem;
	color: #fff7db;
	text-shadow: 0 0 1px #402011, 0 1px 1px #b27e66, 0 1px 2px #311208, 0 3px 8px #642b18
}

.players-overview {
	position: relative;
	display: grid;
	margin: auto;
	margin-top: 10vh;
	justify-content: center;
	grid-template-columns: 1fr;
	gap: 2rem;
	padding: 2rem;
	padding-top: 7rem;
	border-radius: 2rem;
	width: 500px;
	box-shadow:
		0 0 4px #fccc94,
		0 0 3px #363318 inset,
		0 0px 6px rgba(0,0,0, 0.4),
		0 0 4px #9b934e inset,
		0 2px 5px #000,
		0 2px 5px #000,
		0 4px 16px #000;
	background-image: url('/public/paperboard_background.jpg');
	background-repeat: repeat-y;
	background-size: 100% auto;
	background-position: 0 0;
	background-color: #7a7656;
	image-rendering: pixelated;
}

.players-overview > .header {
	position: absolute;
	top: -4rem;
	left: 0;
	width: 100%;
	place-items: center;
	perspective: 800px;
}

/*
.players-overview > .header > h2 {
	width: 100%;
	text-align: center;
	margin: 0;
	font-size: 40px;
	text-shadow: 0 1px 1px #edac81, 0 1px 2px #371d0b, 0 4px 10px #753911;
}
*/

.players-overview .players-list {
	display: grid;
}

.players-overview .players-list .entry {
	display: flex;
	align-items: center;
	gap: 1rem;
	margin-top: 1rem;
}

.players-overview .players-list .entry:first-child {
	margin-top: 0;
}

.players-overview .players-list input {
	flex: 1 1 auto;
	width: 100%;
	padding: 0.25rem 0.5rem;
	border-radius: 0.25rem;
	background-color: #3b260031;
	border: none;
	text-shadow: 0 1px 2px #271407;
	font-size: 1.5rem;
	line-height: 1;
	box-shadow:
		0 0 1px #2b2113,
		0 0 2px #85733f,
		0 2px 8px #514522 inset,
		0 0 6px #b9974d inset,
		0 1px 2px #8b8345 inset;
}

.players-overview .players-list .add-player {
	justify-content: center;
}
.players-overview .players-list .add-player button {
	padding: 0.75rem 2rem;
	--shadow: 0 1px 2px #948c5e, 0 2px 10px #9f9b74;
}

.players-overview > .actions {
	display: flex;
	place-content: center;
}

.players-overview > .actions > button.start-game {
	font-size: 24px;
	text-transform: uppercase;
	letter-spacing: 0.1rem;
}
</style>
