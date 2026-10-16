'use client'

import { useState } from 'react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Sidebar from '@/components/Sidebar'
import { useAuth } from '@/context/AuthContext'
import {
  Camera,
  UploadCloud,
  Aperture,
  CheckCircle2,
  ArrowRight,
  Star,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  ShieldCheck,
  Smartphone,
  Volume2,
  Grid3X3,
  Sliders,
  Check,
  Building2,
  Briefcase,
  Mail
} from 'lucide-react'

export default function HomePage() {
  const { user } = useAuth()
  const [waitlistEmail, setWaitlistEmail] = useState('')
  const [waitlistSuccess, setWaitlistSuccess] = useState(false)
  const [openFaq, setOpenFaq] = useState<number | null>(0)

  const handleWaitlistSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (waitlistEmail.trim()) {
      setWaitlistSuccess(true)
      setTimeout(() => {
        setWaitlistEmail('')
      }, 4000)
    }
  }

  const toggleFaq = (idx: number) => {
    setOpenFaq(openFaq === idx ? null : idx)
  }

  // Real-world showcase photographs
  const photoShowcases = [
    {
      id: 1,
      title: 'Golden Hour Portrait',
      tag: 'Perfect Framing',
      category: 'People & Portraits',
      score: '9.4',
      grade: 'A+',
      image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
      insights: 'Eyes are placed right along the golden upper line, headroom is natural, and the subject is in sharp focus.'
    },
    {
      id: 2,
      title: 'City Street & Buildings',
      tag: 'Straight Horizon',
      category: 'Travel & Architecture',
      score: '8.8',
      grade: 'A',
      image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80',
      insights: 'Camera was held dead-straight (0.0° level), creating clean symmetrical lines with no tilted angles.'
    },
    {
      id: 3,
      title: 'Studio Headshot',
      tag: 'Centered Subject',
      category: 'Profile & Business',
      score: '9.2',
      grade: 'A+',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80',
      insights: 'Face centered with neat background separation, ready for professional portfolio and profile pictures.'
    }
  ]

  // Super friendly, simple FAQs (Clean English, Zero technical jargon)
  const faqs = [
    {
      q: 'Do I need any previous photography experience to use FrameSense?',
      a: 'Not at all! FrameSense is designed so that complete beginners and everyday phone shooters can take pictures that look like they were shot by a seasoned professional. The camera shows simple guide lines on screen and speaks friendly tips out loud so you always know where to aim.'
    },
    {
      q: 'Will this work with my smartphone, laptop webcam, and DSLR camera?',
      a: 'Yes! Whether you are using your built-in laptop webcam, a phone camera, or a professional DSLR/Mirrorless camera (Sony, Canon, Nikon, Fujifilm) via USB, FrameSense connects instantly. You can also upload any previously taken photo to check its framing and quality.'
    },
    {
      q: 'How does the voice guide work while I am shooting?',
      a: 'While you hold your camera, the assistant speaks soft, natural voice cues — like "Tilt slightly up", "Move right a bit", or "Looks great, take the shot!" This lets you keep your eyes focused on the person or scene instead of constantly squinting at buttons.'
    },
    {
      q: 'What are Social Sizes (QC Presets) and the Dark Frame alert?',
      a: 'Social Sizes give you instant on-screen outlines for Instagram Reels (9:16), Photo Posts (4:5), or Prints (3:2) so your photo never gets cropped awkwardly later. The Dark Frame alert warns you right away if the lens cap is still on or if the scene is too dark to get a clean, usable shot.'
    },
    {
      q: 'Are my private photos and camera stream safe and secure?',
      a: 'Yes, 100% private. All live camera video and photo checks run directly on your own computer. None of your photos are ever uploaded, saved to public clouds, or shared without your explicit consent.'
    },
    {
      q: 'Can I use FrameSense without an active internet connection?',
      a: 'Yes! FrameSense works completely offline once set up. Whether you are shooting in a remote outdoor location, traveling, or working in a studio without Wi-Fi, it functions smoothly with zero internet required.'
    }
  ]

  return (
    <div className="flex min-h-screen bg-[#070a0d] text-white">
      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Main Content Area */}
      <main className="flex-1 pb-16">
        <Navbar />

        <div className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-8 space-y-16">
          {/* TOP WELCOME GREETING BANNER */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-white/[.08] pb-6">
            <div className="flex items-center gap-3.5">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#d9ff5b]/10 text-[#d9ff5b] shadow-[0_0_20px_rgba(217,255,91,.15)]">
                <Aperture size={26} />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white">
                  Welcome back, {user?.name || 'Dev Kumar Tarkar'} 👋
                </h1>
                <p className="mt-1 text-xs sm:text-sm text-[#8a999d]">
                  Your personal photography assistant is ready. Frame every shot with total confidence.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/profile"
                className="flex items-center gap-2.5 rounded-2xl border border-white/10 bg-[#101619] py-2 px-3.5 text-xs text-white transition hover:border-[#d9ff5b]/40 hover:bg-[#151c20]"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#1e2a27] text-xs font-bold text-[#d9ff5b] overflow-hidden">
                  {user?.avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={user.avatarUrl} alt={user?.name} className="h-full w-full object-cover" />
                  ) : (
                    user?.avatarText || 'DK'
                  )}
                </div>
                <div className="text-left">
                  <div className="text-xs font-semibold text-white">{user?.name || 'Dev Kumar Tarkar'}</div>
                  <div className="text-[10px] text-[#69787d]">Photographer Account</div>
                </div>
              </Link>
            </div>
          </div>

          {/* 1. HERO SECTION: Clean, Human & Friendly in Simple English */}
          <section className="relative overflow-hidden rounded-3xl border border-white/[.08] bg-gradient-to-br from-[#0c1215] via-[#090e11] to-[#070a0d] p-8 md:p-10 shadow-2xl">
            {/* Ambient Lighting */}
            <div className="pointer-events-none absolute -top-24 -right-24 h-96 w-96 rounded-full bg-[#d9ff5b]/10 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-[#38bdf8]/10 blur-3xl" />

            <div className="relative z-10 grid grid-cols-1 gap-10 lg:grid-cols-12 lg:items-center">
              {/* Left Column: Headline & Value */}
              <div className="space-y-5 lg:col-span-7">
                <div className="inline-flex items-center gap-2 rounded-full border border-[#d9ff5b]/30 bg-[#d9ff5b]/10 px-3.5 py-1.5 text-[11px] font-semibold tracking-wide text-[#d9ff5b]">
                  <Camera size={13} />
                  Smart Camera Assistant
                </div>

                <div className="space-y-3">
                  <h2 className="text-2xl font-black tracking-tight text-white sm:text-3xl lg:text-4xl leading-[1.2]">
                    Take Perfectly Framed Photos.{' '}
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#d9ff5b] via-[#badb7b] to-[#38bdf8]">
                      Every Single Shot.
                    </span>
                  </h2>
                  <p className="max-w-2xl text-xs sm:text-sm text-[#8b9ba0] leading-relaxed">
                    Is your camera tilted? Is your subject cut off or awkward? 
                    FrameSense shows simple on-screen guides and speaks friendly tips so you know exactly where to point your camera. 
                    When everything looks great, just press shoot!
                  </p>
                </div>

                {/* Primary Action Buttons */}
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <Link
                    href="/live"
                    className="inline-flex items-center gap-2.5 rounded-2xl bg-[#d9ff5b] px-6 py-3.5 text-xs font-bold text-[#070a0d] shadow-[0_0_25px_rgba(217,255,91,.25)] transition hover:bg-[#c7f347] hover:scale-[1.02]"
                  >
                    <Camera size={16} />
                    Open Live Camera
                  </Link>
                  <Link
                    href="/upload"
                    className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-[#12191d] px-5 py-3.5 text-xs font-semibold text-white transition hover:border-[#d9ff5b]/40 hover:bg-[#182227]"
                  >
                    <UploadCloud size={15} />
                    Audit Existing Photo
                  </Link>
                </div>

                {/* Quick Anchor Links */}
                <div className="flex items-center gap-4 text-xs text-[#718186] pt-1">
                  <span>Explore:</span>
                  <a href="#features" className="hover:text-[#d9ff5b] transition underline decoration-white/20 underline-offset-4">Features</a>
                  <a href="#use-cases" className="hover:text-[#d9ff5b] transition underline decoration-white/20 underline-offset-4">Who It&apos;s For</a>
                  <a href="#presets" className="hover:text-[#d9ff5b] transition underline decoration-white/20 underline-offset-4">Social Sizes</a>
                  <a href="#pricing" className="hover:text-[#d9ff5b] transition underline decoration-white/20 underline-offset-4">Pricing</a>
                  <a href="#faq" className="hover:text-[#d9ff5b] transition underline decoration-white/20 underline-offset-4">FAQ</a>
                </div>
              </div>

              {/* Right Column: Live Viewfinder Preview Widget WITH ACTUAL PHOTO */}
              <div className="lg:col-span-5">
                <div className="relative mx-auto max-w-md rounded-2xl border border-white/15 bg-[#10171a]/95 p-4 shadow-2xl backdrop-blur-md">
                  {/* Card Top Bar */}
                  <div className="flex items-center justify-between border-b border-white/10 pb-3 text-[11px]">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-[#d9ff5b] animate-ping" />
                      <span className="font-semibold text-white">LIVE CAMERA GUIDE</span>
                    </div>
                    <span className="text-[10px] text-[#38bdf8] bg-[#38bdf8]/15 px-2.5 py-0.5 rounded-full font-semibold">Camera Active</span>
                  </div>

                  {/* Simulated Viewfinder Canvas with REAL PHOTO */}
                  <div className="relative mt-3.5 aspect-[4/3] w-full overflow-hidden rounded-xl border border-white/10 bg-[#070b0e]">
                    {/* Real High-Resolution Portrait */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80"
                      alt="Framed Portrait Example"
                      className="h-full w-full object-cover object-center filter brightness-[0.92]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-black/25 pointer-events-none" />

                    {/* Overlaid 3x3 Rule-of-Thirds Grid */}
                    <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none">
                      <div className="border-r border-b border-[#d9ff5b]/30" />
                      <div className="border-r border-b border-[#d9ff5b]/30 relative">
                        {/* Golden Reticle Over Subject's Eye */}
                        <div className="absolute -bottom-3.5 -right-3.5 h-7 w-7 rounded-full border-2 border-[#d9ff5b] shadow-[0_0_15px_#d9ff5b] flex items-center justify-center animate-pulse">
                          <span className="h-1.5 w-1.5 rounded-full bg-[#d9ff5b]" />
                        </div>
                      </div>
                      <div className="border-b border-[#d9ff5b]/30" />
                      <div className="border-r border-b border-[#d9ff5b]/30" />
                      <div className="border-r border-b border-[#d9ff5b]/30" />
                      <div className="border-b border-[#d9ff5b]/30" />
                      <div className="border-r border-b border-[#d9ff5b]/30" />
                      <div className="border-r border-b border-[#d9ff5b]/30" />
                      <div />
                    </div>

                    {/* Subject Detection Frame */}
                    <div className="absolute top-[16%] left-[22%] w-[56%] h-[68%] rounded-xl border-2 border-dashed border-[#d9ff5b]/70 bg-[#d9ff5b]/5 flex flex-col items-center justify-between p-2 pointer-events-none">
                      <span className="text-[9px] font-mono font-bold text-[#d9ff5b] bg-[#070a0d]/90 px-2 py-0.5 rounded shadow-sm">
                        FACE LOCKED ✓
                      </span>
                      <span className="text-[9px] font-mono text-[#38bdf8] bg-[#070a0d]/85 px-1.5 py-0.5 rounded">
                        HEADROOM: JUST RIGHT (15%)
                      </span>
                    </div>

                    {/* Live Guidance Banner inside Viewfinder */}
                    <div className="absolute bottom-2.5 inset-x-2.5 rounded-lg bg-[#070a0d]/90 border border-[#d9ff5b]/40 py-1.5 px-3 flex items-center justify-between text-[10px]">
                      <span className="text-[#d9ff5b] font-semibold flex items-center gap-1.5">
                        <CheckCircle2 size={12} /> Ready to Shoot — Looking Great!
                      </span>
                      <span className="text-[#10b981] font-bold bg-[#10b981]/20 px-2 py-0.5 rounded">
                        Grade A+ (94/100)
                      </span>
                    </div>
                  </div>

                  {/* Highlights Strip */}
                  <div className="mt-3.5 grid grid-cols-3 gap-2 text-center">
                    <div className="rounded-xl border border-white/5 bg-[#131b1f] p-2">
                      <div className="text-[9px] text-[#6c7d82]">Photo Quality</div>
                      <div className="text-sm font-bold text-[#d9ff5b]">Grade A+</div>
                    </div>
                    <div className="rounded-xl border border-white/5 bg-[#131b1f] p-2">
                      <div className="text-[9px] text-[#6c7d82]">Framing Fit</div>
                      <div className="text-sm font-bold text-[#38bdf8]">96% Match</div>
                    </div>
                    <div className="rounded-xl border border-white/5 bg-[#131b1f] p-2">
                      <div className="text-[9px] text-[#6c7d82]">Camera Tilt</div>
                      <div className="text-sm font-bold text-[#badb7b]">Level (0.0°)</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* 2. CORE FEATURES (PRODUCT: FEATURES) - Clean, simple benefits */}
          <section id="features" className="space-y-6 scroll-mt-24">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-1.5 rounded-full border border-[#d9ff5b]/20 bg-[#d9ff5b]/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-[#d9ff5b]">
                  <Star size={12} />
                  Helpful Features
                </div>
                <h2 className="mt-2 text-xl sm:text-2xl font-bold text-white tracking-tight">
                  How FrameSense Helps You Take Better Photos
                </h2>
                <p className="mt-1 text-xs text-[#809197] max-w-2xl">
                  No confusing manuals or technical jargon. Just 4 intuitive tools that make every shot look balanced and professional:
                </p>
              </div>
              <Link
                href="/live"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#d9ff5b] hover:underline"
              >
                Try camera live <ArrowRight size={14} />
              </Link>
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
              {/* Feature 1 */}
              <div className="rounded-3xl border border-white/[.08] bg-[#0e1417] p-6 space-y-3 hover:border-[#d9ff5b]/40 transition group">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#d9ff5b]/10 text-[#d9ff5b] group-hover:scale-105 transition">
                  <Grid3X3 size={22} />
                </div>
                <div className="space-y-0.5">
                  <h3 className="text-sm font-bold text-white">Smart Subject Placement</h3>
                  <span className="text-[10px] text-[#d9ff5b]">Rule of Thirds</span>
                </div>
                <p className="text-xs text-[#7c8d92] leading-relaxed">
                  Simple on-screen lines show you exactly where to position people and objects so your shots always look naturally balanced.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="rounded-3xl border border-white/[.08] bg-[#0e1417] p-6 space-y-3 hover:border-[#38bdf8]/40 transition group">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#38bdf8]/10 text-[#38bdf8] group-hover:scale-105 transition">
                  <Sliders size={22} />
                </div>
                <div className="space-y-0.5">
                  <h3 className="text-sm font-bold text-white">Straight Horizons (No Tilt)</h3>
                  <span className="text-[10px] text-[#38bdf8]">Auto-Level Line</span>
                </div>
                <p className="text-xs text-[#7c8d92] leading-relaxed">
                  Never post a crooked photo again. The live indicator turns bright green the moment your camera is held perfectly level.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="rounded-3xl border border-white/[.08] bg-[#0e1417] p-6 space-y-3 hover:border-[#badb7b]/40 transition group">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#badb7b]/10 text-[#badb7b] group-hover:scale-105 transition">
                  <Volume2 size={22} />
                </div>
                <div className="space-y-0.5">
                  <h3 className="text-sm font-bold text-white">Friendly Voice Assistant</h3>
                  <span className="text-[10px] text-[#badb7b]">Hands-Free Tips</span>
                </div>
                <p className="text-xs text-[#7c8d92] leading-relaxed">
                  Keep your focus through the lens. The assistant speaks quiet tips like &quot;Tilt slightly up&quot; or &quot;Hold steady, perfect!&quot;
                </p>
              </div>

              {/* Feature 4 */}
              <div className="rounded-3xl border border-white/[.08] bg-[#0e1417] p-6 space-y-3 hover:border-[#ec4899]/40 transition group">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#ec4899]/10 text-[#ec4899] group-hover:scale-105 transition">
                  <Star size={22} />
                </div>
                <div className="space-y-0.5">
                  <h3 className="text-sm font-bold text-white">Instant Photo Score (1 to 10)</h3>
                  <span className="text-[10px] text-[#ec4899]">Grades A+ to C</span>
                </div>
                <p className="text-xs text-[#7c8d92] leading-relaxed">
                  Know whether lighting and framing look great before you shoot. No more taking 50 photos only to delete them later.
                </p>
              </div>
            </div>
          </section>

          {/* 3. USE CASES (PRODUCT: USE CASES) - Everyday Scenarios */}
          <section id="use-cases" className="space-y-6 scroll-mt-24">
            <div>
              <div className="inline-flex items-center gap-1.5 rounded-full border border-[#38bdf8]/20 bg-[#38bdf8]/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-[#38bdf8]">
                <Smartphone size={12} />
                Who It&apos;s For
              </div>
              <h2 className="mt-2 text-xl sm:text-2xl font-bold text-white tracking-tight">
                Built For Every Kind of Photo You Shoot
              </h2>
              <p className="mt-1 text-xs text-[#809197] max-w-2xl">
                Whether you take pictures of friends, sell products online, travel, or record video content:
              </p>
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
              {/* Use Case 1 */}
              <div className="rounded-3xl border border-white/[.08] bg-[#0e1417] p-6 space-y-3">
                <div className="text-3xl">👤</div>
                <h3 className="text-sm font-bold text-white">People, Portraits &amp; Selfies</h3>
                <p className="text-xs text-[#7c8d92] leading-relaxed">
                  Faces stay sharp and comfortably centered. Never accidentally cut off anyone&apos;s forehead, hair, or chin.
                </p>
                <div className="pt-2 text-[11px] font-semibold text-[#d9ff5b]">
                  ✓ Flattering natural headroom
                </div>
              </div>

              {/* Use Case 2 */}
              <div className="rounded-3xl border border-white/[.08] bg-[#0e1417] p-6 space-y-3">
                <div className="text-3xl">🌄</div>
                <h3 className="text-sm font-bold text-white">Travel, Nature &amp; Architecture</h3>
                <p className="text-xs text-[#7c8d92] leading-relaxed">
                  Mountains, beaches, and city skylines stay perfectly level without awkward sloping or distorted angles.
                </p>
                <div className="pt-2 text-[11px] font-semibold text-[#38bdf8]">
                  ✓ Dead-straight level horizons
                </div>
              </div>

              {/* Use Case 3 */}
              <div className="rounded-3xl border border-white/[.08] bg-[#0e1417] p-6 space-y-3">
                <div className="text-3xl">📦</div>
                <h3 className="text-sm font-bold text-white">Products &amp; Online Stores</h3>
                <p className="text-xs text-[#7c8d92] leading-relaxed">
                  Items stay neatly centered with clean borders for high-converting listings on Amazon, Etsy, or Instagram.
                </p>
                <div className="pt-2 text-[11px] font-semibold text-[#badb7b]">
                  ✓ Clean centered symmetry
                </div>
              </div>

              {/* Use Case 4 */}
              <div className="rounded-3xl border border-white/[.08] bg-[#0e1417] p-6 space-y-3">
                <div className="text-3xl">📱</div>
                <h3 className="text-sm font-bold text-white">Reels &amp; Social Video</h3>
                <p className="text-xs text-[#7c8d92] leading-relaxed">
                  Pre-configured vertical safe-zones ensure important visual details never get blocked by captions or buttons.
                </p>
                <div className="pt-2 text-[11px] font-semibold text-[#ec4899]">
                  ✓ Ready for Reels &amp; TikTok
                </div>
              </div>
            </div>
          </section>

          {/* 4. HOW IT WORKS (PRODUCT: HOW IT WORKS) - 3 Simple Steps */}
          <section id="how-it-works" className="rounded-3xl border border-white/[.08] bg-[#0e1417] p-7 md:p-9 space-y-6 scroll-mt-24">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <Camera size={20} className="text-[#d9ff5b]" />
                How It Works: 3 Simple Steps
              </h2>
              <p className="text-xs text-[#718186] mt-1 max-w-xl">
                Anyone can pick it up in seconds — just start your camera and follow along:
              </p>
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
              <div className="rounded-2xl border border-white/5 bg-[#12191d] p-5 space-y-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#d9ff5b] text-xs font-black text-[#070a0d]">
                  1
                </div>
                <h3 className="text-sm font-bold text-white">Open Camera or Pick a Photo</h3>
                <p className="text-xs text-[#718186] leading-relaxed">
                  Turn on your laptop webcam, connect your phone or DSLR camera, or upload an existing photo from your gallery.
                </p>
              </div>

              <div className="rounded-2xl border border-white/5 bg-[#12191d] p-5 space-y-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#38bdf8] text-xs font-black text-[#070a0d]">
                  2
                </div>
                <h3 className="text-sm font-bold text-white">Follow The Guides &amp; Voice</h3>
                <p className="text-xs text-[#718186] leading-relaxed">
                  Look at the subtle guide lines on your screen or listen to soft voice tips telling you which direction to adjust.
                </p>
              </div>

              <div className="rounded-2xl border border-white/5 bg-[#12191d] p-5 space-y-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#badb7b] text-xs font-black text-[#070a0d]">
                  3
                </div>
                <h3 className="text-sm font-bold text-white">Snap on Green!</h3>
                <p className="text-xs text-[#718186] leading-relaxed">
                  When the indicator turns bright green, your shot is locked in. Click the shutter and capture a photo you will love.
                </p>
              </div>
            </div>
          </section>

          {/* 5. QUALITY CHECKS & SOCIAL SIZES (RESOURCES: QC PRESETS, BLACK FRAME, LOUDNESS, VIDEO SPEC) */}
          <section id="presets" className="space-y-6 scroll-mt-24">
            <div>
              <div className="inline-flex items-center gap-1.5 rounded-full border border-[#badb7b]/20 bg-[#badb7b]/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-[#badb7b]">
                <ShieldCheck size={12} />
                Helpful Safeguards
              </div>
              <h2 className="mt-2 text-xl sm:text-2xl font-bold text-white tracking-tight">
                Automatic Checks So You Never Ruin a Good Shot
              </h2>
              <p className="mt-1 text-xs text-[#809197] max-w-2xl">
                Prevent common photography mistakes before you pack up your gear:
              </p>
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
              {/* Tool 1: QC Presets */}
              <div className="rounded-3xl border border-white/[.08] bg-[#0e1417] p-6 space-y-3 hover:border-[#badb7b]/40 transition">
                <div className="text-2xl">📐</div>
                <div>
                  <h3 className="text-sm font-bold text-white">Social Media Sizes (Presets)</h3>
                  <div className="text-[10px] text-[#badb7b] mt-0.5 font-medium">Reels, Posts &amp; Print</div>
                </div>
                <p className="text-xs text-[#7c8d92] leading-relaxed">
                  One-click framing boxes for Instagram Reels (9:16), Feed Posts (4:5), or Photo Prints (3:2) so nothing gets cropped out.
                </p>
              </div>

              {/* Tool 2: Black Frame Detection */}
              <div className="rounded-3xl border border-white/[.08] bg-[#0e1417] p-6 space-y-3 hover:border-[#38bdf8]/40 transition">
                <div className="text-2xl">🚫</div>
                <div>
                  <h3 className="text-sm font-bold text-white">Dark &amp; Blank Frame Alert</h3>
                  <div className="text-[10px] text-[#38bdf8] mt-0.5 font-medium">No Accident Clicks</div>
                </div>
                <p className="text-xs text-[#7c8d92] leading-relaxed">
                  Alerts you immediately if your lens cap is accidentally still on or if the room is too dark to capture a clean photo.
                </p>
              </div>

              {/* Tool 3: Loudness Checker */}
              <div className="rounded-3xl border border-white/[.08] bg-[#0e1417] p-6 space-y-3 hover:border-[#d9ff5b]/40 transition">
                <div className="text-2xl">🔊</div>
                <div>
                  <h3 className="text-sm font-bold text-white">Sound / Mic Level Check</h3>
                  <div className="text-[10px] text-[#d9ff5b] mt-0.5 font-medium">Clear Audio</div>
                </div>
                <p className="text-xs text-[#7c8d92] leading-relaxed">
                  When shooting video clips, it makes sure your voice is loud, clear, and not distorted or muffled.
                </p>
              </div>

              {/* Tool 4: Video Spec Check */}
              <div className="rounded-3xl border border-white/[.08] bg-[#0e1417] p-6 space-y-3 hover:border-[#ec4899]/40 transition">
                <div className="text-2xl">⚡</div>
                <div>
                  <h3 className="text-sm font-bold text-white">Quick Quality Check</h3>
                  <div className="text-[10px] text-[#ec4899] mt-0.5 font-medium">Ready to Share</div>
                </div>
                <p className="text-xs text-[#7c8d92] leading-relaxed">
                  Confirms sharpness, resolution, and vibrant colors before saving so photos never look blurry when sent on social apps.
                </p>
              </div>
            </div>
          </section>

          {/* 6. REAL-WORLD PHOTO SHOWCASE */}
          <section className="space-y-5">
            <div>
              <div className="inline-flex items-center gap-1.5 rounded-full border border-[#d9ff5b]/20 bg-[#d9ff5b]/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-[#d9ff5b]">
                <Star size={12} />
                Real Photo Examples
              </div>
              <h2 className="mt-2 text-xl sm:text-2xl font-bold text-white tracking-tight">
                See How FrameSense Rates Quality
              </h2>
              <p className="mt-1 text-xs text-[#809197]">
                Hover over any photograph to see how composition guidelines align:
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {photoShowcases.map((photo) => (
                <div
                  key={photo.id}
                  className="group relative overflow-hidden rounded-2xl border border-white/10 bg-[#0e1417] p-3.5 transition hover:border-[#d9ff5b]/40 hover:shadow-xl"
                >
                  {/* Photo Display with Overlaid Composition Tag */}
                  <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-[#070b0e]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={photo.image}
                      alt={photo.title}
                      className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />

                    {/* Subtle Rule-of-Thirds Grid Indicator on Hover */}
                    <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 opacity-0 transition duration-300 group-hover:opacity-100 pointer-events-none">
                      <div className="border-r border-b border-white/30" />
                      <div className="border-r border-b border-white/30" />
                      <div className="border-b border-white/30" />
                      <div className="border-r border-b border-white/30" />
                      <div className="border-r border-b border-white/30" />
                      <div className="border-b border-white/30" />
                      <div className="border-r border-b border-white/30" />
                      <div className="border-r border-b border-white/30" />
                      <div />
                    </div>

                    {/* Top Badges */}
                    <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between">
                      <span className="rounded-md bg-[#070a0d]/85 px-2 py-0.5 text-[10px] font-medium text-[#d9ff5b] backdrop-blur-sm">
                        {photo.tag}
                      </span>
                      <span className="rounded-md bg-[#10b981]/90 px-2 py-0.5 text-[10px] font-bold text-white shadow-sm">
                        Grade {photo.grade}
                      </span>
                    </div>

                    {/* Bottom Score Overlay */}
                    <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between text-[11px] text-white">
                      <span className="font-semibold text-xs drop-shadow">{photo.title}</span>
                      <div className="flex items-center gap-1 font-mono text-[#d9ff5b] bg-[#070a0d]/85 px-2 py-0.5 rounded">
                        <Star size={11} className="fill-[#d9ff5b]" />
                        {photo.score}/10
                      </div>
                    </div>
                  </div>

                  {/* Card Description */}
                  <div className="mt-3 space-y-1 px-1">
                    <div className="text-[10px] uppercase font-semibold tracking-wider text-[#697a80]">
                      {photo.category}
                    </div>
                    <p className="text-[11px] text-[#93a4aa] leading-relaxed">
                      {photo.insights}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* 7. PRICING SECTION (PRODUCT: PRICING) - Simple & Honest */}
          <section id="pricing" className="space-y-6 scroll-mt-24">
            <div className="text-center max-w-xl mx-auto space-y-2">
              <div className="inline-flex items-center gap-1.5 rounded-full border border-[#5c67f5]/30 bg-[#5c67f5]/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-[#7983ff]">
                Transparent Pricing
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                Simple Plans For Every Photographer
              </h2>
              <p className="text-xs text-[#809197]">
                Start free forever, or upgrade for unlimited HD camera tools and studio workflows.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-3 max-w-5xl mx-auto">
              {/* Tier 1: Free Starter */}
              <div className="rounded-3xl border border-white/[.08] bg-[#0e1417] p-6 space-y-5 flex flex-col justify-between">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-base font-bold text-white">Free Starter</h3>
                    <p className="text-xs text-[#718186] mt-0.5">For beginners, students, and hobbyists</p>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-black text-white">$0</span>
                    <span className="text-xs text-[#718186]">/ forever</span>
                  </div>
                  <ul className="space-y-2.5 text-xs text-[#8c9ca2] pt-2">
                    <li className="flex items-center gap-2"><Check size={14} className="text-[#d9ff5b]" /> Live Camera Viewfinder</li>
                    <li className="flex items-center gap-2"><Check size={14} className="text-[#d9ff5b]" /> Rule of Thirds grid lines</li>
                    <li className="flex items-center gap-2"><Check size={14} className="text-[#d9ff5b]" /> 25 Photo audits per day</li>
                    <li className="flex items-center gap-2"><Check size={14} className="text-[#d9ff5b]" /> Level horizon indicator</li>
                  </ul>
                </div>
                <Link
                  href="/live"
                  className="w-full text-center py-2.5 px-4 rounded-xl border border-white/10 bg-[#12191d] text-xs font-semibold text-white hover:border-[#d9ff5b]/40 hover:bg-[#182227] transition"
                >
                  Get Started Free
                </Link>
              </div>

              {/* Tier 2: Pro Photographer (Featured) */}
              <div className="relative rounded-3xl border-2 border-[#5c67f5] bg-gradient-to-b from-[#101426] via-[#0d101d] to-[#090b14] p-6 space-y-5 flex flex-col justify-between shadow-2xl">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[#5c67f5] px-3 py-0.5 text-[10px] font-bold text-white uppercase tracking-wider shadow">
                  Most Popular
                </div>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-base font-bold text-white">Pro Photographer</h3>
                    <p className="text-xs text-[#8f9df0] mt-0.5">For commercial and studio creators</p>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-black text-white">$19</span>
                    <span className="text-xs text-[#718186]">/ month</span>
                  </div>
                  <ul className="space-y-2.5 text-xs text-[#c5cde9] pt-2">
                    <li className="flex items-center gap-2"><Check size={14} className="text-[#5c67f5]" /> Unlimited HD Camera usage</li>
                    <li className="flex items-center gap-2"><Check size={14} className="text-[#5c67f5]" /> Friendly Voice Assistant tips</li>
                    <li className="flex items-center gap-2"><Check size={14} className="text-[#5c67f5]" /> Full 1 to 10 Photo Quality Scores</li>
                    <li className="flex items-center gap-2"><Check size={14} className="text-[#5c67f5]" /> All Social Media Sizes (Reels, Posts)</li>
                    <li className="flex items-center gap-2"><Check size={14} className="text-[#5c67f5]" /> Dark / Blank frame alerts</li>
                    <li className="flex items-center gap-2"><Check size={14} className="text-[#5c67f5]" /> Unlimited Photo Audits</li>
                  </ul>
                </div>
                <a
                  href="#waiting-list"
                  className="w-full text-center py-2.5 px-4 rounded-xl bg-[#5c67f5] text-xs font-bold text-white hover:bg-[#4f5be8] shadow-lg transition active:scale-95"
                >
                  Join Pro Early Access
                </a>
              </div>

              {/* Tier 3: Studio & Team */}
              <div className="rounded-3xl border border-white/[.08] bg-[#0e1417] p-6 space-y-5 flex flex-col justify-between">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-base font-bold text-white">Studio &amp; Team</h3>
                    <p className="text-xs text-[#718186] mt-0.5">For photography studios &amp; agencies</p>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-black text-white">$49</span>
                    <span className="text-xs text-[#718186]">/ month</span>
                  </div>
                  <ul className="space-y-2.5 text-xs text-[#8c9ca2] pt-2">
                    <li className="flex items-center gap-2"><Check size={14} className="text-[#38bdf8]" /> Everything in Pro plan</li>
                    <li className="flex items-center gap-2"><Check size={14} className="text-[#38bdf8]" /> Multi-camera concurrent tethering</li>
                    <li className="flex items-center gap-2"><Check size={14} className="text-[#38bdf8]" /> Team shared photo gallery</li>
                    <li className="flex items-center gap-2"><Check size={14} className="text-[#38bdf8]" /> Custom studio branding on reports</li>
                  </ul>
                </div>
                <a
                  href="#contact"
                  className="w-full text-center py-2.5 px-4 rounded-xl border border-white/10 bg-[#12191d] text-xs font-semibold text-white hover:border-[#38bdf8]/40 hover:bg-[#182227] transition"
                >
                  Contact Studio Sales
                </a>
              </div>
            </div>
          </section>

          {/* 8. FAQ SECTION (PRODUCT: FAQ) - Practical, Everyday Questions */}
          <section id="faq" className="space-y-6 scroll-mt-24 max-w-4xl mx-auto">
            <div className="text-center space-y-2">
              <div className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-[#9ba9af]">
                <HelpCircle size={12} />
                Got Questions?
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                Frequently Asked Questions
              </h2>
              <p className="text-xs text-[#809197]">
                Clear answers in plain English — no complicated technical jargon:
              </p>
            </div>

            <div className="space-y-3 pt-2">
              {faqs.map((faq, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl border border-white/[.08] bg-[#0e1417] overflow-hidden transition"
                >
                  <button
                    onClick={() => toggleFaq(idx)}
                    className="w-full flex items-center justify-between p-4 sm:p-5 text-left text-xs sm:text-sm font-semibold text-white hover:text-[#d9ff5b] transition"
                  >
                    <span>{faq.q}</span>
                    <span className="shrink-0 ml-3 text-[#718186]">
                      {openFaq === idx ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </span>
                  </button>
                  {openFaq === idx && (
                    <div className="px-4 pb-5 sm:px-5 text-xs text-[#85969c] leading-relaxed border-t border-white/5 pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* 9. COMPANY (ABOUT, CAREERS, CONTACT) */}
          <section id="about" className="rounded-3xl border border-white/[.08] bg-[#0e1417] p-7 md:p-9 space-y-6 scroll-mt-24">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* About */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-white font-bold text-sm">
                  <Building2 size={16} className="text-[#d9ff5b]" />
                  About FrameSense
                </div>
                <p className="text-xs text-[#718186] leading-relaxed">
                  FrameSense was built to help everyone — from curious beginners to busy studio professionals — take stunning, well-balanced photographs without the stress of manual trial and error.
                </p>
              </div>

              {/* Careers */}
              <div id="careers" className="space-y-2 scroll-mt-24">
                <div className="flex items-center gap-2 text-white font-bold text-sm">
                  <Briefcase size={16} className="text-[#38bdf8]" />
                  Join Our Team
                </div>
                <p className="text-xs text-[#718186] leading-relaxed">
                  Love visual craft and building intuitive creative tools? We are actively hiring designers and software engineers. Work remotely from anywhere in the world.
                </p>
                <div className="pt-1">
                  <span className="inline-block text-[10px] text-[#38bdf8] bg-[#38bdf8]/10 px-2.5 py-0.5 rounded-full font-semibold">
                    We Are Hiring!
                  </span>
                </div>
              </div>

              {/* Contact */}
              <div id="contact" className="space-y-2 scroll-mt-24">
                <div className="flex items-center gap-2 text-white font-bold text-sm">
                  <Mail size={16} className="text-[#badb7b]" />
                  Contact &amp; Studio Support
                </div>
                <p className="text-xs text-[#718186] leading-relaxed">
                  Have questions, ideas, or need assistance setting up your camera hardware? Our friendly team is always here to assist you.
                </p>
                <div className="pt-1 text-xs text-[#d9ff5b] font-mono">
                  support@framesense.ai
                </div>
              </div>
            </div>
          </section>

          {/* 10. WAITING LIST / EARLY ACCESS SECTION (MATCHING USER SCREENSHOT) */}
          <section id="waiting-list" className="relative overflow-hidden rounded-3xl border border-white/[.08] bg-gradient-to-br from-[#0c0f14] via-[#090c10] to-[#06080b] p-8 md:p-10 shadow-2xl scroll-mt-24">
            {/* Ambient background glow */}
            <div className="pointer-events-none absolute -bottom-20 -right-20 h-80 w-80 rounded-full bg-[#5c67f5]/15 blur-3xl" />

            <div className="relative z-10 grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-center">
              {/* Left Column */}
              <div className="space-y-4 lg:col-span-7">
                <span className="inline-block rounded-full border border-white/10 bg-white/[.06] px-3 py-1 text-[11px] font-medium text-white/80">
                  Waiting list
                </span>

                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white leading-tight">
                  Be first to ship with confidence
                </h2>

                <p className="text-xs sm:text-sm text-[#8a999f] max-w-xl leading-relaxed">
                  Join the waiting list for early access, onboarding help, and launch pricing.
                </p>

                {/* 3 Pills */}
                <div className="grid grid-cols-1 gap-3 pt-2 sm:grid-cols-3">
                  <div className="flex items-center gap-2.5 rounded-xl border border-white/[.08] bg-white/[.03] p-3 text-xs text-[#b8c7cd]">
                    <CheckCircle2 size={16} className="shrink-0 text-[#5c67f5]" />
                    <span>Real-time AI Framing</span>
                  </div>
                  <div className="flex items-center gap-2.5 rounded-xl border border-white/[.08] bg-white/[.03] p-3 text-xs text-[#b8c7cd]">
                    <CheckCircle2 size={16} className="shrink-0 text-[#5c67f5]" />
                    <span>Zero-Lag 60 FPS Viewfinder</span>
                  </div>
                  <div className="flex items-center gap-2.5 rounded-xl border border-white/[.08] bg-white/[.03] p-3 text-xs text-[#b8c7cd]">
                    <CheckCircle2 size={16} className="shrink-0 text-[#5c67f5]" />
                    <span>AVA Aesthetic Scoring</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Email Subscription Form */}
              <div className="lg:col-span-5">
                <div className="mx-auto max-w-md rounded-2xl border border-white/10 bg-[#0f131a]/80 p-5 shadow-xl backdrop-blur-sm space-y-4">
                  <div className="text-xs font-semibold text-white">
                    Request an Early Access Invite
                  </div>

                  {waitlistSuccess ? (
                    <div className="rounded-xl border border-[#10b981]/30 bg-[#10b981]/15 p-4 text-center space-y-1">
                      <div className="text-xs font-bold text-[#10b981]">
                        ✓ You&apos;re on the list!
                      </div>
                      <p className="text-[11px] text-[#86efac]">
                        We will notify you at your email as soon as new invitation codes unlock.
                      </p>
                    </div>
                  ) : (
                    <form onSubmit={handleWaitlistSubmit} className="space-y-3">
                      <div className="flex flex-col sm:flex-row gap-2">
                        <input
                          type="email"
                          required
                          value={waitlistEmail}
                          onChange={(e) => setWaitlistEmail(e.target.value)}
                          placeholder="Enter your email address"
                          className="flex-1 rounded-xl border border-white/10 bg-[#080b0f] px-4 py-2.5 text-xs text-white placeholder-[#505d63] focus:border-[#5c67f5] focus:outline-none focus:ring-1 focus:ring-[#5c67f5]"
                        />
                        <button
                          type="submit"
                          className="shrink-0 rounded-xl bg-[#5c67f5] px-5 py-2.5 text-xs font-semibold text-white shadow-md transition hover:bg-[#4f5be8] active:scale-95"
                        >
                          Get early access
                        </button>
                      </div>
                      <p className="text-[11px] text-[#556369]">
                        No spam. Unsubscribe anytime.
                      </p>
                    </form>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* 11. GRAND MULTI-COLUMN FOOTER (MATCHING USER SCREENSHOT EXACTLY) */}
          <footer className="pt-10 pb-6 border-t border-white/[.08] space-y-10">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-12">
              {/* Col 1: Brand & Description (Col span 5) */}
              <div className="space-y-3 md:col-span-5">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-tr from-[#5c67f5] to-[#a855f7] text-white shadow-sm">
                    <Aperture size={16} />
                  </div>
                  <span className="text-base font-bold tracking-tight text-white">
                    FrameSense
                  </span>
                </div>
                <p className="text-xs text-[#718086] leading-relaxed max-w-sm">
                  Automated, frame-accurate quality checks for visual captures and composition exports — so you can deliver faster, with fewer surprises.
                </p>
              </div>

              {/* Col 2: Product (Col span 2) */}
              <div className="space-y-3 md:col-span-2">
                <h4 className="text-xs font-semibold text-white tracking-wider">Product</h4>
                <ul className="space-y-2 text-xs text-[#7c8c92]">
                  <li>
                    <a href="#features" className="transition hover:text-white">Features</a>
                  </li>
                  <li>
                    <a href="#use-cases" className="transition hover:text-white">Use cases</a>
                  </li>
                  <li>
                    <a href="#how-it-works" className="transition hover:text-white">How it works</a>
                  </li>
                  <li>
                    <a href="#pricing" className="transition hover:text-white">Pricing</a>
                  </li>
                  <li>
                    <a href="#faq" className="transition hover:text-white">FAQ</a>
                  </li>
                </ul>
              </div>

              {/* Col 3: Resources (Col span 3) */}
              <div className="space-y-3 md:col-span-3">
                <h4 className="text-xs font-semibold text-white tracking-wider">Resources</h4>
                <ul className="space-y-2 text-xs text-[#7c8c92]">
                  <li>
                    <a href="#how-it-works" className="transition hover:text-white">Docs</a>
                  </li>
                  <li>
                    <a href="#presets" className="transition hover:text-white">QC presets</a>
                  </li>
                  <li>
                    <a href="#presets" className="transition hover:text-white">Black frame detection</a>
                  </li>
                  <li>
                    <a href="#presets" className="transition hover:text-white">Loudness checker</a>
                  </li>
                  <li>
                    <a href="#presets" className="transition hover:text-white">Video spec check</a>
                  </li>
                </ul>
              </div>

              {/* Col 4: Company (Col span 2) */}
              <div className="space-y-3 md:col-span-2">
                <h4 className="text-xs font-semibold text-white tracking-wider">Company</h4>
                <ul className="space-y-2 text-xs text-[#7c8c92]">
                  <li>
                    <a href="#about" className="transition hover:text-white">About</a>
                  </li>
                  <li>
                    <a href="#careers" className="transition hover:text-white">Careers</a>
                  </li>
                  <li>
                    <a href="#contact" className="transition hover:text-white">Contact</a>
                  </li>
                </ul>
              </div>
            </div>

            {/* Bottom Copyright & Legal Links */}
            <div className="flex flex-col sm:flex-row items-center justify-between border-t border-white/[.06] pt-6 text-[11px] text-[#556369] gap-3">
              <div>
                &copy; 2026 FrameSense. All rights reserved.
              </div>
              <div className="flex items-center gap-6">
                <a href="#about" className="transition hover:text-white">Privacy</a>
                <a href="#about" className="transition hover:text-white">Terms</a>
              </div>
            </div>
          </footer>
        </div>
      </main>
    </div>
  )
}
