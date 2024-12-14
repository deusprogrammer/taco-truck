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

    return [(originX * panelWidth) + x + offsetX, (originY * panelHeight) + y + offsetY];
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