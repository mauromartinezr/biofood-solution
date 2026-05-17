import { motion } from 'framer-motion'

const easeOut = [0.22, 1, 0.36, 1] as const

const actors = ['Familias', 'Colegios', 'Cafeterías'] as const

const revenueStreams = [
  'Recargas inteligentes',
  'SaaS cafetería',
  'Plan Nutrición',
  'Fintech',
] as const

export function FintechTrustSlide() {
  return (
    <motion.div
      className="fintechSlide blackSlide fintechSlide--finale"
      role="region"
      aria-label="Cierre: confianza y fintech"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        className="fintechSlide__glow"
        aria-hidden="true"
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.2, ease: easeOut }}
      />

      <motion.p
        className="fintechSlide__eyebrow"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.1 }}
      >
        Propuesta de valor
      </motion.p>

      <motion.h2
        className="fintechSlide__title"
        initial={{ opacity: 0, y: 32, scale: 0.92, filter: 'blur(12px)' }}
        animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
        transition={{ duration: 0.85, delay: 0.2, ease: easeOut }}
      >
        Confianza
      </motion.h2>

      <motion.p
        className="fintechSlide__hook"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.45, ease: easeOut }}
      >
        El puente a <strong>fintech</strong>.
      </motion.p>

      <motion.p
        className="fintechSlide__punch"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, delay: 0.58, ease: easeOut }}
      >
        Dato real → decisiones que venden.
      </motion.p>

      <motion.div
        className="fintechSlide__revenue"
        initial="hidden"
        animate="show"
        variants={{
          hidden: {},
          show: { transition: { staggerChildren: 0.08, delayChildren: 0.62 } },
        }}
      >
        {revenueStreams.map((stream) => (
          <motion.span
            key={stream}
            className="fintechSlide__revenueChip"
            variants={{
              hidden: { opacity: 0, y: 10, scale: 0.92 },
              show: { opacity: 1, y: 0, scale: 1 },
            }}
            transition={{ duration: 0.45, ease: easeOut }}
          >
            {stream}
          </motion.span>
        ))}
      </motion.div>

      <motion.div
        className="fintechSlide__actors"
        initial="hidden"
        animate="show"
        variants={{
          hidden: {},
          show: { transition: { staggerChildren: 0.1, delayChildren: 0.72 } },
        }}
      >
        {actors.map((name) => (
          <motion.span
            key={name}
            className="fintechSlide__actor"
            variants={{
              hidden: { opacity: 0, y: 14, scale: 0.9 },
              show: { opacity: 1, y: 0, scale: 1 },
            }}
            transition={{ duration: 0.5, ease: easeOut }}
          >
            {name}
          </motion.span>
        ))}
      </motion.div>

      <motion.p
        className="fintechSlide__closing"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 1 }}
      >
        Biofood Connect
      </motion.p>
    </motion.div>
  )
}
