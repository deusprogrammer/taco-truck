import React from 'react';
import PartSvg from './PartSvg';
import PanelSvg from './PanelSvg';

const LayoutDisplaySvg = ({layout, currentScale, selected, hovered, mode, workspaceDimensions, workspacePosition, workspaceRef, placingPartId, placingPartType, onSelectPart, onSecondarySelectPart, onLayoutChange}) => {
    return (
        <div className='flex flex-grow flex-shrink h-0 w-full justify-center p-14'>
            <svg width="1000" height="1000">
                <PanelSvg
                    scale={currentScale}
                    layout={layout}
                    fill="black"
                />
                {layout?.parts?.map((part, index) => 
                    <PartSvg 
                        key={`part-${index}`}
                        scale={currentScale} 
                        part={part} 
                        adjustments={{x: 0, y: 0, rotation: 0}}
                        parent={layout}
                    />
                )}
            </svg>
        </div>
    );
}

export default LayoutDisplaySvg;