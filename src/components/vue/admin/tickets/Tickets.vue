<script setup lang="ts">
import { onBeforeMount, computed, type ComputedRef, ref } from 'vue';
import ChapterTitle from '../components/ChapterTitle.vue';
import TicketsEvent from './TicketsEvent.vue';
import { ONE_DAY } from '@scripts/consts';
import IconCalendar from '../components/iconCalendar.vue';
import IconUpdate from '../components/iconUpdate.vue';
import { UserRole } from '@scripts/types/user-auth';
import { useAuthStore } from '../stores/AuthStore';
import { useDbStore, type IExtNamedEventReservation } from '../stores/DBStore';

const authStore = useAuthStore();
const dbStore = useDbStore();

const isActualPerformancesTickets = ref(true);

let hasAccess = computed<boolean>(() => {
	return authStore.userRoles.includes(UserRole.ADMIN);
});

const performancesToShow: ComputedRef<IExtNamedEventReservation[]> = computed(() => {
	let list: IExtNamedEventReservation[] = dbStore.reservations;
	if (isActualPerformancesTickets.value === true) {
		list = dbStore.reservations.filter(item => Date.parse(item.date) + ONE_DAY >= Date.now());
	}
	list = [...list].sort(
		(item1, item2) => Date.parse(item1.date + 'T' + item1.time) - Date.parse(item2.date + 'T' + item2.time)
	);
	markFirstEventsInMonths(list);
	return list;
});

const calendarIconTitle = computed(() => {
	return isActualPerformancesTickets.value ? 'Показать все' : 'Только предстоящие';
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

async function updateTickets() {
	if (hasAccess) dbStore.getReservationsNetlify(true);
}

async function handleBeforeMount() {
	if (hasAccess) dbStore.getReservationsNetlify();
}
onBeforeMount(handleBeforeMount);
</script>

<template>
	<ChapterTitle title="Бронирования">
		<template v-slot:actions-slot>
			<button v-if="hasAccess" @click="updateTickets" class="expand-item-button icon-calendar" title="Обновить данные">
				<IconUpdate />
			</button>
			<button
				@click="isActualPerformancesTickets = !isActualPerformancesTickets"
				class="expand-item-button icon-calendar"
				:class="{ 'black-white-filter': !isActualPerformancesTickets }"
				:title="calendarIconTitle"
			>
				<IconCalendar />
			</button>
		</template>
	</ChapterTitle>
	<ul>
		<template v-if="hasAccess">
			<template v-for="event in performancesToShow" :key="event.event_sid">
				<li v-show="event.first_in_month" class="month-item">{{ getMonthName(event.event_sid).toUpperCase() }}</li>
				<li>
					<TicketsEvent :event />
				</li>
			</template>
		</template>
		<template v-else>
			<li>Недостаточно прав для просмотра.</li>
		</template>
	</ul>
</template>
