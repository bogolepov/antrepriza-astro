<script setup lang="ts">
import { ref } from 'vue';
import MultiLangText from '../components/MultiLangText.vue';
import type { IStageJson } from '@scripts/adminpanel/types/json-files';

interface Props {
	stage: IStageJson;
}
const { stage } = defineProps<Props>();
const showCard = ref(false);
</script>

<template>
	<div class="item-title" @click="showCard = !showCard">
		<h3>Сцена {{ stage.name.ru.toUpperCase() }}</h3>
	</div>
	<ul v-show="showCard" class="item-card">
		<li>
			<div class="label">Текстовый идентификатор:</div>
			<div>{{ stage.sid ? stage.sid : ' - ' }}</div>
		</li>
		<li>
			<div class="label">Название:</div>
			<MultiLangText :multiText="stage.name" :isEdit="false" />
		</li>
		<li>
			<div class="label">Постоянная сцена:</div>
			<div>{{ stage.fix_stage ? 'да' : 'нет' }}</div>
		</li>
		<li>
			<div class="label" style="width: 100%">Адрес:</div>
			<div class="address-flex">
				<div>
					<div class="label">Улица:</div>
					<div>{{ stage.address.street ? stage.address.street : ' - ' }}</div>
				</div>
				<div>
					<div class="label">Дом:</div>
					<div>{{ stage.address.building ? stage.address.building : ' - ' }}</div>
				</div>
				<div>
					<div class="label">Индекс:</div>
					<div>{{ stage.address.index ? stage.address.index : ' - ' }}</div>
				</div>
				<div>
					<div class="label">Город:</div>
					<div>{{ stage.address.city ? stage.address.city : ' - ' }}</div>
				</div>
				<div>
					<div class="label">Район:</div>
					<div>{{ stage.address.district ? stage.address.district : ' - ' }}</div>
				</div>
				<div>
					<div class="label">Страна:</div>
					<div>{{ stage.address.country ? stage.address.country : ' - ' }}</div>
				</div>
				<div>
					<div class="label">Полный адрес:</div>
					<div>{{ stage.address.full_address ? stage.address.full_address : ' - ' }}</div>
				</div>
			</div>
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
</style>
