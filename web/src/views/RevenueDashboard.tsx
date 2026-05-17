import React, { useEffect, useState } from 'react'
import {
  getTopSoldProductsUseCase,
  getSchoolsPerformanceUseCase,
  getGlobalMetricsUseCase,
  getRechargePatternsUseCase
} from '../features/dashboard/use_case_dashboard'
import type {
  TopProductDto,
  SchoolPerformanceDto,
  GlobalMetricsDto,
  RechargePatternDto
} from '../features/dashboard/dto/dto_dashboard'

const RevenueDashboard: React.FC = () => {
  const [topProducts, setTopProducts] = useState<TopProductDto[]>([])
  const [schoolsPerformance, setSchoolsPerformance] = useState<SchoolPerformanceDto[]>([])
  const [globalMetrics, setGlobalMetrics] = useState<GlobalMetricsDto | null>(null)
  const [rechargePatterns, setRechargePatterns] = useState<RechargePatternDto[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadDashboardData = async () => {
      setLoading(true)
      setError(null)
      try {
        const [products, schools, metrics, patterns] = await Promise.all([
          getTopSoldProductsUseCase(),
          getSchoolsPerformanceUseCase(),
          getGlobalMetricsUseCase(),
          getRechargePatternsUseCase()
        ])
        setTopProducts(products)
        setSchoolsPerformance(schools)
        setGlobalMetrics(metrics)
        setRechargePatterns(patterns)
      } catch (err: any) {
        console.error(err)
        setError(err.message || 'Error al conectar con la base de datos de BioFood.')
      } finally {
        setLoading(false)
      }
    };

    loadDashboardData()
  }, [])

  // Helper to format large revenue numbers
  const formatM = (num: number) => {
    return `${(num / 1000000).toFixed(1)}M`
  }

  if (loading) {
    return (
      <div className="max-w-container-max mx-auto py-20 px-6 text-center select-none">
        <div className="flex flex-col items-center justify-center gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-outline-variant border-t-brand-blue animate-spin"></div>
          <p className="text-body-md text-on-surface-variant font-medium">Cargando analítica desde la base de datos...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-container-max mx-auto py-20 px-6 text-center select-none">
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
    <div className="max-w-container-max mx-auto space-y-8 select-none">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-headline-lg font-bold text-on-surface">Inteligencia de Ingresos</h2>
          <p className="text-body-sm text-on-surface-variant">Análisis de Ventas y Recargas de Apoderados</p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 rounded-lg border border-outline text-on-surface text-label-md font-semibold hover:bg-surface-container-low transition-colors flex items-center gap-2 cursor-pointer bg-white shadow-sm">
            <span className="material-symbols-outlined text-[18px]">calendar_today</span>
            Últimos 30 días
          </button>
          <button className="px-4 py-2 rounded-lg bg-brand-blue text-white text-label-md font-semibold hover:opacity-90 transition-all flex items-center gap-2 cursor-pointer shadow-md">
            <span className="material-symbols-outlined text-[18px]">download</span>
            Exportar Reporte
          </button>
        </div>
      </div>

      {/* Dashboard Grid */}
      <div className="grid grid-cols-12 gap-gutter">
        {/* Main Content (8 cols) */}
        <div className="col-span-12 lg:col-span-8 space-y-gutter">
          {/* 1. Top Products */}
          <div className="data-card p-6">
            <div className="mb-6">
              <h3 className="text-title-md font-bold text-on-surface">Productos Más Vendidos</h3>
              <p className="text-body-sm text-on-surface-variant">Top desempeño basado en volumen y facturación</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {topProducts.map((prod, idx) => {
                const isTop1 = idx === 0;
                const isTop2 = idx === 1;
                return (
                  <div
                    key={prod.nombre_producto}
                    className={`p-4 border rounded-lg flex flex-col transition-all hover:scale-[1.01] ${
                      isTop1
                        ? 'border-secondary/20 bg-secondary-container/5 shadow-sm'
                        : isTop2
                        ? 'border-brand-blue/20 bg-brand-blue-container/5 shadow-sm'
                        : 'border-outline-variant/30 bg-surface-container-low'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <span
                          className={`material-symbols-outlined text-[20px] ${
                            isTop1
                              ? 'text-secondary'
                              : isTop2
                              ? 'text-brand-blue'
                              : 'text-on-surface-variant'
                          }`}
                        >
                          shopping_bag
                        </span>
                        <span
                          className={`text-body-sm font-bold uppercase ${
                            isTop1
                              ? 'text-secondary'
                              : isTop2
                              ? 'text-brand-blue'
                              : 'text-on-surface'
                          }`}
                        >
                          {prod.nombre_producto}
                        </span>
                      </div>
                      {prod.posicion && (
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded text-white ${
                            isTop1
                              ? 'bg-secondary'
                              : isTop2
                              ? 'bg-brand-blue'
                              : 'bg-on-surface-variant'
                          }`}
                        >
                          {prod.posicion}
                        </span>
                      )}
                    </div>
                    <div className="space-y-2 flex-1">
                      <div className="flex justify-between items-center p-2 bg-white rounded border border-outline-variant/20">
                        <span className="text-body-sm text-on-surface-variant">Volumen (Cant.)</span>
                        <span
                          className={`text-label-sm font-bold ${
                            isTop1
                              ? 'text-secondary'
                              : isTop2
                              ? 'text-brand-blue'
                              : 'text-on-surface'
                          }`}
                        >
                          {prod.volumen_cantidad.toLocaleString('es-CO')} un.
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-2 bg-white rounded border border-outline-variant/20">
                        <span className="text-body-sm text-on-surface-variant">Ingresos</span>
                        <span
                          className={`text-label-sm font-bold ${
                            isTop1
                              ? 'text-secondary'
                              : isTop2
                              ? 'text-brand-blue'
                              : 'text-on-surface'
                          }`}
                        >
                          ${prod.ingresos.toLocaleString('es-CO')}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 2. Sales by School */}
          <div className="data-card p-6">
            <div className="flex justify-between items-start mb-8">
              <div>
                <h3 className="text-title-md font-bold text-on-surface">Desempeño por Colegio</h3>
                <p className="text-body-sm text-on-surface-variant">Ingresos totales agrupados por institución educativa</p>
              </div>
              <div className="px-3 py-1.5 bg-secondary-container/20 border border-secondary/10 rounded-lg shadow-inner">
                <p className="text-[11px] font-bold text-secondary flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">trending_up</span>
                  Crecimiento Positivo del Periodo
                </p>
              </div>
            </div>
            <div className="space-y-8">
              {schoolsPerformance.map((school) => {
                const maxIngresos = Math.max(...schoolsPerformance.map((s) => s.total_ingresos)) || 1;
                const percentageWidth = (school.total_ingresos / maxIngresos) * 100;
                return (
                  <div key={school.colegio} className="space-y-3">
                    <div className="flex justify-between items-end">
                      <div>
                        <p className="text-body-sm font-bold text-on-surface">{school.colegio}</p>
                        {school.crecimiento_porcentaje > 0 ? (
                          <p className="text-[12px] text-secondary font-medium flex items-center gap-1">
                            <span className="material-symbols-outlined text-[14px]">trending_up</span>
                            +{school.crecimiento_porcentaje}% vs periodo anterior
                          </p>
                        ) : (
                          <p className="text-[12px] text-on-surface-variant font-medium flex items-center gap-1">
                            Sin variación histórica
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-on-surface-variant uppercase font-bold">Total Ingresos</span>
                        <p className="text-[14px] text-brand-blue font-bold">${school.total_ingresos.toLocaleString('es-CO')}</p>
                      </div>
                    </div>
                    <div className="h-2.5 w-full bg-surface-container rounded-full overflow-hidden flex shadow-inner">
                      <div
                        className="h-full bg-brand-blue transition-all duration-1000 ease-out rounded-full"
                        style={{ width: `${percentageWidth}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-[11px] text-on-surface-variant">
                      <p className="">Transacciones: <b>{school.transacciones.toLocaleString('es-CO')}</b></p>
                      <p className="font-bold text-on-surface">Ticket Prom: ${school.ticket_promedio.toLocaleString('es-CO')}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Sidebar (4 cols) */}
        <div className="col-span-12 lg:col-span-4 space-y-gutter">
          {/* IA Panel */}
          <div className="bg-inverse-surface text-white rounded-xl p-5 relative overflow-hidden shadow-lg border border-white/5">
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-5">
                <span className="material-symbols-outlined text-secondary-container text-[20px]">auto_awesome</span>
                <h3 className="text-body-md font-bold">Insights Financieros IA</h3>
              </div>
              <div className="space-y-4">
                <div className="p-3 bg-white/5 rounded border-l-4 border-secondary-container">
                  <p className="text-[12px] leading-relaxed">
                    Alta concentración de recargas detectada los días de semana. Automatiza recordatorios a apoderados.
                  </p>
                </div>
                <div className="p-3 bg-white/5 rounded border-l-4 border-brand-blue">
                  <p className="text-[12px] leading-relaxed">
                    El ticket promedio general se sitúa en <b>${globalMetrics?.ticket_promedio.toLocaleString('es-CO')}</b>, demostrando hábitos estables de consumo diario.
                  </p>
                </div>
              </div>
            </div>
            <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-brand-blue/20 rounded-full blur-2xl"></div>
          </div>

          {/* Operations Sidebar */}
          <div className="space-y-4">
            <div className="data-card p-5">
              <div className="flex items-center gap-2 mb-4">
                <span className="material-symbols-outlined text-brand-blue text-[20px]">account_balance_wallet</span>
                <h4 className="text-body-sm font-bold uppercase tracking-wider text-on-surface">Patrones de Recarga</h4>
              </div>
              <div className="space-y-3">
                {rechargePatterns.map((pat) => (
                  <div
                    key={pat.patron}
                    className="flex justify-between items-center py-2 border-b border-outline-variant/20 last:border-0"
                  >
                    <div>
                      <p className="text-body-sm font-medium text-on-surface">{pat.patron}</p>
                      <p className="text-[11px] text-on-surface-variant">Volumen: {pat.cantidad.toLocaleString('es-CO')} recargas</p>
                    </div>
                    <span className="text-body-sm font-bold text-brand-blue">{pat.porcentaje}%</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="data-card p-5">
              <div className="flex items-center gap-2 mb-4">
                <span className="material-symbols-outlined text-secondary text-[20px]">monitoring</span>
                <h4 className="text-body-sm font-bold uppercase tracking-wider text-on-surface">Métricas Globales</h4>
              </div>
              {globalMetrics && (
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-body-sm text-on-surface-variant">Ticket Promedio Venta</span>
                    <span className="text-[14px] font-bold text-on-surface">${globalMetrics.ticket_promedio.toLocaleString('es-CO')}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-body-sm text-on-surface-variant">Monto Prom. Recarga</span>
                    <span className="text-[14px] font-bold text-on-surface">${globalMetrics.monto_recarga_promedio.toLocaleString('es-CO')}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-body-sm text-on-surface-variant">Recargas Totales</span>
                    <span className="text-[14px] font-bold text-brand-blue">${globalMetrics.total_recarga.toLocaleString('es-CO')}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-body-sm text-on-surface-variant">Transacciones totales</span>
                    <span className="text-[14px] font-bold text-secondary">{globalMetrics.total_transacciones.toLocaleString('es-CO')}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Summary Section */}
      {globalMetrics && (
        <div className="data-card border-brand-blue/20 overflow-hidden bg-white">
          <div className="flex flex-col lg:flex-row">
            <div className="flex-1 p-8 lg:p-10 border-b lg:border-b-0 lg:border-r border-outline-variant/30">
              <div className="flex items-start gap-6">
                <div className="shrink-0">
                  <img
                    alt="Resumen"
                    className="w-24 h-24 rounded-lg object-cover shadow-md border-2 border-white bg-slate-100"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuAkSdmrCBU3g7Ustscgw4cGwOYzjeAurUHUTg79EtadepJvsc31N5sHMNjYGIB8uq-TyLRdPCF1TpAiKLXX3-nk7jnaOQ41y6dJdWhdsS5WjS7GbwRIBbAzXUb9_nNBruCPjOepnTs1EZuYOxSfXsiGTN21vQhyNuRDVbzCr9sLh6xL7GUJkZwcL0JOZvpvwdCKSy8yfuFSWcyrk0KZHgrIS6_sEJ54xnM64knUxkJnCKorpvbEDVAHuMDs7QAN9puRUeClp5mkrFg"
                  />
                </div>
                <div>
                  <h4 className="text-headline-lg font-bold text-brand-blue mb-2">Resumen Financiero</h4>
                  <p className="text-body-md text-on-surface-variant leading-relaxed max-w-xl">
                    Durante los últimos 30 días, se observa una fuerte correlación entre las recargas escolares y los mayores volúmenes de ventas de productos líderes. Los ingresos totales del periodo ascienden a <b>${globalMetrics.ingresos_totales.toLocaleString('es-CO')}</b> con un ticket promedio sostenido.
                  </p>
                </div>
              </div>
            </div>
            <div className="w-full lg:w-[400px] bg-surface-container-low p-8 lg:p-10 flex flex-col justify-center gap-8">
              <div className="grid grid-cols-2 gap-8">
                <div className="text-center">
                  <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1">Ingresos Totales</p>
                  <p className="text-[28px] font-bold text-brand-blue">{formatM(globalMetrics.ingresos_totales)}</p>
                </div>
                <div className="text-center">
                  <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1">Transacciones</p>
                  <p className="text-[28px] font-bold text-secondary">{globalMetrics.total_transacciones.toLocaleString('es-CO')}</p>
                </div>
                <div className="text-center">
                  <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1">Ticket Promedio</p>
                  <p className="text-[28px] font-bold text-on-surface">${globalMetrics.ticket_promedio.toLocaleString('es-CO')}</p>
                </div>
                <div className="text-center flex flex-col items-center justify-center">
                  <span className="material-symbols-outlined text-secondary text-[24px] animate-bounce">trending_up</span>
                  <p className="text-[10px] font-bold text-secondary uppercase mt-1">Crecimiento</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default RevenueDashboard
