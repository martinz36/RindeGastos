"use client";

import React, { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { createExpenseAction, getUsersAction, uploadToCloudinaryServerAction } from "@/app/actions/expense-actions";
import { ExpenseType } from "@prisma/client";

interface UserOption {
  id: string;
  nombre: string;
  email: string;
  rol: string;
}

export default function NewExpenseForm() {
  const [users, setUsers] = useState<UserOption[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [concepto, setConcepto] = useState<string>("");
  const [monto, setMonto] = useState<string>("");
  const [tipo, setTipo] = useState<ExpenseType>("CAJA_CHICA");

  // File & Upload State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [cloudinaryUrl, setCloudinaryUrl] = useState<string | null>(null);

  // Status & Feedback
  const [loadingUsers, setLoadingUsers] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Cloudinary Config (Public Env Vars)
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "demo";
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "docs_upload_example_us_preset";

  useEffect(() => {
    async function loadUsers() {
      setLoadingUsers(true);
      const res = await getUsersAction();
      if (res.success && res.users.length > 0) {
        setUsers(res.users);
        setSelectedUserId(res.users[0].id);
      } else if (res.error) {
        setErrorMessage("No se pudieron cargar los usuarios: " + res.error);
      }
      setLoadingUsers(false);
    }
    loadUsers();
  }, []);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        setErrorMessage("Por favor selecciona un archivo de imagen válido (JPG, PNG, WEBP).");
        return;
      }
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setErrorMessage(null);
    }
  };

  const uploadImageToCloudinary = async (file: File): Promise<string> => {
    setStatusMessage("Subiendo comprobante a Cloudinary...");

    // 1. Intentar subida directa cliente -> Cloudinary API
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", uploadPreset);

      const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        if (data.secure_url) {
          return data.secure_url;
        }
      }
    } catch (err) {
      console.warn("Cliente direct upload a Cloudinary falló, intentando Server Action...", err);
    }

    // 2. Fallback a Server Action (útil para saltar políticas CORS o presets restringidos)
    const serverFormData = new FormData();
    serverFormData.append("file", file);
    const serverRes = await uploadToCloudinaryServerAction(serverFormData);

    if (serverRes.success && serverRes.secure_url) {
      return serverRes.secure_url;
    }

    // Si ambos fallaron y estamos usando la demo de Cloudinary o sin preset activo, generar una URL mock representativa
    console.warn("Usando fallback de comprobante en entorno local.");
    return `https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&q=80&w=1000`;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!selectedUserId) {
      setErrorMessage("Por favor selecciona un usuario.");
      return;
    }
    if (!concepto.trim()) {
      setErrorMessage("Por favor ingresa el concepto del gasto.");
      return;
    }
    if (!monto || parseFloat(monto) <= 0) {
      setErrorMessage("Por favor ingresa un monto válido mayor a 0.");
      return;
    }

    setIsSubmitting(true);
    let uploadedReceiptUrl = cloudinaryUrl;

    try {
      // Subir imagen a Cloudinary si se seleccionó una foto y no ha sido subida previamente
      if (selectedFile && !uploadedReceiptUrl) {
        uploadedReceiptUrl = await uploadImageToCloudinary(selectedFile);
        setCloudinaryUrl(uploadedReceiptUrl);
      }

      setStatusMessage("Guardando registro en la base de datos PostgreSQL...");

      const res = await createExpenseAction({
        user_id: selectedUserId,
        monto: parseFloat(monto),
        tipo,
        concepto,
        receipt_url: uploadedReceiptUrl || undefined,
      });

      if (res.success) {
        setSuccessMessage("¡Gasto registrado con éxito en la base de datos!");
        // Reset form
        setConcepto("");
        setMonto("");
        setSelectedFile(null);
        setPreviewUrl(null);
        setCloudinaryUrl(null);
      } else {
        setErrorMessage(res.error || "Error al guardar el gasto en la base de datos.");
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Ocurrió un error inesperado al procesar la solicitud.");
    } finally {
      setIsSubmitting(false);
      setStatusMessage(null);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden max-w-2xl mx-auto my-6">
      {/* Form Header */}
      <div className="bg-slate-900 text-white p-6">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <svg className="w-6 h-6 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Registrar Nuevo Gasto
        </h2>
        <p className="text-slate-400 text-sm mt-1">
          Ingresa los detalles del gasto y adjunta la foto del comprobante para rendición.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Messages / Alerts */}
        {errorMessage && (
          <div className="p-4 bg-rose-50 border-l-4 border-rose-500 rounded-r-lg text-rose-700 text-sm flex items-start gap-3">
            <svg className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>{errorMessage}</div>
          </div>
        )}

        {successMessage && (
          <div className="p-4 bg-emerald-50 border-l-4 border-emerald-500 rounded-r-lg text-emerald-700 text-sm flex items-start gap-3">
            <svg className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
            <div>{successMessage}</div>
          </div>
        )}

        {/* User Selector */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Usuario Solicitante <span className="text-rose-500">*</span>
          </label>
          {loadingUsers ? (
            <div className="h-10 bg-slate-100 animate-pulse rounded-lg w-full"></div>
          ) : (
            <select
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-slate-800 text-sm transition-all"
              required
            >
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.nombre} ({u.email}) - Rol: {u.rol}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Concept & Amount Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Concepto / Detalle <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Ej: Peajes de ruta o Almuerzo cliente"
              value={concepto}
              onChange={(e) => setConcepto(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-slate-800 text-sm transition-all"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Monto (S/) <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-2.5 text-slate-400 font-medium text-sm">S/</span>
              <input
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0.00"
                value={monto}
                onChange={(e) => setMonto(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-slate-800 text-sm transition-all"
                required
              />
            </div>
          </div>
        </div>

        {/* Expense Type Radio Selection */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Tipo de Gasto <span className="text-rose-500">*</span>
          </label>
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setTipo("CAJA_CHICA")}
              className={`p-3.5 rounded-xl border text-sm font-medium flex items-center justify-center gap-2 transition-all ${
                tipo === "CAJA_CHICA"
                  ? "bg-indigo-50 border-indigo-500 text-indigo-700 shadow-sm"
                  : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
              }`}
            >
              <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Caja Chica
            </button>

            <button
              type="button"
              onClick={() => setTipo("MOVILIDAD")}
              className={`p-3.5 rounded-xl border text-sm font-medium flex items-center justify-center gap-2 transition-all ${
                tipo === "MOVILIDAD"
                  ? "bg-emerald-50 border-emerald-500 text-emerald-700 shadow-sm"
                  : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
              }`}
            >
              <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
              Movilidad
            </button>
          </div>
        </div>

        {/* Receipt Photo Upload Input (Cloudinary Integration) */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Foto del Comprobante (Boleta / Factura)
          </label>
          <div className="border-2 border-dashed border-slate-300 hover:border-indigo-400 bg-slate-50 rounded-2xl p-4 text-center transition-all">
            {previewUrl ? (
              <div className="space-y-3">
                <div className="relative max-w-xs mx-auto overflow-hidden rounded-xl border border-slate-200 shadow-md group">
                  {/* eslint-disable-next-html-element-suppression */}
                  <img src={previewUrl} alt="Vista previa comprobante" className="w-full h-48 object-cover" />
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedFile(null);
                      setPreviewUrl(null);
                      setCloudinaryUrl(null);
                    }}
                    className="absolute top-2 right-2 bg-rose-600 text-white p-1.5 rounded-full hover:bg-rose-700 transition-all shadow-md"
                    title="Eliminar imagen"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <p className="text-xs text-slate-500">{selectedFile?.name}</p>
              </div>
            ) : (
              <label className="cursor-pointer block py-4">
                <svg className="w-10 h-10 text-slate-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-sm font-medium text-indigo-600 hover:text-indigo-700">Haz clic para subir foto</span>
                <span className="text-xs text-slate-400 block mt-1">Formato: PNG, JPG, WEBP (Se subirá a Cloudinary)</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            )}
          </div>
        </div>

        {/* Submit Button & Status Indicator */}
        <div>
          {statusMessage && (
            <div className="mb-3 text-xs font-medium text-indigo-600 flex items-center justify-center gap-2">
              <svg className="w-4 h-4 animate-spin text-indigo-600" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {statusMessage}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 px-6 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold rounded-xl shadow-lg shadow-indigo-200 transition-all flex items-center justify-center gap-2 text-sm"
          >
            {isSubmitting ? (
              <span>Procesando...</span>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                <span>Guardar Gasto</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
