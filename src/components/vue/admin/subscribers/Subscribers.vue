<script setup lang="ts">
import { computed, onBeforeMount, ref } from 'vue';
import ChapterTitle from '../components/ChapterTitle.vue';
import { getSubscribersNetlify, subscriptionState, subscribers, authRoles } from '../lib/statesStore';
import { ESubscriptionState } from '@scripts/types/subscription';
import { UserRole } from '@scripts/types/user-auth';

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

let hasAccess = computed<boolean>(() => {
	return authRoles.value.includes(UserRole.ADMIN);
});

async function handleBeforeMount() {
	if (authRoles.value.includes(UserRole.ADMIN)) getSubscribersNetlify();
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
		<template v-if="!hasAccess">
			<li>Недостаточно прав для просмотра.</li>
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
