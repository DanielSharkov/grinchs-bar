<script lang="ts" context="module">
const cardsState = writable<Array<[boolean, boolean]>>([]);

export async function presentPlayingCardsInGame() {
	cardsState.set(Object.keys(GrinchsBar.$().cardsInGame).map(() => [true, false]));
	showPlayingCardsInGame.set(true);
	await waitSeconds(1);
	playSound('whoosh');
	await waitSeconds(2);
	playSound('cardsFlip');
	const cardTypesAmount = get$(cardsState).length;
	for (let cardIndex = 0; cardIndex < cardTypesAmount; cardIndex++) {
		cardsState.update(($) => {
			$[cardIndex][0] = false;
			return $;
		});
		await waitSeconds(0.1);
	}
	await waitSeconds(1);
	for (let cardIndex = 0; cardIndex < cardTypesAmount; cardIndex++) {
		cardsState.update(($) => {
			$[cardIndex][1] = true;
			return $;
		});
		await waitSeconds(0.1);
	}
	await new Promise<void>((resolve)=> {
		playersAreReadyPromiseResolver.set(()=> resolve())
	});
	playersAreReadyPromiseResolver.set(null);
	playSound('deepWhoosh');
	showPlayingCardsInGame.set(false);
	await waitSeconds(0.1);
}

const showPlayingCardsInGame = writable(false);
const playersAreReadyPromiseResolver = writable<null | Function>(null);
</script>

<script lang="ts">
import GrinchsBar from './engine';
import { waitSeconds } from './utils/misc';
import { fade, type TransitionConfig } from 'svelte/transition';
import { easeInBack, easeOutBack, zoomAnim } from './utils/animations';
import { writable, get as get$ } from 'svelte/store';
import { cubicInOut, quintInOut, quintOut } from 'svelte/easing';
import { playSound } from './Sounds.svelte';

function cardInAnim(node: HTMLElement): TransitionConfig {
	const parentContainer = (node.offsetParent as HTMLElement);
	const cardCenterPosX = (parentContainer.offsetWidth / 2) - (node.offsetWidth / 2);
	const cardSlotEl = node.parentElement!;
	cardSlotEl.style.width = node.offsetWidth + 'px';
	cardSlotEl.style.height = node.offsetHeight + 'px';

	const totalDuration = 2500;
	const delay = 1000;
	const actualDuration = totalDuration - delay;
	const delayPeriod = delay / totalDuration;
	return {
		duration: totalDuration,
		css: (absoluteTime) => {
			if (absoluteTime < delayPeriod) {
				return `position: absolute; left: ${cardCenterPosX}px;`;
			}
			const t = quintInOut(((totalDuration * absoluteTime) - delay) / actualDuration);
			return (
				`position: absolute;` +
				`left: ${cardCenterPosX + ((node.offsetLeft - cardCenterPosX) * t)}px;`
			);
		},
	}
}

function cardOutAnim(_: Element, {cardIndex}: {cardIndex: number}): TransitionConfig {
	return {
		easing: easeInBack,
		delay: 30 * cardIndex,
		duration: 500,
		css: (t) => `opacity: ${t}; transform: scale(${0.75 + 0.25 * t})`,
	}
}

function cardsFirstInZoomAnim(_: Element): TransitionConfig {
	return {
		duration: 2000,
		easing: quintOut,
		css: (t) => `transform: scale(${1.5 - 0.5 * t});`,
	}
}

$:cardsCount = Object.keys($GrinchsBar.cardsInGame).length;

function playersAreReady() {
	if ($playersAreReadyPromiseResolver !== null) {
		$playersAreReadyPromiseResolver();
	}
}
</script>

{#if $showPlayingCardsInGame}
	<div id="PlayingCardsInGame"
	in:fade={{ duration: 1000 }}
	out:fade={{ easing: cubicInOut, delay: 550, duration: 200 }}>
		<div class="cards-container" in:cardsFirstInZoomAnim|global>
			{#each Object.entries($GrinchsBar.cardsInGame) as [cardType, cardCount], cardIndex}
				<div class="card-slot">
					<div class="playing-card"
					in:cardInAnim|global
					out:cardOutAnim|global={{cardIndex}}
					class:flipped={$cardsState[cardIndex][0]}
					style:z-index={cardsCount - cardIndex}>
						<div class="front" style="background-image: url('/playing_card/{cardType}.png')"></div>
						<div class="back" style="background-image: url('/playing_card/back.png')"></div>
						{#if $cardsState[cardIndex][1]}
							<span class="playing-card-count" in:zoomAnim|global={{ duration: 1000, easing: easeOutBack }}>
								{ cardCount }
							</span>
						{/if}
					</div>
				</div>
			{/each}
		</div>
		<button class="players-ready button-3d"
		on:click={playersAreReady}
		in:zoomAnim={{ delay: 6000, duration: 1000 }}
		out:zoomAnim={{ duration: 500 }}>
			Continue
		</button>
	</div>
{/if}

<style>
#PlayingCardsInGame {
	z-index: 99;
	position: absolute;
	top: 0;
	left: 0;
	height: 100%;
	width: 100%;
	background-color: rgba(0,0,0, 0.15);
	display: flex;
	place-content: center;
	place-items: center;
}
.cards-container {
	position: relative;
	display: flex;
	flex-flow: row nowrap;
	gap: 2rem;
	z-index: 1;
}

.playing-card {
	display: flex;
	justify-content: center;
	perspective: 800px;
	width: 11vw;
	border-radius: 0.6rem;
}
.playing-card:not(.flipped) {
	animation: cardFlippingScale 0.6s cubic-bezier(0.66, 0.32, 0, 1);
}
@keyframes cardFlippingScale {
	0% { transform: scale(1) }
	50% { transform: scale(1.15) }
	100% { transform: scale(1) }
}
.playing-card .back, .playing-card .front {
	transition-timing-function: cubic-bezier(0.8, 0.5, 0, 1);
	transition-duration: 0.5s;
}

.players-ready {
	position: absolute;
	bottom: 10vh;
}
</style>
