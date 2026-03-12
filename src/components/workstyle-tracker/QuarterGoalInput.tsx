"use client";

import React from "react";
import { Calendar, Target } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface QuarterGoalInputProps {
  monthNames: string[];
  quarterOfficeGoalPercentage: number;
  quarterStartMonth: number;
  onQuarterGoalChange: (value: number) => void;
  onQuarterStartMonthChange: (value: number) => void;
  disabled?: boolean;
}

const QuarterGoalInput: React.FC<QuarterGoalInputProps> = ({
  monthNames,
  quarterOfficeGoalPercentage,
  quarterStartMonth,
  onQuarterGoalChange,
  onQuarterStartMonthChange,
  disabled = false,
}) => {
  const handleGoalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) {
      return;
    }

    const value = parseInt(e.target.value, 10);
    if (!isNaN(value)) {
      onQuarterGoalChange(Math.max(0, Math.min(100, value)));
    } else if (e.target.value === "") {
      onQuarterGoalChange(0);
    }
  };

  return (
    <Card className={cn("shadow-lg transition-opacity", disabled && "opacity-60")}>
      <CardHeader>
        <CardTitle className="font-headline flex items-center text-lg">
          <Calendar className="mr-2 h-5 w-5 text-primary" />
          Meta Trimestral
        </CardTitle>
        <CardDescription>
          {disabled
            ? "Este bloco fica inativo enquanto a meta mensal estiver ativa."
            : "Defina a percentagem minima do trimestre e o mes inicial do ciclo."}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="quarter-goal-input" className="mb-2 block text-sm font-medium">
            Percentagem minima no escritorio
          </Label>
          <div className="flex items-center gap-2">
            <Input
              id="quarter-goal-input"
              type="number"
              value={quarterOfficeGoalPercentage}
              onChange={handleGoalChange}
              min="0"
              max="100"
              className="w-24 text-sm"
              disabled={disabled}
            />
            <span className="text-sm font-medium">%</span>
          </div>
        </div>

        <div>
          <Label htmlFor="quarter-start-month" className="mb-2 block text-sm font-medium">
            Mes de inicio do trimestre
          </Label>
          <Select
            value={quarterStartMonth.toString()}
            onValueChange={(value: string) => onQuarterStartMonthChange(parseInt(value, 10))}
            disabled={disabled}
          >
            <SelectTrigger id="quarter-start-month">
              <SelectValue placeholder="Escolha o mes inicial" />
            </SelectTrigger>
            <SelectContent>
              {monthNames.map((monthName: string, index: number) => (
                <SelectItem key={monthName} value={index.toString()}>
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    <span>{monthName}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="mt-2 text-xs text-muted-foreground">
            O ciclo repete-se de 3 em 3 meses a partir deste mes em todos os anos.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default QuarterGoalInput;
