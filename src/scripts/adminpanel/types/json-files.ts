import type { EPerformanceType, TMultiText } from '@scripts/types/base';

export type TMultilang = { ru: string; de: string };

export interface IStageJson {
	id: number;
	sid: string;
	fix_stage: boolean;
	name: TMultiText;
	address: {
		full_address: string;
		street: string;
		building: string;
		index: string;
		city: string;
		district: string;
		country: string;
	};
}

export interface IPlayJson {
	id: number;
	suffix: string;
	title: TMultiText;
	alt_title: TMultiText;
	author: TMultiText;
	author_full: TMultiText;
	genre: TMultiText;
	length: number;
	break: boolean;
	age: string;
	lang: TMultiText;
}

export interface IPriceJson {
	type: string;
	value: number;
	text: TMultiText;
	text_short: TMultiText;
}

export interface IPerformanceJson {
	date: string;
	time: string;
	play_sid: string;
	stage_sid: string;
	premiere?: boolean;
	canceled?: boolean;
	replaced?: boolean;
	newyear?: boolean;
	is_festival?: boolean;
	is_tour?: boolean;
}

export interface IExtendedPerformanceJson extends IPerformanceJson {
	first_in_month?: boolean;
	time_end?: string;
	sid?: string;
	event_type?: EPerformanceType;
}
