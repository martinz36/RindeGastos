"use server";

import { prisma } from "@/lib/prisma";
import { ExpenseStatus, ExpenseType, Role } from "@prisma/client";
import { revalidatePath } from "next/cache";

function safeRevalidate(paths: string[]) {
  try {
    for (const p of paths) {
      revalidatePath(p);
    }
  } catch (err) {
    console.warn("Revalidate error ignored in server action:", err);
  }
}

export interface CreateExpenseInput {
  user_id: string;
  monto: number;
  tipo: ExpenseType;
  concepto: string;
  fecha?: string | Date;
  origen?: string;
  destino?: string;
  motivo?: string;
  comprobanteTipo?: string;
  comprobanteNumero?: string;
  receipt_url?: string;
}

export async function createExpenseAction(data: CreateExpenseInput) {
  try {
    if (!data.user_id) throw new Error("Debes seleccionar un usuario.");
    if (!data.concepto || data.concepto.trim() === "") throw new Error("El concepto o descripción es obligatorio.");
    if (!data.monto || isNaN(Number(data.monto)) || Number(data.monto) <= 0) {
      throw new Error("El monto debe ser un valor positivo mayor a 0.");
    }

    if (data.tipo === ExpenseType.MOVILIDAD) {
      if (!data.origen?.trim()) throw new Error("El punto de origen es obligatorio para rendir movilidad.");
      if (!data.destino?.trim()) throw new Error("El punto de destino es obligatorio para rendir movilidad.");
      if (!data.motivo?.trim()) throw new Error("El motivo o razón del traslado es obligatorio.");
    }

    const expense = await prisma.expense.create({
      data: {
        user_id: data.user_id,
        monto: Number(data.monto),
        tipo: data.tipo,
        estado: ExpenseStatus.PENDIENTE,
        concepto: data.concepto.trim(),
        fecha: data.fecha ? new Date(data.fecha) : new Date(),
        origen: data.origen?.trim() || null,
        destino: data.destino?.trim() || null,
        motivo: data.motivo?.trim() || null,
        comprobanteTipo: data.comprobanteTipo || (data.tipo === ExpenseType.MOVILIDAD ? "DECLARACION_JURADA" : "BOLETA"),
        comprobanteNumero: data.comprobanteNumero?.trim() || null,
        receipt_url: data.receipt_url || null,
      },
    });

    safeRevalidate(["/gastos", "/dashboard/worker", "/reportes"]);

    return { success: true, expense };
  } catch (error: any) {
    console.error("Error al crear gasto:", error);
    return { success: false, error: error.message || "Error al registrar el gasto." };
  }
}

/**
 * Server Action para que un Administrador apruebe un gasto.
 * Si es CAJA_CHICA, se descuenta de forma atómica del saldo de la Caja Chica del trabajador.
 * Si es MOVILIDAD, se aprueba para su posterior reembolso / pago.
 */
export async function approveExpenseAction(expenseId: string) {
  try {
    if (!expenseId) throw new Error("ID de gasto no proporcionado.");

    const result = await prisma.$transaction(async (tx) => {
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

      // 1. Si es CAJA_CHICA, descuenta del saldo_actual del trabajador
      if (expense.tipo === ExpenseType.CAJA_CHICA) {
        const pettyCash = await tx.pettyCash.findUnique({
          where: { user_id: expense.user_id },
        });

        if (!pettyCash) {
          throw new Error(`El usuario ${expense.user.nombre} no tiene una Caja Chica asignada.`);
        }

        const currentBalance = Number(pettyCash.saldo_actual);
        const expenseAmount = Number(expense.monto);

        if (currentBalance < expenseAmount) {
          throw new Error(
            `Saldo insuficiente en Caja Chica. Saldo actual: S/ ${currentBalance.toFixed(2)}, Monto a descontar: S/ ${expenseAmount.toFixed(2)}`
          );
        }

        await tx.pettyCash.update({
          where: { user_id: expense.user_id },
          data: {
            saldo_actual: {
              decrement: expenseAmount,
            },
          },
        });

        // Para caja chica, al aprobarse ya se considera descontado/saldado
        return await tx.expense.update({
          where: { id: expenseId },
          data: {
            estado: ExpenseStatus.APROBADO,
            pagado: true,
            fechaPago: new Date(),
          },
        });
      } else {
        // 2. Si es MOVILIDAD, se aprueba y queda lista para reembolso / desembolso
        return await tx.expense.update({
          where: { id: expenseId },
          data: {
            estado: ExpenseStatus.APROBADO,
          },
        });
      }
    });

    safeRevalidate(["/gastos", "/dashboard/worker", "/reportes"]);

    return { success: true, expense: result };
  } catch (error: any) {
    console.error("Error al aprobar gasto:", error);
    return { success: false, error: error.message || "Error al aprobar el gasto." };
  }
}

/**
 * Server Action para rechazar un gasto
 */
export async function rejectExpenseAction(expenseId: string, motivoRechazo?: string) {
  try {
    if (!expenseId) throw new Error("ID de gasto no proporcionado.");

    const updatedExpense = await prisma.expense.update({
      where: { id: expenseId },
      data: {
        estado: ExpenseStatus.RECHAZADO,
        motivoRechazo: motivoRechazo || "Rechazado por administración",
      },
    });

    safeRevalidate(["/gastos", "/dashboard/worker", "/reportes"]);
    return { success: true, expense: updatedExpense };
  } catch (error: any) {
    console.error("Error al rechazar gasto:", error);
    return { success: false, error: error.message || "Error al rechazar el gasto." };
  }
}

/**
 * Server Action para marcar un gasto de movilidad o reembolso como pagado/depositado
 */
export async function markExpenseAsPaidAction(expenseId: string) {
  try {
    if (!expenseId) throw new Error("ID de gasto no proporcionado.");

    const updatedExpense = await prisma.expense.update({
      where: { id: expenseId },
      data: {
        pagado: true,
        fechaPago: new Date(),
      },
    });

    safeRevalidate(["/gastos", "/dashboard/worker", "/reportes"]);
    return { success: true, expense: updatedExpense };
  } catch (error: any) {
    console.error("Error al marcar como pagado:", error);
    return { success: false, error: error.message || "Error al procesar el pago." };
  }
}

/**
 * Server Action para registrar un Abono o Depósito en la Caja Chica de un Trabajador
 */
export async function addPettyCashDepositAction(userId: string, monto: number, descripcion: string) {
  try {
    if (!userId) throw new Error("Debes indicar el trabajador.");
    if (!monto || isNaN(Number(monto)) || Number(monto) <= 0) {
      throw new Error("El monto del depósito debe ser mayor a 0.");
    }
    if (!descripcion?.trim()) {
      throw new Error("La descripción o referencia del depósito es obligatoria.");
    }

    const result = await prisma.$transaction(async (tx) => {
      let pettyCash = await tx.pettyCash.findUnique({
        where: { user_id: userId },
      });

      if (!pettyCash) {
        pettyCash = await tx.pettyCash.create({
          data: {
            user_id: userId,
            saldo_actual: Number(monto),
          },
        });
      } else {
        pettyCash = await tx.pettyCash.update({
          where: { user_id: userId },
          data: {
            saldo_actual: {
              increment: Number(monto),
            },
          },
        });
      }

      const deposit = await tx.pettyCashDeposit.create({
        data: {
          petty_cash_id: pettyCash.id,
          monto: Number(monto),
          descripcion: descripcion.trim(),
          fecha: new Date(),
        },
      });

      return { pettyCash, deposit };
    });

    safeRevalidate(["/gastos", "/dashboard/worker", "/reportes"]);

    return { success: true, ...result };
  } catch (error: any) {
    console.error("Error al registrar depósito de caja chica:", error);
    return { success: false, error: error.message || "No se pudo abonar a la caja chica." };
  }
}

/**
 * Server Action para crear un nuevo trabajador o administrador
 */
export async function createWorkerAction(nombre: string, email: string, rol: Role = Role.WORKER, saldoInicial: number = 0) {
  try {
    if (!nombre.trim()) throw new Error("El nombre es requerido.");
    if (!email.trim()) throw new Error("El email es requerido.");

    const existing = await prisma.user.findUnique({ where: { email: email.trim().toLowerCase() } });
    if (existing) throw new Error("Ya existe un usuario con este correo electrónico.");

    const user = await prisma.user.create({
      data: {
        nombre: nombre.trim(),
        email: email.trim().toLowerCase(),
        rol: rol,
        ...(saldoInicial > 0
          ? {
              pettyCash: {
                create: {
                  saldo_actual: Number(saldoInicial),
                  deposits: {
                    create: {
                      monto: Number(saldoInicial),
                      descripcion: "Asignación inicial de Caja Chica",
                    },
                  },
                },
              },
            }
          : {}),
      },
      include: {
        pettyCash: {
          include: { deposits: true },
        },
      },
    });

    safeRevalidate(["/gastos", "/dashboard/worker", "/reportes"]);
    return { success: true, user };
  } catch (error: any) {
    console.error("Error al crear trabajador:", error);
    return { success: false, error: error.message || "Error al crear el usuario." };
  }
}

export async function getUsersAction() {
  try {
    let users = await prisma.user.findMany({
      include: {
        pettyCash: {
          include: {
            deposits: {
              orderBy: { fecha: "desc" },
            },
          },
        },
        expenses: {
          orderBy: { fecha: "desc" },
        },
      },
      orderBy: { nombre: "asc" },
    });

    if (users.length === 0) {
      // Seed inicial si la base de datos está vacía
      const user1 = await prisma.user.create({
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
                  descripcion: "Fondo Fijo Inicial de Caja Chica",
                },
              },
            },
          },
        },
        include: {
          pettyCash: { include: { deposits: true } },
          expenses: true,
        },
      });

      const user2 = await prisma.user.create({
        data: {
          nombre: "Carlos Sánchez",
          email: "carlos.sanchez@empresa.com",
          rol: Role.WORKER,
          // Carlos no tiene caja chica (rinde solo movilidad para reembolso)
        },
        include: {
          pettyCash: { include: { deposits: true } },
          expenses: true,
        },
      });

      const admin = await prisma.user.create({
        data: {
          nombre: "María López (Admin)",
          email: "maria.lopez@empresa.com",
          rol: Role.ADMIN,
        },
        include: {
          pettyCash: { include: { deposits: true } },
          expenses: true,
        },
      });

      users = [user1, user2, admin];
    }

    return { success: true, users };
  } catch (error: any) {
    console.error("Error al obtener usuarios:", error);
    return { success: false, users: [], error: error.message };
  }
}

export async function getExpensesAction(filters?: {
  userId?: string;
  tipo?: ExpenseType;
  estado?: ExpenseStatus;
}) {
  try {
    const whereClause: any = {};
    if (filters?.userId) whereClause.user_id = filters.userId;
    if (filters?.tipo) whereClause.tipo = filters.tipo;
    if (filters?.estado) whereClause.estado = filters.estado;

    const expenses = await prisma.expense.findMany({
      where: whereClause,
      include: {
        user: {
          include: {
            pettyCash: true,
          },
        },
      },
      orderBy: { fecha: "desc" },
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
      // Fallback a almacenamiento DataURI local si Cloudinary demo falla en producción
      console.warn("Cloudinary upload failed, using high-res data URI fallback");
      return { success: true, secure_url: dataUri };
    }

    const data = await res.json();
    return { success: true, secure_url: data.secure_url };
  } catch (err: any) {
    console.warn("Cloudinary error, falling back gracefully:", err);
    return { success: false, error: err.message };
  }
}
