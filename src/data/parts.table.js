export const CIRCLE = 'CIRCLE'
export const SQUARE = 'SQUARE'
export const ELLIPSE = 'ELLIPSE';
export const CUSTOM = 'CUSTOM'
export const VECTOR = 'VECTOR'

const customPartsString = localStorage.getItem('taco-truck-parts')
const customParts = JSON.parse(customPartsString)

const partMap = {};
customParts?.forEach((customPart) => {
    partMap[customPart.name] = {...customPart, shape: VECTOR}
})

export const partTable = {
    button: {
        'SANWA-24mm': { name: 'SANWA 24mm', shape: CIRCLE, size: 24, rim: 2 },
        'SANWA-30mm': { name: 'SANWA 30mm', shape: CIRCLE, size: 30, rim: 2 },
        'SEGA-33mm': { name: 'SEGA 33mm', shape: CIRCLE, size: 33, rim: 2 },
        'CROWN-24mm': { name: 'CROWN 24mm', shape: CIRCLE, size: 24.5, rim: 2 },
        'CROWN-30mm': { name: 'CROWN 30mm', shape: CIRCLE, size: 30.5, rim: 2 },
        'HAPP-28mm': { name: 'HAPP 28mm', shape: CIRCLE, size: 28, rim: 2 },
        'WICO-28mm': { name: 'WICO 28mm', shape: CIRCLE, size: 28, rim: 3 },
        'GEN-Menu-8mm': { name: 'GEN Menu 8mm', shape: CIRCLE, size: 8, rim: 2 },
        'GEN-Menu-12mm': { name: 'GEN Menu 12mm', shape: CIRCLE, size: 12, rim: 2 },
        'GEN-Menu-16mm': { name: 'GEN Menu 16mm', shape: CIRCLE, size: 16, rim: 2 },
        'GEN-Menu-19mm': { name: 'GEN Menu 19mm', shape: CIRCLE, size: 19, rim: 2 },
        'GEN-Menu-20mm': { name: 'GEN Menu 20mm', shape: CIRCLE, size: 20, rim: 2 },
        'GEN-Menu-22mm': { name: 'GEN Menu 22mm', shape: CIRCLE, size: 22, rim: 2 },
        'GEN-Menu-25mm': { name: 'GEN Menu 25mm', shape: CIRCLE, size: 12, rim: 2 },
        'GEN-Menu-40mm': { name: 'GEN Menu 40mm', shape: CIRCLE, size: 40, rim: 2 },
        'CHERRY-Keyboard': { name: 'CHERRY Keyboard', shape: SQUARE, size: [18, 18], rim: 1 },
        'IIDX-Key': { name: 'IIDX Key', shape: SQUARE, size: [33, 50], rim: 1 },
        'POPN-100mm': { name: 'POPN 100mm', shape: CIRCLE, size: 100, rim: 2 }
    },
    hole: {
        'M2.5':            { name: 'M2.5', shape: CIRCLE, size: 2.5, rim: 0 },
        'M3':              { name: 'M3', shape: CIRCLE, size: 3, rim: 0 },
        'M3.5':            { name: 'M3.5', shape: CIRCLE, size: 3.5, rim: 0 },
        'M4':              { name: 'M4', shape: CIRCLE, size: 4, rim: 0 },
        'M5':              { name: 'M5', shape: CIRCLE, size: 5, rim: 0 },
        'M6':              { name: 'M6', shape: CIRCLE, size: 6, rim: 0 },
        'M7':              { name: 'M7', shape: CIRCLE, size: 7, rim: 0 },
        'M8':              { name: 'M8', shape: CIRCLE, size: 8, rim: 0 },
        'Joystick-24mm':   { name: 'Joystick 24mm', shape: CIRCLE, size: 24, rim: 0 },
        'Joystick-35mm':   { name: 'Joystick 35mm', shape: CIRCLE, size: 35, rim: 0 },
    },
    user: partMap
}

