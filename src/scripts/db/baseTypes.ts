export type TMultiText = {
	ru: string;
	de: string;
};

type TAuthor = {
	firstname: TMultiText;
	surname: TMultiText;
	firstname_short: TMultiText;
};

type TRole = {
	name: TMultiText;
	description: TMultiText;
	actors: Array<number>;
};

export type TPlay = {
	id: number;
	sid: string;
	name: TMultiText;
	author: TAuthor;
	genre: TMultiText;
	age: string;
	break: number;
	duration: number;
	language: TMultiText;
	roles: Array<TRole>;
};

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

type TStageHost = {
	name: string;
	contacts: TContacts;
};

export type TStage = {
	id: number;
	sid: string;
	name: TMultiText;
	address: TAddress;
	fixed: boolean;
	host: TStageHost;
};

function validateMultiTextStructure(text: TMultiText): TMultiText {
	if (!text) text = {} as TMultiText;
	if (text.ru === undefined) text.ru = '';
	if (text.de === undefined) text.de = '';
	return text;
}
function validateAuthorStructure(author: TAuthor): TAuthor {
	if (!author) author = {} as TAuthor;
	author.firstname = validateMultiTextStructure(author.firstname);
	author.firstname_short = validateMultiTextStructure(author.firstname_short);
	author.surname = validateMultiTextStructure(author.surname);
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

export type TUniqPlaysResult = {
	isUniq: boolean;
	firstItem: number;
	secondItem: number;
};
export function isUniquePlaysSID(plays: Array<TPlay>): TUniqPlaysResult {
	if (plays.length < 2) return { isUniq: true, firstItem: -1, secondItem: -1 };
	for (let i = 0; i < plays.length - 1; i++)
		for (let j = i + 1; j < plays.length; j++) {
			if (plays[i].sid === plays[j].sid) return { isUniq: false, firstItem: i, secondItem: j };
		}
	return { isUniq: true, firstItem: -1, secondItem: -1 };
}

export type TUniqStagesResult = {
	isUniq: boolean;
	firstItem: number;
	secondItem: number;
};
export function isUniqueStagesSID(stages: Array<TStage>): TUniqStagesResult {
	if (stages.length < 2) return { isUniq: true, firstItem: -1, secondItem: -1 };
	for (let i = 0; i < stages.length - 1; i++)
		for (let j = i + 1; j < stages.length; j++) {
			if (stages[i].sid === stages[j].sid) return { isUniq: false, firstItem: i, secondItem: j };
		}
	return { isUniq: true, firstItem: -1, secondItem: -1 };
}

function checkEqualMultiText(text1: TMultiText, text2: TMultiText): boolean {
	return text1.ru === text2.ru && text1.de === text2.de;
}

function checkEqualAuthor(author1: TAuthor, author2: TAuthor): boolean {
	return (
		checkEqualMultiText(author1.firstname, author2.firstname) &&
		checkEqualMultiText(author1.firstname_short, author2.firstname_short) &&
		checkEqualMultiText(author1.surname, author2.surname)
	);
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

export function checkEqualPlays(play1: TPlay, play2: TPlay): boolean {
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

export function checkEqualStages(stage1: TStage, stage2: TStage): boolean {
	return (
		stage1.id === stage2.id &&
		stage1.sid === stage2.sid &&
		stage1.fixed === stage2.fixed &&
		checkEqualMultiText(stage1.name, stage2.name) &&
		checkEqualAddress(stage1.address, stage2.address) &&
		checkEqualHost(stage1.host, stage2.host)
	);
}
