import React from 'react';
import PartSvg from './PartSvg';
import PanelSvg from './PanelSvg';

const LayoutDisplaySvg = ({layout, currentScale, workspacePosition, workspaceRef}) => {
    console.log("WORKSPACE POSITION: " + workspacePosition[0] + ", " + workspacePosition[1]);

    return (
        <div ref={workspaceRef} className='flex flex-grow flex-shrink h-0 w-full justify-center p-14'>
            <svg 
                x={workspacePosition[0] * currentScale}
                y={workspacePosition[1] * currentScale}
                width={layout.panelDimensions[0] * currentScale} 
                height={layout.panelDimensions[1] * currentScale}
            >
                <PanelSvg
                    scale={currentScale}
                    layout={layout}
                    fill="white"
                />
                {layout?.parts?.map((part, index) => 
                    <PartSvg 
                        key={`part-${index}`}
                        scale={currentScale} 
                        part={part}
                        parent={layout}
                    />
                )}
            </svg>
        </div>
    );
}

export default LayoutDisplaySvg;