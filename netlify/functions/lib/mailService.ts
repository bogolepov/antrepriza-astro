import nodemailer from 'nodemailer';
import theater from '@data/theater.json';

export type TMail = {
	to: string;
	subject: string;
	html: string;
};
export async function sendMails(lang: string, transporterMail: string, clientMail: TMail): Promise<boolean>;
export async function sendMails(
	lang: string,
	transporterMail: string,
	clientMail: TMail,
	antreprizaMail: TMail
): Promise<boolean>;
export async function sendMails(
	lang: string,
	transporterMail: string,
	clientMail: TMail,
	antreprizaMail?: TMail
): Promise<boolean> {
	/*
	const transporter =
		process.env.MODE === process.env.MODE_LOCALHOST
			? nodemailer.createTransport({
					service: 'gmail',
					auth: {
						user: process.env.ANTREPRIZA_GMAIL_EMAIL,
						pass: process.env.ANTREPRIZA_GMAIL_PASSWORD,
					},
				})
			: nodemailer.createTransport({
					pool: true,
					host: process.env.ANTREPRIZA_SMTP_HOST,
					port: 587,
					secure: false, // use TLS
					ignoreTLS: true,
					auth: {
						user: transporterMail,
						pass: process.env.ANTREPRIZA_SMTP_PASSWORD,
					},
				});
	*/
	const transporter = nodemailer.createTransport({
		service: 'gmail',
		auth: {
			user: process.env.ANTREPRIZA_GMAIL_EMAIL,
			pass: process.env.ANTREPRIZA_GMAIL_PASSWORD,
		},
	});

	const fromEmailDescription: string = `${theater.longTheaterName[lang]} `;
	// const fromEmail: string = process.env.MODE === process.env.MODE_LOCALHOST
	// 		? `${fromEmailDescription}<${process.env.ANTREPRIZA_GMAIL_EMAIL}>`
	// 		: `${fromEmailDescription}<${transporterMail}>`;
	const fromEmail: string = `${fromEmailDescription}<${process.env.ANTREPRIZA_GMAIL_EMAIL}>`;
	const mailOptionsClient = {
		from: fromEmail,
		to: clientMail.to,
		subject: clientMail.subject,
		html: clientMail.html,
	};

	try {
		await transporter.sendMail(mailOptionsClient);

		if (antreprizaMail) {
			const antreprizaMailTo: string =
				process.env.MODE === process.env.MODE_PRODUCTION ? transporterMail : process.env.ANTREPRIZA_EMAIL_BOGOLEPOV;

			const mailOptionsAntrepriza = {
				from: fromEmail,
				to: antreprizaMailTo,
				subject: antreprizaMail.subject,
				html: antreprizaMail.html,
			};

			try {
				await transporter.sendMail(mailOptionsAntrepriza);
			} catch (error) {
				console.error('Email to Antrepriza [not fatal]:');
				console.error(error);
			}
		}

		return true;
	} catch (error) {
		console.error('Email to client [fatal]:');
		console.error(error);
		return false;
	}
}
