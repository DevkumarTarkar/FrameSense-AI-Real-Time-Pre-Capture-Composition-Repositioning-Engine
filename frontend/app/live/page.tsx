'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Sidebar from '@/components/Sidebar'
import {
  Camera,
  Check,
  ChevronDown,
  Grid3X3,
  LockKeyhole,
  Mic2,
  MoreHorizontal,
  Play,
  RotateCcw,
  Sparkles,
  Target,
  Video,
  Volume2,
  WandSparkles,
  Zap,
  AlertCircle,
  ArrowRight,
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
  const [cameraError, setCameraError] = useState<string | null>(null)
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
  const wsRef = useRef<WebSocket | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const animFrameIdRef = useRef<number | null>(null)
  const lastSpokenRef = useRef<string>('')

  // Text to Speech
  const speakFeedback = useCallback((text: string) => {
    if (!voice || !('speechSynthesis' in window) || !text) return
    if (text === lastSpokenRef.current) return

    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = 1.05
    utterance.pitch = 1.0
    utterance.volume = 0.85
    window.speechSynthesis.speak(utterance)
    lastSpokenRef.current = text
  }, [voice])

  // Camera Initialization
  const startCamera = useCallback(async () => {
    try {
      setCameraError(null)
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop())
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          frameRate: { ideal: 30 },
        },
        audio: false,
      })

      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
      }

      const videoTrack = stream.getVideoTracks()[0]
      if (videoTrack) {
        setCameraLabel(videoTrack.label || 'Connected Webcam')
      }
      setCameraActive(true)
    } catch (err: unknown) {
      console.warn('Camera stream error:', err)
      const error = err as Error
      setCameraError(error?.message || 'Camera is in use or blocked')
      setCameraActive(false)
    }
  }, [])

  useEffect(() => {
    startCamera()
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop())
      }
    }
  }, [startCamera])

  // WebSocket Connection to FastAPI RTX 3050 Backend
  useEffect(() => {
    let ws: WebSocket | null = null
    let reconnectTimeout: NodeJS.Timeout

    const connectWS = () => {
      try {
        setWsStatus('connecting')
        ws = new WebSocket('ws://127.0.0.1:8000/ws/analyze')

        ws.onopen = () => {
          setWsStatus('connected')
        }

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data)
            if (data && typeof data === 'object') {
              setTelemetry((prev) => ({
                ...prev,
                ...data,
                score: typeof data.score === 'number' ? data.score : prev.score,
                messages:
                  Array.isArray(data.messages) && data.messages.length > 0
                    ? data.messages
                    : prev.messages || ['Hold camera steady'],
                sub_scores: data.sub_scores || prev.sub_scores,
              }))
              if (Array.isArray(data.messages) && data.messages.length > 0) {
                speakFeedback(data.messages[0])
              }
            }
          } catch (err) {
            console.error('Failed to parse telemetry frame:', err)
          }
        }

        ws.onerror = () => {
          setWsStatus('disconnected')
        }

        ws.onclose = () => {
          setWsStatus('disconnected')
          reconnectTimeout = setTimeout(connectWS, 2500)
        }

        wsRef.current = ws
      } catch {
        setWsStatus('disconnected')
        reconnectTimeout = setTimeout(connectWS, 3000)
      }
    }

    connectWS()

    return () => {
      if (ws) ws.close()
      clearTimeout(reconnectTimeout)
    }
  }, [speakFeedback])

  // Frame streaming to backend
  useEffect(() => {
    if (recording) return

    const interval = setInterval(() => {
      if (
        wsRef.current &&
        wsRef.current.readyState === WebSocket.OPEN &&
        videoRef.current &&
        videoRef.current.readyState >= 2
      ) {
        const offscreen = document.createElement('canvas')
        offscreen.width = 320
        offscreen.height = 240
        const ctx = offscreen.getContext('2d')
        if (ctx) {
          ctx.drawImage(videoRef.current, 0, 0, 320, 240)
          const base64Data = offscreen.toDataURL('image/jpeg', 0.6).split(',')[1]
          if (base64Data) {
            wsRef.current.send(
              JSON.stringify({
                image_base64: base64Data,
                width: 320,
                height: 240,
              })
            )
          }
        }
      }
    }, 100)

    return () => clearInterval(interval)
  }, [recording])

  // 60 FPS Viewfinder Canvas HUD Render
  const renderHUD = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const w = canvas.width
    const h = canvas.height

    ctx.clearRect(0, 0, w, h)

    // A. Draw Rule of Thirds Grid
    if (grid) {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.18)'
      ctx.lineWidth = 1

      // Vertical lines
      ctx.beginPath()
      ctx.moveTo(w / 3, 0)
      ctx.lineTo(w / 3, h)
      ctx.moveTo((2 * w) / 3, 0)
      ctx.lineTo((2 * w) / 3, h)
      ctx.stroke()

      // Horizontal lines
      ctx.beginPath()
      ctx.moveTo(0, h / 3)
      ctx.lineTo(w, h / 3)
      ctx.moveTo(0, (2 * h) / 3)
      ctx.lineTo(w, (2 * h) / 3)
      ctx.stroke()

      // Golden Power Intersections
      const powerPoints = [
        [w / 3, h / 3],
        [(2 * w) / 3, h / 3],
        [w / 3, (2 * h) / 3],
        [(2 * w) / 3, (2 * h) / 3],
      ]

      ctx.fillStyle = 'rgba(217, 255, 91, 0.6)'
      powerPoints.forEach(([px, py]) => {
        ctx.beginPath()
        ctx.arc(px, py, 3, 0, Math.PI * 2)
        ctx.fill()
      })
    }

    // B. Draw Face Detection Box
    if (telemetry.face_box && telemetry.face_box.length === 4) {
      const [fx, fy, fw, fh] = telemetry.face_box
      const sx = w / 640
      const sy = h / 480

      const boxX = fx * sx
      const boxY = fy * sy
      const boxW = fw * sx
      const boxH = fh * sy

      ctx.strokeStyle = '#22c55e'
      ctx.lineWidth = 2
      ctx.strokeRect(boxX, boxY, boxW, boxH)

      ctx.fillStyle = '#22c55e'
      ctx.fillRect(boxX, Math.max(0, boxY - 22), 85, 22)
      ctx.fillStyle = '#070a0d'
      ctx.font = 'bold 10px monospace'
      ctx.fillText('FACE DETECT', boxX + 6, Math.max(14, boxY - 7))
    }

    // C. Draw Target Alignment Reticle
    if (
      telemetry.target_x !== undefined &&
      telemetry.target_y !== undefined &&
      telemetry.target_x !== null &&
      telemetry.target_y !== null
    ) {
      const sx = w / 640
      const sy = h / 480
      const tx = telemetry.target_x * sx
      const ty = telemetry.target_y * sy

      ctx.strokeStyle = '#d9ff5b'
      ctx.lineWidth = 2.5
      ctx.beginPath()
      ctx.arc(tx, ty, 18, 0, Math.PI * 2)
      ctx.stroke()

      ctx.fillStyle = '#d9ff5b'
      ctx.beginPath()
      ctx.arc(tx, ty, 5, 0, Math.PI * 2)
      ctx.fill()

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
        const dataUrl = snapCanvas.toDataURL('image/jpeg', 0.95)
        const a = document.createElement('a')
        a.href = dataUrl
        a.download = `FrameSense_AI_Capture_${Date.now()}.jpg`
        a.click()

        setCaptured(true)
        setTimeout(() => setCaptured(false), 3500)
      }
    }
  }

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
    <div className="min-h-screen bg-[#070a0d] text-[#e7f0ed] selection:bg-[#d9ff5b] selection:text-[#070a0d]">
      <Navbar />

      <main className="mx-auto flex max-w-[1720px] gap-8 px-5 py-7 lg:px-9">
        <Sidebar cameraLabel={cameraLabel} cameraActive={cameraActive} />

        <div className="min-w-0 flex-1">
          {/* Header */}
          <div className="mb-6 flex items-end justify-between">
            <div>
              <div className="mb-2 flex items-center gap-2 text-[10px] uppercase tracking-[.2em] text-[#718083]">
                Portrait Studio <ChevronDown size={12} />
              </div>
              <h1 className="text-[28px] font-bold tracking-[-.055em] text-white sm:text-[34px]">
                Live Viewfinder <span className="text-[#4b575b]">/</span> <span className="text-[#849094]">composition check</span>
              </h1>
            </div>
            <div className="hidden items-center gap-2 rounded-full border border-white/[.08] px-3.5 py-1.5 text-[10px] text-[#778487] sm:flex">
              <LockKeyhole size={12} /> Private GPU Session
            </div>
          </div>

          <div className="grid gap-6 2xl:grid-cols-[minmax(0,1fr)_370px]">
            <div className="min-w-0">
              {/* WEBCAM + 60 FPS CANVAS VIEWPORT */}
              <div className="relative aspect-[16/10] min-h-[380px] overflow-hidden rounded-[26px] border border-white/[.12] bg-[#070a0d] shadow-2xl shadow-black/70">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="absolute inset-0 h-full w-full object-cover"
                />

                <canvas
                  ref={canvasRef}
                  width={640}
                  height={480}
                  className="absolute inset-0 h-full w-full pointer-events-none"
                />

                {/* Camera Busy / Error Screen */}
                {!cameraActive && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#101619] p-6 text-center z-10">
                    <AlertCircle className="mb-3 text-[#ff6868]" size={42} />
                    <p className="text-sm font-semibold text-white">Camera Device Initializing</p>
                    <p className="mt-2 max-w-sm text-xs text-[#8a999b] leading-relaxed">
                      {cameraError || 'The camera is currently being accessed. If needed, please close other camera apps and click retry.'}
                    </p>
                    <button
                      onClick={startCamera}
                      className="mt-4 flex items-center gap-2 rounded-xl bg-[#d9ff5b] px-4 py-2 text-xs font-bold text-[#070a0d] transition hover:bg-[#e4ff87]"
                    >
                      <RotateCcw size={14} /> Retry Camera
                    </button>
                  </div>
                )}

                {/* HUD Header Bar */}
                <div className="absolute inset-x-0 top-0 flex items-center justify-between p-5 text-[9px] font-mono uppercase tracking-[.15em] text-white/80">
                  <span className="flex items-center gap-2 rounded-md bg-black/50 px-2.5 py-1 backdrop-blur-sm">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#ff6d6d]" /> LIVE FEED
                  </span>
                  <span className="rounded-md bg-black/50 px-2.5 py-1 backdrop-blur-sm text-[#badb7b]">
                    {telemetry.device || 'CUDA 12.4'}
                  </span>
                </div>

                {/* HUD Guidance Footer Bar */}
                <div className="absolute bottom-0 inset-x-0 flex items-end justify-between bg-gradient-to-t from-black/85 via-black/40 to-transparent px-5 pb-5 pt-14">
                  <div>
                    <div className="mb-1 text-[11px] font-semibold uppercase tracking-[.16em] text-[#d9ff5b]">
                      {telemetry?.messages?.[0] || 'Hold camera steady'}
                    </div>
                    <div className="text-sm text-white font-medium">
                      {telemetry.score >= 80 ? 'Optimal aesthetic alignment achieved' : 'Align face with golden target reticle'}
                    </div>
                  </div>
                  <div className="rounded-lg border border-[#d9ff5b]/30 bg-[#d9ff5b]/10 px-3 py-1.5 text-[9px] font-bold text-[#d9ff5b] backdrop-blur-md">
                    AI OVERLAY ACTIVE
                  </div>
                </div>
              </div>

              {/* Viewport Action Controls */}
              <div className="mt-3.5 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setRecording(!recording)}
                    className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold transition ${
                      recording ? 'bg-[#ff6868] text-white' : 'bg-[#d9ff5b] text-[#10150d] hover:bg-[#e4ff87]'
                    }`}
                  >
                    <span className={`h-2 w-2 rounded-full ${recording ? 'bg-white' : 'bg-[#10150d]'}`} />
                    {recording ? 'Stop stream' : 'Streaming active'}
                  </button>

                  <button
                    onClick={handleCapture}
                    className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[.04] px-4 py-2.5 text-xs text-[#c3ceca] transition hover:bg-white/[.08]"
                  >
                    <Camera size={14} /> {captured ? 'Saved Capture!' : 'Capture frame'}
                  </button>

                  {captured && (
                    <Link
                      href="/gallery"
                      className="flex items-center gap-1.5 rounded-xl bg-[#d9ff5b]/15 px-3 py-2 text-xs font-bold text-[#d9ff5b] transition hover:bg-[#d9ff5b]/25"
                    >
                      View in Gallery <ArrowRight size={13} />
                    </Link>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setGrid(!grid)}
                    className={`flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs transition ${
                      grid ? 'border-[#d9ff5b]/30 bg-[#d9ff5b]/10 text-[#d9ff5b]' : 'border-white/10 text-[#697579]'
                    }`}
                  >
                    <Grid3X3 size={14} /> Grid
                  </button>

                  <button
                    onClick={() => setVoice(!voice)}
                    className={`flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs transition ${
                      voice ? 'border-[#10b981]/30 bg-[#10b981]/10 text-[#10b981]' : 'border-white/10 text-[#697579]'
                    }`}
                  >
                    {voice ? <Volume2 size={14} /> : <Mic2 size={14} />} Voice
                  </button>

                  <button
                    onClick={startCamera}
                    className="rounded-xl border border-white/10 p-2 text-[#839093] hover:bg-white/[.06]"
                    title="Reconnect Camera"
                  >
                    <RotateCcw size={15} />
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
                      <div className="text-[40px] font-light leading-none tracking-tight text-white">
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
                <div className="mb-4 flex items-center justify-between">
                  <span className="text-[10px] uppercase tracking-[.17em] text-[#839094]">Geometric Engine (Brain 1)</span>
                  <span className="flex items-center gap-1 text-[10px] text-[#d9ff5b]">
                    <Zap size={12} /> Active
                  </span>
                </div>
                <div className="space-y-3.5">
                  {checks.map((check) => (
                    <div key={check.label}>
                      <div className="mb-1.5 flex justify-between text-[11px]">
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
                <div className="mb-2.5 flex items-center gap-2 text-[10px] uppercase tracking-[.17em] text-[#d9ff5b]">
                  <WandSparkles size={14} /> Smart Suggestion
                </div>
                <p className="text-[13px] leading-relaxed text-[#dce7d0]">
                  {telemetry?.messages?.[0] || 'Position subject inside the camera frame.'}
                </p>
              </div>
            </aside>
          </div>

          {/* LOWER METRICS ROW */}
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            <div className="rounded-[20px] border border-white/[.1] bg-[#101619] p-4">
              <div className="mb-3 flex items-center justify-between text-[10px] uppercase tracking-[.16em] text-[#839094]">
                <span className="flex items-center gap-2">
                  <Sparkles size={14} className="text-[#d9ff5b]" />
                  Neural aesthetic (Brain 2)
                </span>
                <span className="text-[9px] tracking-normal text-[#5f6d70]">AVA / NIMA Google</span>
              </div>
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
            </div>

            <div className="rounded-[20px] border border-white/[.1] bg-[#101619] p-4">
              <div className="mb-3 flex items-center justify-between text-[10px] uppercase tracking-[.16em] text-[#839094]">
                <span className="flex items-center gap-2">
                  <span className="inline-flex h-3 w-3 rounded-full border-2 border-[#edbb60]" />
                  Hardware Accelerator
                </span>
              </div>
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
            </div>

            <div className="rounded-[20px] border border-white/[.1] bg-[#101619] p-4">
              <div className="mb-3 flex items-center justify-between text-[10px] uppercase tracking-[.16em] text-[#839094]">
                <span className="flex items-center gap-2">
                  <Video size={14} className="text-[#71e3df]" />
                  Session status
                </span>
              </div>
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
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
