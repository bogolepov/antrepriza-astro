<script setup lang="ts">
import { ref, computed, onBeforeMount, provide, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { type TFirebaseConfig } from '@scripts/db/firebaseConfig';
import { getPlays, getStages, getProgram } from '@scripts/db/antreprizaDB';
import LetterSizeControl from './components/LetterSizeControl.vue';

const router = useRouter();
const route = useRoute();

const plays = ref();
const stages = ref();
const program = ref();

const fontSize = ref();
const smallScreen = ref(false);
const showMenu = ref(true);

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

function updateFontSize(newFontSize) {
	fontSize.value = newFontSize;
	updatePageComposition();
}

function updatePlays(newPlays) {
	plays.value = newPlays;
}
function updateStages(newStages) {
	stages.value = newStages;
}

provide('plays', { plays, updatePlays });
provide('stages', { stages, updateStages });
provide('program', program);
provide('font-size', { updateFontSize });

const emit = defineEmits<{
	authorize: [isAuthorized: boolean, isDemo?: boolean, firebaseConfig?: TFirebaseConfig];
}>();

window.addEventListener('resize', updatePageComposition);

onBeforeMount(() => {
	plays.value = getPlays();
	stages.value = getStages();
	if (route.query.page) {
		router.push('/admin' + route.query.page);
	}
});

onMounted(() => {
	// program.value = getProgram();
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
					<li><router-link to="/admin/visitors">Зрители</router-link></li>
				</ul>
			</nav>
			<button class="logout-button" @click="$emit('authorize', false)">Выйти</button>
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
.open-menu-button {
	position: absolute;
	top: 0;
	left: 0;
	padding: 0 0.75rem;
	background-color: transparent;
	border: 0;
	border-right: 1px solid var(--color-border);
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

.letter-size-control {
	padding-bottom: 1rem;
	border-bottom: 1px solid var(--color-border);
}

.active {
	color: var(--colorAntreprizaRed);
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
</style>
