<script setup lang="ts">
type TNoteWA = {
	text: string;
	placeholder: string;
	isChecked: boolean;
};

interface Props {
	note: TNoteWA;
	isEdit: boolean;
}

const { note, isEdit } = defineProps<Props>();
</script>

<template>
	<div v-if="isEdit" class="whatsapp-item">
		<input type="checkbox" v-model="note.isChecked" />
		<textarea
			v-if="isEdit"
			v-model="note.text"
			class="note-area"
			rows="4"
			maxlength="2000"
			:placeholder="note.placeholder"
			autocomplete="on"
			:disabled="!note.isChecked"
		></textarea>
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
