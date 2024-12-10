<script setup lang="ts">
import { ref, computed, onBeforeMount, watch } from 'vue';
import { onBeforeRouteLeave } from 'vue-router';
import { performances, repetitions, showMenu, smallScreen, isDemo, whatsappNotes, stages } from '../lib/statesStore';
import { initWhatsappNotes } from '../lib/statesStore';
import ChapterTitle from '../components/ChapterTitle.vue';
import WhatsappItem from './WhatsappItem.vue';
import WhatsappControlItem from './WhatsappControlItem.vue';
import { ONE_DAY } from '@scripts/consts';
import { type IItem, type TWhatsappNote, EWhatsappNoteType } from '@scripts/db/baseTypes';
import { saveWhatsappNotes, changedWhatsappNotes } from '@scripts/db/antreprizaDB';
import IconWhatsapp from '../components/iconWhatsapp.vue';
import { type TWhatsappItem, ECheckboxStatus3, EWAItemType, memTextItem } from '../lib/whatsapp_types';

const showPerformances = ref(true);
const showRepetitions = ref(true);
const previewMode = ref(isDemo.value);
const eventsNotesChanged = ref(false);
const generalCheckboxStatus = ref<ECheckboxStatus3>(ECheckboxStatus3.CHECKED);

const whatsappItems = ref<TWhatsappItem[]>([]);

const PRE_NOTE_TEXT: string = '📅 РАСПИСАНИЕ репетиций и спектаклей';
const POST_NOTE_TEXT: string = '';

// const preNote = ref({ text: '📅 РАСПИСАНИЕ репетиций и спектаклей', placeholder: 'Начальный текст сообщения', isChecked: true });
// const postNote = ref({
// 	text: '🔸 Сцена ВОСТОК : Boxhagener Str. 18, 10245 Berlin\n🔹 Сцена ЗАПАД : Carmerstr. 12, 10623 Berlin',
// 	placeholder: 'Начальный текст сообщения',
// 	isChecked: true,
// });

async function handleBeforeMount() {
	await initWhatsappNotes();
	makeWhatsappItems();
	checkWhatsappNotesChanging();
}
onBeforeMount(handleBeforeMount);

async function handleBeforeRouteLeave(to, from, next) {
	if (eventsNotesChanged.value === true && confirm('Сохранить изменения?')) {
		await saveWhatsappNotesDB();
	}
	if (smallScreen.value) showMenu.value = false;
	next();
}
onBeforeRouteLeave(handleBeforeRouteLeave);

function makeWhatsappItems() {
	const items: TWhatsappItem[] = [];
	const checked = generalCheckboxStatus.value === ECheckboxStatus3.CHECKED;

	let preNote: TWhatsappNote = whatsappNotes.value.find(note => note.note_type === EWhatsappNoteType.PRE_NOTE);
	if (!preNote) {
		preNote = { note_type: EWhatsappNoteType.PRE_NOTE, sid: EWhatsappNoteType.PRE_NOTE, text: PRE_NOTE_TEXT };
		whatsappNotes.value.push(preNote);
	}
	items.push({ checked, visible: true, type: EWAItemType.PRE_NOTE, obj: null, note: preNote });

	let listPerformances = showPerformances.value ? performances.value : [];
	listPerformances = listPerformances.filter(item => Date.parse(item.date) + ONE_DAY >= Date.now());

	let listRepetitions = showRepetitions.value ? repetitions.value : [];
	listRepetitions = listRepetitions.filter(item => Date.parse(item.date) + ONE_DAY >= Date.now());

	let list = [...listPerformances, ...listRepetitions].sort(
		(item1, item2) => Date.parse(item1.date + 'T' + item1.time_start) - Date.parse(item2.date + 'T' + item2.time_start)
	);

	let noteType: EWhatsappNoteType;
	let itemType: EWAItemType;
	list.forEach(item => {
		noteType = item['subRepetitions'] === undefined ? EWhatsappNoteType.PERFORMANCE : EWhatsappNoteType.REPETITION;
		itemType = item['subRepetitions'] === undefined ? EWAItemType.PERFORMANCE : EWAItemType.REPETITION;
		let note = whatsappNotes.value.find(nt => nt.note_type === noteType && nt.sid === item.sid);
		items.push({
			checked,
			visible: itemType === EWAItemType.PERFORMANCE ? showPerformances.value : showRepetitions.value,
			type: itemType,
			obj: item,
			note,
		});
	});

	stages.value.forEach(stage => {
		items.push({ checked: checked && stage.fixed, visible: true, type: EWAItemType.STAGE, obj: stage, note: null });
	});

	let postNote: TWhatsappNote = whatsappNotes.value.find(note => note.note_type === EWhatsappNoteType.POST_NOTE);
	if (!postNote) {
		postNote = { note_type: EWhatsappNoteType.POST_NOTE, sid: EWhatsappNoteType.POST_NOTE, text: POST_NOTE_TEXT };
		whatsappNotes.value.push(postNote);
	}
	items.push({ checked, visible: true, type: EWAItemType.POST_NOTE, obj: null, note: postNote });

	whatsappItems.value = items;

	insertMonthItems();
	updateMonthItemsVisibility();
}

watch(
	() => [showPerformances.value, showRepetitions.value, previewMode.value],
	() => {
		whatsappItems.value.forEach(item => {
			if (item.type === EWAItemType.PERFORMANCE) item.visible = showPerformances.value;
			if (item.type === EWAItemType.REPETITION) item.visible = showRepetitions.value;
		});
		updateMonthItemsVisibility();
	}
);

function insertMonthItems() {
	let isFirstEventInMonth: boolean;
	whatsappItems.value.forEach((item, index) => {
		if (index === 0) return;
		if (
			(item.type === EWAItemType.PERFORMANCE || item.type === EWAItemType.REPETITION) &&
			whatsappItems.value[index - 1].type !== EWAItemType.MONTH
		) {
			let month = item.obj.sid.split('_')[1].slice(4, 6);

			// check, if item is the first event in the month
			isFirstEventInMonth =
				whatsappItems.value[index - 1].type !== EWAItemType.PERFORMANCE && whatsappItems.value[index - 1].type !== EWAItemType.REPETITION;
			if (
				!isFirstEventInMonth &&
				(whatsappItems.value[index - 1].type === EWAItemType.PERFORMANCE || whatsappItems.value[index - 1].type === EWAItemType.REPETITION)
			) {
				let monthPrevItem = whatsappItems.value[index - 1].obj.sid.split('_')[1].slice(4, 6);
				isFirstEventInMonth = month != monthPrevItem;
			}

			if (isFirstEventInMonth) {
				whatsappItems.value.splice(index, 0, { checked: true, visible: true, type: EWAItemType.MONTH, obj: null, note: month });
			}
		}
	});
}

function updateMonthItemsVisibility() {
	whatsappItems.value.forEach((item, index) => {
		if (item.type === EWAItemType.MONTH) {
			item.visible = false;
			for (let i = index + 1; i < whatsappItems.value.length; i++) {
				if (whatsappItems.value[i].type === EWAItemType.PERFORMANCE || whatsappItems.value[i].type === EWAItemType.REPETITION) {
					if (
						(previewMode.value && whatsappItems.value[i].visible && whatsappItems.value[i].checked) ||
						(!previewMode.value && whatsappItems.value[i].visible)
					) {
						item.visible = true;
						return;
					}
				} else return;
			}
		}
	});
}

function checkWhatsappNotesChanging() {
	if (isDemo.value) eventsNotesChanged.value = false;
	else {
		eventsNotesChanged.value = changedWhatsappNotes(whatsappNotes.value);
	}
}

function handleItemsCheckedStatusChanging() {
	let hasChecked: boolean = false;
	let hasUnchecked: boolean = false;
	for (let item of whatsappItems.value) {
		if (item.type !== EWAItemType.MONTH && item.visible) {
			if (item.checked && !hasChecked) hasChecked = true;
			if (!item.checked && !hasUnchecked) hasUnchecked = true;
			if (hasChecked && hasUnchecked) {
				generalCheckboxStatus.value = ECheckboxStatus3.CHIMERA;
				return;
			}
		}
	}
	if (!hasUnchecked) generalCheckboxStatus.value = ECheckboxStatus3.CHECKED;
	if (!hasChecked) generalCheckboxStatus.value = ECheckboxStatus3.UNCHECKED;
}

function handleGeneralCheckStatus(checked: boolean) {
	whatsappItems.value.forEach(item => {
		if (item.type !== EWAItemType.MONTH) item.checked = checked;
	});
	if (checked) {
		generalCheckboxStatus.value = ECheckboxStatus3.CHECKED;
	} else {
		generalCheckboxStatus.value = ECheckboxStatus3.UNCHECKED;
	}
}

async function saveWhatsappNotesDB() {
	// save whatsapp notes in AntreprizaDB
	await saveWhatsappNotes(whatsappNotes.value);
	// if notes were saved successfully, then button Save will be hidden:
	checkWhatsappNotesChanging();
}

const showSaveButton = computed(() => {
	if (!previewMode.value && eventsNotesChanged.value) return true;
	return false;
});

async function handleSaveButton() {
	if (!previewMode.value) await saveWhatsappNotesDB();
}
function handleWhatsappButton() {
	if (!isDemo.value) previewMode.value = !previewMode.value;
}

function handleCopyMessageToMemory() {
	let message = '';
	whatsappItems.value.forEach((item, index) => {
		if (!item.visible || !item.checked) return;
		if (item.type === EWAItemType.POST_NOTE && (item.note as TWhatsappNote).text.trim().length === 0) return;

		if (message.length) message += '\n';
		if (item.type === EWAItemType.MONTH) message += '\n';
		if (item.type === EWAItemType.STAGE && whatsappItems.value[index - 1].type !== EWAItemType.STAGE) message += '\n';
		if (item.type === EWAItemType.POST_NOTE) message += '\n';

		message += memTextItem(item);
	});
	navigator.clipboard.writeText(message).then(() => {
		alert('Скопировано!');
	});
}

function handleAddEventNote(eventSID: string, type: EWAItemType): void {
	if (type !== EWAItemType.PERFORMANCE && type !== EWAItemType.REPETITION) return;
	const noteType = type === EWAItemType.PERFORMANCE ? EWhatsappNoteType.PERFORMANCE : EWhatsappNoteType.REPETITION;
	let note: TWhatsappNote = whatsappNotes.value.find(note => note.sid === eventSID && note.note_type === noteType);
	if (note) {
		console.error(`addNote(${eventSID}): EXISTS!!!`);
		return;
	}
	note = { note_type: noteType, sid: eventSID, text: '' };
	whatsappNotes.value.push(note);
	const waItem = whatsappItems.value.find(item => item.type === type && (item.obj as IItem).sid === eventSID);
	if (!waItem) {
		console.error(`whatsapp item: ${eventSID} NOT EXISTS!!!`);
		return;
	}
	waItem.note = note;
	checkWhatsappNotesChanging();
}
function hadleRemoveEventNote(eventSID: string, type: EWAItemType): void {
	if (type !== EWAItemType.PERFORMANCE && type !== EWAItemType.REPETITION) return;
	const noteType = type === EWAItemType.PERFORMANCE ? EWhatsappNoteType.PERFORMANCE : EWhatsappNoteType.REPETITION;
	const indexItem = whatsappItems.value.findIndex(
		item =>
			item.type === type &&
			(item.obj as IItem).sid === eventSID &&
			item.note &&
			(item.note as TWhatsappNote).note_type === noteType &&
			(item.note as TWhatsappNote).sid === eventSID
	);
	if (indexItem === -1) {
		console.error(`whatsapp item: ${eventSID} NOT FOUND!!!`);
		return;
	}
	whatsappItems.value[indexItem].note = null;

	const indexNote = whatsappNotes.value.findIndex(note => note.note_type === noteType && note.sid === eventSID);
	if (indexNote === -1) {
		console.error(`whatsapp note: ${eventSID} NOT FOUND!!!`);
		return;
	}
	whatsappNotes.value.splice(indexNote, 1);
	checkWhatsappNotesChanging();
}
</script>

<template>
	<ChapterTitle title="Сообщение для актеров">
		<template v-slot:actions-slot>
			<button @click="showRepetitions = !showRepetitions" class="expand-item-button icon-transform">
				<div>🛠️</div>
				<div v-show="showRepetitions" class="icon-active"></div>
			</button>
			<button @click="showPerformances = !showPerformances" class="expand-item-button icon-transform">
				<div>🎭</div>
				<div v-show="showPerformances" class="icon-active"></div>
			</button>
			<button v-show="!showSaveButton" @click="handleWhatsappButton" class="expand-item-button icon-transform">
				<IconWhatsapp />
				<div v-show="previewMode" class="icon-active"></div>
			</button>
			<button v-show="showSaveButton" @click="handleSaveButton" :disabled="isDemo" class="save-button">Сохранить</button>
		</template>
	</ChapterTitle>
	<ul>
		<li class="whatsapp-control-item">
			<WhatsappControlItem
				:general-checkbox-status
				:is-edit="!previewMode"
				@handle-general-check-status="handleGeneralCheckStatus"
				@copy-message-to-memory="handleCopyMessageToMemory"
			></WhatsappControlItem>
		</li>
		<template v-for="item in whatsappItems">
			<!-- <li v-if="isFirstEventInMonth(item)" class="month-item">{{ getMonthName(item).toUpperCase() }}</li> -->
			<li v-if="item.visible && (!previewMode || (previewMode && item.checked))">
				<WhatsappItem
					:whatsapp-item="item"
					:is-edit="!previewMode"
					@checked-status-changed="handleItemsCheckedStatusChanging"
					@add-event-note="handleAddEventNote"
					@remove-event-note="hadleRemoveEventNote"
					@check-whatsapp-notes-changing="checkWhatsappNotesChanging"
				></WhatsappItem>
			</li>
		</template>
	</ul>
</template>

<style>
.expand-item-button.icon-transform {
	position: relative;
	font-size: 2rem;
	height: 2rem;
	padding: 0 0.2rem;
}
.icon-active {
	position: absolute;
	top: 0;
	right: 0;
	width: 0.7rem;
	height: 0.7rem;
	background-color: var(--colorAntreprizaRed);
	border-radius: 50%;
}
.month-item {
	font-size: 1.8rem;
	font-weight: var(--font-bold-weight);
	color: var(--colorFont-Op1);
	margin-top: 1.5rem;
	line-height: 1;
	/* text-align: center; */
}
.whatsapp-item {
	/* display: grid;
	place-items: center;
	grid-auto-flow: column;
	column-gap: 0.5rem; */
	display: flex;
	flex-direction: row;
	column-gap: 0.5rem;
}
.whatsapp-item:has(.note-area) {
	margin-top: 1rem;
}
.whatsapp-control-item {
	/* border-bottom: 1px dashed var(--color-border); */
	padding-bottom: 0.5rem;
}
.whatsapp-control-item button {
	margin-top: 0.5rem;
}
</style>
