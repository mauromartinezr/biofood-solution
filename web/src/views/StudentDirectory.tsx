import React, { useEffect, useState } from 'react'
import {
  getStudentsSummaryUseCase,
  getSchoolsConsumptionUseCase,
  getRechargeTrendUseCase,
  getStudentsDirectoryUseCase
} from '../features/students/use_case_students'
import type {
  StudentSummaryDto,
  SchoolConsumptionDto,
  RechargeTrendDto,
  StudentDirectoryItemDto
} from '../features/students/dto/dto_students'

// Local model that map directly to the item DTO
interface Student {
  id: string
  name: string
  parent: string
  balance: number
  school: string
  purchases: number
  activity: 'Alto' | 'Medio' | 'Bajo'
}

interface StudentDirectoryProps {
  globalSearch?: string
  onSelectStudent?: (student: Student) => void
}

const StudentDirectory: React.FC<StudentDirectoryProps> = ({ globalSearch = '', onSelectStudent }) => {
  // DB States
  const [summary, setSummary] = useState<StudentSummaryDto | null>(null)
  const [schoolsConsumption, setSchoolsConsumption] = useState<SchoolConsumptionDto[]>([])
  const [rechargeTrend, setRechargeTrend] = useState<RechargeTrendDto[]>([])
  const [students, setStudents] = useState<Student[]>([])
  
  // UI States
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedSchool, setSelectedSchool] = useState('Todos')
  const [localFilter, setLocalFilter] = useState('')
  const [trendTab, setTrendTab] = useState<'semanal' | 'mensual'>('mensual')

  useEffect(() => {
    const loadDirectoryData = async () => {
      setLoading(true)
      setError(null)
      try {
        const [sumData, consData, trendData, dirResponse] = await Promise.all([
          getStudentsSummaryUseCase(),
          getSchoolsConsumptionUseCase(),
          getRechargeTrendUseCase(),
          getStudentsDirectoryUseCase(1, 1000) // high limit for local filtering
        ])

        setSummary(sumData)
        setSchoolsConsumption(consData)
        setRechargeTrend(trendData)
        
        // Map DTO items to local state structure
        const mappedStudents: Student[] = (dirResponse.directorio || []).map((item: StudentDirectoryItemDto) => ({
          id: `#${item.id}`,
          name: item.nombre_estudiante,
          parent: item.nombre_padre || 'Sin tutor',
          balance: item.saldo_actual,
          school: item.colegio,
          purchases: item.total_compras,
          activity: item.nivel_actividad
        }))
        setStudents(mappedStudents)
      } catch (err: any) {
        console.error(err)
        setError(err.message || 'Error al conectar con el directorio de BioFood.')
      } finally {
        setLoading(false)
      }
    };

    loadDirectoryData()
  }, [])

  // Dynamic local search filtering
  const filteredStudents = students.filter((student) => {
    const matchesGlobalSearch =
      student.name.toLowerCase().includes(globalSearch.toLowerCase()) ||
      student.parent.toLowerCase().includes(globalSearch.toLowerCase()) ||
      student.id.includes(globalSearch)
    
    const matchesLocalFilter = student.name.toLowerCase().includes(localFilter.toLowerCase())
    const matchesSchool = selectedSchool === 'Todos' || student.school === selectedSchool

    return matchesGlobalSearch && matchesLocalFilter && matchesSchool
  })

  // Dynamic SVG Chart calculation
  const maxMonto = Math.max(...rechargeTrend.map((t) => t.monto_total)) || 1
  const svgPoints = rechargeTrend.map((t, idx) => {
    const x = rechargeTrend.length > 1 ? (idx / (rechargeTrend.length - 1)) * 400 : 200
    // Keep it padded in the SVG height (150px)
    const y = 130 - (t.monto_total / maxMonto) * 100
    return { x, y, ...t }
  })
  const pathD = svgPoints.map((p, idx) => `${idx === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ')

  const getMonthName = (dateStr: string) => {
    try {
      const date = new Date(dateStr)
      return date.toLocaleString('es-CO', { month: 'short' })
    } catch {
      return dateStr
    }
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto py-20 px-6 text-center select-none">
        <div className="flex flex-col items-center justify-center gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-outline-variant border-t-brand-blue animate-spin"></div>
          <p className="text-body-md text-on-surface-variant font-medium">Cargando directorio de estudiantes...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto py-20 px-6 text-center select-none">
        <div className="bg-error-container/30 border border-error/20 rounded-2xl p-8 max-w-xl mx-auto space-y-4">
          <span className="material-symbols-outlined text-error text-[48px]">database_alert</span>
          <h2 className="text-title-lg font-bold text-error">Error de Conexión</h2>
          <p className="text-body-md text-on-surface-variant leading-relaxed">
            {error}. Asegúrate de que el backend de Go esté corriendo en <code>http://localhost:8080</code>.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-5 py-2 bg-brand-blue hover:opacity-90 active:scale-[0.98] text-on-primary rounded-xl font-bold text-label-md transition-all shadow-md cursor-pointer"
          >
            Reintentar Conexión
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto space-y-gutter select-none">
      {/* Page Header & Global Metrics */}
      <section className="space-y-6">
        <div>
          <h1 className="font-display-lg text-display-lg text-on-surface font-bold animate-fade-in">
            Directorio Maestro de Estudiantes
          </h1>
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            Consulta y administración de expedientes nutricionales
          </p>
        </div>
        
        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
            {/* Metric Card 1 */}
            <div className="data-card p-6 flex items-center gap-6">
              <div className="w-12 h-12 bg-brand-blue-container/30 rounded-lg flex items-center justify-center text-brand-blue shadow-sm">
                <span className="material-symbols-outlined text-[32px]">group</span>
              </div>
              <div>
                <p className="font-label-md text-label-md text-on-surface-variant uppercase font-semibold">TOTAL ESTUDIANTES</p>
                <p className="font-headline-lg text-headline-lg font-bold text-on-surface">
                  {summary.total_estudiantes.toLocaleString('es-CO')}
                </p>
              </div>
            </div>
            {/* Metric Card 2 */}
            <div className="data-card p-6 flex items-center gap-6">
              <div className="w-12 h-12 bg-secondary-container/20 rounded-lg flex items-center justify-center text-on-secondary-container shadow-sm">
                <span className="material-symbols-outlined text-[32px]">payments</span>
              </div>
              <div>
                <p className="font-label-md text-label-md text-on-surface-variant uppercase font-semibold">GASTO PROMEDIO</p>
                <p className="font-headline-lg text-headline-lg font-bold text-on-surface">
                  ${summary.gasto_promedio.toLocaleString('es-CO', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
                </p>
              </div>
            </div>
            {/* Metric Card 3 */}
            <div className="data-card p-6 flex items-center gap-6">
              <div className="w-12 h-12 bg-error-container/40 rounded-lg flex items-center justify-center text-error shadow-sm">
                <span className="material-symbols-outlined text-[32px]">warning</span>
              </div>
              <div>
                <p className="font-label-md text-label-md text-on-surface-variant uppercase font-semibold">SALDOS NEGATIVOS / BAJOS</p>
                <p className="font-headline-lg text-headline-lg font-bold text-error">
                  {summary.saldos_bajos_count.toLocaleString('es-CO')}
                </p>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Charts Section */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-gutter">
        {/* Consumption Chart */}
        <div className="data-card p-6 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start mb-6">
              <h3 className="font-title-md text-title-md text-on-surface font-bold">Consumo por Colegio</h3>
              <span className="material-symbols-outlined text-on-surface-variant cursor-pointer">more_vert</span>
            </div>
            <div className="space-y-8 py-2">
              {schoolsConsumption.map((sc, idx) => {
                const colorClass =
                  idx === 0
                    ? 'bg-brand-blue'
                    : idx === 1
                    ? 'bg-brand-secondary'
                    : 'bg-tertiary';
                return (
                  <div key={sc.colegio} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-body-md text-on-surface font-semibold">{sc.colegio}</span>
                      <span className="font-bold text-on-background text-label-md">{sc.porcentaje}%</span>
                    </div>
                    <div className="w-full bg-outline-variant/30 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-full ${colorClass} transition-all duration-700 ease-out`}
                        style={{ width: `${sc.porcentaje}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Trend Chart */}
        <div className="data-card p-6 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-6">
            <h3 className="font-title-md text-title-md text-on-surface font-bold">Tendencia de Recargas</h3>
            <div className="flex items-center gap-1 bg-surface-container rounded-lg p-1">
              <button
                onClick={() => setTrendTab('semanal')}
                className={`px-3 py-1 text-label-md rounded transition-colors cursor-pointer ${
                  trendTab === 'semanal'
                    ? 'bg-brand-blue text-on-primary font-bold shadow-sm'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                Semanal
              </button>
              <button
                onClick={() => setTrendTab('mensual')}
                className={`px-3 py-1 text-label-md rounded transition-colors cursor-pointer ${
                  trendTab === 'mensual'
                    ? 'bg-brand-blue text-on-primary font-bold shadow-sm'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                Mensual
              </button>
            </div>
          </div>

          <div className="h-56 relative flex flex-col">
            <div className="flex-grow flex relative">
              {/* Y-Axis Labels */}
              <div className="flex flex-col justify-between py-2 pr-4 text-right text-label-sm text-on-surface-variant w-12 shrink-0 font-semibold">
                <span>${(maxMonto / 1000000).toFixed(1)}M</span>
                <span>${((maxMonto * 0.75) / 1000000).toFixed(1)}M</span>
                <span>${((maxMonto * 0.5) / 1000000).toFixed(1)}M</span>
                <span>${((maxMonto * 0.25) / 1000000).toFixed(1)}M</span>
                <span>$0</span>
              </div>
              <div className="flex-grow relative">
                {/* Grid lines */}
                <div className="absolute inset-0 flex flex-col justify-between py-2">
                  <div className="border-b border-outline-variant/10 w-full"></div>
                  <div className="border-b border-outline-variant/10 w-full"></div>
                  <div className="border-b border-outline-variant/10 w-full"></div>
                  <div className="border-b border-outline-variant/10 w-full"></div>
                  <div className="border-b border-outline-variant/30 w-full"></div>
                </div>
                <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 400 150">
                  {/* Dynamic Math-driven SVG Path */}
                  {pathD && (
                    <path
                      d={pathD}
                      fill="none"
                      stroke="#0058bc"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2.5"
                      className="transition-all duration-700"
                    />
                  )}
                  {/* Dynamic circle points */}
                  {svgPoints.map((p, idx) => (
                    <circle
                      key={idx}
                      cx={p.x}
                      cy={p.y}
                      fill="#0058bc"
                      r="4"
                      className="transition-all duration-700 hover:r-6 cursor-pointer"
                    />
                  ))}
                </svg>
              </div>
            </div>
            {/* X-Axis Labels dynamically fetched from months */}
            <div className="flex justify-between mt-2 ml-12 px-2">
              {rechargeTrend.map((t, idx) => (
                <span
                  key={idx}
                  className={`text-label-sm uppercase font-semibold ${
                    idx === rechargeTrend.length - 1
                      ? 'text-brand-blue font-bold'
                      : 'text-on-surface-variant'
                  }`}
                >
                  {getMonthName(t.mes)}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Main Table Section */}
      <section className="data-card overflow-hidden bg-white">
        <div className="p-6 flex flex-col md:flex-row justify-between items-center gap-4 border-b border-outline-variant/30">
          <h3 className="font-title-md text-title-md text-on-surface font-bold">Directorio Detallado</h3>
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <div className="relative flex-grow md:flex-grow-0">
              <input
                type="text"
                value={localFilter}
                onChange={(e) => setLocalFilter(e.target.value)}
                placeholder="Filtrar por nombre..."
                className="bg-surface border border-outline-variant rounded-lg px-10 py-2 text-body-md w-full md:w-64 focus:ring-brand-blue focus:border-brand-blue outline-none"
              />
              <span className="material-symbols-outlined absolute left-2 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">
                filter_list
              </span>
            </div>
            <select
              value={selectedSchool}
              onChange={(e) => setSelectedSchool(e.target.value)}
              className="bg-surface border border-outline-variant rounded-lg px-3 py-2 text-label-md outline-none focus:border-brand-blue cursor-pointer"
            >
              <option value="Todos">Todos los Colegios</option>
              {/* Extract unique schools dynamically */}
              {Array.from(new Set(students.map((s) => s.school))).map((sch) => (
                <option key={sch} value={sch}>
                  {sch}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-surface-container-low text-on-surface-variant border-b border-outline-variant/30">
                <th className="px-6 py-4 font-label-md text-label-md uppercase tracking-wider font-semibold">Nombre del Estudiante</th>
                <th className="px-6 py-4 font-label-md text-label-md uppercase tracking-wider font-semibold">Nombre del Padre</th>
                <th className="px-6 py-4 font-label-md text-label-md uppercase tracking-wider font-semibold">Saldo Actual</th>
                <th className="px-6 py-4 font-label-md text-label-md uppercase tracking-wider font-semibold">Total Compras</th>
                <th className="px-6 py-4 font-label-md text-label-md uppercase tracking-wider font-semibold">Nivel de Actividad</th>
                <th className="px-6 py-4 font-label-md text-label-md uppercase tracking-wider font-semibold"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20">
              {filteredStudents.length > 0 ? (
                filteredStudents.map((student) => {
                  const isLowBalance = student.balance < 100
                  return (
                    <tr key={student.id} className="hover:bg-brand-blue-container/10 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center font-bold text-on-surface text-xs shrink-0 shadow-sm border border-outline-variant/10">
                            <span className="material-symbols-outlined text-[16px]">person</span>
                          </div>
                          <div>
                            <p className="font-bold text-on-surface text-body-md">{student.name}</p>
                            <p className="text-body-sm text-on-surface-variant">ID: {student.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-body-md text-on-surface-variant font-medium">{student.parent}</td>
                      <td className={`px-6 py-4 font-bold text-body-md ${isLowBalance ? 'text-error' : 'text-brand-blue'}`}>
                        ${student.balance.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-bold text-body-md text-on-surface">{student.purchases}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                          student.activity === 'Alto'
                            ? 'bg-secondary-container/30 text-secondary'
                            : student.activity === 'Medio'
                            ? 'bg-brand-blue-container/20 text-brand-blue'
                            : 'bg-outline-variant/30 text-on-surface-variant'
                        }`}>
                          {student.activity}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => {
                            // Extract just the numerical ID for routing
                            const rawId = student.id.replace('#', '')
                            onSelectStudent?.({ ...student, id: rawId })
                          }}
                          className="text-brand-blue font-bold text-label-md hover:underline cursor-pointer transition-all active:scale-[0.98] select-none"
                        >
                          Ver Detalle
                        </button>
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-on-surface-variant font-medium">
                    No se encontraron estudiantes con los filtros aplicados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="p-6 bg-surface-container-low flex justify-between items-center">
          <span className="text-body-sm text-on-surface-variant font-medium">
            Mostrando {filteredStudents.length} de {students.length} estudiantes
          </span>
          <div className="flex gap-1">
            <button className="p-2 rounded hover:bg-surface-container-high transition-colors cursor-pointer flex items-center justify-center border border-outline-variant/10 bg-white">
              <span className="material-symbols-outlined text-[18px]">chevron_left</span>
            </button>
            <button className="px-3.5 py-1 rounded bg-brand-blue text-on-primary font-bold text-label-md cursor-pointer shadow-sm">
              1
            </button>
            <button className="p-2 rounded hover:bg-surface-container-high transition-colors cursor-pointer flex items-center justify-center border border-outline-variant/10 bg-white">
              <span className="material-symbols-outlined text-[18px]">chevron_right</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}

export default StudentDirectory
