<script setup lang="ts">
import { ref, onBeforeMount } from 'vue';
import { onBeforeRouteLeave } from 'vue-router';
import { stages, initStages, showMenu, smallScreen, isDemo, commitStages } from '../store/statesStore';
import StageCard from '../components/StageCard.vue';
import ChapterTitle from '../components/ChapterTitle.vue';
import type { TStage, TUniqStatus } from '@scripts/db/baseTypes';
import { validateStageStructure, checkUniqueSIDs, EItemType } from '@scripts/db/baseTypes';
import { saveStages, changedItems } from '@scripts/db/antreprizaDB';

const stagesChanged = ref(false);
const maxStageId = ref(1);

function checkStagesChanging() {
	if (isDemo.value && stagesChanged.value) stagesChanged.value = false;
	else stagesChanged.value = changedItems<TStage>(stages.value, EItemType.STAGE);
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
	const uniqStatus: TUniqStatus = checkUniqueSIDs<TStage>(stages.value);
	if (!uniqStatus.isUniq) {
		let stage1: string = stages.value[uniqStatus.firstItem].name.ru;
		let stage2: string = stages.value[uniqStatus.secondItem].name.ru;
		alert(`Текстовый идентификатор каждой сцены должен быть уникальным.\nИдентификатор повторяется у сцен "${stage1}" и "${stage2}"`);
		return;
	}
	// save stages in AntreprizaDB
	await saveStages(stages.value, commitStages);
	// if stages were saved successfully, then button Save will be hidden:
	checkStagesChanging();
}

async function handleBeforeMount() {
	await initStages();
	checkStagesChanging();

	let maxId: number = maxStageId.value;
	if (stages.value.length > 0) stages.value.forEach(item => (maxId = item.id > maxId ? item.id : maxId));
	maxStageId.value = maxId;
}
onBeforeMount(handleBeforeMount);

async function handleBeforeRouteLeave(to, from, next) {
	if (stagesChanged.value === true && confirm('Сохранить изменения?')) {
		await saveStagesDB();
	}
	if (smallScreen.value) showMenu.value = false;
	next();
}
onBeforeRouteLeave(handleBeforeRouteLeave);
</script>

<template>
	<ChapterTitle title="Сцены, площадки" @handle-save-button="saveStagesDB" :show-save-button="stagesChanged" />
	<ul>
		<template v-for="stage of stages" :key="stage.id">
			<li><StageCard :stage @check-stages-changing="checkStagesChanging" @delete-stage="deleteStage" /></li>
		</template>
	</ul>
	<button @click="addStage" :disabled="isDemo">Добавить сцену</button>
</template>
