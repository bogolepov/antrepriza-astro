import { LANG_LIST } from './consts';
import {
	ESubscriptionAction,
	SUBSCRIPTION_KEY_LENGTH,
	SubscriptionPacketSchema,
	type TSubscriptionPacket,
} from './types/subscription';
import { getCRC32, validEmailAddressFormat } from './utils';

export function sendSubscriptionPacket(
	formData: TSubscriptionPacket,
	handleSendResult: (isOk: boolean, msg: string) => void
): void {
	const options = {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(formData),
	};

	let isOk: boolean;
	fetch('/.netlify/functions/newsSubscription', options)
		.then(response => {
			isOk = response.ok;
			return response.json();
		})
		.then(data => {
			// console.log(data.message);
			if (isOk) handleSendResult(true, data.message);
			else throw new Error(data.message);
		})
		.catch(err => handleSendResult(false, err.message));
}

export function validationSubscriptionPacketJson(json_data: string): TSubscriptionPacket | undefined {
	console.log(json_data);
	const result = SubscriptionPacketSchema.safeParse(JSON.parse(json_data));
	if (result.success) {
		const packet: TSubscriptionPacket = result.data;
		return packet;
	} else {
		// console.error('Ошибка валидации:', z.treeifyError(result.error));
		return undefined;
	}
}

export function validateSubscriptionPacketData(packet: TSubscriptionPacket, includeCheck: boolean): boolean {
	if (LANG_LIST.includes(packet.lang) && validMainData(packet)) {
		if (includeCheck) return validCheckSumm(packet);
		else return true;
	}
	return false;
}

function validCheckSumm(packet: TSubscriptionPacket): boolean {
	const basePacket: TSubscriptionPacket = JSON.parse(JSON.stringify(packet));
	basePacket.check = '';
	return packet.check === getCRC32(basePacket);
}

function validMainData(packet: TSubscriptionPacket): boolean {
	switch (packet.action) {
		case ESubscriptionAction.REG_INIT:
			return !packet.key.length && !packet.sid && !packet.usid && validEmailAddressFormat(packet.email);
		case ESubscriptionAction.REG_CONFIRM:
			return packet.key.length === SUBSCRIPTION_KEY_LENGTH && packet.sid && !packet.usid && !packet.email.length;
		case ESubscriptionAction.REG_DELETE:
			return packet.key.length === SUBSCRIPTION_KEY_LENGTH && !packet.sid && packet.usid && !packet.email.length;
		default:
			return false;
	}
}
