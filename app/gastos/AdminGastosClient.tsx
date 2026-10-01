"use client";

import React, { useState } from "react";
import ExpenseRowActions from "@/components/ExpenseRowActions";
import ReceiptModal from "@/components/ReceiptModal";
import AddPettyCashDepositModal from "@/components/AddPettyCashDepositModal";
import CreateWorkerModal from "@/components/CreateWorkerModal";
import Link from "next/link";
import {
  ShieldCheck,
  Wallet,
  Car,
  Receipt,
  PlusCircle,
  UserPlus,
  Search,
  Filter,
  Eye,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  FileSpreadsheet,
  ArrowUpRight,
  TrendingDown,
  DollarSign
} from "lucide-react";

interface AdminGastosClientProps {
  initialExpenses: any[];
  users: any[];
}

export default function AdminGastosClient({
  initialExpenses,
  users,
}: AdminGastosClientProps) {
  const [expenses] = useState<any[]>(initialExpenses);
  const [statusFilter, setStatusFilter] = useState<string>("TODOS");
  const [typeFilter, setTypeFilter] = useState<string>("TODOS");
  const [workerFilter, setWorkerFilter] = useState<string>("TODOS");
  const [searchTerm, setSearchTerm] = useState<string>("");

  // Modales
  const [selectedExpense, setSelectedExpense] = useState<any | null>(null);
  const [isDepositModalOpen, setIsDepositModalOpen] = useState<boolean>(false);
  const [selectedWorkerForDeposit, setSelectedWorkerForDeposit] = useState<string | undefined>(undefined);
  const [isCreateWorkerModalOpen, setIsCreateWorkerModalOpen] = useState<boolean>(false);

  // Trabajadores con saldo disponible para el modal de abono
  const workersForDeposit = users.map((u) => ({
    id: u.id,
    nombre: u.nombre,
    email: u.email,
    saldo: u.pettyCash ? Number(u.pettyCash.saldo_actual) : 0,
  }));

  // Métricas
  const totalCajasChicas = users.reduce((acc, u) => {
    return acc + (u.pettyCash ? Number(u.pettyCash.saldo_actual) : 0);
  }, 0);

  const pendientes = expenses.filter((e) => e.estado === "PENDIENTE");
  const totalPendientesMonto = pendientes.reduce((acc, e) => acc + Number(e.monto), 0);

  const aprobados = expenses.filter((e) => e.estado === "APROBADO");
  const totalAprobadosMonto = aprobados.reduce((acc, e) => acc + Number(e.monto), 0);

  const movilidadPorPagar = expenses.filter(
    (e) => e.tipo === "MOVILIDAD" && e.estado === "APROBADO" && !e.pagado
  );
  const totalMovilidadPorPagarMonto = movilidadPorPagar.reduce((acc, e) => acc + Number(e.monto), 0);

  // Filtro de lista
  const filteredExpenses = expenses.filter((e) => {
    const matchStatus = statusFilter === "TODOS" || e.estado === statusFilter;
    const matchType = typeFilter === "TODOS" || e.tipo === typeFilter;
    const matchWorker = workerFilter === "TODOS" || e.user_id === workerFilter;
    const matchSearch =
      searchTerm.trim() === "" ||
      e.concepto.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (e.user?.nombre && e.user.nombre.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (e.origen && e.origen.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (e.destino && e.destino.toLowerCase().includes(searchTerm.toLowerCase()));

    return matchStatus && matchType && matchWorker && matchSearch;
  });

  const handleOpenDepositModal = (workerId?: string) => {
    setSelectedWorkerForDeposit(workerId);
    setIsDepositModalOpen(true);
  };

  return (
    <div className="space-y-8">
      {/* Header Admin */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-slate-900 text-white rounded-lg">
              <ShieldCheck className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Panel de Aprobaciones y Caja Chica
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Revisión en tiempo real de rendiciones. La aprobación de Caja Chica descuenta automáticamente con transacción atómica de Prisma.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setIsCreateWorkerModalOpen(true)}
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 shadow-xs transition-colors"
          >
            <UserPlus className="w-4 h-4 text-indigo-600" />
            <span>Nuevo Colaborador</span>
          </button>

          <button
            onClick={() => handleOpenDepositModal()}
            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-100 transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Abonar a Caja Chica</span>
          </button>

          <Link
            href="/reportes"
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md shadow-indigo-100 transition-all"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Planilla Contable</span>
          </Link>
        </div>
      </div>

      {/* Tarjetas de Métricas Ejecutivas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Cajas Chicas Activas</span>
            <span className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
              <Wallet className="w-4 h-4" />
            </span>
          </div>
          <p className="text-2xl font-black text-slate-900 tracking-tight">
            S/ {totalCajasChicas.toFixed(2)}
          </p>
          <span className="text-[11px] text-slate-500 mt-1 block">
            Fondo total en custodia de trabajadores
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Por Aprobar</span>
            <span className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <Clock className="w-4 h-4" />
            </span>
          </div>
          <p className="text-2xl font-black text-amber-600 tracking-tight">
            S/ {totalPendientesMonto.toFixed(2)}
          </p>
          <span className="text-[11px] text-amber-700/80 font-semibold mt-1 block">
            {pendientes.length} {pendientes.length === 1 ? "rendición pendiente" : "rendiciones pendientes"}
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Gastos Aprobados</span>
            <span className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="w-4 h-4" />
            </span>
          </div>
          <p className="text-2xl font-black text-emerald-600 tracking-tight">
            S/ {totalAprobadosMonto.toFixed(2)}
          </p>
          <span className="text-[11px] text-slate-500 mt-1 block">
            {aprobados.length} rendiciones aprobadas
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Movilidad por Reembolsar</span>
            <span className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <DollarSign className="w-4 h-4" />
            </span>
          </div>
          <p className="text-2xl font-black text-blue-600 tracking-tight">
            S/ {totalMovilidadPorPagarMonto.toFixed(2)}
          </p>
          <span className="text-[11px] text-blue-700/80 font-semibold mt-1 block">
            {movilidadPorPagar.length} traslados aprobados sin abonar
          </span>
        </div>
      </div>

      {/* Resumen de Colaboradores y Cajas Chicas */}
      <section className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold uppercase text-slate-500 tracking-wider">
              Saldos de Caja Chica por Colaborador
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Haz clic en Recargar para agregar saldo con transacción segura
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {users.map((u) => {
            const hasCaja = !!u.pettyCash;
            const saldo = hasCaja ? Number(u.pettyCash.saldo_actual) : 0;
            return (
              <div
                key={u.id}
                className="p-4 rounded-xl border border-slate-100 bg-slate-50/60 hover:bg-slate-50 transition-colors flex items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-slate-900 text-sm">{u.nombre}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase ${
                      u.rol === "ADMIN" ? "bg-purple-100 text-purple-700" : "bg-slate-200 text-slate-700"
                    }`}>
                      {u.rol}
                    </span>
                  </div>
                  <span className="text-xs text-slate-400 block">{u.email}</span>
                  {hasCaja ? (
                    <span className="text-xs font-black text-emerald-600 mt-1 block">
                      Saldo: S/ {saldo.toFixed(2)}
                    </span>
                  ) : (
                    <span className="text-[11px] text-slate-400 italic mt-1 block">
                      Solo rinde movilidad
                    </span>
                  )}
                </div>

                {hasCaja && (
                  <button
                    onClick={() => handleOpenDepositModal(u.id)}
                    className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-bold transition-colors flex items-center gap-1"
                    title={`Abonar dinero a ${u.nombre}`}
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>Recargar</span>
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Lista de Rendiciones con Filtros y Aprobación */}
      <section className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 sm:p-7">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Receipt className="w-5 h-5 text-indigo-600" />
              Rendiciones de Gastos y Movilidad
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Revisa, aprueba o rechaza los comprobantes fiscales y declaraciones de movilidad laboral.
            </p>
          </div>

          {/* Filtros */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Buscador */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar colaborador o concepto..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-indigo-500 w-48 sm:w-56"
              />
            </div>

            {/* Filtro por Trabajador */}
            <select
              value={workerFilter}
              onChange={(e) => setWorkerFilter(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:ring-2 focus:ring-indigo-500"
            >
              <option value="TODOS">Todos los colaboradores</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.nombre}
                </option>
              ))}
            </select>

            {/* Filtro por Tipo */}
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:ring-2 focus:ring-indigo-500"
            >
              <option value="TODOS">Todos los tipos</option>
              <option value="CAJA_CHICA">Caja Chica</option>
              <option value="MOVILIDAD">Movilidad</option>
            </select>

            {/* Filtro por Estado */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:ring-2 focus:ring-indigo-500"
            >
              <option value="TODOS">Todos los estados</option>
              <option value="PENDIENTE">Solo Pendientes</option>
              <option value="APROBADO">Aprobados</option>
              <option value="RECHAZADO">Rechazados</option>
            </select>
          </div>
        </div>

        {/* Tabla de Rendiciones */}
        {filteredExpenses.length === 0 ? (
          <div className="p-12 text-center bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
            <Receipt className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-700">No hay rendiciones para mostrar</p>
            <p className="text-xs text-slate-400 mt-1">
              No se encontraron registros que coincidan con los filtros seleccionados.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-200/80">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900 text-white font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3.5 px-4">Fecha</th>
                  <th className="py-3.5 px-4">Colaborador</th>
                  <th className="py-3.5 px-4">Tipo</th>
                  <th className="py-3.5 px-4">Detalle / Concepto</th>
                  <th className="py-3.5 px-4">Sustento Fiscal</th>
                  <th className="py-3.5 px-4 text-right">Monto</th>
                  <th className="py-3.5 px-4 text-center">Inspeccionar</th>
                  <th className="py-3.5 px-4">Resolución (Admin)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredExpenses.map((exp: any) => (
                  <tr key={exp.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 whitespace-nowrap text-slate-500 font-medium">
                      {new Date(exp.fecha || exp.createdAt).toLocaleDateString("es-PE")}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-bold text-slate-900 block">
                        {exp.user?.nombre || "Sin usuario"}
                      </span>
                      <span className="text-[10px] text-slate-400 block truncate max-w-[120px]">
                        {exp.user?.email}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold ${
                          exp.tipo === "CAJA_CHICA"
                            ? "bg-indigo-50 text-indigo-700 border border-indigo-200"
                            : "bg-blue-50 text-blue-700 border border-blue-200"
                        }`}
                      >
                        {exp.tipo === "CAJA_CHICA" ? (
                          <>
                            <Receipt className="w-3 h-3" /> Caja Chica
                          </>
                        ) : (
                          <>
                            <Car className="w-3 h-3" /> Movilidad
                          </>
                        )}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 font-semibold text-slate-800 max-w-[220px]">
                      <p className="truncate" title={exp.concepto}>
                        {exp.concepto}
                      </p>
                      {exp.tipo === "MOVILIDAD" && (
                        <p className="text-[10px] text-blue-600 font-medium truncate mt-0.5">
                          {exp.origen} &rarr; {exp.destino}
                        </p>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      {exp.tipo === "MOVILIDAD" ? (
                        <span className="inline-flex items-center gap-1 text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-semibold">
                          Sin comprobante (Dec. Jurada)
                        </span>
                      ) : (
                        <div className="flex items-center gap-1.5">
                          <span className="text-[11px] text-slate-700 font-medium">
                            {exp.comprobanteTipo || "Boleta"} {exp.comprobanteNumero ? `#${exp.comprobanteNumero}` : ""}
                          </span>
                          {exp.receipt_url && (
                            <button
                              onClick={() => setSelectedExpense(exp)}
                              className="text-[10px] bg-indigo-50 text-indigo-700 hover:bg-indigo-100 px-1.5 py-0.5 rounded font-bold transition-colors"
                            >
                              Ver Foto
                            </button>
                          )}
                        </div>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right font-black text-slate-900 text-sm whitespace-nowrap">
                      S/ {Number(exp.monto).toFixed(2)}
                    </td>

                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => setSelectedExpense(exp)}
                        className="p-1.5 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        title="Ver comprobante y detalles"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <ExpenseRowActions
                        expenseId={exp.id}
                        currentStatus={exp.estado}
                        tipo={exp.tipo}
                        pagado={exp.pagado}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Modal de Abono de Caja Chica */}
      <AddPettyCashDepositModal
        workers={workersForDeposit}
        preselectedWorkerId={selectedWorkerForDeposit}
        isOpen={isDepositModalOpen}
        onClose={() => setIsDepositModalOpen(false)}
        onSuccess={() => window.location.reload()}
      />

      {/* Modal de Nuevo Colaborador */}
      <CreateWorkerModal
        isOpen={isCreateWorkerModalOpen}
        onClose={() => setIsCreateWorkerModalOpen(false)}
        onSuccess={() => window.location.reload()}
      />

      {/* Modal de Detalle de Rendición */}
      <ReceiptModal
        isOpen={selectedExpense !== null}
        onClose={() => setSelectedExpense(null)}
        expense={selectedExpense}
      />
    </div>
  );
}
