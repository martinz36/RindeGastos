"use server";

import { prisma } from "@/lib/prisma";
import { ExpenseStatus, ExpenseType, Role } from "@prisma/client";
import { revalidatePath } from "next/cache";

export interface CreateExpenseInput {
  userId?: string;
  concepto: string;
  monto: number;
  tipo: ExpenseType;
  fecha?: string | Date;
  origen?: string;
  destino?: string;
  motivo?: string;
  comprobanteTipo?: string;
  comprobanteNumero?: string;
  receipt_url?: string;
}

/**
 * Obtiene el usuario trabajador activo o el primero disponible
 */
export async function getActiveWorkerUser(userId?: string) {
  if (userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        pettyCash: {
          include: {
            deposits: {
              orderBy: { fecha: "desc" },
            },
          },
        },
      },
    });
    if (user) return user;
  }

  let user = await prisma.user.findFirst({
    where: { rol: Role.WORKER },
    include: {
      pettyCash: {
        include: {
          deposits: {
            orderBy: { fecha: "desc" },
          },
        },
      },
    },
  });

  if (!user) {
    user = await prisma.user.findFirst({
      include: {
        pettyCash: {
          include: {
            deposits: {
              orderBy: { fecha: "desc" },
            },
          },
        },
      },
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
            deposits: {
              create: {
                monto: 500.00,
                descripcion: "Fondo Fijo Inicial Asignado",
              },
            },
          },
        },
      },
      include: {
        pettyCash: {
          include: {
            deposits: {
              orderBy: { fecha: "desc" },
            },
          },
        },
      },
    });
  }

  return user;
}

/**
 * Server Action para crear un gasto por parte del Trabajador
 */
export async function createExpense(data: CreateExpenseInput) {
  try {
    if (!data.concepto || data.concepto.trim() === "") {
      throw new Error("El concepto o descripción es obligatorio.");
    }
    if (!data.monto || isNaN(Number(data.monto)) || Number(data.monto) <= 0) {
      throw new Error("El monto debe ser un número mayor a 0.");
    }

    if (data.tipo === ExpenseType.MOVILIDAD) {
      if (!data.origen?.trim()) throw new Error("Debes indicar el punto de Origen para la movilidad.");
      if (!data.destino?.trim()) throw new Error("Debes indicar el punto de Destino para la movilidad.");
      if (!data.motivo?.trim()) throw new Error("Debes indicar el motivo o razón del traslado.");
    }

    const workerUser = await getActiveWorkerUser(data.userId);

    const expense = await prisma.expense.create({
      data: {
        user_id: workerUser.id,
        concepto: data.concepto.trim(),
        monto: Number(data.monto),
        tipo: data.tipo,
        estado: ExpenseStatus.PENDIENTE,
        fecha: data.fecha ? new Date(data.fecha) : new Date(),
        origen: data.origen?.trim() || null,
        destino: data.destino?.trim() || null,
        motivo: data.motivo?.trim() || null,
        comprobanteTipo: data.comprobanteTipo || (data.tipo === ExpenseType.MOVILIDAD ? "DECLARACION_JURADA" : "BOLETA"),
        comprobanteNumero: data.comprobanteNumero?.trim() || null,
        receipt_url: data.receipt_url || null,
      },
    });

    try {
      revalidatePath("/dashboard/worker");
      revalidatePath("/gastos");
      revalidatePath("/reportes");
    } catch (revalErr) {
      console.warn("Advertencia de revalidación en cache:", revalErr);
    }
    return {
      success: true,
      expense: {
        id: expense.id,
        user_id: expense.user_id,
        concepto: expense.concepto,
        monto: Number(expense.monto),
        tipo: expense.tipo,
        estado: expense.estado,
        fecha: expense.fecha.toISOString(),
      },
    };
  } catch (error: any) {
    console.error("Error en createExpense:", error);
    return { success: false, error: error.message || "Error al registrar el gasto." };
  }
}

/**
 * Obtiene los gastos del usuario trabajador actual con historial de depósitos y todos los detalles
 */
export async function getWorkerExpenses(userId?: string) {
  try {
    const user = await getActiveWorkerUser(userId);

    const [expenses, allWorkers] = await Promise.all([
      prisma.expense.findMany({
        where: { user_id: user.id },
        orderBy: { fecha: "desc" },
      }),
      prisma.user.findMany({
        select: {
          id: true,
          nombre: true,
          email: true,
          rol: true,
          pettyCash: {
            select: { saldo_actual: true },
          },
        },
        orderBy: { nombre: "asc" },
      }),
    ]);

    return { success: true, user, expenses, allWorkers };
  } catch (error: any) {
    console.error("Error en getWorkerExpenses:", error);
    return { success: false, user: null, expenses: [], allWorkers: [], error: error.message };
  }
}
