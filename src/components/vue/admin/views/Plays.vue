<script setup lang="ts">
import { ref, inject, computed, onMounted } from 'vue';
import { onBeforeRouteLeave } from 'vue-router';
import PlayCard from '../components/PlayCard.vue';
import ChapterTitle from '../components/ChapterTitle.vue';
import { EAuthRole } from '@scripts/auth';
import type { TPlay, TUniqStatus } from '@scripts/db/baseTypes';
import { validatePlayStructure, checkUniqueSIDs, EItemType } from '@scripts/db/baseTypes';
import { savePlays, changedItems } from '@scripts/db/antreprizaDB';

// const plays = inject('plays');
const { plays, updatePlays } = inject('plays');

// const isDemo: boolean = inject('demo');
const authRole: EAuthRole = inject('authRole');
const isDemo = computed(() => authRole.value === EAuthRole.DEMO);

const playsChanged = ref(false);

let maxId: number = 0;
plays.value.forEach(iPlay => (maxId = iPlay.id > maxId ? iPlay.id : maxId));
const maxPlayId = ref(maxId);

function checkPlaysChanging() {
	if (isDemo.value && playsChanged.value) playsChanged.value = false;
	else playsChanged.value = changedItems<TPlay>(plays.value, EItemType.PLAY);
	// else playsChanged.value = changedPlays(plays.value);
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
	await savePlays(plays.value);
	// update plays in provider
	updatePlays(plays.value);
	// if plays were saved successfully, then button Save will be hidden:
	checkPlaysChanging();
}

onMounted(() => {
	checkPlaysChanging();
});

onBeforeRouteLeave((to, from, next) => {
	if (playsChanged.value === true && confirm('Сохранить изменения?')) {
		savePlaysDB();
	}
	next();
});
</script>

<template>
	<ChapterTitle title="Спектакли" @handle-save-button="savePlaysDB" :show-save-button="playsChanged" :is-demo="isDemo" />
	<!-- <div class="plays-title">
		<h1>Спектакли</h1>
		<div class="plays-actions">
			<button v-show="playsChanged" @click="savePlaysDB" :disabled="isDemo" class="save-button">Сохранить</button>
		</div>
	</div> -->
	<ul>
		<template v-for="play of plays">
			<li><PlayCard :play @check-plays-changing="checkPlaysChanging" @delete-play="deletePlay" /></li>
		</template>
	</ul>
	<button @click="addPlay" :disabled="isDemo">Добавить спектакль</button>
</template>

<style scoped>
/* .plays-title {
	display: flex;
	flex-direction: row;
	justify-content: space-between;
	flex-wrap: wrap;
	column-gap: 1.5rem;
	row-gap: 0.1rem;
}
.plays-actions {
	display: grid;
	place-items: center;
}

.plays-actions button {
	margin-top: 0;
}
.save-button {
	background-color: transparent;
	font-size: 1.1em;
	font-weight: 400;
	color: var(--colorAntreprizaRed);
	border: 1px solid var(--colorAntreprizaRed);
	cursor: pointer;
} */
</style>
