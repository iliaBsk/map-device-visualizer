
import React from "react";

interface FloorMapProps {
  className?: string;
}

const FloorMap: React.FC<FloorMapProps> = ({ className }) => {
  return (
    <img 
      src="/lovable-uploads/4fec12a9-ca6b-4102-bb62-c030e247f1e0.png" 
      alt="Floor Map" 
      className={className || "w-full h-auto"}
      style={{ opacity: 0.9 }}
    />
  );
};

export default FloorMap;
