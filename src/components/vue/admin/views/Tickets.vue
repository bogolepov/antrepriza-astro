<script setup lang="ts">
import { ref, onBeforeMount, computed } from 'vue';
import ChapterTitle from '../components/ChapterTitle.vue';
import { tickets, initTickets, isDemo } from '../store/statesStore';
import TicketsEvent from '../components/TicketsEvent.vue';
import { ONE_DAY } from '@scripts/consts';
import IconCalendar from '../components/iconCalendar.vue';
import type { TEventTickets } from '@scripts/db/baseTypes';

const isActualPerformances = ref(true);

const ticketsToShow = computed(() => {
	if (isDemo.value) return [];

	let list = tickets.value;
	let actualDate = new Date(Date.now() - ONE_DAY);
	let onlyNumberDate =
		actualDate.getFullYear().toString() +
		(actualDate.getMonth() + 1).toString().padStart(2, '0') +
		actualDate.getDate().toString().padStart(2, '0');

	if (isActualPerformances.value === true) {
		list = tickets.value.filter(item => {
			const eventData: string[] = item.event_sid.split('_');
			return Number(eventData[1]) > Number(onlyNumberDate);
		});
	}

	list = [...list].sort((item1, item2) => {
		const eventData1: string[] = item1.event_sid.split('_');
		const eventData2: string[] = item2.event_sid.split('_');
		const date1 = eventData1[1] + eventData1[2];
		const date2 = eventData2[1] + eventData2[2];
		return Number(date1) - Number(date2);
	});

	makeListOfFirstEventsInMonths(list);
	return list;
});

let firstEventsInMonths: TEventTickets[];
function makeListOfFirstEventsInMonths(list: TEventTickets[]) {
	firstEventsInMonths = list.filter((item, index) => {
		if (index === 0) return true;
		const month = item.event_sid.split('_')[1].slice(4, 6);
		const monthPrevItem = list[index - 1].event_sid.split('_')[1].slice(4, 6);
		return month !== monthPrevItem;
	});
}
function getMonthName(event_sid: string): string {
	const onlyNumberDate = event_sid.split('_')[1];
	const date = onlyNumberDate.slice(0, 4) + '.' + onlyNumberDate.slice(4, 6) + '.' + onlyNumberDate.slice(6);
	return new Date(date).toLocaleString('ru', { month: 'long' });
}
function isfirstEventInMonth(event: TEventTickets): boolean {
	return firstEventsInMonths.findIndex(item => item.event_sid == event.event_sid) !== -1;
}

async function handleBeforeMount() {
	if (!isDemo.value) {
		await initTickets();
	}
}
onBeforeMount(handleBeforeMount);
</script>

<template>
	<ChapterTitle title="Бронирования">
		<template v-slot:actions-slot>
			<button @click="isActualPerformances = !isActualPerformances" class="expand-item-button icon-calendar">
				<IconCalendar />
				<div v-show="isActualPerformances" class="icon-calendar-actual">✔️</div>
			</button>
		</template>
	</ChapterTitle>
	<ul>
		<template v-if="isDemo">
			<li>Недоступно для демонстрационного режима.</li>
		</template>
		<template v-else>
			<template v-for="event of ticketsToShow" :key="event.event_sid">
				<li v-show="isfirstEventInMonth(event)" class="month-item">{{ getMonthName(event.event_sid).toUpperCase() }}</li>
				<li>
					<TicketsEvent :event />
				</li>
			</template>
		</template>
	</ul>
</template>
