<script setup lang="ts">
import { computed } from 'vue';
import { optionListPlays, optionListStages } from '../lib/statesStore';
import { type TPerformance } from '@scripts/db/baseTypes';

interface Props {
	performance: TPerformance;
}
const { performance } = defineProps<Props>();

const stageName = computed(() => {
	let stage = optionListStages.value.find(stage => stage.value === performance.stage_sid);
	if (stage) {
		if (stage.fixed) return 'Сцена ' + stage.text.toUpperCase();
		else return stage.text;
	} else return '-';
});
const playName = computed(() => {
	let play = optionListPlays.value.find(play => play.value === performance.play_sid);
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
.item-title.not-expand {
	cursor: default;
}
</style>
