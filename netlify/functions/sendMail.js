const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({
	service: 'gmail',
	auth: {
		user: process.env.ANTREPRIZA_EMAIL,
		pass: process.env.ANTREPRIZA_PASSWORD,
	},
});

export const handler = async (event, context) => {
	const messageData = JSON.parse(event.body);

	const { lang, name, email, reservations, amount } = messageData;

	const mailOptions = {
		from: process.env.EMAIL_FROM,
		to: email,
		subject: 'Резервирование билетов',
		text: `Hello, ${name}!`,
		html: `
		<h1>Hello, ${name}!</h1>`,
	};

	try {
		let info = await transporter.sendMail(mailOptions);

		return {
			statusCode: 200,
			body: JSON.stringify({
				message: 'Email sent successfully',
			}),
		};
	} catch (error) {
		return {
			statusCode: 500,
			body: JSON.stringify({
				message: error.message,
			}),
		};
	}
};
