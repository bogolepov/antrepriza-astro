import { UserRole } from '@scripts/types/user-auth';

export function hasRequiredRole(userRoles: UserRole[], role: UserRole): boolean {
	return userRoles.includes(role);
}

export function getRolesForLogin(login: string): UserRole[] {
	const roles: UserRole[] = [];
	const admins = (process.env.ROLE_ADMINS || '')
		.split(',')
		.map(s => s.trim().toLowerCase())
		.filter(Boolean);
	const editors = (process.env.ROLE_EDITORS || '')
		.split(',')
		.map(s => s.trim().toLowerCase())
		.filter(Boolean);
	const users = (process.env.ROLE_USERS || '')
		.split(',')
		.map(s => s.trim().toLowerCase())
		.filter(Boolean);
	const l = login.toLowerCase();
	if (admins.includes(l)) roles.push(UserRole.ADMIN);
	if (editors.includes(l)) roles.push(UserRole.EDITOR);
	if (users.includes(l)) roles.push(UserRole.USER);
	return roles;
}

export function checkAccess(userRoles: UserRole[], needRole: UserRole) {
	if (userRoles) return userRoles.includes(needRole);
	return false;
}
