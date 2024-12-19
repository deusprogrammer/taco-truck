import React from 'react';
import PartSvg from './PartSvg';
import PanelSvg from './PanelSvg';

const LayoutDisplaySvg = ({layout, currentScale}) => {
    return (
        <div className='flex flex-grow flex-shrink h-0 w-full justify-center p-14'>
            <svg width={layout.panelDimensions[0] * currentScale} height={layout.panelDimensions[1] * currentScale}>
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