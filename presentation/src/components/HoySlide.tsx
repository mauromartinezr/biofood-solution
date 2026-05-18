import { motion } from 'framer-motion'

const pains = [
  {
    role: 'Padres',
    copy: 'Ven saldo, pero no tienen una razón personalizada para recargar más.',
    delay: 0.1,
  },
  {
    role: 'Familias',
    copy: 'Pagan alimentación, pero no ven calorías, grasas ni azúcares semanales.',
    delay: 0.22,
  },
  {
    role: 'Cafeterías',
    copy: 'Venden todos los días, pero deciden portafolio por intuición.',
    delay: 0.34,
  },
]

const easeOut = [0.22, 1, 0.36, 1] as const

export function HoySlide() {
  return (
    <motion.div className="hoyGrid" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      {pains.map((item, index) => (
        <motion.article
          key={item.role}
          className="hoyCard"
          initial={{ opacity: 0, y: 32, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.65, delay: item.delay, ease: easeOut }}
          whileHover={{ y: -4, boxShadow: '0 28px 60px rgba(184, 92, 107, 0.15)' }}
        >
          <motion.span
            className="hoyCard__index"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 420, damping: 18, delay: item.delay + 0.2 }}
          >
            {String(index + 1).padStart(2, '0')}
          </motion.span>
          <span className="hoyCard__role">{item.role}</span>
          <p>{item.copy}</p>
          <motion.div
            className="hoyCard__bar"
            aria-hidden="true"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.55, delay: item.delay + 0.35 }}
          />
        </motion.article>
      ))}
    </motion.div>
  )
}
