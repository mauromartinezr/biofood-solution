import { motion } from 'framer-motion'

const easeOut = [0.22, 1, 0.36, 1] as const

function IconProblem() {
  return (
    <svg className="leanStep__svg" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.75" />
      <path d="M12 8v5M12 16v.5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  )
}

function IconHypothesis() {
  return (
    <svg className="leanStep__svg" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M9 18h6M10 22h4M12 2a6 6 0 0 0-4 10.2V15h8v-2.8A6 6 0 0 0 12 2Z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function IconMvp() {
  return (
    <svg className="leanStep__svg" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M13 2 3 14h7l-1 8 10-12h-7l1-8Z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function IconMeasure() {
  return (
    <svg className="leanStep__svg" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 20V4M4 20h16M8 16v-4M12 20V8M16 14V6" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  )
}

function IconLearn() {
  return (
    <svg className="leanStep__svg" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M4 4v6h6M20 20v-6h-6M20 9A7 7 0 0 0 9 4M4 15a7 7 0 0 0 11 7"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

const loopSteps = [
  { n: 1, title: 'Problema', chip: 'Dato quieto', Icon: IconProblem, delay: 0.08 },
  { n: 2, title: 'Hipótesis', chip: 'WhatsApp + razón', Icon: IconHypothesis, delay: 0.18 },
  { n: 3, title: 'MVP', chip: '1 colegio piloto', Icon: IconMvp, delay: 0.28 },
  { n: 4, title: 'Medir', chip: '4 métricas', Icon: IconMeasure, delay: 0.38 },
  { n: 5, title: 'Aprender', chip: 'Iterar y escalar', Icon: IconLearn, delay: 0.48 },
] as const

const mvpStack = [
  { label: 'WhatsApp', tone: 'wa' as const },
  { label: 'Dashboard', tone: 'dash' as const },
  { label: 'Nutrición', tone: 'sub' as const },
] as const

export function LeanLoopSlide() {
  return (
    <div className="leanLoop leanLoop--visual">
      <motion.div
        className="leanLoop__ring"
        aria-hidden="true"
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: easeOut }}
      >
        <span className="leanLoop__ringLabel">Build</span>
        <span className="leanLoop__ringArrow">→</span>
        <span className="leanLoop__ringLabel">Measure</span>
        <span className="leanLoop__ringArrow">→</span>
        <span className="leanLoop__ringLabel">Learn</span>
      </motion.div>

      <div className="leanLoop__steps">
        {loopSteps.map((step) => (
          <motion.article
            key={step.n}
            className="leanStep leanStep--compact"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: step.delay, ease: easeOut }}
          >
            <motion.div
              className="leanStep__iconWrap"
              initial={{ scale: 0.7 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 420, damping: 20, delay: step.delay + 0.08 }}
            >
              <step.Icon />
              <span className="leanStep__n">{step.n}</span>
            </motion.div>
            <h2>{step.title}</h2>
            <span className="leanStep__chip">{step.chip}</span>
          </motion.article>
        ))}
      </div>

      <motion.div
        className="leanLoop__mvp"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.62 }}
      >
        <span className="leanLoop__mvpTitle">MVP en producción</span>
        <motion.div
          className="leanLoop__mvpPills"
          initial="hidden"
          animate="show"
          variants={{ show: { transition: { staggerChildren: 0.08, delayChildren: 0.68 } } }}
        >
          {mvpStack.map((item) => (
            <motion.span
              key={item.label}
              className={`leanLoop__pill leanLoop__pill--${item.tone}`}
              variants={{ hidden: { opacity: 0, scale: 0.9 }, show: { opacity: 1, scale: 1 } }}
            >
              {item.label}
            </motion.span>
          ))}
        </motion.div>
      </motion.div>
    </div>
  )
}
