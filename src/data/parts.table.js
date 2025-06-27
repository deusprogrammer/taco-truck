export const CIRCLE = 'CIRCLE'
export const SQUARE = 'SQUARE'
export const CUSTOM = 'CUSTOM'

export const partTable = {
    button: {
        'SANWA-24mm': { shape: CIRCLE, size: 24, rim: 2 },
        'SANWA-30mm': { shape: CIRCLE, size: 30, rim: 2 },
        'HAPP-28mm': { shape: CIRCLE, size: 28, rim: 2 },
        'WICO-28mm': { shape: CIRCLE, size: 28, rim: 3 },
        'GEN-Menu-20mm': { shape: CIRCLE, size: 20, rim: 2 },
        'GEN-Menu-12mm': { shape: CIRCLE, size: 12, rim: 2 },
        'CHERRY-Keyboard': { shape: SQUARE, size: [18, 18], rim: 1 },
    },
    hole: {
        M3: { shape: CIRCLE, size: 3, rim: 0 },
        M4: { shape: CIRCLE, size: 4, rim: 0 },
        M5: { shape: CIRCLE, size: 5, rim: 0 },
        M6: { shape: CIRCLE, size: 6, rim: 0 },
        M7: { shape: CIRCLE, size: 7, rim: 0 },
        M8: { shape: CIRCLE, size: 8, rim: 0 },
        'Joystick-24mm': { shape: CIRCLE, size: 24, rim: 0 },
        'Joystick-35mm': { shape: CIRCLE, size: 35, rim: 0 },
    },
}
