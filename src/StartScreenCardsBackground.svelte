<script lang="ts">
import { fade, type TransitionConfig } from 'svelte/transition';
import { CardType } from './types';
import { randNum } from './utils/misc';
import { cubicInOut, cubicOut } from 'svelte/easing';

// function generateStartScreenBackgroundCard(): [string, [number, number], number] {
// 	const cardTypeKeys = Object.keys(CardType);
// 	const imgIndex = Math.floor(Math.random() * cardTypeKeys.length + 1)
// 	return [
// 		cardTypeKeys[imgIndex] ?? 'back',
// 		[Math.floor(Math.random() * 100), Math.floor(Math.random() * 100)],
// 		Math.random() * 359,
// 	]
// }

// const startScreenBackgroundCards: Array<ReturnType<typeof generateStartScreenBackgroundCard>> = (
// 	Array.from({
// 		length: Math.max(Math.floor(Math.random() * 100), 20),
// 	}, generateStartScreenBackgroundCard)
// );


const cards: Array<{
	card: CardType | null;
	x: number;
	y: number;
	rotate: number;
}> = Array.from({length: 40}, (_, index) => {
	let card: CardType | null = null;
	if (Math.random() > 0.2) {
		const randomCardTypeIndex = randNum(Object.keys(CardType).length)
		card = Object.values(CardType)[randomCardTypeIndex];
	}
	// const x = Math.random() * (90 - 5) + 5;
	// const y = Math.random() * (80 - 3) + 3;
	const x = Math.random() * (98 - 2) + 2;
	const y = Math.random() * (98 - 2) + 2;
	const xCenterDistance = Math.abs(x - (window.innerWidth / 2));
	const yBottomDistance = y - window.innerHeight;
	const rotate = randNum(90);
	return {card, x, y, rotate}
});
// [
// 	{card: CardType.King,  x: 0, y: 0},
// 	{card: CardType.Queen, x: 0, y: 0},
// 	{card: CardType.Queen, x: 0, y: 0},
// 	{card: CardType.Jack,  x: 0, y: 0},
// 	{card: null,           x: 0, y: 0},
// 	{card: CardType.Joker, x: 0, y: 0},
// 	{card: CardType.Devil, x: 0, y: 0},
// 	{card: CardType.Joker, x: 0, y: 0},
// 	{card: CardType.King,  x: 0, y: 0},
// 	{card: CardType.Queen, x: 0, y: 0},
// 	{card: CardType.Jack,  x: 0, y: 0},
// 	{card: CardType.King,  x: 0, y: 0},
// 	{card: CardType.Queen, x: 0, y: 0},
// 	{card: CardType.Jack,  x: 0, y: 0},
// 	{card: null,           x: 0, y: 0},
// 	{card: null,           x: 0, y: 0},
// 	{card: CardType.King,  x: 0, y: 0},
// 	{card: CardType.Devil, x: 0, y: 0},
// 	{card: CardType.Jack,  x: 0, y: 0},
// 	{card: CardType.Queen, x: 0, y: 0},
// ];

function cardInAnim(_: Element, { rotate, cardIndex }: { rotate: number; cardIndex: number }): TransitionConfig {
	const randSize = randNum(4, 2);
	const blurAmount = randSize * 3;
	return {
		easing: cubicOut,
		delay: 15 * cardIndex,
		duration: 400 + randSize * randNum(200),
		css: (t) => (
			`transform: rotate(${rotate * t}deg) scale(${randSize - ((randSize - 1) * t)});` +
			`filter: blur(${blurAmount - (blurAmount * t)}px);` +
			`opacity: ${t};`
		),
	}
}
</script>

<div class="start-screen-background"
out:fade|global={{ easing: cubicInOut, duration: 1000 }}>
	{#each cards as {card, x: posX, y: posY, rotate}, cardIndex}
		<div class="playing-card"
		style:left="{posX}%"
		style:top="{posY}%"
		style:transform="rotate({rotate}deg)"
		in:cardInAnim|global={{rotate, cardIndex}}>
			<div class="front" style:background-image="url('/playing_card/{card || 'back'}.png')"></div>
		</div>
	{/each}
</div>

<style>
.start-screen-background {
	z-index: -1;
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	display: block;
	contain: content;
}
.start-screen-background .playing-card {
	position: absolute;
	display: inline-block;
	height: 6rem;
	width: 4.3rem;
	border-radius: 0.25rem;
	/* box-shadow: 0 0 1px #000, 0 1px 2px #000, 0 2px 5px #000, 0 0 1px #514c23 inset; */
	image-rendering: crisp-edges;
	background-color: #000;
}
.start-screen-background .playing-card .front {
	opacity: 0.4;
	box-shadow: 0 0 1px #000, 0 1px 2px #000, 0 2px 5px #000, 0 0 1px #514c23 inset;
}
/* .start-screen-background .playing-card span {
	display: block;
	font-size: 8px;
	white-space: nowrap;
	width: 4.2rem;
	overflow: hidden;
}
.start-screen-background .playing-card:nth-child(1) {} */
</style>
