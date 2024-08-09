import nodemailer from 'nodemailer';
import fs from 'fs';
import { LANG_LIST, EMAIL_REGEX } from './lib/consts.cjs';
import { NewslettersDB } from './lib/antreprizaDB.cjs';
import { fromHtmlToPlainText } from './lib/utils.cjs';
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
	else if (sid) return emailConfirmation(lang, sid);
	else if (usid) return emailRemoving(lang, usid);

	async function emailRegistration(lang, email) {
		// spam checking
		if (!email || !EMAIL_REGEX.test(email) || email.length > 64) {
			// fake OK-result
			return {
				statusCode: 200,
				body: JSON.stringify({
					message: 'Email sent successfully',
				}),
			};
		}

		NewslettersDB.openDatabase();
		let res = NewslettersDB.addNewEmail(lang, email);
		NewslettersDB.closeDatabase();
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
				user: process.env.ANTREPRIZA_EMAIL_SUBSCRIPTION,
				pass: process.env.ANTREPRIZA_SMTP_PASSWORD,
			},
		});

		const subject = dictionaryServer.email_news_subscription_reg_subject[lang];
		const subjectToAntrepriza = dictionaryServer.email_news_subscription_reg_subject_antrepriza[lang];

		const mailOptions = {
			// from: `${theater.longTheaterName[lang]} <${process.env.ANTREPRIZA_TRANSPORT_EMAIL}>`,
			from: `${theater.longTheaterName[lang]} <${process.env.ANTREPRIZA_EMAIL_SUBSCRIPTION}>`,
			to: email,
			subject: subject,
			html: makeHtmlEmail(lang, subject, makeContent(lang, email, sid, false)),
		};

		let mailTo;
		if (process.env.MODE === process.env.MODE_PRODUCTION) {
			mailTo = process.env.ANTREPRIZA_EMAIL_SUBSCRIPTION + ', ' + process.env.ANTREPRIZA_EMAIL_MAMONTOV;
		} else {
			mailTo = process.env.ANTREPRIZA_EMAIL_BOGOLEPOV;
		}
		const mailOptionsAntrepriza = {
			from: `${theater.longTheaterName[lang]} <${process.env.ANTREPRIZA_EMAIL_SUBSCRIPTION}>`,
			to: mailTo,
			subject: subjectToAntrepriza,
			html: makeHtmlEmail(lang, subjectToAntrepriza, makeContent(lang, email, sid, true)),
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
	}

	function makeContent(lang, email, sid, toAntrepriza) {
		let diffText;
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
			let strHello = dictionaryServer.dear_audience[lang] + (lang === 'ru' ? '!' : ',');
			diffText = `\
<tr><td style="font-size: 125%; padding-bottom: 15px; line-height: 120%; color: #d6d6d6; font-weight: 500">${strHello}</td></tr>\
<tr><td style="line-height: 120%; color: #d6d6d6; padding-bottom: 15px">${dictionaryServer.email_subscription_text[lang]}</td></tr>\
<tr><td style="line-height: 120%; color: #d6d6d6; padding-bottom: 45px">${dictionaryServer.email_subscription_text2[lang]}</td></tr>\
<tr><td style="line-height: 120%; padding-bottom: 45px">\
<a href='https://antrepriza.eu/${lang}/newsletter?sid=${sid}' \
 style="font-size: 105%; font-weight: 500; line-height: 120%; color: #87605e; border: 1px solid #87605e; padding: 10px 20px 10px 20px; text-decoration: none">\
${dictionaryServer.email_subscription_button_text[lang]}</a>\
</td></tr>\
<tr><td style="line-height: 120%; color: #d6d6d6; padding: 0">${dictionaryServer.email_subscription_text3[lang]}</td></tr>\
<tr><td style="line-height: 120%; color: #d6d6d6; padding: 0">${theater.longTheaterName[lang]}</td></tr>\
<tr><td style="line-height: 120%; padding: 0">\
<a href='${theater.our_website_link}/${lang}' style="line-height: 120%; color: #d6d6d6">${theater.our_website_text}</a>\
</td></tr>\
`;
		}

		return `\
<table border="0" cellpadding="0" role="presentation" style="width: 100%; margin: 0; padding: 0 0 15px 0"><tbody>\
${diffText}\
</tbody></table>\
`;
	}

	async function emailConfirmation(lang, sid) {
		NewslettersDB.openDatabase();
		let res = NewslettersDB.confirmEmail(sid);
		NewslettersDB.closeDatabase();
		if (!res) {
			console.error(dictionaryServer.email_service_error[lang]);
			return {
				statusCode: 500,
				body: JSON.stringify({
					message: dictionaryServer.email_service_error[lang],
				}),
			};
		}

		const transporter = nodemailer.createTransport({
			pool: true,
			host: process.env.ANTREPRIZA_SMTP_HOST,
			port: 465,
			secure: true, // use TLS
			auth: {
				user: process.env.ANTREPRIZA_EMAIL_SUBSCRIPTION,
				pass: process.env.ANTREPRIZA_SMTP_PASSWORD,
			},
		});

		let mailTo;
		if (process.env.MODE === process.env.MODE_PRODUCTION) {
			mailTo = process.env.ANTREPRIZA_EMAIL_SUBSCRIPTION;
		} else {
			mailTo = process.env.ANTREPRIZA_EMAIL_BOGOLEPOV;
		}
		const subject = dictionaryServer.email_news_subscription_confirmed_subject[lang];
		const mailOptions = {
			from: `${theater.longTheaterName[lang]} <${process.env.ANTREPRIZA_EMAIL_SUBSCRIPTION}>`,
			to: mailTo,
			subject: subject,
			html: makeHtmlEmail(lang, subject, makeContentConfirmed(sid)),
		};
		try {
			await transporter.sendMail(mailOptions);
		} catch (error) {
			console.error(error);
		}

		return {
			statusCode: 200,
			body: JSON.stringify({
				message: dictionaryServer.result_email_confirmed[lang],
			}),
		};
	}

	function makeContentConfirmed(sid) {
		return `\
<table border="0" cellpadding="0" role="presentation" style="width: 100%; margin: 0; padding: 0 0 15px 0"><tbody>\
<tr>\
<td style="line-height: 120%; color: #d6d6d6; vertical-align: top">SID :</td>\
<td style="line-height: 120%; color: #d6d6d6; vertical-align: top; padding: 0 0 0 8px">${sid}</td>\
</tr>\
</tbody></table>\
`;
	}

	async function emailRemoving(lang, usid) {
		NewslettersDB.initDatabase();
		let res = NewslettersDB.removeEmail(usid);
		NewslettersDB.closeDatabase();
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
