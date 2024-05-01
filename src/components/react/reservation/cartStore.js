import { atom, map } from 'nanostores';

export const isCartOpen = atom(false);
export const isTicketsAdded = atom(false);
export const isJsonsLoaded = atom(false);

export const clientJsons = map({});
