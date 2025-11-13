"use client"

import { useState } from "react"
import Navbar from "@/components/navbar"
import CasesList from "@/components/cases-list"
import CaseFilters from "@/components/case-filters"
import { Briefcase } from "lucide-react"

function CasesPage() {
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [selectedType, setSelectedType] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")

  return (
    <div className="bg-gray-50 min-h-screen">
      <Navbar />
      <div className="pt-24">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-start gap-3">
              <Briefcase className="w-8 h-8 text-slate-700 mt-1" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-1">Mis Casos</h1>
                <p className="text-gray-600 text-sm">Gestiona todos tus casos - Filtra por estado, tipo y busca casos específicos</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Filters */}
            <div className="lg:col-span-1">
              <CaseFilters
                selectedStatus={selectedStatus}
                selectedType={selectedType}
                searchQuery={searchQuery}
                onStatusChange={setSelectedStatus}
                onTypeChange={setSelectedType}
                onSearchChange={setSearchQuery}
              />
            </div>

            {/* Cases List */}
            <div className="lg:col-span-3">
              <CasesList status={selectedStatus} type={selectedType} searchQuery={searchQuery} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CasesPage
