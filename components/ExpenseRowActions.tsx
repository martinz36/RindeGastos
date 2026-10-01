"use client";

import React, { useState } from "react";
import { approveExpenseAction, rejectExpenseAction, markExpenseAsPaidAction } from "@/app/actions/expense-actions";
import { ExpenseStatus, ExpenseType } from "@prisma/client";
import { Check, X, CheckCircle2, XCircle, DollarSign, Clock, AlertCircle } from "lucide-react";

interface ExpenseRowActionsProps {
  expenseId: string;
  currentStatus: ExpenseStatus;
  tipo?: ExpenseType;
  pagado?: boolean;
}

export default function ExpenseRowActions({
  expenseId,
  currentStatus,
  tipo,
  pagado = false,
}: ExpenseRowActionsProps) {
  const [loadingAction, setLoadingAction] = useState<"approve" | "reject" | "pay" | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showRejectModal, setShowRejectModal] = useState<boolean>(false);
  const [rejectReason, setRejectReason] = useState<string>("");

  const handleApprove = async () => {
    setLoadingAction("approve");
    setErrorMessage(null);
    const res = await approveExpenseAction(expenseId);
    if (!res.success) {
      setErrorMessage(res.error || "No se pudo aprobar el gasto.");
    }
    setLoadingAction(null);
  };

  const handleRejectConfirm = async () => {
    setLoadingAction("reject");
    setErrorMessage(null);
    const res = await rejectExpenseAction(expenseId, rejectReason.trim() || undefined);
    if (!res.success) {
      setErrorMessage(res.error || "No se pudo rechazar el gasto.");
    }
    setShowRejectModal(false);
    setLoadingAction(null);
  };

  const handleMarkAsPaid = async () => {
    setLoadingAction("pay");
    setErrorMessage(null);
    const res = await markExpenseAsPaidAction(expenseId);
    if (!res.success) {
      setErrorMessage(res.error || "No se pudo marcar como pagado.");
    }
    setLoadingAction(null);
  };

  return (
    <div className="flex flex-col items-start gap-1.5">
      {currentStatus === "APROBADO" ? (
        <div className="flex flex-col gap-1">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Aprobado
          </span>

          {/* Si es Movilidad y aún no está marcado como pagado/reembolsado */}
          {tipo === "MOVILIDAD" && (
            pagado ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                <DollarSign className="w-3 h-3" /> Reembolsado
              </span>
            ) : (
              <button
                onClick={handleMarkAsPaid}
                disabled={loadingAction !== null}
                className="mt-1 px-2.5 py-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold text-[11px] rounded-lg transition-all flex items-center gap-1 shadow-xs"
                title="Marcar como depositado al trabajador"
              >
                {loadingAction === "pay" ? (
                  <span className="animate-spin w-3 h-3 border-2 border-white border-t-transparent rounded-full" />
                ) : (
                  <DollarSign className="w-3 h-3" />
                )}
                Depositar / Pagar
              </button>
            )
          )}
        </div>
      ) : currentStatus === "RECHAZADO" ? (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
          <XCircle className="w-3.5 h-3.5 text-rose-600" />
          Rechazado
        </span>
      ) : (
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleApprove}
            disabled={loadingAction !== null}
            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-bold text-xs rounded-lg transition-all flex items-center gap-1 shadow-xs"
            title={tipo === "CAJA_CHICA" ? "Aprobar y descontar de Caja Chica" : "Aprobar rendición de movilidad"}
          >
            {loadingAction === "approve" ? (
              <span className="animate-spin w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full" />
            ) : (
              <Check className="w-3.5 h-3.5" />
            )}
            Aprobar
          </button>

          <button
            onClick={() => setShowRejectModal(true)}
            disabled={loadingAction !== null}
            className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold text-xs rounded-lg border border-rose-200 transition-colors flex items-center gap-1"
            title="Rechazar rendición"
          >
            <X className="w-3.5 h-3.5" />
            Rechazar
          </button>
        </div>
      )}

      {/* Modal para motivo de rechazo */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl p-6 max-w-md w-full animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-base font-bold text-slate-900 mb-2 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-rose-600" />
              Rechazar Rendición de Gasto
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Indica el motivo o razón por la cual no procede esta rendición para notificar al trabajador.
            </p>
            <textarea
              rows={3}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Ej. Comprobante no coincide con el RUC de la empresa / Ruta de movilidad no autorizada"
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:bg-white focus:ring-2 focus:ring-rose-500 mb-4"
            />
            <div className="flex justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setShowRejectModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleRejectConfirm}
                disabled={loadingAction === "reject"}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 disabled:bg-rose-400 rounded-xl shadow-xs transition-colors"
              >
                {loadingAction === "reject" ? "Rechazando..." : "Confirmar Rechazo"}
              </button>
            </div>
          </div>
        </div>
      )}

      {errorMessage && (
        <span className="text-[11px] text-rose-600 font-medium leading-tight max-w-[220px]">
          {errorMessage}
        </span>
      )}
    </div>
  );
}
