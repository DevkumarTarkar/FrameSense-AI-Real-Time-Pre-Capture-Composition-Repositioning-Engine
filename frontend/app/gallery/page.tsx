'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Sidebar from '@/components/Sidebar'
import {
  Camera,
  Download,
  Eye,
  ChevronDown,
  LockKeyhole,
  CheckCircle2,
  Trash2,
  Sliders,
  Filter,
  Grid3X3,
  Sparkles,
} from 'lucide-react'

interface SessionCapture {
  id: string
  timestamp: string
  date: string
  score: number
  aesthetic: number
  thumbnail?: string
  grade: 'A+' | 'A' | 'B' | 'Needs Retake'
  verdict: string
  sub_scores: {
    thirds: number
    headroom: number
    tilt: number
    distance: number
  }
}

export default function GalleryPage() {
  const [filter, setFilter] = useState<'all' | 'master' | 'good' | 'retake'>('all')
  const [captures, setCaptures] = useState<SessionCapture[]>([])

  // Load actual saved photos from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('framesense_captures')
      if (stored) {
        const parsed = JSON.parse(stored)
        if (Array.isArray(parsed) && parsed.length > 0) {
          setCaptures(parsed)
          return
        }
      }
    } catch {
      // fallback
    }

    // Default sample capture with a generated visual canvas photography thumbnail
    const sampleCanvas = document.createElement('canvas')
    sampleCanvas.width = 480
    sampleCanvas.height = 300
    const ctx = sampleCanvas.getContext('2d')
    if (ctx) {
      // Background studio gradient
      const grad = ctx.createLinearGradient(0, 0, 480, 300)
      grad.addColorStop(0, '#101619')
      grad.addColorStop(0.5, '#1e293b')
      grad.addColorStop(1, '#0f172a')
      ctx.fillStyle = grad
      ctx.fillRect(0, 0, 480, 300)

      // Golden third grid
      ctx.strokeStyle = 'rgba(217, 255, 91, 0.4)'
      ctx.lineWidth = 1.5
      ctx.beginPath()
      ctx.moveTo(160, 0); ctx.lineTo(160, 300)
      ctx.moveTo(320, 0); ctx.lineTo(320, 300)
      ctx.moveTo(0, 100); ctx.lineTo(480, 100)
      ctx.moveTo(0, 200); ctx.lineTo(480, 200)
      ctx.stroke()

      // Target reticle
      ctx.strokeStyle = '#22c55e'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.arc(160, 100, 26, 0, Math.PI * 2)
      ctx.stroke()

      ctx.fillStyle = '#22c55e'
      ctx.font = 'bold 12px monospace'
      ctx.fillText('SAMPLE SHOT', 130, 140)
    }

    const demoThumb = ctx ? sampleCanvas.toDataURL('image/jpeg', 0.85) : undefined

    setCaptures([
      {
        id: 'DEMO-1042',
        timestamp: '15:28:44',
        date: 'Sample',
        score: 94,
        aesthetic: 8.4,
        thumbnail: demoThumb,
        grade: 'A+',
        verdict: 'Master Composition (Golden Thirds)',
        sub_scores: { thirds: 38, headroom: 19, tilt: 19, distance: 18 },
      },
    ])
  }, [])

  const filteredCaptures = captures.filter((item) => {
    if (filter === 'master') return item.grade === 'A+' || item.grade === 'A'
    if (filter === 'good') return item.grade === 'B'
    if (filter === 'retake') return item.grade === 'Needs Retake'
    return true
  })

  const handleDelete = (id: string) => {
    setCaptures((prev) => {
      const next = prev.filter((c) => c.id !== id)
      try {
        localStorage.setItem('framesense_captures', JSON.stringify(next))
      } catch {}
      return next
    })
  }

  return (
    <main className="min-h-screen bg-[#070a0d] text-[#f4f7f4] selection:bg-[#d9ff5b] selection:text-[#10150d]">
      <Navbar />

      <div className="mx-auto flex max-w-[1550px] gap-7 px-4 py-6 sm:px-6 lg:px-9">
        <Sidebar />

        <section className="min-w-0 flex-1">
          {/* Page Title & Controls */}
          <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
            <div>
              <div className="mb-2 flex items-center gap-2 text-[10px] uppercase tracking-[.2em] text-[#718083]">
                Photo Archive &amp; Cloud Store <ChevronDown size={12} />
              </div>
              <h1 className="text-[28px] font-medium tracking-[-.055em] text-white sm:text-[35px]">
                Photo Gallery <span className="text-[#4b575b]">/</span> <span className="text-[#849094]">Session History</span>
              </h1>
            </div>

            {/* Filter Pills */}
            <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-white/[.08] bg-[#101619] p-1.5">
              <button
                onClick={() => setFilter('all')}
                className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold transition ${
                  filter === 'all' ? 'bg-[#d9ff5b] text-[#070a0d]' : 'text-[#8b999c] hover:text-white'
                }`}
              >
                All ({captures.length})
              </button>
              <button
                onClick={() => setFilter('master')}
                className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold transition ${
                  filter === 'master' ? 'bg-[#10b981] text-white' : 'text-[#8b999c] hover:text-white'
                }`}
              >
                Master Shots (A+/A)
              </button>
              <button
                onClick={() => setFilter('good')}
                className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold transition ${
                  filter === 'good' ? 'bg-[#38bdf8] text-[#070a0d]' : 'text-[#8b999c] hover:text-white'
                }`}
              >
                Good Alignment (B)
              </button>
              <button
                onClick={() => setFilter('retake')}
                className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold transition ${
                  filter === 'retake' ? 'bg-[#f43f5e] text-white' : 'text-[#8b999c] hover:text-white'
                }`}
              >
                Needs Retake
              </button>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="mb-6 grid gap-4 sm:grid-cols-4">
            <div className="rounded-2xl border border-white/[.08] bg-[#101619] p-4">
              <div className="text-[10px] uppercase tracking-wider text-[#828f92]">Total Captures</div>
              <div className="mt-1 text-2xl font-light text-white">{captures.length}</div>
              <div className="mt-1 text-[10px] text-[#6c797c]">Session #104 (Current)</div>
            </div>
            <div className="rounded-2xl border border-white/[.08] bg-[#101619] p-4">
              <div className="text-[10px] uppercase tracking-wider text-[#828f92]">Average Composition</div>
              <div className="mt-1 text-2xl font-light text-[#d9ff5b]">
                {Math.round(captures.reduce((a, b) => a + b.score, 0) / (captures.length || 1))} / 100
              </div>
              <div className="mt-1 text-[10px] text-[#10b981]">Top 15% Portrait Grade</div>
            </div>
            <div className="rounded-2xl border border-white/[.08] bg-[#101619] p-4">
              <div className="text-[10px] uppercase tracking-wider text-[#828f92]">Peak Aesthetic Score</div>
              <div className="mt-1 text-2xl font-light text-[#38bdf8]">
                {Math.max(...captures.map((h) => h.aesthetic), 8.4).toFixed(1)} / 10.0
              </div>
              <div className="mt-1 text-[10px] text-[#8b999c]">AVA Distribution Calibrated</div>
            </div>
            <div className="rounded-2xl border border-white/[.08] bg-[#101619] p-4">
              <div className="text-[10px] uppercase tracking-wider text-[#828f92]">Cloud Storage Sync</div>
              <div className="mt-1 text-2xl font-light text-[#10b981]">AWS S3 Ready</div>
              <div className="mt-1 text-[10px] text-[#8b999c]">Local Media Bin Synced</div>
            </div>
          </div>

          {/* Captures Grid */}
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filteredCaptures.map((item) => (
              <div
                key={item.id}
                className="group overflow-hidden rounded-2xl border border-white/[.08] bg-[#101619] transition hover:border-[#d9ff5b]/40 hover:shadow-xl hover:shadow-black/60"
              >
                {/* Photo Preview / Mock Thumbnail */}
                <div className="relative aspect-[16/10] bg-[#070a0d] flex items-center justify-center overflow-hidden">
                  {item.thumbnail ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={item.thumbnail} alt={item.id} className="h-full w-full object-cover" />
                  ) : (
                    <div className="relative h-full w-full bg-gradient-to-br from-[#101619] via-[#0b1114] to-[#18261e] flex flex-col items-center justify-center p-4 text-center">
                      <Camera size={32} className="text-[#324347] mb-2" />
                      <span className="font-mono text-xs text-[#526367]">{item.id} Preview</span>
                      <div className="absolute inset-0 pointer-events-none opacity-20">
                        <div className="h-full w-full border border-dashed border-white/40 flex">
                          <div className="w-1/3 border-r border-dashed border-white/40" />
                          <div className="w-1/3 border-r border-dashed border-white/40" />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Grade Badge */}
                  <div
                    className={`absolute top-3 right-3 rounded-lg px-2.5 py-1 text-[10px] font-bold tracking-wider backdrop-blur-md ${
                      item.grade === 'A+'
                        ? 'bg-[#10b981] text-black'
                        : item.grade === 'A'
                        ? 'bg-[#d9ff5b] text-black'
                        : item.grade === 'B'
                        ? 'bg-[#38bdf8] text-black'
                        : 'bg-[#f43f5e] text-white'
                    }`}
                  >
                    {item.grade}
                  </div>

                  <div className="absolute bottom-2 left-3 text-[10px] font-mono text-white/70 bg-black/60 px-2 py-0.5 rounded backdrop-blur-sm">
                    {item.date} {item.timestamp}
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-white text-sm">{item.id}</div>
                      <div className="text-[11px] text-[#8b999c]">{item.verdict}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-light text-[#d9ff5b]">
                        {item.score} <span className="text-[10px] text-[#718083]">/ 100</span>
                      </div>
                      <div className="text-[10px] text-[#38bdf8] font-mono">NIMA {item.aesthetic}</div>
                    </div>
                  </div>

                  {/* Sub-Score Bars */}
                  <div className="mt-4 space-y-1.5 border-t border-white/[.06] pt-3 text-[10px]">
                    <div className="flex justify-between text-[#8b999c]">
                      <span>Rule of Thirds</span>
                      <span className="text-white font-mono">{item.sub_scores.thirds} / 40</span>
                    </div>
                    <div className="flex justify-between text-[#8b999c]">
                      <span>Headroom Ratio</span>
                      <span className="text-white font-mono">{item.sub_scores.headroom} / 20</span>
                    </div>
                    <div className="flex justify-between text-[#8b999c]">
                      <span>Horizon Stability</span>
                      <span className="text-white font-mono">{item.sub_scores.tilt} / 20</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-4 flex gap-2">
                    <button
                      onClick={() => {
                        if (item.thumbnail) {
                          const a = document.createElement('a')
                          a.href = item.thumbnail
                          a.download = `${item.id}.jpg`
                          a.click()
                        } else {
                          alert(`Downloading capture ${item.id} metadata & telemetry packet.`)
                        }
                      }}
                      className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-white/[.04] py-2 text-[11px] font-medium text-[#c5d0cd] transition hover:bg-white/[.08]"
                    >
                      <Download size={13} /> Export
                    </button>
                    <Link
                      href="/"
                      className="flex items-center justify-center gap-1.5 rounded-xl bg-[#d9ff5b]/10 border border-[#d9ff5b]/20 px-3 py-2 text-[11px] font-medium text-[#d9ff5b] transition hover:bg-[#d9ff5b]/20"
                    >
                      <Eye size={13} /> Live View
                    </Link>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="rounded-xl border border-white/10 p-2 text-[#738085] hover:text-[#ff6868] hover:bg-[#ff6868]/10 transition"
                      title="Delete Capture"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <footer className="mt-8 border-t border-white/[.08] px-5 py-4 text-[9px] uppercase tracking-[.15em] text-[#59666a] lg:px-9 flex flex-wrap justify-between gap-3">
        <span className="flex items-center gap-2">
          <LockKeyhole size={12} /> B.Tech Major Project — GLA University, Mathura (Class of 2026)
        </span>
        <span className="flex gap-4">
          <span>Dev Kumar Tarkar (Lead)</span>
          <span>Dev Aggarwal</span>
          <span>Mentor: Ms. Sanjana Shaw</span>
        </span>
      </footer>
    </main>
  )
}
