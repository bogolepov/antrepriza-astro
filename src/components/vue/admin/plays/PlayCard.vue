<script setup lang="ts">
import { ref } from 'vue';
import MultiLangText from '../components/MultiLangText.vue';
import type { IPlayJson } from '@scripts/adminpanel/types/json-files';

interface Props {
	play: IPlayJson;
}
const { play } = defineProps<Props>();

const showCard = ref(false);
</script>

<template>
	<div class="item-title" @click="showCard = !showCard">
		<h3>{{ play.title.ru }}</h3>
	</div>
	<ul v-show="showCard" class="item-card">
		<li>
			<div class="label">Текстовый идентификатор:</div>
			<div>{{ play.suffix ? play.suffix : ' - ' }}</div>
		</li>
		<li>
			<div class="label">Название:</div>
			<MultiLangText :multiText="play.title" :isEdit="false" />
		</li>
		<li>
			<div class="label" style="width: 100%">Автор:</div>
			<div class="author-flex">
				<div>
					<div class="label">Полное имя:</div>
					<MultiLangText :multiText="play.author" :isEdit="false" />
				</div>
				<div>
					<div class="label">Сокращенное имя:</div>
					<MultiLangText :multiText="play.author_full" :isEdit="false" />
				</div>
			</div>
		</li>
		<li>
			<div class="label">Жанр:</div>
			<MultiLangText :multiText="play.genre" :isEdit="false" />
		</li>
		<li>
			<div class="label">Возрастные ограничения:</div>
			<div>{{ play.age ? play.age : ' - ' }}</div>
		</li>
		<li>
			<div class="label">Язык:</div>
			<MultiLangText :multiText="play.lang" :isEdit="false" />
		</li>
		<li>
			<div class="label">Продолжительность (мин.):</div>
			<div>{{ play.length ? play.length : ' - ' }}</div>
		</li>
		<li>
			<div class="label">Количество антрактов:</div>
			<div>{{ play.break ? 'да' : 'нет' }}</div>
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
