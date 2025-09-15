<script setup lang="ts">
import { computed, ref, type ComputedRef } from 'vue';
import ChapterTitle from '../components/ChapterTitle.vue';
import Performance from './Performance.vue';
import { ONE_DAY } from '@scripts/consts';
import IconCalendar from '../components/iconCalendar.vue';
import type { IExtendedPerformanceJson, IPerformanceJson } from '@scripts/adminpanel/types/json-files';
import { getPerformances } from '../lib/statesStore';

const isActualPerformancesAfisha = ref(true);

const performances: IPerformanceJson[] = getPerformances();

const performancesToShow: ComputedRef<IExtendedPerformanceJson[]> = computed(() => {
	let list: IExtendedPerformanceJson[] = performances;
	if (isActualPerformancesAfisha.value === true) {
		list = performances.filter(item => Date.parse(item.date) + ONE_DAY >= Date.now());
	}
	list = [...list].sort(
		(item1, item2) => Date.parse(item1.date + 'T' + item1.time) - Date.parse(item2.date + 'T' + item2.time)
	);
	markFirstEventsInMonths(list);
	return list;
});

const calendarIconTitle = computed(() => {
	return isActualPerformancesAfisha.value ? 'Показать все' : 'Только предстоящие';
});

function markFirstEventsInMonths(list: IExtendedPerformanceJson[]) {
	list.forEach((event, index) => {
		if (index === 0) event.first_in_month = true;
		else event.first_in_month = new Date(list[index - 1].date).getMonth() !== new Date(event.date).getMonth();
	});
}

function getMonthName(date: string): string {
	return new Date(date).toLocaleString('ru', { month: 'long' });
}
</script>

<template>
	<ChapterTitle title="Выступления">
		<template v-slot:actions-slot>
			<button
				@click="isActualPerformancesAfisha = !isActualPerformancesAfisha"
				class="expand-item-button icon-calendar"
				:class="{ 'black-white-filter': !isActualPerformancesAfisha }"
				:title="calendarIconTitle"
			>
				<IconCalendar />
			</button>
		</template>
	</ChapterTitle>
	<ul>
		<template
			v-for="performance in performancesToShow"
			:key="performance.stage_sid + performance.date + performance.time"
		>
			<li v-show="performance.first_in_month" class="month-item">
				{{ getMonthName(performance.date).toUpperCase() }}
			</li>
			<li>
				<Performance :performance />
			</li>
		</template>
	</ul>
</template>

<style>
.expand-item-button.icon-calendar {
	position: relative;
	font-size: 2rem;
	height: 2rem;
}
.month-item {
	font-size: 1.8rem;
	font-weight: var(--font-bold-weight);
	color: var(--colorFont-Op1);
	margin-top: 1.5rem;
	line-height: 1;
}
</style>
