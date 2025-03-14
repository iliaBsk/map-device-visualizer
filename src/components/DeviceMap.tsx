
import React, { useEffect, useRef, useState } from "react";
import { Device, HistoricalPosition } from "@/types/devices";
import { cn } from "@/lib/utils";

interface DeviceMapProps {
  devices: Device[];
  historicalPositions?: HistoricalPosition[];
  isRealTime: boolean;
  className?: string;
}

const DeviceMap: React.FC<DeviceMapProps> = ({
  devices,
  historicalPositions,
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

  // Get unique device IDs from historical positions
  const historicalDeviceIds = historicalPositions 
    ? [...new Set(historicalPositions.map(pos => pos.deviceId))]
    : [];

  // Group historical positions by device ID
  const positionsByDevice = historicalPositions
    ? historicalDeviceIds.reduce((acc, deviceId) => {
        acc[deviceId] = historicalPositions.filter(pos => pos.deviceId === deviceId);
        return acc;
      }, {} as Record<string, HistoricalPosition[]>)
    : {};

  return (
    <div 
      ref={mapRef} 
      className={cn(
        "relative overflow-hidden border rounded-lg bg-black/5", 
        className
      )}
    >
      {/* Floor map image */}
      <img 
        src="/lovable-uploads/4fec12a9-ca6b-4102-bb62-c030e247f1e0.png" 
        alt="Floor Map" 
        className="w-full h-auto"
        style={{ opacity: 0.9 }}
      />
      
      {/* Real-time devices */}
      {isRealTime && devices.map((device) => (
        <div
          key={device.id}
          style={{
            position: "absolute",
            left: `${device.x * scale}px`,
            top: `${device.y * scale}px`,
            transform: "translate(-50%, -50%)",
            width: device.type === "anchor" ? "20px" : "16px",
            height: device.type === "anchor" ? "20px" : "16px",
            backgroundColor: device.type === "anchor" 
              ? "rgb(30, 174, 219)" 
              : `var(--tw-color-sensor-${device.colorIndex})`,
            borderRadius: device.type === "anchor" ? "2px" : "50%",
            border: "2px solid white",
            boxShadow: "0 0 0 1px rgba(0,0,0,0.1), 0 2px 4px rgba(0,0,0,0.2)",
            zIndex: 10,
            transition: "left 0.5s, top 0.5s",
          }}
          className={isRealTime ? "animate-pulse-soft" : ""}
        />
      ))}
      
      {/* Historical positions - draw paths */}
      {!isRealTime && historicalDeviceIds.map((deviceId) => {
        const device = devices.find(d => d.id === deviceId);
        if (!device || !positionsByDevice[deviceId]) return null;
        
        const positions = positionsByDevice[deviceId];
        
        // Sort positions by timestamp
        const sortedPositions = [...positions].sort(
          (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        );
        
        // Get positions for path
        const pathPoints = sortedPositions.map(
          pos => `${pos.x * scale},${pos.y * scale}`
        ).join(" ");
        
        return (
          <React.Fragment key={deviceId}>
            {/* Path line */}
            <svg 
              className="absolute top-0 left-0 w-full h-full pointer-events-none"
              style={{ zIndex: 5 }}
            >
              <polyline
                points={pathPoints}
                fill="none"
                stroke={device.type === "anchor" 
                  ? "rgb(30, 174, 219)" 
                  : `var(--tw-color-sensor-${device.colorIndex})`}
                strokeWidth="2"
                strokeOpacity="0.6"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray="5,5"
              />
            </svg>
            
            {/* Dot for each position */}
            {sortedPositions.map((pos, index) => (
              <div
                key={`${deviceId}-${index}`}
                style={{
                  position: "absolute",
                  left: `${pos.x * scale}px`,
                  top: `${pos.y * scale}px`,
                  transform: "translate(-50%, -50%)",
                  width: index === sortedPositions.length - 1 ? "12px" : "8px",
                  height: index === sortedPositions.length - 1 ? "12px" : "8px",
                  backgroundColor: device.type === "anchor" 
                    ? "rgb(30, 174, 219)" 
                    : `var(--tw-color-sensor-${device.colorIndex})`,
                  borderRadius: device.type === "anchor" ? "2px" : "50%",
                  border: index === sortedPositions.length - 1 ? "2px solid white" : "none",
                  opacity: 0.7,
                  zIndex: 6,
                }}
              />
            ))}
          </React.Fragment>
        );
      })}
      
      {/* Map overlay with legend */}
      <div className="absolute bottom-4 right-4 bg-white/80 p-2 rounded shadow-md text-xs">
        <div className="flex items-center mb-1">
          <div className="w-3 h-3 bg-anchor rounded-sm mr-2"></div>
          <span>Anchor</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-sensor-1 mr-2"></div>
          <span>Sensor</span>
        </div>
      </div>
    </div>
  );
};

export default DeviceMap;
