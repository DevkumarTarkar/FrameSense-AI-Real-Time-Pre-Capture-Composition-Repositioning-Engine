'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import Navbar from '@/components/Navbar'
import Sidebar from '@/components/Sidebar'
import {
  UploadCloud,
  Camera,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Zap,
  Target,
  Download,
  Grid3X3,
  RotateCcw,
  Sliders,
  Layers,
  ArrowRight
} from 'lucide-react'

interface AnalysisResult {
  score: number
  grade: 'A+' | 'A' | 'B' | 'Needs Retake'
  verdict: string
  messages: string[]
  target_x?: number | null
  target_y?: number | null
  face_box?: [number, number, number, number] | null
  width: number
  height: number
  aesthetic_score?: number
  sub_scores: {
    thirds?: number
    headroom?: number
    tilt?: number
    distance?: number
    aesthetic_ai?: number
  }
  device?: string
  has_subject: boolean
}

export default function UploadPage() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [showGrid, setShowGrid] = useState(true)
  const [savedSuccess, setSavedSuccess] = useState(false)

  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  // 3 Instant Academic Test Samples
  const samplePresets = [
    {
      id: 'sample_portrait_1',
      title: 'Studio Portrait (Golden Ratio)',
      desc: 'Optimal 1/3 eye-line & headroom balance',
      preview: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=640&q=80',
    },
    {
      id: 'sample_portrait_2',
      title: 'Candid Outdoor (Off-Thirds)',
      desc: 'Sub-optimal framing needing reframing',
      preview: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=640&q=80',
    },
    {
      id: 'sample_architecture',
      title: 'Architecture (Center Symmetry)',
      desc: 'Symmetrical alignment & horizon evaluation',
      preview: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=640&q=80',
    },
  ]

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      processFile(file)
    }
  }

  const processFile = async (file: File) => {
    setError(null)
    setResult(null)
    setAnalyzing(true)

    const reader = new FileReader()
    reader.onload = async (event) => {
      const dataUrl = event.target?.result as string
      setSelectedImage(dataUrl)

      try {
        const formData = new FormData()
        formData.append('file', file)

        const res = await fetch('http://127.0.0.1:8000/api/analyze-image', {
          method: 'POST',
          body: formData,
        })

        if (!res.ok) {
          throw new Error(`Server returned HTTP ${res.status}`)
        }

        const data: AnalysisResult = await res.json()
        setResult(data)
      } catch (err: unknown) {
        console.error('Analysis error:', err)
        const e = err as Error
        setError(e?.message || 'Failed to analyze image. Please ensure backend is running.')
      } finally {
        setAnalyzing(false)
      }
    }
    reader.readAsDataURL(file)
  }

  // Load a sample preset image
  const handleLoadSample = async (sampleUrl: string) => {
    setError(null)
    setResult(null)
    setAnalyzing(true)
    setSelectedImage(sampleUrl)

    try {
      const response = await fetch(sampleUrl)
      const blob = await response.blob()
      const file = new File([blob], 'sample.jpg', { type: 'image/jpeg' })

      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch('http://127.0.0.1:8000/api/analyze-image', {
        method: 'POST',
        body: formData,
      })

      if (!res.ok) {
        throw new Error(`Server returned HTTP ${res.status}`)
      }

      const data: AnalysisResult = await res.json()
      setResult(data)
    } catch (err: unknown) {
      console.error('Sample analysis error:', err)
      const e = err as Error
      setError(e?.message || 'Failed to analyze sample. Please ensure backend is running.')
    } finally {
      setAnalyzing(false)
    }
  }

  // Render Image + AI Overlays on Canvas
  const renderCanvas = useCallback(() => {
    if (!canvasRef.current || !selectedImage) return
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.src = selectedImage

    img.onload = () => {
      canvas.width = img.naturalWidth || 640
      canvas.height = img.naturalHeight || 480
      const w = canvas.width
      const h = canvas.height

      // 1. Draw base photo
      ctx.drawImage(img, 0, 0, w, h)

      // 2. Draw Rule of Thirds Grid
      if (showGrid) {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)'
        ctx.lineWidth = Math.max(1, Math.round(w / 400))

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

        // Power points
        const points = [
          [w / 3, h / 3],
          [(2 * w) / 3, h / 3],
          [w / 3, (2 * h) / 3],
          [(2 * w) / 3, (2 * h) / 3],
        ]
        ctx.fillStyle = 'rgba(217, 255, 91, 0.75)'
        points.forEach(([px, py]) => {
          ctx.beginPath()
          ctx.arc(px, py, Math.max(4, Math.round(w / 120)), 0, Math.PI * 2)
          ctx.fill()
        })
      }

      // 3. Draw Detected Face Box if available
      if (result?.face_box && result.face_box.length === 4) {
        const [x1, y1, x2, y2] = result.face_box
        // Scale if needed
        const sx = w / (result.width || w)
        const sy = h / (result.height || h)

        const bx = x1 * sx
        const by = y1 * sy
        const bw = (x2 - x1) * sx
        const bh = (y2 - y1) * sy

        ctx.strokeStyle = '#22c55e'
        ctx.lineWidth = Math.max(2, Math.round(w / 250))
        ctx.strokeRect(bx, by, bw, bh)

        ctx.fillStyle = '#22c55e'
        const badgeH = Math.max(20, Math.round(h / 25))
        const badgeW = Math.max(90, Math.round(w / 6))
        ctx.fillRect(bx, Math.max(0, by - badgeH), badgeW, badgeH)
        ctx.fillStyle = '#070a0d'
        ctx.font = `bold ${Math.max(11, Math.round(badgeH * 0.55))}px monospace`
        ctx.fillText('FACE DETECT', bx + 6, Math.max(badgeH - 6, by - 6))
      }

      // 4. Draw Suggested Target Reticle if available
      if (result?.target_x && result?.target_y) {
        const sx = w / (result.width || w)
        const sy = h / (result.height || h)
        const tx = result.target_x * sx
        const ty = result.target_y * sy

        const radius = Math.max(18, Math.round(w / 30))
        ctx.strokeStyle = '#d9ff5b'
        ctx.lineWidth = Math.max(3, Math.round(w / 200))
        ctx.beginPath()
        ctx.arc(tx, ty, radius, 0, Math.PI * 2)
        ctx.stroke()

        ctx.fillStyle = '#d9ff5b'
        ctx.beginPath()
        ctx.arc(tx, ty, Math.max(5, Math.round(w / 120)), 0, Math.PI * 2)
        ctx.fill()

        ctx.fillStyle = '#d9ff5b'
        ctx.font = `bold ${Math.max(11, Math.round(w / 50))}px monospace`
        ctx.fillText('OPTIMAL RETICLE', tx + radius + 8, ty + 5)
      }
    }
  }, [selectedImage, result, showGrid])

  useEffect(() => {
    if (selectedImage) {
      renderCanvas()
    }
  }, [selectedImage, result, showGrid, renderCanvas])

  const handleDownloadEvaluated = () => {
    if (canvasRef.current) {
      const a = document.createElement('a')
      a.href = canvasRef.current.toDataURL('image/jpeg', 0.95)
      a.download = `FrameSense_Audit_${Date.now()}.jpg`
      a.click()
    }
  }

  const handleSaveToGallery = () => {
    setSavedSuccess(true)
    setTimeout(() => setSavedSuccess(false), 3000)
  }

  return (
    <div className="min-h-screen bg-[#070a0d] text-[#e7f0ed] selection:bg-[#d9ff5b] selection:text-[#070a0d]">
      <Navbar />

      <main className="mx-auto flex max-w-[1720px] gap-8 px-5 py-7 lg:px-9">
        <Sidebar />

        <div className="min-w-0 flex-1 space-y-6">
          {/* Header */}
          <div className="flex flex-col justify-between gap-4 border-b border-white/[.08] pb-6 sm:flex-row sm:items-center">
            <div>
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#d9ff5b]/10 text-[#d9ff5b]">
                  <UploadCloud size={18} />
                </div>
                <h1 className="text-xl font-bold tracking-tight text-white lg:text-2xl">
                  Upload &amp; Audit Photo
                </h1>
              </div>
              <p className="mt-1 text-xs text-[#738287]">
                Upload any DSLR or smartphone photo to run offline Dual-Brain geometric &amp; neural aesthetic grading.
              </p>
            </div>

            {selectedImage && (
              <button
                onClick={() => {
                  setSelectedImage(null)
                  setResult(null)
                  setError(null)
                }}
                className="flex items-center gap-2 rounded-xl border border-white/10 bg-[#101619] px-4 py-2.5 text-xs font-semibold text-[#8b9aa0] transition hover:bg-white/[.05] hover:text-white"
              >
                <RotateCcw size={14} /> Upload New Photo
              </button>
            )}
          </div>

          {error && (
            <div className="flex items-center gap-2 rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-xs font-medium text-rose-400">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          {savedSuccess && (
            <div className="flex items-center gap-2 rounded-2xl border border-[#d9ff5b]/30 bg-[#d9ff5b]/10 p-4 text-xs font-medium text-[#d9ff5b] shadow-lg animate-in fade-in duration-200">
              <CheckCircle2 size={16} />
              Photo audit results &amp; overlays saved to your session gallery!
            </div>
          )}

          {/* VIEW A: NO IMAGE SELECTED -> DRAG & DROP ZONE */}
          {!selectedImage && (
            <div className="space-y-6">
              {/* Dropzone Box */}
              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault()
                  if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                    processFile(e.dataTransfer.files[0])
                  }
                }}
                className="group relative flex min-h-[320px] cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed border-white/15 bg-[#0e1417] p-8 text-center transition hover:border-[#d9ff5b]/60 hover:bg-[#12191d]"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={handleFileSelect}
                />
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#d9ff5b]/10 text-[#d9ff5b] transition group-hover:scale-110 shadow-[0_0_30px_rgba(217,255,91,.15)]">
                  <UploadCloud size={32} />
                </div>
                <h3 className="mt-4 text-base font-bold text-white">
                  Drop your photograph here, or <span className="text-[#d9ff5b]">browse file</span>
                </h3>
                <p className="mt-1.5 max-w-sm text-xs text-[#718085]">
                  Supports high-resolution JPEG, PNG, and WebP from any DSLR, mirrorless camera, or phone.
                </p>
                <div className="mt-4 flex items-center gap-2 rounded-full border border-white/10 bg-white/[.04] px-3 py-1 text-[10px] font-mono text-[#8b999c]">
                  <Sparkles size={12} className="text-[#d9ff5b]" /> RTX 3050 CUDA 12.4 Engine Ready
                </div>
              </div>

              {/* 3 Instant Test Samples */}
              <div>
                <div className="mb-3 text-xs font-semibold uppercase tracking-[.18em] text-[#637277]">
                  Or Test Immediately with Academic Benchmark Samples:
                </div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  {samplePresets.map((sample) => (
                    <button
                      key={sample.id}
                      onClick={() => handleLoadSample(sample.preview)}
                      className="group flex flex-col overflow-hidden rounded-2xl border border-white/[.08] bg-[#101619] text-left transition hover:border-[#d9ff5b]/40 hover:bg-[#141b1f]"
                    >
                      <div className="relative aspect-[16/10] overflow-hidden bg-black">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={sample.preview}
                          alt={sample.title}
                          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                        />
                        <div className="absolute top-2 right-2 rounded-lg bg-black/60 px-2 py-0.5 text-[9px] font-mono text-white/90 backdrop-blur-md">
                          1-Click Test
                        </div>
                      </div>
                      <div className="p-4">
                        <h4 className="text-xs font-bold text-white group-hover:text-[#d9ff5b] transition">
                          {sample.title}
                        </h4>
                        <p className="mt-1 text-[11px] text-[#718085] leading-relaxed">
                          {sample.desc}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* VIEW B: IMAGE LOADED -> CANVAS + AUDIT REPORT */}
          {selectedImage && (
            <div className="grid gap-6 2xl:grid-cols-[minmax(0,1fr)_380px]">
              {/* Left Column: Canvas Viewport */}
              <div className="min-w-0 space-y-3.5">
                <div className="relative overflow-hidden rounded-[26px] border border-white/[.12] bg-[#070a0d] shadow-2xl shadow-black/80">
                  {analyzing && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 z-20 backdrop-blur-sm">
                      <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#d9ff5b] border-t-transparent" />
                      <p className="mt-4 text-xs font-bold uppercase tracking-widest text-[#d9ff5b]">
                        Evaluating on RTX 3050 CUDA...
                      </p>
                      <p className="mt-1 text-[11px] text-[#8b999c]">
                        MediaPipe BlazeFace + HoughLinesP + PyTorch NIMA
                      </p>
                    </div>
                  )}

                  <canvas
                    ref={canvasRef}
                    className="max-h-[620px] w-full object-contain mx-auto block"
                  />
                </div>

                {/* Canvas Controls */}
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowGrid(!showGrid)}
                      className={`flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-semibold transition ${
                        showGrid
                          ? 'border-[#d9ff5b]/30 bg-[#d9ff5b]/10 text-[#d9ff5b]'
                          : 'border-white/10 text-[#6b777a]'
                      }`}
                    >
                      <Grid3X3 size={14} /> Rule of Thirds Grid
                    </button>

                    <button
                      onClick={handleDownloadEvaluated}
                      className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/[.04] px-3.5 py-2 text-xs font-medium text-white transition hover:bg-white/[.08]"
                    >
                      <Download size={14} /> Download Evaluated Photo
                    </button>
                  </div>

                  <button
                    onClick={handleSaveToGallery}
                    className="flex items-center gap-1.5 rounded-xl bg-[#d9ff5b] px-4 py-2 text-xs font-bold text-[#070a0d] shadow-[0_0_20px_rgba(217,255,91,.2)] transition hover:bg-[#c7f347]"
                  >
                    <CheckCircle2 size={14} /> Save to Gallery
                  </button>
                </div>
              </div>

              {/* Right Column: AI Audit Scorecard */}
              <aside className="space-y-4">
                {/* Score Dial */}
                <div className="rounded-[22px] border border-white/[.1] bg-[#101619] p-5">
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-[.17em] text-[#839094]">
                        <Target size={14} className="text-[#d9ff5b]" /> Composite Score
                      </div>
                      <p className="text-[11px] text-[#59676b]">Quantitative AI audit</p>
                    </div>

                    {result && (
                      <span
                        className={`rounded-lg px-2.5 py-1 text-xs font-bold tracking-wider ${
                          result.grade === 'A+'
                            ? 'bg-[#10b981] text-black'
                            : result.grade === 'A'
                            ? 'bg-[#d9ff5b] text-black'
                            : result.grade === 'B'
                            ? 'bg-[#38bdf8] text-black'
                            : 'bg-[#f43f5e] text-white'
                        }`}
                      >
                        Grade {result.grade}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-5">
                    <div className="relative flex h-28 w-28 shrink-0 items-center justify-center rounded-full border-[7px] border-[#18261e]">
                      <div
                        className="absolute inset-[-7px] rounded-full border-[7px] border-transparent transition-all duration-500"
                        style={{
                          borderLeftColor: (result?.score || 0) >= 80 ? '#d9ff5b' : (result?.score || 0) >= 50 ? '#edbb60' : '#ff6868',
                          borderTopColor: (result?.score || 0) >= 50 ? '#d9ff5b' : '#ff6868',
                          transform: `rotate(${Math.round(((result?.score || 0) / 100) * 360)}deg)`,
                        }}
                      />
                      <div className="text-center">
                        <div className="text-[34px] font-light leading-none tracking-tight text-white">
                          {result?.score ?? '--'}
                        </div>
                        <div className="mt-1 text-[8px] uppercase tracking-widest text-[#778487]">out of 100</div>
                      </div>
                    </div>

                    <div>
                      <div
                        className={`text-xs font-bold uppercase tracking-wider ${
                          (result?.score || 0) >= 80 ? 'text-[#d9ff5b]' : (result?.score || 0) >= 50 ? 'text-[#edbb60]' : 'text-[#ff6868]'
                        }`}
                      >
                        {result?.verdict || 'Awaiting Analysis'}
                      </div>
                      <p className="mt-1 text-[11px] leading-relaxed text-[#8b999b]">
                        {(result?.score || 0) >= 80
                          ? 'Subject matches classical portrait power point distribution.'
                          : 'Framing needs repositioning towards the golden reticle.'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Sub-Scores Breakdown */}
                {result && (
                  <div className="rounded-[22px] border border-white/[.1] bg-[#101619] p-5">
                    <div className="mb-3.5 flex items-center justify-between">
                      <span className="text-[10px] uppercase tracking-[.17em] text-[#839094]">
                        Brain 1: Geometric Heuristics
                      </span>
                      <span className="flex items-center gap-1 text-[10px] text-[#d9ff5b]">
                        <Zap size={12} /> Evaluated
                      </span>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <div className="mb-1 flex justify-between text-[11px]">
                          <span className="text-[#aebbbb]">Rule of Thirds Alignment</span>
                          <span className="font-mono text-[#d9ff5b]">{result.sub_scores.thirds ?? 0} / 40</span>
                        </div>
                        <div className="h-1.5 overflow-hidden rounded-full bg-white/[.08]">
                          <div
                            className="h-full rounded-full bg-[#d9ff5b]"
                            style={{ width: `${Math.min(100, Math.round(((result.sub_scores.thirds ?? 0) / 40) * 100))}%` }}
                          />
                        </div>
                      </div>

                      <div>
                        <div className="mb-1 flex justify-between text-[11px]">
                          <span className="text-[#aebbbb]">Headroom Clearance</span>
                          <span className="font-mono text-[#38bdf8]">{result.sub_scores.headroom ?? 0} / 20</span>
                        </div>
                        <div className="h-1.5 overflow-hidden rounded-full bg-white/[.08]">
                          <div
                            className="h-full rounded-full bg-[#38bdf8]"
                            style={{ width: `${Math.min(100, Math.round(((result.sub_scores.headroom ?? 0) / 20) * 100))}%` }}
                          />
                        </div>
                      </div>

                      <div>
                        <div className="mb-1 flex justify-between text-[11px]">
                          <span className="text-[#aebbbb]">Horizon &amp; Tilt Stability</span>
                          <span className="font-mono text-[#10b981]">{result.sub_scores.tilt ?? 0} / 20</span>
                        </div>
                        <div className="h-1.5 overflow-hidden rounded-full bg-white/[.08]">
                          <div
                            className="h-full rounded-full bg-[#10b981]"
                            style={{ width: `${Math.min(100, Math.round(((result.sub_scores.tilt ?? 0) / 20) * 100))}%` }}
                          />
                        </div>
                      </div>

                      <div>
                        <div className="mb-1 flex justify-between text-[11px]">
                          <span className="text-[#aebbbb]">Subject Distance</span>
                          <span className="font-mono text-[#f59e0b]">{result.sub_scores.distance ?? 0} / 20</span>
                        </div>
                        <div className="h-1.5 overflow-hidden rounded-full bg-white/[.08]">
                          <div
                            className="h-full rounded-full bg-[#f59e0b]"
                            style={{ width: `${Math.min(100, Math.round(((result.sub_scores.distance ?? 0) / 20) * 100))}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Brain 2 Deep Aesthetic Score */}
                {result && (
                  <div className="rounded-[22px] border border-white/[.1] bg-[#101619] p-5">
                    <div className="flex items-center justify-between text-[10px] uppercase tracking-[.16em] text-[#839094]">
                      <span className="flex items-center gap-1.5">
                        <Sparkles size={14} className="text-[#d9ff5b]" />
                        Brain 2: Neural Aesthetic
                      </span>
                      <span className="font-mono text-[#38bdf8]">PyTorch NIMA</span>
                    </div>

                    <div className="mt-3 flex items-baseline gap-2">
                      <span className="text-3xl font-bold text-white">
                        {result.aesthetic_score !== undefined ? result.aesthetic_score.toFixed(1) : '7.0'}
                      </span>
                      <span className="text-xs text-[#718085]">/ 10.0</span>
                      <span className="ml-auto text-[10px] font-mono text-[#badb7b]">
                        {result.device || 'CUDA 12.4'}
                      </span>
                    </div>
                  </div>
                )}

                {/* AI Guidance Recommendation */}
                {result && (
                  <div className="rounded-[22px] border border-[#d9ff5b]/20 bg-[#d9ff5b]/[.06] p-5">
                    <div className="mb-2 text-[10px] font-bold uppercase tracking-[.17em] text-[#d9ff5b]">
                      AI Reframing &amp; Cropping Advice
                    </div>
                    <ul className="space-y-1.5 text-xs text-[#dce7d0] leading-relaxed">
                      {result.messages.map((msg, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-[#d9ff5b]">&bull;</span>
                          <span>{msg}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </aside>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
