
"use client";
import React from 'react';
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { WorkState } from '@/app/page';
import { useIsMobile } from '@/hooks/use-mobile';
import { Home, Briefcase, Palmtree, XCircle, Edit3, PartyPopper } from 'lucide-react';

interface CalendarDayProps {
  day: number;
  isToday: boolean;
  isWeekend: boolean;
  workState?: WorkState;
  onSetWorkState: (day: number, state?: WorkState) => void;
}

const CalendarDay: React.FC<CalendarDayProps> = ({
  day,
  isToday,
  isWeekend,
  workState,
  onSetWorkState,
}) => {
  const isMobile = useIsMobile();
  const isActuallyHoliday = workState === 'feriado';

  let cellBg = 'bg-card hover:bg-muted/20';
  let statusText = '';
  let statusBg = '';
  let textColor = 'text-foreground';

  if (isWeekend) {
    cellBg = 'bg-muted/30';
    textColor = 'text-muted-foreground';
    statusText = isMobile ? 'FDS' : 'Fim de Semana';
    statusBg = 'bg-muted text-muted-foreground';
  } else if (isActuallyHoliday) {
    cellBg = 'bg-orange-500/10 hover:bg-orange-500/20';
    statusText = 'Feriado';
    statusBg = 'bg-orange-500 text-white';
    textColor = isMobile ? 'text-orange-700 dark:text-orange-400' : 'text-orange-700 dark:text-orange-400';
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
    if (state === 'feriado') return <PartyPopper className={cn("w-3 h-3 sm:w-4 sm:h-4", className)} />;
    if (state === 'ferias') return <Palmtree className={cn("w-3 h-3 sm:w-4 sm:h-4", className)} />;
    if (state === 'casa') return <Home className={cn("w-3 h-3 sm:w-4 sm:h-4", className)} />;
    if (state === 'escritorio') return <Briefcase className={cn("w-3 h-3 sm:w-4 sm:h-4", className)} />;
    return <Edit3 className={cn("w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground", className)} />;
  };

  const disableCasaEscritorio = isActuallyHoliday || workState === 'ferias';

  return (
    <div
      className={cn(
        "calendar-cell border rounded-lg p-1.5 sm:p-2 transition-colors duration-150 flex flex-col justify-between",
        cellBg,
        isToday ? 'border-2 border-primary shadow-md' : 'border-border'
      )}
    >
      <div className={cn("font-medium text-xs sm:text-sm self-start", textColor, isToday ? "text-primary font-bold" : "")}>{day}</div>

      {!isWeekend && (
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
                   <SelectItem value="feriado" className="text-xs py-1">
                    <PartyPopper className="w-3 h-3 mr-1.5" /> Feriado
                  </SelectItem>
                  <SelectItem value="ferias" className="text-xs py-1">
                    <Palmtree className="w-3 h-3 mr-1.5" /> Férias
                  </SelectItem>
                  <SelectItem value="casa" className="text-xs py-1" disabled={disableCasaEscritorio && workState !=='casa'}>
                    <Home className="w-3 h-3 mr-1.5" /> Casa
                  </SelectItem>
                  <SelectItem value="escritorio" className="text-xs py-1" disabled={disableCasaEscritorio && workState !=='escritorio'}>
                    <Briefcase className="w-3 h-3 mr-1.5" /> Escritório
                  </SelectItem>
                </SelectContent>
              </Select>
            ) : (
              <div className="space-y-1 sm:space-y-1.5 text-xs">
                <Label htmlFor={`feriado-${day}`} className={cn("flex items-center cursor-pointer text-[11px] sm:text-xs")}>
                  <Checkbox
                    id={`feriado-${day}`}
                    checked={isActuallyHoliday}
                    onCheckedChange={(_checked) => onSetWorkState(day, isActuallyHoliday ? undefined : 'feriado')}
                    className="mr-1 sm:mr-1.5 size-3.5 sm:size-4"
                  />
                  🎉 Feriado
                </Label>
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
                    disabled={disableCasaEscritorio}
                    className="mr-1 sm:mr-1.5 size-3.5 sm:size-4"
                  />
                  🏠 Casa
                </Label>
                <Label htmlFor={`escritorio-${day}`} className={cn("flex items-center cursor-pointer text-[11px] sm:text-xs")}>
                  <Checkbox
                    id={`escritorio-${day}`}
                    checked={workState === 'escritorio'}
                    onCheckedChange={(_checked) => onSetWorkState(day, workState === 'escritorio' ? undefined : 'escritorio')}
                    disabled={disableCasaEscritorio}
                    className="mr-1 sm:mr-1.5 size-3.5 sm:size-4"
                  />
                  🏢 Escritório
                </Label>
              </div>
            )}
          </div>
        )}
      
      {statusText && (isWeekend || isActuallyHoliday || (!isMobile && workState && !isWeekend)) && (
         <div className={cn(
            "mt-1.5 px-1 py-0.5 sm:px-2 rounded text-[9px] sm:text-[10px] text-center font-medium",
             statusBg,
             isActuallyHoliday && isMobile && !isWeekend ? "text-white" : "",
             isWeekend ? "text-muted-foreground" : ""
           )}
          >
           {statusText}
         </div>
      )}
      {/* Placeholder for mobile empty status to maintain height consistency */}
      {isMobile && !isWeekend && !isActuallyHoliday && !statusText && <div className="h-[19px] mt-1.5"></div>}
      {isMobile && isWeekend && <div className="h-[27px] mt-1"></div>} {/* Adjust height for weekend mobile display consistency */}


    </div>
  );
};

export default CalendarDay;
