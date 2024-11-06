<script setup lang="ts">
import { ref, computed } from 'vue';
import { EAuthRole } from '@scripts/auth';

const emit = defineEmits(['authorize']);

const fEmail: string = '';
const login = ref('');
const password = ref('');
const email = ref(fEmail);
const authError = ref('');

const btnIsDisabled = computed(() => password.value.length === 0 || login.value.length === 0 || email.value !== fEmail);

const showPassword = ref(false);
function showPasswordToogle(event) {
	if ('Enter' === event.code || 'Space' === event.code) showPassword.value = !showPassword.value;
}
function submit(event) {
	// console.log(event);
	const authData = {
		name: login.value,
		message: password.value,
		email: 'info@a.eu',
	};
	const options = {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(authData),
	};

	const handleResult = (ok, isDemo, firebaseConfig) => {
		if (ok) {
			authError.value = '';
			let role = EAuthRole.ADMIN;
			if (isDemo) role = EAuthRole.DEMO;
			emit('authorize', role, firebaseConfig);
		} else {
			authError.value = 'Введен неверный логин или пароль.';
		}
	};

	let isOk;
	fetch('/.netlify/functions/adminAuth', options)
		.then(response => {
			// console.log(response);

			isOk = response.ok;
			return response.json();
		})
		.then(data => {
			// console.log(data.message);
			if (isOk) {
				handleResult(true, data?.demo, data.firebaseConfig);
			} else throw new Error();
		})
		.catch(() => handleResult(false, undefined, undefined));
}
</script>

<template>
	<main>
		<form class="auth-form">
			<img class="logo" src="/favicon.svg" alt="Лого Театра Антреприза" />
			<label for="logn">Логин</label>
			<input type="text" v-model.trim="login" required />
			<label for="password">Пароль</label>
			<div class="password-field">
				<input type="hidden" v-model="email" />
				<input v-if="showPassword" type="text" v-model="password" class="password-input" required />
				<input v-else type="password" v-model="password" class="password-input" required />
				<input type="checkbox" v-model="showPassword" id="show-password-checkbox" tabindex="-1" />
				<label for="show-password-checkbox" class="eye-password" @keypress="showPasswordToogle" tabindex="0">
					<svg v-show="!showPassword" viewBox="0 -2.96 15.929 15.929" xmlns="http://www.w3.org/2000/svg">
						<path
							d="M-3.768,6.232l-.416-.416A9.609,9.609,0,0,0-11,2.993a9.609,9.609,0,0,0-6.816,2.823l-.416.416a2.5,2.5,0,0,0,0,3.536l.416.416A9.609,9.609,0,0,0-11,13.007a9.609,9.609,0,0,0,6.816-2.823l.416-.416A2.5,2.5,0,0,0-3.768,6.232ZM-11,4a.5.5,0,0,1,.5.5A.5.5,0,0,1-11,5a2,2,0,0,0-2,2,.5.5,0,0,1-.5.5A.5.5,0,0,1-14,7,3,3,0,0,1-11,4Zm6.525,5.061-.416.416A8.581,8.581,0,0,1-11,12.007a8.581,8.581,0,0,1-6.109-2.53l-.416-.416A1.493,1.493,0,0,1-17.964,8a1.493,1.493,0,0,1,.439-1.061l.416-.416A8.624,8.624,0,0,1-14.183,4.6,3.964,3.964,0,0,0-15,7a4,4,0,0,0,4,4A4,4,0,0,0-7,7a3.964,3.964,0,0,0-.817-2.4A8.624,8.624,0,0,1-4.891,6.523l.416.416A1.493,1.493,0,0,1-4.036,8,1.493,1.493,0,0,1-4.475,9.061Z"
							transform="translate(18.965 -2.993)"
						/>
					</svg>
					<svg v-show="showPassword" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
						<path
							d="M32.716,11.837l.823.823a9.6,9.6,0,0,1-9.355-2.476l-.416-.416a2.5,2.5,0,0,1,0-3.536l.416-.416A9.653,9.653,0,0,1,25.56,4.681l.717.717a8.76,8.76,0,0,0-1.386,1.125l-.416.416a1.5,1.5,0,0,0,0,2.122l.416.416A8.581,8.581,0,0,0,31,12.007,8.729,8.729,0,0,0,32.716,11.837ZM31,11a4.037,4.037,0,0,0,.8-.08L27.08,6.2A4,4,0,0,0,31,11ZM29.525,4.4A2.958,2.958,0,0,1,31,4a.5.5,0,0,1,0,1,1.976,1.976,0,0,0-.735.144L34.331,9.21A3.956,3.956,0,0,0,34.183,4.6a8.624,8.624,0,0,1,2.926,1.922l.416.416a1.5,1.5,0,0,1,0,2.122l-.416.416A8.7,8.7,0,0,1,35.723,10.6l.717.718a9.653,9.653,0,0,0,1.376-1.135l.416-.416a2.5,2.5,0,0,0,0-3.536l-.416-.416A9.6,9.6,0,0,0,28.461,3.34ZM23.854.146a.5.5,0,0,0-.708.708l15,15a.5.5,0,0,0,.708-.708Z"
							transform="translate(-23 0)"
						/>
					</svg>
				</label>
			</div>
			<p v-show="authError.length > 0" class="auth-error">{{ authError }}</p>
			<button @click.prevent="submit" :disabled="btnIsDisabled">Войти</button>
		</form>
	</main>
</template>

<style scoped>
main {
	display: grid;
	place-items: center;
	width: 100%;
	min-height: 100%;
}

.auth-form {
	--label-width: 4.2rem;
	--row-gap: 0.75rem;
	--form-width: 85%;
	--form-width-vw: 85dvw;
	--eye-width: 1.9rem;

	display: grid;
	grid-template-columns: auto auto;
	row-gap: var(--row-gap);
	max-width: var(--form-width);
	margin: 0.5rem 0;
}

.logo {
	grid-column: 1 / 3;
	max-width: min(100px, var(--form-width), 45dvw);
	margin: 0 auto 1rem auto;
}

.auth-form label {
	width: var(--label-width);
}
.auth-form input,
.auth-form button {
	line-height: 1.1;
	max-width: calc(var(--form-width-vw) - var(--label-width));
	background-color: var(--colorBkgInput);
	border: 1px solid var(--colorBkgTicketsBtn);
}

.auth-form button {
	grid-column: 1 / 3;
	justify-self: end;
	margin-top: 1rem;
	padding: 0.1rem 0.2rem;
	width: min(6rem, var(--form-width-vw));
	user-select: none;
	cursor: pointer;
}
.auth-form button[disabled] {
	border-color: var(--colorBkgDisabledBtn);
	cursor: default;
}

.password-field {
	display: flex;
}
#show-password-checkbox {
	position: absolute;
	width: 0;
	height: 0;
	right: 50%;
	bottom: 50%;
	-webkit-appearance: none;
	appearance: none;
	opacity: 0;
}
.password-field label.eye-password {
	display: grid;
	place-items: center;
	width: var(--eye-width);
	height: 100%;
	cursor: pointer;
	background-color: var(--colorBkgInput);
	border: 1px solid var(--colorBkgTicketsBtn);
	border-left: 0;
}
.password-field svg {
	display: block;
	width: auto;
	height: 1rem;
	line-height: 1px;
	fill: var(--grey-46);
}

.password-field input.password-input {
	max-width: calc(var(--form-width-vw) - var(--label-width) - var(--eye-width));
	width: 100%;
}

.auth-error {
	grid-column: -2 / -1;
	margin: 0;
	line-height: 1.2;
	color: var(--colorAntreprizaRed);
}

@media (max-width: 240px) {
	.auth-form {
		grid-template-columns: auto;
		--row-gap: 0.15rem;
		width: var(--form-width);
	}
	.logo,
	.auth-form button {
		grid-column: 1 / 2;
	}
	.auth-form input {
		width: 100%;
		max-width: 100%;
		margin-bottom: 0.4rem;
	}
	.auth-form input.password-input {
		width: calc(var(--form-width-vw) - var(--eye-width));
		max-width: calc(var(--form-width-vw) - var(--eye-width));
	}
	.password-field {
		margin-bottom: 0.4em;
	}
	.password-field input {
		margin-bottom: 0;
	}
}
</style>
