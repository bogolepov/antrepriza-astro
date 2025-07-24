<script setup lang="ts">
import { ref } from 'vue';

interface Props {
	background?: boolean;
}
const { background = false } = defineProps<Props>();
const isShow = ref<boolean>(false);

function show() {
	isShow.value = true;
}
function hide() {
	isShow.value = false;
}

defineExpose({ show, hide });
</script>

<template>
	<div v-if="isShow" class="layer-on-parent-vue" :class="{ not_transparent: background }">
		<div class="antrepriza-loader"></div>
	</div>
</template>

<style>
.not_transparent {
	background-color: inherit;
}

.antrepriza-loader {
	display: block;
	width: 50px;
	height: 50px;
	border-radius: 50%;
	padding: 1px;
	background: conic-gradient(#0000 10%, var(--colorBkgTicketsBtn)) content-box;
	-webkit-mask:
		repeating-conic-gradient(#0000 0deg, #000 1deg 20deg, #0000 21deg 36deg),
		radial-gradient(farthest-side, #0000 calc(100% - 9px), #000 calc(100% - 8px));
	mask:
		repeating-conic-gradient(#0000 0deg, #000 1deg 20deg, #0000 21deg 36deg),
		radial-gradient(farthest-side, #0000 calc(100% - 9px), #000 calc(100% - 8px));
	-webkit-mask-composite: destination-in;
	mask-composite: intersect;
	animation: s4 1s infinite steps(10);
}

@keyframes s4 {
	to {
		transform: rotate(1turn);
	}
}
</style>
