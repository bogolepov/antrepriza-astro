export const enum ENV {
	JWT_ACCESS_SECRET = 'JWT_ACCESS_SECRET',
	JWT_REFRESH_SECRET = 'JWT_REFRESH_SECRET',
	GENERATE_API_KEY = 'GENERATE_API_KEY',
	ACCOUNTS = 'ACCOUNTS',
	OAUTH_GOOGLE_CLIENT_ID = 'OAUTH_GOOGLE_CLIENT_ID',
	OAUTH_GOOGLE_CLIENT_SECRET = 'OAUTH_GOOGLE_CLIENT_SECRET',
	ROOT_URL = 'ROOT_URL',
}

export function getEnv(envName: ENV): string {
	const v = process.env[envName];
	if (!v) throw new Error(`Env ${envName} is required but not set`);
	return v;
}

export function optionalEnv(envName: ENV): string | undefined {
	return process.env[envName];
}
