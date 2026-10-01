"use client";

import React, { useState } from "react";
import {
  FileSpreadsheet,
  Printer,
  Download,
  Filter,
  Car,
  Receipt,
  CheckCircle2,
  Clock,
  DollarSign,
  Calendar,
  User,
  ArrowRight,
  TrendingDown,
  Building2
} from "lucide-react";

interface ReportesClientProps {
  expenses: any[];
  users: any[];
}

export default function ReportesClient({ expenses, users }: ReportesClientProps) {
  const [activeTab, setActiveTab] = useState<"movilidad" | "caja_chica">("movilidad");
  const [selectedWorkerId, setSelectedWorkerId] = useState<string>("TODOS");
  const [statusFilter, setStatusFilter] = useState<string>("APROBADO"); // Por defecto solo aprobados para contabilidad
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  // Filtrado de gastos de movilidad
  const mobilityExpenses = expenses.filter((e) => {
    if (e.tipo !== "MOVILIDAD") return false;
    if (selectedWorkerId !== "TODOS" && e.user_id !== selectedWorkerId) return false;
    if (statusFilter !== "TODOS" && e.estado !== statusFilter) return false;

    if (startDate) {
      const expDate = new Date(e.fecha || e.createdAt).toISOString().split("T")[0];
      if (expDate < startDate) return false;
    }
    if (endDate) {
      const expDate = new Date(e.fecha || e.createdAt).toISOString().split("T")[0];
      if (expDate > endDate) return false;
    }
    return true;
  });

  const totalMovilidad = mobilityExpenses.reduce((sum, e) => sum + Number(e.monto), 0);

  // Filtrado de gastos de caja chica
  const pettyCashExpenses = expenses.filter((e) => {
    if (e.tipo !== "CAJA_CHICA") return false;
    if (selectedWorkerId !== "TODOS" && e.user_id !== selectedWorkerId) return false;
    if (statusFilter !== "TODOS" && e.estado !== statusFilter) return false;

    if (startDate) {
      const expDate = new Date(e.fecha || e.createdAt).toISOString().split("T")[0];
      if (expDate < startDate) return false;
    }
    if (endDate) {
      const expDate = new Date(e.fecha || e.createdAt).toISOString().split("T")[0];
      if (expDate > endDate) return false;
    }
    return true;
  });

  const totalCajaChica = pettyCashExpenses.reduce((sum, e) => sum + Number(e.monto), 0);

  // Exportar a CSV
  const handleExportCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    if (activeTab === "movilidad") {
      csvContent += "Item,Fecha,Trabajador,Origen,Destino,Motivo,Importe (S/),Estado,Pagado\n";
      mobilityExpenses.forEach((e, idx) => {
        const fecha = new Date(e.fecha || e.createdAt).toLocaleDateString("es-PE");
        const workerName = `"${e.user?.nombre || "N/A"}"`;
        const origen = `"${e.origen || ""}"`;
        const destino = `"${e.destino || ""}"`;
        const motivo = `"${(e.motivo || e.concepto || "").replace(/"/g, '""')}"`;
        const monto = Number(e.monto).toFixed(2);
        const estado = e.estado;
        const pagado = e.pagado ? "SI" : "NO";
        csvContent += `${idx + 1},${fecha},${workerName},${origen},${destino},${motivo},${monto},${estado},${pagado}\n`;
      });
      csvContent += `,,,TOTAL MOBILIDAD,,,,${totalMovilidad.toFixed(2)},,\n`;
    } else {
      csvContent += "Item,Fecha,Trabajador,Concepto,Tipo Comprobante,Numero,Importe (S/),Estado\n";
      pettyCashExpenses.forEach((e, idx) => {
        const fecha = new Date(e.fecha || e.createdAt).toLocaleDateString("es-PE");
        const workerName = `"${e.user?.nombre || "N/A"}"`;
        const concepto = `"${(e.concepto || "").replace(/"/g, '""')}"`;
        const compTipo = e.comprobanteTipo || "Boleta";
        const compNum = e.comprobanteNumero || "S/N";
        const monto = Number(e.monto).toFixed(2);
        const estado = e.estado;
        csvContent += `${idx + 1},${fecha},${workerName},${concepto},${compTipo},${compNum},${monto},${estado}\n`;
      });
      csvContent += `,,,,,TOTAL CAJA CHICA,${totalCajaChica.toFixed(2)},\n`;
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `reporte_${activeTab}_${new Date().toISOString().split("T")[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  const selectedWorkerObj = users.find((u) => u.id === selectedWorkerId);

  return (
    <div className="space-y-6">
      {/* Controles y Filtros (No imprimibles) */}
      <div className="print:hidden space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-indigo-600 text-white rounded-lg">
                <FileSpreadsheet className="w-5 h-5" />
              </span>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                Reportes Contables y Liquidaciones
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Genera la Planilla de Gastos de Movilidad oficial y la Liquidación de Caja Chica conforme a la normativa tributaria.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handleExportCSV}
              className="inline-flex items-center gap-2 px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 shadow-xs transition-colors"
              title="Descargar archivo en formato CSV / Excel"
            >
              <Download className="w-4 h-4 text-emerald-600" />
              <span>Exportar Excel / CSV</span>
            </button>

            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
              title="Imprimir o guardar como PDF"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir / PDF</span>
            </button>
          </div>
        </div>

        {/* Selector de Pestañas de Reporte */}
        <div className="flex items-center gap-2 p-1.5 bg-slate-100 rounded-xl max-w-md">
          <button
            onClick={() => setActiveTab("movilidad")}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === "movilidad"
                ? "bg-white text-blue-700 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Car className="w-4 h-4" />
            <span>Planilla de Movilidad ({mobilityExpenses.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("caja_chica")}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === "caja_chica"
                ? "bg-white text-indigo-700 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Receipt className="w-4 h-4" />
            <span>Arqueo de Caja Chica ({pettyCashExpenses.length})</span>
          </button>
        </div>

        {/* Barra de Filtros */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs flex flex-wrap items-center gap-4 text-xs">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <span className="font-bold text-slate-700">Filtros:</span>
          </div>

          <div>
            <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
              Colaborador
            </label>
            <select
              value={selectedWorkerId}
              onChange={(e) => setSelectedWorkerId(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:ring-2 focus:ring-indigo-500"
            >
              <option value="TODOS">Todos los colaboradores</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.nombre}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
              Estado de Rendición
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:ring-2 focus:ring-indigo-500"
            >
              <option value="TODOS">Todos</option>
              <option value="APROBADO">Solo Aprobados (Contabilidad)</option>
              <option value="PENDIENTE">Solo Pendientes</option>
              <option value="RECHAZADO">Rechazados</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
              Desde
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
              Hasta
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {(selectedWorkerId !== "TODOS" || statusFilter !== "APROBADO" || startDate || endDate) && (
            <button
              onClick={() => {
                setSelectedWorkerId("TODOS");
                setStatusFilter("APROBADO");
                setStartDate("");
                setEndDate("");
              }}
              className="mt-4 px-2.5 py-1 text-slate-500 hover:text-slate-700 hover:underline font-semibold"
            >
              Limpiar filtros
            </button>
          )}
        </div>
      </div>

      {/* DOCUMENTO OFICIAL A IMPRIMIR / VISUALIZAR */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-8 print:p-0 print:border-none print:shadow-none">
        {/* Cabecera Oficial Contable */}
        <div className="border-b-2 border-slate-900 pb-5 mb-6">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Building2 className="w-5 h-5 text-indigo-600 print:text-black" />
                <span className="font-extrabold text-base tracking-tight text-slate-900 uppercase">
                  EMPRESA DEMO SAC &bull; RUC: 20601234567
                </span>
              </div>
              <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight mt-1">
                {activeTab === "movilidad"
                  ? "PLANILLA DE GASTOS POR MOVILIDAD DE TRABAJADORES"
                  : "LIQUIDACIÓN Y ARQUEO DE FONDO FIJO DE CAJA CHICA"}
              </h2>
              <p className="text-xs text-slate-500 print:text-slate-700 mt-1">
                {activeTab === "movilidad"
                  ? "Conforme a la normativa tributaria (Art. 37° Inciso a1 de la Ley del Impuesto a la Renta - No requiere comprobante de pago físico)"
                  : "Detalle de rendición de fondos en efectivo para gastos menores institucionales con sustento fiscal"}
              </p>
            </div>

            <div className="text-right text-xs">
              <span className="text-slate-400 block font-semibold">Fecha de Emisión:</span>
              <span className="font-bold text-slate-800">
                {new Date().toLocaleDateString("es-PE", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
              <span className="text-slate-400 block font-semibold mt-1">Filtrado por:</span>
              <span className="font-bold text-slate-800">
                {selectedWorkerObj ? selectedWorkerObj.nombre : "Todos los colaboradores"}
              </span>
            </div>
          </div>
        </div>

        {/* VISTA 1: PLANILLA DE MOVILIDAD */}
        {activeTab === "movilidad" && (
          <div className="space-y-6">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border border-slate-300">
                <thead className="bg-slate-100 text-slate-800 uppercase font-black tracking-wider text-[10px] border-b border-slate-300">
                  <tr>
                    <th className="py-2.5 px-3 border-r border-slate-300 text-center w-10">N°</th>
                    <th className="py-2.5 px-3 border-r border-slate-300 whitespace-nowrap">Fecha</th>
                    <th className="py-2.5 px-3 border-r border-slate-300">Trabajador / Beneficiario</th>
                    <th className="py-2.5 px-3 border-r border-slate-300">Lugar Origen</th>
                    <th className="py-2.5 px-3 border-r border-slate-300">Lugar Destino</th>
                    <th className="py-2.5 px-3 border-r border-slate-300">Motivo del Desplazamiento</th>
                    <th className="py-2.5 px-3 border-r border-slate-300 text-right whitespace-nowrap">Monto (S/)</th>
                    <th className="py-2.5 px-3 text-center whitespace-nowrap">Estado / Pago</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {mobilityExpenses.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-slate-400 italic">
                        No hay registros de movilidad para los filtros especificados.
                      </td>
                    </tr>
                  ) : (
                    mobilityExpenses.map((m, idx) => (
                      <tr key={m.id} className="hover:bg-slate-50/50">
                        <td className="py-2.5 px-3 border-r border-slate-200 text-center font-bold text-slate-500">
                          {idx + 1}
                        </td>
                        <td className="py-2.5 px-3 border-r border-slate-200 whitespace-nowrap font-medium text-slate-700">
                          {new Date(m.fecha || m.createdAt).toLocaleDateString("es-PE")}
                        </td>
                        <td className="py-2.5 px-3 border-r border-slate-200 font-bold text-slate-900">
                          {m.user?.nombre || "N/A"}
                        </td>
                        <td className="py-2.5 px-3 border-r border-slate-200 text-slate-800">
                          {m.origen || "—"}
                        </td>
                        <td className="py-2.5 px-3 border-r border-slate-200 text-slate-800">
                          {m.destino || "—"}
                        </td>
                        <td className="py-2.5 px-3 border-r border-slate-200 text-slate-700">
                          {m.motivo || m.concepto}
                        </td>
                        <td className="py-2.5 px-3 border-r border-slate-200 text-right font-black text-slate-900">
                          S/ {Number(m.monto).toFixed(2)}
                        </td>
                        <td className="py-2.5 px-3 text-center whitespace-nowrap">
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                              m.estado === "APROBADO"
                                ? m.pagado
                                  ? "bg-emerald-100 text-emerald-800"
                                  : "bg-blue-100 text-blue-800"
                                : "bg-amber-100 text-amber-800"
                            }`}
                          >
                            {m.estado} {m.pagado ? "(Pagado)" : "(Por Reembolsar)"}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
                <tfoot className="bg-slate-100 font-black border-t-2 border-slate-400">
                  <tr>
                    <td colSpan={6} className="py-3 px-4 text-right uppercase tracking-wider text-xs">
                      Total Planilla de Movilidad:
                    </td>
                    <td className="py-3 px-3 text-right text-sm text-slate-900 font-extrabold border-r border-slate-300">
                      S/ {totalMovilidad.toFixed(2)}
                    </td>
                    <td className="py-3 px-3 text-center text-xs text-slate-500">
                      {mobilityExpenses.length} traslados
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Firmas de Conformidad para Impresión */}
            <div className="pt-16 hidden print:grid grid-cols-2 gap-16 text-center text-xs">
              <div className="border-t border-slate-900 pt-2">
                <p className="font-bold text-slate-800">Firma del Trabajador</p>
                <p className="text-slate-500 text-[10px]">DNI / Declaración Jurada</p>
              </div>
              <div className="border-t border-slate-900 pt-2">
                <p className="font-bold text-slate-800">V° B° Administración / Contabilidad</p>
                <p className="text-slate-500 text-[10px]">Autorizado para pago / deducción</p>
              </div>
            </div>
          </div>
        )}

        {/* VISTA 2: ARQUEO Y LIQUIDACIÓN DE CAJA CHICA */}
        {activeTab === "caja_chica" && (
          <div className="space-y-6">
            {/* Resumen de Fondo Fijo por Trabajador */}
            {selectedWorkerObj && selectedWorkerObj.pettyCash && (
              <div className="grid grid-cols-3 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                <div>
                  <span className="text-slate-400 uppercase font-bold block">Fondo Asignado / Abonos</span>
                  <span className="text-base font-extrabold text-slate-900">
                    S/ {((selectedWorkerObj.pettyCash.deposits || []).reduce(
                      (acc: number, d: any) => acc + Number(d.monto),
                      0
                    ) || Number(selectedWorkerObj.pettyCash.saldo_actual) + totalCajaChica).toFixed(2)}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 uppercase font-bold block">Gastos Rendidos</span>
                  <span className="text-base font-extrabold text-rose-600">
                    - S/ {totalCajaChica.toFixed(2)}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 uppercase font-bold block">Saldo en Custodia</span>
                  <span className="text-base font-extrabold text-emerald-600">
                    S/ {Number(selectedWorkerObj.pettyCash.saldo_actual).toFixed(2)}
                  </span>
                </div>
              </div>
            )}

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border border-slate-300">
                <thead className="bg-slate-100 text-slate-800 uppercase font-black tracking-wider text-[10px] border-b border-slate-300">
                  <tr>
                    <th className="py-2.5 px-3 border-r border-slate-300 text-center w-10">N°</th>
                    <th className="py-2.5 px-3 border-r border-slate-300 whitespace-nowrap">Fecha</th>
                    <th className="py-2.5 px-3 border-r border-slate-300">Responsable</th>
                    <th className="py-2.5 px-3 border-r border-slate-300">Tipo Doc</th>
                    <th className="py-2.5 px-3 border-r border-slate-300">N° Comprobante</th>
                    <th className="py-2.5 px-3 border-r border-slate-300">Concepto / Proveedor</th>
                    <th className="py-2.5 px-3 border-r border-slate-300 text-right whitespace-nowrap">Monto (S/)</th>
                    <th className="py-2.5 px-3 text-center">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {pettyCashExpenses.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-slate-400 italic">
                        No hay rendiciones de caja chica para los filtros seleccionados.
                      </td>
                    </tr>
                  ) : (
                    pettyCashExpenses.map((e, idx) => (
                      <tr key={e.id} className="hover:bg-slate-50/50">
                        <td className="py-2.5 px-3 border-r border-slate-200 text-center font-bold text-slate-500">
                          {idx + 1}
                        </td>
                        <td className="py-2.5 px-3 border-r border-slate-200 whitespace-nowrap font-medium text-slate-700">
                          {new Date(e.fecha || e.createdAt).toLocaleDateString("es-PE")}
                        </td>
                        <td className="py-2.5 px-3 border-r border-slate-200 font-bold text-slate-900">
                          {e.user?.nombre || "N/A"}
                        </td>
                        <td className="py-2.5 px-3 border-r border-slate-200 text-slate-800">
                          {e.comprobanteTipo || "Boleta"}
                        </td>
                        <td className="py-2.5 px-3 border-r border-slate-200 font-mono text-slate-700">
                          {e.comprobanteNumero || "S/N"}
                        </td>
                        <td className="py-2.5 px-3 border-r border-slate-200 text-slate-800 font-medium">
                          {e.concepto}
                        </td>
                        <td className="py-2.5 px-3 border-r border-slate-200 text-right font-black text-slate-900">
                          S/ {Number(e.monto).toFixed(2)}
                        </td>
                        <td className="py-2.5 px-3 text-center whitespace-nowrap">
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                              e.estado === "APROBADO"
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-amber-100 text-amber-800"
                            }`}
                          >
                            {e.estado}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
                <tfoot className="bg-slate-100 font-black border-t-2 border-slate-400">
                  <tr>
                    <td colSpan={6} className="py-3 px-4 text-right uppercase tracking-wider text-xs">
                      Total Caja Chica Rendida:
                    </td>
                    <td className="py-3 px-3 text-right text-sm text-slate-900 font-extrabold border-r border-slate-300">
                      S/ {totalCajaChica.toFixed(2)}
                    </td>
                    <td className="py-3 px-3 text-center text-xs text-slate-500">
                      {pettyCashExpenses.length} comprobantes
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Firmas de Conformidad para Impresión */}
            <div className="pt-16 hidden print:grid grid-cols-2 gap-16 text-center text-xs">
              <div className="border-t border-slate-900 pt-2">
                <p className="font-bold text-slate-800">Responsable de Caja Chica</p>
                <p className="text-slate-500 text-[10px]">Custodio del fondo</p>
              </div>
              <div className="border-t border-slate-900 pt-2">
                <p className="font-bold text-slate-800">Revisado por Auditoría / Gerencia</p>
                <p className="text-slate-500 text-[10px]">Liquidación aprobada</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
