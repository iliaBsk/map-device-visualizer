
import React from "react";
import { Device } from "@/types/devices";
import { getSensorColor } from "./utils";

interface RealTimeDevicesProps {
  devices: Device[];
  scale: number;
}

const RealTimeDevices: React.FC<RealTimeDevicesProps> = ({ devices, scale }) => {
  return (
    <>
      {devices.map((device) => (
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
          className="animate-pulse-soft"
        />
      ))}
    </>
  );
};

export default RealTimeDevices;
