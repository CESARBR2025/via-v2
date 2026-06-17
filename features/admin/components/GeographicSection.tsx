import { InfraccionesPorColonia } from "./InfraccionesPorColonia"
import { InfraccionesPorMunicipio } from "./InfraccionesPorMunicipio"

export function GeographicSection() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-[16px] font-semibold text-[#0F172A]">
          Geolocalización
        </h2>
        <p className="text-sm text-[#64748B] mt-0.5">
          Distribución geográfica de las infracciones
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <InfraccionesPorColonia />
        <InfraccionesPorMunicipio />
      </div>
    </div>
  )
}
