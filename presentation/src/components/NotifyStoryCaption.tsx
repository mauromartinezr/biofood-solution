import { motion } from 'framer-motion'

const block = {
  hidden: { opacity: 0, y: 18 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, delay: 0.5 + i * 0.18, ease: [0.22, 1, 0.36, 1] },
  }),
}

export function NotifyStoryCaption() {
  return (
    <motion.div
      className="notifyStory"
      initial="hidden"
      animate="show"
      variants={{
        hidden: {},
        show: { transition: { staggerChildren: 0.12, delayChildren: 0.45 } },
      }}
    >
      <motion.div className="notifyStory__block notifyStory__block--late" variants={block} custom={0}>
        <motion.div
          className="notifyStory__labels"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.55 }}
        >
          <span className="waCaption waCaption--dim">WhatsApp</span>
          <span className="notifyTag notifyTag--late">Reactivo</span>
        </motion.div>
        <p>
          El hijo escribe cuando <span>ya tiene el problema</span>. El papá sigue en reunión.
        </p>
      </motion.div>

      <motion.div className="notifyStory__arrow" variants={block} custom={1} aria-hidden="true">
        ↓
      </motion.div>

      <motion.div className="notifyStory__block notifyStory__block--early" variants={block} custom={2}>
        <motion.div
          className="notifyStory__labels"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.85 }}
        >
          <span className="waCaption">WhatsApp</span>
          <span className="notifyTag notifyTag--early">Con anticipación</span>
          <motion.span
            className="notifyBadge"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 480, damping: 16, delay: 1.05 }}
          >
            1+
          </motion.span>
        </motion.div>
        <p>
          <strong>Biofood Connect</strong> avisa antes: saldo bajo, recarga sugerida, mismo canal.
        </p>
        <p className="notifyStory__hook">Por eso estamos aquí.</p>
      </motion.div>
    </motion.div>
  )
}
