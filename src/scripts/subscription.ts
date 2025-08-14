import { LANG_LIST } from './consts';
import { ESubscriptionState, SUBSCRIPTION_OBJ_LENGTH, type TSubscriptionPacket } from './types/subscription';
import { validEmailAddressFormat } from './utils';

export function validateSubscriptionPacketData(packet: TSubscriptionPacket): boolean {
	if (LANG_LIST.includes(packet.lang) && validMainData(packet)) return true;
	return false;
}

function validMainData(packet: TSubscriptionPacket): boolean {
	switch (packet.state) {
		case ESubscriptionState.REG_INIT:
			return !packet.obj.length && !packet.sid && !packet.usid && validEmailAddressFormat(packet.email);
		case ESubscriptionState.REG_CONFIRM:
			return packet.obj.length === SUBSCRIPTION_OBJ_LENGTH && packet.sid && !packet.usid && !packet.email.length;
		case ESubscriptionState.REG_DELETE:
			return packet.obj.length === SUBSCRIPTION_OBJ_LENGTH && !packet.sid && packet.usid && !packet.email.length;
		default:
			return false;
	}
}
