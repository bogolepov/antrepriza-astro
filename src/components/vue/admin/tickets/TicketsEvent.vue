<script setup lang="ts">
import { ref } from 'vue';
import { getPerformances, getPlays, type IExtNamedEventReservation } from '../lib/statesStore';
import { onlyNumbers } from '@scripts/utils';
import type { IPerformanceJson, IPlayJson, IStageJson } from '@scripts/adminpanel/types/json-files';
import OrderItem from './OrderItem.vue';

interface Props {
	event: IExtNamedEventReservation;
}
const { event } = defineProps<Props>();

const showCard = ref(false);

// let stage: IStageJson = getStages()?.find(item => item.sid === event.stage_sid);
let play: IPlayJson = getPlays()?.find(item => item.suffix === event.play_sid);
let performance: IPerformanceJson = getPerformances()?.find(
	item =>
		item.date === event.date &&
		item.time === event.time &&
		item.stage_sid === event.stage_sid &&
		item.play_sid === event.play_sid
);

event.totalTickets = 0;
event.reservations.forEach(item => item.tickets.forEach(it => (event.totalTickets += it.count)));
</script>

<template>
	<div class="item-title" @click="showCard = !showCard">
		<h3>
			<span class="item-title-date">[{{ performance.date }} {{ performance.time }}]</span>
			{{ play.title.ru }}
		</h3>
		<div class="item-title-actions">
			<button class="expand-item-button card-button">
				<!-- {{ showCard ? '➖' : '➕' }} -->
				{{ showCard ? '◁' : '▷' }}
			</button>
		</div>
	</div>
	<ul v-show="showCard" class="item-card">
		<template v-for="reservation in event.reservations">
			<OrderItem :order="reservation" />
		</template>
		<li class="order-item result">
			<div>Итого</div>
			<div class="count-item">{{ event.totalTickets }}</div>
		</li>

		<!-- <li>
			<div class="label">Спектакль:</div>
			<div v-if="!editCard">{{ playName }}</div>
			<select v-else v-model="performance.play_sid" class="list-select">
				<option disabled value="">Выбрать спектакль:</option>
				<option v-for="option in optionListPlays" :value="option.value">
					{{ option.text }}
				</option>
			</select>
		</li>
		<li>
			<div class="label">Дата:</div>
			<div v-if="!editCard">{{ performance.date ? performance.date : ' - ' }}</div>
			<input
				v-else
				type="date"
				:value="performance.date"
				@change="
					event => {
						performance.date = event.target.value;
					}
				"
				:min="minDate"
			/>
		</li>
		<li>
			<div class="label">Время начала:</div>
			<div v-if="!editCard">{{ performance.time_start ? performance.time_start : ' - ' }}</div>
			<input
				v-else
				type="time"
				:value="performance.time_start"
				@change="
					event => {
						performance.time_start = event.target.value;
					}
				"
			/>
		</li>
		<li>
			<div class="label">Площадка:</div>
			<div v-if="!editCard">{{ stageName }}</div>
			<select v-else v-model="performance.stage_sid" class="list-select">
				<option disabled value="">Выбрать площадку:</option>
				<option v-for="option in optionListStages" :value="option.value">
					{{ option.text }}
				</option>
			</select>
		</li>
		<li>
			<div class="label">Тип выступления:</div>
			<div v-if="!editCard">{{ performance.event_type }}</div>
			<select v-else v-model="performance.event_type" class="list-select">
				<option disabled value="">Выбрать:</option>
				<option v-for="option in Object.values(EPerformanceType)" :value="option">
					{{ option }}
				</option>
			</select>
		</li>
		<li>
			<div class="label">Время окончания:</div>
			<div v-if="!editCard">{{ performance.time_end ? performance.time_end : ' - ' }}</div>
			<input v-else type="text" v-model="performance.time_end" disabled />
		</li>
		<li class="modify-item">
			<button @click="modifyPerformance" :disabled="isDemo">{{ editCard ? 'OK' : 'Редактировать' }}</button>
			<button @click="deletePerformance" :disabled="isDemo">Удалить</button>
		</li> -->
	</ul>
</template>

<style>
.count-item {
	padding-right: 0.2rem;
}
.expand-item-button.card-button {
	padding-right: 1.2rem;
}
li.order-item + li.order-item.result {
	border-top: 1px solid;
	margin-top: 0.7rem;
	padding-top: 0.4em;
}
</style>
