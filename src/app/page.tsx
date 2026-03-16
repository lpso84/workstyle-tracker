"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { RotateCcw } from "lucide-react";
import HeaderControls from "@/components/workstyle-tracker/HeaderControls";
import OfficeGoalInput from "@/components/workstyle-tracker/OfficeGoalInput";
import QuarterGoalInput from "@/components/workstyle-tracker/QuarterGoalInput";
import CalendarGrid from "@/components/workstyle-tracker/CalendarGrid";
import StatsDashboard from "@/components/workstyle-tracker/StatsDashboard";
import AlertMessage from "@/components/workstyle-tracker/AlertMessage";
import LegendDisplay from "@/components/workstyle-tracker/LegendDisplay";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

export type WorkState = "casa" | "escritorio" | "ferias" | "feriado" | "sickday";
export type GoalMode = "monthly" | "quarterly";
export interface WorkStates {
  [key: string]: WorkState;
}

export interface PeriodMetrics {
  pctCasa: string;
  pctOffice: string;
  casa: number;
  office: number;
  ferias: number;
  sickDays: number;
  holidaysInPeriod: number;
  totalWorkdays: number;
  targetOfficeMin: number;
  officeNeeded: number;
}

interface MonthPeriodData {
  year: number;
  month: number;
  workStates: WorkStates;
}

const DEFAULT_MONTHLY_GOAL = 40;
const DEFAULT_QUARTERLY_GOAL = 50;
const DEFAULT_QUARTER_START_MONTH = 0;

const STORAGE_KEYS = {
  monthlyGoal: "workTracker_officeGoal",
  quarterlyGoal: "workTracker_quarterOfficeGoal",
  quarterStartMonth: "workTracker_quarterStartMonth",
  goalMode: "workTracker_goalMode",
};

const monthNames = [
  "Janeiro",
  "Fevereiro",
  "Marco",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

const dayNames = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"];

const getWorkStatesStorageKey = (year: number, month: number) => `workTracker_workStates_${year}-${month}`;

const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();

const isWeekendDate = (year: number, month: number, day: number) => {
  const dayOfWeek = new Date(year, month, day).getDay();
  return dayOfWeek === 0 || dayOfWeek === 6;
};

const compareYearMonth = (year: number, month: number, referenceYear: number, referenceMonth: number) => {
  const current = year * 12 + month;
  const reference = referenceYear * 12 + referenceMonth;
  return current - reference;
};

const applyDefaultHolidays = (month: number, year: number, currentWorkStates: WorkStates): WorkStates => {
  const newWorkStates = { ...currentWorkStates };
  const nationalFixedHolidays: { [key: number]: number[] } = {
    0: [1],
    3: [25],
    4: [1],
    5: [10],
    7: [15],
    9: [5],
    10: [1],
    11: [1, 8, 25],
  };

  if (month === 5 && year >= 1580) {
    if (!nationalFixedHolidays[month]) {
      nationalFixedHolidays[month] = [];
    }

    if (!nationalFixedHolidays[month].includes(13)) {
      nationalFixedHolidays[month].push(13);
    }
  }

  if (nationalFixedHolidays[month]) {
    nationalFixedHolidays[month].forEach((day) => {
      const dayKey = day.toString();
      if (!newWorkStates[dayKey] || Object.keys(currentWorkStates).length === 0) {
        newWorkStates[dayKey] = "feriado";
      }
    });
  }

  return newWorkStates;
};

const loadStoredMonthWorkStates = (year: number, month: number): WorkStates => {
  const defaultStates = applyDefaultHolidays(month, year, {});

  if (typeof window === "undefined") {
    return defaultStates;
  }

  try {
    const storedWorkStates = localStorage.getItem(getWorkStatesStorageKey(year, month));
    if (!storedWorkStates) {
      return defaultStates;
    }

    return applyDefaultHolidays(month, year, JSON.parse(storedWorkStates) as WorkStates);
  } catch (error) {
    console.error("Error loading work states from localStorage:", error);
    return defaultStates;
  }
};

const getQuarterMonths = (currentYear: number, currentMonth: number, quarterStartMonth: number) => {
  const absoluteCurrentMonth = currentYear * 12 + currentMonth;
  const relativeMonth = (currentMonth - quarterStartMonth + 12) % 12;
  const quarterOffset = relativeMonth % 3;
  const quarterStartAbsoluteMonth = absoluteCurrentMonth - quarterOffset;

  return [0, 1, 2].map((offset) => {
    const absoluteMonth = quarterStartAbsoluteMonth + offset;
    return {
      year: Math.floor(absoluteMonth / 12),
      month: absoluteMonth % 12,
    };
  });
};

const calculateMonthlyMetrics = (
  workStates: WorkStates,
  year: number,
  month: number,
  actualYear: number,
  actualMonth: number,
  today: number,
  officeGoalPercentage: number
): PeriodMetrics => {
  const daysInMonth = getDaysInMonth(year, month);
  let workFromHomeDaysFullMonth = 0;
  let workFromOfficeDaysFullMonth = 0;
  let vacationDaysFullMonth = 0;
  let sickDaysFullMonth = 0;
  let holidaysFullMonth = 0;
  let totalWorkdaysInMonth = 0;

  for (let day = 1; day <= daysInMonth; day++) {
    const stateOfDay = workStates[day];
    const isWeekend = isWeekendDate(year, month, day);

    if (stateOfDay === "feriado") {
      holidaysFullMonth++;
    }

    if (stateOfDay === "ferias") {
      vacationDaysFullMonth++;
    }

    if (stateOfDay === "sickday") {
      sickDaysFullMonth++;
    }

    if (!isWeekend && stateOfDay !== "feriado") {
      if (stateOfDay === "casa") {
        workFromHomeDaysFullMonth++;
      } else if (stateOfDay === "escritorio") {
        workFromOfficeDaysFullMonth++;
      }
    }

    if (!isWeekend && stateOfDay !== "feriado" && stateOfDay !== "ferias" && stateOfDay !== "sickday") {
      totalWorkdaysInMonth++;
    }
  }

  const dayLimit = year === actualYear && month === actualMonth ? today : daysInMonth;
  let casaUntilVisibleLimit = 0;
  let officeUntilVisibleLimit = 0;

  for (let day = 1; day <= dayLimit; day++) {
    const stateOfDay = workStates[day];
    if (
      !isWeekendDate(year, month, day) &&
      stateOfDay !== "feriado" &&
      stateOfDay !== "ferias" &&
      stateOfDay !== "sickday"
    ) {
      if (stateOfDay === "casa") {
        casaUntilVisibleLimit++;
      } else if (stateOfDay === "escritorio") {
        officeUntilVisibleLimit++;
      }
    }
  }

  const totalMarkedWorkdays = workFromHomeDaysFullMonth + workFromOfficeDaysFullMonth;
  const pctCasa = totalMarkedWorkdays > 0 ? ((workFromHomeDaysFullMonth / totalMarkedWorkdays) * 100).toFixed(1) : "0.0";
  const pctOffice =
    totalMarkedWorkdays > 0 ? ((workFromOfficeDaysFullMonth / totalMarkedWorkdays) * 100).toFixed(1) : "0.0";
  const targetOfficeMin = Math.ceil(totalWorkdaysInMonth * (officeGoalPercentage / 100));

  return {
    pctCasa,
    pctOffice,
    casa: casaUntilVisibleLimit,
    office: officeUntilVisibleLimit,
    ferias: vacationDaysFullMonth,
    sickDays: sickDaysFullMonth,
    holidaysInPeriod: holidaysFullMonth,
    totalWorkdays: totalWorkdaysInMonth,
    targetOfficeMin,
    officeNeeded: Math.max(0, targetOfficeMin - workFromOfficeDaysFullMonth),
  };
};

const calculateQuarterlyMetrics = (
  months: MonthPeriodData[],
  actualYear: number,
  actualMonth: number,
  today: number,
  officeGoalPercentage: number
): PeriodMetrics => {
  let workFromHomeDaysToDate = 0;
  let workFromOfficeDaysToDate = 0;
  let vacationDaysQuarter = 0;
  let sickDaysQuarter = 0;
  let holidaysQuarter = 0;
  let totalWorkdaysQuarter = 0;

  months.forEach(({ year, month, workStates }) => {
    const daysInMonth = getDaysInMonth(year, month);
    const monthPosition = compareYearMonth(year, month, actualYear, actualMonth);
    const progressLimit = monthPosition < 0 ? daysInMonth : monthPosition === 0 ? today : 0;

    for (let day = 1; day <= daysInMonth; day++) {
      const stateOfDay = workStates[day];
      const isWeekend = isWeekendDate(year, month, day);

      if (stateOfDay === "feriado") {
        holidaysQuarter++;
      }

      if (stateOfDay === "ferias") {
        vacationDaysQuarter++;
      }

      if (stateOfDay === "sickday") {
        sickDaysQuarter++;
      }

      if (!isWeekend && stateOfDay !== "feriado" && stateOfDay !== "ferias" && stateOfDay !== "sickday") {
        totalWorkdaysQuarter++;
      }

      if (
        day <= progressLimit &&
        !isWeekend &&
        stateOfDay !== "feriado" &&
        stateOfDay !== "ferias" &&
        stateOfDay !== "sickday"
      ) {
        if (stateOfDay === "casa") {
          workFromHomeDaysToDate++;
        } else if (stateOfDay === "escritorio") {
          workFromOfficeDaysToDate++;
        }
      }
    }
  });

  const totalMarkedWorkdays = workFromHomeDaysToDate + workFromOfficeDaysToDate;
  const pctCasa = totalMarkedWorkdays > 0 ? ((workFromHomeDaysToDate / totalMarkedWorkdays) * 100).toFixed(1) : "0.0";
  const pctOffice =
    totalMarkedWorkdays > 0 ? ((workFromOfficeDaysToDate / totalMarkedWorkdays) * 100).toFixed(1) : "0.0";
  const targetOfficeMin = Math.ceil(totalWorkdaysQuarter * (officeGoalPercentage / 100));
  const officeNeeded = Math.max(0, targetOfficeMin - workFromOfficeDaysToDate);

  return {
    pctCasa,
    pctOffice,
    casa: workFromHomeDaysToDate,
    office: workFromOfficeDaysToDate,
    ferias: vacationDaysQuarter,
    sickDays: sickDaysQuarter,
    holidaysInPeriod: holidaysQuarter,
    totalWorkdays: totalWorkdaysQuarter,
    targetOfficeMin,
    officeNeeded,
  };
};

export default function WorkstyleTrackerPage() {
  const [workStates, setWorkStates] = useState<WorkStates>({});
  const [currentDate, setCurrentDate] = useState<Date | null>(null);
  const [currentMonth, setCurrentMonth] = useState(0);
  const [currentYear, setCurrentYear] = useState(2000);
  const [goalMode, setGoalMode] = useState<GoalMode>("monthly");
  const [officeGoalPercentage, setOfficeGoalPercentage] = useState(DEFAULT_MONTHLY_GOAL);
  const [quarterOfficeGoalPercentage, setQuarterOfficeGoalPercentage] = useState(DEFAULT_QUARTERLY_GOAL);
  const [quarterStartMonth, setQuarterStartMonth] = useState(DEFAULT_QUARTER_START_MONTH);
  const [isInitialLoadComplete, setIsInitialLoadComplete] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const now = new Date();
    const initialMonth = now.getMonth();
    const initialYear = now.getFullYear();

    setCurrentDate(now);
    setCurrentMonth(initialMonth);
    setCurrentYear(initialYear);

    if (typeof window !== "undefined") {
      try {
        const storedOfficeGoal = localStorage.getItem(STORAGE_KEYS.monthlyGoal);
        const storedQuarterOfficeGoal = localStorage.getItem(STORAGE_KEYS.quarterlyGoal);
        const storedQuarterStartMonth = localStorage.getItem(STORAGE_KEYS.quarterStartMonth);
        const storedGoalMode = localStorage.getItem(STORAGE_KEYS.goalMode);

        setOfficeGoalPercentage(storedOfficeGoal ? parseInt(storedOfficeGoal, 10) : DEFAULT_MONTHLY_GOAL);
        setQuarterOfficeGoalPercentage(
          storedQuarterOfficeGoal ? parseInt(storedQuarterOfficeGoal, 10) : DEFAULT_QUARTERLY_GOAL
        );
        setQuarterStartMonth(
          storedQuarterStartMonth ? parseInt(storedQuarterStartMonth, 10) : DEFAULT_QUARTER_START_MONTH
        );
        setGoalMode(storedGoalMode === "quarterly" ? "quarterly" : "monthly");
      } catch (error) {
        console.error("Error loading tracker configuration from localStorage:", error);
        setOfficeGoalPercentage(DEFAULT_MONTHLY_GOAL);
        setQuarterOfficeGoalPercentage(DEFAULT_QUARTERLY_GOAL);
        setQuarterStartMonth(DEFAULT_QUARTER_START_MONTH);
        setGoalMode("monthly");
      }

      setWorkStates(loadStoredMonthWorkStates(initialYear, initialMonth));
    } else {
      setOfficeGoalPercentage(DEFAULT_MONTHLY_GOAL);
      setQuarterOfficeGoalPercentage(DEFAULT_QUARTERLY_GOAL);
      setQuarterStartMonth(DEFAULT_QUARTER_START_MONTH);
      setGoalMode("monthly");
      setWorkStates(applyDefaultHolidays(initialMonth, initialYear, {}));
    }

    setIsInitialLoadComplete(true);
  }, []);

  useEffect(() => {
    if (!isInitialLoadComplete || !currentDate || typeof window === "undefined") {
      return;
    }

    try {
      localStorage.setItem(STORAGE_KEYS.monthlyGoal, officeGoalPercentage.toString());
      localStorage.setItem(STORAGE_KEYS.quarterlyGoal, quarterOfficeGoalPercentage.toString());
      localStorage.setItem(STORAGE_KEYS.quarterStartMonth, quarterStartMonth.toString());
      localStorage.setItem(STORAGE_KEYS.goalMode, goalMode);
      localStorage.setItem(getWorkStatesStorageKey(currentYear, currentMonth), JSON.stringify(workStates));
    } catch (error) {
      console.error("Error saving to localStorage:", error);
      toast({
        title: "Erro ao guardar",
        description: "Nao foi possivel guardar as alteracoes localmente.",
        variant: "destructive",
      });
    }
  }, [
    currentDate,
    currentMonth,
    currentYear,
    goalMode,
    isInitialLoadComplete,
    officeGoalPercentage,
    quarterOfficeGoalPercentage,
    quarterStartMonth,
    toast,
    workStates,
  ]);

  const today = useMemo(() => (currentDate ? currentDate.getDate() : 0), [currentDate]);
  const actualMonth = useMemo(() => (currentDate ? currentDate.getMonth() : 0), [currentDate]);
  const actualYear = useMemo(() => (currentDate ? currentDate.getFullYear() : 0), [currentDate]);

  const daysInMonth = useMemo(() => (currentDate ? getDaysInMonth(currentYear, currentMonth) : 0), [currentDate, currentMonth, currentYear]);
  const firstDayOfMonth = useMemo(
    () => (currentDate ? new Date(currentYear, currentMonth, 1).getDay() : 0),
    [currentDate, currentMonth, currentYear]
  );

  const isWeekend = useCallback((day: number) => isWeekendDate(currentYear, currentMonth, day), [currentMonth, currentYear]);

  const countMonthlySickDays = useCallback((states: WorkStates) => {
    return Object.values(states).filter((state) => state === "sickday").length;
  }, []);

  const handleSetWorkState = useCallback(
    (day: number, state?: WorkState) => {
      const key = `${day}`;
      const currentState = workStates[key];

      if (state === "sickday" && currentState !== "sickday") {
        const sickDaysInMonth = countMonthlySickDays(workStates);
        if (sickDaysInMonth >= 1) {
          toast({
            title: "Limite de sick day atingido",
            description: "So pode marcar um sick day por mes.",
            variant: "destructive",
          });
          return;
        }
      }

      setWorkStates((previousStates: WorkStates) => {
        const nextStates = { ...previousStates };
        if (state) {
          nextStates[key] = state;
        } else {
          delete nextStates[key];
        }

        return nextStates;
      });
    },
    [countMonthlySickDays, toast, workStates]
  );

  const navigateMonth = useCallback(
    (direction: "prev" | "next") => {
      setCurrentMonth((previousMonth: number) => {
        let nextMonth = previousMonth;
        let nextYear = currentYear;

        if (direction === "prev") {
          nextMonth = previousMonth === 0 ? 11 : previousMonth - 1;
          if (previousMonth === 0) {
            nextYear -= 1;
          }
        } else {
          nextMonth = previousMonth === 11 ? 0 : previousMonth + 1;
          if (previousMonth === 11) {
            nextYear += 1;
          }
        }

        setCurrentYear(nextYear);
        setWorkStates(loadStoredMonthWorkStates(nextYear, nextMonth));

        return nextMonth;
      });
    },
    [currentYear]
  );

  const handleResetData = useCallback(() => {
    if (!currentDate) {
      return;
    }

    const confirmReset = window.confirm(
      "Tem a certeza que quer limpar todos os dados guardados desta aplicacao e redefinir metas e marcacoes?"
    );

    if (!confirmReset || typeof window === "undefined") {
      return;
    }

    try {
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith("workTracker_workStates_") || Object.values(STORAGE_KEYS).includes(key)) {
          localStorage.removeItem(key);
        }
      });

      setWorkStates(applyDefaultHolidays(currentMonth, currentYear, {}));
      setGoalMode("monthly");
      setOfficeGoalPercentage(DEFAULT_MONTHLY_GOAL);
      setQuarterOfficeGoalPercentage(DEFAULT_QUARTERLY_GOAL);
      setQuarterStartMonth(DEFAULT_QUARTER_START_MONTH);

      toast({
        title: "Dados redefinidos",
        description: "Todas as marcacoes e metas foram limpas.",
      });
    } catch (error) {
      console.error("Error resetting data from localStorage:", error);
      toast({
        title: "Erro ao redefinir",
        description: "Nao foi possivel limpar os dados. Tente novamente.",
        variant: "destructive",
      });
    }
  }, [currentDate, currentMonth, currentYear, toast]);

  const monthlyMetrics = useMemo<PeriodMetrics>(() => {
    if (!currentDate) {
      return {
        pctCasa: "0.0",
        pctOffice: "0.0",
        casa: 0,
        office: 0,
        ferias: 0,
        sickDays: 0,
        holidaysInPeriod: 0,
        totalWorkdays: 0,
        targetOfficeMin: 0,
        officeNeeded: 0,
      };
    }

    return calculateMonthlyMetrics(workStates, currentYear, currentMonth, actualYear, actualMonth, today, officeGoalPercentage);
  }, [actualMonth, actualYear, currentDate, currentMonth, currentYear, officeGoalPercentage, today, workStates]);

  const quarterlyMetrics = useMemo<PeriodMetrics>(() => {
    if (!currentDate) {
      return {
        pctCasa: "0.0",
        pctOffice: "0.0",
        casa: 0,
        office: 0,
        ferias: 0,
        sickDays: 0,
        holidaysInPeriod: 0,
        totalWorkdays: 0,
        targetOfficeMin: 0,
        officeNeeded: 0,
      };
    }

    const quarterMonths = getQuarterMonths(currentYear, currentMonth, quarterStartMonth);
    const periodData = quarterMonths.map(({ year, month }) => ({
      year,
      month,
      workStates: year === currentYear && month === currentMonth ? workStates : loadStoredMonthWorkStates(year, month),
    }));

    return calculateQuarterlyMetrics(periodData, actualYear, actualMonth, today, quarterOfficeGoalPercentage);
  }, [
    actualMonth,
    actualYear,
    currentDate,
    currentMonth,
    currentYear,
    quarterOfficeGoalPercentage,
    quarterStartMonth,
    today,
    workStates,
  ]);

  const activeMetrics = goalMode === "monthly" ? monthlyMetrics : quarterlyMetrics;
  const activeGoalPercentage = goalMode === "monthly" ? officeGoalPercentage : quarterOfficeGoalPercentage;

  if (!currentDate || !isInitialLoadComplete) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p>Loading...</p>
      </div>
    );
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

        <Card className="mb-6 shadow-lg">
          <CardHeader>
            <CardTitle className="font-headline text-lg">Modo de Objetivo</CardTitle>
            <CardDescription>Escolha se quer acompanhar as metas do mes ou do trimestre.</CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup
              value={goalMode}
              onValueChange={(value: string) => setGoalMode(value as GoalMode)}
              className="grid gap-4 md:grid-cols-2"
            >
              <Label
                htmlFor="goal-mode-monthly"
                className="flex cursor-pointer items-center gap-3 rounded-lg border p-4 transition-colors hover:bg-muted/40"
              >
                <RadioGroupItem id="goal-mode-monthly" value="monthly" />
                <div>
                  <div className="font-medium">Meta Mensal</div>
                  <div className="text-sm text-muted-foreground">Usa o objetivo atual do mes visivel.</div>
                </div>
              </Label>
              <Label
                htmlFor="goal-mode-quarterly"
                className="flex cursor-pointer items-center gap-3 rounded-lg border p-4 transition-colors hover:bg-muted/40"
              >
                <RadioGroupItem id="goal-mode-quarterly" value="quarterly" />
                <div>
                  <div className="font-medium">Meta Trimestral</div>
                  <div className="text-sm text-muted-foreground">Usa um ciclo recorrente de 3 meses.</div>
                </div>
              </Label>
            </RadioGroup>
          </CardContent>
        </Card>

        <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-2">
          <OfficeGoalInput
            officeGoalPercentage={officeGoalPercentage}
            onOfficeGoalChange={setOfficeGoalPercentage}
            disabled={goalMode !== "monthly"}
          />
          <QuarterGoalInput
            monthNames={monthNames}
            quarterOfficeGoalPercentage={quarterOfficeGoalPercentage}
            quarterStartMonth={quarterStartMonth}
            onQuarterGoalChange={setQuarterOfficeGoalPercentage}
            onQuarterStartMonthChange={setQuarterStartMonth}
            disabled={goalMode !== "quarterly"}
          />
        </div>

        <LegendDisplay />

        <div className="mb-6 flex justify-end">
          <Button variant="outline" onClick={handleResetData} className="shadow-md transition-shadow hover:shadow-lg">
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

        <StatsDashboard goalMode={goalMode} monthlyMetrics={monthlyMetrics} quarterlyMetrics={quarterlyMetrics} />

        <AlertMessage
          goalMode={goalMode}
          pctCasa={activeMetrics.pctCasa}
          officeNeededForPolicy={activeMetrics.officeNeeded}
          officeGoalPercentage={activeGoalPercentage}
        />
      </div>
    </div>
  );
}
