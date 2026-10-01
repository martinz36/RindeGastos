"use client";

import React, { useState, FormEvent, ChangeEvent } from "react";
import { createExpense } from "@/app/actions/worker-actions";
import { uploadToCloudinaryServerAction } from "@/app/actions/expense-actions";
import { ExpenseType } from "@prisma/client";
import { 
  Receipt, 
  Car, 
  UploadCloud, 
  CheckCircle2, 
  AlertCircle, 
  MapPin, 
  FileText, 
  Calendar, 
  X,
  CreditCard,
  Building,
  HelpCircle
} from "lucide-react";

interface ExpenseFormProps {
  currentUserId?: string;
  hasPettyCash?: boolean;
  saldoActual?: number;
  onSuccess?: () => void;
}

export default function ExpenseForm({
  currentUserId,
  hasPettyCash = true,
  saldoActual = 0,
  onSuccess,
}: ExpenseFormProps) {
  const [tipo, setTipo] = useState<ExpenseType>("CAJA_CHICA");
  const [concepto, setConcepto] = useState<string>("");
  const [monto, setMonto] = useState<string>("");
  const [fecha, setFecha] = useState<string>(new Date().toISOString().split("T")[0]);

  // Campos para Movilidad
  const [origen, setOrigen] = useState<string>("");
  const [destino, setDestino] = useState<string>("");
  const [motivo, setMotivo] = useState<string>("");

  // Campos para Caja Chica
  const [comprobanteTipo, setComprobanteTipo] = useState<string>("BOLETA");
  const [comprobanteNumero, setComprobanteNumero] = useState<string>("");
  const [receiptUrl, setReceiptUrl] = useState<string>("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Estados de proceso
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setReceiptUrl("");
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setReceiptUrl("");
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!concepto.trim()) {
      setErrorMessage("Por favor ingresa un concepto o descripción para la rendición.");
      return;
    }
    const numMonto = parseFloat(monto);
    if (isNaN(numMonto) || numMonto <= 0) {
      setErrorMessage("Por favor ingresa un monto válido mayor a S/ 0.00");
      return;
    }

    if (tipo === "MOVILIDAD") {
      if (!origen.trim() || !destino.trim()) {
        setErrorMessage("Para rendir movilidad debes ingresar el origen y el destino del traslado.");
        return;
      }
      if (!motivo.trim()) {
        setErrorMessage("Debes detallar el motivo laboral de la movilidad.");
        return;
      }
    }

    setIsSubmitting(true);

    try {
      let finalReceiptUrl = receiptUrl;

      // Subir archivo a Cloudinary / Servidor si se adjuntó uno nuevo
      if (selectedFile && !finalReceiptUrl) {
        setIsUploading(true);
        const formData = new FormData();
        formData.append("file", selectedFile);
        const uploadRes = await uploadToCloudinaryServerAction(formData);
        if (uploadRes.success && uploadRes.secure_url) {
          finalReceiptUrl = uploadRes.secure_url;
        } else {
          console.warn("No se pudo subir a Cloudinary, guardando con referencia local.");
        }
        setIsUploading(false);
      }

      const res = await createExpense({
        userId: currentUserId,
        tipo,
        concepto: concepto.trim(),
        monto: numMonto,
        fecha: new Date(fecha),
        origen: tipo === "MOVILIDAD" ? origen.trim() : undefined,
        destino: tipo === "MOVILIDAD" ? destino.trim() : undefined,
        motivo: tipo === "MOVILIDAD" ? motivo.trim() : undefined,
        comprobanteTipo: tipo === "CAJA_CHICA" ? comprobanteTipo : "DECLARACION_JURADA",
        comprobanteNumero: tipo === "CAJA_CHICA" ? comprobanteNumero.trim() : undefined,
        receipt_url: finalReceiptUrl || undefined,
      });

      if (res.success) {
        setSuccessMessage(
          tipo === "MOVILIDAD"
            ? "¡Gasto de movilidad registrado correctamente! Pendiente de aprobación para desembolso."
            : "¡Gasto de caja chica registrado! Pendiente de validación de comprobante."
        );
        // Reset campos
        setConcepto("");
        setMonto("");
        setOrigen("");
        setDestino("");
        setMotivo("");
        setComprobanteNumero("");
        removeFile();

        if (onSuccess) onSuccess();
      } else {
        setErrorMessage(res.error || "No se pudo registrar el gasto.");
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Ocurrió un error inesperado al registrar el gasto.");
    } finally {
      setIsSubmitting(false);
      setIsUploading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 sm:p-7 relative overflow-hidden transition-all">
      {/* Indicador superior */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-slate-100 gap-3 mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
              {tipo === "CAJA_CHICA" ? <Receipt className="w-5 h-5" /> : <Car className="w-5 h-5" />}
            </span>
            Nueva Rendición de Gastos
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Registra tus gastos operativos con aprobación directa del área contable.
          </p>
        </div>

        {/* Saldo disponible si aplica */}
        {hasPettyCash && tipo === "CAJA_CHICA" && (
          <div className="bg-emerald-50 border border-emerald-200/80 px-4 py-2 rounded-xl flex items-center gap-3">
            <CreditCard className="w-4 h-4 text-emerald-600" />
            <div>
              <p className="text-[10px] font-semibold text-emerald-700 uppercase tracking-wider">Tu Saldo en Caja Chica</p>
              <p className="text-sm font-extrabold text-emerald-900">S/ {Number(saldoActual).toFixed(2)}</p>
            </div>
          </div>
        )}
      </div>

      {/* Selector de Tipo de Gasto */}
      <div className="grid grid-cols-2 gap-3 mb-6 p-1.5 bg-slate-100/80 rounded-xl">
        <button
          type="button"
          onClick={() => {
            setTipo("CAJA_CHICA");
            setErrorMessage(null);
          }}
          className={`py-3 px-4 rounded-lg font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all ${
            tipo === "CAJA_CHICA"
              ? "bg-white text-indigo-700 shadow-sm border border-slate-200"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <Receipt className="w-4 h-4" />
          <span>Gasto de Caja Chica</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setTipo("MOVILIDAD");
            setErrorMessage(null);
          }}
          className={`py-3 px-4 rounded-lg font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all ${
            tipo === "MOVILIDAD"
              ? "bg-white text-blue-700 shadow-sm border border-slate-200"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <Car className="w-4 h-4" />
          <span>Movilidad / Transporte</span>
        </button>
      </div>

      {/* Alertas */}
      {errorMessage && (
        <div className="mb-5 p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-3 text-rose-700 text-xs sm:text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-rose-500" />
          <div>
            <strong className="font-semibold block">Error al registrar</strong>
            {errorMessage}
          </div>
        </div>
      )}

      {successMessage && (
        <div className="mb-5 p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-3 text-emerald-800 text-xs sm:text-sm">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5 text-emerald-600" />
          <div>
            <strong className="font-semibold block">Operación exitosa</strong>
            {successMessage}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Fila 1: Monto y Fecha */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Monto en Soles <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">S/</span>
              <input
                type="number"
                step="0.01"
                min="0.10"
                value={monto}
                onChange={(e) => setMonto(e.target.value)}
                placeholder="0.00"
                className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-base font-bold focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Fecha del Gasto <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="date"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm font-medium focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                required
              />
            </div>
          </div>
        </div>

        {/* Fila 2: Concepto General */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            {tipo === "MOVILIDAD" ? "Descripción del Traslado" : "Concepto del Gasto"} <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            value={concepto}
            onChange={(e) => setConcepto(e.target.value)}
            placeholder={tipo === "MOVILIDAD" ? "Ej. Movilidad para reunión de coordinación y trámites bancarios" : "Ej. Compra de útiles de escritorio para oficina"}
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
            required
          />
        </div>

        {/* CAMPOS EXCLUSIVOS DE MOVILIDAD */}
        {tipo === "MOVILIDAD" && (
          <div className="p-4 sm:p-5 bg-blue-50/60 border border-blue-100 rounded-2xl space-y-4">
            <div className="flex items-center gap-2 text-blue-900 font-bold text-xs uppercase tracking-wider pb-1">
              <MapPin className="w-4 h-4 text-blue-600" />
              Detalle de Ruta y Desplazamiento (SUNAT)
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Punto de Origen <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={origen}
                  onChange={(e) => setOrigen(e.target.value)}
                  placeholder="Ej. Sede Central Miraflores / Domicilio"
                  className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Punto de Destino <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={destino}
                  onChange={(e) => setDestino(e.target.value)}
                  placeholder="Ej. Almacén Depósito Callao / Banco de la Nación"
                  className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Motivo del Desplazamiento <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={2}
                value={motivo}
                onChange={(e) => setMotivo(e.target.value)}
                placeholder="Indica la justificación de la labor realizada en dicho destino..."
                className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div className="flex items-start gap-2.5 text-xs text-blue-800 bg-white/80 p-3 rounded-xl border border-blue-200/60">
              <HelpCircle className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
              <span>
                <strong>Aviso Contable:</strong> La movilidad para gestiones laborales no exige comprobante fiscal con IGV. Este registro genera la <em>Planilla de Gastos de Movilidad</em> con valor contable y legal para la empresa.
              </span>
            </div>
          </div>
        )}

        {/* CAMPOS EXCLUSIVOS DE CAJA CHICA */}
        {tipo === "CAJA_CHICA" && (
          <div className="p-4 sm:p-5 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-4">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-xs uppercase tracking-wider pb-1">
              <FileText className="w-4 h-4 text-indigo-600" />
              Datos del Comprobante Fiscal
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Tipo de Documento</label>
                <select
                  value={comprobanteTipo}
                  onChange={(e) => setComprobanteTipo(e.target.value)}
                  className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-800 focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="BOLETA">Boleta de Venta</option>
                  <option value="FACTURA">Factura Comercial</option>
                  <option value="TICKET">Ticket / Boleta Electrónica</option>
                  <option value="RECIBO">Recibo Simple</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">N° de Comprobante / Serie</label>
                <input
                  type="text"
                  value={comprobanteNumero}
                  onChange={(e) => setComprobanteNumero(e.target.value)}
                  placeholder="Ej. B001-002342"
                  className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Subida de Foto / Voucher */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Foto del Voucher, Boleta o Factura
              </label>

              {previewUrl ? (
                <div className="relative rounded-xl overflow-hidden border border-slate-300 max-w-sm">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={previewUrl} alt="Comprobante adjunto" className="w-full h-44 object-cover" />
                  <button
                    type="button"
                    onClick={removeFile}
                    className="absolute top-2 right-2 bg-rose-600 hover:bg-rose-700 text-white p-1.5 rounded-full shadow-md transition-colors"
                    title="Eliminar foto"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <div className="p-2 bg-white text-xs font-medium text-slate-700 flex items-center justify-between">
                    <span className="truncate">{selectedFile?.name || "Comprobante cargado"}</span>
                    <span className="text-emerald-600 font-bold">Listo</span>
                  </div>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-300 hover:border-indigo-400 hover:bg-indigo-50/30 rounded-xl cursor-pointer transition-all bg-white">
                  <UploadCloud className="w-7 h-7 text-indigo-500 mb-2" />
                  <span className="text-xs font-bold text-slate-700">Toma una foto o selecciona el comprobante</span>
                  <span className="text-[11px] text-slate-400 mt-0.5">JPG, PNG o WEBP (máx. 5 MB)</span>
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
        )}

        {/* Botón de Enviar */}
        <button
          type="submit"
          disabled={isSubmitting || isUploading}
          className="w-full py-3.5 px-6 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-bold rounded-xl text-sm shadow-md shadow-indigo-100 hover:shadow-lg hover:shadow-indigo-200 transition-all flex items-center justify-center gap-2"
        >
          {isSubmitting || isUploading ? (
            <>
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>{isUploading ? "Subiendo comprobante..." : "Enviando a aprobación..."}</span>
            </>
          ) : (
            <>
              <CheckCircle2 className="w-4 h-4" />
              <span>Registrar Rendición</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}
