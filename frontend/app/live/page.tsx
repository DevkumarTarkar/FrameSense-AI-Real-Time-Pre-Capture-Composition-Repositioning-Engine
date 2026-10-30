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
  Sun,
  Compass,
  Radio,
  FlipHorizontal,
} from 'lucide-react'

interface Telemetry {
  score: number
  messages: string[]
  target_x?: number | null
  target_y?: number | null
  face_box?: [number, number, number, number] | null
  aesthetic_score?: number | null
  device?: string
  shot_type?: string
  shot_description?: string
  shot_confidence?: number
  estimated_distance_ft?: number | null
  estimated_distance_m?: number | null
  all_faces?: [number, number, number, number][] | null
  sub_scores?: {
    thirds?: number
    headroom?: number
    tilt?: number
    distance?: number
    distance_ft?: number
    distance_m?: number
    lighting?: number
    face_lum?: number
    perspective?: number
    aesthetic_ai?: number
    aesthetic_raw?: number
  }
}

export type PresetMode = 'free' | 'portrait' | 'center' | 'landscape' | 'reel' | 'post'

export const PRESETS: Record<
  PresetMode,
  { label: string; badge: string; ratio: number | null; desc: string; icon: string }
> = {
  free: {
    label: 'Full Sensor',
    badge: 'FULL SENSOR',
    ratio: null,
    desc: 'Uncropped camera aspect ratio',
    icon: '⛶',
  },
  portrait: {
    label: 'Portrait (3:4)',
    badge: 'PORTRAIT 3:4',
    ratio: 3 / 4,
    desc: 'Studio headshots & portrait sessions',
    icon: '👤',
  },
  center: {
    label: 'Center Symmetry',
    badge: 'CENTER 1:1',
    ratio: 1,
    desc: 'Square 1:1 for LinkedIn DP & passport symmetry',
    icon: '🎯',
  },
  landscape: {
    label: 'Landscape (16:9)',
    badge: 'CINEMATIC 16:9',
    ratio: 16 / 9,
    desc: 'Widescreen cinematic & travel scenes',
    icon: '🏞️',
  },
  reel: {
    label: 'Reel / Story (9:16)',
    badge: 'REEL 9:16',
    ratio: 9 / 16,
    desc: 'Instagram Reels, TikTok & Shorts',
    icon: '📱',
  },
  post: {
    label: 'IG Post (4:5)',
    badge: 'FEED POST 4:5',
    ratio: 4 / 5,
    desc: 'Instagram portrait feed standard',
    icon: '📷',
  },
}

function getPresetCropBox(width: number, height: number, preset: PresetMode) {
  const targetRatio = PRESETS[preset].ratio
  if (!targetRatio) {
    return { x: 0, y: 0, width, height }
  }
  const currentRatio = width / height
  let cropW = width
  let cropH = height

  if (currentRatio > targetRatio) {
    cropH = height
    cropW = height * targetRatio
  } else {
    cropW = width
    cropH = width / targetRatio
  }

  const cropX = (width - cropW) / 2
  const cropY = (height - cropH) / 2
  return { x: cropX, y: cropY, width: cropW, height: cropH }
}

// Smart Hinglish Natural Translation Dictionary for Photography Assistant
function getHinglishPrompt(msg: string, isSolo = false, isMirrored = false): string {
  if (!msg) return isSolo ? 'Frame me aao aur thoda ruko' : 'Phone ko seedha pakdo'
  const lower = msg.toLowerCase()

  // 1. Metric Distance & Physical Positioning
  if (lower.includes('step back') || lower.includes('too close')) {
    const match = lower.match(/([0-9.]+)\s*feet/)
    if (match) {
      const ft = Math.round(parseFloat(match[1]))
      return ft <= 1 ? 'Thoda sa peeche ho jao' : `Lagbhag ${ft} kadam peeche ho jao`
    }
    return isSolo ? 'Thoda do kadam peeche jao' : 'Camera thoda peeche le jao'
  }
  if (lower.includes('step closer') || lower.includes('move closer') || lower.includes('too far')) {
    const match = lower.match(/([0-9.]+)\s*feet/)
    if (match) {
      const ft = Math.round(parseFloat(match[1]))
      return ft <= 1 ? 'Thoda paas aao' : `Thoda ${ft} kadam aage aao`
    }
    return isSolo ? 'Thoda aage aao' : 'Camera thoda paas le aao'
  }

  // 2. Lateral Framing & Rule of Thirds (Respects Mirrored Selfie View vs Raw View)
  if (lower.includes('shift subject slightly right') || lower.includes('move camera right') || lower.includes('shift right')) {
    if (isMirrored) {
      return isSolo ? 'Apne left me ek step lo' : 'Camera thoda left me ghumao'
    }
    return isSolo ? 'Apne right me ek step lo' : 'Camera thoda right me ghumao'
  }
  if (lower.includes('shift subject slightly left') || lower.includes('move camera left') || lower.includes('shift left')) {
    if (isMirrored) {
      return isSolo ? 'Apne right me ek step lo' : 'Camera thoda right me ghumao'
    }
    return isSolo ? 'Apne left me ek step lo' : 'Camera thoda left me ghumao'
  }
  if (lower.includes('shift subject slightly down') || lower.includes('shift down')) {
    return isSolo ? 'Thoda neeche baitho ya jhuko' : 'Camera thoda neeche jhukao'
  }
  if (lower.includes('shift subject slightly up') || lower.includes('shift up')) {
    return isSolo ? 'Thoda seedhe khade ho jao' : 'Camera thoda upar uthao'
  }

  // 3. Headroom & Vertical Tilt
  if (lower.includes('tilt camera down') || lower.includes('headroom too tight')) {
    return 'Camera thoda neeche jhukao'
  }
  if (lower.includes('tilt camera up') || lower.includes('excessive headroom')) {
    return 'Camera thoda upar uthao'
  }

  // 4. Horizon & Camera Level
  if (lower.includes('level camera') || lower.includes('slanted') || lower.includes('tilt phone')) {
    if (lower.includes('tilt left')) {
      return isMirrored ? 'Camera ko right ki taraf thoda seedha karo' : 'Camera ko left ki taraf thoda seedha karo'
    }
    if (lower.includes('tilt right')) {
      return isMirrored ? 'Camera ko left ki taraf thoda seedha karo' : 'Camera ko right ki taraf thoda seedha karo'
    }
    return 'Phone ko thoda seedha pakdo'
  }

  // 5. Eye-Level Perspective & Flattering Portrait Angles
  if (lower.includes('eye level') || lower.includes('raise camera')) {
    return isSolo ? 'Tripod ko aakhon ke samne upar uthao' : 'Camera thoda upar aakhon ke samne lao'
  }
  if (lower.includes('lower camera')) {
    return isSolo ? 'Tripod ko thoda neeche karo' : 'Camera thoda neeche aakhon ke samne lao'
  }
  if (lower.includes('lift chin') || lower.includes('sharp jawline')) {
    return 'Chin thodi upar uthao for sharp jawline'
  }
  if (lower.includes('lower chin')) {
    return 'Chin thodi neeche karo aur lens me dekho'
  }
  if (lower.includes('45°') || lower.includes('45-degree') || lower.includes('angle face')) {
    return 'Face thoda 45-degree turn karo for cinematic look'
  }
  if (lower.includes('straighten your head') || lower.includes('head_tilted')) {
    return 'Head thoda seedha rakho'
  }
  if (lower.includes('turn face slightly back')) {
    return 'Face thoda camera ki taraf ghumao'
  }
  if (lower.includes('relax shoulders') || lower.includes('shoulders')) {
    return 'Shoulders relax karo aur camera lens me dekho'
  }

  // 6. Lighting, Glare & Shadows
  if (lower.includes('glare') || lower.includes('overexposed') || lower.includes('harsh glare')) {
    return 'Face par tez dhoop ya glare hai, angle badlo ya shade me aao'
  }
  if (lower.includes('backlight') || lower.includes('low light') || lower.includes('lighting is low') || lower.includes('shadow')) {
    return 'Lighting kam hai, light ki taraf ghoomo'
  }
  if (lower.includes('dark') || lower.includes('underexposed')) {
    return 'Roshni kam hai, thoda roshni me aao'
  }

  // 6. Framing Subject & Completion
  if (lower.includes('position subject') || lower.includes('no face')) {
    return 'Frame ke andar aao'
  }
  if (lower.includes('photo captured') || lower.includes('captured successfully')) {
    return 'Mast photo capture ho gayi!'
  }
  if (
    lower.includes('perfect') ||
    lower.includes('hold steady') ||
    lower.includes('lock') ||
    lower.includes('excellent') ||
    lower.includes('balanced') ||
    lower.includes('master')
  ) {
    return 'Perfect! Ruko, photo click ho rahi hai'
  }

  return msg
}

function getSoloCreatorPrompt(msg: string, isMirrored = false): string {
  if (!msg) return 'Hold camera steady'
  const lower = msg.toLowerCase()
  if (lower.includes('shift subject slightly right') || lower.includes('shift right')) {
    return isMirrored ? 'Step to your left' : 'Step to your right'
  }
  if (lower.includes('shift subject slightly left') || lower.includes('shift left')) {
    return isMirrored ? 'Step to your right' : 'Step to your left'
  }
  if (lower.includes('step back')) {
    return 'Take two steps back'
  }
  if (lower.includes('step closer')) {
    return 'Step closer to the camera'
  }
  if (lower.includes('tilt camera down') || lower.includes('headroom too tight')) {
    return 'Tilt camera down or step back'
  }
  if (lower.includes('tilt camera up') || lower.includes('excessive headroom')) {
    return 'Step a little closer to camera'
  }
  if (lower.includes('backlight')) {
    return 'Turn around and face the light'
  }
  if (lower.includes('glare')) {
    return 'Step away from direct light'
  }
  if (lower.includes('eye level') || lower.includes('raise camera')) {
    return 'Raise the tripod to eye level'
  }
  if (lower.includes('lower camera')) {
    return 'Lower the tripod slightly to eye level'
  }
  if (lower.includes('lift chin') || lower.includes('sharp jawline')) {
    return 'Lift your chin slightly for a sharp jawline'
  }
  if (lower.includes('lower chin')) {
    return 'Lower your chin slightly and look at the lens'
  }
  if (lower.includes('45°') || lower.includes('45-degree') || lower.includes('angle face')) {
    return 'Turn your face slightly at a 45-degree angle'
  }
  if (lower.includes('straighten your head') || lower.includes('head_tilted')) {
    return 'Straighten your head slightly'
  }
  if (lower.includes('turn face slightly back')) {
    return 'Turn your face back toward the camera'
  }
  if (lower.includes('relax shoulders') || lower.includes('shoulders')) {
    return 'Relax your shoulders and look at the lens'
  }
  if (lower.includes('level camera')) {
    return 'Keep the phone straight'
  }
  if (lower.includes('position subject')) {
    return 'Step inside the camera frame'
  }
  if (lower.includes('excellent') || lower.includes('master') || lower.includes('balanced')) {
    return 'Hold right there! Perfect!'
  }
  return msg
}

export default function Page() {
  const [isStreamPaused, setIsStreamPaused] = useState(false)
  const [voice, setVoice] = useState(true)
  const [grid, setGrid] = useState(true)
  const [captured, setCaptured] = useState(false)
  const [autoCapturedNotice, setAutoCapturedNotice] = useState(false)
  const [flashActive, setFlashActive] = useState(false)
  const [wsStatus, setWsStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting')
  const [cameraActive, setCameraActive] = useState(false)
  const [cameraError, setCameraError] = useState<string | null>(null)
  const [cameraLabel, setCameraLabel] = useState('Integrated Webcam')

  // Feature 1 & 2: Preset Modes
  const [preset, setPreset] = useState<PresetMode>('free')

  // Feature 1: Auto-Capture Mode
  const [autoCapture, setAutoCapture] = useState(true)
  const [autoCaptureProgress, setAutoCaptureProgress] = useState(0)

  // Feature 3: Solo Creator / Tripod Blind Mode
  const [soloMode, setSoloMode] = useState(false)

  // Mirror Selfie View (Defaults to true for natural selfie/webcam reflection)
  const [isMirrored, setIsMirrored] = useState(true)

  // Voice Language Toggle: 'hinglish' (Default) | 'en'
  const [voiceLang, setVoiceLang] = useState<'hinglish' | 'en'>('hinglish')

  const [telemetry, setTelemetry] = useState<Telemetry>({
    score: 0,
    messages: ['Initializing FrameSense AI camera feed...'],
    target_x: 213,
    target_y: 160,
    face_box: null,
    aesthetic_score: 5.0,
    device: 'NVIDIA RTX 3050 CUDA',
    shot_type: 'portrait',
    shot_description: 'Auto-detecting scene...',
    shot_confidence: 0.8,
    estimated_distance_ft: null,
    estimated_distance_m: null,
    all_faces: null,
    sub_scores: { thirds: 0, headroom: 0, tilt: 0, distance: 0, lighting: 1.0, perspective: 1.0 },
  })

  const videoRef = useRef<HTMLVideoElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const offscreenCanvasRef = useRef<HTMLCanvasElement | null>(null)
  const wsRef = useRef<WebSocket | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const animFrameIdRef = useRef<number | null>(null)
  const lastSpokenRef = useRef<string>('')
  const msgCycleRef = useRef<number>(0)
  const lastSpeakTimeRef = useRef<number>(0)

  // Auto-capture & countdown timer refs
  const stableStartTimeRef = useRef<number | null>(null)
  const autoCaptureCooldownRef = useRef<boolean>(false)

  // Trigger Physical Haptic Feedback (Vibration Cues)
  const triggerHaptic = useCallback((pattern: number | number[] = 45) => {
    try {
      if (typeof window !== 'undefined' && 'navigator' in window && 'vibrate' in navigator) {
        navigator.vibrate(pattern)
      }
    } catch {
      // Haptics skipped safely if unsupported or restricted
    }
  }, [])

  // Web Audio API Shutter Click Sound Synthesis
  const playShutterSound = useCallback(() => {
    try {
      const AudioContextClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      if (!AudioContextClass) return
      const audioCtx = new AudioContextClass()

      // Primary mechanical shutter click
      const osc1 = audioCtx.createOscillator()
      const gain1 = audioCtx.createGain()
      osc1.type = 'triangle'
      osc1.frequency.setValueAtTime(750, audioCtx.currentTime)
      osc1.frequency.exponentialRampToValueAtTime(140, audioCtx.currentTime + 0.05)
      gain1.gain.setValueAtTime(0.35, audioCtx.currentTime)
      gain1.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.06)
      osc1.connect(gain1)
      gain1.connect(audioCtx.destination)
      osc1.start(audioCtx.currentTime)
      osc1.stop(audioCtx.currentTime + 0.07)

      // Mirror return click
      const osc2 = audioCtx.createOscillator()
      const gain2 = audioCtx.createGain()
      osc2.type = 'sine'
      osc2.frequency.setValueAtTime(450, audioCtx.currentTime + 0.05)
      osc2.frequency.exponentialRampToValueAtTime(90, audioCtx.currentTime + 0.12)
      gain2.gain.setValueAtTime(0.25, audioCtx.currentTime + 0.05)
      gain2.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.13)
      osc2.connect(gain2)
      gain2.connect(audioCtx.destination)
      osc2.start(audioCtx.currentTime + 0.05)
      osc2.stop(audioCtx.currentTime + 0.14)
    } catch {
      // Audio playback silently skipped if context blocked
    }
  }, [])

  // Conversational Voice Synthesis (Adapted for Solo Mode & Hinglish Natural Prompts)
  const speakFeedback = useCallback(
    (text: string, force = false) => {
      if ((!voice && !soloMode) || !('speechSynthesis' in window) || !text) return

      let spokenText = text
      if (voiceLang === 'hinglish') {
        spokenText = getHinglishPrompt(text, soloMode, isMirrored)
      } else if (soloMode) {
        spokenText = getSoloCreatorPrompt(text, isMirrored)
      }

      if (!force && spokenText === lastSpokenRef.current) return

      window.speechSynthesis.cancel()
      const utterance = new SpeechSynthesisUtterance(spokenText)

      // Auto-select Indian English or Hindi voice if available for authentic accent
      const voices = window.speechSynthesis.getVoices()
      if (voiceLang === 'hinglish') {
        const indianVoice = voices.find(
          (v) =>
            v.lang.includes('hi') ||
            v.lang.includes('IN') ||
            v.name.toLowerCase().includes('india') ||
            v.name.toLowerCase().includes('hindi')
        )
        if (indianVoice) {
          utterance.voice = indianVoice
        }
        utterance.rate = 1.15
        utterance.pitch = 1.02
      } else {
        utterance.rate = 1.15
        utterance.pitch = soloMode ? 1.05 : 1.0
      }

      utterance.volume = soloMode ? 1.0 : 0.9
      window.speechSynthesis.speak(utterance)
      lastSpokenRef.current = spokenText
    },
    [voice, soloMode, voiceLang, isMirrored]
  )

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
        // Dynamic host resolution: Works on localhost, local Wi-Fi IP (Mobile testing), or deployed domain
        const host = typeof window !== 'undefined' && window.location.hostname ? window.location.hostname : '127.0.0.1'
        const wsProtocol = typeof window !== 'undefined' && window.location.protocol === 'https:' ? 'wss:' : 'ws:'
        const wsUrl = `${wsProtocol}//${host}:8000/ws/analyze`
        ws = new WebSocket(wsUrl)

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
                const now = Date.now()
                // Prioritize photo angle, framing, headroom and lighting cues over pure metric distance
                const prioritizedMessages = [...data.messages].sort((a, b) => {
                  const isDistA = a.toLowerCase().includes('step') || a.toLowerCase().includes('feet') || a.toLowerCase().includes('too close') || a.toLowerCase().includes('too far')
                  const isDistB = b.toLowerCase().includes('step') || b.toLowerCase().includes('feet') || b.toLowerCase().includes('too close') || b.toLowerCase().includes('too far')
                  if (isDistA && !isDistB) return 1
                  if (!isDistA && isDistB) return -1
                  return 0
                })

                const topMsg = prioritizedMessages[0]
                const isNewUrgent =
                  topMsg &&
                  topMsg !== lastSpokenRef.current &&
                  !topMsg.includes('Hold steady') &&
                  !topMsg.includes('balanced')

                // 1. Instant response if subject moves or new condition arises (~1.1s minimum audio gap)
                if (isNewUrgent && now - lastSpeakTimeRef.current > 1100) {
                  msgCycleRef.current = 0
                  lastSpeakTimeRef.current = now
                  speakFeedback(topMsg, true)
                }
                // 2. Real-time coaching cycle: rotate every 1.65s (within 1-2 sec)
                else if (now - lastSpeakTimeRef.current > 1650) {
                  msgCycleRef.current = (msgCycleRef.current + 1) % prioritizedMessages.length
                  lastSpeakTimeRef.current = now
                  const chosenMsg = prioritizedMessages[msgCycleRef.current] || topMsg
                  speakFeedback(chosenMsg, true)
                }
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

  // Frame streaming to backend (~10 FPS)
  useEffect(() => {
    if (isStreamPaused) return

    const interval = setInterval(() => {
      if (
        wsRef.current &&
        wsRef.current.readyState === WebSocket.OPEN &&
        videoRef.current &&
        videoRef.current.readyState >= 2
      ) {
        if (!offscreenCanvasRef.current) {
          offscreenCanvasRef.current = document.createElement('canvas')
          offscreenCanvasRef.current.width = 640
          offscreenCanvasRef.current.height = 480
        }
        const offscreen = offscreenCanvasRef.current
        const ctx = offscreen.getContext('2d')
        if (ctx) {
          ctx.drawImage(videoRef.current, 0, 0, 640, 480)
          const base64Data = offscreen.toDataURL('image/jpeg', 0.65).split(',')[1]
          if (base64Data) {
            wsRef.current.send(
              JSON.stringify({
                image_base64: base64Data,
                width: 640,
                height: 480,
              })
            )
          }
        }
      }
    }, 100)

    return () => clearInterval(interval)
  }, [isStreamPaused])

  // High-Resolution Capture Function (Manual or Auto)
  const handleCapture = useCallback(
    (isAuto = false) => {
      if (videoRef.current) {
        const v = videoRef.current
        const vw = v.videoWidth || 640
        const vh = v.videoHeight || 480
        const crop = getPresetCropBox(vw, vh, preset)

        const snapCanvas = document.createElement('canvas')
        snapCanvas.width = Math.round(crop.width)
        snapCanvas.height = Math.round(crop.height)
        const ctx = snapCanvas.getContext('2d')
        if (ctx) {
          if (isMirrored) {
            ctx.save()
            ctx.translate(snapCanvas.width, 0)
            ctx.scale(-1, 1)
          }
          ctx.drawImage(
            v,
            crop.x,
            crop.y,
            crop.width,
            crop.height,
            0,
            0,
            snapCanvas.width,
            snapCanvas.height
          )
          if (isMirrored) {
            ctx.restore()
          }
          const dataUrl = snapCanvas.toDataURL('image/jpeg', 0.95)
          const a = document.createElement('a')
          a.href = dataUrl
          a.download = `FrameSense_${preset.toUpperCase()}_Score${telemetry.score}_${Date.now()}.jpg`
          a.click()

          // Save capture to localStorage for Gallery Page
          try {
            const newCapture = {
              id: `CAP-${Date.now().toString().slice(-4)}`,
              timestamp: new Date().toLocaleTimeString(),
              date: 'Today',
              score: telemetry.score,
              aesthetic: telemetry.aesthetic_score || 8.0,
              thumbnail: dataUrl,
              grade: telemetry.score >= 90 ? 'A+' : telemetry.score >= 80 ? 'A' : telemetry.score >= 65 ? 'B' : 'Needs Retake',
              verdict: telemetry.score >= 85 ? 'Master Composition' : 'Good Alignment',
              sub_scores: {
                thirds: Math.round((telemetry.sub_scores?.thirds ?? 0.8) * 40),
                headroom: Math.round((telemetry.sub_scores?.headroom ?? 0.8) * 20),
                tilt: Math.round((telemetry.sub_scores?.tilt ?? 0.9) * 20),
                distance: Math.round((telemetry.sub_scores?.distance ?? 0.8) * 20),
              },
            }
            const existing = JSON.parse(localStorage.getItem('framesense_captures') || '[]')
            localStorage.setItem('framesense_captures', JSON.stringify([newCapture, ...existing].slice(0, 30)))
          } catch (e) {
            console.warn('Failed to save to local gallery cache:', e)
          }

          triggerHaptic([60, 40, 90]) // Dual-pulse shutter haptic tick
          playShutterSound()
          setFlashActive(true)
          setTimeout(() => setFlashActive(false), 220)
          setCaptured(true)
          setAutoCapturedNotice(isAuto)
          setTimeout(() => {
            setCaptured(false)
            setAutoCapturedNotice(false)
          }, 4000)
        }
      }
    },
    [preset, telemetry.score, playShutterSound, triggerHaptic, isMirrored]
  )

  // Auto-Capture Monitoring Loop (Triggers when Score >= 85 for 1.0 continuous second)
  useEffect(() => {
    if (!autoCapture || !cameraActive || isStreamPaused) {
      stableStartTimeRef.current = null
      setAutoCaptureProgress(0)
      return
    }

    const checkInterval = setInterval(() => {
      if (autoCaptureCooldownRef.current) {
        setAutoCaptureProgress(0)
        return
      }

      // When score >= 85, shot is optimal
      if (telemetry.score >= 85) {
        if (stableStartTimeRef.current === null) {
          stableStartTimeRef.current = Date.now()
          // Immediate haptic cue on alignment lock
          triggerHaptic(50)
          // Immediate spoken feedback when alignment is achieved
          speakFeedback(
            voiceLang === 'hinglish'
              ? 'Perfect! Ruko, click ho rahi hai'
              : 'Perfect framing! Hold steady',
            true
          )
        } else {
          const elapsed = Date.now() - stableStartTimeRef.current
          // 1000ms (1 second) continuous hold for swift, reliable capture
          const progress = Math.min(100, Math.round((elapsed / 1000) * 100))
          setAutoCaptureProgress(progress)

          if (elapsed >= 1000) {
            stableStartTimeRef.current = null
            setAutoCaptureProgress(0)
            autoCaptureCooldownRef.current = true

            // Trigger auto-capture
            handleCapture(true)
            speakFeedback(
              voiceLang === 'hinglish'
                ? 'Mast photo capture ho gayi!'
                : 'Photo captured successfully!',
              true
            )

            // 4-second cooldown to avoid continuous spam
            setTimeout(() => {
              autoCaptureCooldownRef.current = false
            }, 4000)
          }
        }
      } else {
        stableStartTimeRef.current = null
        setAutoCaptureProgress(0)
      }
    }, 100)

    return () => clearInterval(checkInterval)
  }, [autoCapture, cameraActive, isStreamPaused, telemetry.score, soloMode, voiceLang, handleCapture, speakFeedback, triggerHaptic])

  // 60 FPS Viewfinder Canvas HUD Render Loop
  const renderHUD = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const w = canvas.width
    const h = canvas.height

    ctx.clearRect(0, 0, w, h)

    // Calculate crop boundary for active preset
    const crop = getPresetCropBox(w, h, preset)

    // A. Render Preset Letterbox / Pillarbox Dark Mask
    if (preset !== 'free') {
      ctx.fillStyle = 'rgba(7, 10, 13, 0.72)'
      // Left pillar
      if (crop.x > 0) ctx.fillRect(0, 0, crop.x, h)
      // Right pillar
      if (crop.x + crop.width < w) ctx.fillRect(crop.x + crop.width, 0, w - (crop.x + crop.width), h)
      // Top letterbox
      if (crop.y > 0) ctx.fillRect(crop.x, 0, crop.width, crop.y)
      // Bottom letterbox
      if (crop.y + crop.height < h) ctx.fillRect(crop.x, crop.y + crop.height, crop.width, h - (crop.y + crop.height))

      // Viewfinder Corner Brackets
      const cLen = 18
      ctx.strokeStyle = '#d9ff5b'
      ctx.lineWidth = 2.5

      // Top-Left Corner
      ctx.beginPath()
      ctx.moveTo(crop.x, crop.y + cLen)
      ctx.lineTo(crop.x, crop.y)
      ctx.lineTo(crop.x + cLen, crop.y)
      ctx.stroke()

      // Top-Right Corner
      ctx.beginPath()
      ctx.moveTo(crop.x + crop.width - cLen, crop.y)
      ctx.lineTo(crop.x + crop.width, crop.y)
      ctx.lineTo(crop.x + crop.width, crop.y + cLen)
      ctx.stroke()

      // Bottom-Left Corner
      ctx.beginPath()
      ctx.moveTo(crop.x, crop.y + crop.height - cLen)
      ctx.lineTo(crop.x, crop.y + crop.height)
      ctx.lineTo(crop.x + cLen, crop.y + crop.height)
      ctx.stroke()

      // Bottom-Right Corner
      ctx.beginPath()
      ctx.moveTo(crop.x + crop.width - cLen, crop.y + crop.height)
      ctx.lineTo(crop.x + crop.width, crop.y + crop.height)
      ctx.lineTo(crop.x + crop.width, crop.y + crop.height - cLen)
      ctx.stroke()

      // Preset Badge Indicator on Viewfinder
      ctx.fillStyle = 'rgba(0, 0, 0, 0.65)'
      ctx.fillRect(crop.x + 8, crop.y + 8, 125, 18)
      ctx.strokeStyle = 'rgba(217, 255, 91, 0.4)'
      ctx.lineWidth = 1
      ctx.strokeRect(crop.x + 8, crop.y + 8, 125, 18)

      ctx.fillStyle = '#d9ff5b'
      ctx.font = 'bold 9px monospace'
      ctx.fillText(PRESETS[preset].badge, crop.x + 14, crop.y + 20)
    }

    // A2. Contextual Shot Type & Depth Badges on Viewfinder
    const sceneLabel =
      telemetry.shot_type === 'group'
        ? `👥 GROUP (${telemetry.all_faces?.length || 2} SUBJECTS)`
        : telemetry.shot_type === 'architecture'
        ? '🏛️ ARCHITECTURE'
        : telemetry.shot_type === 'landscape'
        ? '🏞️ LANDSCAPE'
        : telemetry.shot_type === 'food'
        ? '🍽️ FOOD / FLATLAY'
        : '👤 SOLO PORTRAIT'

    // Scene Badge (Top Right)
    ctx.fillStyle = 'rgba(7, 10, 13, 0.78)'
    ctx.fillRect(w - 215, 12, 205, 22)
    ctx.strokeStyle = 'rgba(217, 255, 91, 0.5)'
    ctx.lineWidth = 1
    ctx.strokeRect(w - 215, 12, 205, 22)
    ctx.fillStyle = '#d9ff5b'
    ctx.font = 'bold 9px monospace'
    ctx.fillText(sceneLabel, w - 205, 26)

    // Metric Distance Badge (Directly below Scene Badge if depth available)
    if (telemetry.estimated_distance_ft !== undefined && telemetry.estimated_distance_ft !== null) {
      const depthLabel = `📏 DEPTH: ${telemetry.estimated_distance_ft} FT (${telemetry.estimated_distance_m} M)`
      ctx.fillStyle = 'rgba(7, 10, 13, 0.78)'
      ctx.fillRect(w - 215, 38, 205, 20)
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.5)'
      ctx.strokeRect(w - 215, 38, 205, 20)
      ctx.fillStyle = '#38bdf8'
      ctx.font = 'bold 9px monospace'
      ctx.fillText(depthLabel, w - 205, 52)
    }

    // B. Draw Composition Grid (Rule of Thirds OR Center Symmetry)
    if (grid) {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.22)'
      ctx.lineWidth = 1

      if (preset === 'center') {
        // Center Symmetry Guides: Crosshairs intersecting in dead center
        const cx = crop.x + crop.width / 2
        const cy = crop.y + crop.height / 2

        ctx.strokeStyle = 'rgba(217, 255, 91, 0.35)'
        ctx.beginPath()
        ctx.moveTo(cx, crop.y)
        ctx.lineTo(cx, crop.y + crop.height)
        ctx.moveTo(crop.x, cy)
        ctx.lineTo(crop.x + crop.width, cy)
        ctx.stroke()

        // Center focal circle
        ctx.strokeStyle = 'rgba(217, 255, 91, 0.6)'
        ctx.beginPath()
        ctx.arc(cx, cy, 32, 0, Math.PI * 2)
        ctx.stroke()
      } else {
        // Standard Rule-of-Thirds Grid
        const gx1 = crop.x + crop.width / 3
        const gx2 = crop.x + (2 * crop.width) / 3
        const gy1 = crop.y + crop.height / 3
        const gy2 = crop.y + (2 * crop.height) / 3

        // Vertical grid lines
        ctx.beginPath()
        ctx.moveTo(gx1, crop.y)
        ctx.lineTo(gx1, crop.y + crop.height)
        ctx.moveTo(gx2, crop.y)
        ctx.lineTo(gx2, crop.y + crop.height)
        ctx.stroke()

        // Horizontal grid lines
        ctx.beginPath()
        ctx.moveTo(crop.x, gy1)
        ctx.lineTo(crop.x + crop.width, gy1)
        ctx.moveTo(crop.x, gy2)
        ctx.lineTo(crop.x + crop.width, gy2)
        ctx.stroke()

        // Golden Power Intersections
        const powerPoints = [
          [gx1, gy1],
          [gx2, gy1],
          [gx1, gy2],
          [gx2, gy2],
        ]

        ctx.fillStyle = 'rgba(217, 255, 91, 0.75)'
        powerPoints.forEach(([px, py]) => {
          ctx.beginPath()
          ctx.arc(px, py, 3.5, 0, Math.PI * 2)
          ctx.fill()
        })
      }
    }

    // C. Draw Face Detection Box
    if (telemetry.face_box && telemetry.face_box.length === 4) {
      const [x1, y1, x2, y2] = telemetry.face_box
      const sx = w / 640
      const sy = h / 480

      const boxX = (isMirrored ? 640 - x2 : x1) * sx
      const boxY = y1 * sy
      const boxW = Math.max(0, (x2 - x1) * sx)
      const boxH = Math.max(0, (y2 - y1) * sy)

      ctx.strokeStyle = '#22c55e'
      ctx.lineWidth = 2
      ctx.strokeRect(boxX, boxY, boxW, boxH)

      ctx.fillStyle = '#22c55e'
      ctx.fillRect(boxX, Math.max(0, boxY - 22), 85, 22)
      ctx.fillStyle = '#070a0d'
      ctx.font = 'bold 10px monospace'
      ctx.fillText('FACE DETECT', boxX + 6, Math.max(14, boxY - 7))
    }

    // C2. Draw Group Faces (if multi-subject group detected)
    if (telemetry.all_faces && telemetry.all_faces.length > 1) {
      const sx = w / 640
      const sy = h / 480
      telemetry.all_faces.forEach(([gx1, gy1, gx2, gy2], idx) => {
        if (
          telemetry.face_box &&
          Math.abs(gx1 - telemetry.face_box[0]) < 8 &&
          Math.abs(gy1 - telemetry.face_box[1]) < 8
        ) {
          return
        }
        const gX = (isMirrored ? 640 - gx2 : gx1) * sx
        const gY = gy1 * sy
        const gW = Math.max(0, (gx2 - gx1) * sx)
        const gH = Math.max(0, (gy2 - gy1) * sy)

        ctx.strokeStyle = '#38bdf8'
        ctx.lineWidth = 1.8
        ctx.strokeRect(gX, gY, gW, gH)

        ctx.fillStyle = '#38bdf8'
        ctx.fillRect(gX, Math.max(0, gY - 18), 76, 18)
        ctx.fillStyle = '#070a0d'
        ctx.font = 'bold 9px monospace'
        ctx.fillText(`SUBJECT #${idx + 1}`, gX + 5, Math.max(12, gY - 5))
      })
    }

    // D. Draw Target Alignment Reticle with Lock Visuals
    if (
      telemetry.target_x !== undefined &&
      telemetry.target_y !== undefined &&
      telemetry.target_x !== null &&
      telemetry.target_y !== null
    ) {
      const sx = w / 640
      const sy = h / 480

      let tx = (isMirrored ? 640 - telemetry.target_x : telemetry.target_x) * sx
      let ty = telemetry.target_y * sy

      // If Center Symmetry mode, override target to dead center of active preset
      if (preset === 'center') {
        tx = crop.x + crop.width / 2
        ty = crop.y + crop.height / 2
      }

      const isLocked = telemetry.score >= 85

      ctx.strokeStyle = isLocked ? '#22c55e' : '#d9ff5b'
      ctx.lineWidth = isLocked ? 3 : 2.5
      ctx.beginPath()
      ctx.arc(tx, ty, 18, 0, Math.PI * 2)
      ctx.stroke()

      ctx.fillStyle = isLocked ? '#22c55e' : '#d9ff5b'
      ctx.beginPath()
      ctx.arc(tx, ty, 5, 0, Math.PI * 2)
      ctx.fill()

      // Radial Auto-Capture Ring around Target if Countdown is Active
      if (autoCaptureProgress > 0) {
        ctx.strokeStyle = '#22c55e'
        ctx.lineWidth = 4
        ctx.beginPath()
        const startAngle = -Math.PI / 2
        const endAngle = startAngle + (autoCaptureProgress / 100) * (Math.PI * 2)
        ctx.arc(tx, ty, 26, startAngle, endAngle)
        ctx.stroke()
      }

      ctx.fillStyle = isLocked ? '#22c55e' : '#d9ff5b'
      ctx.font = 'bold 10px monospace'
      ctx.fillText(isLocked ? 'LOCKED' : 'TARGET', tx + 24, ty + 4)

      // AR Dynamic Direction Vector Arrow
      if (telemetry.face_box && !isLocked) {
        const [fx1, fy1, fx2, fy2] = telemetry.face_box
        const rawCx = fx1 + (fx2 - fx1) / 2
        const subjectCx = (isMirrored ? 640 - rawCx : rawCx) * sx
        const subjectCy = (fy1 + (fy2 - fy1) / 2) * sy

        const dx = tx - subjectCx
        const dy = ty - subjectCy
        const distToTarget = Math.hypot(dx, dy)

        if (distToTarget > 25) {
          ctx.strokeStyle = '#d9ff5b'
          ctx.fillStyle = '#d9ff5b'
          ctx.lineWidth = 2

          // Dashed vector connecting subject center to optimal target
          ctx.setLineDash([5, 4])
          ctx.beginPath()
          ctx.moveTo(subjectCx, subjectCy)
          ctx.lineTo(tx, ty)
          ctx.stroke()
          ctx.setLineDash([])

          // Vector arrowhead at target point
          const angle = Math.atan2(dy, dx)
          const arrowLen = 11
          ctx.beginPath()
          ctx.moveTo(tx, ty)
          ctx.lineTo(tx - arrowLen * Math.cos(angle - Math.PI / 6), ty - arrowLen * Math.sin(angle - Math.PI / 6))
          ctx.lineTo(tx - arrowLen * Math.cos(angle + Math.PI / 6), ty - arrowLen * Math.sin(angle + Math.PI / 6))
          ctx.closePath()
          ctx.fill()
        }
      }
    }

    // E. Solo Tripod Large Countdown Overlay (Visible from 3+ meters)
    if (soloMode && autoCaptureProgress > 0) {
      const secondsLeft = Math.max(1, Math.ceil((100 - autoCaptureProgress) / 33.3))
      ctx.fillStyle = 'rgba(7, 10, 13, 0.75)'
      ctx.beginPath()
      ctx.arc(w / 2, h / 2, 70, 0, Math.PI * 2)
      ctx.fill()
      ctx.strokeStyle = '#22c55e'
      ctx.lineWidth = 4
      ctx.stroke()

      ctx.fillStyle = '#22c55e'
      ctx.font = 'bold 54px monospace'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(String(secondsLeft), w / 2, h / 2 - 6)

      ctx.font = 'bold 10px monospace'
      ctx.fillText('HOLD STEADY', w / 2, h / 2 + 38)
      ctx.textAlign = 'left'
      ctx.textBaseline = 'alphabetic'
    }

    animFrameIdRef.current = requestAnimationFrame(renderHUD)
  }, [grid, telemetry, preset, autoCaptureProgress, soloMode, isMirrored])

  useEffect(() => {
    animFrameIdRef.current = requestAnimationFrame(renderHUD)
    return () => {
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current)
      }
    }
  }, [renderHUD])

  const thirdsScore = telemetry.sub_scores?.thirds ?? 0
  const headroomScore = telemetry.sub_scores?.headroom ?? 0
  const tiltScore = telemetry.sub_scores?.tilt ?? 0
  const distScore = telemetry.sub_scores?.distance ?? 0
  const lightingScore = telemetry.sub_scores?.lighting ?? 1.0
  const perspectiveScore = telemetry.sub_scores?.perspective ?? 1.0

  const checks = [
    {
      label: 'Rule of thirds / framing',
      value: `${Math.round(thirdsScore * 100)}%`,
      width: `${Math.min(100, Math.round(thirdsScore * 100))}%`,
      tone: thirdsScore >= 0.75 ? 'lime' : 'amber',
    },
    {
      label: 'Headroom balance',
      value: headroomScore >= 0.8 ? 'Optimal' : headroomScore >= 0.5 ? 'Acceptable' : 'Adjust',
      width: `${Math.min(100, Math.round(headroomScore * 100))}%`,
      tone: headroomScore >= 0.8 ? 'cyan' : 'amber',
    },
    {
      label: 'Horizon stability',
      value: tiltScore >= 0.9 ? 'Level (≤2°)' : tiltScore >= 0.5 ? 'Minor Tilt' : 'Tilted',
      width: `${Math.min(100, Math.round(tiltScore * 100))}%`,
      tone: tiltScore >= 0.9 ? 'lime' : 'amber',
    },
    {
      label: 'Subject depth / distance',
      value:
        telemetry.estimated_distance_ft !== undefined && telemetry.estimated_distance_ft !== null
          ? `${telemetry.estimated_distance_ft} ft (${distScore >= 0.8 ? 'Ideal' : 'Adjust'})`
          : distScore >= 0.8 ? 'Ideal' : 'Reframing',
      width: `${Math.min(100, Math.round(distScore * 100))}%`,
      tone: distScore >= 0.8 ? 'lime' : 'cyan',
    },
    {
      label: 'Contextual scene classification',
      value: telemetry.shot_description || 'Solo Portrait',
      width: '100%',
      tone: 'lime',
    },
    {
      label: 'Face lighting & exposure',
      value: lightingScore >= 0.85 ? 'Balanced' : lightingScore >= 0.5 ? 'Moderate' : 'Backlit / Dark',
      width: `${Math.min(100, Math.round(lightingScore * 100))}%`,
      tone: lightingScore >= 0.85 ? 'lime' : 'amber',
    },
    {
      label: 'Camera perspective / eye-level',
      value: perspectiveScore >= 0.85 ? 'Eye-Level' : 'Awkward Angle',
      width: `${Math.min(100, Math.round(perspectiveScore * 100))}%`,
      tone: perspectiveScore >= 0.85 ? 'lime' : 'amber',
    },
  ]

  return (
    <div className="min-h-screen bg-[#070a0d] text-[#e7f0ed] selection:bg-[#d9ff5b] selection:text-[#070a0d]">
      <Navbar />

      <main className="mx-auto flex max-w-[1720px] gap-8 px-5 py-7 lg:px-9">
        <Sidebar cameraLabel={cameraLabel} cameraActive={cameraActive} />

        <div className="min-w-0 flex-1">
          {/* Header & Preset Selector Bar */}
          <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
            <div>
              <div className="mb-2 flex items-center gap-2 text-[10px] uppercase tracking-[.2em] text-[#718083]">
                {PRESETS[preset].desc} <ChevronDown size={12} />
              </div>
              <h1 className="text-[28px] font-bold tracking-[-.055em] text-white sm:text-[34px]">
                Live Viewfinder <span className="text-[#4b575b]">/</span>{' '}
                <span className="text-[#849094]">{PRESETS[preset].label}</span>
              </h1>
            </div>

            {/* PRESET MODES TOGGLE PILLS */}
            <div className="flex flex-wrap items-center gap-1.5 rounded-2xl border border-white/[.08] bg-[#101619] p-1.5 shadow-lg">
              {(Object.keys(PRESETS) as PresetMode[]).map((key) => {
                const item = PRESETS[key]
                const isActive = preset === key
                return (
                  <button
                    key={key}
                    onClick={() => setPreset(key)}
                    className={`flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-semibold transition ${
                      isActive
                        ? 'bg-[#d9ff5b] text-[#070a0d] shadow-sm'
                        : 'text-[#859497] hover:bg-white/[.05] hover:text-white'
                    }`}
                  >
                    <span>{item.icon}</span>
                    <span>{item.label}</span>
                  </button>
                )
              })}
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
                  className={`absolute inset-0 h-full w-full object-cover transition-transform duration-200 ${
                    isMirrored ? '-scale-x-100' : ''
                  }`}
                />

                <canvas
                  ref={canvasRef}
                  width={640}
                  height={480}
                  className="absolute inset-0 h-full w-full pointer-events-none"
                />

                {/* Shutter Flash Animation */}
                {flashActive && (
                  <div className="absolute inset-0 z-30 bg-white/90 pointer-events-none transition-opacity duration-200" />
                )}

                {/* Camera Busy / Error Screen with Permission Guidance */}
                {!cameraActive && (
                  <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-[#101619] p-6 text-center">
                    <AlertCircle className="mb-3 text-[#ff6868]" size={42} />
                    <p className="text-base font-semibold text-white">Camera Device Initializing / Blocked</p>
                    <p className="mt-2 max-w-sm text-xs leading-relaxed text-[#8a999b]">
                      {cameraError ||
                        'If camera is blocked, please click the lock/tune icon near your browser address bar and set Camera to Allow.'}
                    </p>
                    <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                      <button
                        onClick={startCamera}
                        className="flex items-center gap-2 rounded-xl bg-[#d9ff5b] px-4 py-2.5 text-xs font-bold text-[#070a0d] transition hover:bg-[#e4ff87]"
                      >
                        <RotateCcw size={14} /> Retry Connection
                      </button>
                    </div>
                  </div>
                )}

                {/* HUD Header Bar */}
                <div className="absolute inset-x-0 top-0 flex items-center justify-between p-5 text-[9px] font-mono uppercase tracking-[.15em] text-white/80">
                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-2 rounded-md bg-black/60 px-2.5 py-1 backdrop-blur-sm">
                      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#ff6d6d]" /> LIVE FEED
                    </span>
                    <span className="rounded-md border border-white/10 bg-black/60 px-2.5 py-1 backdrop-blur-sm text-[#badb7b]">
                      MODE: {PRESETS[preset].badge}
                    </span>
                    {soloMode && (
                      <span className="flex items-center gap-1 rounded-md border border-[#22c55e]/40 bg-[#22c55e]/20 px-2.5 py-1 text-[#22c55e] backdrop-blur-sm">
                        <Radio size={11} className="animate-pulse" /> SOLO TRIPOD
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Lighting Quality Indicator */}
                    <span
                      className={`hidden sm:flex items-center gap-1 rounded-md px-2.5 py-1 text-[9px] font-bold backdrop-blur-sm ${
                        lightingScore < 0.85
                          ? 'border border-[#edbb60]/40 bg-[#edbb60]/20 text-[#edbb60]'
                          : 'border border-[#22c55e]/30 bg-black/60 text-[#22c55e]'
                      }`}
                    >
                      <Sun size={11} />
                      {lightingScore < 0.85 ? 'LIGHT: ADJUST' : 'LIGHT: OK'}
                    </span>

                    {/* Perspective Angle Indicator */}
                    <span
                      className={`hidden sm:flex items-center gap-1 rounded-md px-2.5 py-1 text-[9px] font-bold backdrop-blur-sm ${
                        perspectiveScore < 0.85
                          ? 'border border-[#edbb60]/40 bg-[#edbb60]/20 text-[#edbb60]'
                          : 'border border-[#22c55e]/30 bg-black/60 text-[#badb7b]'
                      }`}
                    >
                      <Compass size={11} />
                      {perspectiveScore < 0.85 ? 'ANGLE: ADJUST' : 'EYE-LEVEL'}
                    </span>

                    {/* Auto-shutter status badge */}
                    {autoCapture && (
                      <span
                        className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 backdrop-blur-sm text-[9px] font-bold ${
                          autoCaptureProgress > 0
                            ? 'bg-[#22c55e]/30 text-[#22c55e] border border-[#22c55e]/50'
                            : 'bg-black/60 text-[#d9ff5b]'
                        }`}
                      >
                        <Zap size={11} className={autoCaptureProgress > 0 ? 'animate-bounce' : ''} />
                        {autoCaptureProgress > 0
                          ? `LOCKING (${autoCaptureProgress}%)`
                          : 'AUTO-SHUTTER READY'}
                      </span>
                    )}

                    <span className="rounded-md bg-black/60 px-2.5 py-1 backdrop-blur-sm text-[#badb7b]">
                      {telemetry.device || 'CUDA 12.4'}
                    </span>
                  </div>
                </div>

                {/* HUD Guidance Footer Bar */}
                <div className="absolute bottom-0 inset-x-0 flex items-end justify-between bg-gradient-to-t from-black/85 via-black/40 to-transparent px-5 pb-5 pt-14">
                  <div>
                    <div className="mb-1 text-[11px] font-semibold uppercase tracking-[.16em] text-[#d9ff5b]">
                      {soloMode
                        ? getSoloCreatorPrompt(telemetry?.messages?.[0] || 'Stand inside the frame')
                        : telemetry?.messages?.[0] || 'Hold camera steady'}
                    </div>
                    <div className="text-sm font-medium text-white">
                      {telemetry.score >= 88
                        ? soloMode
                          ? 'Hold still! Automatic shutter in 3... 2... 1...'
                          : 'Master composition locked! Auto-capture ready'
                        : telemetry.score >= 75
                        ? 'Good framing. Refine slightly for auto-shutter'
                        : 'Align face with golden target reticle'}
                    </div>
                  </div>

                  {/* Auto-shutter live lock progress bar */}
                  {autoCapture && autoCaptureProgress > 0 && (
                    <div className="hidden sm:flex flex-col items-end gap-1">
                      <div className="text-[10px] font-mono text-[#22c55e]">
                        HOLD STEADY ({autoCaptureProgress}%)
                      </div>
                      <div className="h-2 w-32 overflow-hidden rounded-full border border-[#22c55e]/30 bg-black/60">
                        <div
                          className="h-full bg-[#22c55e] transition-all duration-100"
                          style={{ width: `${autoCaptureProgress}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Viewport Action Controls */}
              <div className="mt-3.5 flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => setIsStreamPaused(!isStreamPaused)}
                    className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold transition ${
                      isStreamPaused ? 'bg-amber-500/20 border border-amber-500/40 text-amber-300' : 'bg-[#d9ff5b] text-[#10150d] hover:bg-[#e4ff87]'
                    }`}
                  >
                    <span className={`h-2 w-2 rounded-full ${isStreamPaused ? 'bg-amber-400' : 'bg-[#10150d]'}`} />
                    {isStreamPaused ? 'Stream Paused (Click to Resume)' : 'Live Stream Active'}
                  </button>

                  <button
                    onClick={() => handleCapture(false)}
                    className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[.04] px-4 py-2.5 text-xs text-[#c3ceca] transition hover:bg-white/[.08]"
                  >
                    <Camera size={14} /> {captured ? 'Saved Capture!' : 'Manual Shutter'}
                  </button>

                  {/* Auto-Capture Toggle Button */}
                  <button
                    onClick={() => setAutoCapture(!autoCapture)}
                    className={`flex items-center gap-2 rounded-xl border px-3.5 py-2.5 text-xs font-semibold transition ${
                      autoCapture
                        ? 'border-[#22c55e]/40 bg-[#22c55e]/15 text-[#22c55e]'
                        : 'border-white/10 bg-white/[.04] text-[#718083] hover:text-white'
                    }`}
                    title="Auto-captures photo when composition score >= 85 for 1.0 second"
                  >
                    <Zap size={14} /> Auto-Shutter: {autoCapture ? 'ON (≥85)' : 'OFF'}
                  </button>

                  {/* Feature 3: Solo Creator / Tripod Blind Mode Button */}
                  <button
                    onClick={() => {
                      const next = !soloMode
                      setSoloMode(next)
                      speakFeedback(
                        next
                          ? 'Solo tripod mode enabled. Step back and listen for instructions.'
                          : 'Solo mode disabled.'
                      )
                    }}
                    className={`flex items-center gap-2 rounded-xl border px-3.5 py-2.5 text-xs font-semibold transition ${
                      soloMode
                        ? 'border-[#71e3df]/40 bg-[#71e3df]/15 text-[#71e3df]'
                        : 'border-white/10 bg-white/[.04] text-[#718083] hover:text-white'
                    }`}
                    title="Loud physical step guidance ('Step left', 'Step back') and huge 3-2-1 timer for solo shoots without looking at the screen"
                  >
                    <Radio size={14} /> Solo Mode: {soloMode ? 'ON' : 'OFF'}
                  </button>

                  {captured && (
                    <div className="flex items-center gap-2">
                      <span className="rounded-xl bg-[#22c55e]/15 px-3 py-2 text-xs font-bold text-[#22c55e]">
                        {autoCapturedNotice ? '⚡ Auto-Captured!' : '✓ Snapshot Saved!'}
                      </span>
                      <Link
                        href="/gallery"
                        className="flex items-center gap-1.5 rounded-xl bg-[#d9ff5b]/15 px-3 py-2 text-xs font-bold text-[#d9ff5b] transition hover:bg-[#d9ff5b]/25"
                      >
                        Gallery <ArrowRight size={13} />
                      </Link>
                    </div>
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

                  {/* Mirror Selfie Flip Toggle Button */}
                  <button
                    onClick={() => setIsMirrored(!isMirrored)}
                    className={`flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-semibold transition ${
                      isMirrored
                        ? 'border-[#38bdf8]/40 bg-[#38bdf8]/15 text-[#38bdf8]'
                        : 'border-white/10 text-[#697579] hover:text-white'
                    }`}
                    title="Toggle Natural Mirror View (Flips video horizontally like a mirror)"
                  >
                    <FlipHorizontal size={14} /> Mirror: {isMirrored ? 'ON' : 'OFF'}
                  </button>

                  <button
                    onClick={() => setVoice(!voice)}
                    className={`flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs transition ${
                      voice ? 'border-[#10b981]/30 bg-[#10b981]/10 text-[#10b981]' : 'border-white/10 text-[#697579]'
                    }`}
                  >
                    {voice ? <Volume2 size={14} /> : <Mic2 size={14} />} Voice
                  </button>

                  {/* Voice Language Toggle (Hinglish / English) */}
                  {voice && (
                    <button
                      onClick={() => {
                        const nextLang = voiceLang === 'hinglish' ? 'en' : 'hinglish'
                        setVoiceLang(nextLang)
                        speakFeedback(
                          nextLang === 'hinglish'
                            ? 'Hinglish voice guidance on hai'
                            : 'English voice guidance activated',
                          true
                        )
                      }}
                      className="flex items-center gap-1.5 rounded-xl border border-amber-500/30 bg-amber-500/10 px-2.5 py-2 text-xs font-semibold text-amber-300 transition hover:bg-amber-500/20"
                      title="Switch between Hinglish and English voice guidance"
                    >
                      {voiceLang === 'hinglish' ? '🇮🇳 Hinglish' : '🇬🇧 English'}
                    </button>
                  )}

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
                        borderLeftColor:
                          telemetry.score >= 80 ? '#d9ff5b' : telemetry.score >= 50 ? '#edbb60' : '#ff6868',
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
                        telemetry.score >= 88
                          ? 'text-[#22c55e]'
                          : telemetry.score >= 80
                          ? 'text-[#d9ff5b]'
                          : telemetry.score >= 50
                          ? 'text-[#edbb60]'
                          : 'text-[#ff6868]'
                      }`}
                    >
                      {telemetry.score >= 88
                        ? 'Master Framing (Auto Lock)'
                        : telemetry.score >= 80
                        ? 'Master Composition'
                        : telemetry.score >= 50
                        ? 'Good Alignment'
                        : 'Repositioning Required'}
                    </div>
                    <p className="text-[11px] leading-relaxed text-[#8b999b]">
                      {telemetry.score >= 88
                        ? autoCapture
                          ? soloMode
                            ? 'Loud audio countdown active. Stay still for capture!'
                            : 'Hold steady for 1.5s to trigger auto-shutter capture.'
                          : 'Optimal alignment achieved. Click shutter to capture.'
                        : telemetry.score >= 80
                        ? 'Subject is positioned directly on rule-of-thirds power lines.'
                        : 'Adjust framing towards the golden reticle to increase aesthetic score.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* GEOMETRIC & PHYSICAL SUB-SCORES BREAKDOWN */}
              <div className="rounded-[22px] border border-white/[.1] bg-[#101619] p-5">
                <div className="mb-4 flex items-center justify-between">
                  <span className="text-[10px] uppercase tracking-[.17em] text-[#839094]">
                    Comprehensive Engine (Brain 1)
                  </span>
                  <span className="flex items-center gap-1 text-[10px] text-[#d9ff5b]">
                    <Zap size={12} /> Active
                  </span>
                </div>
                <div className="space-y-3.5">
                  {checks.map((check) => (
                    <div key={check.label}>
                      <div className="mb-1.5 flex justify-between text-[11px]">
                        <span className="text-[#aebbbb]">{check.label}</span>
                        <span
                          className={
                            check.tone === 'amber'
                              ? 'text-[#edbb60]'
                              : check.tone === 'cyan'
                              ? 'text-[#71e3df]'
                              : 'text-[#d9ff5b]'
                          }
                        >
                          {check.value}
                        </span>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-white/[.08]">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${
                            check.tone === 'amber'
                              ? 'bg-[#edbb60]'
                              : check.tone === 'cyan'
                              ? 'bg-[#71e3df]'
                              : 'bg-[#d9ff5b]'
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
                  {soloMode
                    ? getSoloCreatorPrompt(telemetry?.messages?.[0] || 'Stand inside the camera frame.')
                    : telemetry?.messages?.[0] || 'Position subject inside the camera frame.'}
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
                  <div className="text-2xl font-light text-[#d9ff5b]">
                    10.8<span className="text-sm text-[#697579]">ms</span>
                  </div>
                  <div className="mt-1 text-[10px] text-[#697579]">Inference latency</div>
                </div>
                <div>
                  <div className="text-2xl font-light text-white">
                    92.3<span className="text-sm text-[#697579]">FPS</span>
                  </div>
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
                    {captured
                      ? autoCapturedNotice
                        ? '⚡ Auto-captured high-res shot'
                        : 'Manual frame snapshot captured'
                      : cameraActive
                      ? `Live Framing (${PRESETS[preset].badge})`
                      : 'Camera Initializing'}
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
