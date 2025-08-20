<script setup lang="ts">
import { defineAsyncComponent, onBeforeMount, watch } from 'vue';
import { authName, authRoles, loggedOut, resetDataLogout } from './lib/statesStore';
import AuthForm from './AuthForm.vue';
import { removeAuthUserLS, saveAuthUserLS, type TAuthUser } from '@scripts/user-ck';
import { getCookieAccessToken, logoutCookie } from '@scripts/token-ck';

const AdminPage = defineAsyncComponent(() => import('./AdminPage.vue'));

// watch(authRoles, newRoles => {
// });

function Logout(): void {
	authRoles.value = [];
	authName.value = '';
	loggedOut.value = true;
	removeAuthUserLS();
	logoutCookie();
	resetDataLogout();
}
function Login(user: TAuthUser) {
	authRoles.value = user.roles ? user.roles : [];
	authName.value = user.name;
	loggedOut.value = false;
}

watch(loggedOut, newValue => {
	if (newValue) {
		Logout();
	}
});

onBeforeMount(() => {
	const token = getCookieAccessToken();
	let user: TAuthUser;
	if (token) user = saveAuthUserLS(token);
	if (user) Login(user);
});
</script>

<template>
	<AuthForm v-if="!authRoles.length" @login="Login"></AuthForm>
	<AdminPage v-else @logout="Logout"></AdminPage>
</template>
