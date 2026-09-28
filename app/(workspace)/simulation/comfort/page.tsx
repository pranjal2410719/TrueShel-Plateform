"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function SimulationComfortPage() {
  return (
    <div className="space-y-6 w-full min-w-0">
      <div className="flex items-center gap-3">
        <Link href="/simulation/results">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-ink">
              Thermal Comfort & Human Factors
            </h1>
            <Badge variant="comfort">ASHRAE 55</Badge>
          </div>
          <p className="text-xs text-slate-muted">Predicted Mean Vote (PMV), Predicted Percentage Dissatisfied (PPD), and comfort hours.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <CardHeader className="p-0 pb-3">
            <CardTitle className="text-sm">Adaptive Comfort Compliance</CardTitle>
          </CardHeader>
          <CardContent className="p-0 pt-2 text-xs space-y-1">
            <p className="text-2xl font-bold text-slate-ink">81.3%</p>
            <p className="text-slate-muted">19.5 of 24 diurnal hours inside 18°C – 26°C.</p>
          </CardContent>
        </Card>

        <Card className="p-6">
          <CardHeader className="p-0 pb-3">
            <CardTitle className="text-sm">Mean PMV Index</CardTitle>
          </CardHeader>
          <CardContent className="p-0 pt-2 text-xs space-y-1">
            <p className="text-2xl font-bold text-slate-ink">-0.32</p>
            <p className="text-slate-muted">Slightly cool neutral (Within ISO 7730 Class B: -0.5 to +0.5).</p>
          </CardContent>
        </Card>

        <Card className="p-6">
          <CardHeader className="p-0 pb-3">
            <CardTitle className="text-sm">Mean PPD (Dissatisfaction)</CardTitle>
          </CardHeader>
          <CardContent className="p-0 pt-2 text-xs space-y-1">
            <p className="text-2xl font-bold text-slate-ink">7.4%</p>
            <p className="text-slate-muted">Excellent performance for an unheated passive shelter in sub-zero alpine winter.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
