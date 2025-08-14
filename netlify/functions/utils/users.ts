import type { UserRole } from '@scripts/types/user-auth';
import { ENV, getEnv } from './env';
import { getRolesForLogin } from './roles';

export type TAuthUser = {
	login: string;
	name: string;
	id: number;
	roles: UserRole[];
};

export function authUser(login: string, password: string): TAuthUser {
	const user: TAuthUser = { login, name: '', id: 0, roles: [] };
	const validUser = getEnv(ENV.ACCOUNTS)
		?.split(',')
		.find(iUser => {
			const regData = iUser.split(':');
			if (regData.length === 4 && regData[0].toLowerCase() === login.toLowerCase() && regData[1] === password) {
				user.name = regData[2];
				user.id = Number(regData[3]);
				return true;
			} else return false;
		});
	if (validUser) {
		user.roles = getRolesForLogin(login);
		return user;
	}
	return undefined;
}
