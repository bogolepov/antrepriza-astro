<script setup lang="ts">
import { computed } from 'vue';
import { EWAItemType, getEventDateText, getEventStageText, getEventTimeText, getPlayName, type TWhatsappItem } from '../lib/whatsapp_types';
import { ERepetitionType, type IItem, type TPerformance, type TRepetition, type TWhatsappNote } from '@scripts/db/baseTypes';
import { plays } from '../lib/statesStore';
import WhatsappNoteItem from './WhatsappNoteItem.vue';

interface Props {
	whatsappItem: TWhatsappItem;
	isEdit: boolean;
}
const { whatsappItem, isEdit } = defineProps<Props>();

const emit = defineEmits<{
	addNote: [eventSID: string, type: EWAItemType];
	removeNote: [eventSID: string, type: EWAItemType];
	checkWhatsappNotesChanging: [];
}>();

const eventSID = computed<string>(() => {
	if (!whatsappItem || (whatsappItem.type !== EWAItemType.PERFORMANCE && whatsappItem.type !== EWAItemType.REPETITION) || !whatsappItem.obj)
		return undefined;
	return (whatsappItem.obj as IItem).sid;
});
const textDate = computed<string>(() => getEventDateText(whatsappItem));
const textTime = computed<string>(() => getEventTimeText(whatsappItem));
const textStage = computed<string>(() => getEventStageText(whatsappItem));
const textPlayName = computed<string>(() => {
	if (!whatsappItem || whatsappItem.type !== EWAItemType.PERFORMANCE || !whatsappItem.obj) return undefined;
	const { play_sid } = whatsappItem.obj as TPerformance;
	return getPlayName(play_sid);
});
</script>

<template>
	<span v-if="!isEdit">• </span>
	<span v-if="textDate">{{ textDate }}, </span>
	<span v-if="textTime" class="event-time">{{ textTime }}</span>
	<span v-if="textStage"
		>, <b>{{ textStage }}</b
		>,
	</span>
	<span v-if="whatsappItem.type === EWAItemType.PERFORMANCE"
		>спектакль 🎭
		<b
			><i>{{ textPlayName }}</i></b
		></span
	>
	<span v-if="whatsappItem.type === EWAItemType.REPETITION">
		<template v-for="(task, index) in (whatsappItem.obj as TRepetition).subRepetitions">
			{{ index ? ' + ' : '' }}
			{{ task.event_type.toLowerCase() }}
			<b
				><i>{{ task.event_type === ERepetitionType.WORKSHOP ? '' : getPlayName(task.play_sid) }}</i></b
			>
		</template>
	</span>
	<span v-if="!isEdit && whatsappItem.note && (whatsappItem.note as TWhatsappNote).text.trim().length">
		[ {{ (whatsappItem.note as TWhatsappNote).text }} ]</span
	>
	<button v-if="isEdit && !whatsappItem.note" class="note-button" @click="$emit('addNote', eventSID, whatsappItem.type)">+ прим.</button>
	<button v-if="isEdit && whatsappItem.note" class="note-button" @click="$emit('removeNote', eventSID, whatsappItem.type)">- прим.</button>
	<WhatsappNoteItem
		v-if="isEdit && whatsappItem.note"
		:whatsapp-item
		:is-edit
		@check-whatsapp-notes-changing="$emit('checkWhatsappNotesChanging')"
	></WhatsappNoteItem>
</template>

<style>
.event-time {
	color: #1e90ff;
}
button.note-button {
	margin: 0.2rem 0 0.2rem 1rem;
	padding: 0.1rem 0.3rem;
	line-height: 1;
}
</style>
