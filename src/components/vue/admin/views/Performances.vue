<script setup lang="ts">
import { ref, inject, computed, onMounted } from 'vue';
import { onBeforeRouteLeave } from 'vue-router';
import ChapterTitle from '../components/ChapterTitle.vue';
import Performance from '../components/Performance.vue';
import { EAuthRole } from '@scripts/auth';
import type { TPerformance, TUniqStatus } from '@scripts/db/baseTypes';
import { validatePerformanceStructure, checkUniqueSIDs, EItemType } from '@scripts/db/baseTypes';
import { savePerformances, changedItems } from '@scripts/db/antreprizaDB';

const { performances, updatePerformances } = inject('performances');

const authRole: EAuthRole = inject('authRole');
const isDemo = computed(() => authRole.value === EAuthRole.DEMO);

const performancesChanged = ref(false);

let maxId: number = 0;
if (performances.value.length > 0) performances.value.forEach(iPerformance => (maxId = iPerformance.id > maxId ? iPerformance.id : maxId));
const maxPerformanceId = ref(maxId);

function checkPerformancesChanging() {
	if (isDemo.value && performancesChanged.value) performancesChanged.value = false;
	else performancesChanged.value = changedItems<TPerformance>(performances.value, EItemType.PERFORMANCE);
}

function addPerformance() {
	maxPerformanceId.value++;
	let newPerformance = {} as TPerformance;
	newPerformance = validatePerformanceStructure(newPerformance);
	newPerformance.id = maxPerformanceId.value;
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
	<ChapterTitle title="Выступления" @handle-save-button="savePerformancesDB" :show-save-button="performancesChanged" :is-demo="isDemo" />
	<ul>
		<template v-for="performance of performances">
			<li><Performance :performance @check-performance-changing="checkPerformancesChanging" @delete-performance="deletePerformance" /></li>
		</template>
	</ul>
	<button @click="addPerformance" :disabled="isDemo">Добавить выступление</button>
</template>
