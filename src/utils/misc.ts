export function waitSeconds(seconds: number): Promise<void> {
	return new Promise((r) => setTimeout(r, seconds * 1000))
}

export function randNum(max: number = 1, min: number = 0) {
	if (min > max) {
		throw new Error('Min should be less than or equal to Max.');
	}
	const num = crypto.getRandomValues(new Uint32Array(1))[0];
	return min + (num % (max - min + 1));
}
