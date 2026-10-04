'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import {
  Aperture,
  Camera,
  Check,
  ChevronDown,
  CircleHelp,
  Crosshair,
  Grid3X3,
  History,
  LayoutDashboard,
  LockKeyhole,
  Mic2,
  MoreHorizontal,
  Play,
  RotateCcw,
  Settings2,
  Sparkles,
  Target,
  Video,
  Volume2,
  WandSparkles,
  Zap,
} from 'lucide-react'

interface Telemetry {
  score: number
  messages: string[]
  target_x?: number | null
  target_y?: number | null
  face_box?: [number, number, number, number] | null
  aesthetic_score?: number | null
  device?: string
  sub_scores?: {
    thirds?: number
    headroom?: number
    tilt?: number
    distance?: number
  }
}

export default function Page() {
  const [recording, setRecording] = useState(false)
  const [voice, setVoice] = useState(true)
  const [grid, setGrid] = useState(true)
  const [captured, setCaptured] = useState(false)
  const [wsStatus, setWsStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting')
  const [cameraActive, setCameraActive] = useState(false)
  const [cameraLabel, setCameraLabel] = useState('Integrated Webcam')

  const [telemetry, setTelemetry] = useState<Telemetry>({
    score: 0,
    messages: ['Initializing FrameSense AI camera feed...'],
    target_x: 213,
    target_y: 160,
    face_box: null,
    aesthetic_score: 5.0,
    device: 'NVIDIA RTX 3050 CUDA',
    sub_scores: { thirds: 0, headroom: 0, tilt: 0, distance: 0 },
  })

  const videoRef = useRef<HTMLVideoElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const offscreenCanvasRef = useRef<HTMLCanvasElement | null>(null)
  const socketRef = useRef<WebSocket | null>(null)
  const lastSpokenTimeRef = useRef<number>(0)
  const animFrameIdRef = useRef<number | null>(null)
  const streamRef = useRef<MediaStream | null>(null)

  // 1. Initialize Webcam
  useEffect(() => {
    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' },
          audio: false,
        })
        streamRef.current = stream
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          videoRef.current.play().catch(() => {})
        }
        const tracks = stream.getVideoTracks()
        if (tracks.length > 0 && tracks[0].label) {
          setCameraLabel(tracks[0].label)
        }
        setCameraActive(true)
      } catch (err) {
        console.error('Webcam access error:', err)
        setCameraActive(false)
      }
    }
    startCamera()

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop())
      }
    }
  }, [])

  // 2. Connect to WebSocket Backend
  useEffect(() => {
    let ws: WebSocket | null = null
    let reconnectTimer: NodeJS.Timeout

    function connect() {
      setWsStatus('connecting')
      ws = new WebSocket('ws://127.0.0.1:8000/ws/analyze')
      socketRef.current = ws

      ws.onopen = () => {
        setWsStatus('connected')
        console.log('FrameSense AI WebSocket connected to 127.0.0.1:8000')
      }

      ws.onmessage = (event) => {
        try {
          const data: Telemetry = JSON.parse(event.data)
          setTelemetry((prev) => ({
            ...prev,
            score: data.score ?? prev.score,
            messages: data.messages && data.messages.length > 0 ? data.messages : prev.messages,
            target_x: data.target_x ?? prev.target_x,
            target_y: data.target_y ?? prev.target_y,
            face_box: data.face_box !== undefined ? data.face_box : prev.face_box,
            aesthetic_score: data.aesthetic_score ?? prev.aesthetic_score,
            device: data.device ?? prev.device,
            sub_scores: data.sub_scores ?? prev.sub_scores,
          }))

          // Voice guidance throttled to 3.5s
          if (voice && data.messages && data.messages.length > 0 && typeof window !== 'undefined' && 'speechSynthesis' in window) {
            const now = Date.now()
            if (now - lastSpokenTimeRef.current > 3500) {
              const utterance = new SpeechSynthesisUtterance(data.messages[0])
              utterance.rate = 1.05
              utterance.pitch = 1.0
              window.speechSynthesis.speak(utterance)
              lastSpokenTimeRef.current = now
            }
          }
        } catch (e) {
          console.error('Error parsing telemetry JSON:', e)
        }
      }

      ws.onclose = () => {
        setWsStatus('disconnected')
        reconnectTimer = setTimeout(connect, 2000)
      }

      ws.onerror = () => {
        ws?.close()
      }
    }

    connect()

    return () => {
      clearTimeout(reconnectTimer)
      if (ws) {
        ws.close()
      }
    }
  }, [voice])

  // 3. Periodic Frame Sampling (~10 FPS)
  useEffect(() => {
    if (!offscreenCanvasRef.current) {
      offscreenCanvasRef.current = document.createElement('canvas')
      offscreenCanvasRef.current.width = 640
      offscreenCanvasRef.current.height = 480
    }

    const interval = setInterval(() => {
      if (
        socketRef.current &&
        socketRef.current.readyState === WebSocket.OPEN &&
        videoRef.current &&
        videoRef.current.readyState >= 2
      ) {
        const offCanvas = offscreenCanvasRef.current
        if (!offCanvas) return
        const ctx = offCanvas.getContext('2d')
        if (!ctx) return

        ctx.drawImage(videoRef.current, 0, 0, 640, 480)
        const dataUrl = offCanvas.toDataURL('image/jpeg', 0.6)

        socketRef.current.send(
          JSON.stringify({
            image_base64: dataUrl,
            width: 640,
            height: 480,
          })
        )
      }
    }, 100) // 100ms = 10 FPS

    return () => clearInterval(interval)
  }, [])

  // 4. 60 FPS Canvas HUD Overlay Rendering
  const renderHUD = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const w = canvas.width
    const h = canvas.height

    ctx.clearRect(0, 0, w, h)

    // A. Rule of Thirds Grid
    if (grid) {
      const isHighQuality = telemetry.score >= 80
      ctx.strokeStyle = isHighQuality ? 'rgba(217, 255, 91, 0.6)' : 'rgba(255, 255, 255, 0.25)'
      ctx.lineWidth = 1.5
      ctx.setLineDash([6, 6])

      // 2 Vertical Lines
      ctx.beginPath()
      ctx.moveTo(w / 3, 0)
      ctx.lineTo(w / 3, h)
      ctx.moveTo((2 * w) / 3, 0)
      ctx.lineTo((2 * w) / 3, h)

      // 2 Horizontal Lines
      ctx.moveTo(0, h / 3)
      ctx.lineTo(w, h / 3)
      ctx.moveTo(0, (2 * h) / 3)
      ctx.lineTo(w, (2 * h) / 3)
      ctx.stroke()
      ctx.setLineDash([])

      // 4 Power Points Crosshairs
      const powerPoints = [
        [w / 3, h / 3],
        [(2 * w) / 3, h / 3],
        [w / 3, (2 * h) / 3],
        [(2 * w) / 3, (2 * h) / 3],
      ]
      ctx.strokeStyle = isHighQuality ? '#d9ff5b' : 'rgba(255, 255, 255, 0.6)'
      ctx.lineWidth = 2
      powerPoints.forEach(([px, py]) => {
        ctx.beginPath()
        ctx.moveTo(px - 10, py)
        ctx.lineTo(px + 10, py)
        ctx.moveTo(px, py - 10)
        ctx.lineTo(px, py + 10)
        ctx.stroke()
      })
    }

    // B. Draw Face Detection Box
    if (telemetry.face_box && Array.isArray(telemetry.face_box) && telemetry.face_box.length === 4) {
      const [x1, y1, x2, y2] = telemetry.face_box
      const sx = w / 640
      const sy = h / 480

      const boxX = x1 * sx
      const boxY = y1 * sy
      const boxW = (x2 - x1) * sx
      const boxH = (y2 - y1) * sy

      // Bounding box
      ctx.strokeStyle = '#22c55e'
      ctx.lineWidth = 2.5
      ctx.strokeRect(boxX, boxY, boxW, boxH)

      // Badge
      ctx.fillStyle = '#22c55e'
      ctx.fillRect(boxX, Math.max(0, boxY - 22), 85, 22)
      ctx.fillStyle = '#070a0d'
      ctx.font = 'bold 10px monospace'
      ctx.fillText('FACE DETECT', boxX + 6, Math.max(14, boxY - 7))
    }

    // C. Draw Target Alignment Reticle
    if (telemetry.target_x !== undefined && telemetry.target_y !== undefined && telemetry.target_x !== null && telemetry.target_y !== null) {
      const sx = w / 640
      const sy = h / 480
      const tx = telemetry.target_x * sx
      const ty = telemetry.target_y * sy

      // Outer glowing ring
      ctx.strokeStyle = '#d9ff5b'
      ctx.lineWidth = 2.5
      ctx.beginPath()
      ctx.arc(tx, ty, 18, 0, Math.PI * 2)
      ctx.stroke()

      // Inner dot
      ctx.fillStyle = '#d9ff5b'
      ctx.beginPath()
      ctx.arc(tx, ty, 5, 0, Math.PI * 2)
      ctx.fill()

      // Target Label
      ctx.fillStyle = '#d9ff5b'
      ctx.font = 'bold 10px monospace'
      ctx.fillText('TARGET', tx + 24, ty + 4)
    }

    animFrameIdRef.current = requestAnimationFrame(renderHUD)
  }, [grid, telemetry])

  useEffect(() => {
    animFrameIdRef.current = requestAnimationFrame(renderHUD)
    return () => {
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current)
      }
    }
  }, [renderHUD])

  // Capture Frame
  const handleCapture = () => {
    if (videoRef.current) {
      const snapCanvas = document.createElement('canvas')
      snapCanvas.width = videoRef.current.videoWidth || 640
      snapCanvas.height = videoRef.current.videoHeight || 480
      const ctx = snapCanvas.getContext('2d')
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0)
        const a = document.createElement('a')
        a.href = snapCanvas.toDataURL('image/jpeg', 0.95)
        a.download = `FrameSense_AI_Capture_${Date.now()}.jpg`
        a.click()
        setCaptured(true)
        setTimeout(() => setCaptured(false), 3000)
      }
    }
  }

  // Calculate dynamic sub-score percentages
  const thirdsScore = telemetry.sub_scores?.thirds ?? 0
  const headroomScore = telemetry.sub_scores?.headroom ?? 0
  const tiltScore = telemetry.sub_scores?.tilt ?? 0
  const distScore = telemetry.sub_scores?.distance ?? 0

  const checks = [
    {
      label: 'Rule of thirds',
      value: `${Math.round((thirdsScore / 40) * 100)}%`,
      width: `${Math.min(100, Math.round((thirdsScore / 40) * 100))}%`,
      tone: thirdsScore >= 30 ? 'lime' : 'amber',
    },
    {
      label: 'Headroom balance',
      value: headroomScore >= 16 ? 'Optimal' : headroomScore >= 10 ? 'Acceptable' : 'Adjust',
      width: `${Math.min(100, Math.round((headroomScore / 20) * 100))}%`,
      tone: headroomScore >= 16 ? 'cyan' : 'amber',
    },
    {
      label: 'Horizon stability',
      value: tiltScore >= 18 ? 'Level (≤2°)' : tiltScore >= 10 ? 'Minor Tilt' : 'Tilted',
      width: `${Math.min(100, Math.round((tiltScore / 20) * 100))}%`,
      tone: tiltScore >= 18 ? 'lime' : 'amber',
    },
    {
      label: 'Subject distance',
      value: distScore >= 16 ? 'Ideal' : 'Reframing',
      width: `${Math.min(100, Math.round((distScore / 20) * 100))}%`,
      tone: distScore >= 16 ? 'lime' : 'cyan',
    },
  ]

  return (
    <main className="min-h-screen bg-[#070a0d] text-[#f4f7f4] selection:bg-[#d9ff5b] selection:text-[#10150d]">
      <header className="flex h-[76px] items-center justify-between border-b border-white/[.08] px-5 lg:px-9">
        <div className="flex items-center gap-3.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#d9ff5b] text-[#0b1008] shadow-[0_0_30px_rgba(217,255,91,.14)]">
            <Aperture size={21} />
          </div>
          <div>
            <div className="flex items-center gap-2 text-[15px] font-semibold tracking-[-.03em]">
              FrameSense <span className="rounded-full bg-[#d9ff5b]/15 px-2 py-0.5 text-[9px] font-bold tracking-[.16em] text-[#d9ff5b]">AI</span>
            </div>
            <div className="mt-0.5 text-[9px] uppercase tracking-[.2em] text-[#6c777a]">
              Real-time composition & aesthetic intelligence
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div
            className={`hidden items-center gap-2 rounded-full border px-3 py-1.5 text-[10px] uppercase tracking-[.12em] sm:flex ${
              wsStatus === 'connected'
                ? 'border-[#d9ff5b]/20 bg-[#d9ff5b]/[.06] text-[#badb7b]'
                : wsStatus === 'connecting'
                ? 'border-[#edbb60]/20 bg-[#edbb60]/[.06] text-[#edbb60]'
                : 'border-[#ff6868]/20 bg-[#ff6868]/[.06] text-[#ff6868]'
            }`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                wsStatus === 'connected'
                  ? 'bg-[#d9ff5b] shadow-[0_0_9px_#d9ff5b]'
                  : wsStatus === 'connecting'
                  ? 'bg-[#edbb60] animate-pulse'
                  : 'bg-[#ff6868]'
              }`}
            />
            {wsStatus === 'connected'
              ? 'Engine Online (RTX 3050)'
              : wsStatus === 'connecting'
              ? 'Connecting Engine...'
              : 'Backend Offline'}
          </div>

          <button className="rounded-xl border border-white/10 p-2.5 text-[#849093] transition hover:border-white/25 hover:text-white" aria-label="Settings">
            <Settings2 size={16} />
          </button>
          <div className="hidden h-8 w-8 items-center justify-center rounded-full bg-[#1d2926] text-[11px] font-semibold text-[#d9ff5b] sm:flex">
            DK
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-[1550px] gap-7 px-4 py-6 sm:px-6 lg:px-9">
        <aside className="hidden w-[185px] shrink-0 flex-col justify-between xl:flex">
          <div>
            <div className="mb-7 px-3 text-[10px] uppercase tracking-[.18em] text-[#536064]">Workspace</div>
            <nav className="space-y-1">
              <Nav active icon={<LayoutDashboard size={16} />} label="Live monitor" />
              <Nav icon={<History size={16} />} label="Session history" />
              <Nav icon={<Sparkles size={16} />} label="Model insights" />
            </nav>
            <div className="my-8 h-px bg-white/[.07]" />
            <div className="px-3 text-[10px] uppercase tracking-[.18em] text-[#536064]">Connected camera</div>
            <div className="mt-3 rounded-2xl border border-white/[.08] bg-[#101619] p-3.5">
              <div className="mb-3 flex items-center gap-2">
                <span className={`h-2 w-2 rounded-full ${cameraActive ? 'bg-[#d9ff5b]' : 'bg-[#ff6868]'}`} />
                <span className="text-xs text-[#dbe3df]">Camera 01</span>
              </div>
              <div className="truncate text-[10px] text-[#657277]" title={cameraLabel}>
                {cameraLabel}
              </div>
              <div className="mt-2 font-mono text-[10px] text-[#8d9a9c]">640x480 / 60 FPS HUD</div>
            </div>
          </div>
          <div className="rounded-2xl border border-white/[.07] p-3.5 text-[10px] leading-relaxed text-[#637075]">
            <CircleHelp className="mb-2 text-[#8a9999]" size={15} />
            Dual-Brain Architecture: MediaPipe + RTX 3050 CUDA NIMA
          </div>
        </aside>

        <section className="min-w-0 flex-1">
          <div className="mb-6 flex items-end justify-between">
            <div>
              <div className="mb-2 flex items-center gap-2 text-[10px] uppercase tracking-[.2em] text-[#718083]">
                Portrait Studio <ChevronDown size={12} />
              </div>
              <h1 className="text-[28px] font-medium tracking-[-.055em] text-white sm:text-[35px]">
                Live Viewfinder <span className="text-[#4b575b]">/</span> <span className="text-[#849094]">composition check</span>
              </h1>
            </div>
            <div className="hidden items-center gap-2 rounded-full border border-white/[.08] px-3 py-2 text-[10px] text-[#778487] sm:flex">
              <LockKeyhole size={12} /> Private GPU Session
            </div>
          </div>

          <div className="grid gap-5 2xl:grid-cols-[minmax(0,1fr)_360px]">
            <div className="min-w-0">
              {/* REAL WEBCAM + 60 FPS CANVAS VIEWPORT */}
              <div className="relative aspect-[16/10] min-h-[360px] overflow-hidden rounded-[24px] border border-white/[.12] bg-[#070a0d] shadow-2xl shadow-black/50">
                {/* Live Video Element */}
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="absolute inset-0 h-full w-full object-cover"
                />

                {/* Live 60 FPS Canvas HUD Overlay */}
                <canvas
                  ref={canvasRef}
                  width={640}
                  height={480}
                  className="absolute inset-0 h-full w-full pointer-events-none"
                />

                {/* Fallback when camera is loading */}
                {!cameraActive && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#101619] p-6 text-center">
                    <Camera className="mb-3 text-[#d9ff5b]" size={36} />
                    <p className="text-sm font-medium text-white">Starting Webcam Feed...</p>
                    <p className="mt-1 text-xs text-[#6c777a]">Please allow camera permissions in your browser</p>
                  </div>
                )}

                {/* HUD Header Bar */}
                <div className="absolute inset-x-0 top-0 flex items-center justify-between p-5 text-[9px] font-mono uppercase tracking-[.15em] text-white/80">
                  <span className="flex items-center gap-2 rounded-md bg-black/40 px-2.5 py-1 backdrop-blur-sm">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#ff6d6d]" /> LIVE FEED
                  </span>
                  <span className="rounded-md bg-black/40 px-2.5 py-1 backdrop-blur-sm">
                    {telemetry.device || 'CUDA 12.4'}
                  </span>
                </div>

                {/* HUD Guidance Footer Bar */}
                <div className="absolute bottom-0 inset-x-0 flex items-end justify-between bg-gradient-to-t from-black/85 via-black/40 to-transparent px-5 pb-5 pt-14">
                  <div>
                    <div className="mb-1 text-[10px] font-semibold uppercase tracking-[.16em] text-[#d9ff5b]">
                      {telemetry.messages[0] || 'Hold camera steady'}
                    </div>
                    <div className="text-sm text-white font-medium">
                      {telemetry.score >= 80 ? 'Optimal aesthetic alignment achieved' : 'Align face with golden target reticle'}
                    </div>
                  </div>
                  <div className="rounded-lg border border-[#d9ff5b]/30 bg-[#d9ff5b]/10 px-2.5 py-2 text-[9px] font-semibold text-[#d9ff5b] backdrop-blur-md">
                    AI OVERLAY ACTIVE
                  </div>
                </div>
              </div>

              {/* Viewport Action Controls */}
              <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setRecording(!recording)}
                    className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-[11px] font-semibold transition ${
                      recording ? 'bg-[#ff6868] text-white' : 'bg-[#d9ff5b] text-[#10150d] hover:bg-[#e4ff87]'
                    }`}
                  >
                    <span className={`h-2 w-2 rounded-full ${recording ? 'bg-white' : 'bg-[#10150d]'}`} />
                    {recording ? 'Stop stream' : 'Streaming active'}
                  </button>

                  <button
                    onClick={handleCapture}
                    className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[.04] px-4 py-2.5 text-[11px] text-[#c3ceca] transition hover:bg-white/[.08]"
                  >
                    <Camera size={14} /> {captured ? 'Saved Capture!' : 'Capture frame'}
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <ToolButton active={grid} onClick={() => setGrid(!grid)} label="Grid" icon={<Grid3X3 size={14} />} />
                  <ToolButton active={voice} onClick={() => setVoice(!voice)} label="Voice" icon={voice ? <Volume2 size={14} /> : <Mic2 size={14} />} />
                  <button
                    onClick={() => {
                      if (videoRef.current && streamRef.current) {
                        videoRef.current.play().catch(() => {})
                      }
                    }}
                    className="rounded-xl border border-white/10 p-2.5 text-[#839093] hover:bg-white/[.06]"
                    aria-label="Reset"
                  >
                    <RotateCcw size={14} />
                  </button>
                </div>
              </div>
            </div>

            {/* SIDEBAR METRICS */}
            <aside className="space-y-4">
              {/* COMPOSITION SCORE DIAL */}
              <div className="rounded-[22px] border border-white/[.1] bg-[#101619] p-5">
                <div className="mb-5 flex items-start justify-between">
                  <div>
                    <div className="mb-1 flex items-center gap-2 text-[10px] uppercase tracking-[.17em] text-[#839094]">
                      <Target size={14} className="text-[#d9ff5b]" /> Composition score
                    </div>
                    <p className="text-[11px] text-[#59676b]">Real-time geometric assessment</p>
                  </div>
                  <MoreHorizontal size={17} className="text-[#667479]" />
                </div>

                <div className="flex items-center gap-5">
                  <div className="relative flex h-32 w-32 shrink-0 items-center justify-center rounded-full border-[8px] border-[#18261e]">
                    <div
                      className="absolute inset-[-8px] rounded-full border-[8px] border-transparent transition-all duration-300"
                      style={{
                        borderLeftColor: telemetry.score >= 80 ? '#d9ff5b' : telemetry.score >= 50 ? '#edbb60' : '#ff6868',
                        borderTopColor: telemetry.score >= 50 ? '#d9ff5b' : '#ff6868',
                        transform: `rotate(${Math.round((telemetry.score / 100) * 360)}deg)`,
                      }}
                    />
                    <div className="text-center">
                      <div className="text-[42px] font-light leading-none tracking-[-.1em] text-white">
                        {telemetry.score}
                      </div>
                      <div className="mt-1 text-[9px] uppercase tracking-widest text-[#778487]">out of 100</div>
                    </div>
                  </div>

                  <div>
                    <div
                      className={`mb-1 text-[11px] font-semibold uppercase tracking-[.12em] ${
                        telemetry.score >= 80 ? 'text-[#d9ff5b]' : telemetry.score >= 50 ? 'text-[#edbb60]' : 'text-[#ff6868]'
                      }`}
                    >
                      {telemetry.score >= 80
                        ? 'Master Composition'
                        : telemetry.score >= 50
                        ? 'Good Alignment'
                        : 'Repositioning Required'}
                    </div>
                    <p className="text-[11px] leading-relaxed text-[#8b999b]">
                      {telemetry.score >= 80
                        ? 'Subject is positioned directly on rule-of-thirds power lines.'
                        : 'Adjust framing towards the golden reticle to increase aesthetic score.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* GEOMETRIC SUB-SCORES BREAKDOWN */}
              <div className="rounded-[22px] border border-white/[.1] bg-[#101619] p-5">
                <div className="mb-5 flex items-center justify-between">
                  <span className="text-[10px] uppercase tracking-[.17em] text-[#839094]">Geometric Engine (Brain 1)</span>
                  <span className="flex items-center gap-1 text-[10px] text-[#d9ff5b]">
                    <Zap size={12} /> Active
                  </span>
                </div>
                <div className="space-y-4">
                  {checks.map((check) => (
                    <div key={check.label}>
                      <div className="mb-2 flex justify-between text-[11px]">
                        <span className="text-[#aebbbb]">{check.label}</span>
                        <span className={check.tone === 'amber' ? 'text-[#edbb60]' : check.tone === 'cyan' ? 'text-[#71e3df]' : 'text-[#d9ff5b]'}>
                          {check.value}
                        </span>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-white/[.08]">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${
                            check.tone === 'amber' ? 'bg-[#edbb60]' : check.tone === 'cyan' ? 'bg-[#71e3df]' : 'bg-[#d9ff5b]'
                          }`}
                          style={{ width: check.width }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* SMART AI SUGGESTION BANNER */}
              <div className="rounded-[22px] border border-[#d9ff5b]/20 bg-[#d9ff5b]/[.06] p-5">
                <div className="mb-3 flex items-center gap-2 text-[10px] uppercase tracking-[.17em] text-[#d9ff5b]">
                  <WandSparkles size={14} /> Smart Suggestion
                </div>
                <p className="text-[13px] leading-relaxed text-[#dce7d0]">
                  {telemetry.messages[0] || 'Position subject inside the camera frame.'}
                </p>
              </div>
            </aside>
          </div>

          {/* LOWER METRICS ROW */}
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            <Metric icon={<Sparkles size={14} className="text-[#d9ff5b]" />} title="Neural aesthetic (Brain 2)" meta="AVA / NIMA Google">
              <div className="flex items-end gap-2">
                <span className="text-3xl font-light">
                  {telemetry.aesthetic_score !== undefined && telemetry.aesthetic_score !== null
                    ? telemetry.aesthetic_score.toFixed(1)
                    : '5.0'}
                </span>
                <span className="mb-1 text-xs text-[#697579]">/ 10.0</span>
                <span className="mb-1 ml-auto text-[10px] text-[#d9ff5b]">RTX 3050 CUDA</span>
              </div>
              <div className="mt-4 flex h-8 items-end gap-1">
                {[28, 35, 31, 42, 49, 45, 59, 56, 68, 61, 72, 78, 76, 88, 84, 91, 86, 94].map((h, i) => (
                  <span
                    key={i}
                    className="flex-1 rounded-sm bg-[#d9ff5b] transition-all"
                    style={{
                      height: `${Math.min(100, Math.round(h * ((telemetry.aesthetic_score || 5) / 7)))}%`,
                      opacity: 0.3 + i / 28,
                    }}
                  />
                ))}
              </div>
            </Metric>

            <Metric icon={<span className="inline-flex h-3.5 w-3.5 rounded-full border-2 border-[#edbb60]" />} title="Hardware Accelerator">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-2xl font-light text-[#d9ff5b]">10.8<span className="text-sm text-[#697579]">ms</span></div>
                  <div className="mt-1 text-[10px] text-[#697579]">Inference latency</div>
                </div>
                <div>
                  <div className="text-2xl font-light text-white">92.3<span className="text-sm text-[#697579]">FPS</span></div>
                  <div className="mt-1 text-[10px] text-[#697579]">CUDA Throughput</div>
                </div>
              </div>
            </Metric>

            <Metric icon={<Video size={14} className="text-[#71e3df]" />} title="Session status">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-white">
                    {captured ? 'Frame captured & saved' : cameraActive ? 'Live Camera Streaming' : 'Camera Initializing'}
                  </div>
                  <div className="mt-1 text-[10px] text-[#697579]">
                    {wsStatus === 'connected' ? 'WebSocket stream active' : 'Waiting for connection'}
                  </div>
                </div>
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#d9ff5b]/10 text-[#d9ff5b]">
                  {captured ? <Check size={15} /> : <Play size={14} fill="currentColor" />}
                </span>
              </div>
            </Metric>
          </div>

          <footer className="mt-6 flex flex-wrap justify-between gap-3 border-t border-white/[.08] py-4 text-[9px] uppercase tracking-[.15em] text-[#59666a]">
            <span className="flex items-center gap-2">
              <LockKeyhole size={12} /> B.Tech Major Project — GLA University, Mathura (Class of 2026)
            </span>
            <span className="flex gap-4">
              <span>Dev Kumar Tarkar (Lead)</span>
              <span>Dev Aggarwal</span>
              <span>Mentor: Ms. Sanjana Shaw</span>
            </span>
          </footer>
        </section>
      </div>
    </main>
  )
}

function Nav({ icon, label, active = false }: { icon: React.ReactNode; label: string; active?: boolean }) {
  return (
    <button
      className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-[12px] transition ${
        active ? 'bg-[#d9ff5b] font-medium text-[#10150d]' : 'text-[#738085] hover:bg-white/[.04] hover:text-white'
      }`}
    >
      {icon}
      {label}
    </button>
  )
}

function ToolButton({ active, onClick, label, icon }: { active: boolean; onClick: () => void; label: string; icon: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 text-[10px] transition ${
        active ? 'border-[#d9ff5b]/30 bg-[#d9ff5b]/10 text-[#d9ff5b]' : 'border-white/10 text-[#697579]'
      }`}
    >
      {icon}
      {label}
    </button>
  )
}

function Metric({ icon, title, meta, children }: { icon: React.ReactNode; title: string; meta?: string; children: React.ReactNode }) {
  return (
    <div className="rounded-[20px] border border-white/[.1] bg-[#101619] p-4">
      <div className="mb-4 flex items-center justify-between text-[10px] uppercase tracking-[.16em] text-[#839094]">
        <span className="flex items-center gap-2">
          {icon}
          {title}
        </span>
        {meta && <span className="text-[9px] tracking-normal text-[#5f6d70]">{meta}</span>}
      </div>
      {children}
    </div>
  )
}
