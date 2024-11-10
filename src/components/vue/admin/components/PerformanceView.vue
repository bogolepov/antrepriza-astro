<script setup lang="ts">
import { computed } from 'vue';
import { type TPerformance } from '@scripts/db/baseTypes';

interface Props {
	performance: TPerformance;
	listPlays;
	listStages;
}
const { performance, listPlays, listStages } = defineProps<Props>();

const stageName = computed(() => {
	let stage = listStages.find(stage => stage.value === performance.stage_sid);
	if (stage) return stage.text;
	else return '-';
});
const playName = computed(() => {
	let play = listPlays.find(play => play.value === performance.play_sid);
	if (play) return play.text;
	else return '-';
});
</script>

<template>
	<div class="item-title not-expand">
		<h3>
			<span class="item-title-date">[{{ performance.date }} {{ performance.time_start }}]</span>
			🎭 {{ playName }}. {{ stageName }}
		</h3>
	</div>
</template>

<style>
.not-expand {
	cursor: default;
}
</style>
