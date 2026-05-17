import { motion } from 'framer-motion'

const easeOut = [0.22, 1, 0.36, 1] as const

function IconParents() {
  return (
    <svg className="jtbdCard__svg" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
      <circle cx="9" cy="7" r="3.25" stroke="currentColor" strokeWidth="1.75" />
      <path
        d="M22 21v-2a3 3 0 0 0-2.2-2.87M16 3.13a3 3 0 0 1 0 5.74"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  )
}

function IconFamily() {
  return (
    <svg className="jtbdCard__svg" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M3 11.5 12 4l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1v-8.5Z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function IconCafeteria() {
  return (
    <svg className="jtbdCard__svg" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M4 10h16M6 10V8a2 2 0 0 1 2-2h1v12H8a2 2 0 0 1-2-2v-2M14 6h2a2 2 0 0 1 2 2v2"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M4 18h16" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  )
}

const jobs = [
  {
    role: 'Padres',
    Icon: IconParents,
    coastal: '¡Uy, no me deje al pelao por fuera!',
    when: 'no puedo estar en el colegio',
    want: 'saber si el saldo alcanza y recargar con una razón clara',
    outcome: 'que mi hijo no se quede sin almuerzo',
    hired: 'WhatsApp con alerta y recarga sugerida',
    delay: 0.14,
  },
  {
    role: 'Familias',
    Icon: IconFamily,
    coastal: '¡Ajá! ¿Y en la casa qué come, pues?',
    when: 'pago el comedor cada semana',
    want: 'ver calorías, macros y tendencias de mi hijo',
    outcome: 'mejorar su nutrición también en casa',
    hired: 'Plan Nutrición Familiar (suscripción)',
    delay: 0.26,
  },
  {
    role: 'Cafeterías',
    Icon: IconCafeteria,
    coastal: '¡Eche! Otra vez se acabó el yogur…',
    when: 'compro surtido e inventario',
    want: 'saber qué vender antes de que se agote',
    outcome: 'vender más con menos merma',
    hired: 'Dashboard Biofood Connect + alertas',
    delay: 0.38,
  },
] as const

export function JtbdSlide() {
  return (
    <motion.div
      className="jtbdSlide"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35 }}
    >
      <motion.p
        className="jtbdSlide__hook"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: easeOut }}
      >
        <span className="jtbdSlide__hookBadge">Jobs to be done</span>
        ¡Ajá! El trabajo que cada quien le está pidiendo a la vida — y que Biofood resuelve.
      </motion.p>

      <div className="jtbdGrid">
        {jobs.map((job, index) => (
          <motion.article
            key={job.role}
            className="jtbdCard"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: job.delay, ease: easeOut }}
          >
            <header className="jtbdCard__head">
              <div className="jtbdCard__iconWrap">
                <job.Icon />
              </div>
              <div className="jtbdCard__meta">
                <span className="jtbdCard__index">{String(index + 1).padStart(2, '0')}</span>
                <h2 className="jtbdCard__role">{job.role}</h2>
              </div>
            </header>

            <p className="jtbdCard__coastal">{job.coastal}</p>

            <ul className="jtbdCard__formula">
              <li>
                <span className="jtbdCard__label">Cuando</span>
                <span>{job.when}</span>
              </li>
              <li>
                <span className="jtbdCard__label">Quiero</span>
                <span>{job.want}</span>
              </li>
              <li>
                <span className="jtbdCard__label">Para</span>
                <span>{job.outcome}</span>
              </li>
            </ul>

            <footer className="jtbdCard__hire">
              <span>Contrata</span>
              <strong>{job.hired}</strong>
            </footer>
          </motion.article>
        ))}
      </div>
    </motion.div>
  )
}
