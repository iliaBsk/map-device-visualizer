
import React from "react";
import { Device, HistoricalPosition } from "@/types/devices";
import { getSensorColor } from "./utils";

interface HistoricalDevicesProps {
  devices: Device[];
  historicalPositions: HistoricalPosition[];
  scale: number;
}

const HistoricalDevices: React.FC<HistoricalDevicesProps> = ({ 
  devices, 
  historicalPositions,
  scale 
}) => {
  // Get unique device IDs from historical positions
  const historicalDeviceIds = [...new Set(historicalPositions.map(pos => pos.deviceId))];

  // Group historical positions by device ID
  const positionsByDevice = historicalDeviceIds.reduce((acc, deviceId) => {
    acc[deviceId] = historicalPositions.filter(pos => pos.deviceId === deviceId);
    return acc;
  }, {} as Record<string, HistoricalPosition[]>);

  return (
    <>
      {historicalDeviceIds.map((deviceId) => {
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
    </>
  );
};

export default HistoricalDevices;
