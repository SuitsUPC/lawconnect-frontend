import Link from "next/link"
import Navbar from "@/components/navbar"

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-3xl mx-auto px-6 py-24">
        <Link
          href="/"
          className="inline-flex items-center text-sm font-medium text-slate-900 hover:text-slate-700 mb-8"
        >
          ← Volver al inicio
        </Link>
        <h1 className="text-4xl font-bold text-gray-900 mb-6">Sobre LawConnect</h1>
        <p className="text-gray-600 mb-4">
          LawConnect es una plataforma construida para conectar a clientes con abogados
          especializados y facilitar la gestión de casos legales desde un solo lugar.
        </p>
        <div className="space-y-6 text-gray-600 leading-relaxed">
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Nuestra misión</h2>
            <p>
              Simplificar el acceso a servicios legales de calidad, ofreciendo herramientas
              digitales que permitan colaborar de forma segura y transparente entre clientes y
              profesionales del derecho.
            </p>
          </section>
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Lo que ofrecemos</h2>
            <ul className="list-disc ml-6 space-y-2">
              <li>Gestión centralizada de casos y documentos.</li>
              <li>Sistema de mensajes y seguimiento en tiempo real.</li>
              <li>Perfiles verificados de abogados con sus especialidades.</li>
              <li>Experiencia moderna, segura y disponible desde cualquier dispositivo.</li>
            </ul>
          </section>
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Nuestro equipo</h2>
            <p>
              Somos un equipo multidisciplinario de profesionales legales y desarrolladores que
              creen en la transformación digital del sector jurídico en Latinoamérica.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}

