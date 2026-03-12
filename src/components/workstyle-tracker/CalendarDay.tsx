"use client";

import React from "react";
import { Bandage, Briefcase, Edit3, Home, Palmtree, PartyPopper, XCircle } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { WorkState } from "@/app/page";
import { useIsMobile } from "@/hooks/use-mobile";

interface CalendarDayProps {
  day: number;
  isToday: boolean;
  isWeekend: boolean;
  workState?: WorkState;
  onSetWorkState: (day: number, state?: WorkState) => void;
}

const iconClassName = "h-3.5 w-3.5";

const CalendarDay: React.FC<CalendarDayProps> = ({ day, isToday, isWeekend, workState, onSetWorkState }) => {
  const isMobile = useIsMobile();
  const isHoliday = workState === "feriado";
  const isSickDay = workState === "sickday";

  let cellBg = "bg-card hover:bg-muted/20";
  let statusText = "";
  let statusBg = "";
  let textColor = "text-foreground";

  if (isWeekend) {
    cellBg = "bg-muted/30";
    textColor = "text-muted-foreground";
    statusText = isMobile ? "FDS" : "Fim de Semana";
    statusBg = "bg-muted text-muted-foreground";
  } else if (isHoliday) {
    cellBg = "bg-orange-500/10 hover:bg-orange-500/20";
    statusText = "Feriado";
    statusBg = "bg-orange-500 text-white";
    textColor = "text-orange-700 dark:text-orange-400";
  } else if (workState === "casa") {
    cellBg = "bg-green-500/10 hover:bg-green-500/20";
    statusText = "Casa";
    statusBg = "bg-green-500 text-white";
    textColor = "text-green-700 dark:text-green-400";
  } else if (workState === "escritorio") {
    cellBg = "bg-blue-500/10 hover:bg-blue-500/20";
    statusText = "Escritorio";
    statusBg = "bg-blue-500 text-white";
    textColor = "text-blue-700 dark:text-blue-400";
  } else if (workState === "ferias") {
    cellBg = "bg-yellow-500/10 hover:bg-yellow-500/20";
    statusText = "Ferias";
    statusBg = "bg-yellow-500 text-white";
    textColor = "text-yellow-700 dark:text-yellow-400";
  } else if (isSickDay) {
    cellBg = "bg-rose-500/10 hover:bg-rose-500/20";
    statusText = "Sick Day";
    statusBg = "bg-rose-500 text-white";
    textColor = "text-rose-700 dark:text-rose-400";
  }

  const renderWorkStateIcon = (state?: WorkState, className?: string) => {
    if (state === "feriado") return <PartyPopper className={cn(iconClassName, className)} />;
    if (state === "ferias") return <Palmtree className={cn(iconClassName, className)} />;
    if (state === "sickday") return <Bandage className={cn(iconClassName, className)} />;
    if (state === "casa") return <Home className={cn(iconClassName, className)} />;
    if (state === "escritorio") return <Briefcase className={cn(iconClassName, className)} />;
    return <Edit3 className={cn(iconClassName, "text-muted-foreground", className)} />;
  };

  const disableCasaEscritorio = isHoliday || workState === "ferias" || isSickDay;

  const desktopOptions: Array<{ id: WorkState; label: string }> = [
    { id: "feriado", label: "Feriado" },
    { id: "ferias", label: "Ferias" },
    { id: "sickday", label: "Sick Day" },
    { id: "casa", label: "Casa" },
    { id: "escritorio", label: "Escritorio" },
  ];

  const isOptionDisabled = (state: WorkState) =>
    disableCasaEscritorio && workState !== state && (state === "casa" || state === "escritorio");

  return (
    <div
      className={cn(
        "calendar-cell flex flex-col justify-between rounded-lg border p-1.5 transition-colors duration-150 sm:p-2",
        cellBg,
        isToday ? "border-2 border-primary shadow-md" : "border-border"
      )}
    >
      <div className={cn("self-start text-xs font-medium sm:text-sm", textColor, isToday ? "font-bold text-primary" : "")}>
        {day}
      </div>

      {!isWeekend && (
        <div className="mt-1">
          {isMobile ? (
            <Select value={workState || "none"} onValueChange={(value) => onSetWorkState(day, value === "none" ? undefined : (value as WorkState))}>
              <SelectTrigger className="h-8 w-full justify-center p-1 text-xs">
                <SelectValue placeholder="Definir">
                  <div className="flex items-center justify-center">{renderWorkStateIcon(workState)}</div>
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none" className="py-1 text-xs">
                  <div className="flex items-center gap-2">
                    <XCircle className={iconClassName} />
                    <span>Nenhum</span>
                  </div>
                </SelectItem>
                {desktopOptions.map((option) => (
                  <SelectItem key={option.id} value={option.id} className="py-1 text-xs" disabled={isOptionDisabled(option.id)}>
                    <div className="flex items-center gap-2">
                      {renderWorkStateIcon(option.id)}
                      <span>{option.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <div className="space-y-1 text-xs sm:space-y-1.5">
              {desktopOptions.map((option) => {
                const checked = workState === option.id;
                const disabled = isOptionDisabled(option.id);

                return (
                  <Label key={option.id} htmlFor={`${option.id}-${day}`} className="flex cursor-pointer items-center gap-1 text-[11px] sm:text-xs">
                    <Checkbox
                      id={`${option.id}-${day}`}
                      checked={checked}
                      onCheckedChange={() => onSetWorkState(day, checked ? undefined : option.id)}
                      disabled={disabled}
                      className="size-3.5 sm:size-4"
                    />
                    {renderWorkStateIcon(option.id)}
                    <span>{option.label}</span>
                  </Label>
                );
              })}
            </div>
          )}
        </div>
      )}

      {statusText && (isWeekend || isHoliday || (!isMobile && workState && !isWeekend)) && (
        <div
          className={cn(
            "mt-1.5 rounded px-1 py-0.5 text-center text-[9px] font-medium sm:px-2 sm:text-[10px]",
            statusBg,
            isWeekend ? "text-muted-foreground" : ""
          )}
        >
          {statusText}
        </div>
      )}

      {isMobile && !isWeekend && !isHoliday && !statusText && <div className="mt-1.5 h-[19px]" />}
      {isMobile && isWeekend && <div className="mt-1 h-[27px]" />}
    </div>
  );
};

export default CalendarDay;
