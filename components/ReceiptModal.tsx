"use client";

import React from "react";
import { X, ExternalLink, MapPin, FileText, Calendar, DollarSign, User, CheckCircle2 } from "lucide-react";

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  expense: {
    id: string;
    concepto: string;
    monto: number | string;
    tipo: string;
    estado: string;
    fecha?: string | Date;
    receipt_url?: string | null;
    origen?: string | null;
    destino?: string | null;
    motivo?: string | null;
    comprobanteTipo?: string | null;
    comprobanteNumero?: string | null;
    pagado?: boolean;
    user?: { nombre: string; email: string };
  } | null;
}

export default function ReceiptModal({ isOpen, onClose, expense }: ReceiptModalProps) {
  if (!isOpen || !expense) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className={`p-2 rounded-xl ${expense.tipo === "CAJA_CHICA" ? "bg-indigo-50 text-indigo-600" : "bg-blue-50 text-blue-600"}`}>
              {expense.tipo === "CAJA_CHICA" ? <FileText className="w-5 h-5" /> : <MapPin className="w-5 h-5" />}
            </span>
            <div>
              <h3 className="text-base font-bold text-slate-900">{expense.concepto}</h3>
              <p className="text-xs text-slate-500">
                {expense.tipo === "CAJA_CHICA" ? "Gasto de Caja Chica" : "Rendición de Movilidad"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Tarjeta de Datos Rápidos */}
          <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl text-xs">
            <div>
              <span className="text-slate-400 font-medium block">Rendido por:</span>
              <span className="font-bold text-slate-800">{expense.user?.nombre || "Trabajador"}</span>
            </div>
            <div>
              <span className="text-slate-400 font-medium block">Importe:</span>
              <span className="font-extrabold text-indigo-600 text-sm">S/ {Number(expense.monto).toFixed(2)}</span>
            </div>
            <div>
              <span className="text-slate-400 font-medium block">Fecha:</span>
              <span className="font-medium text-slate-700">
                {new Date(expense.fecha || Date.now()).toLocaleDateString("es-PE")}
              </span>
            </div>
            <div>
              <span className="text-slate-400 font-medium block">Estado:</span>
              <span className="font-bold text-slate-800">{expense.estado}</span>
            </div>
          </div>

          {/* Si es Movilidad: Detalles de Ruta */}
          {expense.tipo === "MOVILIDAD" && (
            <div className="p-4 bg-blue-50/70 border border-blue-100 rounded-xl space-y-2.5 text-xs">
              <div className="font-bold text-blue-900 uppercase tracking-wider flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-blue-600" />
                Ruta del Desplazamiento
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-semibold">Origen:</span>
                <span className="text-slate-800">{expense.origen || "No especificado"}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-semibold">Destino:</span>
                <span className="text-slate-800">{expense.destino || "No especificado"}</span>
              </div>
              <div>
                <span className="text-slate-500 font-medium block mb-1">Motivo laboral:</span>
                <p className="bg-white p-2.5 rounded-lg border border-blue-200/60 text-slate-700">
                  {expense.motivo || "Gestión de operaciones laborales"}
                </p>
              </div>
            </div>
          )}

          {/* Si es Caja Chica: Comprobante */}
          {expense.tipo === "CAJA_CHICA" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 font-semibold">
                  Comprobante: {expense.comprobanteTipo || "Boleta"} {expense.comprobanteNumero ? `(${expense.comprobanteNumero})` : ""}
                </span>
                {expense.receipt_url && (
                  <a
                    href={expense.receipt_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-1"
                  >
                    <span>Abrir original</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>

              {expense.receipt_url ? (
                <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-100 max-h-80 flex items-center justify-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={expense.receipt_url}
                    alt="Comprobante fiscal"
                    className="w-full h-auto object-contain max-h-80"
                  />
                </div>
              ) : (
                <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200 text-xs text-slate-400">
                  Sin fotografía adjunta registrada
                </div>
              )}
            </div>
          )}
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
