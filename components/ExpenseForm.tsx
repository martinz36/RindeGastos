"use client";

import React, { useState, FormEvent } from "react";
import { createExpense } from "@/app/actions/worker-actions";
import { ExpenseType } from "@prisma/client";

export default function ExpenseForm() {
  const [concepto, setConcepto] = useState<string>("");
  const [monto, setMonto] = useState<string>("");
  const [tipo, setTipo] = useState<ExpenseType>("CAJA_CHICA");

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!concepto.trim()) {
      setErrorMessage("Por favor ingresa un concepto válido.");
      return;
    }
    if (!monto || parseFloat(monto) <= 0) {
      setErrorMessage("Por favor ingresa un monto mayor a 0.");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await createExpense({
        concepto,
        monto: parseFloat(monto),
        tipo,
      });

      if (res.success) {
        setSuccessMessage("¡Gasto registrado con éxito!");
        setConcepto("");
        setMonto("");
        setTipo("CAJA_CHICA");
      } else {
        setErrorMessage(res.error || "No se pudo registrar el gasto.");
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Ocurrió un error inesperado.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 max-w-xl mx-auto">
      <div className="mb-5 pb-4 border-b border-slate-100">
        <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Nuevo Gasto del Trabajador
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Registra tus rendiciones de Caja Chica o Movilidad.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {errorMessage && (
          <div className="p-3 bg-rose-50 border-l-4 border-rose-500 rounded-r-lg text-rose-700 text-xs font-medium">
            {errorMessage}
          </div>
        )}

        {successMessage && (
          <div className="p-3 bg-emerald-50 border-l-4 border-emerald-500 rounded-r-lg text-emerald-700 text-xs font-medium">
            {successMessage}
          </div>
        )}

        {/* Concepto */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">
            Concepto <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            placeholder="Ej: Taxis a cliente o Compra de insumos"
            value={concepto}
            onChange={(e) => setConcepto(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-slate-800 text-sm transition-all"
            required
          />
        </div>

        {/* Monto & Tipo */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">
              Monto (S/) <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-slate-400 font-medium text-sm">S/</span>
              <input
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0.00"
                value={monto}
                onChange={(e) => setMonto(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-slate-800 text-sm transition-all"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">
              Tipo de Gasto <span className="text-rose-500">*</span>
            </label>
            <select
              value={tipo}
              onChange={(e) => setTipo(e.target.value as ExpenseType)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-slate-800 text-sm transition-all font-medium"
            >
              <option value="CAJA_CHICA">Caja Chica</option>
              <option value="MOVILIDAD">Movilidad</option>
            </select>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold rounded-xl text-sm shadow-md shadow-indigo-100 transition-all flex items-center justify-center gap-2 mt-2"
        >
          {isSubmitting ? (
            <span>Guardando...</span>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              <span>Registrar Gasto</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}
