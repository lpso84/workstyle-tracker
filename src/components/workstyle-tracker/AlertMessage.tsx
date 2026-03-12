"use client";

import React from "react";
import { CheckCircle2, TriangleAlert } from "lucide-react";
import type { GoalMode } from "@/app/page";
import { cn } from "@/lib/utils";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface AlertMessageProps {
  goalMode: GoalMode;
  pctCasa: string;
  officeNeededForPolicy: number;
  officeGoalPercentage: number;
}

const AlertMessage: React.FC<AlertMessageProps> = ({
  goalMode,
  pctCasa,
  officeNeededForPolicy,
  officeGoalPercentage,
}) => {
  const currentPctCasa = parseFloat(pctCasa);
  const wfhLimit = Math.max(0, 100 - officeGoalPercentage);
  const isOverWfhThreshold = currentPctCasa > wfhLimit;
  const periodLabel = goalMode === "monthly" ? "este mes" : "este trimestre";

  const Icon = isOverWfhThreshold ? TriangleAlert : CheckCircle2;
  const title = isOverWfhThreshold ? "Atencao ao limite de trabalho remoto" : "Gestao de trabalho remoto em dia";
  const description = isOverWfhThreshold
    ? `Esta com ${pctCasa}% de trabalho em casa, acima do limite de ${wfhLimit}%. Para cumprir a politica de ${officeGoalPercentage}% de presenca no escritorio, ainda precisa de ${officeNeededForPolicy} dia(s) de escritorio ${periodLabel}.`
    : `Atualmente esta com ${pctCasa}% de trabalho em casa, dentro do limite de ${wfhLimit}%. Para cumprir a politica de ${officeGoalPercentage}% de presenca no escritorio, precisa de ${officeNeededForPolicy} dia(s) de escritorio ${periodLabel}.`;

  return (
    <Alert variant={isOverWfhThreshold ? "destructive" : "default"} className={cn("mb-6 shadow-md", !isOverWfhThreshold && "bg-accent border-primary/30")}>
      <Icon className="h-5 w-5" />
      <AlertTitle className="font-headline">{title}</AlertTitle>
      <AlertDescription>{description}</AlertDescription>
    </Alert>
  );
};

export default AlertMessage;
