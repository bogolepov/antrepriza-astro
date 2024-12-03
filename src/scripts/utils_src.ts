export function onlyNumbers(text: string): string {
	return text?.replace(/[^0-9]/g, '');
}

export function getRandomIntInclusive(min: number, max: number): number {
	min = Math.ceil(min);
	max = Math.floor(max);
	return Math.floor(Math.random() * (max - min + 1) + min);
}
