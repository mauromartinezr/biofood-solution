import React, { useEffect, useState } from 'react'
import {
  getStudentProfileUseCase,
  getStudentTransactionsUseCase,
  getStudentTopProductsUseCase,
  getStudentNutritionUseCase,
  getStudentAnalysisUseCase
} from '../features/profile/use_case_profile'
import type {
  StudentProfileDto,
  StudentTransactionDto,
  StudentTopProductDto,
  StudentNutritionProductDto,
  StudentAnalysisDto
} from '../features/profile/dto/dto_profile'

interface Student {
  id: string
  name: string
  parent: string
  balance: number
  school: string
  purchases: number
  activity: 'Alto' | 'Medio' | 'Bajo'
}

interface StudentDetailProps {
  student?: Student | null
  onBack: () => void
}

// Local nutrition dictionary to compute facts dynamically from units bought (as instructed in endpoints.md)
const PRODUCT_NUTRITION_FACTS: Record<string, { calories: number; fats: number; sugars: number }> = {
  // TOP VENDIDOS
  "LIMONADA FRAPPE":        { calories: 180, fats: 2,  sugars: 38 },
  "DEDITO QUESO":           { calories: 260, fats: 14, sugars: 1  },
  "DEDITO DE QUESO HORNEADO": { calories: 220, fats: 10, sugars: 1 },
  "DEDITOS DE QUESO HORNEADOS MARIATERE": { calories: 230, fats: 11, sugars: 1 },
  "CRISPETAS":              { calories: 150, fats: 8,  sugars: 2  },
  "AGUA":                   { calories: 0,   fats: 0,  sugars: 0  },
  "DEDITO DE HOJALDRE":     { calories: 240, fats: 13, sugars: 2  },
  "DEDITOS HORNEADOS":      { calories: 220, fats: 10, sugars: 1  },
  "TEQUEÑO":                { calories: 270, fats: 15, sugars: 2  },
  "DEDITO FRITO":           { calories: 280, fats: 16, sugars: 1  },
  "GATORADE":               { calories: 140, fats: 0,  sugars: 34 },
  "MENTA CHAO":             { calories: 10,  fats: 0,  sugars: 2  },
  "AGUA BRISA PEQUEÑA":     { calories: 0,   fats: 0,  sugars: 0  },
  "DEDITO HORNEADO":        { calories: 220, fats: 10, sugars: 1  },
  "TE GRANIZADO":           { calories: 90,  fats: 0,  sugars: 22 },
  "MANGO":                  { calories: 60,  fats: 0,  sugars: 14 },
  "PAPITAS MONTEROJO":      { calories: 320, fats: 16, sugars: 2  },
  "PAPAS MONTEROJO LIMA LIMON": { calories: 310, fats: 15, sugars: 2 },
  "DEDITO QUESO HORNEADO":  { calories: 220, fats: 10, sugars: 1  },
  "MENTAS MASTICABLES":     { calories: 8,   fats: 0,  sugars: 2  },
  "PAN DE BONO":            { calories: 190, fats: 8,  sugars: 2  },
  "BOLIS":                  { calories: 60,  fats: 0,  sugars: 14 },
  "PAPAS":                  { calories: 300, fats: 14, sugars: 2  },
  "DEDITO FRITO TRADICIONAL": { calories: 280, fats: 16, sugars: 1 },
  "PIZZA":                  { calories: 480, fats: 18, sugars: 5  },
  "MILO":                   { calories: 190, fats: 3,  sugars: 24 },
  "GASEOSA PET 250 PEPSI":  { calories: 110, fats: 0,  sugars: 28 },
  "SODA HATSU":             { calories: 80,  fats: 0,  sugars: 19 },
  "EMPANADA RANCHERA":      { calories: 310, fats: 14, sugars: 3  },
  "AGUA SABORIZADA":        { calories: 50,  fats: 0,  sugars: 12 },
  "DORITOS":                { calories: 300, fats: 15, sugars: 2  },
  "PONY MALTA MINI":        { calories: 130, fats: 0,  sugars: 26 },
  "BROWNIE":                { calories: 380, fats: 18, sugars: 32 },
  "PERRO CALIENTE SENCILLO MARIATERE": { calories: 350, fats: 18, sugars: 5 },
  "FUZE TEA DURAZNO":       { calories: 90,  fats: 0,  sugars: 22 },
  "SANDWICH CALIENTE":      { calories: 420, fats: 18, sugars: 6  },
  "PERRO SENCILLO":         { calories: 340, fats: 17, sugars: 5  },
  "NATUCHIPS PLATANITO VERDE": { calories: 290, fats: 14, sugars: 2 },
  "TE":                     { calories: 5,   fats: 0,  sugars: 1  },
  "PONY MALTA":             { calories: 160, fats: 0,  sugars: 32 },
  "HATSU FRAMBUESA":        { calories: 80,  fats: 0,  sugars: 19 },
  "CROISSANT DE CHOCOLATE": { calories: 420, fats: 22, sugars: 20 },
  "SANDWICH JAMON Y QUESO": { calories: 390, fats: 17, sugars: 5  },
  "EMPANADAS":              { calories: 290, fats: 12, sugars: 3  },
  "SALTIN NOEL":            { calories: 130, fats: 5,  sugars: 2  },
  "PAPAS A LA FRANCESA X 150 GR": { calories: 360, fats: 18, sugars: 1 },
  "ALPIN DE CHOCOLATE":     { calories: 160, fats: 4,  sugars: 22 },
  "CHOCOCONO":              { calories: 220, fats: 10, sugars: 18 },
  "BROWNIES":               { calories: 380, fats: 18, sugars: 32 },
  "GALLETA QUAKER FLOTADAS CHOCOLATE": { calories: 130, fats: 5, sugars: 8 },
  "PORCION DE FRUTA PICADA": { calories: 60,  fats: 0,  sugars: 14 },
  "AVENA ALPINA":           { calories: 170, fats: 3,  sugars: 20 },
  "COCA COLA PET 400ML":    { calories: 160, fats: 0,  sugars: 40 },
  "LECHE ACHOCOLATADA":     { calories: 180, fats: 5,  sugars: 24 },
  "DEDITO INTEGRAL":        { calories: 210, fats: 8,  sugars: 2  },
  "DETODITO MIX":           { calories: 290, fats: 14, sugars: 3  },
  "CHOCLITOS LIMON":        { calories: 280, fats: 13, sugars: 2  },
  "H2O LIMA LIMON":         { calories: 40,  fats: 0,  sugars: 10 },
  "CHOCOLATINA JET":        { calories: 70,  fats: 4,  sugars: 8  },
  "NATUCHIPS PLATANITO MADURO": { calories: 300, fats: 15, sugars: 4 },
  "PANDEBONO":              { calories: 190, fats: 8,  sugars: 2  },
  "EMPANADAS DE POLLO":     { calories: 280, fats: 12, sugars: 3  },
  "JUGO HIT":               { calories: 120, fats: 0,  sugars: 28 },
  "JUGO HIT SIN AZUCAR":    { calories: 20,  fats: 0,  sugars: 4  },
  "AREPA DE HUEVO":         { calories: 280, fats: 14, sugars: 2  },
  "AREPA DE QUESO":         { calories: 220, fats: 10, sugars: 2  },
  "CLUB SOCIAL":            { calories: 140, fats: 6,  sugars: 5  },
  "CHEESE TRIS":            { calories: 260, fats: 13, sugars: 2  },
  "CHOKIS":                 { calories: 120, fats: 5,  sugars: 10 },
  "PLATANITOS":             { calories: 310, fats: 16, sugars: 4  },
  "LIMONADA":               { calories: 120, fats: 0,  sugars: 28 },
  "PERRO CALIENTE":         { calories: 350, fats: 18, sugars: 5  },
  "MENU POLLO (MENU POLLO)": { calories: 650, fats: 20, sugars: 8 },
  "SALCHIPAPA":             { calories: 520, fats: 24, sugars: 2  },
  "EMPANADA DE POLLO":      { calories: 280, fats: 12, sugars: 3  },
  "EMPANADA DE CARNE":      { calories: 300, fats: 14, sugars: 3  },
  "LUNCH":                  { calories: 680, fats: 22, sugars: 10 },
  "HOT DOG":                { calories: 380, fats: 20, sugars: 5  },
  "CHEESEBURGER + FRIES":   { calories: 750, fats: 38, sugars: 8  },
  "CHICKEN TENDER + PAPAS FRANCESAS": { calories: 680, fats: 32, sugars: 4 },
  "PASTA BOLOÑESA":         { calories: 560, fats: 18, sugars: 8  },
  "AJIACO (AJIACO)":        { calories: 420, fats: 12, sugars: 5  },
  "BANDEJA PAISA (BANDEJA PAISA)": { calories: 850, fats: 35, sugars: 10 },
};

const StudentDetail: React.FC<StudentDetailProps> = ({ student, onBack }) => {
  const [profile, setProfile] = useState<StudentProfileDto | null>(null)
  const [transactions, setTransactions] = useState<StudentTransactionDto[]>([])
  const [topProducts, setTopProducts] = useState<StudentTopProductDto[]>([])
  const [nutrition, setNutrition] = useState<StudentNutritionProductDto[]>([])
  const [analysis, setAnalysis] = useState<StudentAnalysisDto[]>([])
  
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [transactionTab, setTransactionTab] = useState<'semanal' | 'mensual'>('mensual')

  useEffect(() => {
    if (!student?.id) return;
    
    // Strip '#' prefix if present
    const rawId = student.id.replace('#', '')

    const loadProfileData = async () => {
      setLoading(true)
      setError(null)
      try {
        const [prof, txs, products, nutr, anal] = await Promise.all([
          getStudentProfileUseCase(rawId),
          getStudentTransactionsUseCase(rawId),
          getStudentTopProductsUseCase(rawId),
          getStudentNutritionUseCase(rawId),
          getStudentAnalysisUseCase(rawId)
        ])
        setProfile(prof)
        setTransactions(txs)
        setTopProducts(products)
        setNutrition(nutr)
        setAnalysis(anal)
      } catch (err: any) {
        console.error(err)
        setError(err.message || 'Error al conectar con el expediente clínico de BioFood.')
      } finally {
        setLoading(false)
      }
    };

    loadProfileData()
  }, [student?.id])

  // Get initials for avatar
  const getInitials = (nameStr: string) => {
    return nameStr
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  // Calculate dynamic nutrition facts based on purchase counts and lookup table
  let totalCalories = 0
  let totalFats = 0
  let totalSugars = 0
  let totalUnits = 0

  nutrition.forEach((item) => {
    const normName = item.nombre_producto.toUpperCase().trim()
    const facts = PRODUCT_NUTRITION_FACTS[normName] || { calories: 150, fats: 6, sugars: 10 }
    totalCalories += facts.calories * item.total_unidades
    totalFats += facts.fats * item.total_unidades
    totalSugars += facts.sugars * item.total_unidades
    totalUnits += item.total_unidades
  })

  // Format limits
  const caloriesLimit = 14000
  const fatsLimit = 70
  const sugarsLimit = 350

  const calPercent = Math.min((totalCalories / caloriesLimit) * 100, 100)
  const fatPercent = Math.min((totalFats / fatsLimit) * 100, 100)
  const sugPercent = Math.min((totalSugars / sugarsLimit) * 100, 100)

  // Chart plotting helpers
  const filteredAnalysis = transactionTab === 'semanal' ? analysis.slice(-5) : analysis.slice(-10)
  const maxGasto = Math.max(...filteredAnalysis.map((d) => d.gasto)) || 1

  const getDayName = (dateStr: string) => {
    try {
      const date = new Date(dateStr)
      return date.toLocaleDateString('es-CO', { weekday: 'short' })
    } catch {
      return dateStr
    }
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto py-20 px-6 text-center select-none">
        <div className="flex flex-col items-center justify-center gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-outline-variant border-t-brand-blue animate-spin"></div>
          <p className="text-body-md text-on-surface-variant font-medium">Cargando expediente clínico del estudiante...</p>
        </div>
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div className="max-w-7xl mx-auto py-20 px-6 text-center select-none">
        <div className="bg-error-container/30 border border-error/20 rounded-2xl p-8 max-w-xl mx-auto space-y-4">
          <span className="material-symbols-outlined text-error text-[48px]">database_alert</span>
          <h2 className="text-title-lg font-bold text-error">Error de Conexión</h2>
          <p className="text-body-md text-on-surface-variant leading-relaxed">
            {error || 'El perfil solicitado no pudo ser encontrado.'}. Asegúrate de que el backend de Go esté corriendo en <code>http://localhost:8080</code>.
          </p>
          <button
            onClick={onBack}
            className="px-5 py-2 bg-brand-blue hover:opacity-90 active:scale-[0.98] text-on-primary rounded-xl font-bold text-label-md transition-all shadow-md cursor-pointer"
          >
            Volver al Directorio
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto space-y-gutter select-none pb-12">
      {/* Back navigation and header */}
      <div className="flex items-center gap-3 mb-4">
        <button
          onClick={onBack}
          className="p-2 hover:bg-surface-container-high rounded-full transition-all cursor-pointer flex items-center justify-center border border-outline-variant/30 bg-white shadow-sm"
        >
          <span className="material-symbols-outlined text-on-surface-variant">arrow_back</span>
        </button>
        <span className="text-body-sm text-on-surface-variant font-bold cursor-pointer hover:underline" onClick={onBack}>
          Volver al Directorio
        </span>
      </div>

      {/* Student Hero Profile - Compacted */}
      <section className="flex flex-col md:flex-row gap-6 items-center border-b border-outline-variant/30 pb-6">
        <div className="relative">
          <div className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-white shadow-lg overflow-hidden shrink-0 bg-brand-blue flex items-center justify-center text-on-primary font-display-lg text-[40px] md:text-[48px] font-bold">
            {getInitials(profile.nombre)}
          </div>
          <div className="absolute bottom-1 right-1 bg-brand-blue text-on-primary w-8 h-8 rounded-full flex items-center justify-center border-2 border-white shadow-md cursor-pointer hover:scale-110 transition-transform">
            <span className="material-symbols-outlined text-[16px]">edit</span>
          </div>
        </div>
        <div className="text-center md:text-left flex-grow">
          <div className="flex flex-col md:flex-row md:items-center gap-3 mb-1">
            <h1 className="font-display-lg text-[32px] md:text-headline-lg font-bold text-on-surface leading-tight">
              {profile.nombre}
            </h1>
            <span className="bg-brand-blue-container text-on-primary-container px-3 py-1 rounded-full font-label-md text-label-md w-fit mx-auto md:mx-0 shrink-0 shadow-sm border border-brand-blue/10">
              ID: {profile.id}
            </span>
          </div>
          <p className="font-body-md text-on-surface-variant font-medium mb-3">{profile.colegio}</p>
        </div>
        <div className="flex gap-2">
          <button className="bg-brand-blue hover:opacity-90 active:scale-[0.98] text-on-primary font-bold py-2.5 px-6 rounded-xl shadow-md transition-all text-label-md cursor-pointer">
            Generar Reporte PDF
          </button>
          <button className="p-2.5 border border-outline-variant text-on-surface-variant rounded-xl hover:bg-surface-container transition-all cursor-pointer bg-white">
            <span className="material-symbols-outlined">more_vert</span>
          </button>
        </div>
      </section>

      {/* Balanced 3-Column Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
        {/* Main Content Column (Left/Center) */}
        <div className="lg:col-span-8 flex flex-col gap-gutter order-2 lg:order-1">
          {/* Transactional Analysis Section */}
          <div className="data-card p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div>
                <h3 className="font-title-md text-title-md text-on-surface font-bold">Análisis Transaccional</h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant">Historial de consumo diario en el periodo</p>
              </div>
              <div className="flex gap-1 bg-surface-container-low p-1 rounded-xl border border-outline-variant/20">
                <button
                  onClick={() => setTransactionTab('semanal')}
                  className={`px-4 py-1.5 rounded-lg font-label-md text-label-md transition-all cursor-pointer ${
                    transactionTab === 'semanal'
                      ? 'bg-brand-blue text-on-primary shadow-sm'
                      : 'text-on-surface-variant hover:text-on-surface font-semibold'
                  }`}
                >
                  Últimos 5 días
                </button>
                <button
                  onClick={() => setTransactionTab('mensual')}
                  className={`px-4 py-1.5 rounded-lg font-label-md text-label-md transition-all cursor-pointer ${
                    transactionTab === 'mensual'
                      ? 'bg-brand-blue text-on-primary shadow-sm'
                      : 'text-on-surface-variant hover:text-on-surface font-semibold'
                  }`}
                >
                  Últimos 10 días
                </button>
              </div>
            </div>

            {/* Bar Chart (Dynamic from DB Analysis Endpoint) */}
            <div className="relative h-48 bg-surface-container-lowest rounded-xl border border-outline-variant/10 p-5 flex items-end justify-between gap-3 mb-6 shadow-inner">
              {filteredAnalysis.length > 0 ? (
                filteredAnalysis.map((item, idx) => {
                  const heightPercent = (item.gasto / maxGasto) * 100
                  return (
                    <div key={idx} className="flex flex-col items-center gap-2 w-full group">
                      <div className="w-full bg-brand-blue-container/30 rounded-t-md relative h-32">
                        <div
                          className="absolute bottom-0 w-full bg-brand-blue rounded-t-md transition-all duration-500 group-hover:bg-brand-secondary"
                          style={{ height: `${heightPercent}%` }}
                        ></div>
                      </div>
                      <span className="font-label-sm text-[10px] opacity-60 uppercase font-semibold capitalize">
                        {getDayName(item.dia)}
                      </span>
                    </div>
                  )
                })
              ) : (
                <div className="w-full py-10 text-center text-on-surface-variant font-medium">
                  No hay transacciones registradas para graficar.
                </div>
              )}
              <div className="absolute top-10 left-0 w-full border-t-2 border-dashed border-tertiary/30 flex justify-end px-4">
                <span className="bg-tertiary text-white text-[9px] px-1.5 py-0.5 rounded -translate-y-2.5 font-bold">
                  Gasto Activo
                </span>
              </div>
            </div>
          </div>

          {/* Recent Activity Section */}
          <div className="data-card overflow-hidden bg-white shadow-sm">
            <div className="p-5 border-b border-outline-variant/20 flex justify-between items-center">
              <h3 className="font-title-md text-title-md text-on-surface font-bold">Historial de Transacciones</h3>
              <span className="text-[12px] font-semibold text-on-surface-variant">Últimas 20 transacciones</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-surface-container-low border-b border-outline-variant/20">
                  <tr>
                    <th className="p-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider font-semibold">Fecha</th>
                    <th className="p-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider font-semibold">Ítem / Acción</th>
                    <th className="p-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider font-semibold text-right">Monto</th>
                    <th className="p-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider font-semibold text-center">Tipo</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/10">
                  {transactions.map((tx, idx) => {
                    const isExpense = tx.monto > 0
                    return (
                      <tr key={idx} className="hover:bg-surface-container/30 transition-colors">
                        <td className="p-4 font-body-sm text-body-sm whitespace-nowrap text-on-surface-variant font-medium">
                          {tx.fecha}
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded overflow-hidden shrink-0 flex items-center justify-center shadow-sm ${
                              isExpense ? 'bg-surface-container-high text-brand-blue' : 'bg-secondary-container/30 text-secondary'
                            }`}>
                              <span className="material-symbols-outlined">
                                {isExpense ? 'restaurant' : 'account_balance_wallet'}
                              </span>
                            </div>
                            <span className="font-body-sm font-semibold">{tx.producto}</span>
                          </div>
                        </td>
                        <td className={`p-4 text-right font-body-sm font-bold ${isExpense ? 'text-error' : 'text-secondary'}`}>
                          {isExpense ? `-$${tx.monto.toLocaleString('es-CO')}` : `+$${Math.abs(tx.monto).toLocaleString('es-CO')}`}
                        </td>
                        <td className="p-4 text-center">
                          <span className={`font-bold px-2.5 py-0.5 rounded-full text-[11px] ${
                            isExpense ? 'bg-surface-container-high text-on-surface-variant' : 'bg-secondary-container/30 text-secondary'
                          }`}>
                            {tx.tipo}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                  {transactions.length === 0 && (
                    <tr>
                      <td colSpan={4} className="p-8 text-center text-on-surface-variant font-medium">
                        No hay transacciones registradas.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Quick Summary Column */}
        <aside className="lg:col-span-4 flex flex-col gap-gutter order-1 lg:order-2">
          {/* Quick Stats Header (Hidden on Mobile) */}
          <div className="hidden lg:block mb-1">
            <h3 className="font-title-md text-title-md text-on-surface font-bold">Resumen Rápido</h3>
            <p className="font-body-sm text-on-surface-variant">Estado financiero actual</p>
          </div>

          {/* Financial Summary Card */}
          <div className="data-card p-6 border-t-4 border-brand-blue bg-white shadow-sm">
            <div className="flex justify-between items-start mb-6">
              <div>
                <p className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider mb-1 font-bold">Billetera Digital</p>
                <span className="font-display-lg text-[36px] text-brand-blue font-bold leading-none">
                  ${profile.billetera_digital.toLocaleString('es-CO', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="p-3 bg-brand-blue-container/30 rounded-xl text-brand-blue shadow-sm">
                <span className="material-symbols-outlined">account_balance_wallet</span>
              </div>
            </div>
            <div className="bg-surface-container-low p-4 rounded-xl mb-6 space-y-3 shadow-inner">
              <div className="flex justify-between items-center">
                <span className="font-label-md text-on-surface-variant font-semibold">Ticket Promedio</span>
                <span className="font-body-sm font-bold text-on-surface">${profile.ticket_promedio.toLocaleString('es-CO')}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-label-md text-on-surface-variant font-semibold">Días Activo (Mes)</span>
                <span className="font-body-sm font-bold text-on-surface">{profile.dias_actividad} días</span>
              </div>
            </div>
            <div className="flex flex-col gap-3">
              <button className="w-full border border-outline-variant text-on-surface font-semibold py-2.5 rounded-xl hover:bg-surface-container transition-all flex items-center justify-center gap-2 text-label-md cursor-pointer bg-white shadow-sm">
                <span className="material-symbols-outlined text-[18px]">history</span>
                Historial de Recargas
              </button>
            </div>
          </div>

          {/* Category Breakdown */}
          <div className="data-card p-6 bg-white shadow-sm">
            <h4 className="font-label-md text-on-surface-variant uppercase tracking-wider mb-6 font-bold">
              Top Productos Más Comprados
            </h4>
            <div className="space-y-6">
              {topProducts.map((prod, idx) => {
                const colors = ['bg-brand-blue', 'bg-tertiary', 'bg-secondary']
                const color = colors[idx] || 'bg-brand-blue'
                return (
                  <div key={prod.nombre} className="space-y-2">
                    <div className="flex justify-between items-center text-body-sm">
                      <span className="text-on-surface font-semibold uppercase">{prod.nombre}</span>
                      <span className="font-bold text-on-surface">{prod.porcentaje}%</span>
                    </div>
                    <div className="w-full bg-outline-variant/20 h-2 rounded-full overflow-hidden">
                      <div className={`${color} h-full rounded-full`} style={{ width: `${prod.porcentaje}%` }}></div>
                    </div>
                    <div className="text-on-surface-variant font-label-sm text-[10px] mt-1 font-semibold">
                      Comprado {prod.veces_comprado} veces
                    </div>
                  </div>
                )
              })}
              {topProducts.length === 0 && (
                <div className="text-center text-on-surface-variant font-medium py-4">
                  No hay productos calificados.
                </div>
              )}
            </div>
          </div>

          {/* Nutritional Breakdown */}
          <div className="data-card p-6 bg-white shadow-sm">
            <div className="flex items-center gap-2 mb-6 text-on-surface">
              <span className="material-symbols-outlined text-2xl text-brand-blue">nutrition</span>
              <div>
                <h4 className="font-label-md text-on-surface uppercase tracking-wider font-bold">
                  Resumen Nutricional Semanal
                </h4>
              </div>
            </div>
            <div className="space-y-6">
              {/* Row 1: Calorías */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-body-sm">
                  <span className="flex items-center gap-1 font-semibold">{totalCalories} kcal Calorías</span>
                  <div className="flex items-center gap-2">
                    <span className="font-bold">{totalCalories} / {caloriesLimit}</span>
                    <span className="material-symbols-outlined text-green-600 text-sm">check_circle</span>
                  </div>
                </div>
                <div className="w-full bg-outline-variant/20 h-2 rounded-full overflow-hidden">
                  <div className="bg-brand-blue h-full rounded-full transition-all duration-500" style={{ width: `${calPercent}%` }}></div>
                </div>
              </div>
              {/* Row 2: Grasas */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-body-sm">
                  <span className="flex items-center gap-1 font-semibold">{totalFats}g Grasas</span>
                  <div className="flex items-center gap-2">
                    <span className="font-bold">{totalFats}g / {fatsLimit}g</span>
                    <span className="material-symbols-outlined text-green-600 text-sm">check_circle</span>
                  </div>
                </div>
                <div className="w-full bg-outline-variant/20 h-2 rounded-full overflow-hidden">
                  <div className="bg-brand-blue h-full rounded-full transition-all duration-500" style={{ width: `${fatPercent}%` }}></div>
                </div>
              </div>
              {/* Row 3: Azúcares */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-body-sm">
                  <span className="flex items-center gap-1 font-semibold">{totalSugars}g Azúcares</span>
                  <div className="flex items-center gap-2">
                    <span className="font-bold">{totalSugars}g / {sugarsLimit}g</span>
                    <span className="material-symbols-outlined text-green-600 text-sm">check_circle</span>
                  </div>
                </div>
                <div className="w-full bg-outline-variant/20 h-2 rounded-full overflow-hidden">
                  <div className="bg-brand-blue h-full rounded-full transition-all duration-500" style={{ width: `${sugPercent}%` }}></div>
                </div>
              </div>
            </div>
            <div className="mt-6 pt-4 border-t border-outline-variant/20 text-on-surface-variant text-[11px] font-label-sm font-semibold">
              Cálculo local basado en {totalUnits} unidades compradas esta semana
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}

export default StudentDetail
