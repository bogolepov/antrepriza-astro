import nodemailer from 'nodemailer';
import theater from '@data/theater.json';

import { readFileSync } from 'fs';
import path from 'path';
import Handlebars from 'handlebars';
import type { ContactFormVariables, ReservationsVariables, SubscriptionTheaterVariables, SubscriptionUserVariables } from './mailVariables';

const TEMPLATES_DIR = path.resolve(__dirname, './lib/emails/html');

export const TemplateNames = {
	reservations: 'reservations',
	subscription_user_verify: 'subscription_user',
	subscription_theater_confirm: 'subscription_theater',
	contact_form: 'contact_form',
} as const;

export type TemplateNames = (typeof TemplateNames)[keyof typeof TemplateNames];

function getHdbrTemplate(templateName: TemplateNames) {
	const filePath = path.join(TEMPLATES_DIR, `${templateName}.html`);
	return readFileSync(filePath, 'utf8');
}

export function getEmailHtml(
	templateName: TemplateNames,
	emailVariables: SubscriptionUserVariables | SubscriptionTheaterVariables | ContactFormVariables | ReservationsVariables,
) {
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

export type TransporterInfo = {
	transporter: nodemailer.Transporter;
	emailFrom: string;
	emailToAntrepriza: string;
};
export function createTransporter(transporterMail: string, lang: string): TransporterInfo {
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
	const emailFrom: string =
		process.env.MODE === process.env.MODE_LOCALHOST
			? `${fromEmailDescription}<${process.env.ANTREPRIZA_GMAIL_EMAIL}>`
			: `${fromEmailDescription}<${transporterMail}>`;
	// const fromEmail: string = `${fromEmailDescription}<${transporterMail}>`;
	// const fromEmail: string = `${fromEmailDescription}<${process.env.ANTREPRIZA_GMAIL_EMAIL}>`;

	const emailToAntrepriza: string =
		process.env.MODE === process.env.MODE_PRODUCTION ? transporterMail : process.env.ANTREPRIZA_EMAIL_BOGOLEPOV;

	return { transporter, emailFrom, emailToAntrepriza };
}

export function createTransporterDomain(transporterMail: string, lang: string): TransporterInfo {
	const transporter = nodemailer.createTransport({
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
	const emailFrom: string = `${fromEmailDescription}<${transporterMail}>`;

	const emailToAntrepriza: string =
		process.env.MODE === process.env.MODE_PRODUCTION ? transporterMail : process.env.ANTREPRIZA_EMAIL_BOGOLEPOV;

	return { transporter, emailFrom, emailToAntrepriza };
}

function createTransporterGmail(lang: string): TransporterInfo {
	const transporter = nodemailer.createTransport({
		service: 'gmail',
		auth: {
			user: process.env.ANTREPRIZA_GMAIL_EMAIL,
			pass: process.env.ANTREPRIZA_GMAIL_PASSWORD,
		},
	});
	const fromEmailDescription: string = `${theater.longTheaterName[lang]} `;
	const emailFrom: string = `${fromEmailDescription}<${process.env.ANTREPRIZA_GMAIL_EMAIL}>`;

	const emailToAntrepriza: string =
		process.env.MODE === process.env.MODE_PRODUCTION ? process.env.ANTREPRIZA_GMAIL_EMAIL : process.env.ANTREPRIZA_EMAIL_BOGOLEPOV;

	return { transporter, emailFrom, emailToAntrepriza };
}

export type TMailData = {
	from: string;
	to: string;
	subject: string;
	html?: string;
};

export async function sendMail(transporter: nodemailer.Transporter, mailData: TMailData): Promise<boolean> {
	return await sendMailCore(transporter, mailData, false);
}

async function sendMailCore(transporter: nodemailer.Transporter, mailData: TMailData, isAlternate: boolean): Promise<boolean> {
	if (mailData.html === undefined) {
		console.error('Email HTML content is undefined');
		return false;
	}
	let sent: boolean = false;
	try {
		const result = await transporter.sendMail(mailData);
		sent = true;
		if (result.rejected.length > 0) {
			// сервер отказал конкретным адресам
			console.warn('Some emails were rejected', result.rejected);
		}
		if (result.accepted.length === 0) {
			throw new Error('Email(s) not accepted by SMTP server', { cause: result });
		}
		return true;
	} catch (error) {
		console.error(`Nodemailer: sendEmail() [FATAL, ${mailData.from}${isAlternate ? ', alternate transporter' : ''}]:`);
		console.error(error);
		if (!sent && !isAlternate) {
			const { transporter: gmailTransporter, emailFrom } = createTransporterGmail(mailData.from.includes('Б') ? 'ru' : 'de');
			const gmailData: TMailData = {
				from: emailFrom,
				to: mailData.to,
				subject: mailData.subject,
				html: mailData.html,
			};

			return await sendMailCore(gmailTransporter, gmailData, true);
		}
		return false;
	}
}
