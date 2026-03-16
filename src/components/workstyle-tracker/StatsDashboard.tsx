"use client";

import React from "react";
import { BarChart3, Briefcase, CalendarOff, Percent } from "lucide-react";
import StatCard from "./StatCard";
import type { GoalMode, PeriodMetrics } from "@/app/page";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface StatsDashboardProps {
  goalMode: GoalMode;
  monthlyMetrics: PeriodMetrics;
  quarterlyMetrics: PeriodMetrics;
}

const StatsDashboard: React.FC<StatsDashboardProps> = ({ goalMode, monthlyMetrics, quarterlyMetrics }) => {
  const metrics = goalMode === "monthly" ? monthlyMetrics : quarterlyMetrics;
  const periodLabel = goalMode === "monthly" ? "Mes" : "Trimestre";
  const progressLabel = goalMode === "monthly" ? "ate hoje" : "ate a data";

  return (
    <Card className="mb-6 bg-gradient-to-br from-primary via-indigo-700 to-purple-700 text-white shadow-xl">
      <CardHeader>
        <CardTitle className="font-headline flex items-center text-xl text-white">
          <BarChart3 className="mr-2 h-5 w-5" />
          Estatisticas do {periodLabel}
        </CardTitle>
        <CardDescription className="text-indigo-200">Resumo da atividade e da meta ativa.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="mb-2 flex items-center text-md font-semibold text-indigo-100">
            <CalendarOff className="mr-2 h-4 w-4 opacity-80" />
            Ausencias Programadas ({periodLabel} Completo)
          </h3>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <StatCard label={`Feriados no ${periodLabel}`} value={metrics.holidaysInPeriod} />
            <StatCard label={`Ferias no ${periodLabel}`} value={metrics.ferias} />
            <StatCard label={`Sick Days no ${periodLabel}`} value={metrics.sickDays} />
          </div>
        </div>

        <div>
          <h3 className="mb-2 flex items-center text-md font-semibold text-indigo-100">
            <Briefcase className="mr-2 h-4 w-4 opacity-80" />
            Contagem de Dias
          </h3>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <StatCard label={`Dias Casa (${progressLabel})`} value={metrics.casa} />
            <StatCard label={`Dias Escritorio (${progressLabel})`} value={metrics.office} />
            <StatCard label={`Dias Uteis no ${periodLabel}`} value={metrics.totalWorkdays} />
            <StatCard label="Meta Escritorio (dias)" value={metrics.targetOfficeMin} />
            <StatCard label="Escritorio Necessarios" value={metrics.officeNeeded} highlight />
          </div>
        </div>

        <div>
          <h3 className="mb-2 flex items-center text-md font-semibold text-indigo-100">
            <Percent className="mr-2 h-4 w-4 opacity-80" />
            Percentagens (Dias Marcados no {periodLabel})
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <StatCard label="% Casa" value={`${metrics.pctCasa}%`} />
            <StatCard label="% Escritorio" value={`${metrics.pctOffice}%`} />
          </div>
        </div>

        {goalMode === "quarterly" && metrics.weeklyOfficeAvgNeeded !== undefined && (
          <div>
            <h3 className="mb-2 flex items-center text-md font-semibold text-indigo-100">
              <Briefcase className="mr-2 h-4 w-4 opacity-80" />
              Ritmo Necessario
            </h3>
            <div className="grid grid-cols-1 gap-3">
              <StatCard label="Dias Escritorio por Semana (media para atingir meta)" value={metrics.weeklyOfficeAvgNeeded} highlight />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default StatsDashboard;
