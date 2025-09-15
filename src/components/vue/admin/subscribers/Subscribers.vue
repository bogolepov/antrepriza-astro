<script setup lang="ts">
import { computed, onBeforeMount, ref } from 'vue';
import ChapterTitle from '../components/ChapterTitle.vue';
import { ESubscriptionState } from '@scripts/types/subscription';
import { UserRole } from '@scripts/types/user-auth';
import IconUpdate from '../components/iconUpdate.vue';
import { useAuthStore } from '../stores/AuthStore';
import { useDbStore } from '../stores/DBStore';

const authStore = useAuthStore();
const dbStore = useDbStore();

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

const subscriptionState = ref<ESubscriptionState | 'all'>(ESubscriptionState.REG_CONFIRM);

let hasAccess = computed<boolean>(() => {
	return authStore.userRoles.includes(UserRole.ADMIN);
});

async function updateSubscribers() {
	if (hasAccess) dbStore.getSubscribersNetlify(true);
}

async function handleBeforeMount() {
	if (hasAccess) dbStore.getSubscribersNetlify();
}
onBeforeMount(handleBeforeMount);
</script>

<template>
	<ChapterTitle title="Подписчики на новости">
		<template v-slot:actions-slot>
			<button
				v-if="hasAccess"
				@click="updateSubscribers"
				class="expand-item-button icon-calendar"
				title="Обновить данные"
			>
				<IconUpdate />
			</button>
		</template>
	</ChapterTitle>

	<select v-model="subscriptionState" class="state-select">
		<option v-for="state in stateList" :value="state.state">
			{{ state.text }}
		</option>
	</select>
	<ul>
		<template v-if="hasAccess">
			<template v-for="user in dbStore.subscribers" :key="user.email">
				<li v-show="subscriptionState === user.state || subscriptionState === 'all'">{{ user.email }}</li>
			</template>
		</template>
		<template v-else>
			<li>Недостаточно прав для просмотра.</li>
		</template>
	</ul>
</template>

<style>
.state-select {
	font-size: 0.95em;
	padding-right: 2.5ch;
}
</style>
