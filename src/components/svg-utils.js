const argsToPoints = (args) => {
  if (!args || args.length < 2) return [];
  return args.reduce((acc, val, index) => {
    if (index % 2 === 0) {
      acc.push([val, args[index + 1]]);
    }
    return acc;
  }, []);
};

const argsToPointsRelative = (args, currentPoint) => {
  if (!args || args.length < 2) return [];
  return args.reduce((acc, val, index) => {
    if (index % 2 === 0) {
      acc.push([currentPoint[0] + val, currentPoint[1] + args[index + 1]]);
    }
    return acc;
  }, []);
};

const getLastPoint = (args) => {
  if (!args || args.length < 2) return null;
  return [args[args.length - 2], args[args.length - 1]];
};

const getLastPointRelative = (args, currentPoint) => {
  if (!args || args.length < 2) return null;
  return [currentPoint[0] + args[args.length - 2], currentPoint[1] + args[args.length - 1]];
};

const convertPathToInstructions = (path) => {
  if (!path) return null;
  const instructions = [];
  const tokens = path.match(/[a-zA-Z]|-?\d*\.?\d+(?:[eE][+-]?\d+)?/g);
  if (!tokens) return null;
  let currentPoint = [0, 0];
  let subpathStart = [0, 0];
  let i = 0;
  let prevCommand = null;

  const argCounts = {
    M: 2, L: 2, H: 1, V: 1, C: 6, S: 4, Q: 4, T: 2, A: 7,
    m: 2, l: 2, h: 1, v: 1, c: 6, s: 4, q: 4, t: 2, a: 7,
    Z: 0, z: 0
  };

  while (i < tokens.length) {
    const type = tokens[i++];
    if (!/[a-zA-Z]/.test(type)) continue;
    const argsNeeded = argCounts[type];

    // Some commands can have multiple sets of arguments (e.g., "C" with 12 numbers = 2 segments)
    while (i < tokens.length || argsNeeded === 0) {
      if (i < tokens.length && /[a-zA-Z]/.test(tokens[i])) break;
      const args = [];
      for (let j = 0; j < argsNeeded && i < tokens.length; j++) {
        args.push(Number(tokens[i++]));
      }
      if (args.length < argsNeeded) {
        // For Z/z, still process even if no args
        if (argsNeeded === 0) {
          // fall through
        } else {
          break;
        }
      }
      const commandString = type + args.join(' ');

      switch (type) {
        case 'M':
          // First pair is move
          currentPoint = [args[0], args[1]];
          subpathStart = [...currentPoint];
          instructions.push({ command: `${type}${args[0]} ${args[1]}`, argCount: 2, type: 'move', point: [...currentPoint] });
          // Any additional pairs are implicit lineTo
          for (let k = 2; k < args.length; k += 2) {
            currentPoint = [args[k], args[k + 1]];
            instructions.push({ command: `L${args[k]} ${args[k + 1]}`, argCount: 2, type: 'line', point: [...currentPoint] });
          }
          break;
        case 'm':
          // First pair is move (relative)
          currentPoint = [currentPoint[0] + args[0], currentPoint[1] + args[1]];
          subpathStart = [...currentPoint];
          instructions.push({ command: `${type}${args[0]} ${args[1]}`, argCount: 2, type: 'move', point: [...currentPoint] });
          // Any additional pairs are implicit lineTo (relative)
          for (let k = 2; k < args.length; k += 2) {
            currentPoint = [currentPoint[0] + args[k], currentPoint[1] + args[k + 1]];
            instructions.push({ command: `l${args[k]} ${args[k + 1]}`, argCount: 2, type: 'line', point: [...currentPoint] });
          }
          break;
        case 'L':
          for (let k = 0; k < args.length; k += 2) {
            currentPoint = [args[k], args[k + 1]];
            instructions.push({ command: `L${args[k]} ${args[k + 1]}`, argCount: 2, type: 'line', point: [...currentPoint] });
          }
          break;
        case 'l':
          for (let k = 0; k < args.length; k += 2) {
            currentPoint = [currentPoint[0] + args[k], currentPoint[1] + args[k + 1]];
            instructions.push({ command: `l${args[k]} ${args[k + 1]}`, argCount: 2, type: 'line', point: [...currentPoint] });
          }
          break;
        case 'H':
          for (let k = 0; k < args.length; k++) {
            currentPoint = [args[k], currentPoint[1]];
            instructions.push({ command: `H${args[k]}`, argCount: 1, type: 'line', point: [...currentPoint] });
          }
          break;
        case 'h':
          for (let k = 0; k < args.length; k++) {
            currentPoint = [currentPoint[0] + args[k], currentPoint[1]];
            instructions.push({ command: `h${args[k]}`, argCount: 1, type: 'line', point: [...currentPoint] });
          }
          break;
        case 'V':
          for (let k = 0; k < args.length; k++) {
            currentPoint = [currentPoint[0], args[k]];
            instructions.push({ command: `V${args[k]}`, argCount: 1, type: 'line', point: [...currentPoint] });
          }
          break;
        case 'v':
          for (let k = 0; k < args.length; k++) {
            currentPoint = [currentPoint[0], currentPoint[1] + args[k]];
            instructions.push({ command: `v${args[k]}`, argCount: 1, type: 'line', point: [...currentPoint] });
          }
          break;
        case 'C':
          for (let k = 0; k < args.length; k += 6) {
            const pts = [
              [args[k], args[k + 1]],
              [args[k + 2], args[k + 3]],
              [args[k + 4], args[k + 5]],
            ];
            instructions.push({
              command: `C${args.slice(k, k + 6).join(' ')}`,
              argCount: 6,
              type: 'bezier',
              points: pts,
            });
            currentPoint = pts[2];
          }
          break;
        case 'c':
          for (let k = 0; k < args.length; k += 6) {
            const pts = [
              [currentPoint[0] + args[k], currentPoint[1] + args[k + 1]],
              [currentPoint[0] + args[k + 2], currentPoint[1] + args[k + 3]],
              [currentPoint[0] + args[k + 4], currentPoint[1] + args[k + 5]],
            ];
            instructions.push({
              command: `c${args.slice(k, k + 6).join(' ')}`,
              argCount: 6,
              type: 'bezier',
              points: pts,
            });
            currentPoint = pts[2];
          }
          break;
        case 'S':
          for (let k = 0; k < args.length; k += 4) {
            let prev = prevCommand && prevCommand.type === 'bezier' ? prevCommand : null;
            let reflect = prev
              ? [
                  2 * currentPoint[0] - prev.points[1][0],
                  2 * currentPoint[1] - prev.points[1][1],
                ]
              : currentPoint;
            const pts = [
              reflect,
              [args[k], args[k + 1]],
              [args[k + 2], args[k + 3]],
            ];
            instructions.push({
              command: `S${args.slice(k, k + 4).join(' ')}`,
              argCount: 4,
              type: 'bezier',
              points: pts,
            });
            currentPoint = pts[2];
            prevCommand = instructions[instructions.length - 1];
          }
          break;
        case 's':
          for (let k = 0; k < args.length; k += 4) {
            let prev = prevCommand && prevCommand.type === 'bezier' ? prevCommand : null;
            let reflect = prev
              ? [
                  2 * currentPoint[0] - prev.points[1][0],
                  2 * currentPoint[1] - prev.points[1][1],
                ]
              : currentPoint;
            const pts = [
              reflect,
              [currentPoint[0] + args[k], currentPoint[1] + args[k + 1]],
              [currentPoint[0] + args[k + 2], currentPoint[1] + args[k + 3]],
            ];
            instructions.push({
              command: `s${args.slice(k, k + 4).join(' ')}`,
              argCount: 4,
              type: 'bezier',
              points: pts,
            });
            currentPoint = pts[2];
            prevCommand = instructions[instructions.length - 1];
          }
          break;
        case 'Q':
          for (let k = 0; k < args.length; k += 4) {
            const pts = [
              [args[k], args[k + 1]],
              [args[k + 2], args[k + 3]],
            ];
            instructions.push({
              command: `Q${args.slice(k, k + 4).join(' ')}`,
              argCount: 4,
              type: 'quadratic',
              points: pts,
            });
            currentPoint = pts[1];
            prevCommand = instructions[instructions.length - 1];
          }
          break;
        case 'q':
          for (let k = 0; k < args.length; k += 4) {
            const pts = [
              [currentPoint[0] + args[k], currentPoint[1] + args[k + 1]],
              [currentPoint[0] + args[k + 2], currentPoint[1] + args[k + 3]],
            ];
            instructions.push({
              command: `q${args.slice(k, k + 4).join(' ')}`,
              argCount: 4,
              type: 'quadratic',
              points: pts,
            });
            currentPoint = pts[1];
            prevCommand = instructions[instructions.length - 1];
          }
          break;
        case 'T':
          for (let k = 0; k < args.length; k += 2) {
            let prev = prevCommand && prevCommand.type === 'quadratic' ? prevCommand : null;
            let reflect = prev
              ? [
                  2 * currentPoint[0] - prev.points[0][0],
                  2 * currentPoint[1] - prev.points[0][1],
                ]
              : currentPoint;
            const pts = [
              reflect,
              [args[k], args[k + 1]],
            ];
            instructions.push({
              command: `T${args.slice(k, k + 2).join(' ')}`,
              argCount: 2,
              type: 'quadratic',
              points: pts,
            });
            currentPoint = pts[1];
            prevCommand = instructions[instructions.length - 1];
          }
          break;
        case 't':
          for (let k = 0; k < args.length; k += 2) {
            let prev = prevCommand && prevCommand.type === 'quadratic' ? prevCommand : null;
            let reflect = prev
              ? [
                  2 * currentPoint[0] - prev.points[0][0],
                  2 * currentPoint[1] - prev.points[0][1],
                ]
              : currentPoint;
            const pts = [
              reflect,
              [currentPoint[0] + args[k], currentPoint[1] + args[k + 1]],
            ];
            instructions.push({
              command: `t${args.slice(k, k + 2).join(' ')}`,
              argCount: 2,
              type: 'quadratic',
              points: pts,
            });
            currentPoint = pts[1];
            prevCommand = instructions[instructions.length - 1];
          }
          break;
        case 'A':
          for (let k = 0; k < args.length; k += 7) {
            const rx = args[k], ry = args[k + 1], xAxisRotation = args[k + 2],
              largeArcFlag = args[k + 3], sweepFlag = args[k + 4],
              x = args[k + 5], y = args[k + 6];
            instructions.push({
              command: `A${args.slice(k, k + 7).join(' ')}`,
              argCount: 7,
              type: 'arc',
              rx, ry, xAxisRotation, largeArcFlag, sweepFlag,
              point: [x, y],
            });
            currentPoint = [x, y];
          }
          break;
        case 'a':
          for (let k = 0; k < args.length; k += 7) {
            const rx = args[k], ry = args[k + 1], xAxisRotation = args[k + 2],
              largeArcFlag = args[k + 3], sweepFlag = args[k + 4],
              x = currentPoint[0] + args[k + 5], y = currentPoint[1] + args[k + 6];
            instructions.push({
              command: `a${args.slice(k, k + 7).join(' ')}`,
              argCount: 7,
              type: 'arc',
              rx, ry, xAxisRotation, largeArcFlag, sweepFlag,
              point: [x, y],
            });
            currentPoint = [x, y];
          }
          break;
        case 'Z':
        case 'z':
          instructions.push({ command: type, argCount: 0, type: 'close' });
          currentPoint = [...subpathStart];
          break;
        default:
          instructions.push({ type: 'unknown', command: commandString, argCount: args.length });
          break;
      }
      prevCommand = instructions[instructions.length - 1];
      // For commands that can repeat (like "C", "L", etc.), loop continues
      // For commands that should not repeat, break after one
      if (!'MLHVCSQTAmlhvcsqta'.includes(type)) break;
      // For Z/z, break after one
      if (type === 'Z' || type === 'z') break;
    }
  }
  return instructions;
};

const extractViewBox = (viewBox) => {
  if (!viewBox) return null;
  const [x, y, width, height] = viewBox.split(' ').map(Number);
  return { x, y, width, height };
};

const convertMatrixToTransform = (matrix) => {
  if (!matrix) return null;
  return {
    skewX: Math.atan2(matrix.c, matrix.d) * (180 / Math.PI), // Convert radians to degrees
    skewY: Math.atan2(matrix.b, matrix.a), // Convert radians to degrees
    translate: { x: matrix.e, y: matrix.f },
    scale: { x: matrix.a, y: matrix.d },
    rotate: Math.atan2(matrix.b, matrix.a) * (180 / Math.PI), // Convert radians to degrees
  };
}

const extractTransform = (transformString) => {
  if (!transformString) return null;
  let transform = {};
  // translate
  const match = transformString.match(/translate\(([^)]+)\)/);
  if (match) {
    const [x, y] = match[1].trim().split(/[\s,]+/).map(Number);
    transform.translate = { x, y: y || 0 };
  }
  // scale
  const scaleMatch = transformString.match(/scale\(([^)]+)\)/);
  if (scaleMatch) {
    const [sx, sy] = scaleMatch[1].trim().split(/[\s,]+/).map(Number);
    transform.scale = { x: sx, y: sy !== undefined ? sy : sx };
  }
  // rotate
  const rotateMatch = transformString.match(/rotate\(([^)]+)\)/);
  if (rotateMatch) {
    const [angle, cx, cy] = rotateMatch[1].trim().split(/[\s,]+/).map(Number);
    transform.rotate = angle;
    if (cx !== undefined && cy !== undefined) {
      transform.rotateCenter = { x: cx, y: cy };
    }
  }
  // skewX
  const skewXMatch = transformString.match(/skewX\(([^)]+)\)/);
  if (skewXMatch) {
    const angle = parseFloat(skewXMatch[1]);
    transform.skewX = angle;
  }
  // skewY
  const skewYMatch = transformString.match(/skewY\(([^)]+)\)/);
  if (skewYMatch) {
    const angle = parseFloat(skewYMatch[1]);
    transform.skewY = angle;
  }
  // matrix
  const matrixMatch = transformString.match(/matrix\(([^)]+)\)/);
  if (matrixMatch) {
    const matrixValues = matrixMatch[1].trim().split(/[\s,]+/).map(Number);
    if (matrixValues.length === 6) {
      transform = {
        ...transform,
        ...convertMatrixToTransform({
          a: matrixValues[0],
          b: matrixValues[1],
          c: matrixValues[2],
          d: matrixValues[3],
          e: matrixValues[4],
          f: matrixValues[5],
        })
      };
    }
  }
  return transform;
};

// Helper to parse the points attribute into an array of [x, y] pairs
const parsePoints = (pointsStr) => {
  if (!pointsStr) return [];
  // Split by space or comma, filter out empty strings, then group into pairs
  const nums = pointsStr.trim().split(/[\s,]+/).map(Number).filter(n => !isNaN(n));
  const points = [];
  for (let i = 0; i < nums.length; i += 2) {
    points.push([nums[i], nums[i + 1]]);
  }
  return points;
};

export const parseSvgStructure = (svgData) => {
  if (!svgData) return null;

  const { name, children } = svgData;

  switch (name) {
    case 'svg':
      return {
        header: {
          viewBox: extractViewBox(svgData.attributes.viewBox),
          width: svgData.attributes.width,
          height: svgData.attributes.height,
        },
        children: children.map(parseSvgStructure).filter((child) => child !== null),
      };
    case 'g':
      return {
        type: 'group',
        transform: extractTransform(svgData.attributes.transform),
        children: children.map(parseSvgStructure).filter((child) => child !== null),
      };
    case 'path':
      return {
        type: 'path',
        transform: extractTransform(svgData.attributes.transform),
        d: svgData.attributes.d.replace(/(?<![eE])-/g, ' -'),
        instructions: convertPathToInstructions(
          svgData.attributes.d.replace(/(?<![eE])-/g, ' -'),
          extractTransform(svgData.attributes.transform)
        ),
        fill: svgData.attributes.fill,
        stroke: svgData.attributes.stroke,
        strokeWidth: svgData.attributes['stroke-width'],
      };
    case 'rect':
      return {
        type: 'rectangle',
        transform: extractTransform(svgData.attributes.transform),
        attributes: svgData.attributes,
        x: Number(svgData.attributes.x),
        y: Number(svgData.attributes.y),
        rx: Number(svgData.attributes.rx),
        ry: Number(svgData.attributes.ry),
        width: Number(svgData.attributes.width),
        height: Number(svgData.attributes.height),
        fill: svgData.attributes.fill,
        stroke: svgData.attributes.stroke,
        strokeWidth: svgData.attributes['stroke-width'],
      };
    case 'circle':
      return {
        type: 'circle',
        transform: extractTransform(svgData.attributes.transform),
        cx: Number(svgData.attributes.cx),
        cy: Number(svgData.attributes.cy),
        r: Number(svgData.attributes.r),
        fill: svgData.attributes.fill,
        stroke: svgData.attributes.stroke,
        strokeWidth: svgData.attributes['stroke-width'],
      };
    case 'polygon':
      return {
        type: 'polygon',
        transform: extractTransform(svgData.attributes.transform),
        points: parsePoints(svgData.attributes.points),
        fill: svgData.attributes.fill,
        stroke: svgData.attributes.stroke,
        strokeWidth: svgData.attributes['stroke-width'],
      };
    case 'polyline':
      return {
        type: 'polyline',
        transform: extractTransform(svgData.attributes.transform),
        points: parsePoints(svgData.attributes.points),
        fill: svgData.attributes.fill,
        stroke: svgData.attributes.stroke,
        strokeWidth: svgData.attributes['stroke-width'],
      };
    default:
      return null;
  }
}