import React from "react";
import ExpenseForm from "@/components/ExpenseForm";
import Navbar from "@/components/Navbar";
import ReceiptModal from "@/components/ReceiptModal";
import { getWorkerExpenses } from "@/app/actions/worker-actions";
import { getUsersAction } from "@/app/actions/expense-actions";
import Link from "next/link";
import { 
  Wallet, 
  Receipt, 
  Car, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  ArrowUpRight, 
  History, 
  MapPin, 
  FileText, 
  AlertCircle,
  Eye
} from "lucide-react";
import WorkerDashboardClient from "./WorkerDashboardClient";

export const revalidate = 0; // Dynamic server component

interface PageProps {
  searchParams: Promise<{ userId?: string }>;
}

export default async function WorkerDashboardPage({ searchParams }: PageProps) {
  const { userId } = await searchParams;
  const { user, expenses, allWorkers, error } = await getWorkerExpenses(userId);
  const { users } = await getUsersAction();

  if (error || !user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm text-center max-w-md">
          <AlertCircle className="w-10 h-10 text-rose-500 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-slate-800">No se pudo cargar el perfil del trabajador</h2>
          <p className="text-xs text-slate-500 mt-1">{error || "Usuario no encontrado en la base de datos."}</p>
          <Link href="/gastos" className="inline-block mt-4 text-xs font-bold text-indigo-600 hover:underline">
            Ir al panel de administración &rarr;
          </Link>
        </div>
      </div>
    );
  }

  // Cálculos de saldo y estadísticas del trabajador
  const hasPettyCash = !!user.pettyCash;
  const saldoActual = Number(user.pettyCash?.saldo_actual || 0);
  const deposits = user.pettyCash?.deposits || [];
  const totalAbonado = deposits.reduce((sum, d) => sum + Number(d.monto), 0);

  const gastosCajaChicaAprobados = expenses
    ?.filter((e) => e.tipo === "CAJA_CHICA" && e.estado === "APROBADO")
    .reduce((sum, e) => sum + Number(e.monto), 0) || 0;

  const gastosPendientes = expenses
    ?.filter((e) => e.estado === "PENDIENTE")
    .reduce((sum, e) => sum + Number(e.monto), 0) || 0;

  const gastosMovilidadAprobados = expenses
    ?.filter((e) => e.tipo === "MOVILIDAD" && e.estado === "APROBADO")
    .reduce((sum, e) => sum + Number(e.monto), 0) || 0;

  return (
    <div className="min-h-screen bg-slate-50/50 pb-16">
      <Navbar
        currentUserId={user.id}
        users={users.map((u) => ({
          id: u.id,
          nombre: u.nombre,
          email: u.email,
          rol: u.rol,
          saldo: u.pettyCash ? Number(u.pettyCash.saldo_actual) : 0,
        }))}
      />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-8 space-y-8">
        {/* Cabecera / Perfil del Trabajador */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-7 shadow-xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="bg-indigo-50 border border-indigo-200/80 text-indigo-700 text-xs px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
                  Panel del Trabajador
                </span>
                {hasPettyCash ? (
                  <span className="bg-emerald-50 border border-emerald-200/80 text-emerald-700 text-xs px-2.5 py-0.5 rounded-full font-bold">
                    Caja Chica Activa
                  </span>
                ) : (
                  <span className="bg-slate-100 text-slate-600 text-xs px-2.5 py-0.5 rounded-full font-medium">
                    Sin Fondo Fijo (Solo Reembolsos)
                  </span>
                )}
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                {user.nombre}
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                {user.email} &bull; Rol en el sistema: <strong className="text-slate-700">{user.rol}</strong>
              </p>
            </div>

            {/* Selector rápido de trabajador si hay varios */}
            {allWorkers && allWorkers.length > 1 && (
              <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-xl border border-slate-200">
                <span className="text-xs font-semibold text-slate-500 pl-1">Ver como:</span>
                <div className="flex flex-wrap gap-1.5">
                  {allWorkers.map((w) => (
                    <Link
                      key={w.id}
                      href={`/dashboard/worker?userId=${w.id}`}
                      className={`text-xs px-3 py-1.5 rounded-lg font-bold transition-all ${
                        w.id === user.id
                          ? "bg-indigo-600 text-white shadow-xs"
                          : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
                      }`}
                    >
                      {w.nombre.split(" ")[0]}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Tarjetas métricas de Caja Chica y Rendiciones */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-100">
            {/* Saldo Caja Chica */}
            <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50/50 border border-emerald-200/80">
              <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block">
                Saldo Caja Chica
              </span>
              <p className="text-2xl font-black text-emerald-950 mt-1">
                S/ {hasPettyCash ? saldoActual.toFixed(2) : "0.00"}
              </p>
              <p className="text-[11px] text-emerald-700/80 mt-1">
                {hasPettyCash ? `Total abonado: S/ ${totalAbonado.toFixed(2)}` : "No asignada"}
              </p>
            </div>

            {/* Gastos Aprobados de Caja Chica */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Caja Chica Rendida
              </span>
              <p className="text-2xl font-black text-slate-900 mt-1">
                S/ {gastosCajaChicaAprobados.toFixed(2)}
              </p>
              <p className="text-[11px] text-slate-500 mt-1">
                Descontado de tu fondo
              </p>
            </div>

            {/* Movilidad Aprobada */}
            <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-200/70">
              <span className="text-[11px] font-bold text-blue-800 uppercase tracking-wider block">
                Movilidad Aprobada
              </span>
              <p className="text-2xl font-black text-blue-950 mt-1">
                S/ {gastosMovilidadAprobados.toFixed(2)}
              </p>
              <p className="text-[11px] text-blue-700/80 mt-1">
                Planillas autorizadas
              </p>
            </div>

            {/* Gastos en Aprobación */}
            <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200/70">
              <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider block">
                Por Aprobar
              </span>
              <p className="text-2xl font-black text-amber-950 mt-1">
                S/ {gastosPendientes.toFixed(2)}
              </p>
              <p className="text-[11px] text-amber-700/80 mt-1">
                En revisión por admin
              </p>
            </div>
          </div>
        </div>

        {/* Sección Interactiva: Formulario y Tabla de Rendiciones */}
        <WorkerDashboardClient
          user={user}
          expenses={expenses || []}
          hasPettyCash={hasPettyCash}
          saldoActual={saldoActual}
          deposits={deposits}
        />
      </main>
    </div>
  );
}
