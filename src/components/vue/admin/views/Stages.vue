<script setup lang="ts">
import { ref, inject, computed, onMounted } from 'vue';
import { onBeforeRouteLeave } from 'vue-router';
import StageCard from '../components/StageCard.vue';
import ChapterTitle from '../components/ChapterTitle.vue';
import { EAuthRole } from '@scripts/auth';
import type { TStage, TUniqStatus } from '@scripts/db/baseTypes';
import { validateStageStructure, checkUniqueSIDs, EItemType } from '@scripts/db/baseTypes';
import { saveStages, changedItems } from '@scripts/db/antreprizaDB';

const { stages, updateStages } = inject('stages');

const authRole: EAuthRole = inject('authRole');
const isDemo = computed(() => authRole.value === EAuthRole.DEMO);

const stagesChanged = ref(false);

let maxId: number = 0;
stages.value.forEach(iStage => (maxId = iStage.id > maxId ? iStage.id : maxId));
const maxStageId = ref(maxId);

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
	<ChapterTitle title="Сцены, площадки" @handle-save-button="saveStagesDB" :show-save-button="stagesChanged" :is-demo="isDemo" />
	<ul>
		<template v-for="stage of stages" :key="stage.id">
			<li><StageCard :stage @check-stages-changing="checkStagesChanging" @delete-stage="deleteStage" /></li>
		</template>
	</ul>
	<button @click="addStage" :disabled="isDemo">Добавить сцену</button>
</template>
