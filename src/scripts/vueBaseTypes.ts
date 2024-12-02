import type { TStage, TPerformance, TRepetition, TWhatsappNote } from './db/baseTypes';

const enum EWhatsappItemType {
	PRE_NOTE,
	POST_NOTE,
	PERFORMANCE,
	REPETITION,
	STAGE,
}
export type TWhatsappItem = {
	checked: boolean;
	visible: boolean;
	type: EWhatsappItemType;
	obj: TPerformance | TRepetition | TStage | null;
	note: TWhatsappNote;
};
