<script setup lang="ts">
import { defineAsyncComponent } from 'vue';
import AuthForm from './AuthForm.vue';
import { useAuthStore } from './stores/AuthStore';
import { useDbStore } from './stores/DBStore';

const AdminPage = defineAsyncComponent(() => import('./AdminPage.vue'));

const authStore = useAuthStore();
useDbStore();
</script>

<template>
	<AuthForm v-if="authStore.isLoggedOut"></AuthForm>
	<AdminPage v-else></AdminPage>
</template>
