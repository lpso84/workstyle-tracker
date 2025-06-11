
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
  casa: number; // Dias em casa até hoje
  office: number; // Dias no escritório até hoje
  ferias: number; // Total de férias marcadas no mês
  holidaysInMonth: number;
  totalWorkdays: number;
  targetOfficeMin: number;
  officeNeeded: number;
  workFromHomeDaysForAI: number; // Total de dias em casa marcados no mês (para cálculo da meta)
  workFromOfficeDaysForAI: number; // Total de dias no escritório marcados no mês (para cálculo da meta)
  vacationDaysForAI: number; // = ferias (Total de férias marcadas no mês)
}

const monthNames = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];
const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

const getDefaultHolidays = (month: number, year: number): string => {
  const holidaysList: number[] = [];
  // Feriados Nacionais Fixos de Portugal
  if (month === 0) holidaysList.push(1); // Ano Novo
  if (month === 3) holidaysList.push(25); // Dia da Liberdade
  if (month === 4) holidaysList.push(1); // Dia do Trabalhador
  if (month === 5) {
    holidaysList.push(10); // Dia de Portugal
    if (year >= 1580) holidaysList.push(13); // Dia de Santo António (Feriado Municipal de Lisboa)
  }
  if (month === 7) holidaysList.push(15); // Assunção de Nossa Senhora
  if (month === 9) holidaysList.push(5); // Implantação da República
  if (month === 10) holidaysList.push(1); // Dia de Todos os Santos
  if (month === 11) {
    holidaysList.push(1); // Restauração da Independência
    holidaysList.push(8); // Imaculada Conceição
    holidaysList.push(25); // Natal
  }
  // Feriados móveis como Carnaval, Sexta-feira Santa, Páscoa, Corpo de Deus precisam ser adicionados manualmente.
  return holidaysList.filter((day, index, self) => self.indexOf(day) === index).sort((a,b) => a-b).join(',');
};


export default function WorkstyleTrackerPage() {
  // const { toast } = useToast();
  const [holidays, setHolidays] = useState<string>('');
  const [workStates, setWorkStates] = useState<WorkStates>({});
  
  const [currentDate, setCurrentDate] = useState<Date | null>(null); 
  const [currentMonth, setCurrentMonth] = useState<number>(0); 
  const [currentYear, setCurrentYear] = useState<number>(2000); 

  const [officeGoalPercentage, setOfficeGoalPercentage] = useState(40);

  // const [genAIRecommendation, setGenAIRecommendation] = useState<AttendanceAdvisorRecommendationsOutput | null>(null);
  // const [isGenAILoading, setIsGenAILoading] = useState(false);

  useEffect(() => {
    const now = new Date();
    setCurrentDate(now); // Correctly initialized here, after mount for client-side
    const initialMonth = now.getMonth();
    const initialYear = now.getFullYear();
    setCurrentMonth(initialMonth);
    setCurrentYear(initialYear);
    setHolidays(getDefaultHolidays(initialMonth, initialYear));
  }, []);

  const today = useMemo(() => currentDate ? currentDate.getDate() : 0, [currentDate]);
  const actualMonth = useMemo(() => currentDate ? currentDate.getMonth() : 0, [currentDate]);
  const actualYear = useMemo(() => currentDate ? currentDate.getFullYear() : 0, [currentDate]);

  const holidayDays = useMemo(() => holidays
    .split(',')
    .map(h => parseInt(h.trim(), 10))
    .filter(h => !isNaN(h) && h > 0 && h <= 31), [holidays]); 

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
      setWorkStates({}); 
      setHolidays(getDefaultHolidays(newMonth, newYear)); 
      // setGenAIRecommendation(null); 
      return newMonth; 
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

    let workFromHomeDaysForMonth = 0; // Renamed for clarity: total for month used for percentages and AI
    let workFromOfficeDaysForMonth = 0; // Renamed for clarity: total for month used for percentages and AI
    let vacationDaysForMonth = 0;       // Renamed for clarity: total for month

    for (let d = 1; d <= daysInMonth; d++) {
      if (!isWeekend(d) && !holidayDays.includes(d)) {
        const st = workStates[d];
        if (st === 'casa') workFromHomeDaysForMonth++;
        else if (st === 'escritorio') workFromOfficeDaysForMonth++;
        else if (st === 'ferias') vacationDaysForMonth++;
      } else if (workStates[d] === 'ferias' && (isWeekend(d) || holidayDays.includes(d))) {
        vacationDaysForMonth++;
      }
    }
    
    const isCurrentActualMonthAndYear = currentMonth === actualMonth && currentYear === actualYear;
    const dayLimitForCurrentStats = isCurrentActualMonthAndYear ? today : daysInMonth;

    // 'casaToday' e 'officeToday' são para os contadores "até hoje"
    let casaToday = 0, officeToday = 0;
    for (let d = 1; d <= dayLimitForCurrentStats; d++) {
      if (!isWeekend(d) && !holidayDays.includes(d)) {
        const st = workStates[d];
        if (st === 'casa') casaToday++;
        else if (st === 'escritorio') officeToday++;
      }
    }
    
    let totalWorkdaysInMonth = 0;
    for (let d = 1; d <= daysInMonth; d++) {
      if (!isWeekend(d) && !holidayDays.includes(d) && workStates[d] !== 'ferias') {
        totalWorkdaysInMonth++;
      }
    }
    
    // Calcular percentagens com base nos totais do mês inteiro (workFromHomeDaysForMonth, workFromOfficeDaysForMonth)
    const totalMarkedWorkdaysForMonth = workFromHomeDaysForMonth + workFromOfficeDaysForMonth;
    const pctCasaCalculated = totalMarkedWorkdaysForMonth > 0 ? (workFromHomeDaysForMonth / totalMarkedWorkdaysForMonth) * 100 : 0;
    const pctOfficeCalculated = totalMarkedWorkdaysForMonth > 0 ? (workFromOfficeDaysForMonth / totalMarkedWorkdaysForMonth) * 100 : 0;
    
    const targetOfficeMin = Math.ceil(totalWorkdaysInMonth * (officeGoalPercentage / 100));
    // officeNeeded usa workFromOfficeDaysForMonth porque a meta é para o mês inteiro
    const officeNeeded = Math.max(0, targetOfficeMin - workFromOfficeDaysForMonth); 

    return {
      pctCasa: pctCasaCalculated.toFixed(1),
      pctOffice: pctOfficeCalculated.toFixed(1),
      casa: casaToday, 
      office: officeToday, 
      ferias: vacationDaysForMonth,
      holidaysInMonth: holidayDays.length,
      totalWorkdays: totalWorkdaysInMonth, 
      targetOfficeMin,
      officeNeeded,
      workFromHomeDaysForAI: workFromHomeDaysForMonth, // Passa o total do mês para a IA
      workFromOfficeDaysForAI: workFromOfficeDaysForMonth, // Passa o total do mês para a IA
      vacationDaysForAI: vacationDaysForMonth, // Passa o total do mês para a IA
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
          pctCasa={metrics.pctCasa} // Este pctCasa agora reflete o mês inteiro
          officeNeededForPolicy={metrics.officeNeeded} 
          wfhLimit={60} // Este é um exemplo, pode ser ajustado
        />
      </div>
    </div>
  );
}

