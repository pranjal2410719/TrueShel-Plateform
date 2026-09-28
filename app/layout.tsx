import type { Metadata, Viewport } from "next";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: "TRUESHEL V2 — Climate-to-Shelter Thermal Engineering",
  description:
    "Engineering-grade climate-to-shelter thermal simulation and passive architecture application for high-altitude sub-zero climates.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased bg-canvas text-slate-ink min-h-screen overflow-x-hidden">
        {children}
      </body>
    </html>
  );
}
