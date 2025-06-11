
"use client";
import React from 'react';
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { WorkState } from '@/app/page';
import { useIsMobile } from '@/hooks/use-mobile';
import { Home, Briefcase, Palmtree, XCircle, Edit3 } from 'lucide-react';

interface CalendarDayProps {
  day: number;
  isToday: boolean;
  isWeekend: boolean;
  isHoliday: boolean;
  workState?: WorkState;
  onSetWorkState: (day: number, state?: WorkState) => void;
}

const CalendarDay: React.FC<CalendarDayProps> = ({
  day,
  isToday,
  isWeekend,
  isHoliday,
  workState,
  onSetWorkState,
}) => {
  const isMobile = useIsMobile();

  let cellBg = 'bg-card hover:bg-muted/20';
  let statusText = ''; // For the bottom badge
  let statusBg = '';   // For the bottom badge
  let textColor = 'text-foreground';

  if (isHoliday) {
    cellBg = 'bg-destructive/10';
    statusText = 'Feriado';
    statusBg = 'bg-destructive text-destructive-foreground';
    textColor = isMobile ? 'text-destructive' : 'text-destructive-foreground';
  } else if (isWeekend) {
    cellBg = 'bg-muted/30';
    textColor = 'text-muted-foreground';
    statusText = isMobile ? 'FDS' : 'Fim de Semana'; // Abreviado para mobile
    statusBg = 'bg-muted text-muted-foreground';
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

  const renderWorkStateIcon = (state?: WorkState, className?: string) => {
    if (state === 'ferias') return <Palmtree className={cn("w-3 h-3 sm:w-4 sm:h-4", className)} />;
    if (state === 'casa') return <Home className={cn("w-3 h-3 sm:w-4 sm:h-4", className)} />;
    if (state === 'escritorio') return <Briefcase className={cn("w-3 h-3 sm:w-4 sm:h-4", className)} />;
    return <Edit3 className={cn("w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground", className)} />;
  };

  return (
    <div
      className={cn(
        "calendar-cell border rounded-lg p-1.5 sm:p-2 transition-colors duration-150 flex flex-col justify-between",
        cellBg,
        isToday ? 'border-2 border-primary shadow-md' : 'border-border'
      )}
    >
      <div className={cn("font-medium text-xs sm:text-sm self-start", textColor, isToday ? "text-primary font-bold" : "")}>{day}</div>
      
      {!isWeekend && !isHoliday && (
        <div className="mt-1">
          {isMobile ? (
            <Select
              value={workState || 'none'}
              onValueChange={(value) => {
                onSetWorkState(day, value === 'none' ? undefined : value as WorkState);
              }}
            >
              <SelectTrigger className="w-full h-8 p-1 text-xs justify-center">
                <SelectValue placeholder="Definir">
                  <div className="flex items-center justify-center">
                    {renderWorkStateIcon(workState)}
                  </div>
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none" className="text-xs py-1">
                  <XCircle className="w-3 h-3 mr-1.5" /> Nenhum
                </SelectItem>
                <SelectItem value="ferias" className="text-xs py-1">
                  <Palmtree className="w-3 h-3 mr-1.5" /> Férias
                </SelectItem>
                <SelectItem value="casa" className="text-xs py-1">
                  <Home className="w-3 h-3 mr-1.5" /> Casa
                </SelectItem>
                <SelectItem value="escritorio" className="text-xs py-1">
                  <Briefcase className="w-3 h-3 mr-1.5" /> Escritório
                </SelectItem>
              </SelectContent>
            </Select>
          ) : (
            <div className="space-y-1 sm:space-y-1.5 text-xs">
              <Label htmlFor={`ferias-${day}`} className={cn("flex items-center cursor-pointer text-[11px] sm:text-xs")}>
                <Checkbox
                  id={`ferias-${day}`}
                  checked={workState === 'ferias'}
                  onCheckedChange={(_checked) => onSetWorkState(day, workState === 'ferias' ? undefined : 'ferias')}
                  className="mr-1 sm:mr-1.5 size-3.5 sm:size-4"
                />
                🏖️ Férias
              </Label>
              <Label htmlFor={`casa-${day}`} className={cn("flex items-center cursor-pointer text-[11px] sm:text-xs")}>
                <Checkbox
                  id={`casa-${day}`}
                  checked={workState === 'casa'}
                  onCheckedChange={(_checked) => onSetWorkState(day, workState === 'casa' ? undefined : 'casa')}
                  disabled={workState === 'ferias'}
                  className="mr-1 sm:mr-1.5 size-3.5 sm:size-4"
                />
                🏠 Casa
              </Label>
              <Label htmlFor={`escritorio-${day}`} className={cn("flex items-center cursor-pointer text-[11px] sm:text-xs")}>
                <Checkbox
                  id={`escritorio-${day}`}
                  checked={workState === 'escritorio'}
                  onCheckedChange={(_checked) => onSetWorkState(day, workState === 'escritorio' ? undefined : 'escritorio')}
                  disabled={workState === 'ferias'}
                  className="mr-1 sm:mr-1.5 size-3.5 sm:size-4"
                />
                🏢 Escritório
              </Label>
            </div>
          )}
        </div>
      )}
      {statusText && (isWeekend || isHoliday || (!isMobile && workState) ) && (
         <div className={cn(
            "mt-1.5 px-1 py-0.5 sm:px-2 rounded text-[9px] sm:text-[10px] text-center font-medium",
             statusBg,
             isHoliday && isMobile ? "text-destructive-foreground" : "" // ensure holiday text is visible on mobile
           )}
          >
           {statusText}
         </div>
      )}
       {/* Placeholder for mobile to maintain height consistency if no status badge is shown */}
       {isMobile && !isWeekend && !isHoliday && !statusText && <div className="h-[19px] mt-1.5"></div>}

    </div>
  );
};

export default CalendarDay;
