<script setup lang="ts">
import PlayCard from './PlayCard.vue';
import ChapterTitle from '../components/ChapterTitle.vue';
import type { IPlayJson } from '@scripts/adminpanel/types/json-files';
import { getPlays } from '../lib/statesStore';

const plays: IPlayJson[] = getPlays();
</script>

<template>
	<ChapterTitle title="Спектакли" />
	<ul>
		<template v-for="play in plays" :key="play.suffix">
			<li><PlayCard :play /></li>
		</template>
	</ul>
</template>
