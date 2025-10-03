# Taco Truck - Copilot Instructions

## Project Overview

Taco Truck is a React-based fightstick layout designer for creating custom arcade controller layouts. Users can design panels, place buttons/holes, import SVG panels, and export designs for manufacturing.

## Architecture & Key Patterns

### State Management with Jotai

- **Global atoms** in `src/atoms/ViewOptions.atom.js` manage viewport state (zoom, position, mode, selections)
- **Custom hooks** in `src/hooks/AtomHooks.js` provide keyboard shortcuts and viewport controls
- Use `useAtom()` hook pattern: `const [value, setValue] = useAtom(atomName)`
- Key atoms: `zoomAtom`, `workspacePositionAtom`, `modeAtom`, `selectedAtom`

### Part System Architecture

- **Part Table** (`src/data/parts.table.js`): Static definitions for buttons/holes with shape metadata
- **Custom Parts**: User-created components stored in localStorage and cloud
- **Vector Parts**: SVG-based parts with `modelTree` geometry data
- Parts have position, origin, anchor, and relative positioning system

### Layout & Positioning System

- **Relative positioning**: Parts can be positioned relative to other parts via `relativeTo` property
- **Anchor system**: Parts use anchor points (0-1 normalized) for alignment within panels
- **Origin coordinates**: Panel-relative positioning using normalized coordinates
- Use `calculateRelativePosition()` utility for position calculations

### Rendering Architecture

- **LayoutDisplay** (`src/components/LayoutDisplay.jsx`): Main canvas component using PIXI.js
- **PartDesigner** (`src/components/PartDesigner.jsx`): Primary editor orchestrating all interactions
- **SVG Export**: Separate `LayoutDisplaySvg` component for high-quality vector exports

### Mode System

- **SELECT**: Part selection and manipulation
- **ADD**: Placing new parts from palette
- **ART_ADJUST**: Artwork positioning mode
- Modes defined in `src/components/elements/Modes.js`

## Development Patterns

### Component Structure

- **Menu components** in `src/components/menus/`: Side panels for part details, options, etc.
- **Modal system**: `ModalContainer` with key-based modal mapping
- **Responsive design**: Desktop-first with mobile view-only mode

### Data Flow

1. **Layout objects** contain `parts[]`, `panelDimensions`, and metadata
2. **Part updates** flow through `onUpdatePart()` callback to parent
3. **Cloud sync** via REST API (`src/api/Api.js`) with local fallback
4. **Export pipeline**: Layout → Simplified → MakerJS model → STL/DXF

### Key Utilities

- `src/components/utils.js`: Core geometry calculations, MakerJS integration
- `calculateSizeOfPart()`: Recursive part dimension calculation
- `normalizePartPositionsToZero()`: Prepare layouts for export
- `makerify()`: Convert layout to MakerJS format for manufacturing

## Development Workflows

### Local Development

```bash
npm start              # Development server (React Scripts)
npm run build          # Production build
npm run deploy         # Build + Firebase deploy
```

### Key Keyboard Shortcuts (implemented in AtomHooks.js)

- `c`: Center workspace on layout
- `p`: Toggle preview mode
- `1-4`: Toggle edit/scroll/zoom locks, button opacity
- `q/e`: Zoom in/out
- `wasd`: Pan workspace
- `m`: Cycle button mapping styles (PS/XB/NS)

### Testing Layouts

- Use `/dev` route in development for debugging
- Preview mode (`p` key) shows final layout without UI
- Export modal provides STL/DXF generation for manufacturing

## External Dependencies

- **PIXI.js**: High-performance 2D rendering for layout display
- **MakerJS**: CAD operations and export to manufacturing formats
- **Jotai**: Atomic state management
- **Firebase**: Hosting and potential backend integration
- **Tailwind CSS**: Utility-first styling

## File Import/Export

- **SVG Import**: Requires `cut_path` and optional `mounting_path` IDs
- **Layout Export**: STL/DXF formats via MakerJS pipeline
- **Local Storage**: Fallback for designs when offline

## Common Tasks

- **Adding new part types**: Update `partTable` in `src/data/parts.table.js`
- **Modifying keyboard shortcuts**: Edit `useKeyShortcuts` in `AtomHooks.js`
- **New UI modes**: Add to `Modes.js` and handle in `PartDesigner`
- **Export formats**: Extend `makerify()` function in `utils.js`
