import { motion } from 'framer-motion'
import logoBiofood from '../assets/logo-biofood.png'

export function PhoneConnectSlide() {
  return (
    <motion.div
      className="phoneSlide phoneSlide--connect"
      role="region"
      aria-label="Biofood Connect"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <motion.div
        className="phoneSlide__brandRow"
        initial="hidden"
        animate="show"
        variants={{
          hidden: {},
          show: { transition: { staggerChildren: 0.2, delayChildren: 0.15 } },
        }}
      >
        <motion.img
          className="phoneSlide__logo"
          src={logoBiofood}
          alt="Biofood"
          variants={{
            hidden: { opacity: 0, y: 20 },
            show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
          }}
        />
        <motion.span
          className="phoneSlide__connect"
          variants={{
            hidden: { opacity: 0, x: -20, filter: 'blur(8px)' },
            show: {
              opacity: 1,
              x: 0,
              filter: 'blur(0px)',
              transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
            },
          }}
          animate={{
            textShadow: [
              '0 0 24px rgba(43, 124, 255, 0.35)',
              '0 0 48px rgba(43, 124, 255, 0.7)',
              '0 0 24px rgba(43, 124, 255, 0.35)',
            ],
          }}
          transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut', delay: 0.9 }}
        >
          Connect
        </motion.span>
      </motion.div>
    </motion.div>
  )
}
