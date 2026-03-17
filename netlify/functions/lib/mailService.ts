import nodemailer from 'nodemailer';
import theater from '@data/theater.json';

// import { promises as fs } from 'fs';
import { readFileSync } from 'fs';
import path from 'path';
import Handlebars from 'handlebars';

const TEMPLATES_DIR = path.resolve(__dirname, './lib/emails/html');

export const TemplateNames = {
	reservations: 'reservations',
	subscription_user_verify: 'subscription_user',
	subscription_theater_confirm: 'subscription_theater',
} as const;

export type TemplateNames = (typeof TemplateNames)[keyof typeof TemplateNames];

export type SubscriptionUserVariables = {
	lang: string;
	subject: string;
	previewSubject: string;
	hello: string;
	happy_text: string;
	verify_text: string;
	verify_url: string;
	buttonText: string;
	regards: string;
	team: string;
	theater_url: string;
	theater_url_text: string;
	facebook_url?: string;
	youtube_url?: string;
	instagram_url?: string;
};
export type SubscriptionTheaterVariables = {
	email: string;
};

// async function getHdbrTemplate(templateName: TemplateNames): Promise<string> {
// 	const filePath = path.join(TEMPLATES_DIR, `${templateName}.html`);
// 	return await fs.readFile(filePath, 'utf8');
// }
function getHdbrTemplate(templateName: TemplateNames) {
	const filePath = path.join(TEMPLATES_DIR, `${templateName}.html`);
	return readFileSync(filePath, 'utf8');
}

export function getEmailHtml(
	templateName: TemplateNames,
	emailVariables: SubscriptionUserVariables | SubscriptionTheaterVariables,
) {
	// const hdbrTemplateContent = await getHdbrTemplate(templateName);
	try {
		const hdbrTemplateContent = getHdbrTemplate(templateName);
		const template = Handlebars.compile(hdbrTemplateContent);
		return template(emailVariables);
	} catch (error) {
		console.error('Prepare EEmail [fatal]:');
		console.error(error);
		return undefined;
	}
}

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
	antreprizaMail: TMail,
): Promise<boolean>;
export async function sendMails(
	lang: string,
	transporterMail: string,
	clientMail: TMail,
	antreprizaMail?: TMail,
): Promise<boolean> {
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
					port: 465,
					secure: true,
					auth: {
						user: transporterMail,
						pass: process.env.ANTREPRIZA_SMTP_PASSWORD,
					},
					// debug: true,  // включите, чтобы увидеть больше логов
					// logger: true,
				});

	const fromEmailDescription: string = `${theater.longTheaterName[lang]} `;
	const fromEmail: string =
		process.env.MODE === process.env.MODE_LOCALHOST
			? `${fromEmailDescription}<${process.env.ANTREPRIZA_GMAIL_EMAIL}>`
			: `${fromEmailDescription}<${transporterMail}>`;
	// const fromEmail: string = `${fromEmailDescription}<${transporterMail}>`;
	// const fromEmail: string = `${fromEmailDescription}<${process.env.ANTREPRIZA_GMAIL_EMAIL}>`;
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
