"use client";

import React, { useState } from "react";
import { approveExpenseAction, rejectExpenseAction } from "@/app/actions/expense-actions";
import { ExpenseStatus } from "@prisma/client";

interface ExpenseRowActionsProps {
  expenseId: string;
  currentStatus: ExpenseStatus;
}

export default function ExpenseRowActions({ expenseId, currentStatus }: ExpenseRowActionsProps) {
  const [loadingAction, setLoadingAction] = useState<"approve" | "reject" | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleApprove = async () => {
    setLoadingAction("approve");
    setErrorMessage(null);
    const res = await approveExpenseAction(expenseId);
    if (!res.success) {
      setErrorMessage(res.error || "No se pudo aprobar el gasto.");
    }
    setLoadingAction(null);
  };

  const handleReject = async () => {
    setLoadingAction("reject");
    setErrorMessage(null);
    const res = await rejectExpenseAction(expenseId);
    if (!res.success) {
      setErrorMessage(res.error || "No se pudo rechazar el gasto.");
    }
    setLoadingAction(null);
  };

  if (currentStatus === ExpenseStatus.APROBADO) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
        <svg className="w-3.5 h-3.5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
        </svg>
        Aprobado
      </span>
    );
  }

  if (currentStatus === ExpenseStatus.RECHAZADO) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
        <svg className="w-3.5 h-3.5 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
        </svg>
        Rechazado
      </span>
    );
  }

  return (
    <div className="flex flex-col items-start gap-1">
      <div className="flex items-center gap-2">
        <button
          onClick={handleApprove}
          disabled={loadingAction !== null}
          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-medium text-xs rounded-lg transition-colors flex items-center gap-1 shadow-xs"
          title="Aprobar gasto (Descuenta de Caja Chica si corresponde)"
        >
          {loadingAction === "approve" ? (
            <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          )}
          Aprobar
        </button>

        <button
          onClick={handleReject}
          disabled={loadingAction !== null}
          className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-medium text-xs rounded-lg border border-rose-200 transition-colors flex items-center gap-1"
          title="Rechazar gasto"
        >
          {loadingAction === "reject" ? (
            <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          )}
          Rechazar
        </button>
      </div>

      {errorMessage && (
        <span className="text-[11px] text-rose-600 font-medium leading-tight max-w-[200px]">
          {errorMessage}
        </span>
      )}
    </div>
  );
}
