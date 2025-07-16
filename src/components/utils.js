import { CIRCLE, partTable, SQUARE } from '../data/parts.table'
import axios from 'axios';

import makerjs from 'makerjs'

// Lazy fix for firebase being too primitive to store nested lists 
export const convertNestedArraysToObjects = (obj) => {
    if (Array.isArray(obj)) {
        // If this is an array of arrays of numbers, convert to array of objects
        if (
            obj.length > 0 &&
            Array.isArray(obj[0]) &&
            obj[0].length === 2 &&
            obj.every((e) => Array.isArray(e) && e.length === 2)
        ) {
            return obj.map(([x, y]) => ({ x, y }))
        }
        return obj.map(convertNestedArraysToObjects)
    } else if (obj && typeof obj === 'object') {
        Object.keys(obj).forEach((key) => {
            obj[key] = convertNestedArraysToObjects(obj[key])
        })
    }
    return obj
}

// Lazy fix for firebase being too primitive to store nested lists
export const convertPointsObjectsToArrays = (obj) => {
    if (Array.isArray(obj)) {
        return obj.map(convertPointsObjectsToArrays)
    } else if (obj && typeof obj === 'object') {
        // Convert points: [{x, y}, ...] => [[x, y], ...]
        if (
            Array.isArray(obj.points) &&
            obj.points.length > 0 &&
            typeof obj.points[0] === 'object' &&
            'x' in obj.points[0] &&
            'y' in obj.points[0]
        ) {
            obj.points = obj.points.map(({ x, y }) => [x, y])
        }
        Object.keys(obj).forEach((key) => {
            obj[key] = convertPointsObjectsToArrays(obj[key])
        })
    }
    return obj
}

export const getImageDimensions = (imageUrl) => {
    return new Promise((resolve) => {
        const img = new Image()
        img.onload = () => {
            const width = img.width
            const height = img.height
            resolve([width, height])
        }
        img.src = imageUrl
    })
}

export const extractDataUri = (dataUri) => {
    const matches = dataUri.match(/^data:(.*?);base64,(.*)$/);
    if (!matches) {
        throw new Error('Invalid data URI');
    }
    const mimeType = matches[1];
    const base64Payload = matches[2];
    return [mimeType, base64Payload];
};

export const storeMedia = async (dataUri, title) => {
    let url = `https://deusprogrammer.com/api/img-svc/media`;
    let [mimeType, imagePayload] = extractDataUri(dataUri);

    let res = await axios.post(url, {mimeType, imagePayload, title});

    return res.data;
}

export const replaceUndefined = (obj) => {
    if (Array.isArray(obj)) {
        return obj.map(replaceUndefined);
    } else if (obj !== null && typeof obj === 'object') {
        return Object.keys(obj).reduce((acc, key) => {
            acc[key] = obj[key] === undefined ? 0 : replaceUndefined(obj[key]);
            return acc;
        }, {});
    }
    return obj;
};

export const generateUUID = () => {
    let d = new Date().getTime()
    if (typeof performance !== 'undefined' && performance.now) {
        d += performance.now() //use high-precision timer if available
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(
        /[xy]/g,
        function (c) {
            let r = (d + Math.random() * 16) % 16 | 0
            d = Math.floor(d / 16)
            return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16)
        }
    )
}

export const calculateRelativePosition = (
    part,
    parts,
    panelWidth,
    panelHeight
) => {
    const {
        position: [x, y],
        origin: [originX, originY],
        relativeTo,
    } = part
    const relativePart = parts.find(({ id }) => id && relativeTo && id === relativeTo)

    // If this part is relative to another part get the other part and use it's position as an offset
    let offsetX = 0
    let offsetY = 0
    if (relativePart) {
        const [relativeOffsetX, relativeOffsetY] = calculateRelativePosition(
            relativePart,
            parts,
            panelWidth,
            panelHeight
        )
        offsetX += relativeOffsetX
        offsetY += relativeOffsetY
    }

    let anchorAdjustmentX = 0
    let anchorAdjustmentY = 0
    let originCoordX = 0
    let originCoordY = 0
    if (!part.anchor) {
        part.anchor = [0, 0]
    }

    if (!part.dimensions) {
        part.dimensions = [0, 0]
    }

    anchorAdjustmentX = part.anchor[0] * part.dimensions[0]
    anchorAdjustmentY = part.anchor[1] * part.dimensions[1]

    originCoordX = originX * panelWidth
    originCoordY = originY * panelHeight

    return [
        originCoordX + x + offsetX - anchorAdjustmentX,
        originCoordY + y + offsetY - anchorAdjustmentY,
        anchorAdjustmentX,
        anchorAdjustmentY,
    ]
}

export const calculateTextPositionAndRotation = (
    lineStartX,
    lineStartY,
    lineEndX,
    lineEndY,
    offset
) => {
    const dx = lineEndX - lineStartX
    const dy = lineEndY - lineStartY
    const angle = Math.atan2(dy, dx)

    const midX = (lineStartX + lineEndX) / 2
    const midY = (lineStartY + lineEndY) / 2

    const offsetX = offset * Math.cos(angle)
    const offsetY = offset * Math.sin(angle)

    return { x: midX + offsetX, y: midY + offsetY, rotation: angle }
}

export const normalizePartPositionsToZero = (parts) => {
    // Find the minimum x and y values
    let minX = Infinity
    let minY = Infinity
    parts.forEach((part) => {
        const position = calculateRelativePosition(part, parts, 0, 0)
        let xAdj = 0
        let yAdj = 0

        // If the part is not a custom part.
        if (part.type && part.type !== 'custom' && part.type !== 'user') {
            const { size, shape } = partTable[part.type][part.partId]
            xAdj = size
            yAdj = size
            if (Array.isArray(size)) {
                xAdj = size[0]
                yAdj = size[1]
            }

            if (shape === CIRCLE) {
                xAdj /= 2
                yAdj /= 2
            }
        }

        minX = Math.min(minX, position[0] - xAdj)
        minY = Math.min(minY, position[1] - yAdj)
    })

    // Normalize each point by subtracting the minimum values
    parts
        .filter(({ relativeTo }) => !relativeTo)
        .forEach((part) => {
            part.position[0] -= minX
            part.position[1] -= minY
        })

    return parts
}

export const calculateSizeOfPart = (part) => {
    // console.log(JSON.stringify(part, null, 5));
    if (!part || part?.type === undefined) {
        return [0, 0];
    }

    if (part.type === 'custom') {
        let minX = Infinity
        let maxX = -Infinity
        let minY = Infinity
        let maxY = -Infinity

        let layout = part.layout
        layout?.parts?.forEach((childPart) => {
            let [x, y] = calculateRelativePosition(
                childPart,
                layout.parts,
                layout.panelDimensions[0],
                layout.panelDimensions[1]
            )

            // If the part is not a custom part.
            let xAdj = 0
            let yAdj = 0
            if (childPart.type && childPart.type !== 'custom' && childPart.type !== 'user') {
                const { size, shape } =
                    partTable[childPart.type][childPart.partId]
                xAdj = size
                yAdj = size
                if (Array.isArray(size)) {
                    xAdj = size[0]
                    yAdj = size[1]
                }

                if (shape === CIRCLE) {
                    xAdj /= 2
                    yAdj /= 2
                }
                minX = Math.min(minX, x - xAdj)
                minY = Math.min(minY, y - yAdj)
                maxX = Math.max(maxX, x + xAdj)
                maxY = Math.max(maxY, y + yAdj)
            } else {
                ;[xAdj, yAdj] = calculateSizeOfPart(childPart)
                minX = Math.min(minX, x)
                minY = Math.min(minY, y)
                maxX = Math.max(maxX, x + xAdj)
                maxY = Math.max(maxY, y + yAdj)
            }
        })

        let width = maxX - minX;
        let height = maxY - minY;

        width = Math.abs(width) === Infinity ? 0 : width
        height = Math.abs(height) === Infinity ? 0 : height

        return [width, height]
    } else if (part.type === 'user') {
        let { width, height, viewBox } = part?.modelTree?.header || { viewBox: {} };
        width = removeUnits(width || "0mm");
        height = removeUnits(height || "0mm");

        if (!width && !height) {
            ({width, height} = viewBox); 
        }
        return [width, height]
    } else {
        let { size } = partTable?.[part.type]?.[part.partId]

        if (Array.isArray(size)) {
            return size
        } else {
            return [size, size]
        }
    }
}

const clean = (arr) => {
    return arr?.map(value => Number(value));
}

export const simplify = (layout, parent) => {
    if (!layout) {
        return null
    }

    const { panelDimensions, type, partId } = layout
    let simplified = { ...layout }
 
    let partsToFlatten = [];
    if (parent) {
        if (type === 'custom') {
            const { parts, panelDimensions } = parent
            const [panelWidth, panelHeight] = clean(panelDimensions) || [0, 0]
            simplified.dimensions = clean(calculateSizeOfPart(layout)) 
            simplified.position = clean(calculateRelativePosition(
                { ...layout, dimensions: [simplified.dimensions[0], simplified.dimensions[1]] },
                parts,
                panelWidth,
                panelHeight
            )).slice(0, 2)
            delete simplified.panelDimensions
            partsToFlatten = layout.layout.parts

            parent = {
                ...layout.layout,
                panelDimensions: simplified.dimensions
            }
        } else if (type === 'user') {
            const {modelTree, geometry} = partTable.user[partId]
            const { parts, panelDimensions } = parent
            const [panelWidth, panelHeight] = clean(panelDimensions) || [0, 0]
            simplified = { ...simplified, modelTree, geometry }
            simplified.dimensions = clean(calculateSizeOfPart({...layout, modelTree, geometry})) 
            simplified.position = clean(calculateRelativePosition(
                { ...layout, dimensions: [simplified.dimensions[0], simplified.dimensions[1]] },
                parts,
                panelWidth,
                panelHeight
            )).slice(0, 2)
            delete simplified.panelDimensions

            parent = {
                ...layout.layout,
                panelDimensions: simplified.dimensions
            }
        } else {
            const { parts, panelDimensions } = parent
            const [panelWidth, panelHeight] = simplified.dimensions = panelDimensions || [0, 0]
            simplified.dimensions = clean(calculateSizeOfPart(layout))
            simplified.position = clean(calculateRelativePosition(
                layout,
                parts,
                panelWidth,
                panelHeight
            )).slice(0, 2)
            partsToFlatten = null
        }
    } else {
        simplified.panelDimensions = clean(panelDimensions)
        partsToFlatten = layout.parts
        parent = layout;
    }

    simplified.children = [];
    partsToFlatten?.forEach((part) => {
        const simplifiedChild = simplify(part, parent)
        simplified.children.push(simplifiedChild)
    });

    // Clean up
    delete simplified.origin
    delete simplified.anchor
    delete simplified.layout
    delete simplified.parts

    return simplified
}

const convertPartToPath = ({type, partId, position}) => {
    const { shape, size } = partTable[type]?.[partId] || {};

    switch (shape) {
        case CIRCLE: {
            const model = {
                paths: {
                    circle: new makerjs.paths.Circle(position, size / 2)
                }
            }
            return model;
        }
        case SQUARE: {
            const model = new makerjs.models.Rectangle(size[0], size[1])
            const [x, y] = position
            model.origin = [x - size[0]/2, y - size[1]/2]
            return model;
        }
        default:
            break;
    }
}

export const makerifyModelTree = (modelTree, options = {}) => {
    const { header, type, d, width, height, x, y, cx, cy, rx, ry, r, children, transform, graphical } = modelTree || {};
    const { translate, rotate, scale, skewX, skewY } = transform || {};
    const { includeGraphical } = options;
    
    let model = {};

    if (!includeGraphical && graphical) {
        return model;
    }

    if (header) {
        model = {
            models: {}
        }

        children.forEach((child, index) => {
            model.models[`child-${index}`] = makerifyModelTree(child, options)
        })

        return model;
    }

    if (type === 'path') {
        model = makerjs.importer.fromSVGPathData(d);
    } else if (type === 'group') {
        model = {
            models: {}
        }

        children.forEach((child, index) => {
            model.models[`child-${index}`] = makerifyModelTree(child, options)
        })
    } else if (type === 'rectangle') {
        if (rx && ry) {
            model = new makerjs.models.RoundRectangle(width, height, (rx + ry) / 2);
        } else {
            model = new makerjs.models.Rectangle(width, height);
            model.origin = [x, y];
        }
    } else if (type === 'circle') {
        // Expect radius and origin in the modelTree
        model = {
            paths: {
                circle: new makerjs.paths.Circle([cx, cy], r)
            }
        };
    } else if (type === 'polygon') {
        // modelTree.points is expected to be an array of [x, y] pairs
        if (Array.isArray(modelTree.points) && modelTree.points.length > 1) {
            model = {
                paths: {}
            };
            // Draw lines between each point, and close the shape
            for (let i = 0; i < modelTree.points.length; i++) {
                const start = modelTree.points[i];
                const end = modelTree.points[(i + 1) % modelTree.points.length];
                model.paths[`line-${i}`] = new makerjs.paths.Line(start, end);
            }
        }
        model = makerjs.model.mirror(model, false, true);
    } else if (type === 'polyline') {
        if (Array.isArray(modelTree.points) && modelTree.points.length > 1) {
            model = {
                paths: {}
            };
            // Draw lines between each point, do NOT close the shape
            for (let i = 0; i < modelTree.points.length - 1; i++) {
                const start = modelTree.points[i];
                const end = modelTree.points[i + 1];
                model.paths[`line-${i}`] = new makerjs.paths.Line(start, end);
            }
        }
        model = makerjs.model.mirror(model, false, true);
    } else {
        // Handle other types or return empty model
        model = {};
    }

    if (rotate) {
        model = makerjs.model.rotate(model, rotate, [0, 0]);
    }

    if (scale) {
        model = makerjs.model.distort(model, scale.x, scale.y)
    }

    if (skewX > 0) {
        model = makerjs.model.distort(model, skewX, 1)
    }
    
    if (skewY > 0) {
        model = makerjs.model.distort(model, 1, skewY)
    }

    if (translate) {
        const { x, y } = translate;
        model = makerjs.model.moveRelative(model, [x, -y]);
    }

    return model;
}

export const makerify = (simplifiedLayout, parent, options = {}, layer = 0) => {
    const { panelDimensions, panelModel, type, position, rotation, cornerRadius, children } = simplifiedLayout

    let model = {
        models: {},
        paths: {},
        layer
    };

    if (!parent) {
        parent = simplifiedLayout;
        if (panelModel) {
            model.models.panel = makerjs.model.mirror(makerifyModelTree(panelModel, options), false, true)
        } else {
            if (cornerRadius) {
                model.models.panel = new makerjs.models.RoundRectangle(panelDimensions?.[0], panelDimensions?.[1], cornerRadius)
            } else {
                model.models.panel = new makerjs.models.Rectangle(panelDimensions?.[0], panelDimensions?.[1])
            }
        }
        model.units = simplifiedLayout.units;
    }

    children.filter((child) => child.type === 'custom').forEach((child, index) => {
        model.models[`customs-${index}`] = makerify(child, parent, options, layer++);
    })
    children.filter((child) => child.type !== 'custom' && child.type !== 'svg').forEach((child, index) => {
        model.models[`parts-${index}`] = convertPartToPath(child);
    })
    children.filter((child) => child.type === 'user').forEach((child, index) => {
        const [x, y] = child.position;
        let userModel = makerjs.model.mirror(makerifyModelTree(child.modelTree, options), false, true);
        userModel = makerjs.model.rotate(userModel, rotation, [0, 0]);
        userModel = makerjs.model.moveRelative(userModel, [x, y]);
        model.models[`user-parts-${index}`] = userModel;
    })

    if (parent) {
        if (type === 'custom') {
            // Makerjs building
            const [x, y] = position;
            model = makerjs.model.rotate(model, rotation, [0, 0]);
            model = makerjs.model.moveRelative(model, [x, y]);
        } 
    } 

    return model;
}

export const login = () => {
    if (process.env.NODE_ENV === "development") {
        window.location = `https://deusprogrammer.com/util/auth/dev?redirect=${window.location.protocol}//${window.location.hostname}:${window.location.port}${process.env.PUBLIC_URL}/dev`;
        return;
    }
    window.localStorage.setItem(
        'twitchRedirect',
        'https://deusprogrammer.com/taco-truck/designer'
    )
    window.location.replace(
        'https://deusprogrammer.com/util/auth/login'
    )
}

export const convertPartModel = (oldData) => {
    const { name, modelTree, lines, points, curves, geometry, owner } =
        oldData

    const newGeometry = []

    // Convert lines to geometry objects
    if (lines && points) {
        lines.forEach(([startIndex, endIndex]) => {
            newGeometry.push({
                type: 'line',
                attributes: {
                    start: points[startIndex],
                    end: points[endIndex],
                },
            })
        })
    }

    // Convert existing curves to geometry objects
    if (curves) {
        curves.forEach((curve) => {
            newGeometry.push({
                type: 'curve',
                attributes: curve,
            })
        })
    }

    // Convert existing geometry to new format
    if (geometry) {
        geometry.forEach((geom) => {
            newGeometry.push({
                type: geom.shape || 'rectangle',
                attributes: geom,
            })
        })
    }

    return {
        name,
        geometry: newGeometry,
        modelTree,
        owner,
    }
}

export const decimalToRatio = (decimal) => {
    const gcd = (a, b) => b === 0 ? a : gcd(b, a % b);
    
    const denominator = 1000; // Precision level
    const numerator = Math.round(decimal * denominator);
    const divisor = gcd(numerator, denominator);
    
    return `${numerator / divisor}:${denominator / divisor}`;
}

export const removeUnits = (str) => {
    return parseFloat(str.replace(/[a-zA-Z%]+$/, ''));
}