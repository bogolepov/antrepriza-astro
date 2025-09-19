import { computed, ref, toRaw } from 'vue';
import { defineStore } from 'pinia';
import type { UserRole } from '@scripts/types/user-auth';
import { getUserFromToken, type TAuthUser } from '@scripts/user-ck';
import { useDbStore } from './DBStore';
import { getCookieAccessToken } from '@scripts/token-ck';

const LS_AUTH_STORE = 'auth_store';

const channel = new BroadcastChannel('auth_store');
const TYPE_UPDATE = 'update';
interface AuthChannelMessage {
	type: string;
	payload: TAuthUser;
}

export const useAuthStore = defineStore('AuthStore', () => {
	const userRoles = ref<UserRole[]>([]);
	const userName = ref<string>('');

	const isLoggedOut = computed(() => {
		const isOut = !userName.value.length || !userRoles.value.length;
		if (isOut) useDbStore().$reset();
		return isOut;
	});

	const logIn = (name: string, roles: UserRole[]) => {
		userName.value = name;
		userRoles.value = roles;
		_updateState();
	};
	const logOut = () => {
		userName.value = '';
		userRoles.value = [];
		_updateState();
	};

	channel.onmessage = event => {
		const msg = event.data as AuthChannelMessage;
		if (msg?.type === TYPE_UPDATE) {
			userRoles.value = msg.payload.roles;
			userName.value = msg.payload.name;
		}
	};

	function _updateState() {
		const state: TAuthUser = { roles: toRaw(userRoles.value), name: userName.value };
		localStorage.setItem(LS_AUTH_STORE, JSON.stringify(state));
		channel.postMessage({ type: TYPE_UPDATE, payload: state });
	}

	function _loadState() {
		const token = getCookieAccessToken();
		let user: TAuthUser;
		if (token) user = getUserFromToken(token);
		const state: TAuthUser = { roles: user?.roles ?? [], name: user?.name ?? '' };
		localStorage.setItem(LS_AUTH_STORE, JSON.stringify(state));
		if (user) {
			userName.value = user.name;
			userRoles.value = user.roles;
		}
	}
	_loadState();

	return { userRoles, userName, isLoggedOut, logIn, logOut };
});
