<script setup lang="ts">
import { getMonthName } from '@scripts/utils';
import { type TWhatsappItem, EWAItemType } from '../lib/whatsapp_types';
import WhatsappNoteItem from './WhatsappNoteItem.vue';
import WhatsappStageItem from './WhatsappStageItem.vue';
import WhatsappEventItem from './WhatsappEventItem.vue';

interface Props {
	whatsappItem: TWhatsappItem;
	isEdit: boolean;
}
const { whatsappItem, isEdit } = defineProps<Props>();
const emit = defineEmits(['checkedStatusChanged', 'addEventNote', 'removeEventNote', 'checkWhatsappNotesChanging']);

function handleAddEventNote(sid: string, type: EWAItemType) {
	if (sid && (whatsappItem.type === EWAItemType.PERFORMANCE || whatsappItem.type === EWAItemType.REPETITION))
		emit('addEventNote', sid, type);
}
function handleRemoveEventNote(sid: string, type: EWAItemType) {
	if (sid && (whatsappItem.type === EWAItemType.PERFORMANCE || whatsappItem.type === EWAItemType.REPETITION))
		emit('removeEventNote', sid, type);
}
</script>

<template>
	<div class="wa-item-flex">
		<div v-show="isEdit" class="wa-item-flex-checkbox">
			<input
				v-show="whatsappItem.type !== EWAItemType.MONTH"
				type="checkbox"
				v-model="whatsappItem.checked"
				@change="$emit('checkedStatusChanged')"
			/>
		</div>
		<div v-if="whatsappItem.type === EWAItemType.MONTH" class="month-item wa-item-flex-item">
			{{ getMonthName(whatsappItem.note as string).toUpperCase() }}
		</div>
		<div
			v-else-if="whatsappItem.type === EWAItemType.PRE_NOTE || whatsappItem.type === EWAItemType.POST_NOTE"
			class="wa-item-flex-item"
		>
			<WhatsappNoteItem
				:whatsapp-item
				:is-edit
				@check-whatsapp-notes-changing="$emit('checkWhatsappNotesChanging')"
			></WhatsappNoteItem>
		</div>
		<div v-else-if="whatsappItem.type === EWAItemType.STAGE" class="wa-item-flex-item">
			<WhatsappStageItem :whatsapp-item :is-edit></WhatsappStageItem>
		</div>
		<div
			v-else-if="whatsappItem.type === EWAItemType.PERFORMANCE || whatsappItem.type === EWAItemType.REPETITION"
			class="wa-item-flex-item"
		>
			<WhatsappEventItem
				:whatsapp-item
				:is-edit
				@add-note="handleAddEventNote"
				@remove-note="handleRemoveEventNote"
			></WhatsappEventItem>
		</div>
	</div>
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
:nth-child(1 of li:has(.wa-stage-item)) {
	margin-top: 1.3rem;
}
</style>
