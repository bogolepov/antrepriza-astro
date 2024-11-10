<script setup lang="ts">
import { ref, inject, computed, onMounted } from 'vue';
import { onBeforeRouteLeave } from 'vue-router';
import { showMenu, smallScreen, isDemo } from '../statesStore';
import ChapterTitle from '../components/ChapterTitle.vue';
import Repetition from '../components/Repetition.vue';
import PerformanceView from '../components/PerformanceView.vue';
import { ONE_DAY } from '@scripts/consts';
import type { TRepetition, TPerformance, TPlay, TStage, TUniqStatus } from '@scripts/db/baseTypes';
import { validateRepetitionStructure, checkUniqueSIDs, EItemType } from '@scripts/db/baseTypes';
import { saveRepetitions, changedItems } from '@scripts/db/antreprizaDB';
import IconCalendar from '../components/iconCalendar.vue';
import IconWhatsapp from '../components/iconWhatsapp.vue';

const { plays } = inject('plays');
const { stages } = inject('stages');
const { performances } = inject('performances');
const { repetitions, updateRepetitions } = inject('repetitions');
const isActualEvents = ref(true);
const showPerformances = ref(false);
const whatsappMode = ref(false);

const repetitionsChanged = ref(false);
const whatsappMessageChanged = ref(false);

const todayDate = ref(new Date().toISOString().split('T')[0]);

const listStages = ref([]);
const listPlays = ref([]);

plays.value.forEach((play: TPlay) => listPlays.value.push({ text: play.name.ru, value: play.sid }));

let firstEventsInMonths: Array<TPerformance | TRepetition>;

const eventsToShow = computed(() => {
	let listPerformances = showPerformances.value ? performances.value : [];
	if (isActualEvents.value === true) {
		listPerformances = listPerformances.filter(item => Date.parse(item.date) + ONE_DAY >= Date.now());
	}

	let listRepetitions = repetitions.value;
	if (isActualEvents.value === true) {
		listRepetitions = repetitions.value.filter(item => Date.parse(item.date) + ONE_DAY >= Date.now());
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

function getStageName(stage: TStage) {
	if (stage.fixed) return 'Сцена ' + stage.name.ru.toUpperCase();
	else return stage.name.ru;
}
stages.value.forEach((stage: TStage) => listStages.value.push({ text: getStageName(stage), value: stage.sid }));

let maxId: number = 1000;
if (repetitions.value.length > 0) repetitions.value.forEach(iItem => (maxId = iItem.id > maxId ? iItem.id : maxId));
const maxRepetitionId = ref(maxId);

function checkRepetitionsChanging() {
	if (isDemo.value && repetitionsChanged.value) repetitionsChanged.value = false;
	else {
		repetitionsChanged.value = changedItems<TRepetition>(repetitions.value, EItemType.REPETITION);
	}
}

function checkWhatsappMessageChanging() {
	// TODO:
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
	// update repetitions in provider
	updateRepetitions(repetitions.value);
	// if repetitions were saved successfully, then button Save will be hidden:
	checkRepetitionsChanging();
}

async function saveWhatsappMessageDB() {
	console.log('save whatsapp!');
	// // check uniq repetition SID
	// const uniqStatus: TUniqStatus = checkUniqueSIDs<TRepetition>(repetitions.value);
	// if (!uniqStatus.isUniq) {
	// 	let stage: string = '';
	// 	let date: string = repetitions.value[uniqStatus.firstItem].date;
	// 	let time: string = repetitions.value[uniqStatus.firstItem].time_start;
	// 	alert(`Две репетиции одновременно на одной площадке.\nСцена "${stage}" : ${date} в ${time}`);
	// 	return;
	// }
	// // save repetitions in AntreprizaDB
	// await saveRepetitions(repetitions.value);
	// // update repetitions in provider
	// updateRepetitions(repetitions.value);
	// // if repetitions were saved successfully, then button Save will be hidden:
	// checkRepetitionsChanging();
}

const showSaveButton = computed(() => {
	if (!whatsappMode.value && repetitionsChanged.value) return true;
	if (whatsappMode.value && whatsappMessageChanged.value) return true;
	return false;
});

function handleSaveButton() {
	if (!whatsappMode.value) saveRepetitionsDB();
	if (whatsappMode.value) saveWhatsappMessageDB();
}

onMounted(() => {
	checkRepetitionsChanging();
});

onBeforeRouteLeave((to, from, next) => {
	if (repetitionsChanged.value === true && confirm('Сохранить изменения?')) {
		saveRepetitionsDB();
	}
	if (whatsappMessageChanged.value === true && confirm('Сохранить изменения?')) {
		saveWhatsappMessageDB();
	}
	if (smallScreen.value) showMenu.value = false;
	next();
});
// whatsappMode ? saveWhatsappMessageDB :
// whatsappMode ? whatsappMessageChanged :
</script>

<template>
	<ChapterTitle title="Репетиции" @handle-save-button="handleSaveButton" :show-save-button="showSaveButton">
		<template v-slot:chapter-actions>
			<button @click="isActualEvents = !isActualEvents" class="expand-item-button icon-calendar">
				<IconCalendar />
				<div v-show="isActualEvents" class="icon-active">✔️</div>
			</button>
			<button @click="showPerformances = !showPerformances" class="expand-item-button icon-calendar">
				<div>🎭</div>
				<div v-show="showPerformances" class="icon-active">✔️</div>
			</button>
			<button v-show="!showSaveButton" @click="whatsappMode = !whatsappMode" class="expand-item-button icon-calendar">
				<IconWhatsapp />
				<div v-show="whatsappMode" class="icon-active">✔️</div>
			</button>
		</template>
	</ChapterTitle>
	<template v-if="!whatsappMode">
		<ul>
			<li><button @click="addRepetition" :disabled="isDemo">Добавить репетицию</button></li>
			<template v-for="event of eventsToShow" :key="event.id">
				<li v-show="isfirstEventInMonth(event)" class="month-item">{{ getMonthName(event.date).toUpperCase() }}</li>
				<li>
					<Repetition
						v-if="event.subRepetitions"
						:repetition="event"
						:list-plays="listPlays"
						:list-stages="listStages"
						@check-repetitions-changing="checkRepetitionsChanging"
						@delete-repetition="deleteRepetition"
					/>
					<PerformanceView v-else :performance="event" :list-plays="listPlays" :list-stages="listStages" />
				</li>
			</template>
		</ul>
	</template>
	<template v-else>
		<ul></ul>
	</template>
</template>

<style>
.expand-item-button.icon-calendar {
	position: relative;
	font-size: 2rem;
	height: 2rem;
	padding: 0 0.2rem;
}
.icon-active {
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
	/* text-align: center; */
}
</style>
