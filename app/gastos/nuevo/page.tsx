import React from "react";
import NewExpenseForm from "@/components/NewExpenseForm";
import Navbar from "@/components/Navbar";
import { getUsersAction } from "@/app/actions/expense-actions";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const revalidate = 0;

export default async function NuevoGastoPage() {
  const { users } = await getUsersAction();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar
        users={users.map((u) => ({
          id: u.id,
          nombre: u.nombre,
          email: u.email,
          rol: u.rol,
          saldo: u.pettyCash ? Number(u.pettyCash.saldo_actual) : 0,
        }))}
      />

      <div className="flex-1 max-w-4xl w-full mx-auto py-8 px-4">
        {/* Navigation Breadcrumb */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/gastos"
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-indigo-600 transition-colors bg-white px-3.5 py-2 rounded-xl border border-slate-200 shadow-xs"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Volver a la Lista de Gastos</span>
          </Link>
        </div>

        {/* Form Container */}
        <NewExpenseForm />
      </div>
    </div>
  );
}
