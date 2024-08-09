import nodemailer from 'nodemailer';
import fs from 'fs';
import { LANG_LIST, EMAIL_REGEX } from './lib/consts.cjs';
import { fromHtmlToPlainText, nonBreakingSpace } from './lib/utils.cjs';
import { makeHtmlEmail } from './lib/emailUtils.cjs';

let dictionaryServer;
let theater;

export const handler = async (event, context) => {
	try {
		let data = fs.readFileSync('./public/data/dictionary_server.json');
		dictionaryServer = JSON.parse(data);

		data = fs.readFileSync('./public/data/theater.json');
		theater = JSON.parse(data);
	} catch (error) {
		console.error(error);
	}

	const messageData = JSON.parse(event.body);

	// spam checking
	if (!validateMessage(messageData)) {
		// fake OK-result
		return {
			statusCode: 200,
			body: JSON.stringify({
				message: 'Email sent successfully',
			}),
		};
	}

	const { lang, subject, topic, name, email, message, now } = messageData;

	// const transporter = nodemailer.createTransport({
	// 	service: 'gmail',
	// 	auth: {
	// 		user: process.env.ANTREPRIZA_TRANSPORT_EMAIL,
	// 		pass: process.env.ANTREPRIZA_TRANSPORT_PASSWORD,
	// 	},
	// });

	const transporter = nodemailer.createTransport({
		pool: true,
		host: process.env.ANTREPRIZA_SMTP_HOST,
		port: 465,
		secure: true, // use TLS
		auth: {
			user: process.env.ANTREPRIZA_EMAIL_INFO,
			pass: process.env.ANTREPRIZA_SMTP_PASSWORD,
		},
	});

	const mailOptions = {
		// from: `${theater.longTheaterName[lang]} <${process.env.ANTREPRIZA_TRANSPORT_EMAIL}>`,
		from: `${theater.longTheaterName[lang]} <${process.env.ANTREPRIZA_EMAIL_INFO}>`,
		to: email,
		subject: subject,
		html: makeHtmlEmail(lang, topic, makeContent(lang, topic, name, email, message, now, false)),
	};

	let mailTo;
	if (process.env.MODE === process.env.MODE_PRODUCTION) {
		mailTo = process.env.ANTREPRIZA_EMAIL_INFO + ', ' + process.env.ANTREPRIZA_EMAIL_MAMONTOV;
	} else {
		mailTo = process.env.ANTREPRIZA_EMAIL_BOGOLEPOV;
	}
	const mailOptionsAntrepriza = {
		// from: `${theater.longTheaterName[lang]} <${process.env.ANTREPRIZA_TRANSPORT_EMAIL}>`,
		from: `${theater.longTheaterName[lang]} <${process.env.ANTREPRIZA_EMAIL_INFO}>`,
		to: mailTo,
		subject: subject,
		html: makeHtmlEmail(lang, topic, makeContent(lang, topic, name, email, message, now, true)),
	};

	try {
		await transporter.sendMail(mailOptions);

		try {
			await transporter.sendMail(mailOptionsAntrepriza);
		} catch (error) {}

		return {
			statusCode: 200,
			body: JSON.stringify({
				message: 'Email sent successfully',
			}),
		};
	} catch (error) {
		console.error(error);
		return {
			statusCode: 500,
			body: JSON.stringify({
				message: error.message,
			}),
		};
	}
};

function validateMessage(messageData) {
	if (!messageData || !messageData.lang || !LANG_LIST.includes(messageData.lang)) return false;
	if (!messageData.subject || !messageData.subject.includes(' - ')) return false;
	if (!messageData.topic || !messageData.name || messageData.name.length < 2) return false;
	if (messageData.phone !== messageData.topic + messageData.name) return false;
	if (!messageData.email || !EMAIL_REGEX.test(messageData.email) || messageData.email.length < 5 || messageData.email.length > 64)
		return false;
	if (!messageData.message || messageData.message.length < 10 || messageData.now <= 0) return false;
	return true;
	/*
	if (
		messageData &&
		messageData.subject &&
		messageData.subject.includes(' - ') &&
		messageData.topic &&
		messageData.name &&
		messageData.name.length >= 2 &&
		messageData.phone === messageData.topic + messageData.name &&
		messageData.email &&
		Consts.EMAIL_REGEX.test(messageData.email) &&
		messageData.email.length >= 5 &&
		messageData.email.length <= 64 &&
		messageData.message &&
		messageData.message.length >= 10 &&
		messageData.now)
		return true;
	else return false;
	*/
}

function makeContent(lang, topic, name, email, message, now, toAntrepriza) {
	return makePersonalMessage(lang, name, now, toAntrepriza) + makeFeedbackBlock(lang, topic, name, email, message);
}

function makePersonalMessage(lang, name, now, toAntrepriza) {
	const date = new Date(now);
	let getHello = hour => {
		if (hour < 6 && lang === 'ru') return dictionaryServer.hello[lang];
		else if (hour < 12) return dictionaryServer.good_morning[lang];
		else if (hour < 18) return dictionaryServer.good_afternoon[lang];
		else return dictionaryServer.good_evening[lang];
	};

	let diffText;
	let strHello;

	if (toAntrepriza) {
		let options = {
			year: 'numeric',
			month: 'long',
			day: '2-digit',
			hour: '2-digit',
			minute: '2-digit',
		};
		let strCurrentDate = date.toLocaleDateString(lang, options);

		strHello = getHello(date.getHours()) + (lang === 'ru' ? '!' : ',');
		diffText = `\
<tr><td style="font-size: 125%; padding-bottom: 15px; line-height: 120%; color: #d6d6d6; font-weight: 500">${strHello}</td></tr>\
<tr><td style="line-height: 120%; color: #d6d6d6">${dictionaryServer.email_feedback_form_text_antrepriza[lang]}</td></tr>\
<tr><td style="font-size: 90%; line-height: 120%; color: #888888; font-weight: 500">[${strCurrentDate}]</td></tr>\
`;
	} else {
		strHello = getHello(date.getHours()) + (lang === 'ru' ? ', ' : ' ') + fromHtmlToPlainText(name) + (lang === 'ru' ? '!' : ',');
		diffText = `\
<tr><td style="font-size: 125%; padding-bottom: 15px; line-height: 120%; color: #d6d6d6; font-weight: 500">${strHello}</td></tr>\
<tr><td style="line-height: 120%; color: #d6d6d6; padding-bottom: 15px">${dictionaryServer.email_feedback_form_text[lang]}</td></tr>\
<tr><td style="line-height: 120%; color: #d6d6d6">${theater.longTheaterName[lang]}</td></tr>\
<tr><td style="line-height: 120%">\
<a href='${theater.our_website_link}/${lang}' style="line-height: 120%; color: #d6d6d6">${theater.our_website_text}</a>\
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

let feedbackBlock;
function makeFeedbackBlock(lang, topic, name, email, message) {
	if (feedbackBlock) return feedbackBlock;

	feedbackBlock = `\
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
	return feedbackBlock;
}
