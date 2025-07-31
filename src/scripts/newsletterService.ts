import { sendSubscriptionPacket, validateSubscriptionPacketData } from './subscription';
import { ESubscriptionAction, initSubscriptionPacket, type TSubscriptionPacket } from './types/subscription';
import { getCurrentPageLang } from './utils';
import dictionary from '@data/dictionary.json';

function showNewsletterServiceMessage(message, isOk) {
	let elemStatus = document.querySelector<HTMLElement>('.newsletter-service .service-status');
	if (!elemStatus) return;

	let elemStatusMessage = elemStatus.querySelector<HTMLElement>('.status-message');
	if (elemStatusMessage) {
		elemStatusMessage.innerText = isOk ? message : dictionary.error__lang[getCurrentPageLang()] + ': ' + message;
		elemStatus.style.display = 'block';
	}
}

export async function newsletterService() {
	let params = new URLSearchParams(document.location.search);
	const keys = params.keys();
	const paramsCount = [...keys].length;

	const lang = getCurrentPageLang();

	let obj: string = params.get('obj');
	let sid = Number(params.get('sid'));
	let usid = Number(params.get('usid'));
	if (paramsCount !== 2 || !obj || !(sid || usid)) {
		showNewsletterServiceMessage(dictionary.err__incorrect_data[lang], false);
		return;
	}

	const handleResult = (isOk: boolean, message: string) => {
		elemLoader.classList.remove('show');
		showNewsletterServiceMessage(message, isOk);
	};

	let packet: TSubscriptionPacket;
	if (sid) packet = initSubscriptionPacket(lang, ESubscriptionAction.REG_CONFIRM, '', obj, sid, 0);
	else if (usid) packet = initSubscriptionPacket(lang, ESubscriptionAction.REG_DELETE, '', obj, 0, usid);

	if (!validateSubscriptionPacketData(packet, false)) {
		showNewsletterServiceMessage(dictionary.err__incorrect_data[lang], false);
		return;
	}

	let elemLoader = document.querySelector('.newsletter-loader');
	elemLoader.classList.add('show');

	sendSubscriptionPacket(packet, handleResult);
}
