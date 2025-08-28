import type { Handler, HandlerResponse } from '@netlify/functions';

import { LANG_RU } from '@scripts/consts.ts';
import { makeHandlerResponse } from '@netlify/lib/utils.ts';
import { ESubscriptionState, SubscriptionPacketSchema, type TSubscriptionPacket } from '@scripts/types/subscription.ts';
import { validateSubscriptionPacketData } from '@scripts/subscription.ts';
import { type TMail, sendMails } from '@netlify/lib/mailService.ts';
import { makeHtmlEmail } from '@netlify/lib/emails/mainEmailTemplate.ts';
import { makeContentConfirmed, makeContentRegistration } from '@netlify/lib/emails/subscription.ts';
import {
	confirmEmail,
	deleteEmail,
	ESubscriptionError,
	registerEmail,
	type TSubscriptionResult,
} from '@netlify/lib/db/subscription.ts';
import { extractSchemaFromJson } from '@scripts/utils';

import dictionaryServer from '@data/dictionary_server.json';

export const handler: Handler = async (event, context) => {
	if (!event || !event.body) return makeHandlerResponse(400, dictionaryServer.nf__invalid_request[LANG_RU]);

	const packet: TSubscriptionPacket = extractSchemaFromJson(SubscriptionPacketSchema, event.body);
	if (!packet) return makeHandlerResponse(400, dictionaryServer.nf__empty_request_data[LANG_RU]);
	if (!validateSubscriptionPacketData(packet))
		return makeHandlerResponse(400, dictionaryServer.nf__invalid_format[LANG_RU]);

	switch (packet.state) {
		case ESubscriptionState.REG_INIT:
			return await emailRegistration(packet);
		case ESubscriptionState.REG_CONFIRM:
			return await emailConfirmation(packet);
		case ESubscriptionState.REG_DELETE:
			return await emailRemoving(packet);
		default:
			const check: never = packet.state;
	}
};

async function emailRegistration(packet: TSubscriptionPacket): Promise<HandlerResponse> {
	const { lang, email } = packet;

	const res = await registerEmail(email, lang);
	if (res.error !== ESubscriptionError.NO_ERROR || !res.subscriber) {
		return makeHandlerResponse(500, dictionaryServer.email_service_error[lang]);
	}

	const { sid, obj } = res.subscriber;

	const transporterMail: string = process.env.ANTREPRIZA_EMAIL_SUBSCRIPTION;
	const subjectClient: string = dictionaryServer.email_news_subscription_reg_subject[lang];
	const clientMail: TMail = {
		to: email,
		subject: subjectClient,
		html: makeHtmlEmail(lang, subjectClient, makeContentRegistration(lang, email, obj, sid, false)),
	};

	const isSent = await sendMails(lang, transporterMail, clientMail);

	if (isSent) return makeHandlerResponse(200, dictionaryServer.nf__email_registration__ok[lang]);
	else return makeHandlerResponse(500, dictionaryServer.nf__email_registration__error[lang]);
}

async function emailConfirmation(packet: TSubscriptionPacket): Promise<HandlerResponse> {
	const { lang, sid, obj } = packet;

	const res: TSubscriptionResult = await confirmEmail(obj, sid);
	if (res.error !== ESubscriptionError.NO_ERROR || !res.subscriber) {
		return makeHandlerResponse(500, dictionaryServer.email_service_error[lang]);
	}

	const transporterMail: string = process.env.ANTREPRIZA_EMAIL_SUBSCRIPTION;
	const subjectClient: string = dictionaryServer.email_news_subscription_confirmed_subject[lang];
	const email: string =
		process.env.MODE === process.env.MODE_PRODUCTION
			? process.env.ANTREPRIZA_EMAIL_SUBSCRIPTION
			: process.env.ANTREPRIZA_EMAIL_BOGOLEPOV;

	const clientMail: TMail = {
		to: email,
		subject: subjectClient,
		html: makeHtmlEmail(lang, subjectClient, makeContentConfirmed(res.subscriber)),
	};

	await sendMails(lang, transporterMail, clientMail);

	return makeHandlerResponse(200, dictionaryServer.nf__email_confirmation__ok[lang]);
}

async function emailRemoving(packet: TSubscriptionPacket): Promise<HandlerResponse> {
	const { lang, usid, obj } = packet;

	const res = await deleteEmail(obj, usid);
	if (res.error !== ESubscriptionError.NO_ERROR || !res.subscriber) {
		return makeHandlerResponse(500, dictionaryServer.email_service_error[lang]);
	}

	return makeHandlerResponse(200, dictionaryServer.result_email_removed[lang]);
}
