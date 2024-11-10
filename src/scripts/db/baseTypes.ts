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

interface IEvent {
	date: string;
	time_start: string;
	time_end: string;
	stage_sid: string;
}

export type TMultiText = {
	ru: string;
	de: string;
};

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
export enum EPerformanceType {
	REGULAR = 'обычный',
	PREMIERE = 'премьера',
	NEWYEAR = 'новогодний',
	FESTIVAL = 'фестиваль',
	TOUR = 'гастроли',
}

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
//                validation
// ---------------------------------------
function validateMultiTextStructure(text: TMultiText): TMultiText {
	if (!text) text = {} as TMultiText;
	if (text.ru === undefined) text.ru = '';
	if (text.de === undefined) text.de = '';
	return text;
}
function validateAuthorStructure(author: TAuthor): TAuthor {
	if (!author) author = {} as TAuthor;
	author.name = validateMultiTextStructure(author.name);
	author.short_name = validateMultiTextStructure(author.short_name);
	return author;
}
function validateRolesStructure(roles: Array<TRole>): Array<TRole> {
	if (!roles) roles = [];
	roles.forEach(role => {
		role.name = validateMultiTextStructure(role.name);
		role.description = validateMultiTextStructure(role.description);
		if (role.actors === undefined) role.actors = [];
	});
	return roles;
}

function validateAddressStructure(address: TAddress): TAddress {
	if (!address) address = {} as TAddress;
	if (address.building === undefined) address.building = '';
	if (address.add_info === undefined) address.add_info = '';
	if (address.city === undefined) address.city = '';
	if (address.country === undefined) address.country = '';
	if (address.district === undefined) address.district = '';
	if (address.full_address === undefined) address.full_address = '';
	if (address.index === undefined) address.index = '';
	if (address.street === undefined) address.street = '';
	return address;
}

function validatePhone(phone: TPhone): TPhone {
	if (!phone) phone = {} as TPhone;
	if (phone.country === undefined) phone.country = 0;
	if (phone.number === undefined) phone.number = 0;
	return phone;
}

function validateContacts(contacts: TContacts): TContacts {
	if (!contacts) contacts = {} as TContacts;
	if (contacts.website === undefined) contacts.website = '';
	if (contacts.facebook === undefined) contacts.facebook = '';
	if (contacts.instagram === undefined) contacts.instagram = '';
	if (contacts.x === undefined) contacts.x = '';
	if (contacts.youtube === undefined) contacts.youtube = '';
	if (contacts.email === undefined) contacts.email = '';
	contacts.phone = validatePhone(contacts.phone);
	return contacts;
}

function validateStageHost(host: TStageHost): TStageHost {
	if (!host) host = {} as TStageHost;
	if (host.name === undefined) host.name = '';
	host.contacts = validateContacts(host.contacts);
	return host;
}

export function validatePlayStructure(play: TPlay): TPlay {
	if (!play) play = {} as TPlay;
	if (play.id === undefined) play.id = 0;
	if (play.sid === undefined) play.sid = '';
	play.name = validateMultiTextStructure(play.name);
	play.author = validateAuthorStructure(play.author);
	play.genre = validateMultiTextStructure(play.genre);
	if (play.age === undefined) play.age = '';
	if (play.break === undefined) play.break = 0;
	if (play.duration === undefined) play.duration = 0;
	play.language = validateMultiTextStructure(play.language);
	play.roles = validateRolesStructure(play.roles);

	return play;
}

export function validateStageStructure(stage: TStage): TStage {
	if (!stage) stage = {} as TStage;
	if (stage.id === undefined) stage.id = 0;
	if (stage.sid === undefined) stage.sid = '';
	if (stage.fixed === undefined) stage.fixed = false;
	stage.name = validateMultiTextStructure(stage.name);
	stage.address = validateAddressStructure(stage.address);
	stage.host = validateStageHost(stage.host);
	return stage;
}

export function validatePerformanceStructure(performance: TPerformance): TPerformance {
	if (!performance) performance = {} as TPerformance;
	if (performance.id === undefined) performance.id = 0;
	if (performance.sid === undefined) performance.sid = '';
	if (performance.play_sid === undefined) performance.play_sid = '';
	if (performance.stage_sid === undefined) performance.stage_sid = '';
	if (performance.date === undefined) performance.date = '';
	if (performance.time_start === undefined) performance.time_start = '';
	if (performance.time_end === undefined) performance.time_end = '';
	if (performance.event_type === undefined) performance.event_type = EPerformanceType.REGULAR;
	return performance;
}

export function validateRepetitionStructure(repetition: TRepetition): TRepetition {
	if (!repetition) repetition = {} as TRepetition;
	if (repetition.id === undefined) repetition.id = 0;
	if (repetition.sid === undefined) repetition.sid = '';
	if (repetition.stage_sid === undefined) repetition.stage_sid = '';
	if (repetition.date === undefined) repetition.date = '';
	if (repetition.time_start === undefined) repetition.time_start = '';
	if (repetition.time_end === undefined) repetition.time_end = '';
	if (repetition.subRepetitions === undefined || repetition.subRepetitions.length === 0) {
		repetition.subRepetitions = [{ play_sid: '', event_type: ERepetitionType.NORMAL }];
	} else {
		repetition.subRepetitions.forEach(subRepetition => {
			if (subRepetition.play_sid === undefined) subRepetition.play_sid = '';
			if (subRepetition.event_type === undefined) subRepetition.event_type = ERepetitionType.NORMAL;
		});
	}
	return repetition;
}

// ---------------------------------------
//              UNIQ-validation
// ---------------------------------------
export type TUniqStatus = {
	isUniq: boolean;
	firstItem: number;
	secondItem: number;
};
export function checkUniqueSIDs<T extends IItem>(items: Array<T>): TUniqStatus {
	if (items.length < 2) return { isUniq: true, firstItem: -1, secondItem: -1 };
	for (let i = 0; i < items.length - 1; i++)
		for (let j = i + 1; j < items.length; j++) {
			if (items[i].sid === items[j].sid) return { isUniq: false, firstItem: i, secondItem: j };
		}
	return { isUniq: true, firstItem: -1, secondItem: -1 };
}

// ---------------------------------------
//             compare : equal
// ---------------------------------------
function checkEqualMultiText(text1: TMultiText, text2: TMultiText): boolean {
	return text1.ru === text2.ru && text1.de === text2.de;
}

function checkEqualAuthor(author1: TAuthor, author2: TAuthor): boolean {
	return checkEqualMultiText(author1.name, author2.name) && checkEqualMultiText(author1.short_name, author2.short_name);
}

function checkEqualAddress(address1: TAddress, address2: TAddress): boolean {
	return (
		address1.street === address2.street &&
		address1.building === address2.building &&
		address1.city === address2.city &&
		address1.index === address2.index &&
		address1.district === address2.district &&
		address1.country === address2.country &&
		address1.add_info === address2.add_info &&
		address1.full_address === address2.full_address
	);
}

function checkEqualPhone(phone1: TPhone, phone2: TPhone): boolean {
	return phone1.country === phone2.country && phone1.number === phone2.number;
}

function checkEqualContacts(contacts1: TContacts, contacts2: TContacts): boolean {
	return (
		contacts1.website === contacts2.website &&
		contacts1.facebook === contacts2.facebook &&
		contacts1.instagram === contacts2.instagram &&
		contacts1.youtube === contacts2.youtube &&
		contacts1.x === contacts2.x &&
		contacts1.email === contacts2.email &&
		checkEqualPhone(contacts1.phone, contacts2.phone)
	);
}

function checkEqualHost(host1: TStageHost, host2: TStageHost): boolean {
	return host1.name === host2.name && checkEqualContacts(host1.contacts, host2.contacts);
}

function checkEqualPlays(play1: TPlay, play2: TPlay): boolean {
	return (
		play1.age === play2.age &&
		play1.break === play2.break &&
		play1.duration === play2.duration &&
		play1.id === play2.id &&
		play1.sid === play2.sid &&
		checkEqualMultiText(play1.genre, play2.genre) &&
		checkEqualMultiText(play1.language, play2.language) &&
		checkEqualMultiText(play1.name, play2.name) &&
		checkEqualAuthor(play1.author, play2.author)
	);
}

function checkEqualPerformances(performance1: TPerformance, performance2: TPerformance): boolean {
	return (
		performance1.id === performance2.id &&
		performance1.sid === performance2.sid &&
		performance1.play_sid === performance2.play_sid &&
		performance1.stage_sid === performance2.stage_sid &&
		performance1.date === performance2.date &&
		performance1.time_start === performance2.time_start &&
		performance1.time_end === performance2.time_end &&
		performance1.event_type === performance2.event_type
	);
}

function checkEqualSubRepetitions(list1: TSubRepetition[], list2: TSubRepetition[]): boolean {
	if (list1.length !== list2.length) return false;
	for (let item1 of list1) {
		if (!list2.find(item2 => item1.play_sid === item2.play_sid && item1.event_type === item2.event_type)) return false;
	}
	return true;
}

function checkEqualRepetitions(repetition1: TRepetition, repetition2: TRepetition): boolean {
	return (
		repetition1.id === repetition2.id &&
		repetition1.sid === repetition2.sid &&
		repetition1.stage_sid === repetition2.stage_sid &&
		repetition1.date === repetition2.date &&
		repetition1.time_start === repetition2.time_start &&
		repetition1.time_end === repetition2.time_end &&
		checkEqualSubRepetitions(repetition1.subRepetitions, repetition2.subRepetitions)
	);
}

function checkEqualStages(stage1: TStage, stage2: TStage): boolean {
	return (
		stage1.id === stage2.id &&
		stage1.sid === stage2.sid &&
		stage1.fixed === stage2.fixed &&
		checkEqualMultiText(stage1.name, stage2.name) &&
		checkEqualAddress(stage1.address, stage2.address) &&
		checkEqualHost(stage1.host, stage2.host)
	);
}
export function checkEqualItems<T extends IItem>(item1: T, item2: T, type: EItemType): boolean {
	switch (type) {
		case EItemType.PLAY:
			return checkEqualPlays(item1, item2);
		case EItemType.STAGE:
			return checkEqualStages(item1, item2);
		case EItemType.PERFORMANCE:
			return checkEqualPerformances(item1, item2);
		case EItemType.REPETITION:
			return checkEqualRepetitions(item1, item2);
		default:
			console.log('checkEqualItems: type ERROR !!!');
			return true;
	}
}
