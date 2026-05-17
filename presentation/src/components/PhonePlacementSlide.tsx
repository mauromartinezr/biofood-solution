import { motion } from 'framer-motion'

export function PhonePlacementSlide() {
  return (
    <motion.div
      className="phoneSlide"
      role="region"
      aria-label="Zona para colocar el celular"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <motion.div
        className="phoneSlide__disc"
        initial={{ scale: 0.88, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      />
    </motion.div>
  )
}
