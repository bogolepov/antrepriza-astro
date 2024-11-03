<script setup lang="ts">
import { ref, computed, onBeforeMount, provide, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { type TFirebaseConfig } from '@scripts/db/firebaseConfig';
import { getPlays, getProgram } from '@scripts/db/antreprizaDB';
import LetterSizeControl from './components/LetterSizeControl.vue';

const router = useRouter();
const route = useRoute();

const plays = ref();
const program = ref();

function updatePlays(newPlays) {
	plays.value = newPlays;
}

provide('plays', { plays, updatePlays });
provide('program', program);

const emit = defineEmits<{
	authorize: [isAuthorized: boolean, isDemo?: boolean, firebaseConfig?: TFirebaseConfig];
}>();

onBeforeMount(() => {
	plays.value = getPlays();
	if (route.query.page) {
		router.push('/admin' + route.query.page);
	}
});

onMounted(() => {
	// program.value = getProgram();
});

// import Repetition from './Repetition.vue';

// const routes = { '/': Repetition, '/Repetition': Repetition };
// const currentPath = ref(window.location.hash);
// window.addEventListener('hashchange', () => {
// 	currentPath.value = window.location.hash;
// });

// const currentView = computed(() => {
// 	return routes[currentPath.value.slice(1) || '/'] || NotFound;
// });
//
</script>

<template>
	<div class="admin-page">
		<aside>
			<LetterSizeControl class="letter-size-control" />
			<nav>
				<ul>
					<li><router-link to="/admin/repetitions">Репетиции</router-link></li>
					<li><router-link to="/admin/performances">Выступления</router-link></li>
					<li><router-link to="/admin/visitors">Зрители</router-link></li>
					<li><router-link to="/admin/plays">Спектакли</router-link></li>
				</ul>
			</nav>
			<button @click="$emit('authorize', false)">Выйти</button>
		</aside>
		<main>
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
	flex-direction: column;
	min-width: calc(var(--font-size) * 10);
	padding: 2rem 1rem;
	flex-grow: 1;
}
aside button {
	margin-top: 1.2rem;
	width: 100%;
	line-height: 1;
	padding: 0.15rem 0.3rem;
}
nav ul {
	padding: 1rem 0;
}
main {
	padding: 1rem 1.5rem;
	border-left: 1px solid var(--color-border);
	min-height: max-content;
	flex-grow: 4;
}

.letter-size-control {
	padding-bottom: 1rem;
	border-bottom: 1px solid var(--color-border);
}

.active {
	color: var(--colorAntreprizaRed);
}
</style>
