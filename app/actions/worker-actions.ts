"use server";

import { prisma } from "@/lib/prisma";
import { ExpenseStatus, ExpenseType, Role } from "@prisma/client";
import { revalidatePath } from "next/cache";

export interface CreateExpenseInput {
  concepto: string;
  monto: number;
  tipo: ExpenseType;
}

/**
 * Obtiene el usuario por defecto para pruebas mientras no hay autenticación.
 */
async function getDefaultWorkerUser() {
  let user = await prisma.user.findFirst({
    where: { rol: Role.WORKER },
    include: { pettyCash: true },
  });

  if (!user) {
    user = await prisma.user.findFirst({
      include: { pettyCash: true },
    });
  }

  if (!user) {
    user = await prisma.user.create({
      data: {
        nombre: "Juan Pérez",
        email: "juan.perez@empresa.com",
        rol: Role.WORKER,
        pettyCash: {
          create: {
            saldo_actual: 500.00,
          },
        },
      },
      include: { pettyCash: true },
    });
  }

  return user;
}

/**
 * Server Action para crear un gasto (Trabajador)
 */
export async function createExpense(data: CreateExpenseInput) {
  try {
    if (!data.concepto || data.concepto.trim() === "") {
      throw new Error("El concepto es obligatorio.");
    }
    if (!data.monto || isNaN(Number(data.monto)) || Number(data.monto) <= 0) {
      throw new Error("El monto debe ser un número mayor a 0.");
    }

    const defaultUser = await getDefaultWorkerUser();

    const expense = await prisma.expense.create({
      data: {
        user_id: defaultUser.id,
        concepto: data.concepto.trim(),
        monto: Number(data.monto),
        tipo: data.tipo,
        estado: ExpenseStatus.PENDIENTE,
        receipt_url: "pendiente_de_imagen",
      },
    });

    revalidatePath("/dashboard/worker");
    revalidatePath("/gastos");

    return { success: true, expense };
  } catch (error: any) {
    console.error("Error en createExpense:", error);
    return { success: false, error: error.message || "Error al registrar el gasto." };
  }
}

/**
 * Obtiene los gastos del usuario trabajador actual
 */
export async function getWorkerExpenses() {
  try {
    const user = await getDefaultWorkerUser();

    const expenses = await prisma.expense.findMany({
      where: { user_id: user.id },
      orderBy: { createdAt: "desc" },
    });

    return { success: true, user, expenses };
  } catch (error: any) {
    console.error("Error en getWorkerExpenses:", error);
    return { success: false, user: null, expenses: [], error: error.message };
  }
}
