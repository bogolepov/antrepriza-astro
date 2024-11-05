<script setup lang="ts">
import { ref, defineAsyncComponent, onMounted, provide } from 'vue';
import AuthForm from './AuthForm.vue';
import { type TFirebaseConfig, initFirebaseConfig } from '@scripts/db/firebaseConfig';
import { dbConnect, dbDisconnect } from '@scripts/db/firebase';
import { readPlays, readStages } from '@scripts/db/antreprizaDB';

const AdminPage = defineAsyncComponent(() => import('./AdminPage.vue'));

const LS_ADMIN_AUTH: string = 'adminAuth';
const LS_DEMO_AUTH: string = 'demoAuth';
const LS_ADMIN_AUTH_DATE: string = 'adminAuthDate';

const authorized = ref(false);
const isDemoMode = ref(false);
const connectedDB = ref(false);

async function handleConnectDB(connected: boolean) {
	if (connected) {
		await readPlays();
		await readStages();
	}
	connectedDB.value = connected;
}
function handleDisconnectDB(connected: boolean): void {
	connectedDB.value = connected;
}

function changeAuthorized(isAuthorized: boolean, isDemo: boolean = false, firebaseConfig?: TFirebaseConfig): void {
	authorized.value = isAuthorized;
	isDemoMode.value = isDemo;
	localStorage.setItem(LS_ADMIN_AUTH, isAuthorized.toString());
	localStorage.setItem(LS_DEMO_AUTH, isDemo.toString());
	if (isAuthorized) {
		localStorage.setItem(LS_ADMIN_AUTH_DATE, Date.now().toString());
		if (firebaseConfig) {
			initFirebaseConfig(firebaseConfig);
			dbConnect(handleConnectDB);
		}
	} else {
		dbDisconnect(handleDisconnectDB);
		localStorage.removeItem(LS_ADMIN_AUTH_DATE);
		localStorage.removeItem(LS_DEMO_AUTH);
	}
}

provide('demo', isDemoMode);

onMounted(() => {
	let item = localStorage.getItem(LS_ADMIN_AUTH);
	if (item !== undefined) {
		authorized.value = JSON.parse(item);
	}
	item = localStorage.getItem(LS_DEMO_AUTH);
	if (item !== undefined) {
		isDemoMode.value = JSON.parse(item);
	}
	if (authorized.value && !connectedDB.value) {
		dbConnect(handleConnectDB);
	}
});
</script>

<template>
	<AuthForm v-if="!authorized" @authorize="changeAuthorized"></AuthForm>
	<AdminPage v-else-if="authorized && connectedDB" @authorize="changeAuthorized"></AdminPage>
</template>
