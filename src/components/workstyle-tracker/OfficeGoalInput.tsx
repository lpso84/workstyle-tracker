"use client";
import React from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Target } from 'lucide-react';

interface OfficeGoalInputProps {
  officeGoalPercentage: number;
  onOfficeGoalChange: (value: number) => void;
}

const OfficeGoalInput: React.FC<OfficeGoalInputProps> = ({ officeGoalPercentage, onOfficeGoalChange }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value)) {
      onOfficeGoalChange(Math.max(0, Math.min(100, value)));
    } else if (e.target.value === "") {
      onOfficeGoalChange(0); // Or handle as you prefer for empty input
    }
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="font-headline text-lg flex items-center"><Target className="mr-2 h-5 w-5 text-primary" />Meta de Escritório</CardTitle>
        <CardDescription>Defina a percentagem mínima de dias no escritório.</CardDescription>
      </CardHeader>
      <CardContent>
        <Label htmlFor="office-goal-input" className="sr-only">Meta de dias no escritório (%):</Label>
        <div className="flex items-center gap-2">
          <Input
            id="office-goal-input"
            type="number"
            value={officeGoalPercentage}
            onChange={handleChange}
            min="0"
            max="100"
            className="w-24 text-sm"
          />
          <span className="text-sm font-medium">%</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default OfficeGoalInput;
