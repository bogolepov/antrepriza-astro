import theater from '@data/theater.json';
import dictionaryServer from '@data/dictionary_server.json';
import { fromHtmlToPlainText } from '../utils';
import type { TSubscriber } from '@scripts/types/subscription';

export function makeContentRegistration(
	lang: string,
	email: string,
	obj: string,
	sid: number,
	toAntrepriza: boolean
): string {
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

export function makeContentConfirmed(subscriber: TSubscriber) {
	const { email } = subscriber;
	return `\
<table border="0" cellpadding="0" role="presentation" style="width: 100%; margin: 0; padding: 0 0 15px 0"><tbody>\
<tr>\
<td style="line-height: 120%; color: #d6d6d6; vertical-align: top">Email :</td>\
<td style="line-height: 120%; color: #d6d6d6; vertical-align: top; padding: 0 0 0 8px">\
<a href='${'mailto:' + fromHtmlToPlainText(email)}' style="line-height: 120%; color: #d6d6d6">\
${fromHtmlToPlainText(email)}</a>
</tr>\
</tbody></table>\
`;
}
