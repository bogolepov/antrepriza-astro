<script setup lang="ts">
import { inject, ref } from 'vue';
import type { TStage } from '@scripts/db/baseTypes';
import MultiLangText from './MultiLangText.vue';

interface Props {
	stage: TStage;
}
const { stage } = defineProps<Props>();
const emit = defineEmits(['checkStagesChanging', 'deleteStage']);

const isDemo: boolean = inject('demo');

const showCard = ref(false);
const editCard = ref(false);

const fixedStageOptions = ref([
	{ text: 'нет', value: false },
	{ text: 'да', value: true },
]);

function modifyStage() {
	const wasEditMode = editCard.value;
	editCard.value = !editCard.value;
	if (wasEditMode) {
		emit('checkStagesChanging');
	}
}
function deleteStage() {
	emit('deleteStage', stage.id);
}
</script>

<template>
	<div class="stage-title" @click="showCard = !showCard">
		<h3>Сцена {{ stage.name.ru.toUpperCase() }}</h3>
		<div class="stage-actions">
			<button>
				{{ showCard ? '➖' : '➕' }}
			</button>
		</div>
	</div>
	<ul v-show="showCard" class="stage-card">
		<li>
			<div class="label">Текстовый идентификатор:</div>
			<div v-if="!editCard">{{ stage.sid ? stage.sid : ' - ' }}</div>
			<input v-else type="text" v-model="stage.sid" maxlength="10" />
		</li>
		<li>
			<div class="label">Название:</div>
			<MultiLangText :multiText="stage.name" :isEdit="editCard" />
		</li>
		<li>
			<div class="label">Постоянная сцена:</div>
			<div v-if="!editCard">{{ stage.fixed ? 'да' : 'нет' }}</div>
			<select v-else v-model="stage.fixed" class="fixed-select">
				<option v-for="option in fixedStageOptions" :value="option.value">
					{{ option.text }}
				</option>
			</select>
		</li>
		<li>
			<div class="label" style="width: 100%">Адрес:</div>
			<div class="address-flex">
				<div>
					<div class="label">Улица:</div>
					<div v-if="!editCard">{{ stage.address.street ? stage.address.street : ' - ' }}</div>
					<input v-else type="text" v-model="stage.address.street" />
				</div>
				<div>
					<div class="label">Дом:</div>
					<div v-if="!editCard">{{ stage.address.building ? stage.address.building : ' - ' }}</div>
					<input v-else type="text" v-model="stage.address.building" />
				</div>
				<div>
					<div class="label">Доп.примечания:</div>
					<div v-if="!editCard">{{ stage.address.add_info ? stage.address.add_info : ' - ' }}</div>
					<input v-else type="text" v-model="stage.address.add_info" />
				</div>
				<div>
					<div class="label">Индекс:</div>
					<div v-if="!editCard">{{ stage.address.index ? stage.address.index : ' - ' }}</div>
					<input v-else type="text" v-model="stage.address.index" />
				</div>
				<div>
					<div class="label">Город:</div>
					<div v-if="!editCard">{{ stage.address.city ? stage.address.city : ' - ' }}</div>
					<input v-else type="text" v-model="stage.address.city" />
				</div>
				<div>
					<div class="label">Район:</div>
					<div v-if="!editCard">{{ stage.address.district ? stage.address.district : ' - ' }}</div>
					<input v-else type="text" v-model="stage.address.district" />
				</div>
				<div>
					<div class="label">Страна:</div>
					<div v-if="!editCard">{{ stage.address.country ? stage.address.country : ' - ' }}</div>
					<input v-else type="text" v-model="stage.address.country" />
				</div>
				<div>
					<div class="label">Полный адрес:</div>
					<div v-if="!editCard">{{ stage.address.full_address ? stage.address.full_address : ' - ' }}</div>
					<input v-else type="text" v-model="stage.address.full_address" class="max-width" />
				</div>
			</div>
		</li>
		<li class="stage-modify">
			<button @click="modifyStage" :disabled="isDemo">{{ editCard ? 'OK' : 'Редактировать' }}</button>
			<button @click="deleteStage" :disabled="isDemo">Удалить</button>
		</li>
	</ul>
</template>

<style>
h3 {
	font-size: 1.75em;
	line-height: 1.15;
}
.stage-title {
	display: flex;
	flex-direction: row;
	justify-content: space-between;
	user-select: none;
	cursor: pointer;
	margin-top: 0.6rem;
}
.stage-actions {
	display: grid;
	place-items: center;
}
.stage-actions button {
	line-height: 1;
	background-color: transparent;
	border: 0;
	cursor: pointer;
	width: 1.8rem;
	height: 1.8rem;
}

.stage-card {
	background-color: var(--grey-120);
	border-radius: 6px;
	margin: 0.3rem 0 0.6rem 1rem;
	padding: 0.6rem 1rem;
}
.stage-card > li {
	display: flex;
	flex-direction: row;
	flex-wrap: wrap;
}
.address-flex {
	display: flex;
	flex-direction: column;
	width: 100%;
}
.address-flex > div {
	display: flex;
	flex-direction: row;
	flex-wrap: wrap;
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

.fixed-select {
	min-width: 6rem;
}

.max-width {
	flex-grow: 1;
	max-width: 25rem;
}

.stage-modify {
	display: flex;
	flex-direction: row;
	justify-items: flex-end;
	margin-top: 0.5rem;
	column-gap: 0.7rem;
	row-gap: 0.5rem;
}
.stage-modify button {
	background-color: transparent;
	padding: 0 0.6rem;
	border: 1px solid var(--colorFont);
	cursor: pointer;
}
</style>
