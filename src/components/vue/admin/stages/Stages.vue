<script setup lang="ts">
import StageCard from './StageCard.vue';
import ChapterTitle from '../components/ChapterTitle.vue';
import type { IStageJson } from '@scripts/adminpanel/types/json-files';
import { getStages } from '../lib/statesStore';

const jsonStages: IStageJson[] = getStages();
</script>

<template>
	<ChapterTitle title="Сцены, площадки" />
	<ul>
		<template v-for="stage in jsonStages" :key="stage.sid">
			<li v-show="stage.fix_stage"><StageCard :stage /></li>
		</template>
	</ul>
</template>
