"use client";
import React from 'react';
import type { AttendanceAdvisorRecommendationsOutput } from '@/ai/flows/attendance-advisor';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Lightbulb } from 'lucide-react';

interface AttendanceAdvisorProps {
  recommendations: AttendanceAdvisorRecommendationsOutput | null;
  isLoading: boolean;
}

const AttendanceAdvisor: React.FC<AttendanceAdvisorProps> = ({ recommendations, isLoading }) => {
  if (isLoading) {
    return (
      <Card className="mb-6 bg-accent/30 border-primary/20 shadow-lg animate-pulse">
        <CardHeader>
          <CardTitle className="font-headline text-lg flex items-center">
            <Lightbulb className="mr-2 h-5 w-5 text-primary" /> Consultor de Assiduidade IA
          </CardTitle>
          <CardDescription>A calcular as melhores sugestões para si...</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </CardContent>
      </Card>
    );
  }

  if (!recommendations) return null;

  return (
    <Card className="mb-6 bg-accent/50 border-primary/30 shadow-lg">
      <CardHeader>
        <CardTitle className="font-headline text-lg flex items-center">
          <Lightbulb className="mr-2 h-5 w-5 text-primary" /> Consultor de Assiduidade IA
        </CardTitle>
        <CardDescription>Sugestões personalizadas para otimizar a sua presença no escritório.</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm mb-2 text-foreground">
          <strong>Dias Adicionais no Escritório Necessários:</strong> 
          <span className="font-bold text-primary ml-1">{recommendations.officeDaysNeeded}</span>
        </p>
        <p className="text-sm text-muted-foreground">
          <strong>Raciocínio da IA:</strong> {recommendations.recommendationReasoning}
        </p>
      </CardContent>
    </Card>
  );
};

export default AttendanceAdvisor;
