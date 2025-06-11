
"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
// import { attendanceAdvisorRecommendations, type AttendanceAdvisorRecommendationsInput, type AttendanceAdvisorRecommendationsOutput } from '@/ai/flows/attendance-advisor';
import HeaderControls from '@/components/workstyle-tracker/HeaderControls';
import HolidayInput from '@/components/workstyle-tracker/HolidayInput';
import OfficeGoalInput from '@/components/workstyle-tracker/OfficeGoalInput';
import CalendarGrid from '@/components/workstyle-tracker/CalendarGrid';
import StatsDashboard from '@/components/workstyle-tracker/StatsDashboard';
import AlertMessage from '@/components/workstyle-tracker/AlertMessage';
// import { useToast } from "@/hooks/use-toast";

export type WorkState = 'casa' | 'escritorio' | 'ferias';
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

export default function WorkstyleTrackerPage() {
  // const { toast } = useToast();
  const [holidays, setHolidays] = useState('1,8,25');
  const [workStates, setWorkStates] = useState<WorkStates>({});
  
  const [currentDate, setCurrentDate] = useState<Date | null>(null); 
  const [currentMonth, setCurrentMonth] = useState<number>(0); 
  const [currentYear, setCurrentYear] = useState<number>(2000); 

  const [officeGoalPercentage, setOfficeGoalPercentage] = useState(40);

  // const [genAIRecommendation, setGenAIRecommendation] = useState<AttendanceAdvisorRecommendationsOutput | null>(null);
  // const [isGenAILoading, setIsGenAILoading] = useState(false);

  useEffect(() => {
    const now = new Date();
    setCurrentDate(now);
    setCurrentMonth(now.getMonth());
    setCurrentYear(now.getFullYear());
  }, []); 

  const today = useMemo(() => currentDate ? currentDate.getDate() : 0, [currentDate]);
  const actualMonth = useMemo(() => currentDate ? currentDate.getMonth() : 0, [currentDate]);
  const actualYear = useMemo(() => currentDate ? currentDate.getFullYear() : 0, [currentDate]);

  const holidayDays = useMemo(() => holidays
    .split(',')
    .map(h => parseInt(h.trim(), 10))
    .filter(h => !isNaN(h)), [holidays]);

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
      let m = prevMonth, y = currentYear;
      if (dir === 'prev') {
        m = m === 0 ? 11 : m - 1;
        y = m === 11 ? y - 1 : y;
      } else {
        m = m === 11 ? 0 : m + 1;
        y = m === 0 ? y + 1 : y;
      }
      setCurrentYear(y);
      setWorkStates({}); 
      // setGenAIRecommendation(null); 
      return m;
    });
  }, [currentYear]);

  const metrics = useMemo<Metrics>(() => {
    if (!currentDate) { 
      return {
        pctCasa: "0.0", pctOffice: "0.0", casa: 0, office: 0, ferias: 0,
        holidaysInMonth: 0, totalWorkdays: 0, targetOfficeMin: 0, officeNeeded: 0,
        workFromHomeDaysForAI: 0, workFromOfficeDaysForAI: 0, vacationDaysForAI: 0,
      };
    }

    let casa = 0, office = 0;
    
    let workFromHomeDaysForAI = 0;
    let workFromOfficeDaysForAI = 0;
    let vacationDaysForAI = 0;

    for (let d = 1; d <= daysInMonth; d++) {
      if (!isWeekend(d) && !holidayDays.includes(d)) {
        const st = workStates[d];
        if (st === 'casa') workFromHomeDaysForAI++;
        else if (st === 'escritorio') workFromOfficeDaysForAI++;
        else if (st === 'ferias') vacationDaysForAI++;
      }
    }
    
    const isCurrentActualMonthAndYear = currentMonth === actualMonth && currentYear === actualYear;
    const dayLimitForCurrentStats = isCurrentActualMonthAndYear ? today : daysInMonth;

    for (let d = 1; d <= dayLimitForCurrentStats; d++) {
      if (!isWeekend(d) && !holidayDays.includes(d)) {
        const st = workStates[d];
        if (st === 'casa') casa++;
        else if (st === 'escritorio') office++;
      }
    }
    
    let totalWorkdaysInMonth = 0;
    for (let d = 1; d <= daysInMonth; d++) {
      if (!isWeekend(d) && !holidayDays.includes(d) && workStates[d] !== 'ferias') {
        totalWorkdaysInMonth++;
      }
    }
    
    const totalMarkedUpToLimitDay = casa + office;
    const pctCasa = totalMarkedUpToLimitDay > 0 ? (casa / totalMarkedUpToLimitDay) * 100 : 0;
    const pctOffice = totalMarkedUpToLimitDay > 0 ? (office / totalMarkedUpToLimitDay) * 100 : 0;
    
    const targetOfficeMin = Math.ceil(totalWorkdaysInMonth * (officeGoalPercentage / 100));
    const officeNeeded = Math.max(0, targetOfficeMin - workFromOfficeDaysForAI); 

    return {
      pctCasa: pctCasa.toFixed(1),
      pctOffice: pctOffice.toFixed(1),
      casa, 
      office, 
      ferias: vacationDaysForAI,
      holidaysInMonth: holidayDays.length,
      totalWorkdays: totalWorkdaysInMonth, 
      targetOfficeMin,
      officeNeeded,
      workFromHomeDaysForAI, 
      workFromOfficeDaysForAI, 
      vacationDaysForAI, 
    };
  }, [currentMonth, currentYear, today, daysInMonth, actualMonth, actualYear, workStates, holidayDays, isWeekend, officeGoalPercentage, currentDate]);


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
          <HolidayInput holidays={holidays} onHolidaysChange={setHolidays} />
          <OfficeGoalInput officeGoalPercentage={officeGoalPercentage} onOfficeGoalChange={setOfficeGoalPercentage} />
        </div>
        
        <CalendarGrid
          currentYear={currentYear}
          currentMonth={currentMonth}
          daysInMonth={daysInMonth}
          firstDayOfMonth={firstDayOfMonth}
          holidayDays={holidayDays}
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
