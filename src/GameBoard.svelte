<script lang="ts" context="module">
import { CardType } from './types';

const gameBoardVisible = writable(false);
export const showGameBoard =()=> {gameBoardVisible.set(true)};
export const hideGameBoard =()=> {gameBoardVisible.set(false)};

export async function updateCardOfTheRound(newCard: CardType) {
	cardOfTheRoundFlipped.set(true);
	await waitSeconds(2);
	cardOfTheRoundNewCardAnim.set(true);
	cardOfTheRound.set(newCard);
	await waitSeconds(0.65);
	playSound('singleCardFlip');
	cardOfTheRoundFlipped.set(false);
	await waitSeconds(2);
	cardOfTheRoundNewCardAnim.set(false);
}

const cardOfTheRoundFlipped = writable(true);
const cardOfTheRoundNewCardAnim = writable(false);
const cardOfTheRound = writable<CardType>(CardType.King);
type PlayerSelectAction = 'liar' | 'devil';
const selectPlayerAction = writable<null | PlayerSelectAction>(null);
</script>

<script lang="ts">
import GrinchsBar from './engine';
import { fade, type TransitionConfig } from 'svelte/transition';
import { waitSeconds } from './utils/misc';
import PlayingCardsInGame from './PlayingCardsInGame.svelte';
import { zoomAnim } from './utils/animations';
import { writable } from 'svelte/store';
import { playSound } from './Sounds.svelte';
import { cubicInOut, elasticOut } from 'svelte/easing';
import { flip } from 'svelte/animate';

$:playerWinner = $GrinchsBar.winner !== -1 ? $GrinchsBar.players[$GrinchsBar.winner] : null;

function setPlayerAction(action: PlayerSelectAction) {
	selectPlayerAction.set($selectPlayerAction !== null ? null : action);
}

function playerSelected(playerIndex: number) {
	switch ($selectPlayerAction) {
		case 'liar': {
			GrinchsBar.playerLied(playerIndex);
			break;
		}
		case 'devil': {
			GrinchsBar.devilCard(playerIndex);
			break;
		}
	}
	selectPlayerAction.set(null);
}

function cardOfGameAnim(_: Element): TransitionConfig {
	return {
		duration: 1000,
		easing: cubicInOut,
		css: (t) => `opacity: ${t}; transform: scale(${0.75 + (0.25 * t)});`,
	}
}

function playerPreparationInAnim(_: Element): TransitionConfig {
	return {
		duration: 1500,
		easing: cubicInOut,
		css: (t) => `opacity: ${t}; transform: translateY(${6-6*t}rem) scale(${0.85 + (0.15 * t)});`,
	}
}

const playerCardElPos = writable<{[playerIndex: number]: [number, number]}>({});

function playerWonAnim(playerCardEl: HTMLElement, { isWinner, playerIndex }: { isWinner: boolean; playerIndex: number }): TransitionConfig {
	if (!isWinner) {
		return {};
	}
	const [fromLeft, fromTop] = $playerCardElPos[playerIndex];
	const toTop = (window.innerHeight / 2) - (playerCardEl.offsetHeight / 2) - 65;
	const toLeft = (window.innerWidth / 2) - (playerCardEl.offsetWidth / 2);
	const topDiff = fromTop - toTop;
	const leftDiff = fromLeft - toLeft;
	return {
		duration: 1500,
		easing: cubicInOut,
		css: (t) => (
			`z-index: 999; position: absolute; left: 0px; top: 0px;` +
			`transform: translate(${toLeft + (leftDiff * t)}px, ${toTop + (topDiff * t)}px);`
		),
	}
}
</script>

<PlayingCardsInGame />

{#if $gameBoardVisible}
	<div id="GameBoard" in:fade={{ duration: 1000 }} out:fade={{ duration: 500 }}>
		<div id="CardOfTheRound" in:cardOfGameAnim|global>
			<div class="playing-card-wrapper" class:new-card-anim={$cardOfTheRoundNewCardAnim}>
				<div class="playing-card" class:flipped={$cardOfTheRoundFlipped}>
					<div class="front" style="background-image: url('playing_card/{$cardOfTheRound}.png')"></div>
					<div class="back" style="background-image: url('playing_card/back.png')"></div>
				</div>
			</div>
		</div>

		<div class="game-actions">
			<button class="trigger button-3d no-underline"
			disabled={$selectPlayerAction === 'devil'}
			class:active={$selectPlayerAction === 'liar'}
			in:zoomAnim|global={{ duration: 1000 }}
			on:click={()=> setPlayerAction('liar')}>
				Liar❗
			</button>
			<button class="devil-card button-3d no-underline"
			disabled={$selectPlayerAction === 'liar'}
			class:active={$selectPlayerAction === 'devil'}
			in:zoomAnim|global={{ duration: 1000 }}
			on:click={()=> setPlayerAction('devil')}>
				Devil card used 👹
			</button>
		</div>

		<div class="players" class:selecting={$selectPlayerAction !== null}>
			{#each $GrinchsBar.players.filter((_, i) => i !== $GrinchsBar.winner) as player, playerIndex (player.name)}
				{@const isDead = player.triggers === player.loadedBulletInSlot}
				{@const isWinner = playerIndex === $GrinchsBar.winner}
				<button class="player"
				animate:flip={{ duration: 1500, easing: cubicInOut }}
				in:zoomAnim|global={{ duration: 1000, delay: 25 * playerIndex }}
				on:introend={(el) => {
					playerCardElPos.update((store)=> {
						store[playerIndex] = [el.currentTarget.offsetLeft, el.currentTarget.offsetTop];
						return store;
					})
				}}
				out:playerWonAnim={{ isWinner, playerIndex }}
				on:click={()=> playerSelected(playerIndex)}
				class:dead={isDead}
				disabled={isDead}
				style:background-image="url('player{isDead ? '_dead' : ''}.png')"
				style:animation-delay="{playerIndex * 30}ms">
					<div class="border"></div>
					<span class="player-name">{ player.name }</span>
					<div class="player-revolver-chamber">
						{#each Array.from({length: 6}) as _, chamberSlot}
							<div
								class="player-revolver-slot"
								class:clear={chamberSlot !== player.loadedBulletInSlot && chamberSlot <= player.triggers}
								class:peng={chamberSlot === player.loadedBulletInSlot && chamberSlot <= player.triggers}
							>
								{#if chamberSlot === player.loadedBulletInSlot && chamberSlot <= player.triggers}
									<img src="boom.png" alt="BOOM" />
								{/if}
							</div>
						{/each}
					</div>
				</button>
			{/each}
		</div>

		{#if $GrinchsBar.winner === -1}
			<div class="game-menu-actions" out:zoomAnim={{ duration: 1000 }}>
				<button class="button-3d red" on:click={() => GrinchsBar.exitGame()}>
					<span>Exit</span>
				</button>
			</div>
		{/if}
	</div>

	{#if playerWinner !== null}
		<div class="game-winner-container modal-container"
		in:fade|global={{ easing: cubicInOut, duration: 1000 }}
		out:fade|global={{ easing: cubicInOut, duration: 500 }}>
			<div class="game-winner modal" in:playerPreparationInAnim|global>
				<div class="player-wrapper">
					<div class="player" style:background-image="url('player.png')" in:fade|global={{ delay: 1500, duration: 1 }}>
						<div class="border"></div>
						<span class="player-name">{ playerWinner.name }</span>
						<div class="player-revolver-chamber">
							{#each Array.from({length: 6}) as _, chamberSlot}
								<div
									class="player-revolver-slot"
									class:clear={chamberSlot !== playerWinner.loadedBulletInSlot && chamberSlot <= playerWinner.triggers}
									class:peng={chamberSlot === playerWinner.loadedBulletInSlot && chamberSlot <= playerWinner.triggers}
								>
									{#if chamberSlot === playerWinner.loadedBulletInSlot && chamberSlot <= playerWinner.triggers}
										<img src="boom.png" alt="BOOM" />
									{/if}
								</div>
							{/each}
						</div>
						<img in:zoomAnim|global={{ delay: 2000, duration: 1000, easing: elasticOut }} class="crown" src='crown.png' alt="crown">
					</div>
				</div>
				<div class="actions">
					<button class="button-3d red" on:click={() => GrinchsBar.exitGame()}>Exit</button>
					<button class="button-3d solid-green" on:click={() => GrinchsBar.startGame()}>Next Game</button>
				</div>
			</div>
		</div>
	{/if}
{/if}

<style>
#GameBoard {
	display: flex;
	width: 100%;
	height: 100%;
	flex-flow: column nowrap;
	place-content: normal;
	place-items: center;
	padding: 2rem;
}

#CardOfTheRound {
	flex: 1 1 50vh;
	height: 50vh;
	display: flex;
	place-content: center;
	place-items: flex-end;
}
#CardOfTheRound .playing-card-wrapper {
	height: 80%;
}
#CardOfTheRound .playing-card {
	height: 100%;
	width: auto;
	border-radius: 0.9rem;
	transition-duration: 2s;
	perspective: 400px;
}
#CardOfTheRound .playing-card-wrapper.new-card-anim {
	animation: newPlayingCardAnim 1.2s cubic-bezier(0.66, 0.32, 0, 1)
}
@keyframes newPlayingCardAnim {
	0% { transform: scale(1) }
	40% { transform: scale(1.2) }
	0% { transform: scale(1) }
}
#CardOfTheRound .playing-card .front, #CardOfTheRound .playing-card .back {
	animation-duration: 1.4s;
}

.game-actions {
	display: flex;
	width: 100%;
	gap: 2rem;
	margin: 4rem 0;
	justify-content: center;
	align-items: center;
}

.game-actions button[disabled] {
	transform: scale(0.8);
}
.game-actions button.active {
	transform: scale(1.2);
}

.players {
	flex: 0 0 auto;
	display: flex;
	flex-flow: row wrap;
	margin-bottom: 4rem;
	align-items: center;
	place-content: center;
	place-items: flex-start;
	gap: 3rem;
}


.game-menu-actions {
	position: absolute;
	top: 1rem;
	right: 1rem;
}
.game-menu-actions > button {
	border-radius: 10rem;
}



.player {
	position: relative;
	height: 160px;
	aspect-ratio: 1/1;
	padding: 0;
	border-radius: 1rem;
	box-shadow:
		0 0 3px #fccc94,
		0 0 0 3px #5c5625,
		0 0px 6px rgba(0,0,0, 0.4),
		0 0 3px #9b934e inset,
		0 2px 5px #000,
		0 2px 5px #000,
		0 4px 16px #000;
	background-color: #7a7656;
	background-repeat: no-repeat;
	background-size: cover;
	display: flex;
	align-content: flex-end;
	flex-flow: row wrap;
	justify-content: center;
	image-rendering: pixelated;
	transition: 0.3s cubic-bezier(0.22, 0.61, 0.36, 1);
	cursor: default;
}

.player > .border {
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	border-radius: inherit;
}
.players.selecting > .player:not(.dead) > .border {
	animation: playerSelectableBorder 1.5s cubic-bezier(0.8, 0.5, 0, 1) infinite;
	border: solid 3px #f6f2c9;
}
.players.selecting > .player:not(.dead):hover > .border {
	box-shadow: 0 0 0 10px #ded9aca2 !important;
	border-color: #ff2957;
}
@keyframes playerSelectableBorder {
	0% { box-shadow: 0 0 1px transparent }
	50% { box-shadow: 0 0 0 10px #ded9aca2 }
	100% { box-shadow: 0 0 1px transparent }
}

.players.selecting > .player:not(.dead) {
	animation: playerSelectable 1s cubic-bezier(0.22, 0.61, 0.36, 1);
	cursor: pointer;
}
@keyframes playerSelectable {
	0% { transform: scale(1) }
	10% { transform: scale(1.1) }
	100% { transform: scale(1) }
}
.players.selecting > .player:hover {
	transform: scale(1.2);
}

.player .crown {
	position: absolute;
	top: -2.2rem;
	left: -1.5rem;
	height: 60px;
	z-index: 1;
	filter: drop-shadow(0 0 1px #9d9561) drop-shadow(0 0 10px #fff08d67);
}

.player.dead {
	animation: forwards playerIsDead 2s;
}

/* .player .trigger, .player .devil-card {
	z-index: 10;
	position: absolute;
	padding: 0.5rem;
	line-height: 1;
	border-radius: 100%;
	--shadow: 0 1px 1px #583217, 0 3px 8px #754021;
	top: -0.25rem;
} */

@keyframes playerIsDead {
	60% { opacity: 1; transform: scale(1); }
	to { opacity: 0.5; transform: scale(0.9); }
}

.player-name {
	position: absolute;
	top: -1rem;
	background-color: #dfd5b4;
	width: 75%;
	text-align: center;
	flex: 1 1 100%;
	padding: 0.35rem 0.75rem;
	border-radius: 0.6rem;
	font-size: 1.2rem;
	line-height: 1;
	text-shadow: 0 1px 2px #39361a, 0 2px 10px #59542a;
	box-shadow: 0 0 3px #7b7336 inset, 0 1px 2px #857e4e, 0 2px 10px #59542a;
	background-image: url(/public/player_name_bg.png);
	background-size: 200%;
	background-position: center;
}

.player-revolver-chamber {
	flex: 1 1 100%;
	margin-bottom: 0.5rem;
	display: flex;
	justify-content: center;
	align-items: center;
	gap: 0.5rem;
}
.player-revolver-slot {
	width: 1rem;
	height: 1rem;
	border-radius: 1rem;
	background-color: #3b26001f;
	display: flex;
	align-items: center;
	justify-content: center;
	box-shadow:
		0 0 2px #c5a957,
		0 0 3px #8b8345 inset,
		0 1px 2px #8b8345 inset;
}
.player-revolver-slot img {
	width: 2.25rem;
	height: 2.25rem;
	filter: drop-shadow(0 0 2px #e72c05);
	animation: boom 100ms ease;
}
@keyframes boom {
	from {
		opacity: 0;
		transform: scale(0);
	}
}
.player-revolver-slot.peng {
	background-color: rgb(186, 16, 16);
	box-shadow:
		0 0 2px #3d1a1a,
		0 0 2px #3d1a1a,
		0 0 3px #120400 inset;
}
.player-revolver-slot.clear {
	background-color: rgb(95, 204, 95);
	box-shadow:
		0 0 3px #698d4a,
		0 1px 4px #417937,
		0 0 1px #2c3d1a,
		0 1px 1px #8cd45c inset,
		0 -1px 2px #4d931e inset,
		0 -2px 4px #70b344 inset;
}

.game-winner-container {
	z-index: 99;
	background-color: rgba(29, 13, 0, 0.5);
}

.game-winner {
	margin: auto;
	padding: 2rem;
	padding-top: 0;
	border-radius: 1rem;
	box-shadow:
		0 0 4px #fccc94,
		0 0px 6px rgba(0,0,0, 0.4),
		0 0 4px #9b934e inset,
		0 2px 5px #000,
		0 2px 5px #000,
		0 4px 16px #000;
	background-image: url(/public/paperboard_background.jpg);
	background-repeat: repeat-y;
	background-size: 100% auto;
	background-position: 0 0;
	background-color: #7a7656;
	image-rendering: pixelated;
}

.game-winner > .player-wrapper {
	display: flex;
	justify-content: center;
}

.game-winner > .player-wrapper > .player {
	top: -1.5rem;
}

.game-winner > .actions {
	display: flex;
	flex-flow: row nowrap;
	justify-content: space-between;
	gap: 1rem;
}
</style>
