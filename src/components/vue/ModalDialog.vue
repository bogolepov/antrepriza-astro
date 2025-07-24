<script setup lang="ts">
import { ref } from 'vue';

interface Props {
	maxWidth?: string;
}
const { maxWidth = '440px' } = defineProps<Props>();
const showForm = ref(false);

function open() {
	showForm.value = true;
}
function close() {
	showForm.value = false;
}
defineExpose({ open, close });

function inlineDialogStyle(): string {
	return `max-width: ${maxWidth}`;
}
</script>

<template>
	<Transition name="modal-layer">
		<div v-if="showForm" class="modal-layer-vue d-feedback">
			<div class="modal-dialog" :style="inlineDialogStyle()">
				<button @click="close()" class="close-button">&#10006;</button>
				<slot></slot>
			</div>
		</div>
	</Transition>
</template>

<style>
.modal-layer-enter-active {
	animation: modal-layer-in 500ms;
}
.modal-layer-leave-active {
	animation: modal-layer-in 150ms reverse;
}
@keyframes modal-layer-in {
	0% {
		transform: scaleY(0);
		opacity: 0;
	}
	20% {
		opacity: 1;
	}
	100% {
		transform: scaleY(1);
	}
}

.modal-layer-vue {
	display: grid;
	place-items: center;

	position: fixed;
	z-index: var(--z-modal-layer);
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;

	font-size: 1rem;
	background-color: var(--colorBkgLayerUnderForm);
	-webkit-backdrop-filter: blur(6px);
	backdrop-filter: blur(6px);
}
.modal-layer-vue .close-button {
	position: absolute;
	top: 3px;
	right: 3px;
	background-color: transparent;
	color: var(--colorFontDate);
	border: 0px;
	font-size: 1.25em;
	line-height: 1em;
	font-weight: var(--font-bold-weight);
	padding: 1px 3px;
	cursor: pointer;
	transition: color 300ms ease-out;
}
.modal-layer-vue .close-button:focus-visible {
	outline: 1px solid var(--colorAntreprizaRed);
}
@media (hover: hover) {
	.modal-layer-vue .close-button:hover {
		color: var(--colorAntreprizaRed);
	}
}
</style>
