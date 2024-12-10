<script setup lang="ts">
import { ref, computed, onBeforeMount } from 'vue';
import { onBeforeRouteLeave } from 'vue-router';
import { performances, showMenu, smallScreen, isDemo } from '../lib/statesStore';
import { initPerformances } from '../lib/statesStore';
import ChapterTitle from '../components/ChapterTitle.vue';
import Performance from './Performance.vue';
import { ONE_DAY } from '@scripts/consts';
import type { TPerformance, TUniqStatus } from '@scripts/db/baseTypes';
import { validatePerformanceStructure, checkUniqueSIDs, EItemType } from '@scripts/db/baseTypes';
import { savePerformances, changedItems } from '@scripts/db/antreprizaDB';
import IconCalendar from '../components/iconCalendar.vue';

const isActualPerformances = ref(true);
const performancesChanged = ref(false);
const maxPerformanceId = ref(0);
const todayDate = ref(new Date().toISOString().split('T')[0]);

let firstEventsInMonths: TPerformance[];

const performancesToShow = computed(() => {
	let list = performances.value;
	if (isActualPerformances.value === true) {
		list = performances.value.filter(item => Date.parse(item.date) + ONE_DAY >= Date.now());
	}
	list = [...list].sort(
		(item1, item2) => Date.parse(item1.date + 'T' + item1.time_start) - Date.parse(item2.date + 'T' + item2.time_start)
	);
	makeListOfFirstEventsInMonths(list);
	return list;
});

async function handleBeforeMount() {
	await initPerformances();
	checkPerformancesChanging();

	let maxId: number = maxPerformanceId.value;
	if (performances.value.length > 0) performances.value.forEach(item => (maxId = item.id > maxId ? item.id : maxId));
	maxPerformanceId.value = maxId;
}
onBeforeMount(handleBeforeMount);

async function handleBeforeRouteLeave(to, from, next) {
	if (performancesChanged.value === true && confirm('Сохранить изменения?')) {
		await savePerformancesDB();
	}
	if (smallScreen.value) showMenu.value = false;
	next();
}
onBeforeRouteLeave(handleBeforeRouteLeave);

function makeListOfFirstEventsInMonths(list: TPerformance[]) {
	firstEventsInMonths = list.filter((item, index) => {
		if (index === 0) return true;
		return new Date(list[index - 1].date).getMonth() !== new Date(item.date).getMonth();
	});
}

function checkPerformancesChanging() {
	if (isDemo.value && performancesChanged.value) performancesChanged.value = false;
	else performancesChanged.value = changedItems<TPerformance>(performances.value, EItemType.PERFORMANCE);
}

function getMonthName(date: string): string {
	return new Date(date).toLocaleString('ru', { month: 'long' });
}
function isfirstEventInMonth(event: TPerformance): boolean {
	return firstEventsInMonths.findIndex(item => item.sid == event.sid) !== -1;
}

function addPerformance() {
	maxPerformanceId.value++;
	let newPerformance = {} as TPerformance;
	newPerformance = validatePerformanceStructure(newPerformance);
	newPerformance.id = maxPerformanceId.value;
	newPerformance.date = todayDate.value;
	newPerformance.time_start = '19:30';
	performances.value.push(newPerformance);
	checkPerformancesChanging();
}
function deletePerformance(performanceId: number) {
	let performance: TPerformance = performances.value.find(item => item.id === performanceId);
	if (performance && confirm('Удалить представление?')) {
		performances.value = performances.value.filter(iPerformance => iPerformance.id !== performance.id);
		checkPerformancesChanging();
	}
}

async function savePerformancesDB() {
	// check uniq performances SID
	const uniqStatus: TUniqStatus = checkUniqueSIDs<TPerformance>(performances.value);
	if (!uniqStatus.isUniq) {
		let stage: string = '';
		let date: string = performances.value[uniqStatus.firstItem].date;
		let time: string = performances.value[uniqStatus.firstItem].time_start;
		alert(`Два мероприятия одновременно на одной площадке.\nСцена "${stage}" : ${date} в ${time}`);
		return;
	}
	// save performances in AntreprizaDB
	await savePerformances(performances.value);
	// if performances were saved successfully, then button Save will be hidden:
	checkPerformancesChanging();
}
</script>

<template>
	<ChapterTitle title="Выступления">
		<template v-slot:actions-slot>
			<button @click="isActualPerformances = !isActualPerformances" class="expand-item-button icon-calendar">
				<IconCalendar />
				<div v-show="isActualPerformances" class="icon-calendar-actual">✔️</div>
			</button>
			<button v-show="performancesChanged" @click="savePerformancesDB" :disabled="isDemo" class="save-button">Сохранить</button>
		</template>
	</ChapterTitle>
	<ul>
		<li><button @click="addPerformance" :disabled="isDemo">Добавить выступление</button></li>
		<template v-for="performance in performancesToShow" :key="performance.id">
			<li v-show="isfirstEventInMonth(performance)" class="month-item">{{ getMonthName(performance.date).toUpperCase() }}</li>
			<li>
				<Performance :performance @check-performances-changing="checkPerformancesChanging" @delete-performance="deletePerformance" />
			</li>
		</template>
	</ul>
</template>

<style>
.expand-item-button.icon-calendar {
	position: relative;
	font-size: 2rem;
	height: 2rem;
}
.icon-calendar-actual {
	position: absolute;
	bottom: -0.1rem;
	right: -0.1rem;
	font-size: 1.2rem;
	line-height: 1;
	user-select: none;
}
.month-item {
	font-size: 1.8rem;
	font-weight: var(--font-bold-weight);
	color: var(--colorFont-Op1);
	margin-top: 1.5rem;
	line-height: 1;
}
</style>
