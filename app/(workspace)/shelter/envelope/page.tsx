"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function ShelterEnvelopePage() {
  return (
    <div className="space-y-6 w-full min-w-0">
      <div className="flex items-center gap-3">
        <Link href="/shelter">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-ink">
              Envelope & Layer Stacks
            </h1>
            <Badge variant="violet">ISO 6946</Badge>
          </div>
          <p className="text-xs text-slate-muted">Exterior to interior multi-layer thermal resistance and U-value schedules.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <CardHeader className="p-0 pb-3">
            <div className="flex justify-between items-center">
              <CardTitle className="text-base">Wall Assembly</CardTitle>
              <Badge variant="violet">U = 0.41 W/m²·K</Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0 pt-2 space-y-2 text-xs">
            <div className="p-3 rounded-inner bg-canvas border border-border-subtle flex justify-between">
              <span>Exterior Lime Render (20mm)</span>
              <span className="text-slate-muted">R-0.03</span>
            </div>
            <div className="p-3 rounded-inner bg-canvas border border-border-subtle flex justify-between">
              <span>Straw-Clay Compressed Insulation (120mm)</span>
              <span className="text-slate-muted">R-1.50</span>
            </div>
            <div className="p-3 rounded-inner bg-canvas border border-border-subtle flex justify-between">
              <span>Rammed Earth High-Thermal-Mass Core (300mm)</span>
              <span className="text-slate-muted">R-0.27</span>
            </div>
            <div className="p-3 rounded-inner bg-canvas border border-border-subtle flex justify-between">
              <span>Interior Mud & Chopped Straw Render (15mm)</span>
              <span className="text-slate-muted">R-0.02</span>
            </div>
          </CardContent>
        </Card>

        <Card className="p-6">
          <CardHeader className="p-0 pb-3">
            <div className="flex justify-between items-center">
              <CardTitle className="text-base">Roof Assembly</CardTitle>
              <Badge variant="violet">U = 0.26 W/m²·K</Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0 pt-2 space-y-2 text-xs">
            <div className="p-3 rounded-inner bg-canvas border border-border-subtle flex justify-between">
              <span>Corrugated Weather Membrane (5mm)</span>
              <span className="text-slate-muted">R-0.01</span>
            </div>
            <div className="p-3 rounded-inner bg-canvas border border-border-subtle flex justify-between">
              <span>High-Density Straw Bales (200mm)</span>
              <span className="text-slate-muted">R-3.33</span>
            </div>
            <div className="p-3 rounded-inner bg-canvas border border-border-subtle flex justify-between">
              <span>Poplar Timber Rafters & Decking (25mm)</span>
              <span className="text-slate-muted">R-0.19</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
