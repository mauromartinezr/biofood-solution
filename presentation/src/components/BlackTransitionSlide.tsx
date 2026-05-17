import { motion } from 'framer-motion'

export function BlackTransitionSlide() {
  return (
    <motion.div
      className="blackSlide blackSlide--transition"
      aria-hidden="true"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
    >
      <motion.div
        className="blackSlide__veil"
        initial={{ scale: 0.2, opacity: 0 }}
        animate={{ scale: 1.4, opacity: 1 }}
        transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
      />
      <motion.div
        className="blackSlide__fill"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.9, delay: 0.15, ease: [0.4, 0, 0.2, 1] }}
      />
    </motion.div>
  )
}
