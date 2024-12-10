<script setup lang="ts">
import { ref, computed, onBeforeMount } from 'vue';
import { onBeforeRouteLeave } from 'vue-router';
import { performances, repetitions, showMenu, smallScreen, isDemo } from '../lib/statesStore';
import { initPlays, initStages, initPerformances, initRepetitions } from '../lib/statesStore';
import ChapterTitle from '../components/ChapterTitle.vue';
import Repetition from './Repetition.vue';
import PerformanceView from './PerformanceView.vue';
import { ONE_DAY } from '@scripts/consts';
import type { TRepetition, TPerformance, TUniqStatus } from '@scripts/db/baseTypes';
import { validateRepetitionStructure, checkUniqueSIDs, EItemType } from '@scripts/db/baseTypes';
import { saveRepetitions, changedItems } from '@scripts/db/antreprizaDB';
import IconCalendar from '../components/iconCalendar.vue';

const isActualEvents = ref(true);
const showPerformances = ref(false);
const repetitionsChanged = ref(false);
const maxRepetitionId = ref(1000);

const todayDate = ref(new Date().toISOString().split('T')[0]);

async function handleBeforeMount() {
	await initRepetitions();
	checkRepetitionsChanging();

	let maxId: number = maxRepetitionId.value;
	if (repetitions.value.length > 0) repetitions.value.forEach(iItem => (maxId = iItem.id > maxId ? iItem.id : maxId));
	maxRepetitionId.value = maxId;
}
onBeforeMount(handleBeforeMount);

async function handleBeforeRouteLeave(to, from, next) {
	if (repetitionsChanged.value === true && confirm('Сохранить изменения?')) {
		await saveRepetitionsDB();
	}
	if (smallScreen.value) showMenu.value = false;
	next();
}
onBeforeRouteLeave(handleBeforeRouteLeave);

let firstEventsInMonths: Array<TPerformance | TRepetition>;

const eventsToShow = computed(() => {
	let listPerformances = showPerformances.value ? performances.value : [];
	if (isActualEvents.value === true) {
		listPerformances = listPerformances.filter(item => Date.parse(item.date) + ONE_DAY >= Date.now());
	}

	let listRepetitions = repetitions.value;
	if (isActualEvents.value === true) {
		listRepetitions = listRepetitions.filter(item => Date.parse(item.date) + ONE_DAY >= Date.now());
	}

	let list = [...listPerformances, ...listRepetitions].sort(
		(item1, item2) => Date.parse(item1.date + 'T' + item1.time_start) - Date.parse(item2.date + 'T' + item2.time_start)
	);

	makeListOfFirstEventsInMonths(list);
	return list;
});

function makeListOfFirstEventsInMonths(list: Array<TPerformance | TRepetition>) {
	firstEventsInMonths = list.filter((item, index) => {
		if (index === 0) return true;
		return new Date(list[index - 1].date).getMonth() !== new Date(item.date).getMonth();
	});
}

function checkRepetitionsChanging() {
	if (isDemo.value && repetitionsChanged.value) repetitionsChanged.value = false;
	else {
		repetitionsChanged.value = changedItems<TRepetition>(repetitions.value, EItemType.REPETITION);
	}
}

function getMonthName(date: string): string {
	return new Date(date).toLocaleString('ru', { month: 'long' });
}
function isfirstEventInMonth(event: TPerformance | TRepetition): boolean {
	return firstEventsInMonths.findIndex(item => item.sid == event.sid) !== -1;
}

function addRepetition() {
	maxRepetitionId.value++;
	let newRepetition: TRepetition = {} as TRepetition;
	newRepetition = validateRepetitionStructure(newRepetition);
	newRepetition.id = maxRepetitionId.value;
	newRepetition.date = todayDate.value;
	newRepetition.time_start = '19:00';
	newRepetition.time_end = '21:00';
	newRepetition.subRepetitions = [];
	repetitions.value.push(newRepetition);

	checkRepetitionsChanging();
}
function deleteRepetition(repetitionId: number) {
	let index = repetitions.value.findIndex(item => item.id === repetitionId);
	if (index !== -1 && confirm('Удалить репетицию?')) {
		// repetitions.value =
		repetitions.value.splice(index, 1);
		checkRepetitionsChanging();
	}
}

async function saveRepetitionsDB() {
	// check uniq repetition SID
	const uniqStatus: TUniqStatus = checkUniqueSIDs<TRepetition>(repetitions.value);
	if (!uniqStatus.isUniq) {
		let stage: string = '';
		let date: string = repetitions.value[uniqStatus.firstItem].date;
		let time: string = repetitions.value[uniqStatus.firstItem].time_start;
		alert(`Две репетиции одновременно на одной площадке.\nСцена "${stage}" : ${date} в ${time}`);
		return;
	}
	// save repetitions in AntreprizaDB
	await saveRepetitions(repetitions.value);
	// if repetitions were saved successfully, then button Save will be hidden:
	checkRepetitionsChanging();
}
</script>

<template>
	<ChapterTitle title="Репетиции">
		<template v-slot:actions-slot>
			<button
				@click="isActualEvents = !isActualEvents"
				class="expand-item-button icon-transform"
				:class="{ 'black-white-filter': !isActualEvents }"
				title="Только предстоящие"
			>
				<IconCalendar />
			</button>
			<button
				@click="showPerformances = !showPerformances"
				class="expand-item-button icon-transform"
				:class="{ 'black-white-filter': !showPerformances }"
				title="Выступления"
			>
				<div>🎭</div>
			</button>
			<button v-show="repetitionsChanged" @click="saveRepetitionsDB" :disabled="isDemo" class="save-button">Сохранить</button>
		</template>
	</ChapterTitle>
	<ul>
		<li><button @click="addRepetition" :disabled="isDemo">Добавить репетицию</button></li>
		<template v-for="event in eventsToShow" :key="event.id">
			<li v-show="isfirstEventInMonth(event)" class="month-item">{{ getMonthName(event.date).toUpperCase() }}</li>
			<li>
				<Repetition
					v-if="event.subRepetitions"
					:repetition="event"
					@check-repetitions-changing="checkRepetitionsChanging"
					@delete-repetition="deleteRepetition"
				/>
				<PerformanceView v-else :performance="event" />
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
.month-item {
	font-size: 1.8rem;
	font-weight: var(--font-bold-weight);
	color: var(--colorFont-Op1);
	margin-top: 1.5rem;
	line-height: 1;
}
</style>
