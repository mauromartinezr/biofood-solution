import { motion } from 'framer-motion'
import ricardo2 from '../assets/ricardo2.png'
import ricardo3 from '../assets/ricardo3.png'
import hogar from '../assets/hogar.png'

const fadeUp = {
  hidden: { opacity: 0, y: 28, filter: 'blur(8px)' },
  show: (delay: number) => ({
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.9, delay, ease: [0.22, 1, 0.36, 1] },
  }),
}

const photos = [
  { src: ricardo2, label: 'Tu hijo', side: 'left' as const },
  { src: ricardo3, label: 'Conexión', side: 'center' as const },
  { src: hogar, label: 'Tu hogar', side: 'right' as const },
]

function FamilyIcon() {
  return (
    <svg className="trustSlide__icon" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8h5z"
      />
    </svg>
  )
}

function HeartIcon() {
  return (
    <svg className="trustSlide__icon" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
      />
    </svg>
  )
}

export function TrustPromiseSlide() {
  return (
    <motion.div
      className="trustSlide"
      role="region"
      aria-label="Promesa de bienestar familiar"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <motion.div
        className="trustSlide__warmth"
        aria-hidden="true"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.2 }}
      />

      <motion.div
        className="trustSlide__photos"
        aria-hidden="true"
        initial="hidden"
        animate="show"
        variants={{
          hidden: {},
          show: { transition: { staggerChildren: 0.15, delayChildren: 0.1 } },
        }}
      >
        {photos.map((photo) => (
          <motion.figure
            key={photo.side}
            className={`trustSlide__photo trustSlide__photo--${photo.side}`}
            variants={{
              hidden: { opacity: 0, y: 24, scale: 0.94 },
              show: { opacity: 1, y: 0, scale: 1 },
            }}
            transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
          >
            <img src={photo.src} alt="" />
            <figcaption>{photo.label}</figcaption>
          </motion.figure>
        ))}
      </motion.div>

      <motion.div
        className="trustSlide__card"
        initial="hidden"
        animate="show"
        variants={{
          hidden: {},
          show: { transition: { staggerChildren: 0.08, delayChildren: 0.45 } },
        }}
      >
        <motion.div className="trustSlide__icons" custom={0.5} variants={fadeUp} aria-hidden="true">
          <FamilyIcon />
          <span className="trustSlide__iconDot" />
          <HeartIcon />
        </motion.div>

        <motion.p className="trustSlide__lead" custom={0.6} variants={fadeUp}>
          No buscamos ser una billetera.
        </motion.p>

        <motion.h2 className="trustSlide__promise" custom={0.9} variants={fadeUp}>
          Buscamos ser el <span>bienestar</span> de tu <span>familia</span>.
        </motion.h2>

        <motion.div className="trustSlide__rule" custom={1.2} variants={fadeUp} aria-hidden="true" />

        <motion.p className="trustSlide__sub" custom={1.4} variants={fadeUp}>
          Tranquilidad para los papás. Cuidado real para los hijos.
        </motion.p>
      </motion.div>
    </motion.div>
  )
}
