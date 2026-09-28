"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface FormulaCardProps {
  title: string;
  formula: string;
  result: string;
  variables: Record<string, string>;
}

export function FormulaCard({ title, formula, result, variables }: FormulaCardProps) {
  return (
    <Card className="p-5">
      <CardHeader className="p-0 pb-3">
        <CardTitle className="text-sm font-semibold text-slate-ink">{title}</CardTitle>
      </CardHeader>
      <CardContent className="p-0 space-y-3">
        <div className="bg-warm-fog/50 rounded-inner p-3 font-mono text-xs text-slate-ink">
          {formula}
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-muted">Result</span>
          <span className="text-lg font-bold text-slate-ink">{result}</span>
        </div>
        <div className="border-t border-border-subtle pt-3">
          <p className="text-[10px] font-medium text-slate-muted uppercase tracking-wider mb-2">Variables</p>
          <div className="grid grid-cols-2 gap-1.5">
            {Object.entries(variables).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between text-xs">
                <span className="text-slate-muted">{key}</span>
                <span className="font-medium text-slate-ink">{value}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
