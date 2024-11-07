<script setup lang="ts">
import { ref, inject, watch, computed, onMounted } from 'vue';
import { onBeforeRouteLeave } from 'vue-router';
import ChapterTitle from '../components/ChapterTitle.vue';
import Performance from '../components/Performance.vue';
import iconCalendar from '../components/iconCalendar.vue';
import { EAuthRole } from '@scripts/auth';
import { ONE_DAY } from '@scripts/consts';
import type { TPerformance, TPlay, TStage, TUniqStatus } from '@scripts/db/baseTypes';
import { validatePerformanceStructure, checkUniqueSIDs, EItemType } from '@scripts/db/baseTypes';
import { savePerformances, changedItems } from '@scripts/db/antreprizaDB';
import IconCalendar from '../components/iconCalendar.vue';

const authRole: EAuthRole = inject('authRole');
const { plays } = inject('plays');
const { stages } = inject('stages');
const { performances, updatePerformances } = inject('performances');
const isActualPerformances = ref(true);

const performancesChanged = ref(false);
const todayDate = ref(new Date().toISOString().split('T')[0]);

const isDemo = computed<boolean>(() => authRole.value === EAuthRole.DEMO);

const listStages = ref([]);
const listPlays = ref([]);

plays.value.forEach((play: TPlay) => listPlays.value.push({ text: play.name.ru, value: play.sid }));

const performancesToShow = computed(() => {
	let list = performances.value;
	if (isActualPerformances.value === true) list = performances.value.filter(item => Date.parse(item.date) + ONE_DAY >= Date.now());
	return [...list].sort((item1, item2) => Date.parse(item1.date + 'T' + item1.time) - Date.parse(item2.date + 'T' + item2.time));
});

function getStageName(stage: TStage) {
	if (stage.fixed) return 'Сцена ' + stage.name.ru.toUpperCase();
	else return stage.name.ru;
}
stages.value.forEach((stage: TStage) => listStages.value.push({ text: getStageName(stage), value: stage.sid }));

let maxId: number = 0;
if (performances.value.length > 0) performances.value.forEach(iPerformance => (maxId = iPerformance.id > maxId ? iPerformance.id : maxId));
const maxPerformanceId = ref(maxId);

function checkPerformancesChanging() {
	if (isDemo.value && performancesChanged.value) performancesChanged.value = false;
	else performancesChanged.value = changedItems<TPerformance>(performances.value, EItemType.PERFORMANCE);
}

function changeListViewMode() {
	isActualPerformances.value = !isActualPerformances.value;
	updateListView();
}

function updateListView() {}

function addPerformance() {
	maxPerformanceId.value++;
	let newPerformance = {} as TPerformance;
	newPerformance = validatePerformanceStructure(newPerformance);
	newPerformance.id = maxPerformanceId.value;
	newPerformance.date = todayDate.value;
	newPerformance.time = '19:30';
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
		let time: string = performances.value[uniqStatus.firstItem].time;
		alert(`Два мероприятия одновременно на одной площадке.\nСцена "${stage}" : ${date} в ${time}`);
		return;
	}
	// save performances in AntreprizaDB
	await savePerformances(performances.value);
	// update performances in provider
	updatePerformances(performances.value);
	// if performances were saved successfully, then button Save will be hidden:
	checkPerformancesChanging();
}

onMounted(() => {
	checkPerformancesChanging();
});

onBeforeRouteLeave((to, from, next) => {
	if (performancesChanged.value === true && confirm('Сохранить изменения?')) {
		savePerformancesDB();
	}
	next();
});
</script>

<template>
	<ChapterTitle title="Выступления" @handle-save-button="savePerformancesDB" :show-save-button="performancesChanged" :is-demo="isDemo">
		<template v-slot:chapter-actions>
			<button @click="changeListViewMode" class="expand-item-button icon-calendar">
				<IconCalendar />
				<div v-show="isActualPerformances" class="icon-calendar-actual">✔️</div>
			</button>
		</template>
	</ChapterTitle>
	<ul>
		<template v-for="performance of performancesToShow" :key="performance.id">
			<li>
				<Performance
					:performance
					:list-plays="listPlays"
					:list-stages="listStages"
					@check-performances-changing="checkPerformancesChanging"
					@delete-performance="deletePerformance"
				/>
			</li>
		</template>
	</ul>
	<button @click="addPerformance" :disabled="isDemo">Добавить выступление</button>
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
	right: 0.1rem;
	font-size: 0.9rem;
	line-height: 1;
	user-select: none;
}
</style>
