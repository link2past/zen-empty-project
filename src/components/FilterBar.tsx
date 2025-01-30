import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface FilterBarProps {
  category: string;
  sortOrder: "asc" | "desc";
  dateRange: {
    start: string;
    end: string;
  };
  onCategoryChange: (value: string) => void;
  onSortChange: (value: "asc" | "desc") => void;
  onDateRangeChange: (range: { start: string; end: string }) => void;
  onClear: () => void;
  selectedDateFilter: string;
  onDateFilterChange: (value: string) => void;
}

export function FilterBar({
  category,
  sortOrder,
  dateRange,
  onCategoryChange,
  onSortChange,
  onDateRangeChange,
  onClear,
  selectedDateFilter,
  onDateFilterChange,
}: FilterBarProps) {
  return (
    <div className="flex items-center gap-4 flex-wrap">
      <Select value={category} onValueChange={onCategoryChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Category" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Categories</SelectItem>
          <SelectItem value="feature">Feature</SelectItem>
          <SelectItem value="bugfix">Bug Fix</SelectItem>
          <SelectItem value="enhancement">Enhancement</SelectItem>
          <SelectItem value="custom">Custom Category</SelectItem>
        </SelectContent>
      </Select>

      <Select value={sortOrder} onValueChange={onSortChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Sort by date" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="desc">Newest first</SelectItem>
          <SelectItem value="asc">Oldest first</SelectItem>
        </SelectContent>
      </Select>

      <Select value={selectedDateFilter} onValueChange={onDateFilterChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Date filter" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Time</SelectItem>
          <SelectItem value="today">Today</SelectItem>
          <SelectItem value="currentMonth">Current Month</SelectItem>
          <SelectItem value="lastMonth">Last Month</SelectItem>
          <SelectItem value="custom">Custom Range</SelectItem>
        </SelectContent>
      </Select>

      {selectedDateFilter === "custom" && (
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-[180px] justify-start text-left font-normal",
                !dateRange && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dateRange?.start ? (
                format(new Date(dateRange.start), "MMM d, yyyy")
              ) : (
                <span>Pick a date range</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={dateRange?.start ? new Date(dateRange.start) : new Date()}
              selected={{
                from: dateRange?.start ? new Date(dateRange.start) : undefined,
                to: dateRange?.end ? new Date(dateRange.end) : undefined,
              }}
              onSelect={(range) => {
                if (range?.from && range?.to) {
                  onDateRangeChange({
                    start: range.from.toISOString(),
                    end: range.to.toISOString(),
                  });
                }
              }}
              numberOfMonths={2}
              className="dark:bg-background dark:text-foreground dark:border-border"
            />
          </PopoverContent>
        </Popover>
      )}

      <Button variant="outline" onClick={onClear}>
        Clear filters
      </Button>
    </div>
  );
}