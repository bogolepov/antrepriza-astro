import { UserRole } from '@scripts/types/user-auth';
import { ENV, getEnv } from './env';
import { getRolesForLogin } from './roles';

export type TAuthUser = {
	name: string;
	roles: UserRole[];
};

// Тип для userinfo
export interface GoogleUserInfo {
	sub: string;
	email: string;
	email_verified: boolean;
	name: string;
	given_name: string;
	family_name: string;
	picture: string;
	locale: string;
}

export function authUser(login: string, password: string): TAuthUser {
	const user: TAuthUser = { name: '', roles: [] };
	const validUser = getEnv(ENV.ACCOUNTS)
		?.split(',')
		.find(iUser => {
			const regData = iUser.split(':');
			if (regData.length > 2 && regData[0].toLowerCase() === login.toLowerCase() && regData[1] === password) {
				user.name = regData[2];
				return true;
			} else return false;
		});
	if (validUser) {
		user.roles = getRolesForLogin(login);
		return user;
	}
	return undefined;
}

export function authUserGoogle(userInfo: GoogleUserInfo): TAuthUser {
	const login = userInfo.email;
	const name = userInfo.name;

	const roles = getRolesForLogin(login);
	if (!roles.length) roles.push(UserRole.USER);

	return { name, roles };
}
