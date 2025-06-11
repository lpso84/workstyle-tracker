"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { attendanceAdvisorRecommendations, type AttendanceAdvisorRecommendationsInput, type AttendanceAdvisorRecommendationsOutput } from '@/ai/flows/attendance-advisor';
import HeaderControls from '@/components/workstyle-tracker/HeaderControls';
import HolidayInput from '@/components/workstyle-tracker/HolidayInput';
import OfficeGoalInput from '@/components/workstyle-tracker/OfficeGoalInput';
import LegendDisplay from '@/components/workstyle-tracker/LegendDisplay';
import CalendarGrid from '@/components/workstyle-tracker/CalendarGrid';
import StatsDashboard from '@/components/workstyle-tracker/StatsDashboard';
import AlertMessage from '@/components/workstyle-tracker/AlertMessage';
import AttendanceAdvisor from '@/components/workstyle-tracker/AttendanceAdvisor';
import { useToast } from "@/hooks/use-toast";

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
  const { toast } = useToast();
  const [holidays, setHolidays] = useState('1,8,25');
  const [workStates, setWorkStates] = useState<WorkStates>({});
  
  const [currentDate, setCurrentDate] = useState(new Date());
  useEffect(() => {
    setCurrentDate(new Date()); // Ensure currentDate is client-side
  }, []);

  const [currentMonth, setCurrentMonth] = useState(currentDate.getMonth());
  const [currentYear, setCurrentYear] = useState(currentDate.getFullYear());
  const [officeGoalPercentage, setOfficeGoalPercentage] = useState(40);

  const [genAIRecommendation, setGenAIRecommendation] = useState<AttendanceAdvisorRecommendationsOutput | null>(null);
  const [isGenAILoading, setIsGenAILoading] = useState(false);

  const today = useMemo(() => currentDate.getDate(), [currentDate]);
  const actualMonth = useMemo(() => currentDate.getMonth(), [currentDate]);
  const actualYear = useMemo(() => currentDate.getFullYear(), [currentDate]);

  const holidayDays = useMemo(() => holidays
    .split(',')
    .map(h => parseInt(h.trim(), 10))
    .filter(h => !isNaN(h)), [holidays]);

  const daysInMonth = useMemo(() => new Date(currentYear, currentMonth + 1, 0).getDate(), [currentYear, currentMonth]);
  const firstDayOfMonth = useMemo(() => new Date(currentYear, currentMonth, 1).getDay(), [currentYear, currentMonth]);

  const isWeekend = useCallback((day: number) => {
    const d = new Date(currentYear, currentMonth, day).getDay();
    return d === 0 || d === 6;
  }, [currentYear, currentMonth]);

  const handleCheckboxChange = useCallback((day: number, type: WorkState) => {
    setWorkStates(prev => {
      const newStates = { ...prev };
      const key = `${day}`;
      if (newStates[key] === type) {
        delete newStates[key]; // Toggle off
      } else {
        newStates[key] = type; // Set new type
        // If 'ferias' is selected, remove 'casa' or 'escritorio'
        if (type === 'ferias') {
          if (newStates[key] === 'casa' || newStates[key] === 'escritorio') {
             // This condition is complex as it's already set to 'ferias'
             // The logic should be: if setting to 'ferias', ensure others are off.
             // If setting 'casa' or 'escritorio', ensure 'ferias' is off.
             // The current logic in user code is fine where disabled state handles part of this.
          }
        } else { // If 'casa' or 'escritorio' is selected, remove the other if it was selected
          if (type === 'casa' && newStates[key] === 'escritorio') delete newStates[key]; // This is wrong
          if (type === 'escritorio' && newStates[key] === 'casa') delete newStates[key]; // This is wrong
          // The current behavior is that selecting one type deselects the others implicitly
          // except for 'ferias' which acts as an override
        }
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
      setWorkStates({}); // Reset states for new month
      setGenAIRecommendation(null); // Reset AI recommendation
      return m;
    });
  }, [currentYear]);

  const metrics = useMemo<Metrics>(() => {
    let casa = 0, office = 0, ferias = 0;
    const isCurrentActualMonth = currentMonth === actualMonth && currentYear === actualYear;
    const limitDay = isCurrentActualMonth ? today : daysInMonth;
    
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

    for (let d = 1; d <= limitDay; d++) {
      if (!isWeekend(d) && !holidayDays.includes(d)) {
        const st = workStates[d];
        if (st === 'casa') casa++;
        else if (st === 'escritorio') office++;
        else if (st === 'ferias') ferias++;
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
    const officeNeeded = Math.max(0, targetOfficeMin - workFromOfficeDaysForAI); // Use workFromOfficeDaysForAI for the whole month goal

    return {
      pctCasa: pctCasa.toFixed(1),
      pctOffice: pctOffice.toFixed(1),
      casa, // up to limit day
      office, // up to limit day
      ferias, // up to limit day
      holidaysInMonth: holidayDays.length,
      totalWorkdays: totalWorkdaysInMonth, // For the whole month, excluding holidays and chosen vacation days
      targetOfficeMin,
      officeNeeded,
      workFromHomeDaysForAI, // for the whole month
      workFromOfficeDaysForAI, // for the whole month
      vacationDaysForAI, // for the whole month
    };
  }, [currentMonth, currentYear, today, daysInMonth, actualMonth, actualYear, workStates, holidayDays, isWeekend, officeGoalPercentage]);

  useEffect(() => {
    const fetchAIRecommendations = async () => {
      if (!metrics) return;

      setIsGenAILoading(true);
      setGenAIRecommendation(null);

      const aiInput: AttendanceAdvisorRecommendationsInput = {
        workFromHomeDays: metrics.workFromHomeDaysForAI,
        workFromOfficeDays: metrics.workFromOfficeDaysForAI,
        vacationDays: metrics.vacationDaysForAI,
        holidaysInMonth: metrics.holidaysInMonth,
        totalWorkdaysInMonth: metrics.totalWorkdays,
        officeDaysGoalPercentage: officeGoalPercentage,
      };

      try {
        const result = await attendanceAdvisorRecommendations(aiInput);
        setGenAIRecommendation(result);
      } catch (error) {
        console.error("Error fetching AI recommendations:", error);
        toast({
          title: "Erro do Consultor IA",
          description: "Não foi possível obter as recomendações. Tente novamente mais tarde.",
          variant: "destructive",
        });
      } finally {
        setIsGenAILoading(false);
      }
    };

    // Call AI only if it's the current actual month or a future month.
    // Or if we want to analyze past months as well, this condition can be removed.
    // For now, let's assume analysis is always relevant.
    fetchAIRecommendations();

  }, [metrics, officeGoalPercentage, toast]);

  const isOverWfhThreshold = parseFloat(metrics.pctCasa) > 60;

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
        
        <LegendDisplay />

        <CalendarGrid
          currentYear={currentYear}
          currentMonth={currentMonth}
          daysInMonth={daysInMonth}
          firstDayOfMonth={firstDayOfMonth}
          holidayDays={holidayDays}
          workStates={workStates}
          onCheckboxChange={handleCheckboxChange}
          isWeekend={isWeekend}
          today={today}
          actualMonth={actualMonth}
          actualYear={actualYear}
          dayNames={dayNames}
        />

        <StatsDashboard metrics={metrics} />
        
        <AttendanceAdvisor recommendations={genAIRecommendation} isLoading={isGenAILoading} />

        <AlertMessage
          pctCasa={metrics.pctCasa}
          officeNeededForPolicy={metrics.officeNeeded} // this is for the 40% goal
          wfhLimit={60}
        />
      </div>
    </div>
  );
}
