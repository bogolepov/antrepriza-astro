import nodemailer from 'nodemailer';
import fs from 'fs';
// import { NewslettersDB } from './lib/antreprizaDB.cjs';
import { LANG_LIST, EMAIL_REGEX } from './lib/consts.cjs';
import { fromHtmlToPlainText } from './lib/utils.cjs';

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

	const transporter = nodemailer.createTransport({
		service: 'gmail',
		auth: {
			user: process.env.ANTREPRIZA_TRANSPORT_EMAIL,
			pass: process.env.ANTREPRIZA_TRANSPORT_PASSWORD,
		},
	});

	// const transporter = nodemailer.createTransport({
	// 	pool: true,
	// 	host: process.env.ANTREPRIZA_SMTP_HOST,
	// 	port: 465,
	// 	secure: true, // use TLS
	// 	auth: {
	// 		user: process.env.ANTREPRIZA_EMAIL_INFO,
	// 		pass: process.env.ANTREPRIZA_SMTP_PASSWORD,
	// 	},
	// });

	const mailOptions = {
		from: `${theater.longTheaterName[lang]} <${process.env.ANTREPRIZA_TRANSPORT_EMAIL}>`,
		// from: `${theater.longTheaterName[lang]} <${process.env.ANTREPRIZA_EMAIL_INFO}>`,
		to: email,
		subject: subject,
		html: makeHtmlEmail(lang, topic, name, email, message, false),
	};

	let mailTo;
	if (process.env.MODE === process.env.MODE_PRODUCTION) {
		mailTo = process.env.ANTREPRIZA_EMAIL_INFO + ', ' + process.env.ANTREPRIZA_EMAIL_MAMONTOV;
	} else {
		mailTo = process.env.ANTREPRIZA_EMAIL_BOGOLEPOV;
	}
	const mailOptionsAntrepriza = {
		from: `${theater.longTheaterName[lang]} <${process.env.ANTREPRIZA_TRANSPORT_EMAIL}>`,
		// from: `${theater.longTheaterName[lang]} <${process.env.ANTREPRIZA_EMAIL_SUBSCRIPTION}>`,
		to: mailTo,
		subject: subject,
		html: makeHtmlEmail(lang, topic, name, email, message, now, true),
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

// function fromHtmlToText(str) {
// 	if (str) {
// 		str = str.replaceAll('<', '&lt;');
// 		str = str.replaceAll('>', '&gt;');
// 	}
// 	return str;
// }

function makeHtmlEmail(lang, topic, name, email, message, now, forAntrepriza = false) {
	return (
		`<!DOCTYPE html><html lang="${lang}">` + makeHead(lang) + makeBody(lang, topic, name, email, message, now, forAntrepriza) + `</html>`
	);
}

function makeHead(lang) {
	let htmlHead =
		'<head><meta charset="UTF-8"><meta http-equiv="content-type" content="text/html"><title>' +
		theater.shortTheaterName[lang] +
		' - ' +
		dictionaryServer.email_news_subscription_reg_subject[lang] +
		'</title><meta name="viewport" content="width=device-width, initial-scale=1.0"><style>' +
		'table {border-spacing:0;} td {vertical-align:top;}' +
		'.email-body {font-size:16px;background-color:#292929;color:#d6d6d6;}' +
		'.email-body a {color:#d6d6d6;text-decoration:none;} .email-body .im * {color:#d6d6d6;}' +
		'.body-table {width:100%;}' +
		'.email-wrapper {padding:2rem;margin-left:auto;margin-right:auto;} ' +
		'.lh12 {line-height:1.2em;} .fcw {color:#d6d6d6;} .fcg{color:#888888;} .b700 {font-weight:700;} .m50 {margin:50px 0;}' +
		// sdv
		'.hello-titel {font-size:1.35rem;margin-bottom:15px;line-height:1.2em;}' +
		'.user-table {margin-bottom:15px;border-top:1px solid #d6d6d6;padding-top:12px;}' +
		'.user-table tr td {min-width:5em;color:#d6d6d6;}' +
		'</style></head>';

	return htmlHead;
}

function makeBody(lang, topic, name, email, message, now, forAntrepriza) {
	return (
		`<body><div class='email-body'><table class='body-table'><tbody><tr><td class='email-wrapper'>` +
		makeTextForRecipient(lang, name, now, forAntrepriza) +
		makeQuestionBlock(lang, topic, name, email, message) +
		`</td></tr></tbody></table></div></body>`
	);
}

function makeTextForRecipient(lang, name, now, forAntrepriza) {
	const date = new Date(now);
	let getHello = hour => {
		if (hour < 6 && lang === 'ru') return dictionaryServer.hello[lang];
		else if (hour < 12) return dictionaryServer.good_morning[lang];
		else if (hour < 18) return dictionaryServer.good_afternoon[lang];
		else return dictionaryServer.good_evening[lang];
	};

	if (forAntrepriza) {
		let options = {
			year: 'numeric',
			month: 'long',
			day: '2-digit',
			hour: '2-digit',
			minute: '2-digit',
		};
		let strCurrentDate = date.toLocaleDateString(lang, options);

		let strHello = getHello(date.getHours()) + (lang === 'ru' ? '!' : ',');
		return (
			`<div class='hello-titel b700 fcw'>${strHello}</div>` +
			`<p class='lh12 fcw'>${dictionaryServer.email_feedback_form_text_antrepriza[lang]} <span class='fcg'>[${strCurrentDate}]</span></p>`
		);
	} else {
		let strHello = getHello(date.getHours()) + (lang === 'ru' ? ', ' : ' ') + fromHtmlToPlainText(name) + (lang === 'ru' ? '!' : ',');
		return (
			`<div class='hello-titel b700'>${strHello}</div>` +
			`<p class='lh12 fcw'>${dictionaryServer.email_feedback_form_text[lang]}</p>` +
			`<p class='lh12 fcw'>${dictionaryServer.your__theater[lang]} ` +
			`<a href='${theater.main_website}/${lang}' class='lh12 fcw'>${theater.longTheaterName[lang]}</a></p>`
		);
	}
}

function makeQuestionBlock(lang, topic, name, email, message) {
	return (
		`<table class='user-table'>` +
		`<tr><td><span class='fcg'>${dictionaryServer.question_subject[lang] + ' :'}</span></td><td>${fromHtmlToPlainText(topic)}</td></tr>` +
		`<tr><td><span class='fcg'>${dictionaryServer.lang_name[lang] + ' :'}</span</td><td>${fromHtmlToPlainText(name)}</td></tr>` +
		`<tr><td><span class='fcg'>${dictionaryServer.lang_email[lang] + ' :'}</span</td><td>${fromHtmlToPlainText(email)}</td></tr>` +
		`<tr><td><span class='fcg'>${dictionaryServer.lang_message[lang] + ' :'}</span</td><td>${fromHtmlToPlainText(message)}</td></tr>` +
		`</table>`
	);

	/* 
	<table class='user-table'><tr><td class='fcg'>Topic</td><td>Tickets</td></tr><tr><td class='fcg'>Message: </td><td></td></tr><tr><td></td><td>bla bla bla fvbklnköv  dflvbadöfl dkvalkdf</td></tr></table>
  */
}
