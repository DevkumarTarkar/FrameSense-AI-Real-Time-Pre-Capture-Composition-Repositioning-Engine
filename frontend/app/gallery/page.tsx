'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Sidebar from '@/components/Sidebar'
import Footer from '@/components/Footer'
import {
  Camera,
  Download,
  Trash2,
  RefreshCw,
  Database,
  HardDrive,
  Maximize2,
  X,
  ArrowRight,
  Search,
  UploadCloud,
  ArrowUpDown,
  Award,
  Sparkles,
} from 'lucide-react'

interface SessionCapture {
  id: string
  timestamp: string
  date: string
  score: number
  aesthetic: number
  thumbnail?: string
  image_url?: string
  grade: 'A+' | 'A' | 'B' | 'Needs Retake'
  verdict: string
  shot_type?: string
  distance_ft?: number | null
  sub_scores: {
    thirds: number
    headroom: number
    tilt: number
    distance: number
    [key: string]: number | undefined
  }
}

export default function GalleryPage() {
  const [filter, setFilter] = useState<'all' | 'master' | 'good' | 'retake'>('all')
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'highest' | 'lowest'>('newest')
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [captures, setCaptures] = useState<SessionCapture[]>([])
  const [isBackendDb, setIsBackendDb] = useState<boolean>(false)
  const [loading, setLoading] = useState<boolean>(true)
  const [selectedPhoto, setSelectedPhoto] = useState<SessionCapture | null>(null)

  // Fetch captures from SQLite Backend API with LocalStorage fallback
  const fetchCaptures = useCallback(async () => {
    setLoading(true)
    const host = typeof window !== 'undefined' && window.location.hostname ? window.location.hostname : '127.0.0.1'
    const apiUrl = `http://${host}:8000/api/captures`

    try {
      const res = await fetch(apiUrl, { cache: 'no-store' })
      if (res.ok) {
        const data = await res.json()
        if (data.success && Array.isArray(data.captures) && data.captures.length > 0) {
          const mapped: SessionCapture[] = data.captures.map((item: any) => {
            const rawUrl = item.image_url || item.thumbnail || ''
            const fullUrl = rawUrl.startsWith('http') || rawUrl.startsWith('data:')
              ? rawUrl
              : `http://${host}:8000${rawUrl}`
            return {
              id: item.id,
              timestamp: item.timestamp,
              date: item.date,
              score: item.score,
              aesthetic: item.aesthetic,
              thumbnail: fullUrl,
              image_url: fullUrl,
              grade: item.grade as any,
              verdict: item.verdict,
              shot_type: item.shot_type || 'portrait',
              distance_ft: item.distance_ft,
              sub_scores: item.sub_scores || { thirds: 35, headroom: 18, tilt: 18, distance: 18 },
            }
          })
          setCaptures(mapped)
          setIsBackendDb(true)
          setLoading(false)
          return
        }
      }
    } catch {
      // Backend not reachable, fallback
    }

    // Fallback: Check local storage
    try {
      const stored = localStorage.getItem('framesense_captures')
      if (stored) {
        const parsed = JSON.parse(stored)
        if (Array.isArray(parsed) && parsed.length > 0) {
          setCaptures(parsed)
          setIsBackendDb(false)
          setLoading(false)
          return
        }
      }
    } catch {}

    // Default sample capture with soft nature aesthetic
    const sampleCanvas = document.createElement('canvas')
    sampleCanvas.width = 640
    sampleCanvas.height = 480
    const ctx = sampleCanvas.getContext('2d')
    if (ctx) {
      const grad = ctx.createLinearGradient(0, 0, 640, 480)
      grad.addColorStop(0, '#EAF1ED')
      grad.addColorStop(0.5, '#E3E9E5')
      grad.addColorStop(1, '#D2DFD8')
      ctx.fillStyle = grad
      ctx.fillRect(0, 0, 640, 480)

      // Rule of Thirds subtle lines
      ctx.strokeStyle = 'rgba(23, 63, 56, 0.25)'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(213, 0); ctx.lineTo(213, 480)
      ctx.moveTo(426, 0); ctx.lineTo(426, 480)
      ctx.moveTo(0, 160); ctx.lineTo(640, 160)
      ctx.moveTo(0, 320); ctx.lineTo(640, 320)
      ctx.stroke()

      // Target reticle
      ctx.strokeStyle = '#21866D'
      ctx.lineWidth = 2.5
      ctx.beginPath()
      ctx.arc(213, 160, 32, 0, Math.PI * 2)
      ctx.stroke()

      ctx.fillStyle = '#173F38'
      ctx.font = 'italic 16px Georgia, serif'
      ctx.fillText('Sample Composition', 150, 220)
    }

    const demoThumb = ctx ? sampleCanvas.toDataURL('image/jpeg', 0.85) : undefined

    setCaptures([
      {
        id: 'FS-DEMO-SAMPLE',
        timestamp: '15:28:44',
        date: 'Demo',
        score: 94,
        aesthetic: 8.6,
        thumbnail: demoThumb,
        grade: 'A+',
        verdict: 'Master Composition (Golden Thirds)',
        shot_type: 'portrait',
        sub_scores: { thirds: 38, headroom: 19, tilt: 19, distance: 18 },
      },
    ])
    setIsBackendDb(false)
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchCaptures()
  }, [fetchCaptures])

  const filteredAndSortedCaptures = useMemo(() => {
    let result = captures.filter((item) => {
      if (filter === 'master') {
        if (item.grade !== 'A+' && item.grade !== 'A') return false
      } else if (filter === 'good') {
        if (item.grade !== 'B') return false
      } else if (filter === 'retake') {
        if (item.grade !== 'Needs Retake') return false
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        const matchId = item.id.toLowerCase().includes(q)
        const matchVerdict = item.verdict.toLowerCase().includes(q)
        const matchType = (item.shot_type || '').toLowerCase().includes(q)
        if (!matchId && !matchVerdict && !matchType) return false
      }

      return true
    })

    result.sort((a, b) => {
      if (sortBy === 'newest') return b.id.localeCompare(a.id)
      if (sortBy === 'oldest') return a.id.localeCompare(b.id)
      if (sortBy === 'highest') return b.score - a.score
      if (sortBy === 'lowest') return a.score - b.score
      return 0
    })

    return result
  }, [captures, filter, sortBy, searchQuery])

  // Delete capture via SQLite API and clean up file on disk
  const handleDelete = async (id: string) => {
    const host = typeof window !== 'undefined' && window.location.hostname ? window.location.hostname : '127.0.0.1'
    try {
      if (isBackendDb) {
        await fetch(`http://${host}:8000/api/captures/${id}`, { method: 'DELETE' })
      }
    } catch (e) {
      console.warn('Failed to delete from backend:', e)
    }

    setCaptures((prev) => {
      const next = prev.filter((c) => c.id !== id)
      try {
        localStorage.setItem('framesense_captures', JSON.stringify(next))
      } catch {}
      return next
    })

    if (selectedPhoto?.id === id) {
      setSelectedPhoto(null)
    }
  }

  const avgScore = captures.length
    ? Math.round(captures.reduce((a, b) => a + b.score, 0) / captures.length)
    : 0

  const bestScore = captures.length
    ? Math.max(...captures.map((c) => c.score))
    : 0

  return (
    <div className="flex min-h-screen flex-col bg-[#F7F8F4] text-[#193B38] selection:bg-[#EAF1ED] selection:text-[#173F38]">
      <Navbar />

      <main className="mx-auto flex w-full max-w-[1720px] flex-1 gap-8 px-5 py-8 lg:px-9">
        <Sidebar />

        <section className="min-w-0 flex-1 space-y-8">
          {/* Page Header */}
          <div className="flex flex-col justify-between gap-4 border-b border-[#E3E9E5] pb-6 sm:flex-row sm:items-center">
            <div>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EAF1ED] text-[#21866D] shadow-sm">
                  <Camera size={20} />
                </div>
                <h1 className="font-serif text-2xl font-normal italic tracking-tight text-[#193B38] lg:text-3xl">
                  Your Photography Collection
                </h1>
              </div>
              <p className="mt-1.5 text-xs text-[#647773]">
                Explore, review and manage your photographs evaluated by FrameSense AI.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={fetchCaptures}
                disabled={loading}
                className="flex h-11 items-center gap-2 rounded-xl border border-[#E3E9E5] bg-white px-4 text-xs font-semibold text-[#193B38] shadow-sm transition hover:bg-[#F7F8F4]"
                title="Refresh collection"
              >
                <RefreshCw size={14} className={loading ? 'animate-spin text-[#21866D]' : 'text-[#21866D]'} />
                <span>Refresh</span>
              </button>

              <Link
                href="/upload"
                className="flex h-11 items-center gap-2 rounded-xl bg-[#173F38] px-5 text-xs font-semibold text-white shadow-sm transition hover:bg-[#21866D]"
              >
                <UploadCloud size={15} />
                <span>Upload &amp; Audit</span>
              </Link>
            </div>
          </div>

          {/* 4 Statistics Cards */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {/* 1. Total Captures */}
            <div className="rounded-2xl border border-[#E3E9E5] bg-white p-6 shadow-sm">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-[#647773]">
                Total Captures
              </div>
              <div className="mt-2 font-serif text-3xl font-normal italic text-[#193B38]">
                {captures.length}
              </div>
              <div className="mt-2 text-xs text-[#647773]">
                Session Archive
              </div>
            </div>

            {/* 2. Average Composition Score */}
            <div className="rounded-2xl border border-[#E3E9E5] bg-white p-6 shadow-sm">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-[#647773]">
                Average Composition
              </div>
              <div className="mt-2 flex items-baseline gap-1 font-serif text-3xl font-normal italic text-[#21866D]">
                <span>{avgScore}</span>
                <span className="font-sans text-xs text-[#647773] not-italic">/ 100</span>
              </div>
              <div className="mt-2 text-xs text-[#647773]">
                Dual-Brain Calibrated
              </div>
            </div>

            {/* 3. Best Capture */}
            <div className="rounded-2xl border border-[#E3E9E5] bg-white p-6 shadow-sm">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-[#647773]">
                Best Capture
              </div>
              <div className="mt-2 flex items-baseline gap-1 font-serif text-3xl font-normal italic text-[#173F38]">
                <span>{bestScore}</span>
                <span className="font-sans text-xs text-[#647773] not-italic">/ 100</span>
              </div>
              <div className="mt-2 text-xs text-[#647773]">
                Highest Composition
              </div>
            </div>

            {/* 4. Storage Information (Technical noise removed) */}
            <div className="rounded-2xl border border-[#E3E9E5] bg-white p-6 shadow-sm">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-[#647773]">
                Storage Information
              </div>
              <div className="mt-2 font-serif text-3xl font-normal italic text-[#193B38]">
                {isBackendDb ? 'SQLite' : 'Local'}
              </div>
              <div className="mt-2 flex items-center gap-1.5 text-xs text-[#21866D] font-medium">
                <Database size={13} /> Persistent Disk Storage
              </div>
            </div>
          </div>

          {/* Search, Filter & Sorting Bar */}
          <div className="flex flex-col gap-4 rounded-2xl border border-[#E3E9E5] bg-white p-4 shadow-sm lg:flex-row lg:items-center lg:justify-between">
            {/* Search Input */}
            <div className="relative flex-1 max-w-lg">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#647773]" size={16} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search captures by ID, scene mode, or verdict..."
                className="h-11 w-full rounded-xl border border-[#E3E9E5] bg-[#F7F8F4] pr-10 pl-11 text-xs text-[#193B38] placeholder-[#8C9E9A] transition focus:border-[#21866D] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#21866D]"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-[#647773] hover:text-[#193B38]"
                >
                  <X size={15} />
                </button>
              )}
            </div>

            {/* Controls: Filter Pills & Sorting */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Filter Tabs */}
              <div className="flex items-center gap-1 rounded-xl border border-[#E3E9E5] bg-[#F7F8F4] p-1">
                <button
                  onClick={() => setFilter('all')}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                    filter === 'all'
                      ? 'bg-[#173F38] text-white shadow-sm'
                      : 'text-[#647773] hover:text-[#193B38]'
                  }`}
                >
                  All ({captures.length})
                </button>
                <button
                  onClick={() => setFilter('master')}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                    filter === 'master'
                      ? 'bg-[#173F38] text-white shadow-sm'
                      : 'text-[#647773] hover:text-[#193B38]'
                  }`}
                >
                  Master Shots (A+/A)
                </button>
                <button
                  onClick={() => setFilter('good')}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                    filter === 'good'
                      ? 'bg-[#173F38] text-white shadow-sm'
                      : 'text-[#647773] hover:text-[#193B38]'
                  }`}
                >
                  Good (B)
                </button>
                <button
                  onClick={() => setFilter('retake')}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                    filter === 'retake'
                      ? 'bg-[#DC5C5C] text-white shadow-sm'
                      : 'text-[#647773] hover:text-[#193B38]'
                  }`}
                >
                  Retake
                </button>
              </div>

              {/* Sorting Dropdown */}
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="h-10 rounded-xl border border-[#E3E9E5] bg-white px-3.5 pr-8 text-xs font-medium text-[#193B38] transition focus:border-[#21866D] focus:outline-none focus:ring-1 focus:ring-[#21866D]"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="highest">Highest Score</option>
                  <option value="lowest">Lowest Score</option>
                </select>
              </div>
            </div>
          </div>

          {/* Loading Indicator */}
          {loading && (
            <div className="my-16 flex flex-col items-center justify-center text-center">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#EAF1ED] border-t-[#173F38]" />
              <p className="mt-4 font-serif italic text-base text-[#193B38]">
                Loading your photography collection...
              </p>
            </div>
          )}

          {/* Empty State */}
          {filteredAndSortedCaptures.length === 0 && !loading && (
            <div className="rounded-2xl border-2 border-dashed border-[#E3E9E5] bg-white p-12 text-center shadow-sm">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#EAF1ED] text-[#21866D]">
                <Camera size={28} />
              </div>
              <h3 className="mt-4 font-serif text-xl font-normal italic text-[#193B38]">
                No Photographs Found
              </h3>
              <p className="mt-1.5 text-xs text-[#647773]">
                {searchQuery || filter !== 'all'
                  ? 'No photographs match your current filter or search criteria.'
                  : 'Capture photos in the live viewfinder or upload photos to build your collection.'}
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <Link
                  href="/live"
                  className="flex h-11 items-center gap-2 rounded-xl bg-[#173F38] px-5 text-xs font-semibold text-white shadow-sm transition hover:bg-[#21866D]"
                >
                  <Camera size={15} /> Open Live Viewfinder
                </Link>
                <Link
                  href="/upload"
                  className="flex h-11 items-center gap-2 rounded-xl border border-[#E3E9E5] bg-white px-5 text-xs font-semibold text-[#193B38] shadow-sm transition hover:bg-[#F7F8F4]"
                >
                  <UploadCloud size={15} className="text-[#21866D]" /> Upload Photo
                </Link>
              </div>
            </div>
          )}

          {/* Captures Grid: 3 cols desktop, 2 cols tablet, 1 col mobile */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredAndSortedCaptures.map((item) => (
              <div
                key={item.id}
                className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-[#E3E9E5] bg-white shadow-sm transition duration-200 hover:border-[#21866D]/40 hover:shadow-md"
              >
                {/* 4:3 Image Container */}
                <div
                  className="relative aspect-[4/3] cursor-pointer overflow-hidden bg-[#F7F8F4]"
                  onClick={() => setSelectedPhoto(item)}
                >
                  {item.thumbnail ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.thumbnail}
                      alt={item.id}
                      className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full flex-col items-center justify-center p-4 text-center">
                      <Camera size={32} className="text-[#647773] mb-2" />
                      <span className="font-mono text-xs text-[#647773]">{item.id}</span>
                    </div>
                  )}

                  {/* Grade Badge */}
                  <div
                    className={`absolute top-3 right-3 rounded-lg px-2.5 py-1 text-[11px] font-bold tracking-wider shadow-sm ${
                      item.grade === 'A+'
                        ? 'bg-[#173F38] text-white'
                        : item.grade === 'A'
                        ? 'bg-[#21866D] text-white'
                        : item.grade === 'B'
                        ? 'bg-[#E5A33D] text-white'
                        : 'bg-[#DC5C5C] text-white'
                    }`}
                  >
                    {item.grade}
                  </div>

                  {/* Shot Mode Badge */}
                  {item.shot_type && (
                    <div className="absolute top-3 left-3 rounded-lg border border-[#E3E9E5] bg-white/95 px-2.5 py-1 text-[10px] font-semibold text-[#193B38] shadow-sm backdrop-blur-sm">
                      {item.shot_type === 'group' ? '👥 Group' : item.shot_type === 'architecture' ? '🏛️ Architecture' : item.shot_type === 'landscape' ? '🏞️ Landscape' : '👤 Portrait'}
                    </div>
                  )}

                  {/* Hover Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center bg-[#173F38]/30 opacity-0 transition group-hover:opacity-100">
                    <span className="flex items-center gap-1.5 rounded-xl bg-white px-4 py-2 text-xs font-semibold text-[#193B38] shadow-md">
                      <Maximize2 size={13} /> View Large
                    </span>
                  </div>
                </div>

                {/* Card Content */}
                <div className="flex flex-1 flex-col justify-between p-5">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2 font-mono text-[11px] text-[#647773]">
                          <span>{item.id}</span>
                          <span>&bull;</span>
                          <span>{item.timestamp}</span>
                        </div>
                        <h3 className="mt-1 font-serif text-base font-normal italic text-[#193B38] line-clamp-1">
                          {item.verdict}
                        </h3>
                      </div>

                      {/* Scores Clean Separation */}
                      <div className="text-right">
                        <div className="font-serif text-2xl font-normal italic text-[#21866D] leading-tight">
                          {item.score}<span className="font-sans text-xs text-[#647773] not-italic">/100</span>
                        </div>
                        <div className="text-[10px] font-mono text-[#647773]">
                          Aesthetic {item.aesthetic.toFixed(1)}/10
                        </div>
                      </div>
                    </div>

                    {/* Sub-Scores Mini-Grid */}
                    <div className="mt-3.5 grid grid-cols-4 gap-2 rounded-xl border border-[#E3E9E5] bg-[#F7F8F4] p-2.5 text-center text-[10px]">
                      <div>
                        <div className="text-[#647773]">Thirds</div>
                        <div className="font-mono text-xs font-semibold text-[#193B38]">{item.sub_scores?.thirds ?? 38}</div>
                      </div>
                      <div>
                        <div className="text-[#647773]">Headroom</div>
                        <div className="font-mono text-xs font-semibold text-[#193B38]">{item.sub_scores?.headroom ?? 19}</div>
                      </div>
                      <div>
                        <div className="text-[#647773]">Tilt</div>
                        <div className="font-mono text-xs font-semibold text-[#193B38]">{item.sub_scores?.tilt ?? 19}</div>
                      </div>
                      <div>
                        <div className="text-[#647773]">Distance</div>
                        <div className="font-mono text-xs font-semibold text-[#193B38]">{item.sub_scores?.distance ?? 18}</div>
                      </div>
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="mt-4 flex items-center justify-between border-t border-[#E3E9E5] pt-3.5">
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="flex items-center gap-1.5 text-xs text-[#647773] transition hover:text-[#DC5C5C]"
                      title="Delete record"
                    >
                      <Trash2 size={13} />
                      <span>Delete</span>
                    </button>

                    {item.thumbnail && (
                      <a
                        href={item.thumbnail}
                        download={`FrameSense_${item.id}.jpg`}
                        className="flex items-center gap-1.5 text-xs font-semibold text-[#173F38] transition hover:text-[#21866D]"
                        title="Download photo"
                      >
                        <Download size={13} />
                        <span>Download</span>
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Full Photo Modal Viewer */}
      {selectedPhoto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#173F38]/60 p-4 backdrop-blur-sm">
          <div className="relative max-h-[95vh] w-full max-w-4xl overflow-hidden rounded-2xl border border-[#E3E9E5] bg-white shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#E3E9E5] px-6 py-4">
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs font-semibold text-[#193B38]">{selectedPhoto.id}</span>
                <span className="rounded-md bg-[#EAF1ED] px-2.5 py-0.5 text-[11px] font-semibold text-[#173F38]">
                  Score: {selectedPhoto.score}/100
                </span>
                <span className="rounded-md bg-[#EAF1ED] px-2.5 py-0.5 text-[11px] font-semibold text-[#21866D]">
                  Aesthetic: {selectedPhoto.aesthetic.toFixed(1)}/10
                </span>
              </div>
              <button
                onClick={() => setSelectedPhoto(null)}
                className="rounded-full bg-[#F7F8F4] p-1.5 text-[#647773] transition hover:bg-[#E3E9E5] hover:text-[#193B38]"
              >
                <X size={18} />
              </button>
            </div>

            {/* Photo */}
            <div className="flex max-h-[70vh] items-center justify-center overflow-hidden bg-[#111816] p-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={selectedPhoto.thumbnail}
                alt={selectedPhoto.id}
                className="max-h-[68vh] w-auto rounded-xl object-contain shadow-sm"
              />
            </div>

            {/* Footer */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-[#E3E9E5] px-6 py-4 text-xs">
              <div className="text-[#647773]">
                <span className="font-serif text-sm font-normal italic text-[#193B38]">{selectedPhoto.verdict}</span>
                <span className="mx-2">&bull;</span>
                <span>{selectedPhoto.date} {selectedPhoto.timestamp}</span>
              </div>
              {selectedPhoto.thumbnail && (
                <a
                  href={selectedPhoto.thumbnail}
                  download={`FrameSense_${selectedPhoto.id}.jpg`}
                  className="flex h-10 items-center gap-2 rounded-xl bg-[#173F38] px-5 font-semibold text-white shadow-sm transition hover:bg-[#21866D]"
                >
                  <Download size={14} /> Download Image
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  )
}
