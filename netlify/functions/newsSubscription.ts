import type { Handler, HandlerResponse } from '@netlify/functions';
import { LANG_LIST, EMAIL_REGEX } from '@scripts/consts.ts';
import { fromHtmlToPlainText, makeHandlerResponse } from './lib/utils.ts';
import { makeHtmlEmail } from './lib/mailUtils.ts';
import { type TMail, sendMails } from './lib/mailService.ts';
import { type TAddEmailResult, Newsletters } from './lib/dbNewsletters.ts';

import dictionaryServer from '@public_data/dictionary_server.json';
import theater from '@public_data/theater.json';

export const handler: Handler = async (event, context) => {
	const messageData = JSON.parse(event.body);
	const { lang, email, sid, usid } = messageData;

	// spam checking
	if (!lang || !LANG_LIST.includes(lang)) {
		// fake OK-result
		return {
			statusCode: 200,
			body: JSON.stringify({
				message: 'Successfully',
			}),
		};
	}

	if (email && email.length > 0) return await emailRegistration(lang, email);
	else if (sid) return await emailConfirmation(lang, sid);
	else if (usid) return await emailRemoving(lang, usid);
};

async function emailRegistration(lang: string, email: string): Promise<HandlerResponse> {
	// spam checking
	if (!email || !EMAIL_REGEX.test(email) || email.length > 64)
		return makeHandlerResponse(200, 'Email sent successfully');

	Newsletters.openDatabase();
	const res: TAddEmailResult = Newsletters.addNewEmail(lang, email);
	Newsletters.closeDatabase();
	const sid: number = res.sid;
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
		html: makeHtmlEmail(lang, subjectClient, makeContentRegistration(lang, email, sid, false)),
	};
	const antreprizaMail: TMail = {
		to: '',
		subject: subjectAntrepriza,
		html: makeHtmlEmail(lang, subjectAntrepriza, makeContentRegistration(lang, email, sid, true)),
	};

	const isSent = await sendMails(lang, transporterMail, clientMail, antreprizaMail);

	if (isSent) return makeHandlerResponse(200, dictionaryServer.nf__email_registration__ok[lang]);
	else return makeHandlerResponse(500, dictionaryServer.nf__email_registration__error[lang]);
}

function makeContentRegistration(lang: string, email: string, sid: number, toAntrepriza: boolean): string {
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
<a href='https://antrepriza.eu/${lang}/newsletter?sid=${sid}' \
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

async function emailConfirmation(lang: string, sid: number): Promise<HandlerResponse> {
	Newsletters.openDatabase();
	let res: boolean = Newsletters.confirmEmail(sid);
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

async function emailRemoving(lang: string, usid: number): Promise<HandlerResponse> {
	Newsletters.openDatabase();
	let res: boolean = Newsletters.removeEmail(usid);
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
