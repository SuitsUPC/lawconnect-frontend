import Link from "next/link"
import Navbar from "@/components/navbar"

export default function PrivacyPage() {
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
        <h1 className="text-4xl font-bold text-gray-900 mb-6">Política de Privacidad</h1>
        <p className="text-gray-600 mb-4">
          La protección de tus datos personales es una prioridad para LawConnect. Esta política
          describe qué información recopilamos, cómo la usamos y cómo la mantenemos segura.
        </p>
        <div className="space-y-6 text-gray-600 leading-relaxed">
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Información recopilada</h2>
            <p>
              Recopilamos datos de registro, información de perfil, archivos adjuntos y métricas
              de uso para mejorar la experiencia del servicio.
            </p>
          </section>
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Uso de la información</h2>
            <p>
              Tus datos se utilizan para operar la plataforma, facilitar la comunicación entre
              usuarios y mantener la seguridad. No vendemos tu información a terceros.
            </p>
          </section>
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Seguridad</h2>
            <p>
              Aplicamos buenas prácticas de cifrado y controles de acceso. Si detectamos un
              incidente, te notificaremos conforme a las leyes aplicables.
            </p>
          </section>
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Tus derechos</h2>
            <p>
              Puedes solicitar la actualización o eliminación de tus datos escribiendo a{' '}
              <a href="mailto:privacidad@lawconnect.com" className="text-slate-900 font-medium">
                privacidad@lawconnect.com
              </a>
              .
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}

