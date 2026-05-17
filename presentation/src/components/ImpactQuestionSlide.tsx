import { motion } from 'framer-motion'

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.14, delayChildren: 0.35 },
  },
}

const line = {
  hidden: { opacity: 0, y: 48, filter: 'blur(10px)' },
  show: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.75, ease: [0.22, 1, 0.36, 1] },
  },
}

const pulse = {
  hidden: { scale: 0.92, opacity: 0 },
  show: {
    scale: 1,
    opacity: 1,
    transition: { duration: 0.9, delay: 1.05, ease: [0.22, 1, 0.36, 1] },
  },
}

const badgePop = {
  hidden: { scale: 0, opacity: 0 },
  show: {
    scale: 1,
    opacity: 1,
    transition: { type: 'spring', stiffness: 520, damping: 18, delay: 0.85 },
  },
}

export function ImpactQuestionSlide() {
  return (
    <motion.div
      className="blackSlide blackSlide--question"
      role="region"
      aria-label="Pregunta central"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <motion.div
        className="questionGlow"
        aria-hidden="true"
        initial={{ opacity: 0, scale: 0.6 }}
        animate={{ opacity: 0.55, scale: 1 }}
        transition={{ duration: 1.4, delay: 0.2, ease: 'easeOut' }}
      />

      <motion.div className="questionBlock" variants={container} initial="hidden" animate="show">
        <motion.p className="questionLine" variants={line}>
          ¿Por qué no tienes una
        </motion.p>
        <motion.p className="questionLine questionLine--notify" variants={line}>
          <span className="waNotify" role="img" aria-label="notificación estilo WhatsApp con 1 mensaje pendiente">
            <span className="waNotify__bubble">
              <svg className="waNotify__icon" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  fill="currentColor"
                  d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 2.09.66 4.03 1.78 5.62L2 22l4.68-1.82a9.86 9.86 0 0 0 5.36 1.55h.01c5.46 0 9.91-4.45 9.91-9.91C21.95 6.45 17.5 2 12.04 2zm5.4 13.07c-.15.42-.87.77-1.2.82-.31.04-.71.06-1.15-.07-.26-.08-.6-.19-1.04-.37-1.83-.79-3.02-2.65-3.11-2.77-.09-.12-.74-.97-.74-1.85 0-.88.46-1.31.62-1.49.17-.18.37-.23.49-.23.12 0 .24 0 .35.01.11 0 .26-.04.41.31.15.35.51 1.24.55 1.33.05.09.08.2.02.32-.06.12-.09.2-.18.31-.09.11-.19.25-.27.34-.09.09-.18.19-.08.37.1.18.45.74.96 1.2.66.59 1.22.77 1.4.86.18.09.29.08.4-.05.11-.13.47-.55.6-.74.13-.19.26-.16.44-.1.18.06 1.14.54 1.34.64.2.1.33.15.38.23.05.08.05.47-.1.89z"
                />
              </svg>
              <span className="waNotify__word">notificación</span>
            </span>
            <motion.span
              className="waNotify__badge"
              variants={badgePop}
              initial="hidden"
              animate="show"
              aria-hidden="true"
            >
              <motion.span
                className="waNotify__badgeInner"
                animate={{ scale: [1, 1.12, 1] }}
                transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut', delay: 1.4 }}
              >
                1+
              </motion.span>
            </motion.span>
          </span>
        </motion.p>
        <motion.p className="questionLine questionLine--accent" variants={line}>
          para cuando <span className="questionHighlight">tu hijo</span>
        </motion.p>
        <motion.p className="questionLine questionLine--punch" variants={line}>
          se queda <span className="questionPain">sin almorzar?</span>
        </motion.p>
        <motion.div className="questionRule" variants={pulse} aria-hidden="true" />
        <motion.p className="questionSub" variants={pulse}>
          No es hambre. Es desconexión.
        </motion.p>
      </motion.div>
    </motion.div>
  )
}
