"use client";
import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { List } from 'lucide-react';

const LegendDisplay: React.FC = () => {
  return (
    <Card className="mb-6 shadow-lg">
      <CardHeader>
        <CardTitle className="font-headline text-lg flex items-center"><List className="mr-2 h-5 w-5 text-primary"/>Legenda</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2 text-xs">
          <Badge className="bg-green-500 hover:bg-green-600 text-white border-green-700">🏠 Casa</Badge>
          <Badge className="bg-blue-500 hover:bg-blue-600 text-white border-blue-700">🏢 Escritório</Badge>
          <Badge className="bg-yellow-500 hover:bg-yellow-600 text-white border-yellow-700">🏖️ Férias</Badge>
          <Badge variant="destructive" className="border-red-700">🚫 Feriado</Badge>
          <Badge variant="secondary" className="text-muted-foreground border-gray-400">🗓️ Fim de Semana</Badge>
          <Badge variant="outline" className="border-primary border-2 text-primary">📍 Hoje</Badge>
        </div>
      </CardContent>
    </Card>
  );
};

export default LegendDisplay;
