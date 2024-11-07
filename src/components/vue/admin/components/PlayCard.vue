<script setup lang="ts">
import { computed, inject, ref } from 'vue';
import { EAuthRole } from '@scripts/auth';
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
const authRole: EAuthRole = inject('authRole');
const isDemo = computed(() => authRole.value === EAuthRole.DEMO);

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
	<div class="item-title" @click="showCard = !showCard">
		<h3>{{ play.name.ru }}</h3>
		<div class="item-title-actions">
			<button class="expand-item-button">
				{{ showCard ? '➖' : '➕' }}
			</button>
		</div>
	</div>
	<ul v-show="showCard" class="item-card">
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
		<li class="modify-item">
			<button @click="modifyPlay" :disabled="isDemo">{{ editCard ? 'OK' : 'Редактировать' }}</button>
			<button @click="deletePlay" :disabled="isDemo">Удалить</button>
		</li>
	</ul>
</template>

<style>
.author-flex {
	display: flex;
	flex-direction: column;
}
.author-flex > div {
	display: flex;
	flex-direction: row;
	flex-wrap: wrap;
}
</style>
