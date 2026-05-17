import { useCallback, useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import * as THREE from 'three'

type DataEntry = {
  id: number
  label: string
  time: string
  ms: string
}

type AlertItem = {
  id: number
  icon: string
  title: string
  message: string
  color: string
  time: string
}

const ALERTS_POOL = [
  { icon: '🔔', title: 'WhatsApp recomienda', message: 'Saldo bajo proyectado en ~5 días', color: '#10b981', duration: 5000 },
  { icon: '🎮', title: 'Gamificación', message: 'Bonificación por recargar antes del vencimiento', color: '#a855f7', duration: 4000 },
  { icon: '⭐', title: 'Cafetería decide', message: 'Sushi: tendencia alta + stock elevado', color: '#fb923c', duration: 5000 },
  { icon: '⚠️', title: 'Alerta nutricional', message: 'Plato con frutos secos detectado', color: '#ef4444', duration: 6000 },
  { icon: '🤝', title: 'Partner', message: 'Descuento con restaurante aliado', color: '#3b82f6', duration: 4000 },
  { icon: '📊', title: 'Proyección', message: 'Se agota en: 4.8 días', color: '#22c55e', duration: 5000 },
] as const

const easeOut = [0.22, 1, 0.36, 1] as const

function formatTime(date: Date) {
  return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

export function NeuralNetworkSlide() {
  const canvasHostRef = useRef<HTMLDivElement>(null)
  const [dataEntries, setDataEntries] = useState<DataEntry[]>([])
  const [alerts, setAlerts] = useState<AlertItem[]>([])
  const entryId = useRef(0)
  const alertId = useRef(0)

  const pushDataEntry = useCallback((label: string) => {
    const now = new Date()
    const id = entryId.current++
    setDataEntries((prev) => {
      const next = [
        {
          id,
          label,
          time: formatTime(now),
          ms: String(now.getMilliseconds()).padStart(3, '0'),
        },
        ...prev,
      ]
      return next.slice(0, 8)
    })
  }, [])

  const pushAlert = useCallback(() => {
    const item = ALERTS_POOL[Math.floor(Math.random() * ALERTS_POOL.length)]
    const id = alertId.current++
    const now = new Date()
    setAlerts((prev) => [
      {
        id,
        icon: item.icon,
        title: item.title,
        message: item.message,
        color: item.color,
        time: formatTime(now),
      },
      ...prev,
    ].slice(0, 12))

    window.setTimeout(() => {
      setAlerts((prev) => prev.filter((a) => a.id !== id))
    }, item.duration)
  }, [])

  const removeAlert = useCallback((id: number) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id))
  }, [])

  useEffect(() => {
    const host = canvasHostRef.current
    if (!host) return

    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x0f172a)
    scene.fog = new THREE.Fog(0x0f172a, 80, 150)

    const width = host.clientWidth || 640
    const height = host.clientHeight || 400
    const camera = new THREE.PerspectiveCamera(65, width / height, 0.1, 1000)
    camera.position.set(0, 0, 45)
    camera.lookAt(0, 0, 0)

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(width, height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    host.appendChild(renderer.domElement)

    scene.add(new THREE.AmbientLight(0xffffff, 0.4))

    const pointLight1 = new THREE.PointLight(0x00ff88, 0.6)
    pointLight1.position.set(25, 25, 25)
    scene.add(pointLight1)

    const pointLight2 = new THREE.PointLight(0x0099ff, 0.5)
    pointLight2.position.set(-25, -25, 25)
    scene.add(pointLight2)

    const networkLayers = {
      input: [
        { x: -20, y: 12, label: 'Saldo' },
        { x: -20, y: 4, label: 'Consumo' },
        { x: -20, y: -4, label: 'Nutrición' },
        { x: -20, y: -12, label: 'Stock' },
        { x: -20, y: -20, label: 'Tendencias' },
        { x: -20, y: -28, label: 'Temporada' },
      ],
      process1: [
        { x: -5, y: 8 },
        { x: -5, y: 0 },
        { x: -5, y: -8 },
        { x: -5, y: -16 },
      ],
      process2: [
        { x: 10, y: 6 },
        { x: 10, y: -2 },
        { x: 10, y: -10 },
      ],
      output: [
        { x: 25, y: 10, label: 'WhatsApp' },
        { x: 25, y: 2, label: 'Recarga' },
        { x: 25, y: -6, label: 'Surtido' },
        { x: 25, y: -14, label: 'Alerta' },
        { x: 25, y: -22, label: 'Partner' },
        { x: 25, y: -30, label: 'Proyección' },
      ],
    }

    const colors = { input: 0x3b82f6, process: 0x10b981, output: 0xf59e0b }
    const allLayers = [
      networkLayers.input,
      networkLayers.process1,
      networkLayers.process2,
      networkLayers.output,
    ]

    const nodes: THREE.Mesh[] = []
    const inputNodes: { mesh: THREE.Mesh; x: number; y: number; label: string }[] = []

    function createLayer(
      layer: { x: number; y: number; label?: string }[],
      color: number,
      isInput = false,
    ) {
      layer.forEach((nodeData) => {
        const geometry = new THREE.SphereGeometry(0.6, 24, 24)
        const material = new THREE.MeshPhongMaterial({
          color,
          emissive: color,
          emissiveIntensity: 0.25,
        })
        const node = new THREE.Mesh(geometry, material)
        node.position.set(nodeData.x, nodeData.y, 0)
        scene.add(node)
        nodes.push(node)
        if (isInput && nodeData.label) {
          inputNodes.push({ mesh: node, x: nodeData.x, y: nodeData.y, label: nodeData.label })
        }
      })
    }

    createLayer(networkLayers.input, colors.input, true)
    createLayer(networkLayers.process1, colors.process)
    createLayer(networkLayers.process2, colors.process)
    createLayer(networkLayers.output, colors.output)

    const connections: { material: THREE.LineBasicMaterial }[] = []
    for (let i = 0; i < allLayers.length - 1; i++) {
      allLayers[i].forEach((fromNode) => {
        allLayers[i + 1].forEach((toNode) => {
          const geometry = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(fromNode.x, fromNode.y, 0),
            new THREE.Vector3(toNode.x, toNode.y, 0),
          ])
          const material = new THREE.LineBasicMaterial({
            color: 0x334155,
            transparent: true,
            opacity: 0.2,
          })
          scene.add(new THREE.Line(geometry, material))
          connections.push({ material })
        })
      })
    }

    const particlesGroup = new THREE.Group()
    scene.add(particlesGroup)

    const particleColors = [0x60a5fa, 0x34d399, 0xfbbf24]

    const particles: {
      mesh: THREE.Mesh
      startX: number
      startY: number
      endX: number
      endY: number
      progress: number
      speed: number
      hop: number
    }[] = []

    const spawnParticle = (
      startX: number,
      startY: number,
      endX: number,
      endY: number,
      hop: number,
    ) => {
      const color = particleColors[hop] ?? particleColors[particleColors.length - 1]
      const geometry = new THREE.SphereGeometry(0.25, 12, 12)
      const material = new THREE.MeshPhongMaterial({
        color,
        emissive: color,
        emissiveIntensity: 0.8,
      })
      const particle = new THREE.Mesh(geometry, material)
      particle.position.set(startX, startY, 0)
      particlesGroup.add(particle)

      particles.push({
        mesh: particle,
        startX,
        startY,
        endX,
        endY,
        progress: 0,
        speed: 0.012 + Math.random() * 0.008,
        hop,
      })
    }

    const onDataParticle = () => {
      if (inputNodes.length === 0) return
      const inputNode = inputNodes[Math.floor(Math.random() * inputNodes.length)]
      const target = allLayers[1][Math.floor(Math.random() * allLayers[1].length)]
      spawnParticle(inputNode.x, inputNode.y, target.x, target.y, 0)
      pushDataEntry(inputNode.label)
    }

    let isDragging = false
    let previousMouse = { x: 0, y: 0 }

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true
      previousMouse = { x: e.clientX, y: e.clientY }
    }

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return
      const deltaX = e.clientX - previousMouse.x
      const deltaY = e.clientY - previousMouse.y
      camera.position.applyAxisAngle(new THREE.Vector3(0, 1, 0), deltaX * 0.004)
      camera.position.applyAxisAngle(camera.position.clone().normalize(), deltaY * 0.004)
      camera.lookAt(0, 0, 0)
      previousMouse = { x: e.clientX, y: e.clientY }
    }

    const onMouseUp = () => {
      isDragging = false
    }

    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      const direction = camera.position.clone().normalize()
      const distance = camera.position.length()
      const newDistance = Math.max(20, Math.min(100, distance + e.deltaY * 0.04))
      camera.position.copy(direction.multiplyScalar(newDistance))
      camera.lookAt(0, 0, 0)
    }

    const dom = renderer.domElement
    dom.addEventListener('mousedown', onMouseDown)
    dom.addEventListener('mousemove', onMouseMove)
    dom.addEventListener('mouseup', onMouseUp)
    dom.addEventListener('wheel', onWheel, { passive: false })

    const particleTimer = window.setInterval(onDataParticle, 800)
    const alertTimer = window.setInterval(pushAlert, 3000)

    let frameId = 0
    let time = 0

    const animate = () => {
      frameId = requestAnimationFrame(animate)
      time += 0.016

      nodes.slice(0, 6).forEach((node, idx) => {
        const mat = node.material as THREE.MeshPhongMaterial
        const activity = Math.sin(time * 0.2 + idx * 0.3) * 0.3 + 0.3
        mat.emissiveIntensity = 0.25 + activity * 0.3
      })

      nodes.slice(6, 13).forEach((node, idx) => {
        const mat = node.material as THREE.MeshPhongMaterial
        const activity = Math.sin(time * 0.3 + idx * 0.4) * 0.4 + 0.4
        mat.emissiveIntensity = 0.25 + activity * 0.4
        const scale = 1 + activity * 0.2
        node.scale.set(scale, scale, scale)
      })

      nodes.slice(13).forEach((node, idx) => {
        const mat = node.material as THREE.MeshPhongMaterial
        const activity = Math.sin(time * 0.4 + idx * 0.5) * 0.5 + 0.5
        mat.emissiveIntensity = 0.25 + activity * 0.5
        const scale = 1 + activity * 0.3
        node.scale.set(scale, scale, scale)
      })

      connections.forEach((conn, idx) => {
        const activity = Math.sin(time * 0.35 + idx * 0.15) * 0.5 + 0.2
        conn.material.opacity = 0.1 + activity * 0.25
      })

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i]
        p.progress += p.speed
        if (p.progress >= 1) {
          const { endX, endY, hop } = p
          particlesGroup.remove(p.mesh)
          p.mesh.geometry.dispose()
          ;(p.mesh.material as THREE.Material).dispose()
          particles.splice(i, 1)

          const lastHop = allLayers.length - 2
          if (hop < lastHop) {
            const nextLayer = allLayers[hop + 2]
            const target = nextLayer[Math.floor(Math.random() * nextLayer.length)]
            spawnParticle(endX, endY, target.x, target.y, hop + 1)
          }
        } else {
          const x = p.startX + (p.endX - p.startX) * p.progress
          const y = p.startY + (p.endY - p.startY) * p.progress
          p.mesh.position.set(x, y, 0)
          const scale = 1 + Math.sin(p.progress * Math.PI) * 0.3
          p.mesh.scale.set(scale, scale, scale)
        }
      }

      scene.rotation.z += 0.0001
      renderer.render(scene, camera)
    }

    animate()

    const resizeObserver = new ResizeObserver(() => {
      const w = host.clientWidth
      const h = host.clientHeight
      if (w === 0 || h === 0) return
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      renderer.setSize(w, h)
    })
    resizeObserver.observe(host)

    pushAlert()
    onDataParticle()

    return () => {
      cancelAnimationFrame(frameId)
      window.clearInterval(particleTimer)
      window.clearInterval(alertTimer)
      resizeObserver.disconnect()
      dom.removeEventListener('mousedown', onMouseDown)
      dom.removeEventListener('mousemove', onMouseMove)
      dom.removeEventListener('mouseup', onMouseUp)
      dom.removeEventListener('wheel', onWheel)
      host.removeChild(dom)
      renderer.dispose()
      scene.traverse((obj) => {
        if (obj instanceof THREE.Mesh) {
          obj.geometry.dispose()
          if (Array.isArray(obj.material)) obj.material.forEach((m) => m.dispose())
          else obj.material.dispose()
        }
      })
    }
  }, [pushAlert, pushDataEntry])

  return (
    <motion.div
      className="neuralDashboard"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: easeOut }}
    >
      <div className="neuralDashboard__flow" aria-hidden="true">
        <span>Patrón detectado</span>
        <span className="neuralDashboard__flowArrow">→</span>
        <span>WhatsApp recomienda</span>
        <span className="neuralDashboard__flowArrow">→</span>
        <span>Cafetería decide</span>
      </div>

      <motion.div className="neuralDashboard__main">
        <div ref={canvasHostRef} className="neuralDashboard__canvas" aria-label="Red neuronal 3D" />

        <div className="neuralDashboard__panels">
          <div className="neuralDashboard__panel neuralDashboard__panel--input">
            <h3>Entrada en tiempo real</h3>
            <p className="neuralDashboard__subtitle">Consumo real que entra a la red</p>
            <div className="neuralDashboard__stream neuralDashboard__stream--data">
              {dataEntries.map((entry) => (
                <motion.div
                  key={entry.id}
                  className="neuralDashboard__dataItem"
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 16 }}
                >
                  <div className="neuralDashboard__dataCopy">
                    <strong>📊 {entry.label}</strong>
                    <span>Procesando patrón…</span>
                  </div>
                  <div className="neuralDashboard__time">
                    <span>{entry.time}</span>
                    <span>.{entry.ms}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="neuralDashboard__panel neuralDashboard__panel--alerts">
            <h3>Decisiones generadas</h3>
            <p className="neuralDashboard__subtitle">La red analiza y dispara acciones</p>
            <div className="neuralDashboard__stream neuralDashboard__stream--alerts">
              {alerts.map((alert) => (
                <motion.div
                  key={alert.id}
                  className="neuralDashboard__alertItem"
                  style={{ borderLeftColor: alert.color }}
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 16 }}
                >
                  <span className="neuralDashboard__alertIcon">{alert.icon}</span>
                  <div className="neuralDashboard__alertBody">
                    <strong style={{ color: alert.color }}>{alert.title}</strong>
                    <p>{alert.message}</p>
                    <span className="neuralDashboard__alertTime">⏰ {alert.time}</span>
                  </div>
                  <button type="button" onClick={() => removeAlert(alert.id)} aria-label="Cerrar">
                    ✕
                  </button>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      <p className="neuralDashboard__legend">
        Capa de entrada: datos del comedor · Capas ocultas: patrones · Salida: recargas, surtido y alertas
      </p>
    </motion.div>
  )
}
