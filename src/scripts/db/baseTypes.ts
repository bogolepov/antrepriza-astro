import { EPerformanceType, type TMultiText } from '@scripts/types/base';
import { type TReservationItem } from '@scripts/types/reservation';

export const enum EItemType {
	PLAY = 'play',
	STAGE = 'stage',
	PERFORMANCE = 'performance',
	REPETITION = 'repetition',
}

export interface IItem {
	id: number;
	sid: string;
}

export interface IEvent {
	date: string;
	time_start: string;
	time_end: string;
	stage_sid: string;
}

// ---------------------------------------
//                TPlay
// ---------------------------------------

type TAuthor = {
	name: TMultiText;
	short_name: TMultiText;
};

type TRole = {
	name: TMultiText;
	description: TMultiText;
	actors: Array<number>;
};

interface IPlay extends IItem {
	name: TMultiText;
	author: TAuthor;
	genre: TMultiText;
	age: string;
	break: number;
	duration: number;
	language: TMultiText;
	roles: Array<TRole>;
}
export type TPlay = IPlay;

// ---------------------------------------
//                TStage
// ---------------------------------------

type TPhone = {
	country: number;
	number: number;
};
type TAddress = {
	street: string;
	building: string;
	city: string;
	index: string;
	district: string;
	country: string;
	add_info: string;
	full_address: string;
};

type TContacts = {
	website: string;
	facebook: string;
	instagram: string;
	youtube: string;
	x: string;
	phone: TPhone;
	email: string;
};

let phone: TPhone = { country: 49, number: 111 };

type TStageHost = {
	name: string;
	contacts: TContacts;
};

interface IStage extends IItem {
	name: TMultiText;
	address: TAddress;
	fixed: boolean;
	host: TStageHost;
}

export type TStage = IStage;

// ---------------------------------------
//                TPerformance
// ---------------------------------------
interface IPerformance extends IItem, IEvent {
	play_sid: string;
	event_type: EPerformanceType;
}
export type TPerformance = IPerformance;

// ---------------------------------------
//                TRepetition
// ---------------------------------------
export enum ERepetitionType {
	NORMAL = 'Репетиция',
	READING = 'Репетиция-читка',
	RUN_THROUGH = 'Прогон',
	TECHNICAL_REHEARSAL = 'Технический прогон',
	FINAL_REHEARSAL = 'Генеральный прогон',
	WORKSHOP = 'Мастер-класс',
}

export type TSubRepetition = {
	play_sid: string;
	event_type: ERepetitionType;
};

interface IRepetition extends IItem, IEvent {
	subRepetitions: TSubRepetition[];
}
export type TRepetition = IRepetition;

// ---------------------------------------
//                TWhatsappNote
// ---------------------------------------
export const enum EWhatsappNoteType {
	PRE_NOTE = 'pre_note',
	POST_NOTE = 'post_note',
	PERFORMANCE = 'performance',
	REPETITION = 'repetition',
}
interface IWhatsappNote {
	sid: string;
	note_type: EWhatsappNoteType;
	text: string;
}
export type TWhatsappNote = IWhatsappNote;

// ---------------------------------------
//                TReservationDB
// ---------------------------------------
