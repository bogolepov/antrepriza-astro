<script setup lang="ts">
import { ref, onBeforeMount } from 'vue';
import { onBeforeRouteLeave } from 'vue-router';
import { plays, initPlays, showMenu, smallScreen, isDemo, commitPlays } from '../lib/statesStore';
import PlayCard from './PlayCard.vue';
import ChapterTitle from '../components/ChapterTitle.vue';
import type { TPlay, TUniqStatus } from '@scripts/db/baseTypes';
import { validatePlayStructure, checkUniqueSIDs, EItemType } from '@scripts/db/baseTypes';
import { savePlays, changedItems } from '@scripts/db/antreprizaDB';

const playsChanged = ref(false);
const maxPlayId = ref(1);

function checkPlaysChanging() {
	if (isDemo.value && playsChanged.value) playsChanged.value = false;
	else playsChanged.value = changedItems<TPlay>(plays.value, EItemType.PLAY);
}

function addPlay() {
	maxPlayId.value++;
	let newPlay = {} as TPlay;
	newPlay = validatePlayStructure(newPlay);
	newPlay.name.ru = '...новый спектакль';
	newPlay.id = maxPlayId.value;
	plays.value.push(newPlay);

	checkPlaysChanging();
}
function deletePlay(playId: number) {
	let play: TPlay = plays.value.find(item => item.id === playId);
	if (play && confirm(`Удалить спектакль "${play.name.ru}"?`)) {
		plays.value = plays.value.filter(iPlay => iPlay.id !== play.id);
		checkPlaysChanging();
	}
}

async function savePlaysDB() {
	// check uniq plays SID
	const uniqStatus: TUniqStatus = checkUniqueSIDs<TPlay>(plays.value);
	if (!uniqStatus.isUniq) {
		let play1: string = plays.value[uniqStatus.firstItem].name.ru;
		let play2: string = plays.value[uniqStatus.secondItem].name.ru;
		alert(
			`Текстовый идентификатор каждого спектакля должен быть уникальным.\n` +
				`Идентификатор повторяется у спектаклей "${play1}" и "${play2}"`
		);
		return;
	}
	// save plays in AntreprizaDB
	await savePlays(plays.value, commitPlays);
	// if plays were saved successfully, then button Save will be hidden:
	checkPlaysChanging();
}

async function handleBeforeMount() {
	await initPlays();
	checkPlaysChanging();

	let maxId: number = maxPlayId.value;
	if (plays.value.length > 0) plays.value.forEach(item => (maxId = item.id > maxId ? item.id : maxId));
	maxPlayId.value = maxId;
}
onBeforeMount(handleBeforeMount);

async function handleBeforeRouteLeave(to, from, next) {
	if (playsChanged.value === true && confirm('Сохранить изменения?')) {
		await savePlaysDB();
	}
	if (smallScreen.value) showMenu.value = false;
	next();
}
onBeforeRouteLeave(handleBeforeRouteLeave);
</script>

<template>
	<ChapterTitle title="Спектакли">
		<template v-slot:actions-slot>
			<button v-show="playsChanged" @click="savePlaysDB" :disabled="isDemo" class="save-button">Сохранить</button>
		</template>
	</ChapterTitle>
	<ul>
		<template v-for="play in plays" :key="play.id">
			<li><PlayCard :play @check-plays-changing="checkPlaysChanging" @delete-play="deletePlay" /></li>
		</template>
	</ul>
	<button @click="addPlay" :disabled="isDemo">Добавить спектакль</button>
</template>
