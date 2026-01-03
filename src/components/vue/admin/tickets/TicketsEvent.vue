<script setup lang="ts">
import { ref } from 'vue';
import { getPerformances, getPlays, type IExtNamedEventReservation } from '../lib/statesStore';
import { onlyNumbers } from '@scripts/utils';
import type { IPerformanceJson, IPlayJson } from '@scripts/adminpanel/types/json-files';
import OrderItem from './OrderItem.vue';
import { getPlayName } from '@scripts/play';

interface Props {
	event: IExtNamedEventReservation;
}
const { event } = defineProps<Props>();

const showCard = ref(false);

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
			{{ getPlayName(play, 'ru') }}
		</h3>
		<div class="item-title-actions">
			<button class="expand-item-button card-button">
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
