
"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import HeaderControls from '@/components/workstyle-tracker/HeaderControls';
import OfficeGoalInput from '@/components/workstyle-tracker/OfficeGoalInput';
import CalendarGrid from '@/components/workstyle-tracker/CalendarGrid';
import StatsDashboard from '@/components/workstyle-tracker/StatsDashboard';
import AlertMessage from '@/components/workstyle-tracker/AlertMessage';

export type WorkState = 'casa' | 'escritorio' | 'ferias' | 'feriado';
export interface WorkStates { [key: string]: WorkState };
export interface Metrics {
  pctCasa: string;
  pctOffice: string;
  casa: number; 
  office: number; 
  ferias: number; 
  holidaysInMonth: number;
  totalWorkdays: number;
  targetOfficeMin: number;
  officeNeeded: number;
  workFromHomeDaysForAI: number; 
  workFromOfficeDaysForAI: number; 
  vacationDaysForAI: number; 
}

const monthNames = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];
const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

const applyDefaultHolidays = (month: number, year: number, currentWorkStates: WorkStates): WorkStates => {
  const holidaysList: number[] = [];
  if (month === 0) holidaysList.push(1); 
  if (month === 3) holidaysList.push(25); 
  if (month === 4) holidaysList.push(1); 
  if (month === 5) {
    holidaysList.push(10); 
    if (year >= 1580) holidaysList.push(13); 
  }
  if (month === 7) holidaysList.push(15); 
  if (month === 9) holidaysList.push(5); 
  if (month === 10) holidaysList.push(1); 
  if (month === 11) {
    holidaysList.push(1); 
    holidaysList.push(8); 
    holidaysList.push(25); 
  }
  
  const newWorkStates = { ...currentWorkStates };
  holidaysList.forEach(day => {
    // Only apply default holiday if the day isn't already set to something else (e.g. vacation)
    // or if it's specifically being cleared for a new month load
    if (!newWorkStates[day] || newWorkStates[day] === 'feriado') {
       newWorkStates[day.toString()] = 'feriado';
    }
  });
  return newWorkStates;
};


export default function WorkstyleTrackerPage() {
  const [workStates, setWorkStates] = useState<WorkStates>({});
  const [currentDate, setCurrentDate] = useState<Date | null>(null); 
  const [currentMonth, setCurrentMonth] = useState<number>(0); 
  const [currentYear, setCurrentYear] = useState<number>(2000); 
  const [officeGoalPercentage, setOfficeGoalPercentage] = useState(40);

  useEffect(() => {
    const now = new Date();
    setCurrentDate(now);
    const initialMonth = now.getMonth();
    const initialYear = now.getFullYear();
    setCurrentMonth(initialMonth);
    setCurrentYear(initialYear);
    setWorkStates(prev => applyDefaultHolidays(initialMonth, initialYear, {})); // Initialize with defaults
  }, []);

  const today = useMemo(() => currentDate ? currentDate.getDate() : 0, [currentDate]);
  const actualMonth = useMemo(() => currentDate ? currentDate.getMonth() : 0, [currentDate]);
  const actualYear = useMemo(() => currentDate ? currentDate.getFullYear() : 0, [currentDate]);
  
  const daysInMonth = useMemo(() => {
    if (!currentDate) return 0; 
    return new Date(currentYear, currentMonth + 1, 0).getDate();
  }, [currentYear, currentMonth, currentDate]);

  const firstDayOfMonth = useMemo(() => {
    if (!currentDate) return 0; 
    return new Date(currentYear, currentMonth, 1).getDay();
  }, [currentYear, currentMonth, currentDate]);

  const isWeekend = useCallback((day: number) => {
    if (!currentDate) return false;
    const d = new Date(currentYear, currentMonth, day).getDay();
    return d === 0 || d === 6;
  }, [currentYear, currentMonth, currentDate]);

  const handleSetWorkState = useCallback((day: number, state?: WorkState) => {
    setWorkStates(prev => {
      const newStates = { ...prev };
      const key = `${day}`;
      if (state) {
        newStates[key] = state;
      } else {
        delete newStates[key];
      }
      return newStates;
    });
  }, []);

  const navigateMonth = useCallback((dir: 'prev' | 'next') => {
    setCurrentMonth(prevMonth => {
      let newMonth = prevMonth;
      let newYear = currentYear;
      if (dir === 'prev') {
        newMonth = newMonth === 0 ? 11 : newMonth - 1;
        newYear = newMonth === 11 ? newYear - 1 : newYear;
      } else {
        newMonth = newMonth === 11 ? 0 : newMonth + 1;
        newYear = newMonth === 0 ? newYear + 1 : newYear;
      }
      setCurrentYear(newYear); 
      setWorkStates(applyDefaultHolidays(newMonth, newYear, {})); // Reset and apply defaults for new month
      return newMonth; 
    });
  }, [currentYear]); 

  const holidayDays = useMemo(() => {
    return Object.entries(workStates)
      .filter(([_, state]) => state === 'feriado')
      .map(([day]) => parseInt(day, 10));
  }, [workStates]);

  const metrics = useMemo<Metrics>(() => {
    if (!currentDate) { 
      return {
        pctCasa: "0.0", pctOffice: "0.0", casa: 0, office: 0, ferias: 0,
        holidaysInMonth: 0, totalWorkdays: 0, targetOfficeMin: 0, officeNeeded: 0,
        workFromHomeDaysForAI: 0, workFromOfficeDaysForAI: 0, vacationDaysForAI: 0,
      };
    }

    let workFromHomeDaysForMonth = 0;
    let workFromOfficeDaysForMonth = 0;
    let vacationDaysForMonth = 0;      
    let actualHolidaysThisMonth = 0;

    for (let d = 1; d <= daysInMonth; d++) {
      const stateOfDay = workStates[d];
      if (stateOfDay === 'feriado') {
        actualHolidaysThisMonth++;
      }
      if (stateOfDay === 'ferias') { // Count vacations regardless of weekend/holiday
        vacationDaysForMonth++;
      }
      
      if (!isWeekend(d) && stateOfDay !== 'feriado') { // Not weekend and not a holiday
        if (stateOfDay === 'casa') workFromHomeDaysForMonth++;
        else if (stateOfDay === 'escritorio') workFromOfficeDaysForMonth++;
      }
    }
    
    const isCurrentActualMonthAndYear = currentMonth === actualMonth && currentYear === actualYear;
    const dayLimitForCurrentStats = isCurrentActualMonthAndYear ? today : daysInMonth;

    let casaToday = 0, officeToday = 0;
    for (let d = 1; d <= dayLimitForCurrentStats; d++) {
       const stateOfDay = workStates[d];
      if (!isWeekend(d) && stateOfDay !== 'feriado' && stateOfDay !== 'ferias') {
        if (stateOfDay === 'casa') casaToday++;
        else if (stateOfDay === 'escritorio') officeToday++;
      }
    }
    
    let totalWorkdaysInMonth = 0;
    for (let d = 1; d <= daysInMonth; d++) {
      if (!isWeekend(d) && workStates[d] !== 'feriado' && workStates[d] !== 'ferias') {
        totalWorkdaysInMonth++;
      }
    }
    
    const totalMarkedWorkdaysForMonth = workFromHomeDaysForMonth + workFromOfficeDaysForMonth;
    const pctCasaCalculated = totalMarkedWorkdaysForMonth > 0 ? (workFromHomeDaysForMonth / totalMarkedWorkdaysForMonth) * 100 : 0;
    const pctOfficeCalculated = totalMarkedWorkdaysForMonth > 0 ? (workFromOfficeDaysForMonth / totalMarkedWorkdaysForMonth) * 100 : 0;
    
    const targetOfficeMin = Math.ceil(totalWorkdaysInMonth * (officeGoalPercentage / 100));
    const officeNeeded = Math.max(0, targetOfficeMin - workFromOfficeDaysForMonth); 

    return {
      pctCasa: pctCasaCalculated.toFixed(1),
      pctOffice: pctOfficeCalculated.toFixed(1),
      casa: casaToday, 
      office: officeToday, 
      ferias: vacationDaysForMonth,
      holidaysInMonth: actualHolidaysThisMonth,
      totalWorkdays: totalWorkdaysInMonth, 
      targetOfficeMin,
      officeNeeded,
      workFromHomeDaysForAI: workFromHomeDaysForMonth,
      workFromOfficeDaysForAI: workFromOfficeDaysForMonth,
      vacationDaysForAI: vacationDaysForMonth,
    };
  }, [currentMonth, currentYear, today, daysInMonth, actualMonth, actualYear, workStates, isWeekend, officeGoalPercentage, currentDate]);


  if (!currentDate) { 
    return <div className="flex justify-center items-center h-screen"><p>Loading...</p></div>;
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto max-w-6xl p-4 md:p-8">
        <HeaderControls
          currentMonth={currentMonth}
          currentYear={currentYear}
          monthNames={monthNames}
          onNavigate={navigateMonth}
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <OfficeGoalInput officeGoalPercentage={officeGoalPercentage} onOfficeGoalChange={setOfficeGoalPercentage} />
        </div>
        
        <CalendarGrid
          currentYear={currentYear}
          currentMonth={currentMonth}
          daysInMonth={daysInMonth}
          firstDayOfMonth={firstDayOfMonth}
          workStates={workStates}
          onSetWorkState={handleSetWorkState}
          isWeekend={isWeekend}
          today={today} 
          actualMonth={actualMonth} 
          actualYear={actualYear} 
          dayNames={dayNames}
        />

        <StatsDashboard metrics={metrics} />
        
        <AlertMessage
          pctCasa={metrics.pctCasa} 
          officeNeededForPolicy={metrics.officeNeeded} 
          wfhLimit={60} 
        />
      </div>
    </div>
  );
}
