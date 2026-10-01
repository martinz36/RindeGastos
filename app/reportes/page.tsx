import React from "react";
import { getExpensesAction, getUsersAction } from "@/app/actions/expense-actions";
import ReportesClient from "./ReportesClient";
import Navbar from "@/components/Navbar";

export const revalidate = 0; // Dynamic server component

interface ReportesPageProps {
  searchParams?: Promise<{ userId?: string }>;
}

export default async function ReportesPage({ searchParams }: ReportesPageProps) {
  const resolvedParams = searchParams ? await searchParams : {};
  const currentUserId = resolvedParams.userId;

  const { expenses } = await getExpensesAction();
  const { users } = await getUsersAction();

  const activeUser = users.find((u) => u.id === currentUserId) || users.find((u) => u.rol === "ADMIN") || users[0];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar
        currentUserId={activeUser?.id}
        users={users.map((u) => ({
          id: u.id,
          nombre: u.nombre,
          email: u.email,
          rol: u.rol,
          saldo: u.pettyCash ? Number(u.pettyCash.saldo_actual) : 0,
        }))}
      />

      <main className="flex-1 max-w-6xl w-full mx-auto py-8 px-4 sm:px-6">
        <ReportesClient
          expenses={expenses || []}
          users={users || []}
        />
      </main>
    </div>
  );
}
