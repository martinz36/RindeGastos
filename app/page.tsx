import Link from "next/link";

export default function Home() {
  return (
    <main className="max-w-4xl mx-auto p-8">
      <header className="mb-8 border-b border-slate-200 pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">RindeGastos</h1>
          <p className="text-slate-600 mt-1">Sistema de rendición de gastos, movilidad y caja chica</p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/dashboard/worker"
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-md shadow-indigo-100 transition-all flex items-center gap-2"
          >
            Dashboard Trabajador
          </Link>
          <Link
            href="/gastos"
            className="bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center gap-2"
          >
            Vista Admin Gastos
          </Link>
        </div>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h2 className="text-xs font-semibold uppercase text-slate-400 tracking-wider">Módulo Trabajador</h2>
          <p className="text-2xl font-bold text-indigo-600 mt-2">Worker Dashboard</p>
          <p className="text-xs text-slate-500 mt-2">Formulario ExpenseForm & lista de mis gastos en tiempo real.</p>
          <Link
            href="/dashboard/worker"
            className="inline-block mt-4 text-xs font-semibold text-indigo-600 hover:text-indigo-800"
          >
            Ir a /dashboard/worker &rarr;
          </Link>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h2 className="text-xs font-semibold uppercase text-slate-400 tracking-wider">Módulo Admin</h2>
          <p className="text-2xl font-bold text-emerald-600 mt-2">Aprobaciones</p>
          <p className="text-xs text-slate-500 mt-2">Aprobar o rechazar gastos con transacción de Prisma.</p>
          <Link
            href="/gastos"
            className="inline-block mt-4 text-xs font-semibold text-emerald-600 hover:text-emerald-800"
          >
            Ir a /gastos &rarr;
          </Link>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h2 className="text-xs font-semibold uppercase text-slate-400 tracking-wider">Comprobantes</h2>
          <p className="text-2xl font-bold text-amber-600 mt-2">Cloudinary</p>
          <p className="text-xs text-slate-500 mt-2">Formulario con foto de boleta/factura en <code className="text-amber-700 bg-amber-50 px-1 py-0.5 rounded">/gastos/nuevo</code>.</p>
          <Link
            href="/gastos/nuevo"
            className="inline-block mt-4 text-xs font-semibold text-amber-600 hover:text-amber-800"
          >
            Ver formulario Cloudinary &rarr;
          </Link>
        </div>
      </section>

      <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white p-6 rounded-2xl shadow-xl">
        <h3 className="text-lg font-bold mb-2">Panel de Navegación del Sistema</h3>
        <p className="text-slate-300 text-sm leading-relaxed">
          Accede directamente a la vista del trabajador en <code className="bg-indigo-950 text-indigo-300 px-2 py-0.5 rounded">/dashboard/worker</code> para registrar gastos con el <code className="bg-indigo-950 text-indigo-300 px-2 py-0.5 rounded">ExpenseForm</code> y consultar la tabla de rendiciones creada con Prisma ORM.
        </p>
      </div>
    </main>
  );
}
