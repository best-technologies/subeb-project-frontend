"use client";

import React, { useState, useMemo } from "react";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, X } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface DatePickerProps {
  value?: string; // Format: "YYYY-MM-DD"
  onChange: (value: string) => void;
  min?: string; // Format: "YYYY-MM-DD"
  max?: string; // Format: "YYYY-MM-DD"
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const WEEK_DAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

function isValidDate(d: Date): boolean {
  return d instanceof Date && !isNaN(d.getTime());
}

function toStartOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

export function DatePicker({
  value,
  onChange,
  min,
  max,
  placeholder = "Select date...",
  disabled = false,
  className,
}: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Parse initial view date
  const parsedValue = useMemo(() => {
    if (!value) return null;
    const parts = value.split("-");
    if (parts.length !== 3) return null;
    const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
    return isValidDate(d) ? toStartOfDay(d) : null;
  }, [value]);

  const minDate = useMemo(() => {
    if (!min) return null;
    const parts = min.split("-");
    if (parts.length !== 3) return null;
    const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
    return isValidDate(d) ? toStartOfDay(d) : null;
  }, [min]);

  const maxDate = useMemo(() => {
    if (!max) return null;
    const parts = max.split("-");
    if (parts.length !== 3) return null;
    const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
    return isValidDate(d) ? toStartOfDay(d) : null;
  }, [max]);

  // View state for navigating calendar months
  const [viewDate, setViewDate] = useState<Date>(() => {
    if (parsedValue) return parsedValue;
    if (minDate) return minDate;
    return toStartOfDay(new Date());
  });

  // When value or min changes and popover opens, sync view date
  const handleOpenChange = (open: boolean) => {
    if (open) {
      if (parsedValue) {
        setViewDate(parsedValue);
      } else if (minDate && viewDate.getTime() < minDate.getTime()) {
        setViewDate(minDate);
      } else if (maxDate && viewDate.getTime() > maxDate.getTime()) {
        setViewDate(maxDate);
      }
    }
    setIsOpen(open);
  };

  const currentYear = viewDate.getFullYear();
  const currentMonth = viewDate.getMonth();

  // Generate years list based on min/max or around current view
  const availableYears = useMemo(() => {
    const startYear = minDate ? minDate.getFullYear() : currentYear - 5;
    const endYear = maxDate ? maxDate.getFullYear() : currentYear + 5;
    const years: number[] = [];
    for (let y = startYear; y <= endYear; y++) {
      years.push(y);
    }
    return years;
  }, [minDate, maxDate, currentYear]);

  // Navigate months
  const handlePrevMonth = () => {
    const prev = new Date(currentYear, currentMonth - 1, 1);
    if (minDate) {
      const endOfPrev = new Date(currentYear, currentMonth, 0);
      if (endOfPrev.getTime() < minDate.getTime()) return;
    }
    setViewDate(prev);
  };

  const handleNextMonth = () => {
    const next = new Date(currentYear, currentMonth + 1, 1);
    if (maxDate && next.getTime() > maxDate.getTime()) return;
    setViewDate(next);
  };

  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newYear = parseInt(e.target.value, 10);
    setViewDate(new Date(newYear, currentMonth, 1));
  };

  const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newMonth = parseInt(e.target.value, 10);
    setViewDate(new Date(currentYear, newMonth, 1));
  };

  // Calendar grid computation
  const daysGrid = useMemo(() => {
    const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate();

    const days: Array<{
      date: Date;
      dateString: string;
      isCurrentMonth: boolean;
      isSelected: boolean;
      isDisabled: boolean;
      isToday: boolean;
    }> = [];

    const now = new Date();
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(
      now.getDate()
    ).padStart(2, "0")}`;

    // Previous month filler days
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const d = new Date(currentYear, currentMonth - 1, daysInPrevMonth - i);
      const str = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
        d.getDate()
      ).padStart(2, "0")}`;
      days.push({
        date: d,
        dateString: str,
        isCurrentMonth: false,
        isSelected: value === str,
        isDisabled: true,
        isToday: str === todayStr,
      });
    }

    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
      const d = new Date(currentYear, currentMonth, day);
      const dayTime = d.getTime();
      const str = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(
        day
      ).padStart(2, "0")}`;

      const isBeforeMin = minDate ? dayTime < minDate.getTime() : false;
      const isAfterMax = maxDate ? dayTime > maxDate.getTime() : false;
      const isDisabled = isBeforeMin || isAfterMax;

      days.push({
        date: d,
        dateString: str,
        isCurrentMonth: true,
        isSelected: value === str,
        isDisabled,
        isToday: str === todayStr,
      });
    }

    // Next month filler days to complete grid (multiples of 7)
    const remaining = (7 - (days.length % 7)) % 7;
    for (let i = 1; i <= remaining; i++) {
      const d = new Date(currentYear, currentMonth + 1, i);
      const str = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
        d.getDate()
      ).padStart(2, "0")}`;
      days.push({
        date: d,
        dateString: str,
        isCurrentMonth: false,
        isSelected: value === str,
        isDisabled: true,
        isToday: str === todayStr,
      });
    }

    return days;
  }, [currentYear, currentMonth, value, minDate, maxDate]);

  const handleSelectDay = (dateString: string) => {
    onChange(dateString);
    setIsOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange("");
  };

  // Format label for button
  const displayLabel = useMemo(() => {
    if (!parsedValue) return null;
    const months = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
    ];
    return `${months[parsedValue.getMonth()]} ${parsedValue.getDate()}, ${parsedValue.getFullYear()}`;
  }, [parsedValue]);

  return (
    <Popover open={isOpen} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <button
          type="button"
          disabled={disabled}
          className={cn(
            "flex h-10 w-full items-center justify-between rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 transition-colors hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-brand-primary disabled:cursor-not-allowed disabled:bg-gray-100 disabled:opacity-60",
            !value && "text-gray-400",
            className
          )}
        >
          <div className="flex items-center gap-2 truncate">
            <CalendarIcon className="h-4 w-4 text-gray-500 shrink-0" />
            <span className="truncate">{displayLabel || placeholder}</span>
          </div>
          {value && !disabled && (
            <span
              onClick={handleClear}
              className="p-0.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors ml-1"
              title="Clear date"
            >
              <X className="h-3.5 w-3.5" />
            </span>
          )}
        </button>
      </PopoverTrigger>

      <PopoverContent
        align="start"
        className="w-[300px] p-3 bg-white rounded-xl shadow-xl border border-gray-200 z-50"
      >
        {/* Header: Month / Year Selectors & Navigation */}
        <div className="flex items-center justify-between gap-1 pb-3 mb-2 border-b border-gray-100">
          <button
            type="button"
            onClick={handlePrevMonth}
            className="p-1 rounded-md hover:bg-gray-100 text-gray-600 hover:text-gray-900 transition-colors disabled:opacity-30 disabled:pointer-events-none"
            aria-label="Previous month"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          <div className="flex items-center gap-1.5">
            <select
              value={currentMonth}
              onChange={handleMonthChange}
              className="text-xs font-semibold bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-md px-2 py-1 text-gray-800 cursor-pointer focus:outline-none focus:ring-1 focus:ring-brand-primary"
            >
              {MONTH_NAMES.map((name, idx) => (
                <option key={name} value={idx}>
                  {name}
                </option>
              ))}
            </select>

            <select
              value={currentYear}
              onChange={handleYearChange}
              className="text-xs font-semibold bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-md px-2 py-1 text-gray-800 cursor-pointer focus:outline-none focus:ring-1 focus:ring-brand-primary"
            >
              {availableYears.map((yr) => (
                <option key={yr} value={yr}>
                  {yr}
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={handleNextMonth}
            className="p-1 rounded-md hover:bg-gray-100 text-gray-600 hover:text-gray-900 transition-colors disabled:opacity-30 disabled:pointer-events-none"
            aria-label="Next month"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        {/* Days of week header */}
        <div className="grid grid-cols-7 gap-1 text-center mb-1">
          {WEEK_DAYS.map((day) => (
            <span key={day} className="text-[11px] font-semibold text-gray-400 py-1">
              {day}
            </span>
          ))}
        </div>

        {/* Calendar days grid */}
        <div className="grid grid-cols-7 gap-1">
          {daysGrid.map((day, idx) => {
            if (!day.isCurrentMonth) {
              return (
                <div
                  key={idx}
                  className="h-8 flex items-center justify-center text-xs text-gray-300 pointer-events-none select-none"
                >
                  {day.date.getDate()}
                </div>
              );
            }

            return (
              <button
                key={idx}
                type="button"
                disabled={day.isDisabled}
                onClick={() => handleSelectDay(day.dateString)}
                className={cn(
                  "h-8 w-8 mx-auto flex items-center justify-center rounded-lg text-xs font-medium transition-all select-none",
                  day.isSelected
                    ? "bg-brand-primary text-white font-bold shadow-xs hover:bg-brand-primary/90"
                    : day.isDisabled
                    ? "text-gray-300 opacity-40 cursor-not-allowed hover:bg-transparent"
                    : "text-gray-700 hover:bg-emerald-50 hover:text-emerald-800",
                  day.isToday && !day.isSelected && "border border-brand-primary/40 font-semibold"
                )}
              >
                {day.date.getDate()}
              </button>
            );
          })}
        </div>

        {/* Footer info showing constraints */}
        {(min || max) && (
          <div className="mt-3 pt-2 border-t border-gray-100 text-[10px] text-gray-400 text-center">
            {min && max ? (
              <span>Allowed: {min} to {max}</span>
            ) : min ? (
              <span>Allowed from {min}</span>
            ) : (
              <span>Allowed until {max}</span>
            )}
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
