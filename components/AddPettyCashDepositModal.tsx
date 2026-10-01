"use client";

import React, { useState } from "react";
import { addPettyCashDepositAction } from "@/app/actions/expense-actions";
import { PlusCircle, DollarSign, Calendar, FileText, CheckCircle2, AlertCircle, X } from "lucide-react";

interface AddPettyCashDepositModalProps {
  workers: Array<{ id: string; nombre: string; email: string; saldo?: number }>;
  preselectedWorkerId?: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function AddPettyCashDepositModal({
  workers,
  preselectedWorkerId,
  isOpen,
  onClose,
  onSuccess,
}: AddPettyCashDepositModalProps) {
  const [selectedUserId, setSelectedUserId] = useState<string>(preselectedWorkerId || (workers[0]?.id || ""));
  const [monto, setMonto] = useState<string>("");
  const [descripcion, setDescripcion] = useState<string>("Reposición de Fondo Fijo de Caja Chica");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const numMonto = parseFloat(monto);
    if (!selectedUserId) {
      setErrorMessage("Por favor selecciona un trabajador.");
      return;
    }
    if (isNaN(numMonto) || numMonto <= 0) {
      setErrorMessage("Ingresa un monto válido mayor a S/ 0.00.");
      return;
    }
    if (!descripcion.trim()) {
      setErrorMessage("Ingresa una descripción o referencia para el depósito.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await addPettyCashDepositAction(selectedUserId, numMonto, descripcion.trim());
      if (res.success) {
        setSuccessMessage("¡Abono registrado con éxito! El saldo de la Caja Chica ha sido actualizado.");
        setMonto("");
        if (onSuccess) onSuccess();
        setTimeout(() => {
          onClose();
        }, 1200);
      } else {
        setErrorMessage(res.error || "No se pudo registrar el abono.");
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Error al procesar el depósito.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl p-6 sm:p-7 max-w-lg w-full animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <PlusCircle className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Abonar a Caja Chica</h3>
              <p className="text-xs text-slate-500">Recarga o reposición de fondo en efectivo para el trabajador</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMessage && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-rose-700 text-xs font-medium">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-emerald-800 text-xs font-medium">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-600" />
            <span>{successMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Trabajador Destinatario <span className="text-rose-500">*</span>
            </label>
            <select
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500"
              required
            >
              {workers.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.nombre} ({w.email}) — Saldo actual: S/ {Number(w.saldo || 0).toFixed(2)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Monto a Abonar (S/) <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">S/</span>
              <input
                type="number"
                step="0.01"
                min="1"
                value={monto}
                onChange={(e) => setMonto(e.target.value)}
                placeholder="Ej. 500.00"
                className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-base font-extrabold text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Concepto / Referencia del Depósito <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Ej. Entrega en efectivo / Transferencia BCP N° 004123"
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500"
              required
            />
          </div>

          <div className="pt-3 flex justify-end gap-2.5 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 rounded-xl shadow-md shadow-emerald-100 transition-all flex items-center gap-1.5"
            >
              {isSubmitting ? (
                <>
                  <span className="animate-spin w-3 h-3 border-2 border-white border-t-transparent rounded-full" />
                  <span>Procesando...</span>
                </>
              ) : (
                <>
                  <PlusCircle className="w-4 h-4" />
                  <span>Confirmar Abono</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
