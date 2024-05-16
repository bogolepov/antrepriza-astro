// const nodemailer = require('nodemailer');
// const transporter = nodemailer.createTransport({
// 	service: 'gmail',
// 	auth: {
// 		user: process.env.ANTREPRIZA_EMAIL,
// 		pass: process.env.ANTREPRIZA_PASSWORD,
// 	},
// });

// export const handler = async (event, context) => {
// 	console.log('Email ENV: address - ' + process.env.ANTREPRIZA_EMAIL + ', pass - ' + process.env.ANTREPRIZA_PASSWORD);
// 	const messageData = JSON.parse(event.body);
// 	console.log(messageData);

// 	const { lang, name, email, reservations, amount } = messageData;

// 	const mailOptions = {
// 		from: process.env.EMAIL_FROM,
// 		to: email,
// 		subject: 'Резервирование билетов',
// 		text: `Hello, ${name}!`,
// 		html: `
// 		<h1>Hello, ${name}!</h1>`,
// 	};

// 	try {
// 		console.log('call sendMail.......');
// 		let info = await transporter.sendMail(mailOptions);
// 		console.log('result:');
// 		console.log(info);

// 		return {
// 			statusCode: 200,
// 			body: JSON.stringify({
// 				message: 'Email sent successfully',
// 			}),
// 		};
// 	} catch (error) {
// 		console.log('error:');
// 		console.log(error);
// 		return {
// 			statusCode: 500,
// 			body: JSON.stringify({
// 				message: error.message,
// 			}),
// 		};
// 	}
// };

export const handler = async (event, context) => {
	console.log('in Netlify function: sendMail');
	return {
		statusCode: 200,
		body: JSON.stringify({
			message: 'Email sent successfully',
		}),
	};
};
