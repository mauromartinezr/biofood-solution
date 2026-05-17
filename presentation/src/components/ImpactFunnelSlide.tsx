import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

type Metric = {
  prefix?: string
  value: number
  suffix?: string
  thousands?: boolean
}

export type FunnelStage = {
  stage: string
  title: string
  metric: Metric
  detail: string
}

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

type Props = {
  stages: FunnelStage[]
}

export function ImpactFunnelSlide({ stages }: Props) {
  return (
    <motion.div
      className="funnelCanvas"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.45 }}
    >
      <motion.div
        className="funnelCopy"
        initial="hidden"
        animate="show"
        variants={{
          hidden: {},
          show: { transition: { staggerChildren: 0.08 } },
        }}
      >
        {stages.map((item) => (
          <motion.article
            key={item.stage}
            variants={{
              hidden: { opacity: 0, x: -12 },
              show: { opacity: 1, x: 0 },
            }}
          >
            <span>{item.stage}</span>
            <h2>{item.title}</h2>
            <p>{item.detail}</p>
          </motion.article>
        ))}
      </motion.div>

      <motion.div
        className="funnelShape"
        aria-label="Funnel de impacto"
        initial="hidden"
        animate="show"
        variants={{
          hidden: {},
          show: { transition: { staggerChildren: 0.1, delayChildren: 0.1 } },
        }}
      >
        {stages.map((item, itemIndex) => (
          <motion.div
            className={`funnelSlice slice${itemIndex + 1}`}
            key={item.stage}
            variants={{
              hidden: { opacity: 0, scaleX: 0.84, y: 8 },
              show: { opacity: 1, scaleX: 1, y: 0 },
            }}
          >
            <span>{String(itemIndex + 1).padStart(2, '0')}</span>
            <strong>
              <AnimatedMetric metric={item.metric} />
            </strong>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  )
}
