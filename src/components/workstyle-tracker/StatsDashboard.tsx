"use client";
import React from 'react';
import StatCard from './StatCard';
import type { Metrics } from '@/app/page'; // Assuming Metrics type is exported
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3 } from 'lucide-react';

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
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          <StatCard label="% Casa (até hoje)" value={`${metrics.pctCasa}%`} />
          <StatCard label="% Escritório (até hoje)" value={`${metrics.pctOffice}%`} />
          <StatCard label="Dias Casa (até hoje)" value={metrics.casa} />
          <StatCard label="Dias Escritório (até hoje)" value={metrics.office} />
          <StatCard label="Férias (até hoje)" value={metrics.ferias} />
          <StatCard label="Feriados no Mês" value={metrics.holidaysInMonth} />
          <StatCard label="Dias Úteis no Mês" value={metrics.totalWorkdays} />
          <StatCard label="Escritório (Meta Mês)" value={metrics.targetOfficeMin} />
          <StatCard label="Escritório Necessários" value={metrics.officeNeeded} highlight />
        </div>
      </CardContent>
    </Card>
  );
};

export default StatsDashboard;
