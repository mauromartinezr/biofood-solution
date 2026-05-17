import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import imgRevenue from '../assets/dashboard.jpeg'
import imgStudents from '../assets/dashboard2.jpeg'
import imgProfile from '../assets/dashboard3.jpg'

const easeOut = [0.22, 1, 0.36, 1] as const

const ROTATE_MS = 7000

const views = [
  {
    id: 'tendencias',
    nav: 'Ingresos',
    image: imgRevenue,
    panelTitle: 'Inteligencia de Ingresos',
    subtitle: 'Análisis de Ventas y Recargas de Apoderados',
    kpis: [
      { label: 'Ingresos Totales', value: '$7.6M', hint: 'Últimos 30 días' },
      { label: 'Ticket Promedio', value: '$1.6K', hint: 'Venta global' },
      { label: 'Transacciones', value: '4,790', hint: 'Mensual' },
    ],
    insights: [
      'Alta concentración de recargas lunes y martes',
      'Dedo Queso es el producto más vendido (Top 1)',
      'Crecimiento global del 12.4% vs periodo anterior',
    ],
  },
  {
    id: 'consumo',
    nav: 'Estudiantes',
    image: imgStudents,
    panelTitle: 'Directorio Maestro de Estudiantes',
    subtitle: 'Inteligencia nutricional y administrativa institucional',
    kpis: [
      { label: 'Total Estudiantes', value: '1,284', hint: 'Colegios afiliados' },
      { label: 'Gasto Prom.', value: '$1,450', hint: 'Por estudiante' },
      { label: 'Saldos Bajos', value: '345', hint: '< $1,000' },
    ],
    insights: [
      'Colegio San Carlos lidera el consumo (45%)',
      'Tendencia de recargas mensual en constante crecimiento',
      'Mayor actividad registrada en perfiles de secundaria',
    ],
  },
  {
    id: 'operacion',
    nav: 'Perfiles',
    image: imgProfile,
    panelTitle: 'Perfil y Análisis Transaccional',
    subtitle: 'Seguimiento nutricional y billetera digital por estudiante',
    kpis: [
      { label: 'Billetera Digital', value: '$13.50', hint: 'Saldo actual' },
      { label: 'Calorías Sem.', value: '2,340', hint: 'De 14,000 max' },
      { label: 'Azúcares', value: '320g', hint: 'Excedido (Max 250g)' },
    ],
    insights: [
      'Lunch y Dedo Queso son los productos más consumidos',
      'Alerta nutricional: consumo de azúcares por encima del límite',
      'Patrón de compras constante durante días de semana',
    ],
  },
] as const

export function CafeteriaDashboardSlide() {
  const [active, setActive] = useState(0)
  const view = views[active]

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActive((value) => (value + 1) % views.length)
    }, ROTATE_MS)
    return () => window.clearInterval(timer)
  }, [])

  return (
    <motion.div
      className="cafeDash"
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: easeOut }}
    >
      <aside className="cafeDash__side" aria-label="Secciones del tablero">
        <div className="cafeDash__brand">
          <span className="cafeDash__brandMark" aria-hidden="true" />
          <div>
            <strong>Biofood Connect</strong>
            <span>Cafetería</span>
          </div>
        </div>

        <nav className="cafeDash__nav">
          {views.map((item, index) => {
            const isActive = index === active
            return (
              <motion.button
                key={item.id}
                type="button"
                className={`cafeDash__navBtn${isActive ? ' cafeDash__navBtn--active' : ''}`}
                onClick={() => setActive(index)}
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
              >
                {item.nav}
                {isActive ? (
                  <motion.span
                    className="cafeDash__navProgress"
                    layoutId="cafeDashProgress"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: ROTATE_MS / 1000, ease: 'linear' }}
                  />
                ) : null}
              </motion.button>
            )
          })}
        </nav>

        <p className="cafeDash__sideNote">
          Datos de inventario + conversaciones WhatsApp para decidir surtido y precios.
        </p>
      </aside>

      <div className="cafeDash__main">
        <div className="cafeDash__info">
          <header className="cafeDash__header">
            <div>
              <AnimatePresence mode="wait">
                <motion.h3
                  key={view.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.35 }}
                >
                  {view.panelTitle}
                </motion.h3>
              </AnimatePresence>
              <p>{view.subtitle}</p>
            </div>
            <div className="cafeDash__kpis">
              {view.kpis.map((kpi) => (
                <div key={kpi.label} className="cafeDash__kpi">
                  <span>{kpi.label}</span>
                  <strong>{kpi.value}</strong>
                  <small>{kpi.hint}</small>
                </div>
              ))}
            </div>
          </header>

          <div className="cafeDash__insightsWrap">
            <strong className="cafeDash__insightsTitle">Insights Destacados</strong>
            <AnimatePresence mode="wait">
              <motion.div
                key={view.id}
                className="cafeDash__insights"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                {view.insights.map((text, index) => (
                  <motion.span
                    key={text}
                    className="cafeDash__chip"
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + index * 0.08, duration: 0.4 }}
                  >
                    {text}
                  </motion.span>
                ))}
              </motion.div>
            </AnimatePresence>
          </div>

          <p className="cafeDash__footer">
            Más ventas cuando la cafetería ve tendencias, temporadas y alertas de stock antes del
            quiebre — con señales del chat de padres.
          </p>
        </div>

        <div className="cafeDash__viewport">
          <AnimatePresence mode="wait">
            <motion.figure
              key={view.id}
              className="cafeDash__figure"
              initial={{ opacity: 0, scale: 0.98, x: 14 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.98, x: -14 }}
              transition={{ duration: 0.45, ease: easeOut }}
            >
              <img src={view.image} alt={view.panelTitle} className="cafeDash__shot" />
            </motion.figure>
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  )
}
