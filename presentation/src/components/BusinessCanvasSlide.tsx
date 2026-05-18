import { motion } from 'framer-motion'

const easeOut = [0.22, 1, 0.36, 1] as const

function IconUsers() {
  return (
    <svg className="bmcCard__svg" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
      <circle cx="9" cy="7" r="3" stroke="currentColor" strokeWidth="1.75" />
      <path d="M22 21v-2a3 3 0 0 0-2.2-2.87M16 3.13a3 3 0 0 1 0 5.74" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  )
}

function IconValue() {
  return (
    <svg className="bmcCard__svg" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 2l2.4 7.4H22l-6 4.6 2.3 7-6.3-4.6L5.7 21 8 14 2 9.4h7.6L12 2Z" stroke="currentColor" strokeWidth="1.75" strokeLinejoin="round" />
    </svg>
  )
}

function IconChannel() {
  return (
    <svg className="bmcCard__svg" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4v8Z" stroke="currentColor" strokeWidth="1.75" strokeLinejoin="round" />
    </svg>
  )
}

function IconRevenue() {
  return (
    <svg className="bmcCard__svg" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7H14a3.5 3.5 0 0 1 0 7H6" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function IconPartners() {
  return (
    <svg className="bmcCard__svg" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M16 3h5v5M8 21H3v-5M21 3l-7 7M3 21l7-7" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function IconCosts() {
  return (
    <svg className="bmcCard__svg" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3" y="8" width="18" height="12" rx="2" stroke="currentColor" strokeWidth="1.75" />
      <path d="M7 8V6a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v2" stroke="currentColor" strokeWidth="1.75" />
    </svg>
  )
}

const blocks = [
  {
    id: 'segments',
    label: 'Segmentos',
    Icon: IconUsers,
    pills: ['Colegios', 'Cafeterías', 'Familias'],
    accent: 'green',
    delay: 0.06,
  },
  {
    id: 'value',
    label: 'Propuesta',
    Icon: IconValue,
    pills: ['Dato → acción', 'Tranquilidad'],
    accent: 'green',
    delay: 0.12,
  },
  {
    id: 'channels',
    label: 'Canales',
    Icon: IconChannel,
    pills: ['WhatsApp', 'Dashboard', 'Portal'],
    accent: 'blue',
    delay: 0.18,
  },
  {
    id: 'revenue',
    label: 'Ingresos',
    Icon: IconRevenue,
    pills: ['Recargas ↑', 'SaaS sede', '$29.9k/mes', 'Aliados'],
    accent: 'gold',
    featured: true,
    delay: 0.24,
  },
  {
    id: 'partners',
    label: 'Socios',
    Icon: IconPartners,
    pills: ['Starbucks', 'Olímpica', 'Fintech'],
    accent: 'purple',
    delay: 0.3,
  },
  {
    id: 'costs',
    label: 'Costos',
    Icon: IconCosts,
    pills: ['Infra + IA', 'Soporte', 'Onboarding'],
    accent: 'muted',
    delay: 0.36,
  },
] as const

export function BusinessCanvasSlide() {
  return (
    <motion.div
      className="bmcVisual"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35 }}
    >
      <div className="bmcVisual__grid">
        {blocks.map((block) => (
          <motion.article
            key={block.id}
            className={`bmcCard bmcCard--${block.accent}${block.id === 'revenue' ? ' bmcCard--featured' : ''}`}
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.5, delay: block.delay, ease: easeOut }}
          >
            <div className="bmcCard__head">
              <div className="bmcCard__iconWrap">
                <block.Icon />
              </div>
              <span className="bmcCard__label">{block.label}</span>
            </div>
            <motion.div
              className="bmcCard__pills"
              initial="hidden"
              animate="show"
              variants={{ show: { transition: { staggerChildren: 0.05, delayChildren: block.delay + 0.1 } } }}
            >
              {block.pills.map((pill) => (
                <motion.span
                  key={pill}
                  className="bmcCard__pill"
                  variants={{ hidden: { opacity: 0, y: 6 }, show: { opacity: 1, y: 0 } }}
                >
                  {pill}
                </motion.span>
              ))}
            </motion.div>
          </motion.article>
        ))}
      </div>

      <motion.div
        className="bmcVisual__hybrid"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <span className="bmcVisual__hybridChip bmcVisual__hybridChip--tx">Transaccional</span>
        <span className="bmcVisual__hybridPlus">+</span>
        <span className="bmcVisual__hybridChip bmcVisual__hybridChip--rec">Recurrente</span>
        <span className="bmcVisual__hybridPlus">+</span>
        <span className="bmcVisual__hybridChip bmcVisual__hybridChip--b2b">B2B</span>
      </motion.div>
    </motion.div>
  )
}
