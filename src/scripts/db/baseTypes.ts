export type TMultiText = {
	ru: string;
	de: string;
};

export type TAuthor = {
	firstname: TMultiText;
	surname: TMultiText;
	firstname_short: TMultiText;
};

export type TRole = {
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

export function validatePlayStructure(play: TPlay): TPlay {
	if (!play) play = {} as TPlay;
	if (play.id === undefined) play.id = undefined;
	if (play.sid === undefined) play.sid = undefined;
	play.name = validateMultiTextStructure(play.name);
	play.author = validateAuthorStructure(play.author);
	play.genre = validateMultiTextStructure(play.genre);
	if (play.age === undefined) play.age = undefined;
	if (play.break === undefined) play.break = undefined;
	if (play.duration === undefined) play.duration = undefined;
	play.language = validateMultiTextStructure(play.language);
	play.roles = validateRolesStructure(play.roles);

	return play;
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
