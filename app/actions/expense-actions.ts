"use server";

import { prisma } from "@/lib/prisma";
import { ExpenseStatus, ExpenseType, Role } from "@prisma/client";
import { revalidatePath } from "next/cache";

export interface CreateExpenseInput {
  user_id: string;
  monto: number;
  tipo: ExpenseType;
  concepto: string;
  receipt_url?: string;
}

export async function createExpenseAction(data: CreateExpenseInput) {
  try {
    if (!data.user_id) throw new Error("Debes seleccionar un usuario.");
    if (!data.concepto || data.concepto.trim() === "") throw new Error("El concepto es obligatorio.");
    if (!data.monto || isNaN(Number(data.monto)) || Number(data.monto) <= 0) {
      throw new Error("El monto debe ser mayor a 0.");
    }

    const expense = await prisma.expense.create({
      data: {
        user_id: data.user_id,
        monto: Number(data.monto),
        tipo: data.tipo,
        estado: ExpenseStatus.PENDIENTE,
        concepto: data.concepto.trim(),
        receipt_url: data.receipt_url || null,
      },
    });

    revalidatePath("/gastos");
    revalidatePath("/gastos/nuevo");

    return { success: true, expense };
  } catch (error: any) {
    console.error("Error al crear gasto:", error);
    return { success: false, error: error.message || "Error al registrar el gasto." };
  }
}

/**
 * Server Action para que un Administrador apruebe un gasto.
 * Ejecuta toda la lógica dentro de una Transacción de Prisma (prisma.$transaction).
 */
export async function approveExpenseAction(expenseId: string) {
  try {
    if (!expenseId) throw new Error("ID de gasto no proporcionado.");

    const result = await prisma.$transaction(async (tx) => {
      // 1. Buscar el gasto en la base de datos
      const expense = await tx.expense.findUnique({
        where: { id: expenseId },
        include: { user: true },
      });

      if (!expense) {
        throw new Error("El gasto especificado no existe.");
      }

      if (expense.estado === ExpenseStatus.APROBADO) {
        throw new Error("Este gasto ya se encuentra aprobado.");
      }

      // 2. Si el tipo de gasto es 'CAJA_CHICA', busca el registro de PettyCash del usuario y resta el monto
      if (expense.tipo === ExpenseType.CAJA_CHICA) {
        const pettyCash = await tx.pettyCash.findUnique({
          where: { user_id: expense.user_id },
        });

        if (!pettyCash) {
          throw new Error(`El usuario ${expense.user.nombre} no tiene un registro de Caja Chica (PettyCash).`);
        }

        const currentBalance = Number(pettyCash.saldo_actual);
        const expenseAmount = Number(expense.monto);

        if (currentBalance < expenseAmount) {
          throw new Error(
            `Saldo insuficiente en Caja Chica. Saldo actual: S/ ${currentBalance.toFixed(2)}, Monto a descontar: S/ ${expenseAmount.toFixed(2)}`
          );
        }

        // Restar el monto al saldo_actual de la caja chica
        await tx.pettyCash.update({
          where: { user_id: expense.user_id },
          data: {
            saldo_actual: {
              decrement: expenseAmount,
            },
          },
        });
      }

      // 3. Cambiar su estado a 'APROBADO'
      const updatedExpense = await tx.expense.update({
        where: { id: expenseId },
        data: {
          estado: ExpenseStatus.APROBADO,
        },
      });

      return updatedExpense;
    });

    revalidatePath("/gastos");
    revalidatePath("/gastos/nuevo");

    return { success: true, expense: result };
  } catch (error: any) {
    console.error("Error al aprobar gasto:", error);
    return { success: false, error: error.message || "Error al aprobar el gasto." };
  }
}

/**
 * Server Action para rechazar un gasto
 */
export async function rejectExpenseAction(expenseId: string) {
  try {
    if (!expenseId) throw new Error("ID de gasto no proporcionado.");

    const updatedExpense = await prisma.expense.update({
      where: { id: expenseId },
      data: {
        estado: ExpenseStatus.RECHAZADO,
      },
    });

    revalidatePath("/gastos");
    return { success: true, expense: updatedExpense };
  } catch (error: any) {
    console.error("Error al rechazar gasto:", error);
    return { success: false, error: error.message || "Error al rechazar el gasto." };
  }
}

export async function getUsersAction() {
  try {
    let users = await prisma.user.findMany({
      include: {
        pettyCash: true,
      },
      orderBy: { nombre: "asc" },
    });

    if (users.length === 0) {
      const user1 = await prisma.user.create({
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
        include: {
          pettyCash: true,
        },
      });

      const user2 = await prisma.user.create({
        data: {
          nombre: "María López",
          email: "maria.lopez@empresa.com",
          rol: Role.ADMIN,
          pettyCash: {
            create: {
              saldo_actual: 1000.00,
            },
          },
        },
        include: {
          pettyCash: true,
        },
      });

      users = [user1, user2];
    }

    return { success: true, users };
  } catch (error: any) {
    console.error("Error al obtener usuarios:", error);
    return { success: false, users: [], error: error.message };
  }
}

export async function getExpensesAction() {
  try {
    const expenses = await prisma.expense.findMany({
      include: {
        user: {
          include: {
            pettyCash: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    return { success: true, expenses };
  } catch (error: any) {
    console.error("Error al obtener gastos:", error);
    return { success: false, expenses: [], error: error.message };
  }
}

export async function uploadToCloudinaryServerAction(formData: FormData) {
  try {
    const file = formData.get("file") as File;
    if (!file) throw new Error("No se adjuntó ningún archivo.");

    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "demo";
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "docs_upload_example_us_preset";

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64Data = buffer.toString("base64");
    const dataUri = `data:${file.type};base64,${base64Data}`;

    const cloudinaryFormData = new FormData();
    cloudinaryFormData.append("file", dataUri);
    cloudinaryFormData.append("upload_preset", uploadPreset);

    const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: "POST",
      body: cloudinaryFormData,
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.warn("Cloudinary upload status:", res.status, errorText);
      throw new Error(`Error en Cloudinary (${res.status}): ${errorText}`);
    }

    const data = await res.json();
    return { success: true, secure_url: data.secure_url };
  } catch (err: any) {
    console.error("Cloudinary upload error:", err);
    return { success: false, error: err.message };
  }
}
