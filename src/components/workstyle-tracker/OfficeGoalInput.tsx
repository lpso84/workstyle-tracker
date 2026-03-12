"use client";

import React from "react";
import { Target } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface OfficeGoalInputProps {
  officeGoalPercentage: number;
  onOfficeGoalChange: (value: number) => void;
  disabled?: boolean;
}

const OfficeGoalInput: React.FC<OfficeGoalInputProps> = ({
  officeGoalPercentage,
  onOfficeGoalChange,
  disabled = false,
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) {
      return;
    }

    const value = parseInt(e.target.value, 10);
    if (!isNaN(value)) {
      onOfficeGoalChange(Math.max(0, Math.min(100, value)));
    } else if (e.target.value === "") {
      onOfficeGoalChange(0);
    }
  };

  return (
    <Card className={cn("shadow-lg transition-opacity", disabled && "opacity-60")}>
      <CardHeader>
        <CardTitle className="font-headline flex items-center text-lg">
          <Target className="mr-2 h-5 w-5 text-primary" />
          Meta de Escritorio Mensal
        </CardTitle>
        <CardDescription>
          {disabled
            ? "Este bloco fica inativo enquanto a meta trimestral estiver ativa."
            : "Defina a percentagem minima de dias no escritorio para este mes."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Label htmlFor="office-goal-input" className="sr-only">
          Meta de dias no escritorio (%)
        </Label>
        <div className="flex items-center gap-2">
          <Input
            id="office-goal-input"
            type="number"
            value={officeGoalPercentage}
            onChange={handleChange}
            min="0"
            max="100"
            className="w-24 text-sm"
            disabled={disabled}
          />
          <span className="text-sm font-medium">%</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default OfficeGoalInput;
