import type { Handler } from '@netlify/functions';
import type { TContactForm } from '@scripts/types/contactForm.ts';
import { extractContactFormFromJson, isValidContactForm } from '@scripts/contact_form';
import { makeHtmlEmail } from './lib/mailUtils.ts';
import { type TMail, sendMails } from './lib/mailService.ts';
import { fromHtmlToPlainText, makeHandlerResponse, nonBreakingSpace } from './lib/utils.ts';
import dictionaryServer from '@data/dictionary_server.json';
import theater from '@data/theater.json';
import { LANG_RU } from '@scripts/consts.ts';

export const handler: Handler = async (event, context) => {
	if (!event || !event.body) return makeHandlerResponse(400, dictionaryServer.nf__invalid_request[LANG_RU]);

	const contactForm: TContactForm = extractContactFormFromJson(event.body);
	if (!contactForm) return makeHandlerResponse(400, dictionaryServer.nf__empty_request_data[LANG_RU]);
	if (!isValidContactForm(contactForm, false))
		return makeHandlerResponse(400, dictionaryServer.nf__invalid_format[LANG_RU]);

	const { lang, email, subject, topic } = contactForm;

	const transporterMail: string = process.env.ANTREPRIZA_EMAIL_INFO;
	let clientMail: TMail = {
		to: email,
		subject: subject,
		html: makeHtmlEmail(lang, topic, makeContent(contactForm, false)),
	};
	let antreprizaMail: TMail = {
		to: '',
		subject: subject,
		html: makeHtmlEmail(lang, topic, makeContent(contactForm, true)),
	};

	const isSent = await sendMails(lang, transporterMail, clientMail, antreprizaMail);

	if (isSent) return makeHandlerResponse(200, dictionaryServer.nf__contact_form__ok[lang]);
	else return makeHandlerResponse(500, dictionaryServer.nf__contact_form__send_error[lang]);
};

function makeContent(contactForm: TContactForm, toAntrepriza: boolean): string {
	return makePersonalMessage(contactForm, toAntrepriza) + makeContactFormBlock(contactForm);
}

function makePersonalMessage(contactForm: TContactForm, toAntrepriza: boolean): string {
	const { lang } = contactForm;
	const date = new Date(contactForm.now);

	const getHello = (hour: number): string => {
		if (hour < 6 && contactForm.lang === LANG_RU) return dictionaryServer.hello[lang];
		else if (hour < 12) return dictionaryServer.good_morning[lang];
		else if (hour < 18) return dictionaryServer.good_afternoon[lang];
		else return dictionaryServer.good_evening[lang];
	};

	let diffText: string;
	let strHello: string;

	if (toAntrepriza) {
		let options: Intl.DateTimeFormatOptions = {
			year: 'numeric',
			month: 'long',
			day: '2-digit',
			hour: '2-digit',
			minute: '2-digit',
		};
		let strCurrentDate: string = date.toLocaleDateString(lang, options);

		strHello = getHello(date.getHours()) + (lang === LANG_RU ? '!' : '.');
		diffText = `\
<tr><td style="font-size: 125%; padding-bottom: 15px; line-height: 120%; color: #d6d6d6; font-weight: 500">${strHello}</td></tr>\
<tr><td style="line-height: 120%; color: #d6d6d6">${dictionaryServer.email_contact_form_text_antrepriza[lang]}</td></tr>\
<tr><td style="font-size: 90%; line-height: 120%; color: #888888; font-weight: 500">[${strCurrentDate}]</td></tr>\
`;
	} else {
		strHello =
			getHello(date.getHours()) +
			(lang === LANG_RU ? ', ' : ' ') +
			fromHtmlToPlainText(contactForm.name) +
			(lang === LANG_RU ? '!' : '.');
		diffText = `\
<tr><td style="font-size: 125%; padding-bottom: 15px; line-height: 120%; color: #d6d6d6; font-weight: 500">${strHello}</td></tr>\
<tr><td style="line-height: 120%; color: #d6d6d6; padding-bottom: 15px">${dictionaryServer.email_contact_form_text[lang]}</td></tr>\
<tr><td style="line-height: 120%; color: #d6d6d6">${theater.longTheaterName[lang]}</td></tr>\
<tr><td style="line-height: 120%">\
<a href='${theater.our_website_link}/${lang}/' style="line-height: 120%; color: #d6d6d6">${theater.our_website_text}</a>\
</td></tr>\
`;
	}

	return `\
<table border="0" role="presentation" style="width: 100%; margin: 0; padding: 0 0 15px 0; border-bottom: 1px solid #d6d6d6">\
<tbody>\
${diffText}\
</tbody>\
</table>\
`;
}

function makeContactFormBlock(contactForm: TContactForm): string {
	const { lang, topic, name, email, message } = contactForm;

	return `\
<table border="0" cellpadding="0" role="presentation" style="width: 100%; margin: 0; padding: 15px 0 0 0">\
<tbody>\
<tr>\
<td style="line-height: 120%; color: #888888; vertical-align: top">${nonBreakingSpace(dictionaryServer.question_subject[lang] + ' :')}</td>\
<td style="line-height: 120%; color: #d6d6d6; vertical-align: top; padding: 0 0 10px 8px">${fromHtmlToPlainText(topic)}</td>\
</tr>\
<tr>\
<td style="line-height: 120%; color: #888888; vertical-align: top">${nonBreakingSpace(dictionaryServer.lang_name[lang] + ' :')}</td>\
<td style="line-height: 120%; color: #d6d6d6; vertical-align: top; padding: 0 0 10px 8px">${fromHtmlToPlainText(name)}</td>\
</tr>\
<tr>\
<td style="line-height: 120%; color: #888888; vertical-align: top">${nonBreakingSpace(dictionaryServer.lang_email[lang] + ' :')}</td>\
<td style="line-height: 120%; color: #d6d6d6; vertical-align: top; padding: 0 0 10px 8px">\
<a href='${'mailto:' + fromHtmlToPlainText(email)}' style="line-height: 120%; color: #d6d6d6">${fromHtmlToPlainText(email)}</a></td>\
</tr>\
<tr>\
<td style="line-height: 120%; color: #888888; vertical-align: top">${nonBreakingSpace(dictionaryServer.lang_message[lang] + ' :')}</td>\
<td style="line-height: 120%; color: #d6d6d6; vertical-align: top; padding: 0 0 10px 8px">${fromHtmlToPlainText(message)}</td>\
</tr>\
</tbody>\
</table>\
`;
}
