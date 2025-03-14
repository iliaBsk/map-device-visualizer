
import React, { useEffect, useRef, useState } from "react";
import { Device, HistoricalPosition } from "@/types/devices";
import { cn } from "@/lib/utils";
import FloorMap from "./map/FloorMap";
import RealTimeDevices from "./map/RealTimeDevices";
import HistoricalDevices from "./map/HistoricalDevices";
import MapLegend from "./map/MapLegend";

interface DeviceMapProps {
  devices: Device[];
  historicalPositions?: HistoricalPosition[];
  isRealTime: boolean;
  className?: string;
}

const DeviceMap: React.FC<DeviceMapProps> = ({
  devices,
  historicalPositions = [],
  isRealTime,
  className,
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [mapDimensions, setMapDimensions] = useState({ width: 0, height: 0 });
  const [scale, setScale] = useState(1);

  // Calculate the map dimensions on mount and window resize
  useEffect(() => {
    const updateDimensions = () => {
      if (mapRef.current) {
        const { clientWidth, clientHeight } = mapRef.current;
        setMapDimensions({ width: clientWidth, height: clientHeight });
        
        // Calculate scale based on the original map dimensions vs container size
        // Assuming original map dimensions are around 1200 x 800
        const originalWidth = 1200;
        setScale(clientWidth / originalWidth);
      }
    };

    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  return (
    <div 
      ref={mapRef} 
      className={cn(
        "relative overflow-hidden border rounded-lg bg-black/5", 
        className
      )}
    >
      {/* Floor map image */}
      <FloorMap />
      
      {/* Real-time devices */}
      {isRealTime && <RealTimeDevices devices={devices} scale={scale} />}
      
      {/* Historical positions */}
      {!isRealTime && historicalPositions && historicalPositions.length > 0 && (
        <HistoricalDevices 
          devices={devices} 
          historicalPositions={historicalPositions}
          scale={scale}
        />
      )}
      
      {/* Map legend */}
      <MapLegend />
    </div>
  );
};

export default DeviceMap;
