"use client";

import React from "react";
import Link from "next/link";
import { Home, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas p-6 text-center">
      <div className="space-y-5 max-w-sm">
        <AlertCircle className="w-12 h-12 text-slate-muted mx-auto" />
        <h1 className="text-2xl font-bold tracking-tight text-slate-ink">Page Not Found</h1>
        <p className="text-sm text-slate-muted">
          The page you&#39;re looking for doesn&#39;t exist or has been moved.
        </p>
        <Link href="/dashboard">
          <Button>
            <Home className="mr-2 w-4 h-4" />
            Back to Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
}
