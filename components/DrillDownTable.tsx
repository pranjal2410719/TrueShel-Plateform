"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Column {
  key: string;
  label: string;
  unit?: string;
}

interface DrillDownTableProps {
  title: string;
  columns: Column[];
  data: Record<string, string | number>[];
}

export function DrillDownTable({ title, columns, data }: DrillDownTableProps) {
  return (
    <Card className="p-0 overflow-hidden">
      <div className="p-6 pb-4">
        <CardTitle className="text-base">{title}</CardTitle>
      </div>
      <div className="w-full overflow-x-auto">
        <table className="w-full min-w-[600px] border-collapse text-xs">
          <thead>
            <tr className="border-y border-border-subtle bg-canvas text-slate-muted">
              {columns.map((col) => (
                <th key={col.key} className="py-3 px-4 text-left font-semibold">
                  {col.label}
                  {col.unit && <span className="ml-1 text-[10px] font-normal">({col.unit})</span>}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle">
            {data.map((row, idx) => (
              <tr key={idx} className="hover:bg-canvas/50 transition-colors">
                {columns.map((col) => (
                  <td key={col.key} className="py-2.5 px-4 text-slate-ink">
                    {row[col.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
