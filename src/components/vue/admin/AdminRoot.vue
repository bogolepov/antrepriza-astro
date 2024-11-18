<script setup lang="ts">
import { ref, defineAsyncComponent, onMounted } from 'vue';
import { setAuthRole } from './store/statesStore';
import AuthForm from './AuthForm.vue';
import { type TFirebaseConfig, initFirebaseConfig } from '@scripts/db/firebaseConfig';
import { EAuthRole } from '@scripts/auth';
import { dbConnect, dbDisconnect } from '@scripts/db/firebase';
import { readPlays, readStages, readPerformances, readRepetitions } from '@scripts/db/antreprizaDB';

const AdminPage = defineAsyncComponent(() => import('./AdminPage.vue'));

const LS_AUTH_ROLE = 'authRole';
const LS_AUTH_DATE = 'authDate';

const authRole = ref(EAuthRole.UNAUTHORIZED);

const connectedDB = ref(false);

async function handleConnectDB(connected: boolean) {
	if (connected) {
		await readPlays();
		await readStages();
		await readPerformances();
		await readRepetitions();
	}
	connectedDB.value = connected;
}
function handleDisconnectDB(connected: boolean): void {
	connectedDB.value = connected;
}

function changeAuthorized(role: EAuthRole, firebaseConfig?: TFirebaseConfig): void {
	authRole.value = role;
	setAuthRole(role);
	localStorage.setItem(LS_AUTH_ROLE, role);
	if (role === EAuthRole.UNAUTHORIZED) {
		dbDisconnect(handleDisconnectDB);
		localStorage.removeItem(LS_AUTH_DATE);
	} else {
		localStorage.setItem(LS_AUTH_DATE, Date.now().toString());
		if (firebaseConfig) {
			initFirebaseConfig(firebaseConfig);
			dbConnect(handleConnectDB);
		}
	}
}

// provide('authRole', readonly(authRole));

onMounted(() => {
	const strRole: string = localStorage.getItem(LS_AUTH_ROLE);
	let role: EAuthRole = EAuthRole.UNAUTHORIZED;
	if (Object.values(EAuthRole).includes(strRole)) role = strRole;

	if (role === undefined || role === EAuthRole.UNAUTHORIZED) {
		authRole.value = EAuthRole.UNAUTHORIZED;
		setAuthRole(authRole.value);
	} else {
		authRole.value = role;
		setAuthRole(authRole.value);
		if (!connectedDB.value) {
			dbConnect(handleConnectDB);
		}
	}
});
</script>

<template>
	<AuthForm v-if="authRole === EAuthRole.UNAUTHORIZED" @authorize="changeAuthorized"></AuthForm>
	<AdminPage v-else-if="authRole !== EAuthRole.UNAUTHORIZED && connectedDB" @authorize="changeAuthorized"></AdminPage>
</template>
