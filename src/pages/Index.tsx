
import React, { useEffect, useState } from "react";
import DeviceMap from "@/components/DeviceMap";
import TimeSelector from "@/components/TimeSelector";
import DeviceList from "@/components/DeviceList";
import { Device, HistoricalPosition, TimeRange } from "@/types/devices";
import { getDevices, getHistoricalPositions } from "@/services/deviceService";
import { toast } from "sonner";

const Index = () => {
  const [devices, setDevices] = useState<Device[]>([]);
  const [isRealTime, setIsRealTime] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [historicalPositions, setHistoricalPositions] = useState<HistoricalPosition[]>([]);
  
  // Initialize time range to today
  const [timeRange, setTimeRange] = useState<TimeRange>(() => {
    const now = new Date();
    const start = new Date(now);
    start.setHours(0, 0, 0, 0);
    
    return {
      startTime: start,
      endTime: now,
    };
  });

  // Fetch devices on initial load
  useEffect(() => {
    const fetchInitialDevices = async () => {
      try {
        setIsLoading(true);
        const data = await getDevices();
        setDevices(data);
        toast.success("Devices loaded successfully");
      } catch (error) {
        console.error("Error fetching devices:", error);
        toast.error("Failed to load devices");
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialDevices();
  }, []);

  // Fetch historical positions when time range changes or mode changes to historical
  useEffect(() => {
    if (!isRealTime) {
      const fetchHistoricalPositions = async () => {
        try {
          setIsLoading(true);
          const positions = await getHistoricalPositions(
            timeRange.startTime,
            timeRange.endTime
          );
          setHistoricalPositions(positions);
        } catch (error) {
          console.error("Error fetching historical positions:", error);
          toast.error("Failed to load historical data");
        } finally {
          setIsLoading(false);
        }
      };

      fetchHistoricalPositions();
    }
  }, [isRealTime, timeRange]);

  // Poll for real-time updates
  useEffect(() => {
    if (!isRealTime) return;

    const intervalId = setInterval(async () => {
      try {
        const updatedDevices = await getDevices();
        setDevices(updatedDevices);
      } catch (error) {
        console.error("Error updating device positions:", error);
      }
    }, 2000); // Update every 2 seconds

    return () => clearInterval(intervalId);
  }, [isRealTime]);

  // Handle time range changes
  const handleTimeRangeChange = (range: TimeRange) => {
    setTimeRange(range);
  };

  // Handle view mode changes
  const handleViewModeChange = (realTime: boolean) => {
    setIsRealTime(realTime);
    if (realTime) {
      // Clear historical positions when switching to real-time
      setHistoricalPositions([]);
    }
  };

  // Handle device selection
  const handleDeviceSelected = (deviceId: string) => {
    // Highlight the device or show details
    toast.info(`Selected device: ${deviceId}`);
  };

  return (
    <div className="flex flex-col h-screen max-w-[1920px] mx-auto px-4 py-2">
      {/* Header with title */}
      <header className="mb-4">
        <h1 className="text-2xl font-bold">Device Location Visualizer</h1>
      </header>

      {/* Time selector */}
      <div className="mb-4">
        <TimeSelector
          isRealTime={isRealTime}
          timeRange={timeRange}
          onTimeRangeChange={handleTimeRangeChange}
          onViewModeChange={handleViewModeChange}
        />
      </div>

      {/* Main content area with map and device list */}
      <div className="flex flex-col md:flex-row gap-4 flex-1 overflow-hidden">
        {/* Map container */}
        <div className="flex-1 min-h-[400px] md:min-h-0">
          {isLoading ? (
            <div className="h-full flex items-center justify-center bg-gray-100 rounded-lg">
              <div className="text-center">
                <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-2"></div>
                <p className="text-gray-500">Loading...</p>
              </div>
            </div>
          ) : (
            <DeviceMap
              devices={devices}
              historicalPositions={historicalPositions}
              isRealTime={isRealTime}
              className="h-full"
            />
          )}
        </div>
      </div>

      {/* Device list */}
      <div className="mt-4">
        <DeviceList 
          devices={devices} 
          onDeviceSelected={handleDeviceSelected}
        />
      </div>
    </div>
  );
};

export default Index;
