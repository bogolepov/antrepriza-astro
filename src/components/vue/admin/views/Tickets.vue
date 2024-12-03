<script setup lang="ts">
import { onBeforeMount } from 'vue';
import ChapterTitle from '../components/ChapterTitle.vue';
import { getTickets } from '@scripts/db/antreprizaDB';

async function handleBeforeMount() {
	let tickets = await getTickets();
	console.log(tickets);
}
onBeforeMount(handleBeforeMount);
</script>

<template>
	<ChapterTitle title="Бронирования" />
	<!-- <ul>
		<template v-for="stage of stages" :key="stage.id">
			<li><StageCard :stage @check-stages-changing="checkStagesChanging" @delete-stage="deleteStage" /></li>
		</template>
	</ul> -->
</template>
