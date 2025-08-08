<script setup lang="ts">
import { onBeforeMount, ref } from 'vue';
import ChapterTitle from '../components/ChapterTitle.vue';
import { getSubscribersNetlify, isDemo, subscriptionState, subscribers } from '../lib/statesStore';
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

const showInit = ref(false);
const showConfirm = ref(true);
const showDelete = ref(false);

async function handleBeforeMount() {
	if (!isDemo.value) getSubscribersNetlify();
}
onBeforeMount(handleBeforeMount);
</script>

<template>
	<ChapterTitle title="Подписчики на новости" />

	<select v-model="subscriptionState" class="state-select">
		<option v-for="state in stateList" :value="state.state">
			{{ state.text }}
		</option>
	</select>
	<ul>
		<template v-if="isDemo">
			<li>Недоступно для демонстрационного режима.</li>
		</template>
		<template v-else>
			<template v-for="user in subscribers" :key="user.email">
				<li v-show="subscriptionState === user.state || subscriptionState === 'all'">{{ user.email }}</li>
			</template>
		</template>
	</ul>
</template>

<style>
.state-select {
	font-size: 0.95em;
	padding-right: 2.5ch;
}
</style>
