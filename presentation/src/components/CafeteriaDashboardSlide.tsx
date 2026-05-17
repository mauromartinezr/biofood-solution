import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import dashboardDemographics from '../assets/dashboard.jpeg'
import dashboardTrends from '../assets/dashboard2.jpeg'
import dashboardOperations from '../assets/dashboard3.jpg'

const easeOut = [0.22, 1, 0.36, 1] as const

const ROTATE_MS = 7000

const views = [
  {
    id: 'consumo',
    nav: 'Consumo',
    image: dashboardDemographics,
    panelTitle: 'Demografía del consumo escolar',
    subtitle: 'Patrones reales por estudiante, horario y ticket',
    kpis: [
      { label: 'Platos/día', value: '2.4k', hint: '+12% vs mes anterior' },
      { label: 'Ticket prom.', value: '$8.2k', hint: 'Familias de 4°–7°' },
      { label: 'Stock crítico', value: '6', hint: 'SKUs bajo mínimo' },
    ],
    insights: [
      'Tendencias por franja: almuerzo domina el 68%',
      'Temporada fría: sopas y bebidas calientes ↑',
      'WhatsApp anticipa picos antes del receso',
    ],
  },
  {
    id: 'tendencias',
    nav: 'Tendencias',
    image: dashboardTrends,
    panelTitle: 'Tendencias, temporadas y transacciones',
    subtitle: 'Lo que vende hoy vs lo que vendrá la próxima semana',
    kpis: [
      { label: 'Ventas mes', value: '$48M', hint: 'Proyección +9%' },
      { label: 'Top categoría', value: 'Snacks', hint: 'Stock OK' },
      { label: 'Alertas', value: '14', hint: 'Stock + surtido' },
    ],
    insights: [
      'Notificación: yogur bajo — reponer antes del viernes',
      'Temporada examenes: combos rápidos en alza',
      'Chat WhatsApp: 320 consultas de padres esta semana',
    ],
  },
  {
    id: 'operacion',
    nav: 'Operación',
    image: dashboardOperations,
    panelTitle: 'Flujo diario: inventario + decisiones',
    subtitle: 'Inventario, notificaciones y oportunidades de venta',
    kpis: [
      { label: 'Margen opp.', value: '+18%', hint: 'Surtido sugerido' },
      { label: 'Recargas', value: '412', hint: 'Impulsadas por WA' },
      { label: 'Riesgo quiebre', value: '3', hint: 'SKUs hoy' },
    ],
    insights: [
      'Actividad reciente: spike post-notificación de stock',
      'Reemplazo sugerido: wrap integral vs sandwich',
      'Meta: más ventas sin ampliar mostrador',
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

        <div className="cafeDash__viewport">
          <AnimatePresence mode="wait">
            <motion.figure
              key={view.id}
              className="cafeDash__figure"
              initial={{ opacity: 0, scale: 0.98, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: -8 }}
              transition={{ duration: 0.45, ease: easeOut }}
            >
              <img src={view.image} alt={view.panelTitle} className="cafeDash__shot" />
              <figcaption className="cafeDash__insights">
                {view.insights.map((text, index) => (
                  <motion.span
                    key={text}
                    className="cafeDash__chip"
                    initial={{ opacity: 0, x: 12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.12 + index * 0.08, duration: 0.4 }}
                  >
                    {text}
                  </motion.span>
                ))}
              </figcaption>
            </motion.figure>
          </AnimatePresence>
        </div>

        <p className="cafeDash__footer">
          Más ventas cuando la cafetería ve tendencias, temporadas y alertas de stock antes del
          quiebre — con señales del chat de padres.
        </p>
      </div>
    </motion.div>
  )
}
