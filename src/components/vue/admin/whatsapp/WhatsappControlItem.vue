<script setup lang="ts">
import { ref } from 'vue';
import { ECheckboxStatus3 } from '../lib/whatsapp_types';

interface Props {
	generalCheckboxStatus: ECheckboxStatus3;
	isEdit: boolean;
}

const { generalCheckboxStatus, isEdit } = defineProps<Props>();
// const checkedStatus = ref<boolean>(generalCheckboxStatus !== ECheckboxStatus3.UNCHECKED);

const emit = defineEmits<{ handleGeneralCheckStatus: [checked: boolean]; copyMessageToMemory: [] }>();
function generalCheckboxStatusChanged(e: Event) {
	emit('handleGeneralCheckStatus', (e.target as HTMLInputElement).checked);
}
</script>

<template>
	<div v-if="isEdit" class="wa-item-flex">
		<div class="wa-item-flex-checkbox">
			<input
				id="checkbox-all-item"
				type="checkbox"
				:checked="generalCheckboxStatus !== ECheckboxStatus3.UNCHECKED"
				:indeterminate="generalCheckboxStatus === ECheckboxStatus3.CHIMERA"
				@change="generalCheckboxStatusChanged"
			/>
		</div>
		<div class="wa-item-flex-item">
			<label for="checkbox-all-item"> Применить ко всем записям</label>
		</div>
	</div>
	<button v-else @click="$emit('copyMessageToMemory')">Скопировать текст сообщения</button>
</template>

<style>
.wa-item-flex {
	display: flex;
	flex-direction: row;
	flex-wrap: nowrap;
}
.wa-item-flex-checkbox {
	width: 2rem;
	padding-left: 0.3rem;
}
.wa-item-flex-item {
	flex-grow: 1;
}
.wa-item-flex-item.month-item {
	font-size: 1.1rem;
}
.wa-item-flex:has(.note-area) {
	margin-top: 1rem;
}
.wa-item-flex:has(#checkbox-all-item) .wa-item-flex-checkbox {
	border-bottom: 1px dashed var(--color-border);
	padding-bottom: 0.5rem;
}
.wa-item-flex:has(#checkbox-all-item) .wa-item-flex-item {
	flex-grow: unset;
	width: max-content;
	border-bottom: 1px dashed var(--color-border);
	padding-bottom: 0.5rem;
}
</style>
