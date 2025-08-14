<script setup lang="ts">
import { ref } from 'vue';
import { onlyNumbers } from '@scripts/utils';
import type { IExtendedPerformanceJson, IPlayJson, IStageJson } from '@scripts/adminpanel/types/json-files';

import theater from '@data/theater.json';
import jsonPlays from '@data/plays.json';
import { EPerformanceType } from '@scripts/types/base';

const stages: IStageJson[] = theater.stages;
const plays: IPlayJson[] = jsonPlays;

interface Props {
	performance: IExtendedPerformanceJson;
}
const { performance } = defineProps<Props>();

const showCard = ref(false);

let stageName: string;
let currStage = stages.find(stage => stage.sid === performance.stage_sid);
if (currStage) {
	if (currStage.fix_stage) stageName = 'Сцена ' + currStage.name.ru.toUpperCase();
	else stageName = currStage.name.ru;
} else stageName = '-';

let currPlay = plays.find(play => play.suffix === performance.play_sid);
const playName = currPlay ? currPlay.title.ru : '';

let date = new Date('2024-01-01T' + performance.time);
date.setMinutes(date.getMinutes() + currPlay.length);
performance.time_end = `${date.getHours()}:${date.getMinutes()}`;
performance.sid = `${performance.stage_sid}_${onlyNumbers(performance.date)}_${onlyNumbers(performance.time)}_${
	performance.play_sid
}`;

performance.event_type = EPerformanceType.TOUR;
if (currStage.fix_stage) performance.event_type = EPerformanceType.REGULAR;
if (performance.premiere) performance.event_type = EPerformanceType.PREMIERE;
if (performance.newyear) performance.event_type = EPerformanceType.NEWYEAR;
if (performance.is_festival) performance.event_type = EPerformanceType.FESTIVAL;
</script>

<template>
	<div class="item-title" @click="showCard = !showCard">
		<h3>
			<span class="item-title-date">[{{ performance.date }} {{ performance.time }}]</span>
			{{ playName }}
		</h3>
	</div>
	<ul v-show="showCard" class="item-card">
		<li>
			<div class="label">Спектакль:</div>
			<div>{{ playName }}</div>
		</li>
		<li>
			<div class="label">Дата:</div>
			<div>{{ performance.date ? performance.date : ' - ' }}</div>
		</li>
		<li>
			<div class="label">Время начала:</div>
			<div>{{ performance.time ? performance.time : ' - ' }}</div>
		</li>
		<li>
			<div class="label">Площадка:</div>
			<div>{{ stageName }}</div>
		</li>
		<li>
			<div class="label">Тип выступления:</div>
			<div>{{ performance.event_type }}</div>
		</li>
		<li>
			<div class="label">Время окончания:</div>
			<div>{{ performance.time_end ? performance.time_end : ' - ' }}</div>
		</li>
		<li v-if="performance.canceled" class="ev_canceled">
			<div>ОТМЕНЕН</div>
		</li>
		<li v-else-if="performance.replaced" class="ev_canceled">
			<div>ЗАМЕНЕН</div>
		</li>
	</ul>
</template>

<style>
.item-title-date {
	color: var(--colorFontDate);
}
.ev_canceled {
	padding-top: 0.3em;
	color: var(--colorFontDate);
	font-weight: 400;
}
</style>
