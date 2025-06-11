"use client";
import React from 'react';
import { cn } from "@/lib/utils";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { TriangleAlert, CheckCircle2 } from 'lucide-react';

interface AlertMessageProps {
  pctCasa: string;
  officeNeededForPolicy: number; // For the 40% office goal
  wfhLimit: number; // e.g., 60%
}

const AlertMessage: React.FC<AlertMessageProps> = ({ pctCasa, officeNeededForPolicy, wfhLimit }) => {
  const currentPctCasa = parseFloat(pctCasa);
  const isOverWfhThreshold = currentPctCasa > wfhLimit;

  // Determine the message based on the 60% WFH limit.
  // The officeNeededForPolicy is for the 40% office attendance.
  
  let title, description, variant: "default" | "destructive", Icon;

  if (isOverWfhThreshold) {
    title = "Atenção ao Limite de Trabalho Remoto!";
    description = `Está com ${pctCasa}% de trabalho em casa, excedendo o limite de ${wfhLimit}%. Para cumprir a política de 40% de presença no escritório, ainda precisa de ${officeNeededForPolicy} dia(s) no escritório este mês.`;
    variant = "destructive";
    Icon = TriangleAlert;
  } else {
    title = "Gestão de Trabalho Remoto em Dia!";
    description = `Atualmente com ${pctCasa}% de trabalho em casa, está dentro do limite de ${wfhLimit}%. Para cumprir a política de 40% de presença no escritório, precisa de ${officeNeededForPolicy} dia(s) no escritório este mês.`;
    variant = "default"; // Using default which often has a less alarming color like primary or accent.
    Icon = CheckCircle2;
  }

  return (
    <Alert variant={variant} className={cn("mb-6 shadow-md", variant === "default" ? "bg-accent border-primary/30" : "")}>
      <Icon className="h-5 w-5" />
      <AlertTitle className="font-headline">{title}</AlertTitle>
      <AlertDescription>
        {description}
      </AlertDescription>
    </Alert>
  );
};

export default AlertMessage;
