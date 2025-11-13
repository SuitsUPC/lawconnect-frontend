"use client"

import { CheckCircle2 } from "lucide-react"

export default function LawyerServices() {
  const services = [
    {
      title: "Asesoría Legal Corporativa",
      description: "Asesoramiento completo en asuntos corporativos y comerciales",
    },
    {
      title: "Resolución de Disputas",
      description: "Representación en litigios civiles y comerciales",
    },
    {
      title: "Contratos y Transacciones",
      description: "Redacción y revisión de contratos comerciales",
    },
    {
      title: "Consultoría Empresarial",
      description: "Asesoramiento estratégico para empresas",
    },
  ]

  return (
    <div className="card-modern">
      <h2 className="text-2xl font-bold text-white mb-6">Servicios Ofrecidos</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {services.map((service, idx) => (
          <div key={idx} className="flex gap-3 p-3 rounded-lg bg-neutral-800/50 hover:bg-neutral-800 transition-colors">
            <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
            <div className="min-w-0">
              <h4 className="font-semibold text-white text-sm">{service.title}</h4>
              <p className="text-xs text-neutral-400 mt-1">{service.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
