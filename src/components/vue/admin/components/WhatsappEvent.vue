<script setup lang="ts">
import type { TPerformance, TRepetition } from '@scripts/db/baseTypes';

type TEventWA = {
	event: TPerformance | TRepetition;
	isChecked: boolean;
};

interface Props {
	waEvent: TEventWA;
	isEdit: boolean;
}

const { waEvent, isEdit } = defineProps<Props>();
</script>

<template>
	<div v-if="isEdit" class="whatsapp-item">
		<input type="checkbox" v-model="waEvent.isChecked" />
		<div>{{ waEvent.event.date }}</div>
		<!-- <textarea
			v-if="isEdit"
			v-model="note.text"
			class="note-area"
			rows="4"
			maxlength="2000"
			autocomplete="on"
			:disabled="!event.isChecked"
		></textarea> -->
	</div>
</template>

<style>
.note-area {
	resize: none;
	display: block;
	width: 100%;
	line-height: 1.2;
	/* max-width: 600px; */
}
</style>
