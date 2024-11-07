<script setup lang="ts">
interface Props {
	title: string;
	isDemo: boolean;
	showSaveButton: boolean;
}
const { title, isDemo, showSaveButton } = defineProps<Props>();
const emit = defineEmits<{
	handleSaveButton: [];
}>();
</script>

<template>
	<div class="chapter-title">
		<h1>{{ title }}</h1>
		<div class="chapter-actions">
			<slot name="chapter-actions"></slot>
			<button v-show="showSaveButton" @click="$emit('handleSaveButton')" :disabled="isDemo" class="save-button">Сохранить</button>
		</div>
	</div>
</template>

<style>
.chapter-title {
	display: flex;
	flex-direction: row;
	justify-content: space-between;
	flex-wrap: wrap;
	column-gap: 1.5rem;
	row-gap: 0.1rem;
}
.chapter-actions {
	display: grid;
	place-items: center;
	/* place-items: center; */
	/* grid-template-columns: repeat(auto-fill, 1fr); */
	grid-auto-flow: column;
	column-gap: 0.5rem;
	row-gap: 0.3rem;
}
.chapter-actions button {
	margin-top: 0;
}
.save-button {
	background-color: transparent;
	font-size: 1.1em;
	font-weight: 400;
	color: var(--colorAntreprizaRed);
	border: 1px solid var(--colorAntreprizaRed);
	cursor: pointer;
}
</style>
