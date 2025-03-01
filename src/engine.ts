import { writable, get as get$ } from 'svelte/store';
import { playMusic, playSound } from './Sounds.svelte';
import { randNum, waitSeconds } from './utils/misc';
import { shootRevolver } from './Revolver.svelte';
import { hidePreparationMenu, showPreparationMenu } from './PreparationMenu.svelte';
import { hideGameBoard, showGameBoard, updateCardOfTheRound } from './GameBoard.svelte';
import { GameState, CardType, type Player } from './types';
import { presentPlayingCardsInGame } from './PlayingCardsInGame.svelte';

type t_$ = {
	userConsentForSound: boolean;
	gameState: GameState;
	players: Array<Player>;
	winner: number;
	cardsInGame: {[K in CardType]: number};
	cardOfTheRound: CardType;
}

class GrinchsBarGameEngine {
	#store = writable<t_$>({
		userConsentForSound: false,
		gameState: GameState.Preperation,
		players: [
			{ name: 'Me, myself & I', loadedBulletInSlot: 0, triggers: -1 },
		],
		winner: -1,
		cardsInGame: {
			[CardType.King]: 8,
			[CardType.Queen]: 8,
			[CardType.Jack]: 8,
			[CardType.Ace]: 8,
			[CardType.Joker]: 2,
			[CardType.Devil]: 2,
		},
		cardOfTheRound: CardType.King,
	});
	public readonly subscribe = this.#store.subscribe
	public $() {return get$(this)}

	public consentOfUserGiven() {
		if (this.$().userConsentForSound) {
			return;
		}
		this.#store.update(($) => {
			$.userConsentForSound = true;
			return $;
		})
		showPreparationMenu();
		const GrinchsBarDebug = {
			presentPlayingCardsInGame: () => {
				presentPlayingCardsInGame();
			},
			quickGameStart: async () => {
				const current$ = this.$();
				if (current$.gameState !== GameState.Preperation) {
					return;
				}
				if (current$.players.length < 2 || current$.players.some((p) => !p.name)) {
					return;
				}
				this.#store.update(($) => {
					$.winner = -1;
					$.gameState = GameState.InProcess;
					$.players.forEach((_, index) => {
						$.players[index].triggers = -1;
						$.players[index].loadedBulletInSlot = 0 // randNum(5);
					});
					return $;
				});
				await hidePreparationMenu();
				showGameBoard();
				updateCardOfTheRound(this.$().cardOfTheRound);
			},
			updateCardOfRound: ()=> {
				this.#newRound();
			},
			exitGame: () => {
				this.exitGame();
			},
			updateRevolverChamber: () => {
				this.#store.update(($) => {
					$.players.forEach((_, index) => {
						$.players[index].triggers = -1;
						$.players[index].loadedBulletInSlot = randNum(5);
					});
					return $;
				});
			},
			randomWinner: () => {
				this.#store.update(($) => {
					// $.winner = randNum($.players.length - 1);
					$.winner = $.players.length - 1;
					return $;
				});
			},
			resetWinner: () => {
				this.#store.update(($) => {
					$.winner = -1;
					return $;
				});
			},
		};
		(window as unknown as Window & {GrinchsBarDebug: typeof GrinchsBarDebug}).GrinchsBarDebug = GrinchsBarDebug;
	}

	public addPlayer(): void {
		this.#store.update(($) => {
			if ($.players.length < 8) {
				$.players.push({name: '', triggers: -1, loadedBulletInSlot: 0})
			}
			return $;
		});
	}

	public updatePlayerName(playerIndex: number, newName: string) {
		this.#store.update(($) => {
			$.players[playerIndex].name = newName;
			return $;
		});
	}

	public removePlayer(playerIndex: number): void {
		this.#store.update(($) => {
			if ($.players.length === 1) {
				$.players[0].name = '';
			} else {
				$.players.splice(playerIndex, 1)
			}
			return $;
		});
	}

	private getCardsAmountByPlayersAmount(playersAmount: number): t_$['cardsInGame'] {
		// playersAmount * cardsAmountForEachPlayer / count(Ace, King, Queen, Jack)
		const cardsAmountByPlayer = 5;
		const normalCardTypesAmount = 4; // minus joker and devil card
		const cardsAmount = Math.floor(playersAmount * cardsAmountByPlayer / normalCardTypesAmount);
		const jokerAmount = Math.ceil(playersAmount / 2);
		const devilAmount = Math.ceil(playersAmount / 4);
		return {
			[CardType.King]: cardsAmount,
			[CardType.Queen]: cardsAmount,
			[CardType.Jack]: cardsAmount,
			[CardType.Ace]: cardsAmount,
			[CardType.Joker]: jokerAmount,
			[CardType.Devil]: devilAmount,
		};
	}

	public async startGame(): Promise<void> {
		const current$ = this.$();
		if (current$.gameState === GameState.InProcess) {
			return;
		}
		if (current$.players.length < 2 || current$.players.some((p) => !p.name)) {
			return;
		}
		if (current$.gameState === GameState.GameEnded) {
			hideGameBoard();
		}
		this.#store.update(($) => {
			$.winner = -1;
			$.gameState = GameState.InProcess;
			$.cardsInGame = this.getCardsAmountByPlayersAmount($.players.length);
			$.players.forEach((_, index) => {
				$.players[index].triggers = -1;
				$.players[index].loadedBulletInSlot = randNum(5);
			});
			return $;
		});
		await hidePreparationMenu();
		void playMusic('gameStart');
		await presentPlayingCardsInGame();
		showGameBoard();
		updateCardOfTheRound(this.$().cardOfTheRound);
	}

	public async exitGame(): Promise<void> {
		const current$ = this.$();
		if (current$.gameState === GameState.Preperation) {
			return;
		}
		this.#store.update(($) => {
			$.gameState = GameState.Preperation;
			return $;
		});
		hideGameBoard();
		await waitSeconds(2);
		showPreparationMenu();
	}

	private async lastPlayerWon(): Promise<void> {
		const current$ = this.$();
		const playersStillInGame = current$.players.map((player, index) => ({...player, index})).filter(
			({ triggers, loadedBulletInSlot }) => triggers < loadedBulletInSlot
		);
		if (playersStillInGame.length > 1) {
			return;
		}
		await waitSeconds(0.5);
		void playMusic('gameEnd');
		this.#store.update(($) => {
			$.gameState = GameState.GameEnded;
			$.winner = playersStillInGame[0].index;
			return $;
		});
	}

	private async playerDied(playerDied: boolean): Promise<void> {
		const current$ = this.$();
		const playersStillInGame = current$.players.filter(
			(thisPlayer) => thisPlayer.triggers < thisPlayer.loadedBulletInSlot
		)
		await waitSeconds(1);
		if (playersStillInGame.length < 2) {
			this.lastPlayerWon();
		} else {
			if (playerDied) {
				void playSound('playerDead');
				await waitSeconds(2);
			}
			this.#newRound();
		}
	}

	#newRound(): void {
		this.#store.update(($) => {
			const cards = Object.keys(CardType) as Array<CardType>;
			const randomNewCard = randNum(cards.length - 3);
			$.cardOfTheRound = cards[randomNewCard];
			updateCardOfTheRound($.cardOfTheRound);
			return $;
		})
	}

	public async playerLied(playerIndex: number): Promise<void> {
		const current$ = this.$();
		const thisPlayer = current$.players[playerIndex];
		if (thisPlayer.triggers >= thisPlayer.loadedBulletInSlot) {
			// already out of game
			return;
		}
		const willDie = thisPlayer.triggers + 1 === thisPlayer.loadedBulletInSlot;
		await shootRevolver(
			'liar',
			[[
				willDie,
				() => {
					this.#store.update(($) => {
						$.players[playerIndex].triggers += 1;
						return $;
					})
				},
			]],
			willDie && thisPlayer.loadedBulletInSlot === 5
		);
		await this.playerDied(willDie);
	}

	public async devilCard(byPlayerIndex: number): Promise<void> {
		const current$ = this.$();
		const playersWithIndex = current$.players.map((player, index) => ({...player, index}));
		const otherPlayers = playersWithIndex.filter((p) => p.index !== byPlayerIndex && p.triggers < p.loadedBulletInSlot);
		if (otherPlayers.length < 1) {
			// all players out of game
			return;
		}
		let onePlayerDies = false;
		await shootRevolver(
			'devil',
			otherPlayers.map(({index}) => {
				const thisPlayer = current$.players[index];
				const willDie = thisPlayer.triggers + 1 === thisPlayer.loadedBulletInSlot;
				if (willDie) {
					onePlayerDies = true;
				}
				return [
					willDie,
					() => {
						this.#store.update(($) => {
							$.players[index].triggers += 1;
							return $;
						});
					},
				];
			})
		);
		await this.playerDied(onePlayerDies);
	}
}

const GrinchsBar = new GrinchsBarGameEngine();
export default GrinchsBar;
