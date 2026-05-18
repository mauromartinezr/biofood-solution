import { Fragment } from 'react'
import { motion } from 'framer-motion'

const steps = [
  {
    n: 1,
    title: 'Detectamos el patrón',
    copy: 'El sistema entiende el consumo real del estudiante.',
    variant: 'green' as const,
    delay: 0.15,
  },
  {
    n: 2,
    title: 'WhatsApp recomienda',
    copy: 'El padre recibe una recarga sugerida con una razón concreta.',
    variant: 'whatsapp' as const,
    delay: 0.3,
  },
  {
    n: 3,
    title: 'La cafetería decide',
    copy: 'Biofood Connect entrega recomendaciones de surtido, reemplazos y categorías.',
    variant: 'green' as const,
    delay: 0.45,
  },
]

const easeOut = [0.22, 1, 0.36, 1] as const

export function ConnectStepsSlide() {
  return (
    <div className="connectFlow">
      <motion.div
        className="connectFlow__line"
        aria-hidden="true"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 1, delay: 0.2, ease: easeOut }}
      />

      {steps.map((step, index) => (
        <Fragment key={step.n}>
          <motion.article
            className={`connectCard connectCard--${step.variant}`}
            initial={{ opacity: 0, y: 28, filter: 'blur(6px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ duration: 0.7, delay: step.delay, ease: easeOut }}
            whileHover={{ y: -6, transition: { duration: 0.25 } }}
          >
            <motion.strong
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 380, damping: 16, delay: step.delay + 0.15 }}
            >
              {step.n}
            </motion.strong>
            {step.variant === 'whatsapp' ? <span className="connectCard__wa">WhatsApp</span> : null}
            <h2>{step.title}</h2>
            <p>{step.copy}</p>
          </motion.article>

          {index < steps.length - 1 ? (
            <motion.div
              className="connectFlow__arrow"
              aria-hidden="true"
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 0.65, scale: 1 }}
              transition={{ duration: 0.45, delay: step.delay + 0.35 }}
            >
              <span>→</span>
            </motion.div>
          ) : null}
        </Fragment>
      ))}
    </div>
  )
}
