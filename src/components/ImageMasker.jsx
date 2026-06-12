import { useState, useRef, useEffect, useCallback, useMemo } from 'react';

// ---------------------------------------------------------------------------
// SVG parsing
// ---------------------------------------------------------------------------

const SHAPE_TAGS = new Set(['path', 'circle', 'rect', 'ellipse', 'polygon', 'polyline', 'line']);
const SKIP_ATTRS = new Set(['xmlns', 'xmlns:xlink', 'xml:space', 'version']);
// SVG attrs that React needs in camelCase
const ATTR_REMAP = {
  class: 'className',
  'clip-rule': 'clipRule',
  'fill-rule': 'fillRule',
  'stroke-width': 'strokeWidth',
  'stroke-linecap': 'strokeLinecap',
  'stroke-linejoin': 'strokeLinejoin',
  'stroke-dasharray': 'strokeDasharray',
  'stroke-dashoffset': 'strokeDashoffset',
  'stroke-opacity': 'strokeOpacity',
  'fill-opacity': 'fillOpacity',
};

// ---------------------------------------------------------------------------
// Compound-path deduplication
//
// Some CAD/vector tools export each closed subpath twice — once clockwise and
// once counter-clockwise — as a way to produce clean outlines regardless of
// fill mode.  When we later apply fill="black" + clip-rule="evenodd" the two
// copies cancel each other out at even winding depth, turning what should be
// a hole into a filled (visible) region.
//
// Detection heuristic: two subpaths are reversed duplicates when the first
// absolute coordinate of A equals the second absolute coordinate of B, and
// vice-versa (i.e. one path starts where the other's first segment ends).
// This reliably catches the CW/CCW export pattern without false-positives.
// ---------------------------------------------------------------------------

function splitSubpaths(d) {
  // Keep each "M …" block as one subpath string.
  // Split only on *absolute* M so that relative `m` within a subpath is preserved.
  const parts = d.trim().split(/(?=M[\s,])/);
  return parts.map(s => s.trim()).filter(Boolean);
}

function firstTwoCoords(sp) {
  const nums = [];
  const re = /-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?/g;
  let m;
  while ((m = re.exec(sp)) !== null) {
    nums.push(+m[0]);
    if (nums.length >= 4) break;
  }
  return nums.length >= 4
    ? [{ x: nums[0], y: nums[1] }, { x: nums[2], y: nums[3] }]
    : null;
}

function isReversedDuplicate(a, b) {
  const pA = firstTwoCoords(a);
  const pB = firstTwoCoords(b);
  if (!pA || !pB) return false;
  const eps = 0.02;
  const near = (p, q) => Math.abs(p.x - q.x) < eps && Math.abs(p.y - q.y) < eps;
  return near(pA[0], pB[1]) && near(pA[1], pB[0]);
}

function deduplicateCompoundPath(d) {
  const subs = splitSubpaths(d);
  if (subs.length <= 1) return d;
  const skip = new Set();
  const kept = [];
  for (let i = 0; i < subs.length; i++) {
    if (skip.has(i)) continue;
    kept.push(subs[i]);
    for (let j = i + 1; j < subs.length; j++) {
      if (skip.has(j)) continue;
      if (isReversedDuplicate(subs[i], subs[j])) {
        skip.add(j);
        break;
      }
    }
  }
  return kept.join(' ');
}

// ---------------------------------------------------------------------------

function parseSvgContent(svgString) {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(svgString, 'image/svg+xml');
    const svgEl = doc.querySelector('svg');
    if (!svgEl) return { viewBox: '0 0 500 500', shapes: [] };

    let viewBox = svgEl.getAttribute('viewBox');
    if (!viewBox) {
      const w = parseFloat(svgEl.getAttribute('width')) || 500;
      const h = parseFloat(svgEl.getAttribute('height')) || 500;
      viewBox = `0 0 ${w} ${h}`;
    }

    const shapes = [];

    function walk(node, inheritedTransform) {
      const tag = node.tagName?.toLowerCase();
      if (!tag) return;

      const own = node.getAttribute?.('transform') || '';
      const transform = inheritedTransform
        ? own ? `${inheritedTransform} ${own}` : inheritedTransform
        : own;

      if (SHAPE_TAGS.has(tag)) {
        const attrs = {};
        for (const attr of node.attributes) {
          if (SKIP_ATTRS.has(attr.name)) continue;
          const name = ATTR_REMAP[attr.name] ?? attr.name;
          attrs[name] = attr.value;
        }
        if (transform) attrs.transform = transform;
        // Remove CW/CCW duplicate subpaths that cancel each other under
        // even-odd fill, turning intended holes into filled regions.
        if (tag === 'path' && attrs.d) {
          attrs.d = deduplicateCompoundPath(attrs.d);
        }
        shapes.push({ tag, attrs });
      }

      for (const child of node.children) {
        walk(child, transform);
      }
    }

    for (const child of svgEl.children) walk(child, '');

    return { viewBox, shapes };
  } catch {
    return { viewBox: '0 0 500 500', shapes: [] };
  }
}

// ---------------------------------------------------------------------------
// Handle definitions  (8 handles: 4 corners + 4 edges)
// ---------------------------------------------------------------------------

const HANDLES = [
  { id: 'nw', getX: r => r.x,            getY: r => r.y,            cursor: 'nw-resize' },
  { id: 'n',  getX: r => r.x + r.w / 2, getY: r => r.y,            cursor: 'n-resize' },
  { id: 'ne', getX: r => r.x + r.w,     getY: r => r.y,            cursor: 'ne-resize' },
  { id: 'e',  getX: r => r.x + r.w,     getY: r => r.y + r.h / 2, cursor: 'e-resize' },
  { id: 'se', getX: r => r.x + r.w,     getY: r => r.y + r.h,     cursor: 'se-resize' },
  { id: 's',  getX: r => r.x + r.w / 2, getY: r => r.y + r.h,     cursor: 's-resize' },
  { id: 'sw', getX: r => r.x,            getY: r => r.y + r.h,     cursor: 'sw-resize' },
  { id: 'w',  getX: r => r.x,            getY: r => r.y + r.h / 2, cursor: 'w-resize' },
];

const MIN_SIZE = 10;

// proportional=true (default): maintain aspect ratio.
// proportional=false (shift held): free / unconstrained resize.
function applyDrag(startRect, handle, dx, dy, proportional = true) {
  const { x, y, w, h } = startRect;

  if (handle === 'move') return { x: x + dx, y: y + dy, w, h };

  if (!proportional) {
    // Free scaling
    switch (handle) {
      case 'nw': {
        const nw = Math.max(MIN_SIZE, w - dx);
        const nh = Math.max(MIN_SIZE, h - dy);
        return { x: x + w - nw, y: y + h - nh, w: nw, h: nh };
      }
      case 'n': {
        const nh = Math.max(MIN_SIZE, h - dy);
        return { x, y: y + h - nh, w, h: nh };
      }
      case 'ne': {
        const nw = Math.max(MIN_SIZE, w + dx);
        const nh = Math.max(MIN_SIZE, h - dy);
        return { x, y: y + h - nh, w: nw, h: nh };
      }
      case 'e':  return { x, y, w: Math.max(MIN_SIZE, w + dx), h };
      case 'se': return { x, y, w: Math.max(MIN_SIZE, w + dx), h: Math.max(MIN_SIZE, h + dy) };
      case 's':  return { x, y, w, h: Math.max(MIN_SIZE, h + dy) };
      case 'sw': {
        const nw = Math.max(MIN_SIZE, w - dx);
        return { x: x + w - nw, y, w: nw, h: Math.max(MIN_SIZE, h + dy) };
      }
      case 'w': {
        const nw = Math.max(MIN_SIZE, w - dx);
        return { x: x + w - nw, y, w: nw, h };
      }
      default: return startRect;
    }
  }

  // Proportional scaling.
  // Corner handles: project the drag vector onto the aspect-ratio diagonal
  // so both axes contribute smoothly with no discontinuities.
  // Edge handles: the primary axis drives the change, the other centers.
  const aspect = w / h;
  const L2 = w * w + h * h; // squared diagonal length

  const clampedW = (scale) => Math.max(MIN_SIZE, w * scale);

  switch (handle) {
    case 'nw': {
      // Outward dir: (-w,-h). Anchor: se corner.
      const scale = 1 + (-dx * w - dy * h) / L2;
      const nw = clampedW(scale);
      const nh = nw / aspect;
      return { x: x + w - nw, y: y + h - nh, w: nw, h: nh };
    }
    case 'ne': {
      // Outward dir: (w,-h). Anchor: sw corner.
      const scale = 1 + (dx * w - dy * h) / L2;
      const nw = clampedW(scale);
      const nh = nw / aspect;
      return { x, y: y + h - nh, w: nw, h: nh };
    }
    case 'se': {
      // Outward dir: (w,h). Anchor: nw corner.
      const scale = 1 + (dx * w + dy * h) / L2;
      const nw = clampedW(scale);
      const nh = nw / aspect;
      return { x, y, w: nw, h: nh };
    }
    case 'sw': {
      // Outward dir: (-w,h). Anchor: ne corner.
      const scale = 1 + (-dx * w + dy * h) / L2;
      const nw = clampedW(scale);
      const nh = nw / aspect;
      return { x: x + w - nw, y, w: nw, h: nh };
    }
    case 'n': {
      const nh = Math.max(MIN_SIZE, h - dy);
      const nw = nh * aspect;
      return { x: x + (w - nw) / 2, y: y + h - nh, w: nw, h: nh };
    }
    case 's': {
      const nh = Math.max(MIN_SIZE, h + dy);
      const nw = nh * aspect;
      return { x: x + (w - nw) / 2, y, w: nw, h: nh };
    }
    case 'e': {
      const nw = Math.max(MIN_SIZE, w + dx);
      const nh = nw / aspect;
      return { x, y: y + (h - nh) / 2, w: nw, h: nh };
    }
    case 'w': {
      const nw = Math.max(MIN_SIZE, w - dx);
      const nh = nw / aspect;
      return { x: x + w - nw, y: y + (h - nh) / 2, w: nw, h: nh };
    }
    default: return startRect;
  }
}

// ---------------------------------------------------------------------------
// Canvas rasterizer — builds a base64 PNG of the image clipped to the shapes
// ---------------------------------------------------------------------------

async function buildDataUrl(shapes, viewBox, imgUrl, imgRect) {
  const [vbX, vbY, vbW, vbH] = viewBox.split(/[\s,]+/).map(Number);
  const scale = 2; // 2× for crisp output
  const canvas = document.createElement('canvas');
  canvas.width  = Math.round(vbW * scale);
  canvas.height = Math.round(vbH * scale);
  const ctx = canvas.getContext('2d');
  ctx.scale(scale, scale);
  ctx.translate(-vbX, -vbY);

  // Build the clip region from every shape using Path2D
  const compound = new Path2D();
  for (const { tag, attrs } of shapes) {
    let p2d = null;
    if (tag === 'path' && attrs.d) {
      p2d = new Path2D(attrs.d);
    } else if (tag === 'rect') {
      p2d = new Path2D();
      p2d.rect(+(attrs.x || 0), +(attrs.y || 0), +(attrs.width || 0), +(attrs.height || 0));
    } else if (tag === 'circle') {
      p2d = new Path2D();
      p2d.arc(+(attrs.cx || 0), +(attrs.cy || 0), +(attrs.r || 0), 0, Math.PI * 2);
    } else if (tag === 'ellipse') {
      p2d = new Path2D();
      p2d.ellipse(+(attrs.cx || 0), +(attrs.cy || 0), +(attrs.rx || 0), +(attrs.ry || 0), 0, 0, Math.PI * 2);
    }
    if (p2d) compound.addPath(p2d);
  }
  ctx.clip(compound, 'evenodd');

  // Load image (skip crossOrigin for blob URLs — they are always same-origin)
  const img = await new Promise((resolve, reject) => {
    const el = new Image();
    if (!imgUrl.startsWith('blob:')) el.crossOrigin = 'anonymous';
    el.onload  = () => resolve(el);
    el.onerror = () => reject(new Error('Image load failed for canvas export'));
    el.src = imgUrl;
  });

  ctx.drawImage(img, imgRect.x, imgRect.y, imgRect.w, imgRect.h);
  return canvas.toDataURL('image/png');
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function ImageMasker({ svgContent, imageUrl, onChange }) {
  const svgRef = useRef(null);
  const dragRef = useRef(null); // { handle, sx, sy, startRect }

  const { viewBox, shapes } = useMemo(
    () => parseSvgContent(svgContent || ''),
    [svgContent],
  );

  const [vbX, vbY, vbW, vbH] = useMemo(
    () => viewBox.split(/[\s,]+/).map(Number),
    [viewBox],
  );

  const [imgRect, setImgRect] = useState(() => ({ x: 0, y: 0, w: 100, h: 100 }));
  const [isMasked, setIsMasked] = useState(false);

  // Stable ref so onChange is never stale inside the event-listener effect
  const onChangeRef = useRef(onChange);
  useEffect(() => { onChangeRef.current = onChange; });

  // Track the most-recently-computed rect in a ref so onMouseUp can read it
  // without needing imgRect in the event-listener effect's dependency array.
  const lastRectRef = useRef(imgRect);

  // Fit image inside the viewBox when imageUrl changes
  useEffect(() => {
    if (!imageUrl) return;
    setIsMasked(false);
    const img = new window.Image();
    img.onload = () => {
      const aspect = img.naturalWidth / img.naturalHeight;
      const vbAspect = vbW / vbH;
      let w, h;
      if (aspect > vbAspect) {
        w = vbW * 0.9;
        h = w / aspect;
      } else {
        h = vbH * 0.9;
        w = h * aspect;
      }
      setImgRect({
        x: vbX + (vbW - w) / 2,
        y: vbY + (vbH - h) / 2,
        w,
        h,
      });
    };
    img.src = imageUrl;
  }, [imageUrl, vbX, vbY, vbW, vbH]);

  // Convert browser client coords → SVG user-space coords
  const toSvgPoint = useCallback((clientX, clientY) => {
    const el = svgRef.current;
    if (!el) return { x: 0, y: 0 };
    const pt = el.createSVGPoint();
    pt.x = clientX;
    pt.y = clientY;
    const { x, y } = pt.matrixTransform(el.getScreenCTM().inverse());
    return { x, y };
  }, []);

  const onPointerDown = useCallback(
    (e, handle) => {
      e.preventDefault();
      e.stopPropagation();
      setIsMasked(false);
      const { x, y } = toSvgPoint(e.clientX, e.clientY);
      dragRef.current = { handle, sx: x, sy: y, startRect: { ...imgRect } };
    },
    [imgRect, toSvgPoint],
  );

  useEffect(() => {
    const onMouseMove = (e) => {
      if (!dragRef.current) return;
      const { handle, sx, sy, startRect } = dragRef.current;
      const { x, y } = toSvgPoint(e.clientX, e.clientY);
      // Proportional by default; hold Shift for unconstrained free resize.
      const proportional = !e.shiftKey;
      const newRect = applyDrag(startRect, handle, x - sx, y - sy, proportional);
      lastRectRef.current = newRect;
      setImgRect(newRect);
    };

    const onMouseUp = () => {
      if (!dragRef.current) return;
      dragRef.current = null;
      setIsMasked(true);
      // Fire onChange once, after drag ends, with the base64-encoded masked image.
      const rect = lastRectRef.current;
      buildDataUrl(shapes, viewBox, imageUrl, rect)
        .then(dataUrl => onChangeRef.current?.({ ...rect, dataUrl }))
        .catch(err  => onChangeRef.current?.({ ...rect, dataUrl: null, error: err.message }));
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [toSvgPoint, shapes, viewBox, imageUrl]);

  // Handle size proportional to viewBox (targets ~8px on screen for typical sizes)
  const hs = Math.min(vbW, vbH) / 60;
  const sw = Math.max(0.5, hs / 5); // stroke width

  const checkerCell = Math.min(vbW, vbH) / 20;

  return (
    <svg
      ref={svgRef}
      viewBox={`${vbX} ${vbY} ${vbW} ${vbH}`}
      style={{ width: '100%', height: '100%', display: 'block' }}
    >
      <defs>
        {/* Transparency checkerboard */}
        <pattern
          id="im-checker"
          x={vbX}
          y={vbY}
          width={checkerCell * 2}
          height={checkerCell * 2}
          patternUnits="userSpaceOnUse"
        >
          <rect width={checkerCell * 2} height={checkerCell * 2} fill="#e8e8e8" />
          <rect width={checkerCell} height={checkerCell} fill="#c8c8c8" />
          <rect x={checkerCell} y={checkerCell} width={checkerCell} height={checkerCell} fill="#c8c8c8" />
        </pattern>

        {/*
          Clip path built from the SVG shapes.
          clip-rule="evenodd" ensures compound paths (e.g. donuts) correctly
          punch holes using the even-odd winding rule.
          fill="black" guarantees each shape contributes to the clip region
          regardless of its original fill color.
        */}
        <clipPath id="im-shape-clip" clipPathUnits="userSpaceOnUse">
          {shapes.map(({ tag: Tag, attrs }, i) => (
            <Tag key={i} {...attrs} fill="black" clipRule="evenodd" />
          ))}
        </clipPath>
      </defs>

      {/* Background */}
      <rect x={vbX} y={vbY} width={vbW} height={vbH} fill="url(#im-checker)" />

      {/* Raster image (masked once the user releases a drag) */}
      {imageUrl && (
        <image
          href={imageUrl}
          x={imgRect.x}
          y={imgRect.y}
          width={imgRect.w}
          height={imgRect.h}
          preserveAspectRatio="none"
          clipPath={isMasked ? 'url(#im-shape-clip)' : undefined}
          onMouseDown={(e) => onPointerDown(e, 'move')}
          style={{ cursor: 'move' }}
        />
      )}

      {/*
        SVG shape guide overlay — always drawn on top so the user can see
        the mask boundary. Fades when the mask is active.
      */}
      {shapes.map(({ tag: Tag, attrs }, i) => (
        <Tag
          key={i}
          {...attrs}
          fill="none"
          stroke={isMasked ? 'rgba(0,120,255,0.2)' : 'rgba(0,120,255,0.85)'}
          strokeWidth={isMasked ? sw : sw * 2}
          strokeDasharray={isMasked ? undefined : `${hs * 3} ${hs * 1.5}`}
          pointerEvents="none"
        />
      ))}

      {/* Bounding box of the image */}
      {imageUrl && (
        <rect
          x={imgRect.x}
          y={imgRect.y}
          width={imgRect.w}
          height={imgRect.h}
          fill="none"
          stroke="rgba(0,120,255,0.5)"
          strokeWidth={sw}
          strokeDasharray={`${hs * 2} ${hs}`}
          pointerEvents="none"
        />
      )}

      {/* Resize / scale handles */}
      {imageUrl &&
        HANDLES.map(({ id, getX, getY, cursor }) => (
          <rect
            key={id}
            x={getX(imgRect) - hs}
            y={getY(imgRect) - hs}
            width={hs * 2}
            height={hs * 2}
            rx={id.length === 1 ? hs : 0} // round edge handles, square corners
            fill="white"
            stroke="#0078ff"
            strokeWidth={sw}
            style={{ cursor }}
            onMouseDown={(e) => onPointerDown(e, id)}
          />
        ))}
    </svg>
  );
}
