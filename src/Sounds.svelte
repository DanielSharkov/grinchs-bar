<script lang="ts" context="module">
export let SoundAudioContext: AudioContext;
export let MusicAudioContext: AudioContext;

const urlBasePath = import.meta.env.VITE_BASE_URL || '/';

type SoundType =
	| 'gunShot' | 'playerDead' | 'revolverClear' | 'revolverSpin' | 'liar' | 'gong' | 'cardsFlip'
	| 'whoosh' | 'deepWhoosh' | 'cardSpinWhoosh' | 'singleCardFlip';
export const soundURL: {[K in SoundType]: string} = {
	gunShot: 'sound/gun_shot.mp3',
	playerDead: 'sound/player_game_over.mp3',
	revolverClear: 'sound/revolver_clear.mp3',
	revolverSpin: 'sound/revolver_spin.mp3',
	liar: 'sound/liar.mp3',
	gong: 'sound/gong.mp3',
	cardsFlip: 'sound/cards_flip.mp3',
	whoosh: 'sound/whoosh.mp3',
	deepWhoosh: 'sound/deep_whoosh.mp3',
	cardSpinWhoosh: 'sound/card_spin_whoosh.mp3',
	singleCardFlip: 'sound/single_card_flip.mp3',
};
export function playSound(soundType: keyof typeof soundURL): void {
	const audioEl = new Audio(urlBasePath + soundURL[soundType])
	SoundAudioContext.createMediaElementSource(audioEl).connect(SoundAudioContext.destination);
	audioEl.play().then(() => audioEl.remove());
}

type MusicType = 'gameStart' | 'gameEnd' | 'intro';
const musics: {[K in MusicType]: HTMLAudioElement} = {
	gameStart: new Audio(urlBasePath + 'music/game_start.mp3'),
	gameEnd: new Audio(urlBasePath + 'music/game_end.mp3'),
	intro: new Audio(urlBasePath + 'music/intro.mp3'),
}
export function playMusic(soundType: keyof typeof musics, resume?: true): Promise<void> {
	if (resume !== true) {
		musics[soundType].currentTime = 0;
	}
	musics[soundType].volume = 1;
	return musics[soundType].play();
}
export async function stopMusic(soundType: keyof typeof musics, transition?: number): Promise<void> {
	const thisMusic = musics[soundType];
	if (transition === undefined) {
		thisMusic.pause();
		return Promise.resolve();
	}
	return new Promise((resolve) => {
		const step = 50;
		const fadeAmount = thisMusic.volume / (transition / step);
		let fadedAmount = 0;
		const fadeInterval = setInterval(() => {
			fadedAmount += step;
			if (thisMusic.volume > 0 && fadedAmount < transition) {
				thisMusic.volume = Math.max(0, thisMusic.volume - fadeAmount); // Reduce volume
			} else {
				clearInterval(fadeInterval); // Stop the interval when volume reaches 0
				thisMusic.pause();
				resolve();
			}
		}, step);
	});
}
</script>

<svelte:window
	on:click|once={() => {
		SoundAudioContext = new (window.AudioContext || (window as unknown as {webkitAudioContext: AudioContext}).webkitAudioContext)();
		// Object.values(sounds).forEach((audioEl) => {
		// 	SoundAudioContext.createMediaElementSource(audioEl).connect(SoundAudioContext.destination);
		// });
		MusicAudioContext = new (window.AudioContext || (window as unknown as {webkitAudioContext: AudioContext}).webkitAudioContext)();
		Object.values(musics).forEach((audioEl) => {
			MusicAudioContext.createMediaElementSource(audioEl).connect(MusicAudioContext.destination);
		});
	}}
/>
