<script setup lang="ts">
import { ref } from 'vue';

defineEmits<{
	handleClose: [];
}>();

const isShow = ref<boolean>(false);
const dlgMessage = ref<string>('');

function show(message: string) {
	dlgMessage.value = message;
	isShow.value = true;
}
function close() {
	isShow.value = false;
}
defineExpose({ show, close });
</script>

<template>
	<div v-if="isShow" class="layer-on-parent-vue glass1_5">
		<div class="message-box">
			<p class="message-box-message">{{ dlgMessage }}</p>
			<button class="message-box-button" @click.prevent="$emit('handleClose')">OK</button>
		</div>
	</div>
</template>

<style>
.message-box {
	width: 70%;
	text-align: center;
	padding: 1.6em;

	border: 4px solid var(--colorBorderForm);
	border-radius: 6px;
	box-shadow: 0 2px 10px var(--colorBoxShadow);

	background-color: var(--colorBkgForm);
	color: var(--colorFont);
}

.message-box-message {
	margin: 0;
	padding-bottom: 1.3em;
	line-height: 1.4;
}
.message-box-button {
	padding: 0.2em 0.6em;
	background-color: var(--colorBkgTicketsBtn);
	border: 1px solid var(--colorBkgTicketsBtn);
	color: var(--colorFontTicketsBtn);
	border-radius: 0;
	cursor: pointer;
}
.message-box-button:focus-visible {
	outline: 1px solid var(--colorAntreprizaRed);
}
</style>
