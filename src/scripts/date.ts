// event SID: [stage_sid]_[date:yyyymmdd]_[time:hhmm]_[play:play_sid||repetition:rep]
// export function makeValidDateFromSID(sid: string): Date {
// 	if (!sid || sid.length < 14) return undefined;

// 	const eventData: string[] = sid.split('_');
// 	if (!eventData || eventData.length < 3) return undefined;

// 	const date = convertOnlyNumberDateToValidDate(eventData[1]) + 'T' + convertOnlyNumberTimeToValidTime(eventData[2]);
// 	if (date.length !== 16) return undefined;

// 	return new Date(date);
// }

// export function getDateSubstrFromEventSID(sid: string): string {
// 	if (!sid || !sid.length) return undefined;
// 	return sid.split('_')[1];
// }
// export function geTimeSubstrFromEventSID(sid: string): string {
// 	if (!sid || !sid.length) return undefined;
// 	return sid.split('_')[2];
// }

// export function getMonthNameFromEventSID(sid: string): string {
// 	const dateSubstr = getDateSubstrFromEventSID(sid);
// 	if (!dateSubstr) return undefined;
// 	const date = `2024.${dateSubstr.slice(4, 6)}.01`;
// 	return new Date(date).toLocaleString('ru', { month: 'long' });
// }

// month: '1', '2', ... , '12', '01', '02', ... , '12'
export function getMonthName(month: string): string {
	let nMonth: number = Number(month);
	if (!nMonth) console.error('getMonthName: ' + month + ' - ERROR!');
	if (nMonth > 12) console.error('getMonthName: ' + month + ' - ERROR overflow!');
	if (nMonth) nMonth--;
	return new Date(2024, nMonth, 1).toLocaleString('ru', { month: 'long' });
}

// export function convertOnlyNumberDateToValidDate(onlyNumberDate: string): string {
// 	if (!onlyNumberDate || onlyNumberDate.length !== 8) return undefined;
// 	if (Number(onlyNumberDate).toString() !== onlyNumberDate) return undefined;
// 	return onlyNumberDate.slice(0, 4) + '.' + onlyNumberDate.slice(4, 6) + '.' + onlyNumberDate.slice(6);
// }
// export function convertOnlyNumberTimeToValidTime(onlyNumberTime: string): string {
// 	if (!onlyNumberTime || onlyNumberTime.length !== 4) return undefined;
// 	if (Number(onlyNumberTime).toString() !== onlyNumberTime) return undefined;
// 	return onlyNumberTime.slice(0, 2) + '.' + onlyNumberTime.slice(2, 4);
// }
