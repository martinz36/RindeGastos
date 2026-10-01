"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Wallet, ShieldCheck, Car, FileSpreadsheet, User, ArrowRightLeft } from "lucide-react";

interface NavbarProps {
  currentUserId?: string;
  users?: Array<{ id: string; nombre: string; email: string; rol: string; saldo?: number }>;
}

export default function Navbar({ currentUserId, users = [] }: NavbarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleUserChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newUserId = e.target.value;
    if (newUserId) {
      if (pathname.includes("/dashboard/worker")) {
        router.push(`/dashboard/worker?userId=${newUserId}`);
      } else {
        router.push(`/gastos?userId=${newUserId}`);
      }
    }
  };

  const navLinks = [
    { href: "/dashboard/worker", label: "Vista Trabajador", icon: Wallet },
    { href: "/gastos", label: "Aprobaciones Admin", icon: ShieldCheck },
    { href: "/reportes", label: "Planilla & Contabilidad", icon: FileSpreadsheet },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200/80">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Logo / Nombre */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-500 flex items-center justify-center text-white shadow-md shadow-indigo-100 group-hover:scale-105 transition-transform">
            <Wallet className="w-5 h-5" />
          </div>
          <div>
            <span className="font-extrabold text-slate-900 tracking-tight text-lg">RindeGastos</span>
            <span className="text-[10px] block font-bold text-indigo-600 uppercase tracking-widest -mt-1">
              Empresarial 🇵🇪
            </span>
          </div>
        </Link>

        {/* Links principales */}
        <nav className="hidden md:flex items-center gap-1.5 p-1 bg-slate-100/80 rounded-xl">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  isActive
                    ? "bg-white text-indigo-700 shadow-xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Selector de Usuario / Rol activo */}
        <div className="flex items-center gap-2.5">
          {users.length > 0 && (
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1 text-xs">
              <User className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={currentUserId || ""}
                onChange={handleUserChange}
                className="bg-transparent font-semibold text-slate-700 focus:outline-hidden cursor-pointer"
                title="Cambiar usuario activo para pruebas"
              >
                <option value="" disabled>Seleccionar perfil...</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.nombre} ({u.rol})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
