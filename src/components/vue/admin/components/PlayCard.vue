<script setup lang="ts">
import { inject, ref } from 'vue';
import type { TPlay } from '@scripts/db/baseTypes';
import MultiLangText from './MultiLangText.vue';

interface Props {
	play: TPlay;
}
const { play } = defineProps<Props>();
const emit = defineEmits(['checkPlaysChanging', 'deletePlay']);

// const props = defineProps({
// 	play_sid: String,
// });

// const play: TPlay = plays.value.find(item => item.sid === props.play_sid);
const isDemo: boolean = inject('demo');

const showCard = ref(false);
const editCard = ref(false);

function modifyPlay() {
	const wasEditMode = editCard.value;
	editCard.value = !editCard.value;
	if (wasEditMode) {
		emit('checkPlaysChanging');
	}
}
function deletePlay() {
	emit('deletePlay', play.id);
}
</script>

<template>
	<div class="play-title" @click="showCard = !showCard">
		<h3>{{ play.name.ru }}</h3>
		<div class="play-actions">
			<button>
				{{ showCard ? '➖' : '➕' }}
			</button>
		</div>
	</div>
	<ul v-show="showCard" class="play-card">
		<li>
			<div class="label">Текстовый идентификатор:</div>
			<div v-if="!editCard">{{ play.sid ? play.sid : ' - ' }}</div>
			<input v-else type="text" v-model="play.sid" maxlength="4" />
		</li>
		<li>
			<div class="label">Название:</div>
			<MultiLangText :multiText="play.name" :isEdit="editCard" />
		</li>
		<li>
			<div class="label" style="width: 100%">Автор:</div>
			<div class="author-flex">
				<div>
					<div class="label">Имя:</div>
					<MultiLangText :multiText="play.author.firstname" :isEdit="editCard" />
				</div>
				<div>
					<div class="label">Сокращенное имя:</div>
					<MultiLangText :multiText="play.author.firstname_short" :isEdit="editCard" />
				</div>
				<div>
					<div class="label">Фамилия:</div>
					<MultiLangText :multiText="play.author.surname" :isEdit="editCard" />
				</div>
			</div>
		</li>
		<li>
			<div class="label">Жанр:</div>
			<MultiLangText :multiText="play.genre" :isEdit="editCard" />
		</li>
		<li>
			<div class="label">Возрастные ограничения:</div>
			<div v-if="!editCard">{{ play.age ? play.age : ' - ' }}</div>
			<input v-else type="text" v-model="play.age" />
		</li>
		<li>
			<div class="label">Язык:</div>
			<MultiLangText :multiText="play.language" :isEdit="editCard" />
		</li>
		<li>
			<div class="label">Продолжительность (мин.):</div>
			<div v-if="!editCard">{{ play.duration ? play.duration : ' - ' }}</div>
			<input v-else type="number" v-model="play.duration" />
		</li>
		<li>
			<div class="label">Количество антрактов:</div>
			<div v-if="!editCard">{{ play.break >= 0 ? play.break : ' - ' }}</div>
			<input v-else type="number" v-model="play.break" />
		</li>
		<li class="play-modify">
			<button @click="modifyPlay" :disabled="isDemo">{{ editCard ? 'OK' : 'Редактировать' }}</button>
			<button @click="deletePlay" :disabled="isDemo">Удалить</button>
		</li>
	</ul>
</template>

<style>
h3 {
	font-size: 1.75em;
	line-height: 1.15;
}
.play-title {
	display: flex;
	flex-direction: row;
	justify-content: space-between;
	user-select: none;
	cursor: pointer;
	margin-top: 0.6rem;
}
.play-actions {
	display: grid;
	place-items: center;
}
.play-actions button {
	line-height: 1;
	background-color: transparent;
	border: 0;
	cursor: pointer;
	width: 1.8rem;
	height: 1.8rem;
}

.play-card {
	/* width: 100%; */
	background-color: var(--grey-120);
	border-radius: 6px;
	margin: 0.3rem 0 0.6rem 1rem;
	padding: 0.6rem 1rem;
}
.play-card > li {
	display: flex;
	flex-direction: row;
	flex-wrap: wrap;
	/* column-gap: 0.7rem; */
}
.author-flex {
	display: flex;
	flex-direction: column;
	/* padding-left: 1.5rem; */
}
.author-flex > div {
	display: flex;
	flex-direction: row;
	flex-wrap: wrap;

	/* column-gap: 0.7rem; */
}

.label {
	color: var(--colorFont-Op1);
	font-weight: 400;
}
.label + * {
	margin-left: 1rem;
}
.label + input {
	line-height: 1;
	margin-bottom: 0.4rem;
}

.play-modify {
	display: flex;
	flex-direction: row;
	/* align-items: center; */
	justify-items: flex-end;
	margin-top: 0.5rem;
	column-gap: 0.7rem;
	row-gap: 0.5rem;
}
.play-modify button {
	background-color: transparent;
	padding: 0 0.6rem;
	border: 1px solid var(--colorFont);
	cursor: pointer;
}
</style>
