<script setup lang="ts">
import { inject, ref, computed } from 'vue';
import { EAuthRole } from '@scripts/auth';
import type { TPerformance } from '@scripts/db/baseTypes';
import MultiLangText from './MultiLangText.vue';

interface Props {
	performance: TPerformance;
}
const { performance } = defineProps<Props>();
const emit = defineEmits(['checkPerformancesChanging', 'deletePerformance']);

const authRole: EAuthRole = inject('authRole');
const isDemo = computed(() => authRole.value === EAuthRole.DEMO);

const showCard = ref(false);
const editCard = ref(false);

const premiereOptions = ref([
	{ text: 'нет', value: false },
	{ text: 'да', value: true },
]);

function modifyPerformance() {
	const wasEditMode = editCard.value;
	editCard.value = !editCard.value;
	if (wasEditMode) {
		emit('checkPerformancesChanging');
	}
}
function deletePerformance() {
	emit('deletePerformance', performance.id);
}
</script>

<template>
	<div class="performance-title" @click="showCard = !showCard">
		<h3>Спектакль</h3>
		<!-- <h3>Спектакль {{ stage.name.ru.toUpperCase() }}</h3> -->
		<div class="performance-actions">
			<button class="expand-item-button">
				{{ showCard ? '➖' : '➕' }}
			</button>
		</div>
	</div>
	<ul v-show="showCard" class="performance-card">
		<li>
			<div class="label">Текстовый идентификатор:</div>
			<div>{{ performance.sid ? performance.sid : ' - ' }}</div>
		</li>
		<!-- <li>
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
		</li> -->
		<li class="modify-item">
			<button @click="modifyPerformance" :disabled="isDemo">{{ editCard ? 'OK' : 'Редактировать' }}</button>
			<button @click="deletePerformance" :disabled="isDemo">Удалить</button>
		</li>
	</ul>
</template>

<style>
h3 {
	font-size: 1.75em;
	line-height: 1.15;
}
.performance-title {
	display: flex;
	flex-direction: row;
	justify-content: space-between;
	user-select: none;
	cursor: pointer;
	margin-top: 0.6rem;
}
.performance-actions {
	display: grid;
	place-items: center;
}

.performance-card {
	background-color: var(--grey-120);
	border-radius: 6px;
	margin: 0.3rem 0 0.6rem 1rem;
	padding: 0.6rem 1rem;
}
.performance-card > li {
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
</style>
