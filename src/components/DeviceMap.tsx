
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

  // Get color for a sensor based on its colorIndex
  const getSensorColor = (colorIndex: number = 1) => {
    const colors = {
      1: 'rgb(139, 92, 246)', // sensor-1 (#8B5CF6)
      2: 'rgb(217, 70, 239)', // sensor-2 (#D946EF)
      3: 'rgb(249, 115, 22)', // sensor-3 (#F97316)
      4: 'rgb(6, 182, 212)',  // sensor-4 (#06B6D4)
      5: 'rgb(34, 197, 94)',  // sensor-5 (#22C55E)
      6: 'rgb(234, 179, 8)',  // sensor-6 (#EAB308)
      7: 'rgb(236, 72, 153)', // sensor-7 (#EC4899)
      8: 'rgb(20, 184, 166)', // sensor-8 (#14B8A6)
    };
    
    return colors[colorIndex as keyof typeof colors] || colors[1];
  };

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
              : getSensorColor(device.colorIndex),
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
                  : getSensorColor(device.colorIndex)}
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
                    : getSensorColor(device.colorIndex),
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
    </div>
  );
};

export default DeviceMap;
