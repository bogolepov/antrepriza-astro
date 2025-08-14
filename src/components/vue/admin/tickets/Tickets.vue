<script setup lang="ts">
import { onBeforeMount, computed, type ComputedRef } from 'vue';
import ChapterTitle from '../components/ChapterTitle.vue';
import {
	getReservationsNetlify,
	type IExtNamedEventReservation,
	reservations,
	isActualPerformancesTickets,
	authRoles,
} from '../lib/statesStore';
import TicketsEvent from './TicketsEvent.vue';
import { ONE_DAY } from '@scripts/consts';
import IconCalendar from '../components/iconCalendar.vue';
import { UserRole } from '@scripts/types/user-auth';

let hasAccess = computed<boolean>(() => {
	return authRoles.value.includes(UserRole.ADMIN);
});

const performancesToShow: ComputedRef<IExtNamedEventReservation[]> = computed(() => {
	let list: IExtNamedEventReservation[] = reservations.value;
	if (isActualPerformancesTickets.value === true) {
		list = reservations.value.filter(item => Date.parse(item.date) + ONE_DAY >= Date.now());
	}
	list = [...list].sort(
		(item1, item2) => Date.parse(item1.date + 'T' + item1.time) - Date.parse(item2.date + 'T' + item2.time)
	);
	markFirstEventsInMonths(list);
	return list;
});

function markFirstEventsInMonths(list: IExtNamedEventReservation[]) {
	list.forEach((event, index) => {
		if (index === 0) event.first_in_month = true;
		else event.first_in_month = new Date(list[index - 1].date).getMonth() !== new Date(event.date).getMonth();
	});
}

function getMonthName(event_sid: string): string {
	const onlyNumberDate = event_sid.split('_')[1];
	const date = onlyNumberDate.slice(0, 4) + '.' + onlyNumberDate.slice(4, 6) + '.' + onlyNumberDate.slice(6);
	return new Date(date).toLocaleString('ru', { month: 'long' });
}

async function handleBeforeMount() {
	if (authRoles.value.includes(UserRole.ADMIN)) getReservationsNetlify();
}
onBeforeMount(handleBeforeMount);
</script>

<template>
	<ChapterTitle title="Бронирования">
		<template v-slot:actions-slot>
			<button
				@click="isActualPerformancesTickets = !isActualPerformancesTickets"
				class="expand-item-button icon-calendar"
				:class="{ 'black-white-filter': !isActualPerformancesTickets }"
				title="Только предстоящие"
			>
				<IconCalendar />
			</button>
		</template>
	</ChapterTitle>
	<ul>
		<template v-if="!hasAccess">
			<li>Недоступно для демонстрационного режима.</li>
		</template>
		<template v-else>
			<template v-for="event in performancesToShow" :key="event.event_sid">
				<li v-show="event.first_in_month" class="month-item">{{ getMonthName(event.event_sid).toUpperCase() }}</li>
				<li>
					<TicketsEvent :event />
				</li>
			</template>
		</template>
	</ul>
</template>
