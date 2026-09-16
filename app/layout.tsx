import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "RindeGastos - Gestión de Gastos y Rendiciones",
  description: "Sistema de rendición de gastos, movilidad y caja chica",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="antialiased min-h-screen bg-slate-50 text-slate-900">
        {children}
      </body>
    </html>
  );
}
