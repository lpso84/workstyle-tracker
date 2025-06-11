"use client";
import React from 'react';
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, MapPin } from "lucide-react";

interface HeaderControlsProps {
  currentMonth: number;
  currentYear: number;
  monthNames: string[];
  onNavigate: (dir: 'prev' | 'next') => void;
}

const HeaderControls: React.FC<HeaderControlsProps> = ({ currentMonth, currentYear, monthNames, onNavigate }) => {
  return (
    <div className="flex justify-center items-center mb-8 gap-4">
      <Button onClick={() => onNavigate('prev')} variant="outline" size="icon" aria-label="Mês anterior">
        <ChevronLeft className="h-6 w-6" />
      </Button>
      <h1 className="text-2xl sm:text-3xl font-headline text-primary flex items-center">
        <MapPin className="h-7 w-7 mr-2 text-accent-foreground opacity-70" /> 
        {monthNames[currentMonth]} {currentYear}
      </h1>
      <Button onClick={() => onNavigate('next')} variant="outline" size="icon" aria-label="Próximo mês">
        <ChevronRight className="h-6 w-6" />
      </Button>
    </div>
  );
};

export default HeaderControls;
