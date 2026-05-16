import { useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import heroImg from './assets/hero.png'

type Slide = {
  eyebrow: string
  title: string
  summary: string
  body: ReactNode
}

const apiRoutes = [
  ['GET', '/health', 'Service health'],
  ['GET', '/api/products', 'List products'],
  ['POST', '/api/products', 'Create product'],
  ['GET', '/api/products/:id', 'Read product'],
  ['PUT', '/api/products/:id', 'Update product'],
  ['DELETE', '/api/products/:id', 'Delete product'],
]

const stack = [
  { label: 'React + Vite', detail: 'Frontend build embedded into Go for production.' },
  { label: 'Echo HTTP API', detail: 'REST routes, CORS, logger, recovery middleware.' },
  { label: 'GORM', detail: 'Repository implementation with runtime AutoMigrate.' },
  { label: 'PostgreSQL', detail: 'Persistent product catalog storage.' },
]

const products = [
  { name: 'Organic Quinoa Bowl', stock: 42, price: '$8.90' },
  { name: 'Cold Pressed Juice', stock: 28, price: '$4.50' },
  { name: 'Plant Protein Bar', stock: 64, price: '$2.80' },
]

function App() {
  const [index, setIndex] = useState(0)

  const slides: Slide[] = useMemo(
    () => [
      {
        eyebrow: 'Biofood Solution',
        title: 'Product catalog platform',
        summary:
          'A compact full-stack application for managing healthy food products with a Go API, PostgreSQL, and a React frontend.',
        body: (
          <div className="heroGrid">
            <div className="heroVisual" aria-hidden="true">
              <img src={heroImg} alt="" />
              <div className="floatingMetric metricA">
                <strong>CRUD</strong>
                <span>Products</span>
              </div>
              <div className="floatingMetric metricB">
                <strong>Auto</strong>
                <span>Schema</span>
              </div>
            </div>
            <div className="spotlight">
              <span>Project scope</span>
              <p>
                Product inventory operations, validation, persistence, Docker deployment,
                and embedded static delivery from the Go runtime.
              </p>
            </div>
          </div>
        ),
      },
      {
        eyebrow: 'Architecture',
        title: 'Clear split between web, API, and data',
        summary:
          'The project keeps the React experience, Go service, domain logic, repository, and database boundary separated.',
        body: (
          <div className="architecture">
            {stack.map((item, itemIndex) => (
              <div className="layer" key={item.label}>
                <div className="layerNumber">{String(itemIndex + 1).padStart(2, '0')}</div>
                <div>
                  <h3>{item.label}</h3>
                  <p>{item.detail}</p>
                </div>
              </div>
            ))}
          </div>
        ),
      },
      {
        eyebrow: 'Backend',
        title: 'Runtime database structure',
        summary:
          'The API now creates the required database tables during startup with GORM AutoMigrate, so deploys do not need a separate migration command.',
        body: (
          <div className="runtimePanel">
            <div className="codeBlock">
              <span>cmd/server/main.go</span>
              <pre>{`db, err := database.Connect(cfg.DSN)
if err != nil {
  log.Fatalf("failed to connect database: %v", err)
}
if err := database.Migrate(db); err != nil {
  log.Fatalf("failed to migrate database: %v", err)
}`}</pre>
            </div>
            <div className="checks">
              <div><strong>1</strong><span>Connect to Postgres</span></div>
              <div><strong>2</strong><span>Run AutoMigrate</span></div>
              <div><strong>3</strong><span>Start HTTP server</span></div>
            </div>
          </div>
        ),
      },
      {
        eyebrow: 'API Surface',
        title: 'Product endpoints for the demo',
        summary:
          'A small REST interface covers the presentation flow from health check to product inventory changes.',
        body: (
          <div className="routes">
            {apiRoutes.map(([method, path, label]) => (
              <div className="route" key={`${method}-${path}`}>
                <span className={`method method${method}`}>{method}</span>
                <code>{path}</code>
                <p>{label}</p>
              </div>
            ))}
          </div>
        ),
      },
      {
        eyebrow: 'Demo Story',
        title: 'Inventory view for business users',
        summary:
          'The frontend can present product availability, prices, and stock levels while the API owns validation and persistence.',
        body: (
          <div className="inventory">
            <div className="inventoryHeader">
              <span>Live catalog</span>
              <strong>134 items in stock</strong>
            </div>
            {products.map((product) => (
              <div className="productRow" key={product.name}>
                <div>
                  <strong>{product.name}</strong>
                  <span>{product.stock} units available</span>
                </div>
                <em>{product.price}</em>
              </div>
            ))}
          </div>
        ),
      },
      {
        eyebrow: 'Delivery',
        title: 'Simple run commands',
        summary:
          'This presentation is intentionally separate from the app build. It runs as a normal React project without Makefile targets.',
        body: (
          <div className="commandGrid">
            <div>
              <span>Install</span>
              <code>npm install</code>
            </div>
            <div>
              <span>Present</span>
              <code>npm run dev</code>
            </div>
            <div>
              <span>Build</span>
              <code>npm run build</code>
            </div>
          </div>
        ),
      },
    ],
    [],
  )

  const current = slides[index]
  const progress = ((index + 1) / slides.length) * 100

  function previous() {
    setIndex((value) => Math.max(0, value - 1))
  }

  function next() {
    setIndex((value) => Math.min(slides.length - 1, value + 1))
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

  return (
    <main className="deck">
      <header className="topbar">
        <div>
          <strong>Biofood Solution</strong>
          <span>Web + API presentation</span>
        </div>
        <div className="counter">
          {index + 1}/{slides.length}
        </div>
      </header>

      <section className="slide" aria-live="polite">
        <div className="copy">
          <p className="eyebrow">{current.eyebrow}</p>
          <h1>{current.title}</h1>
          <p className="summary">{current.summary}</p>
        </div>
        <div className="slideBody">{current.body}</div>
      </section>

      <footer className="controls">
        <button type="button" onClick={previous} disabled={index === 0} aria-label="Previous slide">
          <span aria-hidden="true">‹</span>
        </button>
        <div className="progress" aria-hidden="true">
          <span style={{ width: `${progress}%` }} />
        </div>
        <button
          type="button"
          onClick={next}
          disabled={index === slides.length - 1}
          aria-label="Next slide"
        >
          <span aria-hidden="true">›</span>
        </button>
      </footer>
    </main>
  )
}

export default App
