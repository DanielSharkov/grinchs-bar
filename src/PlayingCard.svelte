<script lang="ts">
import type { CardType } from './types';
import { zoomAnim } from './utils/animations';
export let cardType: CardType;
export let count: number | undefined = undefined;
export let flipped = false;
</script>

<div class="playing-card" class:flipped>
	<div class="front" style="background-image: url('/playing_card/{cardType}.png')"></div>
	<div class="back" style="background-image: url('/playing_card/back.png')"></div>
	{#if count !== undefined}
		<span class="playing-card-count" transition:zoomAnim|global={{ duration: 500 }}>{ count }</span>
	{/if}
</div>
