
"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import HeaderControls from '@/components/workstyle-tracker/HeaderControls';
import OfficeGoalInput from '@/components/workstyle-tracker/OfficeGoalInput';
import CalendarGrid from '@/components/workstyle-tracker/CalendarGrid';
import StatsDashboard from '@/components/workstyle-tracker/StatsDashboard';
import AlertMessage from '@/components/workstyle-tracker/AlertMessage';
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { RotateCcw } from 'lucide-react';

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
  const newWorkStates = { ...currentWorkStates };
  // Feriados Nacionais Fixos de Portugal
  const nationalFixedHolidays: { [key: number]: number[] } = {
    0: [1], // Ano Novo (Janeiro)
    3: [25], // Dia da Liberdade (Abril)
    4: [1], // Dia do Trabalhador (Maio)
    5: [10], // Dia de Portugal (Junho)
    7: [15], // Assunção de Nossa Senhora (Agosto)
    9: [5], // Implantação da República (Outubro)
    10: [1], // Todos os Santos (Novembro)
    11: [1, 8, 25], // Restauração da Independência, Imaculada Conceição, Natal (Dezembro)
  };

  // Feriado Municipal de Lisboa
  if (month === 5 && year >= 1580) { // Junho - Dia de Santo António
    if (!nationalFixedHolidays[month]) nationalFixedHolidays[month] = [];
    if (!nationalFixedHolidays[month].includes(13)) {
        nationalFixedHolidays[month].push(13);
    }
  }
  
  if (nationalFixedHolidays[month]) {
    nationalFixedHolidays[month].forEach(day => {
      const dayKey = day.toString();
      // Only apply default holiday if the day isn't already set to something else (e.g. vacation)
      // or if it's specifically being cleared for a new month load (currentWorkStates is empty)
      if (!newWorkStates[dayKey] || Object.keys(currentWorkStates).length === 0) {
         newWorkStates[dayKey] = 'feriado';
      }
    });
  }
  return newWorkStates;
};


export default function WorkstyleTrackerPage() {
  const [workStates, setWorkStates] = useState<WorkStates>({});
  const [currentDate, setCurrentDate] = useState<Date | null>(null); 
  const [currentMonth, setCurrentMonth] = useState<number>(0); 
  const [currentYear, setCurrentYear] = useState<number>(2000); 
  const [officeGoalPercentage, setOfficeGoalPercentage] = useState(40);
  const [isInitialLoadComplete, setIsInitialLoadComplete] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const now = new Date();
    const initialMonth = now.getMonth();
    const initialYear = now.getFullYear();

    setCurrentDate(now);
    setCurrentMonth(initialMonth);
    setCurrentYear(initialYear);
    
    // Load office goal from localStorage
    if (typeof window !== 'undefined') {
      try {
        const storedOfficeGoal = localStorage.getItem('workTracker_officeGoal');
        if (storedOfficeGoal) {
          setOfficeGoalPercentage(parseInt(storedOfficeGoal, 10));
        } else {
          setOfficeGoalPercentage(40); // Default
        }
      } catch (error) {
        console.error("Error loading office goal from localStorage:", error);
        setOfficeGoalPercentage(40); // Default on error
      }

      // Load work states for the current month from localStorage
      const workStatesKey = `workTracker_workStates_${initialYear}-${initialMonth}`;
      try {
        const storedWorkStates = localStorage.getItem(workStatesKey);
        if (storedWorkStates) {
          setWorkStates(JSON.parse(storedWorkStates));
        } else {
          setWorkStates(applyDefaultHolidays(initialMonth, initialYear, {}));
        }
      } catch (error) {
        console.error("Error loading work states from localStorage:", error);
        setWorkStates(applyDefaultHolidays(initialMonth, initialYear, {})); // Default on error
      }
    } else {
        // Fallback for SSR or environments without localStorage
        setOfficeGoalPercentage(40);
        setWorkStates(applyDefaultHolidays(initialMonth, initialYear, {}));
    }
    setIsInitialLoadComplete(true);
  }, []);

  useEffect(() => {
    if (!isInitialLoadComplete || !currentDate || typeof window === 'undefined') { 
      return; 
    }

    try {
      localStorage.setItem('workTracker_officeGoal', officeGoalPercentage.toString());
      const workStatesKey = `workTracker_workStates_${currentYear}-${currentMonth}`;
      localStorage.setItem(workStatesKey, JSON.stringify(workStates));
    } catch (error) {
      console.error("Error saving to localStorage:", error);
      toast({
        title: "Erro ao Guardar",
        description: "Não foi possível guardar as alterações localmente.",
        variant: "destructive",
      });
    }
  }, [workStates, officeGoalPercentage, currentYear, currentMonth, isInitialLoadComplete, currentDate, toast]);


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
        if (newMonth === 11) newYear--; 
      } else {
        newMonth = newMonth === 11 ? 0 : newMonth + 1;
        if (newMonth === 0) newYear++; 
      }
      setCurrentYear(newYear); 
      
      if (typeof window !== 'undefined') {
        const workStatesKey = `workTracker_workStates_${newYear}-${newMonth}`;
        try {
          const storedWorkStates = localStorage.getItem(workStatesKey);
          if (storedWorkStates) {
            setWorkStates(JSON.parse(storedWorkStates));
          } else {
            setWorkStates(applyDefaultHolidays(newMonth, newYear, {}));
          }
        } catch (error) {
          console.error("Error loading work states for new month from localStorage:", error);
          setWorkStates(applyDefaultHolidays(newMonth, newYear, {}));
        }
      } else {
         setWorkStates(applyDefaultHolidays(newMonth, newYear, {}));
      }
      return newMonth; 
    });
  }, [currentYear]); 

  const handleResetData = useCallback(() => {
    if (!currentDate) return;

    const confirmReset = window.confirm("Tem a certeza que quer limpar todos os dados guardados desta aplicação (incluindo de outros meses) e redefinir o mês atual?");
    if (!confirmReset) return;

    if (typeof window !== 'undefined') {
      try {
        Object.keys(localStorage).forEach(key => {
          if (key.startsWith('workTracker_workStates_') || key === 'workTracker_officeGoal') {
            localStorage.removeItem(key);
          }
        });

        setWorkStates(applyDefaultHolidays(currentMonth, currentYear, {}));
        setOfficeGoalPercentage(40); 

        toast({
          title: "Dados Redefinidos",
          description: "Todas as suas marcações e a meta de escritório foram limpas.",
        });
      } catch (error) {
        console.error("Error resetting data from localStorage:", error);
        toast({
          title: "Erro ao Redefinir",
          description: "Não foi possível limpar os dados. Tente novamente.",
          variant: "destructive",
        });
      }
    }
  }, [currentMonth, currentYear, toast, currentDate]);

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
      if (stateOfDay === 'ferias') { 
        vacationDaysForMonth++;
      }
      
      if (!isWeekend(d) && stateOfDay !== 'feriado') { 
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


  if (!currentDate || !isInitialLoadComplete) { 
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
         <div className="flex justify-end mb-6">
            <Button variant="outline" onClick={handleResetData} className="shadow-md hover:shadow-lg transition-shadow">
              <RotateCcw className="mr-2 h-4 w-4" />
              Redefinir Dados
            </Button>
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

