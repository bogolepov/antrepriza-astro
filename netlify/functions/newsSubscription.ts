import type { Handler, HandlerResponse } from '@netlify/functions';
import { LANG_RU } from '@scripts/consts.ts';
import { makeHandlerResponse } from '@netlify/lib/utils.ts';
import { ESubscriptionState, SubscriptionPacketSchema, type TSubscriptionPacket } from '@scripts/types/subscription.ts';
import { validateSubscriptionPacketData } from '@scripts/subscription.ts';
import { TemplateNames, createTransporter, getEmailHtml, sendMail } from '@netlify/lib/mailService.ts';
import { confirmEmail, deleteEmail, ESubscriptionError, registerEmail, type TSubscriptionResult } from '@netlify/lib/db/subscription.ts';
import { extractSchemaFromJson } from '@scripts/utils';

import dictionaryServer from '@data/dictionary_server.json';
import theater from '@data/theater.json';
import type { SubscriptionTheaterVariables, SubscriptionUserVariables } from './lib/mailVariables';

export const handler: Handler = async (event, context) => {
	if (!event || !event.body) return makeHandlerResponse(400, dictionaryServer.nf__invalid_request[LANG_RU]);

	const packet: TSubscriptionPacket = extractSchemaFromJson(SubscriptionPacketSchema, event.body);
	if (!packet) return makeHandlerResponse(400, dictionaryServer.nf__empty_request_data[LANG_RU]);
	if (!validateSubscriptionPacketData(packet)) return makeHandlerResponse(400, dictionaryServer.nf__invalid_format[LANG_RU]);

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

	const htmlVariables: SubscriptionUserVariables = {
		lang: lang,
		subject: dictionaryServer.email_news_subscription_reg_subject[lang],
		previewSubject: dictionaryServer.email_news_subscription_reg_subject_preview[lang],
		hello: dictionaryServer.dear_audience[lang] + (lang === 'ru' ? '!' : ','),
		happy_text: dictionaryServer.email_subscription_text[lang],
		verify_text: dictionaryServer.email_subscription_text2[lang],
		verify_url: `${theater.our_website_link}/${lang}/newsletter?obj=${obj}&sid=${sid}`,
		buttonText: dictionaryServer.email_subscription_button_text[lang],
		regards: dictionaryServer.email_subscription_text3[lang],
		team: theater.longTheaterName[lang],
	};

	const subject: string = dictionaryServer.email_news_subscription_reg_subject[lang];

	const { transporter, emailFrom } = createTransporter(process.env.ANTREPRIZA_EMAIL_SUBSCRIPTION, lang);
	if (
		!(await sendMail(transporter, {
			from: emailFrom,
			to: email,
			subject: subject,
			html: getEmailHtml(TemplateNames.subscription_user_verify, htmlVariables),
		}))
	) {
		return makeHandlerResponse(500, dictionaryServer.nf__email_registration__error[lang]);
	}

	return makeHandlerResponse(200, dictionaryServer.nf__email_registration__ok[lang]);
}

async function emailConfirmation(packet: TSubscriptionPacket): Promise<HandlerResponse> {
	const { lang, sid, obj } = packet;

	const res: TSubscriptionResult = await confirmEmail(obj, sid);
	if (res.error !== ESubscriptionError.NO_ERROR || !res.subscriber) {
		return makeHandlerResponse(500, dictionaryServer.email_service_error[lang]);
	}

	const subject: string = dictionaryServer.email_news_subscription_confirmed_subject[lang];
	const htmlVariables: SubscriptionTheaterVariables = {
		email: res.subscriber.email,
	};

	const { transporter, emailFrom, emailToAntrepriza } = createTransporter(process.env.ANTREPRIZA_EMAIL_SUBSCRIPTION, lang);

	await sendMail(transporter, {
		from: emailFrom,
		to: emailToAntrepriza,
		subject: subject,
		html: getEmailHtml(TemplateNames.subscription_theater_confirm, htmlVariables),
	});

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
