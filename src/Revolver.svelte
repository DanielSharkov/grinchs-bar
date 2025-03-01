<script lang="ts" context="module">
import {get as get$} from 'svelte/store';

function easeInOutCirc(x: number): number {
	return x < 0.5
		? (1 - Math.sqrt(1 - Math.pow(2 * x, 2))) / 2
		: (Math.sqrt(1 - Math.pow(-2 * x + 2, 2)) + 1) / 2;
}

export async function shootRevolver(type: 'liar' | 'devil', shots: Array<[boolean, Function]>, instantShot?: boolean) {
	if (get$(revolverActionVisible) || shots.length < 1) {
		return;
	}

	revolverActionVisible.set(true);

	void playSound(type === 'liar' ? 'liar' : 'gong');
	if (type === 'liar') {
		liarHandVisible.set(true);
		await waitSeconds(3);
	} else {
		playSound('cardSpinWhoosh');
		devilCardVisible.set(true);
		await waitSeconds(4);
		devilCardVisible.set(false);
		await waitSeconds(1);
	}

	revolverChamberVisible.set(true);
	// await, make it more exciting
	await playSound('revolverSpin');
	if (instantShot === true) {
		await waitSeconds(2.4);
	} else {
		await waitSeconds(5);
	}

	const shotsWithPreparedSound = shots.map<[boolean, Function, Function]>(([isLoaded, updatePlayerStatus]) => {
		const audioEl = new Audio(soundURL[isLoaded ? 'gunShot' : 'revolverClear'])
		SoundAudioContext.createMediaElementSource(audioEl).connect(SoundAudioContext.destination);
		return [
			isLoaded,
			updatePlayerStatus,
			() => audioEl.play().then(() => audioEl.remove()),
		];
	});
	for (const [isLoaded, updatePlayerStatus, playShotSound] of shotsWithPreparedSound) {
		updatePlayerStatus();
		if (isLoaded) {
			flashScreenToggle.set(true);
			flashScreenToggle.set(false);
		}
		playShotSound();
		await waitSeconds(0.5);
	}
	revolverChamberVisible.set(false);
	revolverActionVisible.set(false);
}

function flashScreen(node: HTMLElement) {
	node.style.visibility = 'hidden';
	flashScreenToggle.subscribe((doFlash)=> {
		if (doFlash) {
			node.style.visibility = 'unset';
			setTimeout(()=> {node.style.visibility = 'hidden'}, 50);
		}
	});
}

const flashScreenToggle = writable(false);
const revolverActionVisible = writable(false);
const liarHandVisible = writable(false);
const devilCardVisible = writable(false);
const revolverChamberVisible = writable(false);
</script>

<script lang="ts">
import { fade, type TransitionConfig } from 'svelte/transition';
import { playSound, SoundAudioContext, soundURL } from './Sounds.svelte';
import { waitSeconds } from './utils/misc';
import { zoomAnim } from './utils/animations';
import { writable } from 'svelte/store';
import { cubicInOut } from 'svelte/easing';

function liarHandZoomAnim(_: Element): TransitionConfig {
	return {
		duration: 400,
		easing: easeInOutCirc,
		css: (t) => `opacity: ${t}; transform: scale(${t});`,
	}
}

function devilCardZoomAnim(_: Element): TransitionConfig {
	return {
		duration: 2000,
		css: (t) => {
			const easedT = easeInOutCirc(t);
			return `opacity: ${t}; transform: translateY(${20 - 20 * easedT}rem) scale(${easedT});`
		},
	}
}
</script>

{#if $revolverActionVisible}
	<div id="RevolverActions"
	in:fade|global={{ duration: 500 }}
	out:fade|global={{ easing: cubicInOut, duration: 200 }}>
		{#if $liarHandVisible}
			<div id="LiarHand" class="action-container">
				<div class="liar-hand-wrapper"
				in:liarHandZoomAnim|global
				out:fade|global={{ duration: 500 }}
				on:introend={() => setTimeout(() => liarHandVisible.set(false), 1500)}>
					<img src="/liar_hand.png" alt="Liar!" />
				</div>
			</div>
		{/if}
		{#if $devilCardVisible}
			<div id="DevilCardTriggered" class="action-container">
				<div class="devil-card-wrapper"
				in:devilCardZoomAnim|global
				out:fade|global={{ easing: cubicInOut, duration: 500 }}>
					<div class="playing-card">
						<div class="front" style="background-image: url('playing_card/Devil.png')"></div>
						<div class="back" style="background-image: url('playing_card/back.png')"></div>
					</div>
				</div>
			</div>
		{/if}
		{#if $revolverChamberVisible}
			<div id="RevolverChamber" class="action-container">
				<div class="img-wrapper" in:zoomAnim|global={{ duration: 500 }}>
					<img src="/revolver_chamber.png" alt="banner"/>
				</div>
				<div class="flash" use:flashScreen></div>
			</div>
		{/if}
	</div>
{/if}

<style>
#RevolverActions {
	position: fixed;
	top: 0;
	left: 0;
	height: 100%;
	width: 100%;
	display: flex;
	z-index: 99;
	background-color: rgba(0,0,0, 0.6);
}
.action-container {
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	display: flex;
}

#LiarHand, #DevilCardTriggered {
	position: fixed;
	top: 0;
	left: 0;
	height: 100%;
	width: 100%;
	display: flex;
	place-content: center;
	place-items: center;
	z-index: 99;
}
#LiarHand .liar-hand-wrapper img {
	height: max(40vw, 40vh);
	width: max(40vw, 40vh);
}

#DevilCardTriggered .devil-card-wrapper .playing-card {
	width: min(30vw, 30vh);
	perspective: 600px;
	border-radius: 0.9rem;
}
#DevilCardTriggered .devil-card-wrapper .playing-card .front,
#DevilCardTriggered .devil-card-wrapper .playing-card .back {
	box-shadow: 0 0 8px #000, 0 0 32px #000, 0 0 5px #9b934e inset;
	animation-duration: 3s;
	animation-timing-function: cubic-bezier(0.3, 0, 0, 1);
	animation-fill-mode: forwards;
}
#DevilCardTriggered .devil-card-wrapper .playing-card .front {
	animation-name: flipCardFront;
}
#DevilCardTriggered .devil-card-wrapper .playing-card .back {
	animation-name: flipCardBack;
}
@keyframes flipCardBack {
	from { transform: rotateY(180deg) }
	to { transform: rotateY(1980deg) }
}
@keyframes flipCardFront {
	from { transform: rotateY(0deg) }
	to { transform: rotateY(1800deg) }
}

#RevolverChamber .img-wrapper {
	margin: auto;
	margin-bottom: 10%;
}
#RevolverChamber img {
	width: 30vh;
	height: 30vh;
	filter: drop-shadow(0 0 1px #fff) drop-shadow(0 0 8px #000) drop-shadow(0 0 32px #000);
	animation: revolverSpin 2.5s cubic-bezier(0.11, 0.76, 0.35, 1);
}
@keyframes revolverSpin {
	to { transform: rotate(720deg) }
}
#RevolverChamber .flash {
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	background-color: #fff6c4;
	visibility: hidden;
}
</style>
