# Taco Truck - Copilot Instructions

## Project Overview

Taco Truck is a React-based fightstick layout designer for creating custom arcade controller layouts. Users can design panels, place buttons/holes, import SVG panels, and export designs for manufacturing (DXF/SVG/STL).

## Core Architecture

### State Management (Jotai)

**Global atoms** in `src/atoms/ViewOptions.atom.js` control viewport and editor state:

- `zoomAtom`, `workspacePositionAtom`: Canvas transform state
- `modeAtom`: Current editor mode (SELECT, ADD, ART_ADJUST, EDIT, EXPORT)
- `selectedAtom`: Currently selected part ID
- `previewAtom`, `editLockComponentAtom`, `scrollLockComponentAtom`: UI toggles
- `mappingStyleAtom`: Button label style (PS/XB/NS)

**Usage pattern**: `const [value, setValue] = useAtom(atomName)` - always destructure both getter/setter

**Custom hooks** in `src/hooks/AtomHooks.js`:

- `useKeyShortcuts()`: Global keyboard shortcuts (c/p/q/e/wasd/m/h/g/1-4)
- Hooks depend on layout context and containerRef for centering/pan operations

### Part System Architecture

**Three-tier part hierarchy**:

1. **Primitive parts** (`src/data/parts.table.js`): Built-in buttons/holes with CIRCLE/SQUARE/ELLIPSE shapes
2. **User parts** (`partTable.user`): Custom SVG-based parts with `modelTree` geometry, loaded from REST API + localStorage hybrid
3. **Custom parts**: Composite parts containing nested layouts (can contain other custom parts)

**Part data structure**:

```javascript
{
  id: 'uuid',
  partId: 'SANWA-24mm',  // references partTable key
  type: 'button' | 'hole' | 'user',
  origin: [x, y],         // panel-relative position
  anchor: [0-1, 0-1],     // alignment point within part bounds
  relativeTo: 'other-id', // parent for relative positioning
  rotation: degrees,
  flipX: bool, flipY: bool
}
```

**PartTable loading** (`src/hooks/PartTableHooks.js`):

- Parts loaded via Jotai atom on app mount in `App.jsx`
- Shows `Interstitial` component while `loading` is true
- Always use `const { partTable } = usePartTable()` to access parts - never import directly

### Positioning System (Critical for Layout Correctness)

**Two positioning modes**:

1. **Absolute positioning**: `origin` property defines position relative to panel top-left
2. **Relative positioning**: `relativeTo` + `anchor` positions part relative to another part's bounds

**Anchor coordinates** (0-1 normalized):

- `[0, 0]` = top-left of part, `[0.5, 0.5]` = center, `[1, 1]` = bottom-right
- Used for both placement point within part AND alignment point on parent

**Position calculation** (`calculateRelativePosition()` in `utils.js`):

- Recursively resolves `relativeTo` chains to final absolute position
- **Circular dependency prevention**: `wouldCreateCircularDependency()` validates before allowing `relativeTo` assignment
- Returns `[x, y]` in panel coordinates

**Export position augmentation**:

- `augmentLayoutWithAbsolutePositions()`: Pre-calculates all relative positions → `absolutePosition` property
- Required before export to avoid recalculating during MakerJS conversion
- `simplify()` flattens custom parts into primitive parts with absolutePosition
- Never modify `origin` during export - use augmentation pattern

### Rendering Pipeline

**Dual rendering paths**:

1. **Interactive canvas** (`LayoutDisplay.jsx`): PIXI.js for real-time manipulation
    - Uses `@pixi/react` declarative components (`<Graphics>`, `<Text>`)
    - Handles mouse gestures via `@use-gesture/react`
    - Renders measurement lines, anchors, grid overlays
2. **Export preview** (`LayoutDisplaySvg.jsx`): MakerJS → SVG/DXF
    - Pipeline: Layout → `augmentLayoutWithAbsolutePositions()` → `simplify()` → `makerify()` → MakerJS model
    - `makerify()` converts geometry to CAD primitives (circles, rectangles, paths)
    - `makerifyModelTree()` handles SVG vector parts with `modelTree` geometry

**Part components** (`src/components/parts/`):

- `Part.jsx`: Renders primitive circles/squares with PIXI Graphics
- `CustomPart.jsx`: Recursively renders nested layouts
- `ComplexPart.jsx`: (usage pattern unclear - check implementation)

### Editor Modes & Interaction

**Mode system** (`src/components/elements/Modes.jsx`):

- `SELECT`: Default - click to select, drag to move, handles relative positioning UI
- `ADD`: Palette-driven placement - cursor shows part preview, click to place
- `ART_ADJUST`: Drag artwork layer independently of parts
- `EDIT`: (check usage)
- `EXPORT`: (check if used)

**Interaction state** (in `PartDesigner.jsx`):

- `placingPartId` + `placingPartType`: What part to place in ADD mode
- `afterSelect`: Callback for secondary interactions (e.g., "select parent for relativeTo")
- `selected` / `hovered`: Track interaction targets

## Development Workflows

### Build & Deploy

```bash
npm start          # Dev server on localhost:3000
npm run build      # Production build to build/
npm run deploy     # Build + firebase deploy to production
```

**Environment-specific routes**:

- `/dev` route only available in development (check `App.jsx`)
- Production basename: `/taco-truck` (see `package.json` homepage)

### Keyboard Shortcuts (AtomHooks.js)

**Navigation**:

- `c`: Center viewport on layout
- `q`/`e`: Zoom out/in
- `wasd`: Pan viewport (respects scrollLock)
- `r`: Set zoom to real-size ratio

**Toggles**:

- `p`: Preview mode (hide UI)
- `1`: Toggle edit lock
- `2`: Toggle scroll lock
- `3`: Toggle zoom lock
- `4`: Toggle button opacity (1.0 ↔ 0.5)
- `h`: Toggle anchor visualization
- `g`: Toggle grid

**Tools**:

- `m`: Cycle button mapping style (PS → XB → NS)
- `Escape`: Clear selection & exit secondary modes

### Key Utilities (utils.js)

**Position/geometry**:

- `calculateRelativePosition(part, allParts, panelWidth, panelHeight)`: Resolve final position
- `calculateSizeOfPart(part, partTable)`: Get [width, height] recursively for custom parts
- `wouldCreateCircularDependency(partId, targetRelativeTo, parts)`: Validate relativeTo assignments

**Export pipeline**:

- `augmentLayoutWithAbsolutePositions(layout, partTable)`: Add `absolutePosition` to all parts
- `simplify(layout, parent, partTable)`: Flatten custom parts into primitives
- `normalizePartPositionsToZero(parts, partTable)`: Shift to origin (legacy?)
- `makerify(simplifiedLayout, parent, partTable, options)`: Convert to MakerJS model
- `makerifyModelTree(modelTree, options)`: Handle SVG vector geometry

**Data hygiene**:

- `convertNestedArraysToObjects()` / `convertPointsObjectsToArrays()`: Firebase compatibility transforms
- `transformChildPartsToGlobalCoordinates()`: Ungroup custom parts while preserving positions

### API Integration (api/Api.js)

**REST endpoints** (`https://deusprogrammer.com/api/taco-truck`):

- Projects: `GET/POST/PUT/DELETE /projects/:id`
- Components: `GET/POST/PUT/DELETE /components/:id`
- Parts: `GET/POST/PUT/DELETE /parts/:id`

**Authentication**:

- Uses `X-Access-Token` header from localStorage
- `getSecurityContext()`: Fetch current user profile
- SecurityContext provider wraps app in `App.jsx`

**Hybrid storage**:

- Custom parts stored in localStorage (`taco-truck-parts`) AND cloud
- `getParts(includeLocal)`: Merges cloud + local parts into partTable
- Fallback to localStorage when API unavailable

### SVG Import Requirements

**Required SVG structure**:

```xml
<svg width="300" height="200">
  <path id="cut_path" d="..." />        <!-- REQUIRED: panel outline -->
  <path id="mounting_path" d="..." />   <!-- OPTIONAL: mounting holes -->
</svg>
```

- Must have width/height attributes OR user enters manually
- Paths must be siblings at same hierarchy level
- Use Inkscape or similar to add id attributes

### Testing & Debugging

**Development tools**:

- `/dev` route: Debugging playground (only in dev mode)
- Preview mode (`p`): See final layout without UI chrome
- Export modal: View MakerJS JSON, simplified layout, raw Taco Truck data

**Console logging**:

- Position calculations: Check `calculateRelativePosition()` for debug logs
- Part loading: `partTableLoaderAtom` logs errors on failure

## Common Pitfalls

1. **Never mutate layout.parts directly** - always use `onUpdatePart()` callbacks
2. **Always validate circular dependencies** before setting `relativeTo`
3. **Use `augmentLayoutWithAbsolutePositions()` before export** - never calculate positions during MakerJS conversion
4. **Import partTable via hook** - `usePartTable()` ensures loading is complete
5. **Respect edit/scroll/zoom locks** - check atom state before programmatic viewport changes
6. **Custom parts ungroup transforms** - use `transformChildPartsToGlobalCoordinates()` to preserve positions
7. **Firebase array transforms** - apply `convertNestedArraysToObjects()` before save, reverse on load

## External Dependencies

- **PIXI.js 7.x**: WebGL-accelerated 2D rendering
- **MakerJS**: CAD geometry operations & DXF/SVG export
- **Jotai 2.x**: Minimal atomic state management
- **@use-gesture/react**: Touch/mouse gesture handling
- **React Router 7.x**: Client-side routing
- **Tailwind CSS**: Utility styling
- **Firebase**: Hosting (potential backend expansion)
- **axios**: HTTP client
- **react-toastify**: Toast notifications
