import React from "react";
import ExpenseForm from "@/components/ExpenseForm";
import { getWorkerExpenses } from "@/app/actions/worker-actions";
import Link from "next/link";

export const revalidate = 0; // Dynamic server component

export default async function WorkerDashboardPage() {
  const { user, expenses, error } = await getWorkerExpenses();

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-indigo-100 text-indigo-700 text-xs px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
                Panel del Trabajador
              </span>
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 mt-1">
              Bienvenido, {user?.nombre || "Trabajador"}
            </h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Email: {user?.email} | Saldo Caja Chica:{" "}
              <strong className="text-indigo-600 font-bold">
                S/ {user?.pettyCash ? Number(user.pettyCash.saldo_actual).toFixed(2) : "0.00"}
              </strong>
            </p>
          </div>

          <Link
            href="/gastos"
            className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-xl text-xs font-semibold transition-colors"
          >
            Ver Vista General &rarr;
          </Link>
        </div>

        {/* Top Section: Form Component */}
        <section>
          <ExpenseForm />
        </section>

        {/* Bottom Section: Expenses Table (Server Component) */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">Mis Gastos Registrados</h2>
            <span className="text-xs font-medium text-slate-500">
              Total: {expenses.length} registros
            </span>
          </div>

          {error && (
            <div className="p-3 bg-rose-50 border-l-4 border-rose-500 text-rose-700 text-xs rounded-r-md">
              {error}
            </div>
          )}

          {expenses.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-500 text-sm">
              Aún no has registrado ningún gasto. Llena el formulario superior para agregar tu primer registro.
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-900 text-white text-xs uppercase tracking-wider">
                    <tr>
                      <th className="py-3 px-4 font-semibold">Concepto</th>
                      <th className="py-3 px-4 font-semibold text-right">Monto (S/)</th>
                      <th className="py-3 px-4 font-semibold">Tipo</th>
                      <th className="py-3 px-4 font-semibold">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {expenses.map((exp) => (
                      <tr key={exp.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3.5 px-4 font-medium text-slate-800">
                          {exp.concepto}
                        </td>
                        <td className="py-3.5 px-4 text-right font-bold text-slate-900">
                          S/ {Number(exp.monto).toFixed(2)}
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded text-xs font-semibold ${
                              exp.tipo === "CAJA_CHICA"
                                ? "bg-indigo-50 text-indigo-700 border border-indigo-200"
                                : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            }`}
                          >
                            {exp.tipo === "CAJA_CHICA" ? "Caja Chica" : "Movilidad"}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                              exp.estado === "APROBADO"
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : exp.estado === "RECHAZADO"
                                ? "bg-rose-50 text-rose-700 border border-rose-200"
                                : "bg-amber-50 text-amber-700 border border-amber-200"
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                exp.estado === "APROBADO"
                                  ? "bg-emerald-500"
                                  : exp.estado === "RECHAZADO"
                                  ? "bg-rose-500"
                                  : "bg-amber-500"
                              }`}
                            ></span>
                            {exp.estado}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
