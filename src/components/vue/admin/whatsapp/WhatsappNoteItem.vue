<script setup lang="ts">
import type { TWhatsappNote } from '@scripts/db/baseTypes';
import { EWAItemType, type TWhatsappItem } from '../lib/whatsapp_types';

interface Props {
	whatsappItem: TWhatsappItem;
	isEdit: boolean;
}

function getPlaceholderText() {
	if (whatsappItem.type === EWAItemType.PRE_NOTE) return 'Начальный текст сообщения';
	else if (whatsappItem.type === EWAItemType.POST_NOTE) return 'Завершающий текст сообщения';
	else return '';
}

const { whatsappItem, isEdit } = defineProps<Props>();

const emit = defineEmits(['checkWhatsappNotesChanging']);
</script>

<template>
	<textarea
		v-if="isEdit"
		v-model="(whatsappItem.note as TWhatsappNote).text"
		class="note-area"
		:rows="whatsappItem.type === EWAItemType.PRE_NOTE || whatsappItem.type === EWAItemType.POST_NOTE ? 4 : 2"
		maxlength="2000"
		autocomplete="on"
		:placeholder="getPlaceholderText()"
		@change="$emit('checkWhatsappNotesChanging')"
	></textarea>
	<p class="note-text" v-else>{{ (whatsappItem.note as TWhatsappNote).text }}</p>
</template>

<style>
.note-area {
	resize: none;
	display: block;
	width: 100%;
	line-height: 1.2;
	width: 100%;
}
.note-text {
	width: 100%;
	white-space: pre-wrap;
	margin-bottom: 0;
}
</style>
