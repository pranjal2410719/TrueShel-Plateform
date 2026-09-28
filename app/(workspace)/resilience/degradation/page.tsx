"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function ResilienceDegradationPage() {
  return (
    <div className="space-y-6 w-full min-w-0">
      <div className="flex items-center gap-3">
        <Link href="/resilience">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-ink">
              20-Year Envelope Performance Degradation
            </h1>
            <Badge variant="violet">LIFECYCLE AGING</Badge>
          </div>
          <p className="text-xs text-slate-muted">Simulation of insulation settlement, moisture intrusion, and seal air-tightness leakage over two decades.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <CardHeader className="p-0 pb-3">
            <CardTitle className="text-sm">Year 0 (As-Built)</CardTitle>
          </CardHeader>
          <CardContent className="p-0 pt-2 text-xs space-y-1">
            <p className="text-2xl font-bold text-slate-ink">19.5 h</p>
            <p className="text-slate-muted">81.3% comfort hours • Overall U = 0.44 W/m²·K • 0.60 ACH</p>
          </CardContent>
        </Card>

        <Card className="p-6">
          <CardHeader className="p-0 pb-3">
            <CardTitle className="text-sm">Year 10 (Mid-Life)</CardTitle>
          </CardHeader>
          <CardContent className="p-0 pt-2 text-xs space-y-1">
            <p className="text-2xl font-bold text-slate-ink">18.2 h</p>
            <p className="text-slate-muted">75.8% comfort hours • Straw settlement +5% k • 0.72 ACH</p>
          </CardContent>
        </Card>

        <Card className="p-6">
          <CardHeader className="p-0 pb-3">
            <CardTitle className="text-sm">Year 20 (Aged State)</CardTitle>
          </CardHeader>
          <CardContent className="p-0 pt-2 text-xs space-y-1">
            <p className="text-2xl font-bold text-slate-ink">17.1 h</p>
            <p className="text-slate-muted">71.2% comfort hours • Routine lime re-plastering restores 92% of baseline.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
