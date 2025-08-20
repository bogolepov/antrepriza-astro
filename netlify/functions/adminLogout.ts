import type { Handler } from '@netlify/functions';
import { serverLogout } from './utils/auth';

export const handler: Handler = async (event, context) => {
	return serverLogout(200);
};
