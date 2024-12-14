import React, { useCallback } from 'react';
import { Graphics, Text } from '@pixi/react';
import { TextStyle } from 'pixi.js';
import '@pixi/events';
import { calculateRelativePosition, calculateTextPositionAndRotation } from '../utils';
import { CIRCLE, partTable } from '../../data/parts.table';
import ComponentDisplay from '../ComponentDisplay';

const Part = ({scale, part, selectedPartId, hoveredPartId, parent, onClick}) => {
    const {partId, type, id} = part;
    const {parts, panelDimensions: [panelWidth, panelHeight]} = parent;
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
        g.clear();
        
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

    if (type === "custom") {
        return <></>;
        // return (
        //     <ComponentDisplay 
        //         layout={part.layout}
        //         currentScale={scale}
        //         selected={selectedPartId}
        //         hovered={hoveredPartId}
        //         mode={null}
        //         placingPartId={null}
        //         placingPartType={null}
        //         onSelectPart={() => {}}
        //         onSecondarySelectPart={null}
        //         onLayoutChange={() => {}}
        //     />
        // )
    }

    if (!partTable[type]?.[partId]) {
        return <></>;
    }

    const {shape, size, rim} = partTable[type][partId];
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

    let component;
    switch (shape) {
        case CIRCLE:
        default:
            component = (
                <Graphics 
                    draw={(g) => {drawCircle(fixedX, fixedY, size/2, rim,  scale, g)}}
                    zIndex={0}
                    interactive={true}
                    onclick={() => {onClick(part)}}
                />
            );
            break;
    }

    return (
        <>
            {component}
            <Graphics 
                draw={(g) => drawLine(fixedX, fixedY,  scale, g)}
                zIndex={5}
            />
            {textComponents}
        </>
    );
}

export default Part;