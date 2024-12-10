<script setup lang="ts">
import { ref } from 'vue';
import type { TEventTickets, TPerformance, TPlay, TStage } from '@scripts/db/baseTypes';
import { performances, plays, stages } from '../lib/statesStore';
import { onlyNumbers } from '@scripts/utils_src';
import type { TOrderItem } from '@scripts/types/reservation';

interface Props {
	event: TEventTickets;
}
const { event } = defineProps<Props>();

const showCard = ref(false);

let performance: TPerformance;
let stage: TStage;
let play: TPlay;

function initEventInfo(event_sid: string) {
	// 0: stage_sid, 1: date, 2: time, 3: play_sid
	const eventData: string[] = event_sid.split('_');
	performance = performances.value.find(
		item =>
			item.stage_sid === eventData[0] &&
			onlyNumbers(item.date) === eventData[1] &&
			onlyNumbers(item.time_start) === eventData[2] &&
			item.play_sid === eventData[3]
	);
	if (performance) {
		stage = stages.value.find(item => item.sid === performance.stage_sid);
		play = plays.value.find(item => item.sid === performance.play_sid);
	}
}
initEventInfo(event.event_sid);

let totalTickets: number = 0;
event.reservations.forEach(item => item.tickets.forEach(it => (totalTickets += it.count)));

function ticketsCount(tickets: TOrderItem[]): number {
	if (!tickets || !tickets.length) return 0;
	let n = 0;
	tickets.forEach(item => {
		n += item.count;
	});
	return n;
}
</script>

<template>
	<div class="item-title" @click="showCard = !showCard">
		<h3>
			<span class="item-title-date">[{{ performance.date }} {{ performance.time_start }}]</span>
			{{ play.name.ru }}
		</h3>
		<div class="item-title-actions">
			<button class="expand-item-button">
				{{ showCard ? '➖' : '➕' }}
			</button>
		</div>
	</div>
	<ul v-show="showCard" class="item-card">
		<template v-for="reservation in event.reservations">
			<li class="reservation-item">
				<div>
					{{ reservation.name }} // <span class="res-email">{{ reservation.email }}</span>
				</div>
				<div class="count-item">{{ ticketsCount(reservation.tickets) }}</div>
			</li>
		</template>
		<li class="reservation-item result">
			<div>Итого</div>
			<div class="count-item">{{ totalTickets }}</div>
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
.item-card .reservation-item {
	display: flex;
	flex-direction: row;
	justify-content: space-between;
}
.reservation-item .res-email {
	font-size: smaller;
	color: #00bfff;
}
.reservation-item.result {
	border-top: 1px solid;
	margin-top: 0.1rem;
}
.count-item {
	padding-right: 0.2rem;
}
</style>
