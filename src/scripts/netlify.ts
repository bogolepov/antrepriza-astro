export const enum ENetlifyEndpoint {
	NETLIFY_ADMIN_PANEL = '/.netlify/functions/adminPanel',
	NETLIFY_SUBSCRIPTION = '/.netlify/functions/newsSubscription',
	NETLIFY_ADMIN_AUTH = '/.netlify/functions/adminAuth',
	NETLIFY_ADMIN_LOGOUT = '/.netlify/functions/adminLogout',
	NETLIFY_CONTACT_FORM = '/.netlify/functions/contactForm',
	NETLIFY_MAKE_RESERVATION = '/.netlify/functions/makeReservation',
}

export interface TBodyFromNetlify<T> {
	message?: string;
	error_code?: number;
	packet?: T;
}

export type TNetlifyTo = {
	packet: any;
	need_auth?: boolean;
};
export type TNetlifyFrom<T> = {
	ok: boolean;
	status: number;
	message?: string;
	packet?: T;
	access_token?: string;
};

export type NetlifyResponse<T> = (response: TNetlifyFrom<T>) => void;

export function netlify<T>(
	endpoint: ENetlifyEndpoint,
	dataTo: TNetlifyTo,
	handleResponse: (response: TNetlifyFrom<T>) => void
) {
	const options: RequestInit = {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(dataTo.packet),
	};

	const result: TNetlifyFrom<T> = { ok: false, status: undefined };
	fetch(endpoint, options)
		.then(response => {
			// console.log(response.headers);
			result.ok = response.ok;
			result.status = response.status;
			return response.json();
		})
		.then((data: TBodyFromNetlify<T>) => {
			// if (!result.ok) console.log(data);
			if (data.message) result.message = data.message;
			if (result.ok && data.packet) result.packet = data.packet;

			handleResponse(result);
		})
		.catch(err => {
			result.message = 'Ошибка на стороне сервера.';
			handleResponse(result);
		});
}
