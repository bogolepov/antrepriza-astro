<script setup lang="ts">
import { ref, computed, onBeforeMount } from 'vue';
import { onBeforeRouteLeave } from 'vue-router';
import { performances, repetitions, showMenu, smallScreen, isDemo, whatsappNotes } from '../store/statesStore';
import { initPlays, initStages, initPerformances, initRepetitions, initWhatsappNotes } from '../store/statesStore';
import ChapterTitle from '../components/ChapterTitle.vue';
import WhatsappNoteText from '../components/WhatsappNoteText.vue';
import WhatsappEvent from '../components/WhatsappEvent.vue';
import { ONE_DAY } from '@scripts/consts';
import type { TRepetition, TPerformance, TWhatsappNote, TUniqStatus } from '@scripts/db/baseTypes';
import { checkUniqueSIDs, EItemType } from '@scripts/db/baseTypes';
import { saveWhatsappNotes, changedItems } from '@scripts/db/antreprizaDB';
import IconWhatsapp from '../components/iconWhatsapp.vue';
import { type TWhatsappItem } from '@scripts/vueBaseTypes';

const showPerformances = ref(true);
const showRepetitions = ref(true);
const previewMode = ref(false);
const maxWhatsappNoteId = ref(10000);

const eventsNotesChanged = ref(false);

const enum EEventWA {
	REPETITION = 3,
	PERFORMANCE = 7,
}

type TEventNoteWA = {
	event_id: number;
	event_type: EEventWA;
	note: string;
};

const preNote = ref({ text: '📅 РАСПИСАНИЕ репетиций и спектаклей', placeholder: 'Начальный текст сообщения', isChecked: true });
const postNote = ref({
	text: '🔸 Сцена ВОСТОК : Boxhagener Str. 18, 10245 Berlin\n🔹 Сцена ЗАПАД : Carmerstr. 12, 10623 Berlin',
	placeholder: 'Начальный текст сообщения',
	isChecked: true,
});

const todayDate = ref(new Date().toISOString().split('T')[0]);

async function handleBeforeMount() {
	console.log('onBeforeMount()');

	await initPlays();
	await initStages();
	await initPerformances();
	await initRepetitions();
	await initWhatsappNotes();
	checkWhatsappNotesChanging();

	let maxId: number = maxWhatsappNoteId.value;
	if (whatsappNotes.value.length > 0) whatsappNotes.value.forEach(iItem => (maxId = iItem.id > maxId ? iItem.id : maxId));
	maxWhatsappNoteId.value = maxId;
	console.log('onBeforeMount() - exit');
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

let firstEventsInMonths: Array<TPerformance | TRepetition>;

const eventsToShow = computed(() => {
	console.log('computed: eventsToShow');

	let listPerformances = showPerformances.value ? performances.value : [];
	listPerformances = listPerformances.filter(item => Date.parse(item.date) + ONE_DAY >= Date.now());

	let listRepetitions = showRepetitions.value ? repetitions.value : [];
	listRepetitions = listRepetitions.filter(item => Date.parse(item.date) + ONE_DAY >= Date.now());

	let list = [...listPerformances, ...listRepetitions].sort(
		(item1, item2) => Date.parse(item1.date + 'T' + item1.time_start) - Date.parse(item2.date + 'T' + item2.time_start)
	);

	makeListOfFirstEventsInMonths(list);
	return list;
});

// const whatsappItems = computed(() => {
// 	console.log('computed: eventsToShow');

// 	let listPerformances = showPerformances.value ? performances.value : [];
// 	listPerformances = listPerformances.filter(item => Date.parse(item.date) + ONE_DAY >= Date.now());

// 	let listRepetitions = showRepetitions.value ? repetitions.value : [];
// 	listRepetitions = listRepetitions.filter(item => Date.parse(item.date) + ONE_DAY >= Date.now());

// 	let list = [...listPerformances, ...listRepetitions].sort(
// 		(item1, item2) => Date.parse(item1.date + 'T' + item1.time_start) - Date.parse(item2.date + 'T' + item2.time_start)
// 	);

// 	makeListOfFirstEventsInMonths(list);
// 	return list;
// });

function makeListOfFirstEventsInMonths(list: Array<TPerformance | TRepetition>) {
	firstEventsInMonths = list.filter((item, index) => {
		if (index === 0) return true;
		return new Date(list[index - 1].date).getMonth() !== new Date(item.date).getMonth();
	});
}

function checkWhatsappNotesChanging() {
	if (isDemo.value && eventsNotesChanged.value) eventsNotesChanged.value = false;
	else {
		eventsNotesChanged.value = changedItems<TWhatsappNote>(whatsappNotes.value, EItemType.WHATSAPP_NOTE);
	}
}

function getMonthName(date: string): string {
	return new Date(date).toLocaleString('ru', { month: 'long' });
}
function isfirstEventInMonth(event: TPerformance | TRepetition): boolean {
	return firstEventsInMonths.findIndex(item => item.sid == event.sid) !== -1;
}

async function saveWhatsappNotesDB() {
	console.log('save whatsapp!');
	// check uniq repetition SID
	const uniqStatus: TUniqStatus = checkUniqueSIDs<TWhatsappNote>(whatsappNotes.value);
	if (!uniqStatus.isUniq) {
		let stage: string = '';
		let date: string = repetitions.value[uniqStatus.firstItem].date;
		let time: string = repetitions.value[uniqStatus.firstItem].time_start;
		alert(`Две репетиции одновременно на одной площадке.\nСцена "${stage}" : ${date} в ${time}`);
		return;
	}
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
	previewMode.value = !previewMode.value;
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
		<li><WhatsappNoteText :is-edit="!previewMode" :note="preNote"></WhatsappNoteText></li>
		<template v-for="event of eventsToShow" :key="event.id">
			<li v-show="isfirstEventInMonth(event)" class="month-item">{{ getMonthName(event.date).toUpperCase() }}</li>
			<li><WhatsappEvent :wa-event="{ event: event, isChecked: true }" :is-edit="!previewMode"></WhatsappEvent></li>
			<!-- <li>
				<Repetition
					v-if="event.subRepetitions"
					:repetition="event"
					@check-repetitions-changing="checkRepetitionsChanging"
					@delete-repetition="deleteRepetition"
				/>
				<PerformanceView v-else :performance="event" />
			</li> -->
		</template>
		<li><WhatsappNoteText :is-edit="!previewMode" :note="postNote"></WhatsappNoteText></li>
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
</style>
