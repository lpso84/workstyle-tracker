"use client";
import React from 'react';
import CalendarDay from './CalendarDay';
import type { WorkState, WorkStates } from '@/app/page'; // Assuming types are exported from page.tsx or a types file
import { Card } from '../ui/card';

interface CalendarGridProps {
  currentYear: number;
  currentMonth: number;
  daysInMonth: number;
  firstDayOfMonth: number;
  holidayDays: number[];
  workStates: WorkStates;
  onCheckboxChange: (day: number, type: WorkState) => void;
  isWeekend: (day: number) => boolean;
  today: number;
  actualMonth: number;
  actualYear: number;
  dayNames: string[];
}

const CalendarGrid: React.FC<CalendarGridProps> = ({
  currentYear,
  currentMonth,
  daysInMonth,
  firstDayOfMonth,
  holidayDays,
  workStates,
  onCheckboxChange,
  isWeekend,
  today,
  actualMonth,
  actualYear,
  dayNames,
}) => {
  const renderCalendarDays = () => {
    const cells = [];
    for (let i = 0; i < firstDayOfMonth; i++) {
      cells.push(<div key={`empty-${i}`} className="calendar-cell empty-cell" />);
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const isCurrentActualMonth = currentMonth === actualMonth && currentYear === actualYear;
      const isTodayMarker = isCurrentActualMonth && d === today;
      const dayIsWeekend = isWeekend(d);
      const dayIsHoliday = holidayDays.includes(d);
      const workState = workStates[d];
      const isDisabled = isCurrentActualMonth && d > today;

      cells.push(
        <CalendarDay
          key={d}
          day={d}
          isToday={isTodayMarker}
          isWeekend={dayIsWeekend}
          isHoliday={dayIsHoliday}
          workState={workState}
          onCheckboxChange={onCheckboxChange}
          isDisabled={isDisabled}
        />
      );
    }
    return cells;
  };

  return (
    <Card className="rounded-lg shadow-xl p-3 sm:p-4 mb-6">
      <div className="grid grid-cols-7 text-center text-xs sm:text-sm font-medium mb-2 text-muted-foreground">
        {dayNames.map(d => <div key={d} className="py-1">{d}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-1 sm:gap-2">
        {renderCalendarDays()}
      </div>
    </Card>
  );
};

export default CalendarGrid;
