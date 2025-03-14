
import React from "react";
import { getSensorColor } from "./utils";

const MapLegend: React.FC = () => {
  return (
    <div className="absolute bottom-4 right-4 bg-white/80 p-2 rounded shadow-md text-xs">
      <div className="flex items-center mb-1">
        <div className="w-3 h-3 bg-anchor rounded-sm mr-2"></div>
        <span>Anchor</span>
      </div>
      <div className="flex flex-col gap-1 mt-1">
        <span className="text-xs font-medium">Sensors:</span>
        <div className="grid grid-cols-2 gap-x-2 gap-y-1">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((index) => (
            <div key={index} className="flex items-center">
              <div 
                className="w-3 h-3 rounded-full mr-1"
                style={{ backgroundColor: getSensorColor(index) }}
              ></div>
              <span className="text-xs">Sensor {index}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MapLegend;
