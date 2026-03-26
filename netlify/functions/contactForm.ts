import type { Handler } from '@netlify/functions';
import { ContactFormSchema, type TContactForm } from '@scripts/types/contactForm.ts';
import { isValidContactForm } from '@scripts/contact_form';
import { TemplateNames, createTransporter, getEmailHtml, sendMail } from './lib/mailService.ts';
import { fromHtmlToPlainText, makeHandlerResponse } from './lib/utils.ts';
import dictionaryServer from '@data/dictionary_server.json';
import theater from '@data/theater.json';
import { LANG_RU } from '@scripts/consts.ts';
import { extractSchemaFromJson } from '@scripts/utils.ts';
import { getHello } from './utils/time.ts';
import type { ContactFormVariables } from './lib/mailVariables.ts';

export const handler: Handler = async (event, context) => {
	if (!event || !event.body) return makeHandlerResponse(400, dictionaryServer.nf__invalid_request[LANG_RU]);

	const contactForm: TContactForm = extractSchemaFromJson(ContactFormSchema, event.body);
	if (!contactForm) return makeHandlerResponse(400, dictionaryServer.nf__empty_request_data[LANG_RU]);
	if (!isValidContactForm(contactForm, false)) return makeHandlerResponse(400, dictionaryServer.nf__invalid_format[LANG_RU]);

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
		hello: toAntrepriza
			? getHello(date.getHours(), lang) + (lang === LANG_RU ? '!' : '.')
			: getHello(date.getHours(), lang) +
				(lang === LANG_RU ? ', ' : ' ') +
				fromHtmlToPlainText(contactForm.name) +
				(lang === LANG_RU ? '!' : '.'),
		main_text: toAntrepriza ? dictionaryServer.email_contact_form_text_antrepriza[lang] : dictionaryServer.email_contact_form_text[lang],
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
