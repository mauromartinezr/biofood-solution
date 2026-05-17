import { useCallback, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { IntroSlide } from './components/IntroSlide'
import { ImpactQuestionSlide } from './components/ImpactQuestionSlide'
import { PhoneConnectSlide } from './components/PhoneConnectSlide'
import { PhonePlacementSlide } from './components/PhonePlacementSlide'
import { ConnectStepsSlide } from './components/ConnectStepsSlide'
import { BlackTransitionSlide } from './components/BlackTransitionSlide'
import { CafeteriaDashboardSlide } from './components/CafeteriaDashboardSlide'
import { FintechTrustSlide } from './components/FintechTrustSlide'
import { ProductsRelationSlide } from './components/ProductsRelationSlide'
import { NeuralNetworkSlide } from './components/NeuralNetworkSlide'
import { PhoneFeaturesSlide } from './components/PhoneFeaturesSlide'
import { HoySlide } from './components/HoySlide'
import { JtbdSlide } from './components/JtbdSlide'
import { LeanLoopSlide } from './components/LeanLoopSlide'
import { BusinessCanvasSlide } from './components/BusinessCanvasSlide'
import { ImpactFunnelSlide } from './components/ImpactFunnelSlide'
import { TrustPromiseSlide } from './components/TrustPromiseSlide'
import { NotifyStoryCaption } from './components/NotifyStoryCaption'
import { StoryImageSlide } from './components/StoryImageSlide'
import ricardo1 from './assets/ricardo1.png'
import ricardo2 from './assets/ricardo2.png'
import ricardo3 from './assets/ricardo3.png'
import ricardo4 from './assets/ricardo4.png'

type Slide = {
  id: string
  label: string
  title: string
  body: ReactNode
  /** Slide a pantalla completa sin layout estándar */
  full?: boolean
  /** Fondo oscuro en toda la ventana */
  dark?: boolean
}

const funnelStages = [
  {
    stage: 'Insight',
    title: 'Ticket actual',
    metric: { prefix: '$', value: 4292, thousands: true },
    detail: 'Patron de consumo por estudiante y base real para personalizar recargas.',
  },
  {
    stage: 'Accion',
    title: 'Recomendacion',
    metric: { prefix: '$', value: 5000, thousands: true },
    detail: 'WhatsApp argumenta una recarga mayor con datos reales del hijo.',
  },
  {
    stage: 'Resultado',
    title: 'Revenue transaccional',
    metric: { prefix: '+$', value: 348, suffix: 'M' },
    detail: 'COP anuales proyectados por mayor ticket y recargas anticipadas.',
  },
  {
    stage: 'Recurrente',
    title: 'Plan Nutricion Familiar',
    metric: { prefix: '$', value: 29900, suffix: '/mes' },
    detail: 'Suscripcion: macros semanales, alertas y recomendaciones para mejorar nutricion en casa.',
  },
  {
    stage: 'Escala',
    title: 'Meta combinada',
    metric: { prefix: '+$', value: 1542, suffix: 'M', thousands: true },
    detail: 'COP anuales: recargas + MRR familias + SaaS cafeterias en red de colegios.',
  },
]

function App() {
  const [index, setIndex] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)

  const slides: Slide[] = useMemo(
    () => [
      {
        id: 'intro',
        label: '',
        title: '',
        full: true,
        dark: true,
        body: null,
      },
      {
        id: 'impact-question',
        label: '',
        title: '',
        full: true,
        dark: true,
        body: <ImpactQuestionSlide />,
      },
      {
        id: 'ricardo-1',
        label: '',
        title: '',
        full: true,
        dark: true,
        body: (
          <StoryImageSlide
            src={ricardo1}
            alt="Ricardo en reunion de negocios, concentrado y exitoso"
            step="01"
            cinematic
            brandSide="right"
            caption={
              <>
                <strong>Ricardo.</strong> Lo tiene todo bajo control.
              </>
            }
          />
        ),
      },
      {
        id: 'ricardo-2',
        label: '',
        title: '',
        full: true,
        dark: true,
        body: (
          <StoryImageSlide
            src={ricardo2}
            alt="Estudiante en cafeteria con bandeja vacia y celular"
            step="02"
            caption={
              <>
                Mientras tanto, su hijo llega al comedor <span>sin saldo</span>.
              </>
            }
          />
        ),
      },
      {
        id: 'ricardo-3',
        label: '',
        title: '',
        full: true,
        dark: true,
        body: (
          <StoryImageSlide
            src={ricardo3}
            alt="Mensaje de WhatsApp al papa: Hola papa, tengo un problema"
            step="03"
            cinematic
            brandSide="right"
            caption={<NotifyStoryCaption />}
          />
        ),
      },
      {
        id: 'ricardo-4',
        label: '',
        title: '',
        full: true,
        dark: true,
        body: (
          <StoryImageSlide
            src={ricardo4}
            alt="Comedor vacio, solo un vaso de agua en la mesa"
            step="04"
            caption={
              <motion.p
                className="storyClose__hook storyClose__hook--solo"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.65, delay: 0.5 }}
              >
                No es hambre. Es <strong>desconexión</strong>.
              </motion.p>
            }
          />
        ),
      },
      {
        id: 'phone-demo',
        label: '',
        title: '',
        full: true,
        dark: true,
        body: <PhonePlacementSlide />,
      },
      {
        id: 'phone-connect',
        label: '',
        title: '',
        full: true,
        dark: true,
        body: <PhoneConnectSlide />,
      },
      {
        id: 'trust-promise',
        label: '',
        title: '',
        full: true,
        dark: true,
        body: <TrustPromiseSlide />,
      },
      {
        id: 'pitch',
        label: 'Pitch',
        title: 'La cafeteria escolar que vende mejor porque aprende de cada compra.',
        body: (
          <>
            <p className="lead">
              Convertimos consumo, recargas y datos nutricionales en decisiones simples:
              padres recargan mas, familias entienden que comen sus hijos y cafeterias
              deciden que vender.
            </p>
            <motion.div
              className="journey"
              aria-label="Flujo de valor"
              initial="hidden"
              animate="show"
              variants={{
                hidden: {},
                show: { transition: { staggerChildren: 0.12, delayChildren: 0.2 } },
              }}
            >
              {['Consumo', 'WhatsApp', 'Recarga', 'Revenue'].map((step) => (
                <motion.span
                  key={step}
                  variants={{
                    hidden: { opacity: 0, y: 16 },
                    show: { opacity: 1, y: 0 },
                  }}
                >
                  {step}
                </motion.span>
              ))}
            </motion.div>
          </>
        ),
      },
      {
        id: 'hoy',
        label: 'Hoy',
        title: 'El dato se queda quieto.',
        body: <HoySlide />,
      },
      {
        id: 'jtbd',
        label: 'Jobs to be done',
        title: 'El trabajo que cada actor le monta a Biofood.',
        body: <JtbdSlide />,
      },
      {
        id: 'connect',
        label: 'Con Biofood Connect',
        title: 'El dato empuja una accion.',
        body: <ConnectStepsSlide />,
      },
      {
        id: 'lean-loop',
        label: 'Lean startup',
        title: 'Problema → MVP → metricas.',
        body: <LeanLoopSlide />,
      },
      {
        id: 'neural-network',
        label: 'Motor de patrones',
        title: 'La red entiende el consumo real del estudiante.',
        body: <NeuralNetworkSlide />,
      },
      {
        id: 'whatsapp-features',
        label: 'WhatsApp recomienda',
        title: 'Anticipa, informa y recompensa.',
        body: <PhoneFeaturesSlide />,
      },
      {
        id: 'cafeteria-dashboard',
        label: 'La cafetería decide',
        title: 'Inventario, tendencias y WhatsApp en un solo tablero.',
        body: <CafeteriaDashboardSlide />,
      },
      {
        id: 'business-canvas',
        label: 'Modelo de negocio',
        title: 'Un canvas, tres motores de ingreso.',
        body: <BusinessCanvasSlide />,
      },
      {
        id: 'impact',
        label: 'Impacto',
        title: 'Funnel economico: transaccional, recurrente y escala.',
        body: <ImpactFunnelSlide stages={funnelStages} />,
      },
      {
        id: 'black-pause',
        label: '',
        title: '',
        full: true,
        dark: true,
        body: <BlackTransitionSlide />,
      },
      {
        id: 'products-relation',
        label: '',
        title: '',
        full: true,
        dark: true,
        body: <ProductsRelationSlide />,
      },
      {
        id: 'fintech-trust',
        label: '',
        title: '',
        full: true,
        dark: true,
        body: <FintechTrustSlide />,
      },
    ],
    [],
  )

  const current = slides[index]
  const isDarkDeck = Boolean(current.dark)

  const previous = useCallback(() => {
    setIndex((value) => Math.max(0, value - 1))
  }, [])

  const next = useCallback(() => {
    setIndex((value) => Math.min(slides.length - 1, value + 1))
  }, [slides.length])

  const startPresentation = useCallback(async () => {
    if (!document.fullscreenElement) {
      await document.documentElement.requestFullscreen()
    }
    setIndex(1)
  }, [])

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'ArrowLeft') {
        previous()
      }
      if (event.key === 'ArrowRight' || event.key === ' ') {
        event.preventDefault()
        next()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [next, previous])

  useEffect(() => {
    function handleFullscreenChange() {
      setIsFullscreen(Boolean(document.fullscreenElement))
    }

    handleFullscreenChange()
    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [])

  useEffect(() => {
    document.body.classList.toggle('deck--dark', isDarkDeck)
    return () => document.body.classList.remove('deck--dark')
  }, [isDarkDeck])

  return (
    <main className={`deck ${isDarkDeck ? 'deck--dark' : ''}`}>
      <AnimatePresence mode="wait">
        <motion.section
          className={`slide ${current.full ? 'slide--full' : ''}`}
          aria-live="polite"
          key={current.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{
            duration: current.id === 'black-transition' || current.id === 'black-pause' ? 0.2 : 0.35,
          }}
        >
          {current.id === 'intro' ? (
            <IntroSlide onStart={startPresentation} />
          ) : current.full ? (
            current.body
          ) : (
            <>
              <motion.p
                className="eyebrow"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35 }}
              >
                {current.label}
              </motion.p>
              <motion.h1
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.05 }}
              >
                {current.title}
              </motion.h1>
              <motion.div
                className="content"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.12 }}
              >
                {current.body}
              </motion.div>
            </>
          )}
        </motion.section>
      </AnimatePresence>

      {index > 0 && !isFullscreen ? (
        <button type="button" className="fullscreenButton" onClick={startPresentation}>
          Presentar
        </button>
      ) : null}

      {index > 0 ? (
        <nav className="slideNav" aria-label="Navegacion de slides">
          <button type="button" onClick={previous} disabled={index === 0}>
            Anterior
          </button>
          <span>
            {index + 1} / {slides.length}
          </span>
          <button type="button" onClick={next} disabled={index === slides.length - 1}>
            Siguiente
          </button>
        </nav>
      ) : null}
    </main>
  )
}

export default App
