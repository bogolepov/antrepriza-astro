import type { UserAccessPayload, UserRefreshPayload, UserRole } from './types/user-auth';

const LS_AUTH_TOKEN = 'auth_token';

export type TAuthUser = {
	name: string;
	roles: UserRole[];
};

export function saveAuthUserLS(token: string): TAuthUser {
	localStorage.removeItem(LS_AUTH_TOKEN);
	if (!token) return;

	let roles: UserRole[] = [];
	let name: string = 'unknown';
	const userPayload = getUserPayload<UserAccessPayload>(token);
	if (userPayload?.name) name = userPayload.name;
	if (userPayload?.roles) roles = userPayload.roles;
	let user: TAuthUser = { name, roles };
	localStorage.setItem(LS_AUTH_TOKEN, JSON.stringify(user));
	return user;
}

export function getUserPayload<T>(token: string): T {
	if (token) {
		const tokenArr = token.split('.');
		if (tokenArr[1]) {
			const userPayload = JSON.parse(atob(tokenArr[1])) as T;
			return userPayload;
		}
	}
	return undefined;
}

export function removeAuthUserLS() {
	localStorage.removeItem(LS_AUTH_TOKEN);
}
