import { ENV, getEnv } from './env';

export function generateGoogleOauthRedirectUri(): string {
	const base_uri = 'https://accounts.google.com/o/oauth2/v2/auth';

	const params = new URLSearchParams();
	params.append('client_id', getEnv(ENV.OAUTH_GOOGLE_CLIENT_ID));
	params.append('redirect_uri', getEnv(ENV.ROOT_URL)?.concat('/admin/google'));
	params.append('response_type', 'code');
	params.append('scope', ['openid', 'profile', 'email'].join(' '));

	return `${base_uri}?${params.toString()}`;
}
