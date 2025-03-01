<script lang="ts">
import type { Player } from './types';
import { zoomAnim } from './utils/animations';
export let name: Player['name'];
export let loadedBulletInSlot: Player['loadedBulletInSlot'];
export let triggers: Player['triggers'];
export let isWinner: boolean;
$:isDead = triggers === loadedBulletInSlot;

export let takeShot: () => {};
</script>



<style>
</style>
