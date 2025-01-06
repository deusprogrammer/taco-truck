import { atom } from 'jotai';
import { SELECT } from '../components/elements/Modes';

export const renderMeasurementsAtom = atom(false);
export const editLockComponentAtom = atom(false);
export const scrollLockComponentAtom = atom(false);
export const zoomLockComponentAtom = atom(false);
export const previewAtom = atom(false);
export const zoomAtom = atom(2);
export const workspacePositionAtom = atom([0, 0])
export const screenSizeAtom = atom([window.innerWidth, window.innerHeight])
export const buttonOpacityAtom = atom(1.0);
export const screenHeightAtom = atom(0)
export const modeAtom = atom(SELECT)
export const selectedAtom = atom(null)