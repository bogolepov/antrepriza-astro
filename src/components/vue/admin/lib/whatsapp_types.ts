import type { IEvent, TPerformance, TRepetition, TStage, TWhatsappNote } from '@scripts/db/baseTypes';
import { plays, stages } from './statesStore';
import { getMonthName } from '@scripts/date';

export const enum ECheckboxStatus3 {
	CHECKED,
	UNCHECKED,
	CHIMERA,
}

export const enum EWAItemType {
	PRE_NOTE,
	POST_NOTE,
	PERFORMANCE,
	REPETITION,
	STAGE,
	MONTH,
}

export type TWhatsappItem = {
	checked: boolean;
	visible: boolean;
	type: EWAItemType;
	obj: TPerformance | TRepetition | TStage | null;
	note: TWhatsappNote | string | undefined | null;
};

export function getStageSymbol(stage: TStage): string {
	if (!stage) return undefined;
	if (stage.fixed) {
		if (stage.sid === 'west') return '🔹';
		else if (stage.sid === 'ost') return '🔸';
	}
	return '📍'; // 🌀💠◼️📍📌
}

// 🔸 Сцена ВОСТОК : Boxhagener Str. 18, 10245 Berlin
// 🔹 Сцена ЗАПАД : Carmerstr. 12, 10623 Berlin
export function getStageItemText(item: TWhatsappItem): string {
	if (!item || item.type !== EWAItemType.STAGE || !item.obj) return undefined;
	const stage: TStage = item.obj as TStage;
	return getStageSymbol(stage) + ' Сцена ' + stage.name.ru.toUpperCase() + ' : ' + stage.address.full_address;
}

export function getStageWhatsappText(item: TWhatsappItem): string {
	return getStageItemText(item);
}

// export function getPerformanceItemText(item: TWhatsappItem): string {
// 	if (!item || item.type !== EWAItemType.PERFORMANCE || !item.obj) return undefined;
// 	const event: TPerformance = item.obj as TPerformance;
// 	let text: string = '';
// 	return text;
// }

export function getDayMonthItemText(strDate: string): string {
	if (!strDate) return undefined;
	const date = new Date(strDate);
	if (!date) return undefined;
	return date.toLocaleString('ru', { month: 'long', day: '2-digit' }) + ', ' + date.toLocaleString('ru', { weekday: 'short' });
}

export function getTimeDurationItemText(date: Date, durationMinutes: number = 0): string {
	if (!date) return undefined;
	const eventDate = new Date(date);
	return eventDate.toLocaleString('ru', { month: 'long', day: '2-digit' }) + ', ' + eventDate.toLocaleString('ru', { weekday: 'short' });
}

export function getEventDateText(whatsappItem: TWhatsappItem): string {
	if (!whatsappItem || (whatsappItem.type !== EWAItemType.PERFORMANCE && whatsappItem.type !== EWAItemType.REPETITION) || !whatsappItem.obj)
		return undefined;
	const event = whatsappItem.obj as IEvent;
	return getDayMonthItemText(event.date);
}

export function getEventTimeText(whatsappItem: TWhatsappItem): string {
	if (!whatsappItem || (whatsappItem.type !== EWAItemType.PERFORMANCE && whatsappItem.type !== EWAItemType.REPETITION) || !whatsappItem.obj)
		return undefined;
	const event = whatsappItem.obj as IEvent;
	return event.time_start.replace(':', '.') + '-' + event.time_end.replace(':', '.');
}

export function getEventStageText(whatsappItem: TWhatsappItem): string {
	if (!whatsappItem || (whatsappItem.type !== EWAItemType.PERFORMANCE && whatsappItem.type !== EWAItemType.REPETITION) || !whatsappItem.obj)
		return undefined;
	const { stage_sid } = whatsappItem.obj as IEvent;
	const stage = stages.value.find(stg => stg.sid === stage_sid);
	if (!stage) return undefined;
	return getStageSymbol(stage) + ' ' + stage.name.ru.toUpperCase();
}

export function getPlayName(play_sid: string): string {
	const play = plays.value.find(ply => ply.sid === play_sid);
	if (!play) return undefined;
	return play.name.ru;
}
//---------------------------------------
//  text for memory's message
//---------------------------------------
export function memTextItem(item: TWhatsappItem): string {
	if (!item) return '';

	if (item.type === EWAItemType.PRE_NOTE || item.type === EWAItemType.POST_NOTE) {
		const { text } = item.note as TWhatsappNote;
		if (!text.trim().length) return '';
		else return text;
	}

	if (item.type === EWAItemType.MONTH) {
		return '```' + getMonthName(item.note as string).toUpperCase() + '```';
	}

	if (item.type === EWAItemType.STAGE) {
		return getStageItemText(item);
	}

	if (item.type === EWAItemType.PERFORMANCE || item.type === EWAItemType.REPETITION) {
		let memText = '* ' + getEventDateText(item) + ', ' + getEventTimeText(item) + ', *' + getEventStageText(item) + '*, ';
		if (item.type === EWAItemType.PERFORMANCE && item.obj) {
			const { play_sid } = item.obj as TPerformance;
			memText += 'спектакль 🎭 _*' + getPlayName(play_sid) + '*_';
		}
		if (item.type === EWAItemType.REPETITION && item.obj && (item.obj as TRepetition).subRepetitions) {
			(item.obj as TRepetition).subRepetitions.forEach((task, index) => {
				memText += (index ? ' + ' : '') + task.event_type.toLowerCase() + ' _*' + getPlayName(task.play_sid) + '*_';
			});
		}
		if (item.note && (item.note as TWhatsappNote).text.trim().length) {
			memText += ' [ ' + (item.note as TWhatsappNote).text + ' ]';
		}
		return memText;
	}
}
