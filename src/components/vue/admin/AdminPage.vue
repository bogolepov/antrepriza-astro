<script setup lang="ts">
import { ref, onBeforeMount, provide } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { showMenu, smallScreen } from './statesStore';
import { EAuthRole } from '@scripts/auth';
import { type TFirebaseConfig } from '@scripts/db/firebaseConfig';
import { getPlays, getStages, getPerformances, getRepetitions } from '@scripts/db/antreprizaDB';
import LetterSizeControl from './components/LetterSizeControl.vue';
import type { TPlay, TStage, TPerformance, TRepetition } from '@scripts/db/baseTypes';

const router = useRouter();
const route = useRoute();

const plays = ref<Array<TPlay>>([]);
const stages = ref<Array<TStage>>([]);
const performances = ref<Array<TPerformance>>([]);
const repetitions = ref<Array<TRepetition>>([]);

const fontSize = ref();

function updatePageComposition() {
	let desktopWidth: number = 16 * 31;
	if (fontSize.value === '19px') desktopWidth = 19 * 32;
	else if (fontSize.value === '22px') desktopWidth = 22 * 33;

	// small screen
	if (document.documentElement.clientWidth < desktopWidth) {
		if (smallScreen.value === false) {
			smallScreen.value = true;
			showMenu.value = false;
		}
	}
	// big screen
	else {
		if (smallScreen.value === true) {
			smallScreen.value = false;
			showMenu.value = true;
		}
	}
}

function updateFontSize(newFontSize: string) {
	fontSize.value = newFontSize;
	updatePageComposition();
}

function updatePlays(newPlays: TPlay[]) {
	plays.value = newPlays;
}
function updateStages(newStages: TStage[]) {
	stages.value = newStages;
}
function updatePerformances(newPerformances: TPerformance[]) {
	performances.value = newPerformances;
}
function updateRepetitions(newRepetitions: TRepetition[]) {
	repetitions.value = newRepetitions;
}

provide('plays', { plays, updatePlays });
provide('stages', { stages, updateStages });
provide('performances', { performances, updatePerformances });
provide('repetitions', { repetitions, updateRepetitions });
provide('font-size', { updateFontSize });

const emit = defineEmits<{
	authorize: [role: EAuthRole, firebaseConfig?: TFirebaseConfig];
}>();

window.addEventListener('resize', updatePageComposition);

onBeforeMount(() => {
	plays.value = getPlays();
	stages.value = getStages();
	performances.value = getPerformances();
	repetitions.value = getRepetitions();
	if (route.query.page) {
		router.push('/admin' + route.query.page);
	}
});
</script>

<template>
	<div class="admin-page" :class="{ 'small-screen': smallScreen }">
		<aside v-show="showMenu">
			<button v-show="smallScreen" @click="showMenu = false" class="close-menu-button">⇚</button>
			<LetterSizeControl class="letter-size-control" />
			<nav>
				<ul>
					<li><router-link to="/admin/repetitions">Репетиции</router-link></li>
					<li><router-link to="/admin/performances">Выступления</router-link></li>
					<li><router-link to="/admin/plays">Спектакли</router-link></li>
					<li><router-link to="/admin/stages">Сцены</router-link></li>
					<li><router-link to="/admin/tickets">Бронирования</router-link></li>
				</ul>
			</nav>
			<button class="logout-button" @click="$emit('authorize', EAuthRole.UNAUTHORIZED, undefined)">Выйти</button>
		</aside>
		<main>
			<button v-show="smallScreen" @click="showMenu = true" class="open-menu-button">⇛</button>
			<RouterView />
		</main>
	</div>
</template>

<style>
h1 {
	font-size: 2.25em;
}
.admin-page {
	--color-border: var(--grey-46);
	display: flex;
	height: 100%;
}
aside {
	display: flex;
	position: relative;
	flex-direction: column;
	min-width: calc(var(--font-size) * 10);
	padding: 2rem 1rem;
	z-index: 5;
}
.close-menu-button {
	position: absolute;
	top: 0;
	right: 0;
	padding: 0 0.75rem;
	background-color: transparent;
	border: 0;
	border-left: 1px solid var(--color-border);
	font-size: 1.25em;
	user-select: none;
	cursor: pointer;
}
.logout-button {
	margin-top: 1.2rem;
	width: 100%;
	line-height: 1;
	padding: 0.15rem 0.3rem;
}
nav ul {
	padding: 1rem 0;
}

main {
	position: relative;
	padding: 1rem 1.5rem;
	border-left: 1px solid var(--color-border);
	min-height: max-content;
	flex-grow: 1;
}
main button {
	padding: 0 0.6rem;
	margin-top: 1rem;
	cursor: pointer;
}
main button[disabled] {
	cursor: auto;
}
main > ul {
	margin-top: 0.65rem;
	padding-top: 0.5rem;
	border-top: 4px double var(--color-border);
}

.open-menu-button {
	position: absolute;
	top: 0;
	left: 0;
	padding: 0 0.75rem;
	margin: 0;
	background-color: transparent;
	border: 0;
	border-right: 1px solid var(--color-border);
	font-size: 1.25em;
	user-select: none;
	cursor: pointer;
}

.letter-size-control {
	padding-bottom: 1rem;
	border-bottom: 1px solid var(--color-border);
}

.active {
	color: var(--colorAntreprizaRed);
}

.expand-item-button {
	margin: 0;
	line-height: 1;
	background-color: transparent;
	border: 0;
	cursor: pointer;
	height: 1.8rem;
	user-select: none;
}

.small-screen aside {
	position: fixed;
	background-color: var(--grey-140);
	min-height: 100%;
	border-right: 3px solid var(--color-border);
	left: 0;
	top: 0;
	padding-top: 2.2rem;
}
.small-screen main {
	border-left: 0;
	padding-top: 2.2rem;
}

.modify-item {
	display: flex;
	flex-direction: row;
	justify-items: flex-end;
	margin-top: 0.5rem;
	column-gap: 0.7rem;
	row-gap: 0.5rem;
}
.modify-item button {
	background-color: transparent;
	padding: 0 0.6rem;
	margin-top: 0;
	border: 1px solid var(--colorFont);
}

/* ------------ ITEM TITLE ----------- */
.item-title {
	display: flex;
	flex-direction: row;
	justify-content: space-between;
	/* user-select: none; */
	cursor: pointer;
	margin-top: 0.35rem;
}
.item-title h3 {
	font-size: 1.4em;
	line-height: 1.15;
}
.item-title-actions {
	display: grid;
	place-items: center;
}
/* ------------- ITEM CARD ------------ */
.item-card {
	background-color: var(--grey-120);
	border-radius: 6px;
	margin: 0.3rem 0 0.6rem 1rem;
	padding: 0.6rem 1rem;
}
.item-card > li {
	display: flex;
	flex-direction: row;
	flex-wrap: wrap;
}

.item-card .label {
	color: var(--colorFont-Op1);
	font-weight: 400;
}
.item-card .label + * {
	margin-left: 1rem;
}
.item-card .label + input,
.item-card .label + select {
	line-height: 1;
	margin-bottom: 0.4rem;
}

.item-card .list-select {
	min-width: 6rem;
	padding-right: 1rem;
}
</style>
