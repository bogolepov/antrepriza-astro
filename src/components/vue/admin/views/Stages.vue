<script setup lang="ts">
import { ref, inject, onMounted } from 'vue';
import { onBeforeRouteLeave } from 'vue-router';
import StageCard from '../components/StageCard.vue';
import type { TStage } from '@scripts/db/baseTypes';
import { validateStageStructure, isUniqueStagesSID, type TUniqStagesResult } from '@scripts/db/baseTypes';
import { saveStages, changedStages } from '@scripts/db/antreprizaDB';

const { stages, updateStages } = inject('stages');

const isDemo: boolean = inject('demo');
const stagesChanged = ref(false);

let maxId: number = 0;
stages.value.forEach(iStage => (maxId = iStage.id > maxId ? iStage.id : maxId));
const maxStageId = ref(maxId);

function checkStagesChanging() {
	if (isDemo.value && stagesChanged.value) stagesChanged.value = false;
	else stagesChanged.value = changedStages(stages.value);
}

function addStage() {
	maxStageId.value++;
	let newStage = {} as TStage;
	newStage = validateStageStructure(newStage);
	newStage.name.ru = '...новая сцена';
	newStage.id = maxStageId.value;
	stages.value.push(newStage);

	checkStagesChanging();
}
function deleteStage(stageId: number) {
	let stage: TStage = stages.value.find(item => item.id === stageId);
	if (stage && confirm(`Удалить сцену "${stage.name.ru}"?`)) {
		stages.value = stages.value.filter(iStage => iStage.id !== stage.id);
		checkStagesChanging();
	}
}

async function saveStagesDB() {
	// check uniq stages SID
	const uniqStagesResult: TUniqStagesResult = isUniqueStagesSID(stages.value);
	if (!uniqStagesResult.isUniq) {
		let stage1: string = stages.value[uniqStagesResult.firstItem].name.ru;
		let stage2: string = stages.value[uniqStagesResult.secondItem].name.ru;
		alert(`Текстовый идентификатор каждой сцены должен быть уникальным.\nИдентификатор повторяется у сцен "${stage1}" и "${stage2}"`);
		return;
	}
	// save stages in AntreprizaDB
	await saveStages(stages.value);
	// update stages in provider
	updateStages(stages.value);
	// if stages were saved successfully, then button Save will be hidden:
	checkStagesChanging();
}

onMounted(() => {
	checkStagesChanging();
});

onBeforeRouteLeave((to, from, next) => {
	if (stagesChanged.value === true && confirm('Сохранить изменения?')) {
		saveStagesDB();
	}
	next();
});
</script>

<template>
	<div class="stages-title">
		<h1>Сцены, площадки</h1>
		<div class="stages-actions">
			<button v-show="stagesChanged" @click="saveStagesDB" :disabled="isDemo" class="save-button">Сохранить</button>
		</div>
	</div>
	<ul>
		<template v-for="stage of stages">
			<li><StageCard :stage @check-stages-changing="checkStagesChanging" @delete-stage="deleteStage" /></li>
		</template>
	</ul>
	<button @click="addStage" :disabled="isDemo">Добавить сцену</button>
</template>

<style scoped>
.stages-title {
	display: flex;
	flex-direction: row;
	justify-content: space-between;
	flex-wrap: wrap;
	column-gap: 1.5rem;
	row-gap: 0.1rem;
}
.stages-actions {
	display: grid;
	place-items: center;
}
ul {
	margin-top: 1rem;
}
button {
	padding: 0 0.6rem;
	margin-top: 1rem;
}
.stages-actions button {
	margin-top: 0;
}
.save-button {
	background-color: transparent;
	font-size: 1.1em;
	font-weight: 400;
	color: var(--colorAntreprizaRed);
	border: 1px solid var(--colorAntreprizaRed);
	cursor: pointer;
}
</style>
