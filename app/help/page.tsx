import Link from "next/link"
import Navbar from "@/components/navbar"

export default function HelpPage() {
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
        <h1 className="text-4xl font-bold text-gray-900 mb-6">Centro de Ayuda</h1>
        <p className="text-gray-600 mb-4">
          ¿Tienes dudas sobre cómo usar LawConnect? Aquí encontrarás respuestas rápidas y formas
          de contactar a nuestro equipo de soporte.
        </p>
        <div className="space-y-6 text-gray-600 leading-relaxed">
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Preguntas frecuentes</h2>
            <ul className="list-disc ml-6 space-y-2">
              <li>¿Cómo registro mi cuenta como abogado o cliente?</li>
              <li>¿Cómo adjunto documentos a un caso?</li>
              <li>¿Puedo cambiar el abogado asignado a un caso?</li>
            </ul>
            <p className="mt-2">
              Si tu pregunta no está aquí, escríbenos para ayudarte en minutos.
            </p>
          </section>
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Soporte</h2>
            <p>
              Envíanos un correo a{' '}
              <a href="mailto:soporte@lawconnect.com" className="text-slate-900 font-medium">
                soporte@lawconnect.com
              </a>{' '}
              o abre un ticket desde tu panel de usuario.
            </p>
          </section>
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Estado del servicio</h2>
            <p>
              Consulta cualquier novedad operativa en{' '}
              <a
                href="https://status.lawconnect.com"
                target="_blank"
                rel="noreferrer"
                className="text-slate-900 font-medium"
              >
                status.lawconnect.com
              </a>
              .
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}

