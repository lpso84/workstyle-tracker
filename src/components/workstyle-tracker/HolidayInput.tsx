"use client";
import React from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarDays } from 'lucide-react';

interface HolidayInputProps {
  holidays: string;
  onHolidaysChange: (value: string) => void;
}

const HolidayInput: React.FC<HolidayInputProps> = ({ holidays, onHolidaysChange }) => {
  return (
    <Card className="col-span-1 md:col-span-2 shadow-lg">
      <CardHeader>
        <CardTitle className="font-headline text-lg flex items-center"><CalendarDays className="mr-2 h-5 w-5 text-primary" />Configurar Feriados</CardTitle>
        <CardDescription>Insira os dias de feriado do mês atual, separados por vírgula (ex: 1,15,25).</CardDescription>
      </CardHeader>
      <CardContent>
        <Label htmlFor="holidays-input" className="sr-only">Feriados (datas):</Label>
        <Input
          id="holidays-input"
          type="text"
          value={holidays}
          onChange={e => onHolidaysChange(e.target.value)}
          placeholder="Ex: 1,8,25"
          className="text-sm"
        />
      </CardContent>
    </Card>
  );
};

export default HolidayInput;
