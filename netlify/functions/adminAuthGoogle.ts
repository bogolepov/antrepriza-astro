import { generateBase64RandomUriString } from '@scripts/utils';
import { ENV, getEnv } from './utils/env';

export async function handler(event, context) {
	const redirectUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
	redirectUrl.searchParams.set('client_id', getEnv(ENV.OAUTH_GOOGLE_CLIENT_ID));
	redirectUrl.searchParams.set('redirect_uri', getEnv(ENV.ROOT_URL)?.concat('/.netlify/functions/adminAuthGoogle2'));
	redirectUrl.searchParams.set('response_type', 'code');
	redirectUrl.searchParams.set('scope', 'openid email profile');
	// redirectUrl.searchParams.set('access_type', 'offline');
	// redirectUrl.searchParams.set('state', generateBase64RandomUriString(16));

	return {
		statusCode: 302,
		headers: {
			Location: redirectUrl.toString(),
		},
	};
}
