<script setup lang="ts">
import { ref, inject, onMounted } from 'vue';
import PlayCard from '../components/PlayCard.vue';
import type { TPlay } from '@scripts/db/baseTypes';
import { validatePlayStructure } from '@scripts/db/baseTypes';
import { savePlays, changedPlays } from '@scripts/db/antreprizaDB';

// const plays = inject('plays');
const { plays, updatePlays } = inject('plays');

const isDemo: boolean = inject('demo');
const playsChanged = ref(false);

let maxId: number = 0;
plays.value.forEach(iPlay => (maxId = iPlay.id > maxId ? iPlay.id : maxId));
const maxPlayId = ref(maxId);

function checkPlaysChanging() {
	if (isDemo.value && playsChanged.value) playsChanged.value = false;
	else playsChanged.value = changedPlays(plays.value);
}

function addPlay() {
	maxPlayId.value++;
	let newPlay = {} as TPlay;
	newPlay = validatePlayStructure(newPlay);
	newPlay.name.ru = '...новый спектакль';
	newPlay.id = maxPlayId.value;
	plays.value.push(validatePlayStructure(newPlay));

	checkPlaysChanging();
}
function deletePlay(playId: number) {
	let play: TPlay = plays.value.find(item => item.id === playId);
	if (play && confirm(`Удалить спектакль "${play.name.ru}"?`)) {
		plays.value = plays.value.filter(iPlay => iPlay.id !== play.id);
		checkPlaysChanging();
	}
}

function savePlaysDB() {
	// save plays in AntreprizaDB
	savePlays(plays.value);
	// update plays in provider
	updatePlays(plays.value);
	// if plays were saved successfully, then button Save will be hidden:
	checkPlaysChanging();
}

onMounted(() => {
	checkPlaysChanging();
});
</script>

<template>
	<div class="plays-title">
		<h1>Спектакли</h1>
		<div class="plays-actions">
			<button v-show="playsChanged" @click="savePlaysDB" :disabled="isDemo" class="save-button">Сохранить</button>
		</div>
	</div>
	<ul>
		<template v-for="play of plays">
			<li><PlayCard :play @check-plays-changing="checkPlaysChanging" @delete-play="deletePlay" /></li>
		</template>
	</ul>
	<button @click="addPlay" :disabled="isDemo">Добавить спектакль</button>
</template>

<style scoped>
.plays-title {
	display: flex;
	flex-direction: row;
	justify-content: space-between;
}
.plays-actions {
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
}
</style>
