import { motion } from 'framer-motion'
import starbucks from '../assets/starbucks.png'
import olimpica from '../assets/olimpica.png'
import logoBiofood from '../assets/logo-biofood.png'

const easeOut = [0.22, 1, 0.36, 1] as const

export function ProductsRelationSlide() {
  return (
    <motion.div
      className="productsSlide blackSlide blackSlide--products"
      role="region"
      aria-label="Relación entre productos"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.45 }}
    >
      <motion.div
        className="productsSlide__glow"
        aria-hidden="true"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 0.5, scale: 1 }}
        transition={{ duration: 1.2, ease: easeOut }}
      />

      <motion.div
        className="productsSlide__brands"
        initial="hidden"
        animate="show"
        variants={{
          hidden: {},
          show: { transition: { staggerChildren: 0.18, delayChildren: 0.2 } },
        }}
      >
        <motion.figure
          variants={{
            hidden: { opacity: 0, y: 24, scale: 0.9 },
            show: { opacity: 1, y: 0, scale: 1 },
          }}
          transition={{ duration: 0.65, ease: easeOut }}
        >
          <img src={starbucks} alt="Starbucks" />
        </motion.figure>
        <motion.figure
          variants={{
            hidden: { opacity: 0, y: 24, scale: 0.9 },
            show: { opacity: 1, y: 0, scale: 1 },
          }}
          transition={{ duration: 0.65, ease: easeOut }}
        >
          <img src={olimpica} alt="Olímpica" />
        </motion.figure>
      </motion.div>

      <motion.p
        className="productsSlide__question"
        initial={{ opacity: 0, y: 20, filter: 'blur(8px)' }}
        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        transition={{ duration: 0.75, delay: 0.55, ease: easeOut }}
      >
        ¿Qué relación crees que tienen{' '}
        <strong>estos tres productos</strong>?
      </motion.p>

      <motion.div
        className="productsSlide__reveal"
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 1.1, ease: easeOut }}
      >
        <span className="productsSlide__hint">El tercero es…</span>
        <img className="productsSlide__biofood" src={logoBiofood} alt="Biofood" />
      </motion.div>
    </motion.div>
  )
}
