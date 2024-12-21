import { CIRCLE, partTable } from "../data/parts.table";

export const generateUUID = () => {
    let d = new Date().getTime();
    if (typeof performance !== 'undefined' && performance.now) {
      d += performance.now(); //use high-precision timer if available
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      let r = (d + Math.random() * 16) % 16 | 0;
      d = Math.floor(d / 16);
      return (c === 'x' ? r : ((r & 0x3) | 0x8)).toString(16);
    });
}

export const calculateRelativePosition = (part, parts, panelWidth, panelHeight, level = 0) => {
    const {position: [x, y], origin: [originX, originY], relativeTo} = part;
    const relativePart = parts.find(({id}) => id === relativeTo);

    // If this part is relative to another part get the other part and use it's position as an offset
    let offsetX = 0;
    let offsetY = 0;
    if (relativePart) {
        const [relativeOffsetX, relativeOffsetY] = calculateRelativePosition(relativePart, parts, panelWidth, panelHeight, level + 1);
        offsetX += relativeOffsetX;
        offsetY += relativeOffsetY;
    }

    let anchorAdjustmentX = 0;
    let anchorAdjustmentY = 0;
    let originCoordX = 0;
    let originCoordY = 0;
    if (!part.anchor) {
        part.anchor = [0, 0];
    }

    if (!part.dimensions) {
        part.dimensions = [0, 0];
    }

    anchorAdjustmentX = part.anchor[0] * part.dimensions[0];
    anchorAdjustmentY = part.anchor[1] * part.dimensions[1];

    originCoordX = originX * panelWidth;
    originCoordY = originY * panelHeight;

    return [originCoordX + x + offsetX - anchorAdjustmentX, originCoordY + y + offsetY - anchorAdjustmentY, anchorAdjustmentX, anchorAdjustmentY];
}

export const calculateTextPositionAndRotation = (lineStartX, lineStartY, lineEndX, lineEndY, offset) => {
    const dx = lineEndX - lineStartX;
    const dy = lineEndY - lineStartY;
    const angle = Math.atan2(dy, dx);
  
    const midX = (lineStartX + lineEndX) / 2;
    const midY = (lineStartY + lineEndY) / 2;
  
    const offsetX = offset * Math.cos(angle);
    const offsetY = offset * Math.sin(angle);
  
    return { x: midX + offsetX, y: midY + offsetY, rotation: angle };
}

export const normalizePartPositionsToZero = (parts) => {
    // Find the minimum x and y values
    let minX = Infinity;
    let minY = Infinity;
    parts.forEach(part => {
        const position = calculateRelativePosition(part, parts, 0, 0);
        let xAdj = 0;
        let yAdj = 0;

        // If the part is not a custom part.
        if (part.type && part.type !== "custom") {
            const {size, shape} = partTable[part.type][part.partId];
            xAdj = size;
            yAdj = size;
            if (Array.isArray(size)) {
                xAdj = size[0];
                yAdj = size[1];
            }

            if (shape === CIRCLE) {
                xAdj /= 2;
                yAdj /= 2;
            }
        }

        minX = Math.min(minX, position[0] - xAdj);
        minY = Math.min(minY, position[1] - yAdj);
    });

    // Normalize each point by subtracting the minimum values
    parts.filter(({relativeTo}) => !relativeTo).forEach((part) => {
        part.position[0] -= minX;
        part.position[1] -= minY;
    });

    return parts;
}

export const calculateSizeOfPart = (part) => {
    if (part.type !== "custom") {
        let {size} = partTable[part.type][part.partId];

        if (Array.isArray(size)) {
            return size;
        } else {
            return [size, size];
        }
    } else {
        let minX = Infinity;
        let maxX = -Infinity;
        let minY = Infinity;
        let maxY = -Infinity;

        let layout = part.layout;
        // console.log("PARTS for " + part.name + ":");
        layout.parts.forEach((childPart) => {
            let [x, y] = calculateRelativePosition(childPart, layout.parts, layout.panelDimensions[0], layout.panelDimensions[1]);

            // If the part is not a custom part.
            let xAdj = 0;
            let yAdj = 0;
            if (childPart.type && childPart.type !== "custom") {
                const {size, shape} = partTable[childPart.type][childPart.partId];
                xAdj = size;
                yAdj = size;
                if (Array.isArray(size)) {
                    xAdj = size[0];
                    yAdj = size[1];
                }

                if (shape === CIRCLE) {
                    xAdj /= 2;
                    yAdj /= 2;
                }
                minX = Math.min(minX, x - xAdj);
                minY = Math.min(minY, y - yAdj);
                maxX = Math.max(maxX, x + xAdj);
                maxY = Math.max(maxY, y + yAdj);
            } else {
                [xAdj, yAdj] = calculateSizeOfPart(childPart);
                minX = Math.min(minX, x);
                minY = Math.min(minY, y);
                maxX = Math.max(maxX, x + xAdj);
                maxY = Math.max(maxY, y + yAdj);
            }
        });
        
        return [maxX - minX, maxY - minY];
    }
}