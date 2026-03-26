import type { Handler } from '@netlify/functions';
import { ContactFormSchema, type TContactForm } from '@scripts/types/contactForm.ts';
import { isValidContactForm } from '@scripts/contact_form';
import {
	type ContactFormVariables,
	TemplateNames,
	createTransporter,
	getEmailHtml,
	sendMail,
} from './lib/mailService.ts';
import { fromHtmlToPlainText, makeHandlerResponse, nonBreakingSpace } from './lib/utils.ts';
import dictionaryServer from '@data/dictionary_server.json';
import theater from '@data/theater.json';
import { LANG_RU } from '@scripts/consts.ts';
import { extractSchemaFromJson } from '@scripts/utils.ts';
import { getHello } from './utils/time.ts';

export const handler: Handler = async (event, context) => {
	if (!event || !event.body) return makeHandlerResponse(400, dictionaryServer.nf__invalid_request[LANG_RU]);

	const contactForm: TContactForm = extractSchemaFromJson(ContactFormSchema, event.body);
	if (!contactForm) return makeHandlerResponse(400, dictionaryServer.nf__empty_request_data[LANG_RU]);
	if (!isValidContactForm(contactForm, false))
		return makeHandlerResponse(400, dictionaryServer.nf__invalid_format[LANG_RU]);

	const { lang, email, subject, topic, name, message } = contactForm;

	const date = new Date(contactForm.now);
	const timestamp = date.toLocaleDateString(lang, {
		year: 'numeric',
		month: 'long',
		day: '2-digit',
		hour: '2-digit',
		minute: '2-digit',
	});

	const getHtmlVariables = (toAntrepriza: boolean): ContactFormVariables => ({
		lang: lang,
		subject: subject,
		// previewSubject: '',
		hello: toAntrepriza
			? getHello(date.getHours(), lang) + (lang === LANG_RU ? '!' : '.')
			: getHello(date.getHours(), lang) +
				(lang === LANG_RU ? ', ' : ' ') +
				fromHtmlToPlainText(contactForm.name) +
				(lang === LANG_RU ? '!' : '.'),
		main_text: toAntrepriza
			? dictionaryServer.email_contact_form_text_antrepriza[lang]
			: dictionaryServer.email_contact_form_text[lang],
		...(toAntrepriza && { timestamp: timestamp }),
		team: theater.longTheaterName[lang],
		topic_label: dictionaryServer.question_subject[lang] + ' :',
		topic: topic,
		name_label: dictionaryServer.lang_name[lang] + ' :',
		name: name,
		email_label: dictionaryServer.lang_email[lang] + ' :',
		email: email,
		message_label: dictionaryServer.lang_message[lang] + ' :',
		message: message,
	});

	const { transporter, emailFrom, emailToAntrepriza } = createTransporter(process.env.ANTREPRIZA_EMAIL_INFO, lang);
	if (
		!(await sendMail(transporter, {
			from: emailFrom,
			to: emailToAntrepriza,
			subject: subject,
			html: getEmailHtml(TemplateNames.contact_form, getHtmlVariables(true)),
		}))
	) {
		return makeHandlerResponse(500, dictionaryServer.nf__contact_form__send_error[lang]);
	} else {
		// Отправляем письмо клиенту только если письмо для Антрепризы успешно отправлено
		// Результат отправки письма клиенту не критичен, поэтому не обрабатываем
		// возможные ошибки при отправке клиентского письма
		await sendMail(transporter, {
			from: emailFrom,
			to: email,
			subject: subject,
			html: getEmailHtml(TemplateNames.contact_form, getHtmlVariables(false)),
		});
		return makeHandlerResponse(200, dictionaryServer.nf__contact_form__ok[lang]);
	}
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
