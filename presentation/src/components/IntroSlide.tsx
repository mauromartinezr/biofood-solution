import { motion } from 'framer-motion'

type IntroSlideProps = {
  onStart: () => void
}

export function IntroSlide({ onStart }: IntroSlideProps) {
  return (
    <motion.div
      className="introSlide introSlide--minimal"
      aria-label="Inicio de presentación"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.button
        type="button"
        className="presentButton"
        onClick={onStart}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35, duration: 0.5 }}
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.98 }}
      >
        Presentar
      </motion.button>
    </motion.div>
  )
}
