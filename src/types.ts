export type Player = {
	name: string;
	loadedBulletInSlot: number;
	triggers: number; // starts from -1
}

export enum GameState {
	Preperation,
	InProcess,
	GameEnded,
}

export enum CardType {
	Ace = 'Ace',
	King = 'King',
	Queen = 'Queen',
	Jack = 'Jack',
	Joker = 'Joker',
	Devil = 'Devil',
}
