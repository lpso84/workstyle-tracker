
"use client";
import React from 'react';
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type { WorkState } from '@/app/page';

interface CalendarDayProps {
  day: number;
  isToday: boolean;
  isWeekend: boolean;
  isHoliday: boolean;
  workState?: WorkState;
  onCheckboxChange: (day: number, type: WorkState) => void;
}

const CalendarDay: React.FC<CalendarDayProps> = ({
  day,
  isToday,
  isWeekend,
  isHoliday,
  workState,
  onCheckboxChange,
}) => {
  let cellBg = 'bg-card hover:bg-muted/20';
  let statusText = '';
  let statusBg = '';
  let textColor = 'text-foreground';

  if (isHoliday) {
    cellBg = 'bg-destructive/10';
    statusText = 'Feriado';
    statusBg = 'bg-destructive text-destructive-foreground';
    textColor = 'text-destructive-foreground';
  } else if (isWeekend) {
    cellBg = 'bg-muted/30';
    textColor = 'text-muted-foreground';
  } else if (workState === 'casa') {
    cellBg = 'bg-green-500/10 hover:bg-green-500/20';
    statusText = 'Casa';
    statusBg = 'bg-green-500 text-white';
    textColor = 'text-green-700 dark:text-green-400';
  } else if (workState === 'escritorio') {
    cellBg = 'bg-blue-500/10 hover:bg-blue-500/20';
    statusText = 'Escritório';
    statusBg = 'bg-blue-500 text-white';
    textColor = 'text-blue-700 dark:text-blue-400';
  } else if (workState === 'ferias') {
    cellBg = 'bg-yellow-500/10 hover:bg-yellow-500/20';
    statusText = 'Férias';
    statusBg = 'bg-yellow-500 text-white';
    textColor = 'text-yellow-700 dark:text-yellow-400';
  }

  const handleCheckedChange = (type: WorkState) => (checked: boolean | 'indeterminate') => {
     onCheckboxChange(day, type);
  };


  return (
    <div
      className={cn(
        "calendar-cell border rounded-lg p-1.5 sm:p-2 transition-colors duration-150",
        cellBg,
        isToday ? 'border-2 border-primary shadow-md' : 'border-border'
      )}
    >
      <div className={cn("font-medium text-xs sm:text-sm mb-1 self-start", textColor, isToday ? "text-primary font-bold" : "")}>{day}</div>
      
      {!isWeekend && !isHoliday && (
        <div className="space-y-1 sm:space-y-1.5 text-xs mt-auto">
          <Label htmlFor={`ferias-${day}`} className={cn("flex items-center cursor-pointer text-[11px] sm:text-xs")}>
            <Checkbox
              id={`ferias-${day}`}
              checked={workState === 'ferias'}
              onCheckedChange={() => handleCheckedChange('ferias')(workState !== 'ferias')}
              className="mr-1 sm:mr-1.5 size-3.5 sm:size-4"
            />
            🏖️ Férias
          </Label>
          <Label htmlFor={`casa-${day}`} className={cn("flex items-center cursor-pointer text-[11px] sm:text-xs", workState === 'ferias' ? "cursor-not-allowed opacity-50" : "")}>
            <Checkbox
              id={`casa-${day}`}
              checked={workState === 'casa'}
              onCheckedChange={() => handleCheckedChange('casa')(workState !== 'casa')}
              disabled={workState === 'ferias'}
              className="mr-1 sm:mr-1.5 size-3.5 sm:size-4"
            />
            🏠 Casa
          </Label>
          <Label htmlFor={`escritorio-${day}`} className={cn("flex items-center cursor-pointer text-[11px] sm:text-xs", workState === 'ferias' ? "cursor-not-allowed opacity-50" : "")}>
            <Checkbox
              id={`escritorio-${day}`}
              checked={workState === 'escritorio'}
              onCheckedChange={() => handleCheckedChange('escritorio')(workState !== 'escritorio')}
              disabled={workState === 'ferias'}
              className="mr-1 sm:mr-1.5 size-3.5 sm:size-4"
            />
            🏢 Escritório
          </Label>
        </div>
      )}
      {statusText && (isWeekend || isHoliday || workState) && (
         <div className={cn("mt-1.5 px-1.5 sm:px-2 py-0.5 rounded text-[9px] sm:text-[10px] text-center font-medium", statusBg)}>
           {statusText}
         </div>
      )}
    </div>
  );
};

export default CalendarDay;
