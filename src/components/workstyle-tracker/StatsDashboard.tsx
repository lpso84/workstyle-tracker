
"use client";
import React from 'react';
import StatCard from './StatCard';
import type { Metrics } from '@/app/page';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, CalendarOff, Briefcase, Percent } from 'lucide-react';

interface StatsDashboardProps {
  metrics: Metrics;
}

const StatsDashboard: React.FC<StatsDashboardProps> = ({ metrics }) => {
  return (
    <Card className="mb-6 bg-gradient-to-br from-primary via-indigo-700 to-purple-700 text-white shadow-xl">
      <CardHeader>
        <CardTitle className="font-headline text-xl text-white flex items-center"><BarChart3 className="mr-2 h-5 w-5"/>Estatísticas do Mês</CardTitle>
        <CardDescription className="text-indigo-200">Resumo da sua atividade e metas.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="text-md font-semibold text-indigo-100 mb-2 flex items-center">
            <CalendarOff className="mr-2 h-4 w-4 opacity-80" />
            Ausências Programadas (Mês Completo)
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <StatCard label="Feriados no Mês" value={metrics.holidaysInMonth} />
            <StatCard label="Férias Marcadas no Mês" value={metrics.ferias} />
          </div>
        </div>

        <div>
          <h3 className="text-md font-semibold text-indigo-100 mb-2 flex items-center">
            <Briefcase className="mr-2 h-4 w-4 opacity-80" />
            Contagem de Dias
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <StatCard label="Dias Casa (até hoje)" value={metrics.casa} />
            <StatCard label="Dias Escritório (até hoje)" value={metrics.office} />
            <StatCard label="Dias Úteis no Mês" value={metrics.totalWorkdays} />
            <StatCard label="Meta Escritório (dias)" value={metrics.targetOfficeMin} />
            <StatCard label="Escritório Necessários" value={metrics.officeNeeded} highlight />
          </div>
        </div>

        <div>
          <h3 className="text-md font-semibold text-indigo-100 mb-2 flex items-center">
            <Percent className="mr-2 h-4 w-4 opacity-80" />
            Percentagens (Dias Marcados no Mês)
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <StatCard label="% Casa" value={`${metrics.pctCasa}%`} />
            <StatCard label="% Escritório" value={`${metrics.pctOffice}%`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StatsDashboard;
