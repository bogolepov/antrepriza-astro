import type { Handler, HandlerResponse } from '@netlify/functions';
import { LANG_RU } from '@scripts/consts.ts';
import { fromHtmlToPlainText, makeHandlerResponse } from './lib/utils.ts';
import { makeHtmlEmail } from './lib/mailUtils.ts';
import { type TMail, sendMails } from './lib/mailService.ts';
import { type TAddEmailResult, Newsletters } from './lib/dbNewsletters.ts';

import dictionaryServer from '@data/dictionary_server.json';
import theater from '@data/theater.json';
import { ESubscriptionAction, type TSubscriptionPacket } from '@scripts/types/subscription.ts';
import { extractSubscriptionPacketFromJson, validateSubscriptionPacketData } from '@scripts/subscription.ts';

export const handler: Handler = async (event, context) => {
	if (!event || !event.body) return makeHandlerResponse(400, dictionaryServer.nf__invalid_request[LANG_RU]);

	const packet: TSubscriptionPacket = extractSubscriptionPacketFromJson(event.body);
	if (!packet) return makeHandlerResponse(400, dictionaryServer.nf__empty_request_data[LANG_RU]);
	if (!validateSubscriptionPacketData(packet, true))
		return makeHandlerResponse(400, dictionaryServer.nf__invalid_format[LANG_RU]);

	switch (packet.action) {
		case ESubscriptionAction.REG_INIT:
			return await emailRegistration(packet);
		case ESubscriptionAction.REG_CONFIRM:
			return await emailConfirmation(packet);
		case ESubscriptionAction.REG_DELETE:
			return await emailRemoving(packet);
	}
};

async function emailRegistration(packet: TSubscriptionPacket): Promise<HandlerResponse> {
	const { lang, email } = packet;

	Newsletters.openDatabase();
	const res: TAddEmailResult = Newsletters.addNewEmail(lang, email);
	Newsletters.closeDatabase();
	const { sid, obj } = res;
	if (sid === 0) {
		console.error(dictionaryServer.email_service_error[lang]);
		return makeHandlerResponse(500, dictionaryServer.email_service_error[lang]);
	}

	const transporterMail: string = process.env.ANTREPRIZA_EMAIL_SUBSCRIPTION;
	const subjectClient: string = dictionaryServer.email_news_subscription_reg_subject[lang];
	const subjectAntrepriza: string = dictionaryServer.email_news_subscription_reg_subject_antrepriza[lang];

	const clientMail: TMail = {
		to: email,
		subject: subjectClient,
		html: makeHtmlEmail(lang, subjectClient, makeContentRegistration(lang, email, obj, sid, false)),
	};
	const antreprizaMail: TMail = {
		to: '',
		subject: subjectAntrepriza,
		html: makeHtmlEmail(lang, subjectAntrepriza, makeContentRegistration(lang, email, obj, sid, true)),
	};

	const isSent = await sendMails(lang, transporterMail, clientMail, antreprizaMail);

	if (isSent) return makeHandlerResponse(200, dictionaryServer.nf__email_registration__ok[lang]);
	else return makeHandlerResponse(500, dictionaryServer.nf__email_registration__error[lang]);
}

function makeContentRegistration(lang: string, email: string, obj: string, sid: number, toAntrepriza: boolean): string {
	let diffText: string;
	if (toAntrepriza) {
		diffText = `\
<tr><td colspan="2" style="font-size: 125%; padding-bottom: 15px; line-height: 120%; color: #d6d6d6; font-weight: 500">\
${dictionaryServer.new_subscription_text[lang]}\
</td></tr>\
<tr>\
<td style="line-height: 120%; color: #d6d6d6; vertical-align: top">Email :</td>\
<td style="line-height: 120%; color: #d6d6d6; vertical-align: top; padding: 0 0 5px 8px">
<a href='${'mailto:' + fromHtmlToPlainText(email)}' style="line-height: 120%; color: #d6d6d6">${fromHtmlToPlainText(email)}</a></td>\
</tr>\
<tr>\
<td style="line-height: 120%; color: #d6d6d6; vertical-align: top">SID :</td>\
<td style="line-height: 120%; color: #d6d6d6; vertical-align: top; padding: 0 0 0 8px">${sid}</td>\
</tr>\
`;
	} else {
		const strHello: string = dictionaryServer.dear_audience[lang] + (lang === 'ru' ? '!' : ',');
		diffText = `\
<tr><td style="font-size: 125%; padding-bottom: 15px; line-height: 120%; color: #d6d6d6; font-weight: 500">${strHello}</td></tr>\
<tr><td style="line-height: 120%; color: #d6d6d6; padding-bottom: 15px">${dictionaryServer.email_subscription_text[lang]}</td></tr>\
<tr><td style="line-height: 120%; color: #d6d6d6; padding-bottom: 45px">${dictionaryServer.email_subscription_text2[lang]}</td></tr>\
<tr><td style="line-height: 120%; padding-bottom: 45px">\
<a href='https://antrepriza.eu/${lang}/newsletter?obj=${obj}&sid=${sid}' \
 style="font-size: 105%; font-weight: 500; line-height: 120%; color: #87605e; border: 1px solid #87605e; padding: 10px 20px 10px 20px; text-decoration: none">\
${dictionaryServer.email_subscription_button_text[lang]}</a>\
</td></tr>\
<tr><td style="line-height: 120%; color: #d6d6d6; padding: 0 0 15px 0">${dictionaryServer.email_subscription_text3[lang]}</td></tr>\
<tr><td style="line-height: 120%; color: #d6d6d6; padding: 0">${theater.longTheaterName[lang]}</td></tr>\
<tr><td style="line-height: 120%; padding: 0">\
<a href='${theater.our_website_link}/${lang}/' style="line-height: 120%; color: #d6d6d6">${theater.our_website_text}</a>\
</td></tr>\
`;
	}

	return `\
<table border="0" cellpadding="0" role="presentation" style="width: 100%; margin: 0; padding: 0 0 15px 0"><tbody>\
${diffText}\
</tbody></table>\
`;
}

async function emailConfirmation(packet: TSubscriptionPacket): Promise<HandlerResponse> {
	const { lang, sid, obj } = packet;
	Newsletters.openDatabase();
	let res: boolean = Newsletters.confirmEmail(obj, sid);
	Newsletters.closeDatabase();
	if (!res) {
		console.error(dictionaryServer.email_service_error[lang]);
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
		html: makeHtmlEmail(lang, subjectClient, makeContentConfirmed(sid)),
	};

	const isSent = await sendMails(lang, transporterMail, clientMail);

	if (isSent) return makeHandlerResponse(200, dictionaryServer.nf__email_confirmation__ok[lang]);
	else return makeHandlerResponse(500, dictionaryServer.email_service_error[lang]);
}

function makeContentConfirmed(sid: number) {
	return `\
<table border="0" cellpadding="0" role="presentation" style="width: 100%; margin: 0; padding: 0 0 15px 0"><tbody>\
<tr>\
<td style="line-height: 120%; color: #d6d6d6; vertical-align: top">SID :</td>\
<td style="line-height: 120%; color: #d6d6d6; vertical-align: top; padding: 0 0 0 8px">${sid}</td>\
</tr>\
</tbody></table>\
`;
}

async function emailRemoving(packet: TSubscriptionPacket): Promise<HandlerResponse> {
	const { lang, usid, obj } = packet;

	Newsletters.openDatabase();
	let res: boolean = Newsletters.removeEmail(obj, usid);
	Newsletters.closeDatabase();
	if (!res) {
		console.error(dictionaryServer.email_service_error[lang]);
		return {
			statusCode: 500,
			body: JSON.stringify({
				message: dictionaryServer.email_service_error[lang],
			}),
		};
	}

	return {
		statusCode: 200,
		body: JSON.stringify({
			message: dictionaryServer.result_email_removed[lang],
		}),
	};
}
