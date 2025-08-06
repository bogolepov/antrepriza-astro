<script setup lang="ts">
import { onBeforeMount, ref } from 'vue';
import ChapterTitle from '../components/ChapterTitle.vue';
import { getSubscribers, subscribers } from '../lib/statesStore';
import { ESubscriptionState } from '@scripts/types/subscription';

type TSubscriptionStateInfo = {
	state: ESubscriptionState | 'all';
	text: string;
};
const stateList: TSubscriptionStateInfo[] = [
	{ state: ESubscriptionState.REG_INIT, text: 'не подтвержденные' },
	{ state: ESubscriptionState.REG_CONFIRM, text: 'действующие' },
	{ state: ESubscriptionState.REG_DELETE, text: 'отписавшиеся' },
	{ state: 'all', text: 'все в базе' },
];

const sortState = ref<ESubscriptionState | 'all'>(ESubscriptionState.REG_CONFIRM);

const showInit = ref(false);
const showConfirm = ref(true);
const showDelete = ref(false);

async function handleBeforeMount() {
	getSubscribers();
}
onBeforeMount(handleBeforeMount);
</script>

<template>
	<ChapterTitle title="Подписчики на новости" />

	<select v-model="sortState" class="state-select">
		<option v-for="state in stateList" :value="state.state">
			{{ state.text }}
		</option>
	</select>
	<ul>
		<template v-for="user in subscribers" :key="user.email">
			<li v-show="sortState === user.state || sortState === 'all'">{{ user.email }}</li>
		</template>
	</ul>
	<!-- <button @click="addStage" :disabled="isDemo">Добавить сцену</button> -->
</template>

<style>
.state-select {
	font-size: 0.95em;
	padding-right: 2.5ch;
}
</style>
