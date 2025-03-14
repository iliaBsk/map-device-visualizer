import { Device, HistoricalPosition } from "@/types/devices";

// Backend API URL (configurable)
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// Get all devices
export const getDevices = async (): Promise<Device[]> => {
  try {
    console.log("Attempting to fetch devices from main API:", `${API_URL}/devices`);
    // First try to fetch from real backend
    const response = await fetch(`${API_URL}/devices`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      // Add a timeout to prevent long hanging requests
      signal: AbortSignal.timeout(5000),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch devices: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.warn("Error fetching from main API, falling back to mock API:", error);
    
    // Fall back to mock API if the main one fails
    try {
      console.log("Attempting to fetch mock devices:", `${API_URL}/mock-devices`);
      const mockResponse = await fetch(`${API_URL}/mock-devices`, {
        // Add a timeout to prevent long hanging requests
        signal: AbortSignal.timeout(3000),
      });
      
      if (!mockResponse.ok) {
        throw new Error(`Failed to fetch mock devices: ${mockResponse.statusText}`);
      }
      
      return await mockResponse.json();
    } catch (mockError) {
      console.error("Both main and mock APIs failed:", mockError);
      console.log("Falling back to static mock data");
      // Fall back to static mock data if both APIs fail
      return getMockDevices();
    }
  }
};

// Get historical positions within a time range
export const getHistoricalPositions = async (startTime: Date, endTime: Date): Promise<HistoricalPosition[]> => {
  try {
    const startTimeISO = startTime.toISOString();
    const endTimeISO = endTime.toISOString();
    
    console.log(`Fetching historical positions from ${startTimeISO} to ${endTimeISO}`);
    
    const response = await fetch(
      `${API_URL}/historical-positions?startTime=${startTimeISO}&endTime=${endTimeISO}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        // Add a timeout to prevent long hanging requests
        signal: AbortSignal.timeout(5000),
      }
    );
    
    if (!response.ok) {
      throw new Error(`Failed to fetch historical positions: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error fetching historical positions:", error);
    console.log("Falling back to generated mock historical data");
    // Fall back to generated mock data
    return getMockHistoricalPositions(startTime, endTime);
  }
};

// Get a device by ID
export const getDeviceById = async (id: string): Promise<Device | undefined> => {
  const devices = await getDevices();
  return devices.find(d => d.id === id);
};

// ------------------------
// Mock data for fallback
// ------------------------

// Mock devices for fallback
const getMockDevices = (): Device[] => {
  console.log("Generating static mock device data");
  return [
    { id: "1", mac: "AA:BB:CC:DD:EE:01", type: "anchor", x: 150, y: 200, lastSeen: new Date().toISOString(), colorIndex: 0 },
    { id: "2", mac: "AA:BB:CC:DD:EE:02", type: "anchor", x: 450, y: 150, lastSeen: new Date().toISOString(), colorIndex: 0 },
    { id: "3", mac: "AA:BB:CC:DD:EE:03", type: "anchor", x: 750, y: 300, lastSeen: new Date().toISOString(), colorIndex: 0 },
    { id: "4", mac: "AA:BB:CC:DD:EE:04", type: "sensor", x: 200, y: 250, lastSeen: new Date().toISOString(), colorIndex: 1 },
    { id: "5", mac: "AA:BB:CC:DD:EE:05", type: "sensor", x: 500, y: 400, lastSeen: new Date().toISOString(), colorIndex: 2 },
    { id: "6", mac: "AA:BB:CC:DD:EE:06", type: "sensor", x: 600, y: 200, lastSeen: new Date().toISOString(), colorIndex: 3 },
    { id: "7", mac: "AA:BB:CC:DD:EE:07", type: "sensor", x: 300, y: 350, lastSeen: new Date().toISOString(), colorIndex: 4 },
    { id: "8", mac: "AA:BB:CC:DD:EE:08", type: "sensor", x: 700, y: 250, lastSeen: new Date().toISOString(), colorIndex: 5 },
  ];
};

// Generate historical positions for fallback
const getMockHistoricalPositions = (startTime: Date, endTime: Date): HistoricalPosition[] => {
  const positions: HistoricalPosition[] = [];
  const devices = getMockDevices();
  const duration = endTime.getTime() - startTime.getTime();
  const stepCount = 12; // Number of data points to generate
  
  devices.forEach(device => {
    for (let i = 0; i <= stepCount; i++) {
      const timestamp = new Date(startTime.getTime() + (duration * i) / stepCount);
      
      // Create some random movement
      const xVariation = Math.floor(Math.random() * 100) - 50;
      const yVariation = Math.floor(Math.random() * 100) - 50;
      
      positions.push({
        deviceId: device.id,
        timestamp: timestamp.toISOString(),
        x: Math.max(0, device.x + xVariation),
        y: Math.max(0, device.y + yVariation),
      });
    }
  });
  
  return positions;
};
