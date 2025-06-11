"use client";
import React from 'react';
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string | number;
  highlight?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, highlight = false }) => {
  return (
    <div
      className={cn(
        "flex-shrink-0 text-center p-3 rounded-lg bg-white/10 backdrop-blur-sm transition-all duration-150 hover:bg-white/20",
        highlight ? 'border-2 border-white shadow-lg scale-105' : 'border border-white/20',
        "min-w-[100px] md:min-w-[120px]"
      )}
    >
      <div className="text-xl md:text-2xl font-bold">{value}</div>
      <div className="text-[10px] md:text-xs opacity-80 mt-0.5">{label}</div>
    </div>
  );
};

export default StatCard;
