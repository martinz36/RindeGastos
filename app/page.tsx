import React from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { getUsersAction, getExpensesAction } from "@/app/actions/expense-actions";
import {
  Wallet,
  ShieldCheck,
  FileSpreadsheet,
  Car,
  Receipt,
  ArrowRight,
  CheckCircle2,
  Lock,
  Layers,
  Sparkles,
  TrendingUp,
  History,
  Building2
} from "lucide-react";

export const revalidate = 0;

export default async function Home() {
  const { users } = await getUsersAction();
  const { expenses } = await getExpensesAction();

  const totalCajasChicas = users.reduce((acc, u) => {
    return acc + (u.pettyCash ? Number(u.pettyCash.saldo_actual) : 0);
  }, 0);

  const totalRendiciones = expenses.length;
  const pendientes = expenses.filter((e) => e.estado === "PENDIENTE").length;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar
        currentUserId={users[0]?.id}
        users={users.map((u) => ({
          id: u.id,
          nombre: u.nombre,
          email: u.email,
          rol: u.rol,
          saldo: u.pettyCash ? Number(u.pettyCash.saldo_actual) : 0,
        }))}
      />

      <main className="flex-1 max-w-6xl w-full mx-auto py-10 px-4 sm:px-6 space-y-12">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-8 sm:p-12 shadow-2xl border border-indigo-900/50">
          <div className="relative z-10 max-w-2xl space-y-5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-bold tracking-wider uppercase">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              Sistema Corporativo de Rendición de Gastos
            </div>

            <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
              Control Total de <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-blue-400">Caja Chica</span> & <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 to-teal-400">Movilidad</span>
            </h1>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Plataforma empresarial diseñada para trabajadores y administradores: rendición de gastos con fotos de comprobantes, liquidación de movilidad sin prueba física (con origen, destino y motivo laboral), y deducción atómica de fondos mediante transacciones seguras de base de datos.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                href="/dashboard/worker"
                className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-3 rounded-xl font-bold text-xs sm:text-sm shadow-lg shadow-indigo-600/30 transition-all hover:scale-105"
              >
                <Wallet className="w-4 h-4" />
                <span>Rendir como Trabajador</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                href="/gastos"
                className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 px-5 py-3 rounded-xl font-bold text-xs sm:text-sm backdrop-blur-md transition-all"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Panel de Aprobación Admin</span>
              </Link>

              <Link
                href="/reportes"
                className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 px-5 py-3 rounded-xl font-bold text-xs sm:text-sm backdrop-blur-md transition-all"
              >
                <FileSpreadsheet className="w-4 h-4 text-blue-400" />
                <span>Planilla Contable</span>
              </Link>
            </div>
          </div>

          {/* Quick Snapshot Metrics */}
          <div className="relative z-10 grid grid-cols-3 gap-4 mt-8 pt-8 border-t border-white/10 text-center sm:text-left">
            <div>
              <span className="text-slate-400 text-xs block">Fondo Total en Caja Chica</span>
              <span className="text-xl sm:text-2xl font-black text-emerald-400">
                S/ {totalCajasChicas.toFixed(2)}
              </span>
            </div>
            <div>
              <span className="text-slate-400 text-xs block">Rendiciones Procesadas</span>
              <span className="text-xl sm:text-2xl font-black text-indigo-300">
                {totalRendiciones}
              </span>
            </div>
            <div>
              <span className="text-slate-400 text-xs block">Pendientes de Revisión</span>
              <span className="text-xl sm:text-2xl font-black text-amber-400">
                {pendientes}
              </span>
            </div>
          </div>
        </section>

        {/* Módulos Principales de la Solución */}
        <section className="space-y-6">
          <div className="text-center max-w-xl mx-auto">
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Flujos Operativos del Sistema
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Diseñado exactamente para los dos requerimientos clave de la empresa:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1: Trabajador */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-7 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-5">
                  <Wallet className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">
                  Portal del Trabajador
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed mb-4">
                  El trabajador ingresa para rendir sus gastos. Si cuenta con Caja Chica asignada, sube foto del comprobante fiscal (boleta/factura). Si rinde movilidad, no requiere prueba física sino especificar origen, destino y motivo laboral.
                </p>
                <ul className="text-xs space-y-2 text-slate-600 mb-6">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    <span>Visualización de saldo disponible en tiempo real</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    <span>Historial de abonos y recargas de dinero</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    <span>Subida de fotos de boletas con vista previa</span>
                  </li>
                </ul>
              </div>

              <Link
                href="/dashboard/worker"
                className="inline-flex items-center justify-between w-full px-4 py-2.5 bg-slate-50 hover:bg-indigo-50 text-indigo-600 font-bold text-xs rounded-xl border border-slate-200 transition-colors"
              >
                <span>Acceder a /dashboard/worker</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Card 2: Admin y Aprobaciones */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-7 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-5">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">
                  Aprobación & Cajas Chicas
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed mb-4">
                  Los administradores supervisan a todo el personal. Al aprobar un gasto de Caja Chica, el sistema ejecuta una transacción atómica que descuenta el saldo del trabajador. También permite abonar nuevos fondos y registrar personal.
                </p>
                <ul className="text-xs space-y-2 text-slate-600 mb-6">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    <span>Transacción atómica con Prisma $transaction</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    <span>Rechazo documentado con motivo explícito</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    <span>Abonos y recargas directas a cualquier colaborador</span>
                  </li>
                </ul>
              </div>

              <Link
                href="/gastos"
                className="inline-flex items-center justify-between w-full px-4 py-2.5 bg-slate-50 hover:bg-emerald-50 text-emerald-700 font-bold text-xs rounded-xl border border-slate-200 transition-colors"
              >
                <span>Ir al Panel de Aprobaciones</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Card 3: Planillas y Contabilidad */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-7 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-5">
                  <FileSpreadsheet className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">
                  Planilla & Reportes Contables
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed mb-4">
                  Generación de la Planilla Oficial de Gastos de Movilidad de Trabajadores conforme a SUNAT, y liquidación formal de Arqueo de Caja Chica. Exporta a formato Excel / CSV o imprime directamente con hoja de firmas.
                </p>
                <ul className="text-xs space-y-2 text-slate-600 mb-6">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    <span>Planilla de Movilidad oficial con origen/destino</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    <span>Fórmula: Fondo Asignado - Gastos = Saldo Final</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    <span>Exportación instantánea a CSV / Impresión PDF</span>
                  </li>
                </ul>
              </div>

              <Link
                href="/reportes"
                className="inline-flex items-center justify-between w-full px-4 py-2.5 bg-slate-50 hover:bg-blue-50 text-blue-700 font-bold text-xs rounded-xl border border-slate-200 transition-colors"
              >
                <span>Ver Planilla y Reportes</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* Sección de Seguridad y Transaccionalidad */}
        <section className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
              <Lock className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-extrabold text-slate-900 text-base">
                Transaccionalidad Atómica Garantizada
              </h4>
              <p className="text-xs text-slate-500 mt-1 max-w-xl">
                Al aprobar un gasto de Caja Chica, el sistema ejecuta una transacción ACID con Prisma ORM en la base de datos Neon PostgreSQL. Si el trabajador no tiene saldo suficiente, la aprobación se cancela automáticamente evitando sobregiros en el fondo fijo.
              </p>
            </div>
          </div>

          <Link
            href="/gastos"
            className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-colors whitespace-nowrap shadow-xs"
          >
            Verificar en Administrador
          </Link>
        </section>
      </main>

      <footer className="border-t border-slate-200/80 py-6 text-center text-xs text-slate-400">
        <p>RindeGastos &bull; Sistema Corporativo de Rendición de Gastos, Movilidad y Caja Chica</p>
      </footer>
    </div>
  );
}
