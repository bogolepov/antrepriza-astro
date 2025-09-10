export const enum UserRole {
	ADMIN = 'admin',
	EDITOR = 'editor',
	USER = 'user',
}

export interface UserPayload {
	name: string;
	roles: UserRole[];
	iat?: number;
	exp?: number;
}

export interface UserAccessPayload {
	name: string;
	roles: UserRole[];
	iat?: number;
	exp?: number;
}

export interface UserRefreshPayload extends UserAccessPayload {
	// id: number;
}
