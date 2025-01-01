import { atom } from 'jotai';

export const renderMeasurementsAtom = atom(false);
export const editLockComponentAtom = atom(false);
export const scrollLockComponentAtom = atom(false);
export const zoomLockComponentAtom = atom(false);
export const zoomAtom = atom(2);
export const workspacePositionAtom = atom([0,0])
export const buttonOpacityAtom = atom(1.0);
export const screenHeightAtom = atom(0)