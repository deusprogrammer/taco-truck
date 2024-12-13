import Button from "./parts/Button";
import Custom from "./parts/Custom";
import Hole from "./parts/Hole";

export const getPart = (part, currentScale, parent, index, selected, hovered, onClick) => {
    switch(part.type) {
        case "hole":
            return <Hole 
                        key={`hole-${index}`}
                        selectedPartId={selected}
                        hoveredPartId={hovered}
                        scale={currentScale} 
                        part={part} 
                        index={index}
                        parent={parent}
                        onClick={onClick} />;
        case "button":
            return <Button 
                        key={`button-${index}`}
                        selectedPartId={selected}
                        hoveredPartId={hovered}
                        scale={currentScale} 
                        part={part} 
                        index={index} 
                        parent={parent}
                        onClick={onClick} />;
        case "custom":
            return <Custom 
                        key={`custom-${index}`}
                        selectedPartId={selected}
                        hoveredPartId={hovered}
                        scale={currentScale} 
                        part={part}  
                        index={index}
                        parent={parent}
                        onClick={onClick} />;
        default:
            return null;
    }
}

export const calculatePosition = (x, y, originX, originY, offsetX, offsetY, panelWidth, panelHeight) => {
    return [(originX * panelWidth) + offsetX + x, (originY * panelHeight) + offsetY + y];
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

    return [(originX * panelWidth) + x + offsetX, (originY * panelHeight) + y + offsetY];
}