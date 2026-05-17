import { useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'

type Slide = {
  label: string
  title: string
  body: ReactNode
}

type Metric = {
  prefix?: string
  value: number
  suffix?: string
  thousands?: boolean
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
    title: 'Revenue adicional',
    metric: { prefix: '+$', value: 348, suffix: 'M' },
    detail: 'COP anuales proyectados con el escenario de menor friccion.',
  },
  {
    stage: 'Escala',
    title: 'Siguiente meta',
    metric: { prefix: '+$', value: 1542, suffix: 'M', thousands: true },
    detail: 'COP anuales si el ticket promedio llega a $6.000.',
  },
]

function formatMetric(value: number, metric: Metric) {
  const formatted = metric.thousands
    ? Math.round(value).toLocaleString('es-CO')
    : Math.round(value).toString()
  return `${metric.prefix ?? ''}${formatted}${metric.suffix ?? ''}`
}

function AnimatedMetric({ metric }: { metric: Metric }) {
  const [value, setValue] = useState(0)

  useEffect(() => {
    let frame = 0
    const totalFrames = 42

    function animate() {
      frame += 1
      const progress = Math.min(frame / totalFrames, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setValue(metric.value * eased)

      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }

    setValue(0)
    const animation = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animation)
  }, [metric])

  return <>{formatMetric(value, metric)}</>
}

function App() {
  const [index, setIndex] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)

  const slides: Slide[] = useMemo(
    () => [
      {
        label: '',
        title: '',
        body: (
          <div className="blackSlide" aria-label="Pantalla negra">
            <button type="button" className="presentButton" onClick={startPresentation}>
              Presentar
            </button>
          </div>
        ),
      },
      {
        label: 'Pitch',
        title: 'La cafeteria escolar que vende mejor porque aprende de cada compra.',
        body: (
          <>
            <p className="lead">
              Convertimos consumo, recargas y datos nutricionales en decisiones simples:
              padres recargan mas, familias entienden que comen sus hijos y cafeterias
              deciden que vender.
            </p>
            <div className="journey" aria-label="Flujo de valor">
              <span>Consumo</span>
              <span>WhatsApp</span>
              <span>Recarga</span>
              <span>Revenue</span>
            </div>
          </>
        ),
      },
      {
        label: 'Hoy',
        title: 'El dato se queda quieto.',
        body: (
          <div className="split">
            <article>
              <span>Padres</span>
              <p>Ven saldo, pero no tienen una razon personalizada para recargar mas.</p>
            </article>
            <article>
              <span>Familias</span>
              <p>Pagan alimentacion, pero no ven calorias, grasas ni azucares semanales.</p>
            </article>
            <article>
              <span>Cafeterias</span>
              <p>Venden todos los dias, pero deciden portafolio por intuicion.</p>
            </article>
          </div>
        ),
      },
      {
        label: 'Con Biofood Connect',
        title: 'El dato empuja una accion.',
        body: (
          <div className="steps">
            <article>
              <strong>1</strong>
              <h2>Detectamos el patron</h2>
              <p>El sistema entiende el consumo real del estudiante.</p>
            </article>
            <article>
              <strong>2</strong>
              <h2>WhatsApp recomienda</h2>
              <p>El padre recibe una recarga sugerida con una razon concreta.</p>
            </article>
            <article>
              <strong>3</strong>
              <h2>La cafeteria decide</h2>
              <p>Biofood Connect entrega recomendaciones de surtido, reemplazos y categorias.</p>
            </article>
          </div>
        ),
      },
      {
        label: 'Impacto',
        title: 'Impacto como funnel: dato, accion, revenue y escala.',
        body: (
          <div className="funnelCanvas">
            <div className="funnelCopy">
              {funnelStages.map((item) => (
                <article key={item.stage}>
                  <span>{item.stage}</span>
                  <h2>{item.title}</h2>
                  <p>{item.detail}</p>
                </article>
              ))}
            </div>

            <div className="funnelShape" aria-label="Funnel de impacto">
              {funnelStages.map((item, itemIndex) => (
                <div className={`funnelSlice slice${itemIndex + 1}`} key={item.stage}>
                  <span>{String(itemIndex + 1).padStart(2, '0')}</span>
                  <strong>
                    <AnimatedMetric metric={item.metric} />
                  </strong>
                </div>
              ))}
            </div>
          </div>
        ),
      },
      {
        label: 'Cierre',
        title: 'No es otro reporte. Es un motor de decisiones para vender mas.',
        body: (
          <p className="lead">
            Biofood Connect convierte los datos escolares en mayor recarga, mejor
            informacion nutricional y cafeterias con inteligencia de negocio.
          </p>
        ),
      },
    ],
    [],
  )

  const current = slides[index]

  function previous() {
    setIndex((value) => Math.max(0, value - 1))
  }

  function next() {
    setIndex((value) => Math.min(slides.length - 1, value + 1))
  }

  async function startPresentation() {
    if (!document.fullscreenElement) {
      await document.documentElement.requestFullscreen()
    }
    setIndex(1)
  }

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'ArrowLeft') {
        previous()
      }
      if (event.key === 'ArrowRight') {
        next()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [slides.length])

  useEffect(() => {
    function handleFullscreenChange() {
      setIsFullscreen(Boolean(document.fullscreenElement))
    }

    handleFullscreenChange()
    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [])

  return (
    <main className="deck">
      <section className="slide" aria-live="polite" key={index}>
        {current.label || current.title ? (
          <>
            <p className="eyebrow">{current.label}</p>
            <h1>{current.title}</h1>
            <div className="content">{current.body}</div>
          </>
        ) : (
          current.body
        )}
      </section>
      {index > 0 && !isFullscreen ? (
        <button type="button" className="fullscreenButton" onClick={startPresentation}>
          Presentar
        </button>
      ) : null}
    </main>
  )
}

export default App
