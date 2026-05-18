# BioFood Connect — Presentación (Pitch Deck)

Documento de entrega — Hackathon 2026

---

## ¿Qué es?

Aplicación web independiente (**React + Vite**) que funciona como **deck de pitch interactivo** para jurados e inversores. Cuenta la historia de BioFood Connect: el problema del padre desconectado, la solución por WhatsApp, el dashboard de cafetería y el modelo de negocio.

No consume la API; es una experiencia narrativa y visual para la demo en vivo.

---

## Stack tecnológico

| Componente | Tecnología |
|------------|------------|
| Framework | React 19 |
| Build | Vite 8 |
| Animaciones | Framer Motion |
| 3D (opcional) | Three.js |
| Estilos | CSS custom (`styles.css`) |

---

## Cómo presentar

```bash
cd presentation
npm install
npm run dev
```

1. Abrir en el navegador (pantalla completa recomendada).
2. Slide inicial → botón **Iniciar** (entra en fullscreen).
3. Navegar con **flechas ← →** o **Espacio**.
4. Contador de slides en la barra inferior.

Build estático para subir a hosting:

```bash
npm run build && npm run preview
```

---

## Estructura narrativa (slides)

La presentación sigue un arco en ~25 slides:

### Acto 1 — Historia emocional (Ricardo)

| Slide | Contenido |
|-------|-----------|
| Intro | Logo BioFood, CTA iniciar |
| Impact Question | Pregunta de impacto |
| Ricardo 1–4 | Storytelling visual: éxito profesional → hijo sin saldo → WhatsApp → desconexión |
| Phone demo / connect | Demo del flujo WhatsApp en teléfono |
| Trust promise | Promesa de confianza |

### Acto 2 — Propuesta de valor

| Slide | Contenido |
|-------|-----------|
| Pitch | Cafetería que vende mejor porque aprende de cada compra |
| Hoy | El dato hoy se queda quieto |
| JTBD | Jobs to be done por actor (padre, cafetería, colegio) |
| Connect | Biofood Connect: dato → acción |
| Lean Loop | Problema → MVP → métricas |

### Acto 3 — Producto y tecnología

| Slide | Contenido |
|-------|-----------|
| Neural Network | Motor de patrones / consumo |
| WhatsApp features | Anticipa, informa, recompensa |
| Cafetería dashboard | Capturas del panel web (dashboard.jpeg, etc.) |
| Business Canvas | Tres motores de ingreso |
| Impact Funnel | Funnel económico (transaccional → recurrente → escala) |

### Acto 4 — Cierre

| Slide | Contenido |
|-------|-----------|
| Black pause | Transición |
| Products relation | Relación entre productos del ecosistema |
| Fintech trust | Confianza fintech (aliados: Olimpica, Starbucks, etc.) |

---

## Componentes clave

```
presentation/src/components/
├── IntroSlide.tsx
├── StoryImageSlide.tsx      # Historia Ricardo (imágenes ricardo1–4)
├── PhoneConnectSlide.tsx    # Flujo WhatsApp
├── PhoneFeaturesSlide.tsx
├── CafeteriaDashboardSlide.tsx
├── BusinessCanvasSlide.tsx
├── ImpactFunnelSlide.tsx
├── FintechTrustSlide.tsx
└── ...
```

**Assets:** logos, dashboards, fotos de historia, marcas aliadas (`olimpica.png`, `starbucks.png`, `hogar.png`).

---

## Métricas del funnel (slide Impacto)

Datos narrativos integrados en el deck:

| Etapa | Métrica | Mensaje |
|-------|---------|---------|
| Insight | Ticket $4.292 | Patrón de consumo real |
| Acción | Recarga $5.000 | WhatsApp argumenta con datos |
| Resultado | +$348M COP | Revenue transaccional proyectado |
| Recurrente | $29.900/mes | Plan Nutrición Familiar |
| Escala | +$1.542M COP | Recargas + MRR + SaaS cafeterías |

---

## Relación con el resto del monorepo

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  PRESENTATION   │     │       WEB        │     │       API       │
│  Pitch / demo   │     │  Dashboard real  │     │  Datos + bot    │
│  (este repo)    │     │  (operación)     │     │  (backend)      │
└─────────────────┘     └──────────────────┘     └─────────────────┘
        │                         │                        │
        └───────── storytelling ──┴──── producto vivo ─────┘
```

- **Presentación:** convence y emociona (5–10 min).
- **Web:** demuestra que el panel existe y funciona con datos reales.
- **API + WhatsApp:** demuestra automatización y respuesta al padre en el móvil.

---

## Controles y accesibilidad

- Teclado: `←` anterior, `→` / `Espacio` siguiente.
- Botones **Anterior / Siguiente** y contador `N / total`.
- Modo oscuro automático en slides `dark: true`.
- `aria-live` en el contenedor de slide activo.

---

## Valor para el hackathon

- Pitch **memorable** (historia Ricardo + problema real de saldo en cafetería).
- Conecta **dolor emocional** con **solución técnica** (WhatsApp + dashboard + IA).
- Muestra **modelo de negocio** y proyección de impacto.
- Independiente del backend: funciona offline tras `npm run build`.

---

## Enlaces útiles

- [Documentación API](./API.md)
- [Documentación Web](./WEB.md)
- Carpeta de slides: `presentation/src/App.tsx` (orden y configuración de todas las diapositivas)
