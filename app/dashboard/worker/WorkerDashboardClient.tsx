"use client";

import React, { useState } from "react";
import ExpenseForm from "@/components/ExpenseForm";
import ReceiptModal from "@/components/ReceiptModal";
import { 
  Receipt, 
  Car, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  History, 
  MapPin, 
  FileText, 
  Eye, 
  PlusCircle, 
  Search,
  Filter,
  ArrowDownRight
} from "lucide-react";

interface WorkerDashboardClientProps {
  user: any;
  expenses: any[];
  hasPettyCash: boolean;
  saldoActual: number;
  deposits: any[];
}

export default function WorkerDashboardClient({
  user,
  expenses,
  hasPettyCash,
  saldoActual,
  deposits,
}: WorkerDashboardClientProps) {
  const [activeTab, setActiveTab] = useState<"nuevo" | "historial_abonos">("nuevo");
  const [statusFilter, setStatusFilter] = useState<string>("TODOS");
  const [typeFilter, setTypeFilter] = useState<string>("TODOS");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedExpense, setSelectedExpense] = useState<any | null>(null);

  // Filtrado de gastos
  const filteredExpenses = expenses.filter((e) => {
    const matchStatus = statusFilter === "TODOS" || e.estado === statusFilter;
    const matchType = typeFilter === "TODOS" || e.tipo === typeFilter;
    const matchSearch =
      searchTerm.trim() === "" ||
      e.concepto.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (e.origen && e.origen.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (e.destino && e.destino.toLowerCase().includes(searchTerm.toLowerCase()));

    return matchStatus && matchType && matchSearch;
  });

  return (
    <div className="space-y-8">
      {/* Selector de Sección Principal */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-xl">
          <button
            onClick={() => setActiveTab("nuevo")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === "nuevo"
                ? "bg-white text-indigo-700 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <PlusCircle className="w-4 h-4" />
            <span>Registrar Rendición</span>
          </button>

          {hasPettyCash && (
            <button
              onClick={() => setActiveTab("historial_abonos")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === "historial_abonos"
                  ? "bg-white text-emerald-700 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <History className="w-4 h-4" />
              <span>Abonos Recibidos ({deposits.length})</span>
            </button>
          )}
        </div>

        <span className="text-xs text-slate-500">
          Total de rendiciones registradas: <strong>{expenses.length}</strong>
        </span>
      </div>

      {/* Vista de Registro de Gasto o Historial de Abonos */}
      {activeTab === "nuevo" ? (
        <ExpenseForm
          currentUserId={user.id}
          hasPettyCash={hasPettyCash}
          saldoActual={saldoActual}
        />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 max-w-3xl mx-auto">
          <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100 mb-4">
            <span className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <History className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Historial de Fondos y Abonos de Caja Chica</h3>
              <p className="text-xs text-slate-500">
                Registro de recargas y entregas de dinero en efectivo realizadas por la administración
              </p>
            </div>
          </div>

          {deposits.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-xs">
              No hay abonos registrados para tu cuenta aún.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {deposits.map((dep: any) => (
                <div key={dep.id} className="py-3.5 flex items-center justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <span className="p-2 rounded-lg bg-emerald-100/60 text-emerald-700 mt-0.5">
                      <ArrowDownRight className="w-4 h-4" />
                    </span>
                    <div>
                      <p className="text-sm font-bold text-slate-800">{dep.descripcion}</p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {new Date(dep.fecha).toLocaleString("es-PE")}
                      </p>
                    </div>
                  </div>
                  <span className="text-base font-black text-emerald-600">
                    + S/ {Number(dep.monto).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tabla de Rendiciones del Trabajador */}
      <section className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 sm:p-7">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Receipt className="w-5 h-5 text-indigo-600" />
              Tus Rendiciones y Solicitudes
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Revisa el estado de aprobación de tus gastos de caja chica y planillas de movilidad.
            </p>
          </div>

          {/* Filtros rápidos */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Búsqueda */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar concepto o ruta..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-indigo-500 w-48 sm:w-56"
              />
            </div>

            {/* Filtro Tipo */}
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:ring-2 focus:ring-indigo-500"
            >
              <option value="TODOS">Todos los tipos</option>
              <option value="CAJA_CHICA">Solo Caja Chica</option>
              <option value="MOVILIDAD">Solo Movilidad</option>
            </select>

            {/* Filtro Estado */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:ring-2 focus:ring-indigo-500"
            >
              <option value="TODOS">Todos los estados</option>
              <option value="PENDIENTE">Pendientes</option>
              <option value="APROBADO">Aprobados</option>
              <option value="RECHAZADO">Rechazados</option>
            </select>
          </div>
        </div>

        {/* Tabla */}
        {filteredExpenses.length === 0 ? (
          <div className="p-12 text-center bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
            <Receipt className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-700">No se encontraron rendiciones</p>
            <p className="text-xs text-slate-400 mt-1">
              {expenses.length === 0
                ? "Aún no has registrado ningún gasto o movilidad en tu cuenta."
                : "No hay registros que coincidan con los filtros aplicados."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-200/80">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 text-slate-500 font-bold border-b border-slate-200 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3.5 px-4">Fecha</th>
                  <th className="py-3.5 px-4">Tipo</th>
                  <th className="py-3.5 px-4">Concepto / Detalle</th>
                  <th className="py-3.5 px-4">Comprobante / Ruta</th>
                  <th className="py-3.5 px-4 text-right">Monto</th>
                  <th className="py-3.5 px-4 text-center">Estado</th>
                  <th className="py-3.5 px-4 text-center">Detalle</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredExpenses.map((exp: any) => (
                  <tr key={exp.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4 whitespace-nowrap text-slate-500 font-medium">
                      {new Date(exp.fecha || exp.createdAt).toLocaleDateString("es-PE")}
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold ${
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

                    <td className="py-3.5 px-4 font-semibold text-slate-800 max-w-xs truncate">
                      {exp.concepto}
                    </td>

                    <td className="py-3.5 px-4 text-slate-600">
                      {exp.tipo === "MOVILIDAD" ? (
                        <div className="flex items-center gap-1.5 text-[11px]">
                          <MapPin className="w-3 h-3 text-blue-500 flex-shrink-0" />
                          <span className="truncate max-w-[200px]" title={`${exp.origen} -> ${exp.destino}`}>
                            {exp.origen} &rarr; {exp.destino}
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-[11px]">
                          <FileText className="w-3 h-3 text-indigo-500 flex-shrink-0" />
                          <span>{exp.comprobanteTipo || "Boleta"} {exp.comprobanteNumero ? `#${exp.comprobanteNumero}` : ""}</span>
                          {exp.receipt_url && (
                            <span className="text-[10px] bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded font-bold">Foto</span>
                          )}
                        </div>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right font-black text-slate-900 text-sm whitespace-nowrap">
                      S/ {Number(exp.monto).toFixed(2)}
                    </td>

                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                          exp.estado === "APROBADO"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : exp.estado === "RECHAZADO"
                            ? "bg-rose-50 text-rose-700 border border-rose-200"
                            : "bg-amber-50 text-amber-700 border border-amber-200"
                        }`}
                      >
                        {exp.estado === "APROBADO" ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        ) : exp.estado === "RECHAZADO" ? (
                          <XCircle className="w-3.5 h-3.5 text-rose-600" />
                        ) : (
                          <Clock className="w-3.5 h-3.5 text-amber-600" />
                        )}
                        {exp.estado}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <button
                        type="button"
                        onClick={() => setSelectedExpense(exp)}
                        className="p-1.5 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded-lg transition-colors"
                        title="Ver detalle de rendición y comprobante"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Modal de Detalle / Comprobante */}
      <ReceiptModal
        isOpen={selectedExpense !== null}
        onClose={() => setSelectedExpense(null)}
        expense={selectedExpense}
      />
    </div>
  );
}
