import React from "react";
import { format } from "date-fns";
import { CalendarIcon, Clock, History, Play } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { TimeRange } from "@/types/devices";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface TimeSelectorProps {
  isRealTime: boolean;
  timeRange: TimeRange;
  onTimeRangeChange: (range: TimeRange) => void;
  onViewModeChange: (isRealTime: boolean) => void;
}

const TimeSelector: React.FC<TimeSelectorProps> = ({
  isRealTime,
  timeRange,
  onTimeRangeChange,
  onViewModeChange,
}) => {
  const handleStartDateChange = (date: Date | undefined) => {
    if (date) {
      // Keep the time portion from the existing startTime
      const newDate = new Date(date);
      newDate.setHours(timeRange.startTime.getHours());
      newDate.setMinutes(timeRange.startTime.getMinutes());
      
      onTimeRangeChange({
        startTime: newDate,
        endTime: timeRange.endTime,
      });
    }
  };

  const handleEndDateChange = (date: Date | undefined) => {
    if (date) {
      // Keep the time portion from the existing endTime
      const newDate = new Date(date);
      newDate.setHours(timeRange.endTime.getHours());
      newDate.setMinutes(timeRange.endTime.getMinutes());
      
      onTimeRangeChange({
        startTime: timeRange.startTime,
        endTime: newDate,
      });
    }
  };

  const handleStartTimeChange = (value: string) => {
    const [hours, minutes] = value.split(":").map(Number);
    const newStartTime = new Date(timeRange.startTime);
    newStartTime.setHours(hours);
    newStartTime.setMinutes(minutes);
    
    onTimeRangeChange({
      startTime: newStartTime,
      endTime: timeRange.endTime,
    });
  };

  const handleEndTimeChange = (value: string) => {
    const [hours, minutes] = value.split(":").map(Number);
    const newEndTime = new Date(timeRange.endTime);
    newEndTime.setHours(hours);
    newEndTime.setMinutes(minutes);
    
    onTimeRangeChange({
      startTime: timeRange.startTime,
      endTime: newEndTime,
    });
  };

  // Generate time options in 30-minute increments
  const timeOptions = Array.from({ length: 48 }, (_, i) => {
    const hours = Math.floor(i / 2);
    const minutes = (i % 2) * 30;
    return {
      value: `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`,
      label: `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`,
    };
  });

  return (
    <div className="flex flex-col md:flex-row items-center gap-4 p-4 bg-white rounded-lg shadow-sm border">
      <div className="flex gap-4 w-full md:w-auto">
        <Button
          variant={isRealTime ? "default" : "outline"}
          onClick={() => onViewModeChange(true)}
          className="flex-1 md:flex-none"
        >
          <Play className="mr-2 h-4 w-4" />
          Real-Time
        </Button>
        <Button
          variant={!isRealTime ? "default" : "outline"}
          onClick={() => onViewModeChange(false)}
          className="flex-1 md:flex-none"
        >
          <History className="mr-2 h-4 w-4" />
          Historical
        </Button>
      </div>

      {!isRealTime && (
        <div className="flex flex-col sm:flex-row gap-4 w-full">
          <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center flex-1">
            <span className="text-sm font-medium whitespace-nowrap">Start:</span>
            <div className="flex gap-2 w-full sm:w-auto">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "justify-start text-left w-full sm:w-[144px]",
                      !timeRange.startTime && "text-muted-foreground"
                    )}
                    disabled={isRealTime}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {timeRange.startTime ? (
                      format(timeRange.startTime, "yyyy-MM-dd")
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={timeRange.startTime}
                    onSelect={handleStartDateChange}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>

              <Select
                value={`${timeRange.startTime.getHours().toString().padStart(2, "0")}:${timeRange.startTime.getMinutes().toString().padStart(2, "0")}`}
                onValueChange={handleStartTimeChange}
                disabled={isRealTime}
              >
                <SelectTrigger className="w-full sm:w-[100px]">
                  <Clock className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Time" />
                </SelectTrigger>
                <SelectContent>
                  {timeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center flex-1">
            <span className="text-sm font-medium whitespace-nowrap">End:</span>
            <div className="flex gap-2 w-full sm:w-auto">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "justify-start text-left w-full sm:w-[144px]",
                      !timeRange.endTime && "text-muted-foreground"
                    )}
                    disabled={isRealTime}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {timeRange.endTime ? (
                      format(timeRange.endTime, "yyyy-MM-dd")
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={timeRange.endTime}
                    onSelect={handleEndDateChange}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>

              <Select
                value={`${timeRange.endTime.getHours().toString().padStart(2, "0")}:${timeRange.endTime.getMinutes().toString().padStart(2, "0")}`}
                onValueChange={handleEndTimeChange}
                disabled={isRealTime}
              >
                <SelectTrigger className="w-full sm:w-[100px]">
                  <Clock className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Time" />
                </SelectTrigger>
                <SelectContent>
                  {timeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TimeSelector;
