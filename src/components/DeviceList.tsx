
import React, { useState } from "react";
import { Device } from "@/types/devices";
import { Button } from "@/components/ui/button";
import { Search, Circle, Square } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";

interface DeviceListProps {
  devices: Device[];
  onDeviceSelected?: (deviceId: string) => void;
}

const DeviceList: React.FC<DeviceListProps> = ({ 
  devices, 
  onDeviceSelected 
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<"all" | "anchor" | "sensor">("all");

  const filteredDevices = devices.filter((device) => {
    const matchesSearch = device.mac.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "all" || device.type === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      <div className="flex flex-col sm:flex-row gap-3 p-4 border-b">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by MAC address..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex gap-2">
          <Button
            variant={filterType === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterType("all")}
          >
            All
          </Button>
          <Button
            variant={filterType === "anchor" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterType("anchor")}
            className="flex items-center"
          >
            <Square className="mr-1 h-3 w-3" />
            Anchors
          </Button>
          <Button
            variant={filterType === "sensor" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterType("sensor")}
            className="flex items-center"
          >
            <Circle className="mr-1 h-3 w-3" />
            Sensors
          </Button>
        </div>
      </div>

      <div className="max-h-[300px] overflow-y-auto">
        <Table>
          <TableHeader className="sticky top-0 bg-muted/50 backdrop-blur-sm">
            <TableRow>
              <TableHead>Type</TableHead>
              <TableHead>MAC Address</TableHead>
              <TableHead>Last Seen</TableHead>
              <TableHead className="w-[100px]">Position</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredDevices.length > 0 ? (
              filteredDevices.map((device) => (
                <TableRow 
                  key={device.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => onDeviceSelected?.(device.id)}
                >
                  <TableCell>
                    <div className="flex items-center">
                      {device.type === "anchor" ? (
                        <div className="w-4 h-4 bg-anchor rounded-sm mr-2" />
                      ) : (
                        <div className={`w-4 h-4 rounded-full bg-sensor-${device.colorIndex} mr-2`} />
                      )}
                      <span className="capitalize">{device.type}</span>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono">{device.mac}</TableCell>
                  <TableCell>
                    {format(new Date(device.lastSeen), "yyyy-MM-dd HH:mm:ss")}
                  </TableCell>
                  <TableCell>
                    ({device.x}, {device.y})
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-4">
                  No devices found matching the filters
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default DeviceList;
