import React, { useCallback } from 'react';
import { Graphics, Text } from '@pixi/react';
import { TextStyle } from 'pixi.js';
import '@pixi/events';
import { calculateRelativePosition } from '../utils';
import { partTable } from '../../data/parts.table';

const calculateTextPositionAndRotation = (lineStartX, lineStartY, lineEndX, lineEndY, offset) => {
    const dx = lineEndX - lineStartX;
    const dy = lineEndY - lineStartY;
    const angle = Math.atan2(dy, dx);
  
    const midX = (lineStartX + lineEndX) / 2;
    const midY = (lineStartY + lineEndY) / 2;
  
    const offsetX = offset * Math.cos(angle);
    const offsetY = offset * Math.sin(angle);
  
    return { x: midX + offsetX, y: midY + offsetY, rotation: angle };
}

const Button = ({scale, part, selectedPartId, hoveredPartId, parent: {parts, panelDimensions: [panelWidth, panelHeight]}, onClick}) => {
    const {partId, type, id} = part;
    const [fixedX, fixedY] = calculateRelativePosition(part, parts, panelWidth, panelHeight);

    const drawCircle = useCallback((x, y, radius, rim, renderScale, g) => {
        g.clear();
        if ((selectedPartId === id || hoveredPartId === id) && (selectedPartId || hoveredPartId)) {
            g.beginFill(selectedPartId === id ? 0x00ff00 : 0x00ffff);
            g.drawCircle(renderScale * x, renderScale * y, renderScale * (radius + rim + 2));
        }
        g.beginFill(0xffffff);
        g.drawCircle(renderScale * x, renderScale * y, renderScale * (radius + rim));
        g.beginFill(0x000000);
        g.drawCircle(renderScale * x, renderScale * y, renderScale * radius);
        g.beginFill(0xff0000);
        g.drawCircle(renderScale * x, renderScale * y, renderScale * 2);
        g.endFill();
    }, [id, selectedPartId, hoveredPartId]);

    const drawLine = useCallback((x, y, renderScale, g) => {
        // Draw a line to the element it's relative to
        if (part.relativeTo) {
            const relativePart = parts.find(({id}) => part.relativeTo === id);
            const [x2, y2] = calculateRelativePosition(relativePart, parts, panelWidth, panelHeight);

            g.lineStyle(1, "#FF0000");
            g.moveTo(renderScale * x,  renderScale * y);
            g.lineTo(renderScale * x2, renderScale * y);
            g.lineStyle(1, "#00FF00");
            g.lineTo(renderScale * x2, renderScale * y2);
        }
    }, [part, parts, panelHeight, panelWidth]);

    if (!partTable[type]?.[partId]) {
        return <></>;
    }

    const {size, rim} = partTable[type][partId];
    const relativePart = parts.find(({id}) => part.relativeTo === id);
    const textComponents = [];
    if (relativePart) {
        const [x2, y2] = calculateRelativePosition(relativePart, parts, panelWidth, panelHeight);
        const xMax = Math.max(fixedX, x2);
        const yMax = Math.max(fixedY, y2);
        const xMin = Math.min(fixedX, x2);
        const yMin = Math.min(fixedY, y2); 
        const {x: text1X, y: text1Y, rotation: text1Rotation} = calculateTextPositionAndRotation(xMin, yMin, xMax, yMin, 10);
        const {x: text2X, y: text2Y, rotation: text2Rotation} = calculateTextPositionAndRotation(xMin, yMin, xMin, yMax, 10);
        if (xMax - xMin !== 0) {
            textComponents.push(
                <Text
                    key='text1'
                    x={text1X * scale}
                    y={text1Y * scale} 
                    anchor={{x: 1, y: 0.5}}
                    rotation={text1Rotation}
                    style={ new TextStyle({
                        fill: "#FF0000"
                    })}
                    text={`${xMax - xMin}mm`}
                />
            );
        }
        if (yMax - yMin !== 0) {
            textComponents.push(
                <Text
                    key='text2'
                    x={text2X * scale}
                    y={text2Y * scale} 
                    anchor={{x: 1, y: 0.5}}
                    rotation={text2Rotation}
                    style={ new TextStyle({
                        fill: "#00FF00"
                    })}
                    text={`${Math.abs(y2 - fixedY)}mm`}
                />
            );
        }
    }

    return (
        <>
            <Graphics 
                draw={(g) => {drawCircle(fixedX, fixedY, size/2, rim,  scale, g)}}
                zIndex={0}
                interactive={true}
                onclick={() => {onClick(part)}}
            />
            <Graphics 
                draw={(g) => drawLine(fixedX, fixedY,  scale, g)}
                zIndex={5}
            />
            {textComponents}
        </>
    );
}

export default Button;