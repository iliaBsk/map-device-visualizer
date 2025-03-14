import { Device, HistoricalPosition } from "@/types/devices";

// Mock data
const mockDevices: Device[] = [
  { id: "1", mac: "AA:BB:CC:DD:EE:01", type: "anchor", x: 150, y: 200, lastSeen: new Date().toISOString(), colorIndex: 0 },
  { id: "2", mac: "AA:BB:CC:DD:EE:02", type: "anchor", x: 450, y: 150, lastSeen: new Date().toISOString(), colorIndex: 0 },
  { id: "3", mac: "AA:BB:CC:DD:EE:03", type: "anchor", x: 750, y: 300, lastSeen: new Date().toISOString(), colorIndex: 0 },
  { id: "4", mac: "AA:BB:CC:DD:EE:04", type: "sensor", x: 200, y: 250, lastSeen: new Date().toISOString(), colorIndex: 1 },
  { id: "5", mac: "AA:BB:CC:DD:EE:05", type: "sensor", x: 500, y: 400, lastSeen: new Date().toISOString(), colorIndex: 2 },
  { id: "6", mac: "AA:BB:CC:DD:EE:06", type: "sensor", x: 600, y: 200, lastSeen: new Date().toISOString(), colorIndex: 3 },
  { id: "7", mac: "AA:BB:CC:DD:EE:07", type: "sensor", x: 300, y: 350, lastSeen: new Date().toISOString(), colorIndex: 4 },
  { id: "8", mac: "AA:BB:CC:DD:EE:08", type: "sensor", x: 700, y: 250, lastSeen: new Date().toISOString(), colorIndex: 5 },
];

// Generate historical positions
const generateHistoricalPositions = (devices: Device[], days: number = 7): HistoricalPosition[] => {
  const positions: HistoricalPosition[] = [];
  const now = new Date();
  
  devices.forEach(device => {
    // Create historical data points for the last X days
    for (let i = 0; i < days; i++) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      
      // Create multiple entries per day with some variation
      for (let hour = 0; hour < 24; hour += 2) {
        date.setHours(hour);
        
        // Create some random movement within a radius of 50 pixels
        const xVariation = Math.floor(Math.random() * 100) - 50;
        const yVariation = Math.floor(Math.random() * 100) - 50;
        
        positions.push({
          deviceId: device.id,
          timestamp: date.toISOString(),
          x: Math.max(0, device.x + xVariation),
          y: Math.max(0, device.y + yVariation),
        });
      }
    }
  });
  
  return positions;
};

const mockHistoricalPositions = generateHistoricalPositions(mockDevices);

// Simulate real-time position updates with random movement
const updateDevicePositions = (devices: Device[]): Device[] => {
  return devices.map(device => {
    // Only move sensors, keep anchors fixed
    if (device.type === "sensor") {
      const xVariation = Math.floor(Math.random() * 20) - 10;
      const yVariation = Math.floor(Math.random() * 20) - 10;
      
      return {
        ...device,
        x: Math.max(0, device.x + xVariation),
        y: Math.max(0, device.y + yVariation),
        lastSeen: new Date().toISOString()
      };
    }
    return device;
  });
};

// Get all devices - simulates the Python get_devices function
export const getDevices = async (): Promise<Device[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));
  return updateDevicePositions([...mockDevices]);
};

// Get historical positions within a time range
export const getHistoricalPositions = async (startTime: Date, endTime: Date): Promise<HistoricalPosition[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return mockHistoricalPositions.filter(pos => {
    const timestamp = new Date(pos.timestamp);
    return timestamp >= startTime && timestamp <= endTime;
  });
};

// Get a device by ID
export const getDeviceById = async (id: string): Promise<Device | undefined> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 200));
  return mockDevices.find(d => d.id === id);
};
