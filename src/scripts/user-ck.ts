import type { UserAccessPayload, UserRole } from './types/user-auth';

export type TAuthUser = {
	name: string;
	roles: UserRole[];
};

export function getUserFromToken(token: string): TAuthUser {
	if (!token) return null;

	let user: TAuthUser = { name: 'unknown', roles: [] };
	const userPayload = getUserPayload<UserAccessPayload>(token);
	if (!userPayload) return undefined;
	if (userPayload?.name) user.name = userPayload.name;
	if (userPayload?.roles) user.roles = userPayload.roles;
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
