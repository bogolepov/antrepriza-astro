import nodemailer from 'nodemailer';
import fs from 'fs';
import { NewslettersDB } from './lib/antreprizaDB.cjs';

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
	const { lang, email, sid, usid } = messageData;

	if (email && email.length > 0) return await emailRegistration(lang, email);
	else if (sid) return emailConfirmation(lang, sid);
	else if (usid) return emailRemoving(lang, usid);

	async function emailRegistration(lang, email) {
		const testFolder = './';
		console.log('newsSubscription: scan all files in current directory...');
		fs.readdirSync(testFolder).forEach(file => {
			console.log(file);
		});
		console.log('...scanned');

		console.log('emailRegistration 1');
		NewslettersDB.openDatabase();
		// dbNewsletters.initDatabase();
		console.log('emailRegistration 2');
		let res = NewslettersDB.addNewEmail(lang, email);
		// console.log(res);
		console.log('emailRegistration 3');
		NewslettersDB.closeDatabase();
		// dbNewsletters.closeDatabase();
		console.log('emailRegistration 4');
		const sid = res.sid;
		if (sid === 0) {
			console.error(dictionaryServer.email_service_error[lang]);
			return {
				statusCode: 500,
				body: JSON.stringify({
					message: dictionaryServer.email_service_error[lang],
				}),
			};
		}
		console.log('emailConfirmation 5');

		const transporter = nodemailer.createTransport({
			service: 'gmail',
			auth: {
				user: process.env.ANTREPRIZA_EMAIL,
				pass: process.env.ANTREPRIZA_PASSWORD,
			},
		});

		const htmlEmail = makeHtmlEmail(lang, email, sid);

		const mailOptions = {
			from: `${theater.longTheaterName[lang]} <${process.env.ANTREPRIZA_EMAIL}>`,
			to: email,
			subject: `${dictionaryServer.email_news_subscription_subject[lang]}`,
			html: htmlEmail,
		};

		try {
			// console.log('call sendMail.......');
			// console.log(mailOptions);

			await transporter.sendMail(mailOptions);
			// console.log('result:');
			// console.log(info);

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
	}

	function makeHtmlEmail(lang, email, sid) {
		return `<!DOCTYPE html><html lang="${lang}">` + makeHead(lang) + makeBody(lang, email, sid) + `</html>`;
	}

	function makeHead(lang) {
		let htmlHead =
			'<head><meta charset="UTF-8"><title>' +
			theater.shortTheaterName[lang] +
			' - ' +
			dictionaryServer.email_news_subscription_subject[lang] +
			'</title><style>' +
			'table {border-spacing:0;} td {vertical-align:top;}' +
			'.email-body {font-size:16px;background-color:#292929;color:#d6d6d6;}' +
			'.email-body a {color:#d6d6d6;text-decoration:none;} .email-body .im * {color:#d6d6d6;}' +
			'.body-table {width:100%;}' +
			'.email-wrapper {padding:2rem;margin-left:auto;margin-right:auto;} ' +
			'.reservation-titel {font-size:1.35rem;margin-bottom:15px;line-height:1.2em;}' +
			'.lh12 {line-height:1.2em;} .fcw {color:#d6d6d6;} .b700 {font-weight:700;} .m50 {margin:50px 0;}' +
			'.confirm-button {border:1px solid #87605e;padding:10px 20px;text-decoration:none;line-height:1.2em;}' +
			'.email-body a.confirm-button{color:#87605e;}' +
			'</style></head>';

		return htmlHead;
	}

	function makeBody(lang, email, sid) {
		return (
			`<body class='email-body'><table class='body-table'><tbody><tr><td class='email-wrapper'>` +
			makeTextAboutConfirmation(lang, sid) +
			`</td></tr></tbody></table></body>`
		);
	}

	function makeTextAboutConfirmation(lang, sid) {
		let strHello = dictionaryServer.dear_audience[lang] + (lang === 'ru' ? '!' : ',');
		// TODO: change website-address of email-address confirmation
		// https://antrepriza.netlify.app/ru/
		return (
			`<div class='reservation-titel b700 fcw'>${strHello}</div>` +
			`<p class='lh12 fcw'>${dictionaryServer.email_subscription_text[lang]}</p>` +
			`<p class='lh12 fcw'>${dictionaryServer.email_subscription_text2[lang]}</p>` +
			`<p class='m50'><a href='https://antrepriza.netlify.app/${lang}/newsletter?sid=${sid}' class='confirm-button'>${dictionaryServer.email_subscription_button_text[lang]}</a></p>` +
			`<p><div class='lh12 fcw'>${dictionaryServer.email_subscription_text3[lang]}</div>` +
			`<a href='${theater.main_website}${lang}' class='lh12 fcw'>${theater.longTheaterName[lang]}</a></p>`
		);
	}

	async function emailConfirmation(lang, sid) {
		let res = true;
		// console.log('emailConfirmation 1');
		// dbNewsletters.initDatabase();
		// console.log('emailConfirmation 2');
		// console.log('now REALLY confirmation......');
		// let res = dbNewsletters.confirmEmail(sid);
		// console.log('result of confirmation:');
		// console.log(res);
		// console.log('emailConfirmation 4');
		// dbNewsletters.closeDatabase();
		if (!res) {
			console.error(dictionaryServer.email_service_error[lang]);
			return {
				statusCode: 500,
				body: JSON.stringify({
					message: dictionaryServer.email_service_error[lang],
				}),
			};
		}
		console.log('emailConfirmation 5');

		return {
			statusCode: 200,
			body: JSON.stringify({
				message: dictionaryServer.result_email_confirmed[lang],
			}),
		};
	}

	async function emailRemoving(lang, usid) {
		let res = true;
		// console.log('emailRemoving 1');
		// dbNewsletters.initDatabase();
		// console.log('emailRemoving 2');
		// let res = dbNewsletters.removeEmail(usid);
		// console.log(res);
		// console.log('emailRemoving 3');
		// dbNewsletters.closeDatabase();
		// console.log('emailRemoving 4');
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
};
