import { motion } from 'framer-motion'
import type { ReactNode } from 'react'
import logoBiofood from '../assets/logo-biofood.png'

type StoryImageSlideProps = {
  src: string
  alt: string
  caption?: ReactNode
  step?: string
  cinematic?: boolean
  /** Lado de la barra negra con logo (slides 3 y 5: derecha; slide 6: izquierda) */
  brandSide?: 'left' | 'right'
}

function BrandPillar({ step, side }: { step?: string; side: 'left' | 'right' }) {
  return (
    <aside
      className={`storyImageSlide__pillar storyImageSlide__pillar--${side} storyImageSlide__pillar--brand`}
    >
      {step ? (
        <motion.span
          className="storyImageSlide__step storyImageSlide__step--pillar"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.35 }}
        >
          {step}
        </motion.span>
      ) : null}
      <div className="storyImageSlide__brandWrap">
        <motion.img
          className="storyImageSlide__brandVertical"
          src={logoBiofood}
          alt="Biofood"
          initial={{ opacity: 0, scale: 0.9, rotate: -96 }}
          animate={{ opacity: 1, scale: 1, rotate: -90 }}
          transition={{ duration: 0.75, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>
      <motion.div
        className="storyImageSlide__pillarLine"
        aria-hidden="true"
        initial={{ scaleY: 0 }}
        animate={{ scaleY: 1 }}
        transition={{ duration: 0.8, delay: 0.5 }}
      />
    </aside>
  )
}

function EmptyPillar({ side }: { side: 'left' | 'right' }) {
  return (
    <aside
      className={`storyImageSlide__pillar storyImageSlide__pillar--${side} storyImageSlide__pillar--empty`}
      aria-hidden="true"
    >
      <motion.div
        className="storyImageSlide__pillarLine"
        initial={{ scaleY: 0 }}
        animate={{ scaleY: 1 }}
        transition={{ duration: 0.8, delay: 0.55 }}
      />
    </aside>
  )
}

export function StoryImageSlide({
  src,
  alt,
  caption,
  step,
  cinematic = false,
  brandSide = 'left',
}: StoryImageSlideProps) {
  const brandOnRight = brandSide === 'right'

  return (
    <motion.div
      className={`storyImageSlide ${cinematic ? 'storyImageSlide--cinematic' : ''}`}
      role="img"
      aria-label={alt}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.45 }}
    >
      {cinematic ? (
        <>
          {brandOnRight ? <EmptyPillar side="left" /> : <BrandPillar step={step} side="left" />}

          <motion.div
            className="storyImageSlide__frame"
            initial={{ opacity: 0, scale: 1.02 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.05, ease: [0.22, 1, 0.36, 1] }}
          >
            <motion.img
              className="storyImageSlide__img"
              src={src}
              alt={alt}
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.1, delay: 0.1 }}
            />
            <motion.div
              className="storyImageSlide__overlay"
              aria-hidden="true"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.25 }}
            />
            {caption ? (
              <motion.div
                className="storyImageSlide__caption storyImageSlide__caption--frame"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.65, delay: 0.45, ease: [0.22, 1, 0.36, 1] }}
              >
                {caption}
              </motion.div>
            ) : null}
          </motion.div>

          {brandOnRight ? <BrandPillar step={step} side="right" /> : <EmptyPillar side="right" />}
        </>
      ) : (
        <>
          <motion.img
            className="storyImageSlide__img"
            src={src}
            alt={alt}
            initial={{ opacity: 0, scale: 1.08 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
          />
          <motion.div
            className="storyImageSlide__overlay"
            aria-hidden="true"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          />
          {step ? (
            <motion.span
              className="storyImageSlide__step"
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.35 }}
            >
              {step}
            </motion.span>
          ) : null}
          {caption ? (
            <motion.div
              className="storyImageSlide__caption"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, delay: 0.45, ease: [0.22, 1, 0.36, 1] }}
            >
              {caption}
            </motion.div>
          ) : null}
        </>
      )}
    </motion.div>
  )
}
