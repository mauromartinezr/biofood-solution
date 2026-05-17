import { useEffect, useState, type CSSProperties } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import smartphone from '../assets/smarthopne.webp'

const easeOut = [0.22, 1, 0.36, 1] as const

const features = [
  {
    id: 'chat',
    label: '01',
    title: 'Consulta conversacional',
    copy: 'Pregunta en lenguaje natural y recibe respuestas al instante sobre consumo, saldo y hábitos.',
    accent: '#25d366',
  },
  {
    id: 'alert',
    label: '02',
    title: 'Alerta de saldo proyectado',
    copy: 'Te avisamos con hasta 5 días de anticipación si el saldo podría no alcanzar para cubrir el consumo de tu hijo.',
    accent: '#f59e0b',
  },
  {
    id: 'monitor',
    label: '03',
    title: 'Monitoreo nutricional',
    copy: 'Suscripción de seguimiento semanal: calorías, macros y tendencias para mejorar la alimentación en casa.',
    accent: '#22804d',
  },
  {
    id: 'perks',
    label: '04',
    title: 'Beneficios y aliados',
    copy: 'Recarga en días especiales y participa en rifas, boletas de cine y experiencias con marcas aliadas.',
    accent: '#7c3aed',
  },
] as const

const ROTATE_MS = 5200

function ChatScreen() {
  return (
    <motion.div
      className="phoneScreen phoneScreen--chat"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35 }}
    >
      <motion.div
        className="phoneScreen__bubble phoneScreen__bubble--out"
        initial={{ opacity: 0, x: 12, scale: 0.92 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        transition={{ delay: 0.15, duration: 0.45, ease: easeOut }}
      >
        ¿Cuánto gastó Sofía esta semana?
      </motion.div>
      <motion.div
        className="phoneScreen__bubble phoneScreen__bubble--in"
        initial={{ opacity: 0, x: -12, scale: 0.92 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        transition={{ delay: 0.45, duration: 0.45, ease: easeOut }}
      >
        Lleva <strong>$42.500</strong> en 4 días. Promedio diario: <strong>$10.625</strong>.
      </motion.div>
      <motion.div
        className="phoneScreen__typing"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0.4, 1, 0.4] }}
        transition={{ delay: 0.9, duration: 1.2, repeat: Infinity }}
      >
        <span />
        <span />
        <span />
      </motion.div>
    </motion.div>
  )
}

function AlertScreen() {
  return (
    <motion.div
      className="phoneScreen phoneScreen--alert"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35 }}
    >
      <motion.div
        className="phoneScreen__alertCard"
        initial={{ opacity: 0, y: 16, scale: 0.94 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ delay: 0.12, duration: 0.55, ease: easeOut }}
      >
        <span className="phoneScreen__alertIcon" aria-hidden="true">
          ⚠
        </span>
        <p className="phoneScreen__alertTitle">Proyección de saldo</p>
        <p className="phoneScreen__alertBody">
          Con el ritmo actual, el saldo podría <strong>no alcanzar en ~4 días</strong>.
        </p>
        <motion.button
          type="button"
          className="phoneScreen__alertCta"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.4 }}
        >
          Recargar ahora
        </motion.button>
      </motion.div>
      <motion.p
        className="phoneScreen__alertHint"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.65 }}
      >
        Aviso con días de margen para recargar
      </motion.p>
    </motion.div>
  )
}

function MonitorScreen() {
  const bars = [
    { label: 'Calorías', pct: 72, color: '#22804d' },
    { label: 'Proteína', pct: 58, color: '#3d9e6a' },
    { label: 'Azúcares', pct: 41, color: '#f59e0b' },
  ]

  return (
    <motion.div
      className="phoneScreen phoneScreen--monitor"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35 }}
    >
      <p className="phoneScreen__monitorHead">Semana de Sofía</p>
      {bars.map((bar, index) => (
        <motion.div key={bar.label} className="phoneScreen__barRow">
          <span>{bar.label}</span>
          <motion.div
            className="phoneScreen__barTrack"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 + index * 0.12 }}
          >
            <motion.div
              className="phoneScreen__barFill"
              style={{ background: bar.color }}
              initial={{ scaleX: 0 }}
              animate={{ scaleX: bar.pct / 100 }}
              transition={{ delay: 0.25 + index * 0.15, duration: 0.65, ease: easeOut }}
            />
          </motion.div>
        </motion.div>
      ))}
      <motion.span
        className="phoneScreen__monitorBadge"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 420, damping: 18, delay: 0.7 }}
      >
        Plan activo
      </motion.span>
    </motion.div>
  )
}

function PerksScreen() {
  const perks = ['Rifa cine', '2×1 snacks', 'Sorteo mes']

  return (
    <motion.div
      className="phoneScreen phoneScreen--perks"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35 }}
    >
      <motion.div
        className="phoneScreen__ticket"
        initial={{ opacity: 0, rotate: -8, y: 20 }}
        animate={{ opacity: 1, rotate: -4, y: 0 }}
        transition={{ delay: 0.15, duration: 0.55, ease: easeOut }}
      >
        <span>🎬</span>
        <div>
          <strong>Recarga especial</strong>
          <p>Participa por boletas Cinépolis</p>
        </div>
      </motion.div>
      <div className="phoneScreen__perkChips">
        {perks.map((perk, index) => (
          <motion.span
            key={perk}
            className="phoneScreen__perkChip"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.35 + index * 0.1, type: 'spring', stiffness: 400, damping: 20 }}
          >
            {perk}
          </motion.span>
        ))}
      </div>
      <motion.p
        className="phoneScreen__perkDream"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.75 }}
      >
        Dream partnerships · más beneficios por recargar
      </motion.p>
    </motion.div>
  )
}

const screens = {
  chat: ChatScreen,
  alert: AlertScreen,
  monitor: MonitorScreen,
  perks: PerksScreen,
} as const

export function PhoneFeaturesSlide() {
  const [active, setActive] = useState(0)
  const feature = features[active]
  const Screen = screens[feature.id]

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActive((value) => (value + 1) % features.length)
    }, ROTATE_MS)
    return () => window.clearInterval(timer)
  }, [])

  return (
    <div className="phoneFeatures">
      <motion.div
        className="phoneFeatures__panel"
        initial={{ opacity: 0, x: -24 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.55, ease: easeOut }}
      >
        <ul className="phoneFeatures__list" role="tablist" aria-label="Funcionalidades">
          {features.map((item, index) => {
            const isActive = index === active
            return (
              <motion.li key={item.id} role="presentation">
                <motion.button
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  className={`phoneFeatures__tab${isActive ? ' phoneFeatures__tab--active' : ''}`}
                  onClick={() => setActive(index)}
                  style={
                    isActive
                      ? ({ borderLeftColor: item.accent, '--tab-accent': item.accent } as CSSProperties)
                      : undefined
                  }
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span className="phoneFeatures__tabLabel">{item.label}</span>
                  <span className="phoneFeatures__tabTitle">{item.title}</span>
                  <AnimatePresence>
                    {isActive ? (
                      <motion.p
                        className="phoneFeatures__tabCopy"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.35 }}
                      >
                        {item.copy}
                      </motion.p>
                    ) : null}
                  </AnimatePresence>
                  {isActive ? (
                    <motion.span
                      className="phoneFeatures__progress"
                      aria-hidden="true"
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      transition={{ duration: ROTATE_MS / 1000, ease: 'linear' }}
                      style={{ background: item.accent }}
                      key={`progress-${item.id}-${active}`}
                    />
                  ) : null}
                </motion.button>
              </motion.li>
            )
          })}
        </ul>
      </motion.div>

      <motion.div
        className="phoneFeatures__deviceWrap"
        initial={{ opacity: 0, x: 28, scale: 0.94 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        transition={{ duration: 0.7, delay: 0.1, ease: easeOut }}
      >
        <motion.div className="phoneFeatures__phoneStage">
          <motion.div
            className="phoneFeatures__glow"
            aria-hidden="true"
            animate={{ background: `radial-gradient(ellipse at center bottom, ${feature.accent}55 0%, transparent 72%)` }}
            transition={{ duration: 0.5 }}
          />
          <img className="phoneFeatures__device" src={smartphone} alt="Celular con Biofood Connect" />

          <motion.div className="phoneFeatures__notifySlot" layout>
            <AnimatePresence mode="wait">
              <motion.div
                key={feature.id}
                className="phoneFeatures__notify"
                style={{
                  borderLeftColor: feature.accent,
                  boxShadow: `0 12px 40px ${feature.accent}44`,
                }}
                initial={{ opacity: 0, y: 12, scale: 0.94 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.94 }}
                transition={{ duration: 0.45, ease: easeOut }}
              >
                <Screen />
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  )
}
