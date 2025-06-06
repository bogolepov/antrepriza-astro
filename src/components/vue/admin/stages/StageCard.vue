<script setup lang="ts">
import { ref } from 'vue';
import { isDemo } from '../lib/statesStore';
import type { TStage } from '@scripts/db/baseTypes';
import MultiLangText from '../components/MultiLangText.vue';

interface Props {
	stage: TStage;
}
const { stage } = defineProps<Props>();
const emit = defineEmits(['checkStagesChanging', 'deleteStage']);

const showCard = ref(false);
const editCard = ref(false);
const proxyStage = ref<TStage>(null);

const fixedStageOptions = ref([
	{ text: 'нет', value: false },
	{ text: 'да', value: true },
]);

function modifyStage() {
	if (editCard.value) {
		Object.assign(stage, proxyStage.value);
		emit('checkStagesChanging');
		proxyStage.value = null;
	} else {
		proxyStage.value = JSON.parse(JSON.stringify(stage));
	}
	editCard.value = !editCard.value;
}
function cancelModifyStage() {
	proxyStage.value = null;
	editCard.value = false;
}
function deleteStage() {
	proxyStage.value = null;
	emit('deleteStage', stage.id);
}
</script>

<template>
	<div class="item-title" @click="showCard = !showCard">
		<h3>Сцена {{ stage.name.ru.toUpperCase() }}</h3>
		<div class="item-title-actions">
			<button class="expand-item-button">
				{{ showCard ? '➖' : '➕' }}
			</button>
		</div>
	</div>
	<ul v-show="showCard" class="item-card">
		<li>
			<div class="label">Текстовый идентификатор:</div>
			<div v-if="!editCard">{{ stage.sid ? stage.sid : ' - ' }}</div>
			<input v-else type="text" v-model="proxyStage.sid" maxlength="10" />
		</li>
		<li>
			<div class="label">Название:</div>
			<MultiLangText v-if="!editCard" :multiText="stage.name" :isEdit="editCard" />
			<MultiLangText v-else :multiText="proxyStage.name" :isEdit="editCard" />
		</li>
		<li>
			<div class="label">Постоянная сцена:</div>
			<div v-if="!editCard">{{ stage.fixed ? 'да' : 'нет' }}</div>
			<select v-else v-model="proxyStage.fixed" class="list-select">
				<option disabled value="">Выбрать:</option>
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
					<input v-else type="text" v-model="proxyStage.address.street" />
				</div>
				<div>
					<div class="label">Дом:</div>
					<div v-if="!editCard">{{ stage.address.building ? stage.address.building : ' - ' }}</div>
					<input v-else type="text" v-model="proxyStage.address.building" />
				</div>
				<div>
					<div class="label">Доп.примечания:</div>
					<div v-if="!editCard">{{ stage.address.add_info ? stage.address.add_info : ' - ' }}</div>
					<input v-else type="text" v-model="proxyStage.address.add_info" />
				</div>
				<div>
					<div class="label">Индекс:</div>
					<div v-if="!editCard">{{ stage.address.index ? stage.address.index : ' - ' }}</div>
					<input v-else type="text" v-model="proxyStage.address.index" />
				</div>
				<div>
					<div class="label">Город:</div>
					<div v-if="!editCard">{{ stage.address.city ? stage.address.city : ' - ' }}</div>
					<input v-else type="text" v-model="proxyStage.address.city" />
				</div>
				<div>
					<div class="label">Район:</div>
					<div v-if="!editCard">{{ stage.address.district ? stage.address.district : ' - ' }}</div>
					<input v-else type="text" v-model="proxyStage.address.district" />
				</div>
				<div>
					<div class="label">Страна:</div>
					<div v-if="!editCard">{{ stage.address.country ? stage.address.country : ' - ' }}</div>
					<input v-else type="text" v-model="proxyStage.address.country" />
				</div>
				<div>
					<div class="label">Полный адрес:</div>
					<div v-if="!editCard">{{ stage.address.full_address ? stage.address.full_address : ' - ' }}</div>
					<input v-else type="text" v-model="proxyStage.address.full_address" class="max-width" />
				</div>
			</div>
		</li>
		<li class="modify-item">
			<button @click="modifyStage" :disabled="isDemo">{{ editCard ? 'OK' : 'Редактировать' }}</button>
			<button v-show="!isDemo && editCard" @click="cancelModifyStage">Отменить</button>
			<button @click="deleteStage" :disabled="isDemo">Удалить</button>
		</li>
	</ul>
</template>

<style>
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
.max-width {
	flex-grow: 1;
	max-width: 25rem;
}
</style>
