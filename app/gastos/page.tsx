import React from "react";
import { getExpensesAction, getUsersAction } from "@/app/actions/expense-actions";
import ExpenseRowActions from "@/components/ExpenseRowActions";
import Link from "next/link";

export const revalidate = 0; // Dynamic server page

export default async function GastosListPage() {
  const { expenses, error } = await getExpensesAction();
  const { users } = await getUsersAction();

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Gestión y Aprobación de Gastos</h1>
            <p className="text-sm text-slate-500 mt-1">
              Panel de Administración para aprobar rendiciones con actualización atómica de Caja Chica (Prisma $transaction)
            </p>
          </div>

          <Link
            href="/gastos/nuevo"
            className="inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-medium text-sm shadow-md shadow-indigo-100 transition-all"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            Registrar Nuevo Gasto
          </Link>
        </div>

        {/* User Petty Cash Balance Summary Cards */}
        {users.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {users.map((u) => (
              <div key={u.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-800 text-sm">{u.nombre}</h3>
                  <p className="text-xs text-slate-400">{u.email} ({u.rol})</p>
                </div>
                <div className="text-right">
                  <span className="text-xs uppercase font-semibold text-slate-400 block">Saldo Caja Chica</span>
                  <span className="text-lg font-extrabold text-indigo-600">
                    S/ {u.pettyCash ? Number(u.pettyCash.saldo_actual).toFixed(2) : "0.00"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {error && (
          <div className="p-4 bg-rose-50 border-l-4 border-rose-500 text-rose-700 rounded-r-lg text-sm">
            {error}
          </div>
        )}

        {/* Expenses List */}
        {expenses.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-lg mx-auto shadow-sm">
            <svg className="w-16 h-16 text-slate-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="text-lg font-bold text-slate-800">No hay gastos registrados</h3>
            <p className="text-slate-500 text-sm mt-1 mb-6">
              Aún no se ha ingresado ninguna rendición de gastos en la base de datos Neon PostgreSQL.
            </p>
            <Link
              href="/gastos/nuevo"
              className="inline-flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-indigo-700 transition-colors"
            >
              Crear el primer gasto
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-900 text-white text-xs uppercase tracking-wider">
                  <tr>
                    <th className="py-3.5 px-4 font-semibold">Comprobante</th>
                    <th className="py-3.5 px-4 font-semibold">Usuario</th>
                    <th className="py-3.5 px-4 font-semibold">Concepto</th>
                    <th className="py-3.5 px-4 font-semibold">Tipo</th>
                    <th className="py-3.5 px-4 font-semibold text-right">Monto (S/)</th>
                    <th className="py-3.5 px-4 font-semibold">Acción (Admin)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {expenses.map((expense) => (
                    <tr key={expense.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4">
                        {expense.receipt_url ? (
                          <a
                            href={expense.receipt_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group block relative w-12 h-12 rounded-lg overflow-hidden border border-slate-200 shadow-xs"
                            title="Ver comprobante en Cloudinary"
                          >
                            {/* eslint-disable-next-html-element-suppression */}
                            <img
                              src={expense.receipt_url}
                              alt="Comprobante"
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            />
                          </a>
                        ) : (
                          <span className="text-xs text-slate-400 italic">Sin foto</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-semibold text-slate-800 block">
                          {expense.user?.nombre || "Usuario desconocido"}
                        </span>
                        <span className="text-xs text-slate-400">
                          {expense.user?.email}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-700">{expense.concepto}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-md text-xs font-semibold ${
                            expense.tipo === "CAJA_CHICA"
                              ? "bg-indigo-50 text-indigo-700 border border-indigo-200"
                              : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          }`}
                        >
                          {expense.tipo}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-slate-900 text-base">
                        S/ {Number(expense.monto).toFixed(2)}
                      </td>
                      <td className="py-3 px-4">
                        <ExpenseRowActions expenseId={expense.id} currentStatus={expense.estado} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
