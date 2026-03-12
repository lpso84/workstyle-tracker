"use client";

import React from "react";
import { Bandage, Briefcase, Calendar, Home, List, MapPin, Palmtree, PartyPopper } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const LegendDisplay: React.FC = () => {
  const items = [
    { label: "Casa", icon: Home, className: "bg-green-500 text-white hover:bg-green-600 border-green-700" },
    { label: "Escritorio", icon: Briefcase, className: "bg-blue-500 text-white hover:bg-blue-600 border-blue-700" },
    { label: "Ferias", icon: Palmtree, className: "bg-yellow-500 text-white hover:bg-yellow-600 border-yellow-700" },
    { label: "Sick Day", icon: Bandage, className: "bg-rose-500 text-white hover:bg-rose-600 border-rose-700" },
    { label: "Feriado", icon: PartyPopper, className: "bg-orange-500 text-white hover:bg-orange-600 border-orange-700" },
    { label: "Fim de Semana", icon: Calendar, className: "border-gray-400 text-muted-foreground" },
    { label: "Hoje", icon: MapPin, className: "border-2 border-primary text-primary" },
  ];

  return (
    <Card className="mb-6 shadow-lg">
      <CardHeader>
        <CardTitle className="font-headline flex items-center text-lg">
          <List className="mr-2 h-5 w-5 text-primary" />
          Legenda
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2 text-xs">
          {items.map(({ label, icon: Icon, className }) => (
            <Badge key={label} variant="outline" className={className}>
              <Icon className="mr-1.5 h-3.5 w-3.5" />
              {label}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default LegendDisplay;
