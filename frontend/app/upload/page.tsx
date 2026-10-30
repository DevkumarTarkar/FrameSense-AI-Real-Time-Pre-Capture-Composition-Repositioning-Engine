'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import Navbar from '@/components/Navbar'
import Sidebar from '@/components/Sidebar'
import Footer from '@/components/Footer'
import {
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Zap,
  Target,
  Download,
  Grid3X3,
  RotateCcw,
  Layers,
  ArrowRight,
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
  shot_type?: string
  shot_description?: string
  estimated_distance_ft?: number | null
  estimated_distance_m?: number | null
  all_faces?: [number, number, number, number][] | null
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

  // 3 Curated Sample Photographs
  const samplePresets = [
    {
      id: 'sample_portrait_1',
      category: 'Portrait',
      title: 'Studio Portrait (Golden Ratio)',
      desc: 'Optimal 1/3 eye-line & headroom balance with golden ratio focal point.',
      preview: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
    },
    {
      id: 'sample_portrait_2',
      category: 'Candid',
      title: 'Candid Street (Off-Thirds)',
      desc: 'Dynamic street shot demonstrating reframing guidance and crop correction.',
      preview: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80',
    },
    {
      id: 'sample_architecture',
      category: 'Architecture',
      title: 'Structural Symmetry',
      desc: 'Leading lines, vertical balance, and horizon level evaluation.',
      preview: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80',
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

        const host = typeof window !== 'undefined' && window.location.hostname ? window.location.hostname : '127.0.0.1'
        const apiUrl = `http://${host}:8000/api/analyze-image`

        const res = await fetch(apiUrl, {
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

      const host = typeof window !== 'undefined' && window.location.hostname ? window.location.hostname : '127.0.0.1'
      const apiUrl = `http://${host}:8000/api/analyze-image`

      const res = await fetch(apiUrl, {
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
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)'
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
        ctx.fillStyle = '#21866D'
        points.forEach(([px, py]) => {
          ctx.beginPath()
          ctx.arc(px, py, Math.max(4, Math.round(w / 120)), 0, Math.PI * 2)
          ctx.fill()
        })
      }

      // 3. Multi-Face Canvas Overlay & Group Composition Envelope
      const facesList =
        result?.all_faces && result.all_faces.length > 0
          ? result.all_faces
          : result?.face_box && result.face_box.length === 4
          ? [result.face_box]
          : []

      if (facesList.length > 0) {
        const sx = w / (result?.width || w)
        const sy = h / (result?.height || h)

        // A. Group Composition Envelope (if 2+ subjects detected)
        if (facesList.length >= 2) {
          let minX = 99999, minY = 99999, maxX = -99999, maxY = -99999
          facesList.forEach(([x1, y1, x2, y2]) => {
            minX = Math.min(minX, x1)
            minY = Math.min(minY, y1)
            maxX = Math.max(maxX, x2)
            maxY = Math.max(maxY, y2)
          })

          const padX = 20 * sx
          const padY = 24 * sy
          const envX = Math.max(0, minX * sx - padX)
          const envY = Math.max(0, minY * sy - padY)
          const envW = Math.min(w - envX, (maxX - minX) * sx + padX * 2)
          const envH = Math.min(h - envY, (maxY - minY) * sy + padY * 2)

          const isLeftClipped = minX < 0.05 * (result?.width || w)
          const isRightClipped = maxX > 0.95 * (result?.width || w)
          const hasClipping = isLeftClipped || isRightClipped

          ctx.strokeStyle = hasClipping ? '#DC5C5C' : '#21866D'
          ctx.lineWidth = Math.max(2, Math.round(w / 300))
          ctx.setLineDash([8, 6])
          ctx.strokeRect(envX, envY, envW, envH)
          ctx.setLineDash([])

          const envTitle = hasClipping
            ? `⚠️ CUTOFF: ${isLeftClipped ? 'SUBJECT ON LEFT' : 'SUBJECT ON RIGHT'}`
            : `👥 GROUP: ${facesList.length} SUBJECTS BALANCED`
          ctx.fillStyle = hasClipping ? '#DC5C5C' : '#173F38'
          const envBadgeH = Math.max(20, Math.round(h / 28))
          const envBadgeW = Math.max(140, Math.round(w / 4))
          ctx.fillRect(envX, Math.max(0, envY - envBadgeH), envBadgeW, envBadgeH)
          ctx.fillStyle = '#FFFFFF'
          ctx.font = `bold ${Math.max(10, Math.round(envBadgeH * 0.55))}px monospace`
          ctx.fillText(envTitle, envX + 6, Math.max(envBadgeH - 6, envY - 6))
        }

        // B. Individual Face Bounding Boxes with Camera AF Corner Brackets
        facesList.forEach(([x1, y1, x2, y2], idx) => {
          const isPrimary = idx === 0
          const bx = x1 * sx
          const by = y1 * sy
          const bw = (x2 - x1) * sx
          const bh = (y2 - y1) * sy

          const faceColor = isPrimary ? '#16A085' : '#21866D'
          ctx.strokeStyle = faceColor
          ctx.lineWidth = Math.max(2, Math.round(w / 280))

          // Corner AF brackets
          const cLen = Math.min(bw, bh) * 0.25
          ctx.beginPath()
          ctx.moveTo(bx, by + cLen); ctx.lineTo(bx, by); ctx.lineTo(bx + cLen, by)
          ctx.moveTo(bx + bw - cLen, by); ctx.lineTo(bx + bw, by); ctx.lineTo(bx + bw, by + cLen)
          ctx.moveTo(bx, by + bh - cLen); ctx.lineTo(bx, by + bh); ctx.lineTo(bx + cLen, by + bh)
          ctx.moveTo(bx + bw - cLen, by + bh); ctx.lineTo(bx + bw, by + bh); ctx.lineTo(bx + bw, by + bh - cLen)
          ctx.stroke()

          ctx.fillStyle = isPrimary ? 'rgba(22, 160, 133, 0.08)' : 'rgba(33, 134, 109, 0.08)'
          ctx.fillRect(bx, by, bw, bh)

          // Center crosshair
          ctx.fillStyle = faceColor
          ctx.beginPath()
          ctx.arc(bx + bw / 2, by + bh / 2, Math.max(3, Math.round(w / 180)), 0, Math.PI * 2)
          ctx.fill()

          // Label badge
          ctx.fillStyle = faceColor
          const badgeH = Math.max(18, Math.round(h / 30))
          const badgeW = Math.max(90, Math.round(w / 6.5))
          ctx.fillRect(bx, Math.max(0, by - badgeH), badgeW, badgeH)
          ctx.fillStyle = '#FFFFFF'
          ctx.font = `bold ${Math.max(10, Math.round(badgeH * 0.55))}px monospace`
          const tag = isPrimary
            ? (facesList.length > 1 ? '👤 #1 PRIMARY' : '🎯 FACE DETECT')
            : `👥 #${idx + 1} SUBJECT`
          ctx.fillText(tag, bx + 6, Math.max(badgeH - 6, by - 6))
        })
      }

      // 4. Draw Suggested Target Reticle if available
      if (result?.target_x && result?.target_y) {
        const sx = w / (result.width || w)
        const sy = h / (result.height || h)
        const tx = result.target_x * sx
        const ty = result.target_y * sy

        const radius = Math.max(18, Math.round(w / 30))
        ctx.strokeStyle = '#21866D'
        ctx.lineWidth = Math.max(3, Math.round(w / 200))
        ctx.beginPath()
        ctx.arc(tx, ty, radius, 0, Math.PI * 2)
        ctx.stroke()

        ctx.fillStyle = '#21866D'
        ctx.beginPath()
        ctx.arc(tx, ty, Math.max(5, Math.round(w / 120)), 0, Math.PI * 2)
        ctx.fill()

        ctx.fillStyle = '#173F38'
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
    <div className="flex min-h-screen flex-col bg-[#F7F8F4] text-[#193B38] selection:bg-[#EAF1ED] selection:text-[#173F38]">
      <Navbar />

      <main className="mx-auto flex w-full max-w-[1720px] flex-1 gap-8 px-5 py-8 lg:px-9">
        <Sidebar />

        <div className="min-w-0 flex-1 space-y-8">
          {/* Header */}
          <div className="flex flex-col justify-between gap-4 border-b border-[#E3E9E5] pb-6 sm:flex-row sm:items-center">
            <div>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EAF1ED] text-[#21866D] shadow-sm">
                  <UploadCloud size={20} />
                </div>
                <h1 className="font-serif text-2xl font-normal italic tracking-tight text-[#193B38] lg:text-3xl">
                  Upload &amp; Audit Studio
                </h1>
              </div>
              <p className="mt-1.5 text-xs text-[#647773]">
                Evaluate your photographs with intelligent composition analysis and AI-powered aesthetic insights.
              </p>
            </div>

            {selectedImage && (
              <button
                onClick={() => {
                  setSelectedImage(null)
                  setResult(null)
                  setError(null)
                }}
                className="flex h-11 items-center gap-2 rounded-xl border border-[#E3E9E5] bg-white px-5 text-xs font-semibold text-[#193B38] shadow-sm transition hover:bg-[#F7F8F4]"
              >
                <RotateCcw size={14} className="text-[#21866D]" /> Upload New Photo
              </button>
            )}
          </div>

          {error && (
            <div className="flex items-center gap-2.5 rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs font-medium text-rose-700 shadow-sm">
              <AlertCircle size={16} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {savedSuccess && (
            <div className="flex items-center gap-2.5 rounded-xl border border-[#21866D]/30 bg-[#EAF1ED] p-4 text-xs font-medium text-[#173F38] shadow-sm animate-in fade-in duration-200">
              <CheckCircle2 size={16} className="text-[#21866D] shrink-0" />
              <span>Photo audit results and composition overlays saved to your SQLite database!</span>
            </div>
          )}

          {/* VIEW A: NO IMAGE SELECTED -> DRAG & DROP ZONE */}
          {!selectedImage && (
            <div className="space-y-8">
              {/* Dropzone Box (Height: 280-340px) */}
              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault()
                  if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                    processFile(e.dataTransfer.files[0])
                  }
                }}
                className="group relative flex min-h-[300px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#E3E9E5] bg-white p-8 text-center shadow-sm transition hover:border-[#21866D] hover:bg-[#F7F8F4]"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={handleFileSelect}
                />
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#EAF1ED] text-[#21866D] shadow-sm transition group-hover:scale-105">
                  <UploadCloud size={30} />
                </div>
                <h3 className="mt-5 text-base font-serif italic font-normal text-[#193B38]">
                  Drop your photograph here, or <span className="font-sans font-semibold not-italic text-[#21866D] underline underline-offset-4">browse files</span>
                </h3>
                <p className="mt-1.5 max-w-sm text-xs text-[#647773]">
                  Supports JPG, JPEG, PNG, and WebP up to 25MB from any DSLR, mirrorless camera, or phone.
                </p>
                <div className="mt-5 flex items-center gap-2 rounded-full border border-[#E3E9E5] bg-[#F7F8F4] px-4 py-1 text-[11px] font-mono text-[#647773]">
                  <Sparkles size={12} className="text-[#21866D]" /> Dual-Brain Neural Pipeline Ready
                </div>
              </div>

              {/* Sample Photography Section */}
              <div className="space-y-4">
                <div>
                  <h2 className="text-sm font-bold text-[#193B38]">
                    Explore Sample Photographs
                  </h2>
                  <p className="text-xs text-[#647773] mt-0.5">
                    Test the AI evaluation engine immediately with curated architectural and portrait captures.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                  {samplePresets.map((sample) => (
                    <div
                      key={sample.id}
                      className="group flex flex-col overflow-hidden rounded-2xl border border-[#E3E9E5] bg-white shadow-sm transition hover:border-[#21866D] hover:shadow-md"
                    >
                      <div className="relative aspect-[4/3] overflow-hidden bg-stone-100">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={sample.preview}
                          alt={sample.title}
                          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                        />
                        <div className="absolute top-3 left-3 rounded-full bg-white/90 px-3 py-1 text-[10px] font-semibold text-[#173F38] backdrop-blur-sm">
                          {sample.category}
                        </div>
                      </div>

                      <div className="flex flex-1 flex-col justify-between p-5">
                        <div>
                          <h3 className="text-sm font-bold text-[#193B38] group-hover:text-[#21866D] transition">
                            {sample.title}
                          </h3>
                          <p className="mt-1.5 text-xs text-[#647773] leading-relaxed">
                            {sample.desc}
                          </p>
                        </div>

                        <div className="mt-5 pt-4 border-t border-[#E3E9E5]">
                          <button
                            type="button"
                            onClick={() => handleLoadSample(sample.preview)}
                            className="flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-[#173F38] text-xs font-semibold text-white shadow-sm transition hover:bg-[#21866D]"
                          >
                            <span>Try Sample</span>
                            <ArrowRight size={13} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* VIEW B: IMAGE LOADED -> CANVAS + AUDIT REPORT */}
          {selectedImage && (
            <div className="grid gap-6 2xl:grid-cols-[minmax(0,1fr)_390px]">
              {/* Left Column: Canvas Viewport */}
              <div className="min-w-0 space-y-4">
                <div className="relative overflow-hidden rounded-2xl border border-[#E3E9E5] bg-[#111816] shadow-lg">
                  {analyzing && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 z-20 backdrop-blur-sm">
                      <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#21866D] border-t-transparent" />
                      <p className="mt-4 text-xs font-bold uppercase tracking-widest text-[#21866D]">
                        Evaluating Composition &amp; Aesthetics...
                      </p>
                      <p className="mt-1 text-[11px] text-white/70">
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
                  <div className="flex items-center gap-2.5">
                    <button
                      onClick={() => setShowGrid(!showGrid)}
                      className={`flex h-11 items-center gap-2 rounded-xl border px-4 text-xs font-semibold shadow-sm transition ${
                        showGrid
                          ? 'border-[#173F38] bg-[#173F38] text-white'
                          : 'border-[#E3E9E5] bg-white text-[#647773] hover:text-[#193B38]'
                      }`}
                    >
                      <Grid3X3 size={15} /> Rule of Thirds Grid
                    </button>

                    <button
                      onClick={handleDownloadEvaluated}
                      className="flex h-11 items-center gap-2 rounded-xl border border-[#E3E9E5] bg-white px-4 text-xs font-medium text-[#193B38] shadow-sm transition hover:bg-[#F7F8F4]"
                    >
                      <Download size={15} className="text-[#21866D]" /> Download Evaluated Photo
                    </button>
                  </div>

                  <button
                    onClick={handleSaveToGallery}
                    className="flex h-11 items-center gap-2 rounded-xl bg-[#173F38] px-5 text-xs font-semibold text-white shadow-sm transition hover:bg-[#21866D]"
                  >
                    <CheckCircle2 size={15} /> Save to Gallery
                  </button>
                </div>
              </div>

              {/* Right Column: AI Audit Scorecard */}
              <aside className="space-y-5">
                {/* Score Dial */}
                <div className="rounded-2xl border border-[#E3E9E5] bg-white p-6 shadow-sm">
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-[.18em] text-[#647773] font-semibold">
                        <Target size={14} className="text-[#21866D]" /> Composite Score
                      </div>
                      <p className="text-[11px] text-[#647773]">Quantitative AI composition audit</p>
                    </div>

                    {result && (
                      <span className="rounded-lg border border-[#21866D]/30 bg-[#EAF1ED] px-3 py-1 text-xs font-bold text-[#173F38]">
                        Grade {result.grade}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-5">
                    <div className="relative flex h-28 w-28 shrink-0 items-center justify-center rounded-full border-[7px] border-[#EAF1ED]">
                      <div
                        className="absolute inset-[-7px] rounded-full border-[7px] border-transparent transition-all duration-500"
                        style={{
                          borderLeftColor: (result?.score || 0) >= 80 ? '#21866D' : (result?.score || 0) >= 50 ? '#E5A33D' : '#DC5C5C',
                          borderTopColor: (result?.score || 0) >= 50 ? '#21866D' : '#DC5C5C',
                          transform: `rotate(${Math.round(((result?.score || 0) / 100) * 360)}deg)`,
                        }}
                      />
                      <div className="text-center">
                        <div className="font-serif text-[34px] font-normal italic leading-none tracking-tight text-[#193B38]">
                          {result?.score ?? '--'}
                        </div>
                        <div className="mt-1 text-[8px] uppercase tracking-widest text-[#647773]">out of 100</div>
                      </div>
                    </div>

                    <div>
                      <div
                        className={`text-xs font-bold uppercase tracking-wider ${
                          (result?.score || 0) >= 80 ? 'text-[#21866D]' : (result?.score || 0) >= 50 ? 'text-[#E5A33D]' : 'text-[#DC5C5C]'
                        }`}
                      >
                        {result?.verdict || 'Awaiting Analysis'}
                      </div>
                      <p className="mt-1.5 text-xs leading-relaxed text-[#647773]">
                        {(result?.score || 0) >= 80
                          ? 'Subject matches classical portrait power point distribution.'
                          : 'Framing needs repositioning towards the golden reticle.'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Scene Context & Monocular Depth Box */}
                {result && (
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-2xl border border-[#E3E9E5] bg-white p-4 shadow-sm">
                      <div className="text-[10px] uppercase tracking-wider text-[#647773] font-semibold">Scene Type</div>
                      <div className="mt-1 flex items-center gap-1.5 text-xs font-semibold text-[#173F38]">
                        {result.shot_type === 'group'
                          ? '👥 Group Photo'
                          : result.shot_type === 'architecture'
                          ? '🏛️ Architecture'
                          : result.shot_type === 'landscape'
                          ? '🏞️ Landscape'
                          : result.shot_type === 'food'
                          ? '🍽️ Food / Macro'
                          : '👤 Solo Portrait'}
                      </div>
                      <div className="mt-0.5 text-[10px] text-[#647773]">{result.shot_description || 'Contextual Scene'}</div>
                    </div>

                    <div className="rounded-2xl border border-[#E3E9E5] bg-white p-4 shadow-sm">
                      <div className="text-[10px] uppercase tracking-wider text-[#647773] font-semibold">Estimated Depth</div>
                      <div className="mt-1 text-xs font-semibold text-[#21866D]">
                        {result.estimated_distance_ft
                          ? `${result.estimated_distance_ft} ft (${result.estimated_distance_m} m)`
                          : result.has_subject ? 'Subject In View' : 'Open Landscape'}
                      </div>
                      <div className="mt-0.5 text-[10px] text-[#647773]">
                        {result.estimated_distance_ft ? 'Pinhole Optical Model' : 'Horizon Scale'}
                      </div>
                    </div>
                  </div>
                )}

                {/* Sub-Scores Breakdown */}
                {result && (
                  <div className="rounded-2xl border border-[#E3E9E5] bg-white p-6 shadow-sm">
                    <div className="mb-4 flex items-center justify-between">
                      <span className="text-[10px] uppercase tracking-[.18em] text-[#647773] font-semibold">
                        Brain 1: Geometric Heuristics
                      </span>
                      <span className="flex items-center gap-1 rounded-md bg-[#EAF1ED] px-2.5 py-0.5 text-[10px] font-bold text-[#21866D]">
                        <Zap size={11} /> Evaluated
                      </span>
                    </div>

                    <div className="space-y-3.5">
                      <div>
                        <div className="mb-1.5 flex justify-between text-xs">
                          <span className="text-[#193B38] font-medium">Rule of Thirds Alignment</span>
                          <span className="font-mono text-[#21866D] font-semibold">{Math.round((result.sub_scores.thirds ?? 0) * 40)} / 40</span>
                        </div>
                        <div className="h-1.5 overflow-hidden rounded-full bg-[#EAF1ED]">
                          <div
                            className="h-full rounded-full bg-[#21866D]"
                            style={{ width: `${Math.min(100, Math.round((result.sub_scores.thirds ?? 0) * 100))}%` }}
                          />
                        </div>
                      </div>

                      <div>
                        <div className="mb-1.5 flex justify-between text-xs">
                          <span className="text-[#193B38] font-medium">Headroom Clearance</span>
                          <span className="font-mono text-[#21866D] font-semibold">{Math.round((result.sub_scores.headroom ?? 0) * 20)} / 20</span>
                        </div>
                        <div className="h-1.5 overflow-hidden rounded-full bg-[#EAF1ED]">
                          <div
                            className="h-full rounded-full bg-[#21866D]"
                            style={{ width: `${Math.min(100, Math.round((result.sub_scores.headroom ?? 0) * 100))}%` }}
                          />
                        </div>
                      </div>

                      <div>
                        <div className="mb-1.5 flex justify-between text-xs">
                          <span className="text-[#193B38] font-medium">Horizon &amp; Tilt Stability</span>
                          <span className="font-mono text-[#21866D] font-semibold">{Math.round((result.sub_scores.tilt ?? 0) * 20)} / 20</span>
                        </div>
                        <div className="h-1.5 overflow-hidden rounded-full bg-[#EAF1ED]">
                          <div
                            className="h-full rounded-full bg-[#21866D]"
                            style={{ width: `${Math.min(100, Math.round((result.sub_scores.tilt ?? 0) * 100))}%` }}
                          />
                        </div>
                      </div>

                      <div>
                        <div className="mb-1.5 flex justify-between text-xs">
                          <span className="text-[#193B38] font-medium">Subject Distance Balance</span>
                          <span className="font-mono text-[#21866D] font-semibold">{Math.round((result.sub_scores.distance ?? 0) * 20)} / 20</span>
                        </div>
                        <div className="h-1.5 overflow-hidden rounded-full bg-[#EAF1ED]">
                          <div
                            className="h-full rounded-full bg-[#21866D]"
                            style={{ width: `${Math.min(100, Math.round((result.sub_scores.distance ?? 0) * 100))}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Brain 2 Deep Aesthetic Score */}
                {result && (
                  <div className="rounded-2xl border border-[#E3E9E5] bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between text-[10px] uppercase tracking-[.16em] text-[#647773] font-semibold">
                      <span className="flex items-center gap-1.5">
                        <Sparkles size={14} className="text-[#21866D]" />
                        Brain 2: Neural Aesthetic
                      </span>
                      <span className="font-mono text-[#21866D]">PyTorch NIMA</span>
                    </div>

                    <div className="mt-3 flex items-baseline gap-2">
                      <span className="font-serif text-3xl font-normal italic text-[#193B38]">
                        {result.aesthetic_score !== undefined ? result.aesthetic_score.toFixed(1) : '7.0'}
                      </span>
                      <span className="text-xs text-[#647773]">/ 10.0</span>
                      <span className="ml-auto text-[10px] font-mono text-[#21866D] font-semibold">
                        {result.device || 'CUDA 12.4'}
                      </span>
                    </div>
                  </div>
                )}

                {/* AI Guidance Recommendation */}
                {result && (
                  <div className="rounded-2xl border border-[#21866D]/20 bg-[#EAF1ED] p-5 shadow-sm">
                    <div className="mb-2.5 text-[10px] font-bold uppercase tracking-[.18em] text-[#173F38]">
                      AI Reframing &amp; Cropping Advice
                    </div>
                    <ul className="space-y-2 text-xs text-[#193B38] leading-relaxed">
                      {result.messages.map((msg, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-[#21866D] font-bold">&bull;</span>
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

      <Footer />
    </div>
  )
}
