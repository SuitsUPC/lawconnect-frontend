import Link from "next/link"
import Navbar from "@/components/navbar"

export default function TermsPage() {
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
        <h1 className="text-4xl font-bold text-gray-900 mb-6">Términos y Condiciones</h1>
        <p className="text-gray-600 mb-4">
          Estos términos describen las condiciones bajo las cuales LawConnect presta sus
          servicios. Al utilizar nuestra plataforma aceptas cumplir con todas las políticas
          descritas a continuación.
        </p>
        <div className="space-y-6 text-gray-600 leading-relaxed">
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Uso de la plataforma</h2>
            <p>
              Los usuarios deben proporcionar información veraz y mantener la confidencialidad de
              sus credenciales. Cualquier uso indebido podrá causar la suspensión de la cuenta.
            </p>
          </section>
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Propiedad intelectual</h2>
            <p>
              Todos los contenidos, marcas y materiales pertenecen a sus respectivos propietarios
              y se utilizan únicamente con fines informativos dentro de la plataforma.
            </p>
          </section>
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Limitación de responsabilidad</h2>
            <p>
              LawConnect facilita la conexión entre usuarios, pero no participa directamente en
              la prestación de servicios legales. Cada profesional es responsable de los servicios
              que brinda.
            </p>
          </section>
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Contacto</h2>
            <p>
              Si tienes dudas sobre estos términos, escríbenos a{' '}
              <a href="mailto:soporte@lawconnect.com" className="text-slate-900 font-medium">
                soporte@lawconnect.com
              </a>
              .
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}

