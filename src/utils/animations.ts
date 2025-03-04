import type {EasingFunction, TransitionConfig} from 'svelte/transition';
import {cubicInOut} from 'svelte/easing';

export function easeInOutBack(x: number): number {
	const c1 = 1.70158;
	const c2 = c1 * 1.525;
	return x < 0.5
		? (Math.pow(2 * x, 2) * ((c2 + 1) * 2 * x - c2)) / 2
		: (Math.pow(2 * x - 2, 2) * ((c2 + 1) * (x * 2 - 2) + c2) + 2) / 2;
}

export function easeOutBack(x: number): number {
	const c1 = 1.70158;
	const c3 = c1 + 1;
	return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
}

export function easeInBack(x: number): number {
	const c1 = 1.70158;
	const c3 = c1 + 1;
	return c3 * x * x * x - c1 * x * x;
}

export function zoomAnim(_: Element, opts?: { delay?: number; duration?: number; easing?: EasingFunction }): TransitionConfig {
	return {
		delay: opts?.delay,
		duration: opts?.duration ?? 300,
		easing: opts?.easing ?? cubicInOut,
		css: (t) => `opacity: ${t}; transform: scale(${t});`,
	}
}
