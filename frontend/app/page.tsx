'use client'

import { useState } from 'react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
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
  Sparkles,
  Zap,
  Target,
  Compass,
  Cpu,
  Layers,
  Eye,
  Info,
  ExternalLink,
  X,
  Maximize2,
  Focus
} from 'lucide-react'

export default function HomePage() {
  // Interactive Composition Demo state
  const [demoGrid, setDemoGrid] = useState(true)
  const [demoSymmetry, setDemoSymmetry] = useState(false)
  const [demoHorizon, setDemoHorizon] = useState(true)
  const [demoSubjectBox, setDemoSubjectBox] = useState(true)
  const [demoAnnotations, setDemoAnnotations] = useState(true)

  // Portfolio modal state
  const [inspectPhoto, setInspectPhoto] = useState<null | {
    id: number
    title: string
    tag: string
    category: string
    score: string
    grade: string
    image: string
    insights: string
    technical: {
      thirds: string
      headroom: string
      tilt: string
      distance: string
      lighting: string
    }
  }>(null)

  // Learn more feature modal
  const [activeFeatureModal, setActiveFeatureModal] = useState<null | {
    title: string
    subtitle: string
    desc: string
    bullets: string[]
    metric: string
  }>(null)

  // FAQ accordion state
  const [openFaq, setOpenFaq] = useState<number | null>(0)

  const toggleFaq = (idx: number) => {
    setOpenFaq(openFaq === idx ? null : idx)
  }

  // Capability Strip Data
  const capabilities = [
    {
      icon: <Zap size={18} className="text-[#21866D]" />,
      title: 'Real-Time Guidance',
      desc: 'Sub-20ms edge overlay feedback before shutter release',
    },
    {
      icon: <Sparkles size={18} className="text-[#21866D]" />,
      title: 'AI Aesthetic Analysis',
      desc: 'PyTorch NIMA neural scoring trained on AVA dataset',
    },
    {
      icon: <Grid3X3 size={18} className="text-[#21866D]" />,
      title: 'Smart Framing',
      desc: 'Rule of Thirds, Golden Ratio, and Headroom heuristics',
    },
    {
      icon: <Cpu size={18} className="text-[#21866D]" />,
      title: 'GPU Acceleration',
      desc: 'On-device NVIDIA CUDA 12.4 hardware acceleration',
    },
  ]

  // Three Steps
  const howItWorksSteps = [
    {
      step: '01',
      title: 'Connect Your Camera',
      desc: 'Attach your smartphone over local WiFi, webcam, or DSLR via USB. FrameSense initializes your live video stream with zero setup.',
      highlight: 'Zero-latency browser stream',
    },
    {
      step: '02',
      title: 'Analyze Your Composition',
      desc: 'Our Dual-Brain engine computes spatial geometry, horizon tilt, and monocular depth alongside neural aesthetic scoring at 60 FPS.',
      highlight: 'MediaPipe + HoughLinesP + NIMA',
    },
    {
      step: '03',
      title: 'Capture the Perfect Frame',
      desc: 'Trigger the intelligent auto-shutter the exact millisecond composition locks into place, or snap manually at full native sensor resolution.',
      highlight: 'Preserves 100% optical sensor FOV',
    },
  ]

  // Key Engine Features
  const keyFeatures = [
    {
      id: '01',
      icon: <Grid3X3 size={24} className="text-[#21866D]" />,
      title: 'Golden Thirds Guidance',
      subtitle: 'Dynamic Reticle & Power Intersections',
      desc: 'Real-time augmented reticles guide you to place subjects along golden intersections for natural optical harmony and balance.',
      bullets: [
        'Automatic power-point snapping',
        'Headroom clearance validation (15-22% ideal)',
        'Subject isolation bounding envelope',
      ],
      metric: '40% of Composite Score',
    },
    {
      id: '02',
      icon: <Smartphone size={24} className="text-[#21866D]" />,
      title: 'Phone Gyroscope Level',
      subtitle: 'HTML5 DeviceOrientation & Spirit Bubble',
      desc: 'Taps directly into smartphone motion hardware to calculate physical roll and pitch, snapping emerald when camera is level within ±1.5°.',
      bullets: [
        'Real-time accelerometer & gyroscope integration',
        'Physical liquid bubble level simulation',
        'Haptic vibration cue upon reaching 0.0° level',
      ],
      metric: '±0.5° Angular Precision',
    },
    {
      id: '03',
      icon: <Volume2 size={24} className="text-[#21866D]" />,
      title: 'Conversational Voice Prompts',
      subtitle: 'Hands-Free English & Hinglish Audio Cues',
      desc: 'Provides instant spoken directional guidance ("Thoda paas aao", "Tilt camera up") so solo creators and tripod shooters never miss framing.',
      bullets: [
        'Bilingual speech synthesis engine (EN / Hinglish)',
        'Blind creator tripod assistance mode',
        'Smart audio rate-limiting (no spam)',
      ],
      metric: '2.5s Adaptive Cooldown',
    },
    {
      id: '04',
      icon: <Sparkles size={24} className="text-[#21866D]" />,
      title: 'Deep Aesthetic Scoring',
      subtitle: 'AVA-Trained Convolutional Neural Engine',
      desc: 'Analyzes exposure, contrast, color harmony, and visual clutter in real time on NVIDIA RTX GPU to predict photographic appeal.',
      bullets: [
        'Trained on 250,000+ AVA professional photographs',
        'Mean opinion score distribution prediction',
        'CUDA 12.4 FP16 accelerated throughput',
      ],
      metric: '10.8ms Inference Latency',
    },
  ]

  // Portfolio Showcase Photographs
  const portfolioPhotos = [
    {
      id: 1,
      title: 'Golden Hour Portrait',
      tag: 'Rule of Thirds Aligned',
      category: 'People & Portraits',
      score: '9.4',
      grade: 'A+',
      image:
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1000&q=80',
      insights:
        'Eyes aligned along the upper power line with optimal 18% headroom clearance and soft depth separation.',
      technical: {
        thirds: '98% Alignment',
        headroom: '18% (Optimal)',
        tilt: '0.2° (Level)',
        distance: '4.2 ft (Ideal)',
        lighting: 'Golden Hour Balanced',
      },
    },
    {
      id: 2,
      title: 'Urban Architecture & Horizon',
      tag: '0.0° Level Horizon',
      category: 'Travel & Architecture',
      score: '8.8',
      grade: 'A',
      image:
        'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1000&q=80',
      insights:
        'Camera leveled to exactly 0.0° roll, producing crisp vertical convergence and balanced perspective across the facade.',
      technical: {
        thirds: '86% Symmetry',
        headroom: 'N/A (Structural)',
        tilt: '0.0° (Snapping Level)',
        distance: 'Infinity FOV',
        lighting: 'High Dynamic Range',
      },
    },
    {
      id: 3,
      title: 'Studio Creative Headshot',
      tag: 'Centered Symmetry',
      category: 'Profile & Editorial',
      score: '9.2',
      grade: 'A+',
      image:
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=1000&q=80',
      insights:
        'Subject placed in centered symmetry with sharp focus on the iris and natural shoulder relaxation.',
      technical: {
        thirds: '92% Center Balance',
        headroom: '16% (Balanced)',
        tilt: '0.4° (Level)',
        distance: '3.8 ft (Close-Up)',
        lighting: 'Studio Key + Rim Light',
      },
    },
  ]

  // Why FrameSense AI Section
  const whyReasons = [
    {
      title: 'Pre-Capture Composition Guidance',
      desc: 'Traditional camera apps leave you guessing, forcing destructive post-capture cropping that throws away up to 60% of your camera sensor pixels. FrameSense guides your physical camera position before capture, preserving 100% native resolution and true optical depth of field.',
      badge: 'Zero Loss of Resolution',
    },
    {
      title: 'Real-Time Camera & Horizon Alignment',
      desc: 'Never ruin an architectural or scenic shot with a crooked horizon. With our live Phone Gyroscope Level and HoughLinesP horizon tracking, an intuitive visual horizon and spirit bubble snap emerald green the exact millisecond your phone reaches 0.0° level.',
      badge: 'Integrated Motion Hardware',
    },
    {
      title: 'Intelligent Visual Reticles & Bounding',
      desc: 'Instead of complex manual DSLR gridlines that clutter the screen, FrameSense uses dynamic golden reticles, autofocus corner brackets, and multi-face composition envelopes that intelligently highlight key points of interest.',
      badge: 'Adaptive AR Overlays',
    },
    {
      title: 'Voice-Assisted Hands-Free Coaching',
      desc: 'Perfect for solo creators, travel vloggers, and tripod shooters. FrameSense speaks natural prompts in English and Hinglish ("Thoda 2 kadam peeche jao", "Phone ko seedha rakho") so you can step into the frame without looking at the screen.',
      badge: 'Hands-Free Creator Mode',
    },
    {
      title: 'Deep AI-Powered Image Evaluation',
      desc: 'Backed by our Dual-Brain architecture: Brain 1 evaluates geometric rules of composition, headroom, and monocular depth, while Brain 2 runs PyTorch Google NIMA on CUDA to assess lighting, contrast, and aesthetic quality.',
      badge: 'Dual-Brain Neural Engine',
    },
  ]

  // 8 Specific FAQs
  const faqs = [
    {
      q: 'What is FrameSense AI?',
      a: 'FrameSense AI is a real-time, pre-capture photography assistant that runs directly on your camera feed before you take the photo. Using spatial scene heuristics and neural aesthetic scoring, it provides dynamic on-screen guides, horizon leveling, voice cues, and automatic shutter capture to ensure professional framing every single time.',
    },
    {
      q: 'Do I need photography experience?',
      a: 'No prior experience is needed. FrameSense translates complex photographic principles (like the Rule of Thirds, golden triangles, headroom balance, and optical perspective) into intuitive visual reticles and friendly voice prompts that anyone can follow instantly.',
    },
    {
      q: 'Does FrameSense support smartphones and webcams?',
      a: 'Yes. FrameSense is designed to run seamlessly in any modern web browser across smartphones (iOS Safari & Android Chrome), laptop webcams, external USB webcams, and DSLR/Mirrorless cameras connected via USB or HDMI capture cards.',
    },
    {
      q: 'How does the gyroscope level work?',
      a: 'On mobile devices, FrameSense connects to your phone internal accelerometer and gyroscope via the HTML5 DeviceOrientation API. It calculates real-time roll and pitch in degrees, displaying an artificial horizon and physical spirit bubble that snaps emerald green when held within ±1.5° of true level.',
    },
    {
      q: 'How does AI composition scoring work?',
      a: 'FrameSense uses a Dual-Brain architecture: Brain 1 assesses geometric rules (Rule of Thirds alignment, headroom clearance, horizon tilt, and subject depth using MediaPipe and OpenCV). Brain 2 runs an AVA-trained PyTorch NIMA neural model on your GPU to evaluate contrast, color harmony, and aesthetic appeal, generating an overall score out of 100.',
    },
    {
      q: 'Can I upload existing photographs?',
      a: 'Yes. The "Upload & Audit" studio allows you to upload any high-resolution JPEG, PNG, or WebP photograph from your DSLR, mirrorless camera, or phone to run the full Dual-Brain evaluation, view composition overlays, and save results to your gallery.',
    },
    {
      q: 'Are my photos stored securely?',
      a: 'Absolutely. FrameSense operates with strict privacy principles. All live video stream processing happens locally on your machine via GPU/CPU. When you save a capture, images and telemetry are stored securely in your local SQLite database on your own device—never sent to public cloud servers.',
    },
    {
      q: 'Does FrameSense work without an internet connection?',
      a: 'Yes. Because the computer vision pipelines, PyTorch neural models, and SQLite persistence are hosted locally on your device, FrameSense can operate completely offline in remote environments without requiring internet access.',
    },
  ]

  return (
    <div className="min-h-screen bg-[#F7F8F4] text-[#193B38] selection:bg-[#EAF1ED] selection:text-[#173F38]">
      {/* 1. STICKY NAVBAR */}
      <Navbar />

      <main className="space-y-20 pb-20">
        {/* 2. HERO SECTION: Apple Minimalism + Luxury Editorial Two-Column */}
        <section className="relative overflow-hidden pt-8 lg:pt-14">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-10">
              {/* LEFT SIDE */}
              <div className="space-y-7 lg:col-span-7">
                {/* Small Badge */}
                <div className="inline-flex items-center gap-2 rounded-full border border-[#21866D]/20 bg-[#EAF1ED] px-4 py-1.5 text-xs font-mono font-medium tracking-wide text-[#173F38] shadow-sm">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#16A085]" />
                  <span>AI-POWERED PHOTOGRAPHY ASSISTANT</span>
                </div>

                {/* Main & Supporting Headings */}
                <div className="space-y-3">
                  <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-normal italic tracking-tight text-[#193B38] leading-[1.12]">
                    Every Frame Tells a{' '}
                    <span className="not-italic text-[#173F38]">Better Story.</span>
                  </h1>
                  <h2 className="text-xl sm:text-2xl font-medium tracking-tight text-[#21866D]">
                    Perfect Your Composition Before You Capture.
                  </h2>
                </div>

                {/* Description */}
                <p className="max-w-xl text-base sm:text-lg text-[#647773] leading-relaxed">
                  Experience intelligent real-time composition guidance, horizon alignment,
                  and AI-powered aesthetic analysis. Frame better photographs with
                  confidence before pressing the shutter.
                </p>

                {/* Primary & Secondary Action Buttons */}
                <div className="flex flex-wrap items-center gap-3.5 pt-1">
                  <Link
                    href="/live"
                    className="inline-flex items-center gap-2.5 rounded-2xl bg-[#173F38] px-7 py-4 text-sm font-medium text-white shadow-sm transition hover:bg-[#21866D] hover:shadow-md hover:scale-[1.01]"
                  >
                    <Camera size={18} />
                    <span>Open Live Viewfinder</span>
                  </Link>
                  <Link
                    href="/upload"
                    className="inline-flex items-center gap-2 rounded-2xl border border-[#E3E9E5] bg-[#FFFFFF] px-6 py-4 text-sm font-medium text-[#193B38] shadow-sm transition hover:bg-[#F2F5F1] hover:border-[#173F38]/20"
                  >
                    <UploadCloud size={17} className="text-[#21866D]" />
                    <span>Upload &amp; Analyze Photo</span>
                  </Link>
                </div>

                {/* Three Compact Benefits */}
                <div className="grid grid-cols-1 gap-3 pt-3 sm:grid-cols-3">
                  <div className="flex items-center gap-2 text-xs font-medium text-[#193B38]">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#EAF1ED] text-[#21866D]">
                      <Check size={12} strokeWidth={3} />
                    </span>
                    <span>Real-Time Guidance</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-medium text-[#193B38]">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#EAF1ED] text-[#21866D]">
                      <Check size={12} strokeWidth={3} />
                    </span>
                    <span>Aesthetic Analysis</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-medium text-[#193B38]">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#EAF1ED] text-[#21866D]">
                      <Check size={12} strokeWidth={3} />
                    </span>
                    <span>Smart Alignment</span>
                  </div>
                </div>
              </div>

              {/* RIGHT SIDE: Sophisticated Camera Viewfinder Preview */}
              <div className="lg:col-span-5">
                <div className="relative mx-auto max-w-lg rounded-3xl border border-[#E3E9E5] bg-[#FFFFFF] p-4 shadow-xl">
                  {/* Viewfinder Header Bar */}
                  <div className="flex items-center justify-between border-b border-[#E3E9E5] pb-3 text-[11px]">
                    <div className="flex items-center gap-2 font-mono uppercase tracking-wider text-[#193B38]">
                      <span className="relative flex h-2 w-2">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#16A085] opacity-75" />
                        <span className="relative inline-flex h-2 w-2 rounded-full bg-[#16A085]" />
                      </span>
                      <span className="font-semibold text-xs">PRE-CAPTURE HUD</span>
                    </div>
                    {/* Distinct Simulation Notice */}
                    <span className="rounded-full border border-[#E3E9E5] bg-[#F7F8F4] px-2.5 py-0.5 text-[9px] font-mono text-[#647773]">
                      STUDIO DEMO PREVIEW
                    </span>
                  </div>

                  {/* Camera Frame Viewport */}
                  <div className="relative mt-3.5 aspect-[4/3] w-full overflow-hidden rounded-2xl border border-[#E3E9E5] bg-[#0A0F0D]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=900&q=80"
                      alt="Camera Preview with Rule of Thirds"
                      className="h-full w-full object-cover filter brightness-[0.95]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-black/30 pointer-events-none" />

                    {/* Rule of Thirds Grid Overlay */}
                    <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none">
                      <div className="border-r border-b border-white/35" />
                      <div className="border-r border-b border-white/35 relative">
                        {/* Golden Reticle Over Subject's Eye */}
                        <div className="absolute -bottom-3.5 -right-3.5 flex h-7 w-7 items-center justify-center rounded-full border-2 border-[#16A085] bg-black/40 shadow-[0_0_12px_rgba(22,160,133,0.5)]">
                          <span className="h-1.5 w-1.5 rounded-full bg-[#16A085]" />
                        </div>
                      </div>
                      <div className="border-b border-white/35" />
                      <div className="border-r border-b border-white/35" />
                      <div className="border-r border-b border-white/35" />
                      <div className="border-b border-white/35" />
                      <div className="border-r border-b border-white/35" />
                      <div className="border-r border-b border-white/35" />
                      <div />
                    </div>

                    {/* Face Detection Bounding Overlay */}
                    <div className="absolute top-[16%] left-[22%] h-[68%] w-[56%] rounded-xl border border-[#16A085] bg-[#16A085]/10 p-2 flex flex-col justify-between pointer-events-none">
                      <div className="flex items-center justify-between">
                        <span className="rounded bg-[#173F38]/90 px-1.5 py-0.5 text-[9px] font-mono font-semibold text-white">
                          [1] PRIMARY SUBJECT
                        </span>
                        <span className="rounded bg-black/60 px-1.5 py-0.5 text-[9px] font-mono text-[#16A085]">
                          LOCK: 98%
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[9px] font-mono text-white/90">
                        <span className="bg-black/60 px-1.5 py-0.5 rounded">
                          HEADROOM: 18% (OPTIMAL)
                        </span>
                        <span className="bg-black/60 px-1.5 py-0.5 rounded">
                          DIST: 4.2 FT
                        </span>
                      </div>
                    </div>

                    {/* Horizon Alignment Guide Line */}
                    <div className="absolute inset-x-8 top-1/2 -translate-y-1/2 flex items-center justify-between pointer-events-none">
                      <div className="h-0.5 w-12 bg-[#16A085]" />
                      <div className="rounded-full border border-[#16A085]/60 bg-black/60 px-2 py-0.5 text-[9px] font-mono text-[#16A085]">
                        HORIZON LEVEL: 0.0°
                      </div>
                      <div className="h-0.5 w-12 bg-[#16A085]" />
                    </div>

                    {/* Live HUD Bottom Strip */}
                    <div className="absolute bottom-3 inset-x-3 flex items-center justify-between rounded-xl border border-white/20 bg-black/75 px-3 py-2 text-xs text-white backdrop-blur-md">
                      <div className="flex items-center gap-1.5 font-medium">
                        <CheckCircle2 size={14} className="text-[#16A085]" />
                        <span>Master Composition</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-serif italic font-bold text-[#16A085]">
                          Grade A+ (94/100)
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Technical Sensor Status Row */}
                  <div className="mt-3.5 grid grid-cols-3 gap-2 text-center">
                    <div className="rounded-xl border border-[#E3E9E5] bg-[#F7F8F4] p-2.5">
                      <div className="text-[9px] uppercase tracking-wider text-[#647773]">
                        AI Aesthetic
                      </div>
                      <div className="font-serif text-sm font-semibold text-[#193B38]">
                        9.4 / 10
                      </div>
                    </div>
                    <div className="rounded-xl border border-[#E3E9E5] bg-[#F7F8F4] p-2.5">
                      <div className="text-[9px] uppercase tracking-wider text-[#647773]">
                        Thirds Match
                      </div>
                      <div className="font-serif text-sm font-semibold text-[#21866D]">
                        98% Locked
                      </div>
                    </div>
                    <div className="rounded-xl border border-[#E3E9E5] bg-[#F7F8F4] p-2.5">
                      <div className="text-[9px] uppercase tracking-wider text-[#647773]">
                        Tilt Sensor
                      </div>
                      <div className="font-serif text-sm font-semibold text-[#193B38]">
                        Level 0.0°
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 3. CAPABILITY STRIP: Compact Horizontal Section */}
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 divide-y divide-[#E3E9E5] rounded-3xl border border-[#E3E9E5] bg-[#FFFFFF] shadow-sm sm:grid-cols-2 sm:divide-y-0 sm:divide-x lg:grid-cols-4">
            {capabilities.map((item, idx) => (
              <div key={idx} className="flex items-start gap-3.5 p-6">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#EAF1ED]">
                  {item.icon}
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-[#193B38]">{item.title}</h3>
                  <p className="mt-1 text-xs text-[#647773] leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 4. HOW FRAMESENSE WORKS: 3-Step Visual Explanation */}
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-[#E3E9E5] bg-[#FFFFFF] p-8 md:p-12 shadow-sm">
            {/* Section Header */}
            <div className="max-w-2xl space-y-2">
              <div className="inline-flex items-center gap-1.5 rounded-full border border-[#21866D]/20 bg-[#EAF1ED] px-3.5 py-1 text-[10px] font-mono font-medium uppercase tracking-wider text-[#173F38]">
                <span>Intuitive Workflow</span>
              </div>
              <h2 className="font-serif text-3xl sm:text-4xl font-normal italic tracking-tight text-[#193B38]">
                How FrameSense Works
              </h2>
              <p className="text-sm text-[#647773]">
                Three seamless steps to elevate casual phone snaps into balanced, professional photographs.
              </p>
            </div>

            {/* 3 Steps Grid */}
            <div className="mt-10 grid grid-cols-1 gap-8 md:grid-cols-3">
              {howItWorksSteps.map((stepItem, idx) => (
                <div
                  key={idx}
                  className="relative flex flex-col justify-between rounded-2xl border border-[#E3E9E5] bg-[#F7F8F4] p-7 transition hover:border-[#21866D]/40 hover:shadow-sm"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="font-serif text-3xl font-normal italic text-[#21866D]">
                        {stepItem.step}
                      </span>
                      <span className="rounded-full bg-[#FFFFFF] border border-[#E3E9E5] px-2.5 py-1 text-[10px] font-mono text-[#647773]">
                        Step {idx + 1}
                      </span>
                    </div>
                    <h3 className="text-base font-semibold text-[#193B38]">
                      {stepItem.title}
                    </h3>
                    <p className="text-xs text-[#647773] leading-relaxed">
                      {stepItem.desc}
                    </p>
                  </div>
                  <div className="mt-6 border-t border-[#E3E9E5] pt-3 text-[11px] font-medium text-[#21866D]">
                    {stepItem.highlight}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 5. KEY ENGINE FEATURES: 4 Refined Cards */}
        <section id="features" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 scroll-mt-24">
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#E3E9E5] pb-5">
              <div>
                <div className="inline-flex items-center gap-1.5 rounded-full border border-[#21866D]/20 bg-[#EAF1ED] px-3.5 py-1 text-[10px] font-mono font-medium uppercase tracking-wider text-[#173F38]">
                  <Sparkles size={12} className="text-[#21866D]" />
                  <span>Dual-Brain Architecture</span>
                </div>
                <h2 className="mt-2 font-serif text-3xl sm:text-4xl font-normal italic tracking-tight text-[#193B38]">
                  Key Engine Features
                </h2>
                <p className="mt-1 text-xs sm:text-sm text-[#647773] max-w-2xl">
                  Combining algorithmic geometry with GPU-accelerated deep learning to guide every angle before capture.
                </p>
              </div>
              <Link
                href="/live"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#173F38] hover:text-[#21866D] transition"
              >
                Launch Live Viewfinder <ArrowRight size={14} />
              </Link>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
              {keyFeatures.map((feat) => (
                <div
                  key={feat.id}
                  className="group flex flex-col justify-between rounded-3xl border border-[#E3E9E5] bg-[#FFFFFF] p-6 shadow-sm transition hover:border-[#21866D]/40 hover:shadow-md"
                >
                  <div className="space-y-3.5">
                    <div className="flex items-center justify-between">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#EAF1ED] transition group-hover:scale-105">
                        {feat.icon}
                      </div>
                      <span className="font-serif text-lg italic text-[#647773]">
                        {feat.id}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-base font-semibold text-[#193B38] group-hover:text-[#21866D] transition">
                        {feat.title}
                      </h3>
                      <div className="mt-0.5 text-[11px] font-medium text-[#21866D]">
                        {feat.subtitle}
                      </div>
                    </div>

                    <p className="text-xs text-[#647773] leading-relaxed">
                      {feat.desc}
                    </p>
                  </div>

                  <div className="mt-6 border-t border-[#E3E9E5] pt-4">
                    <button
                      onClick={() =>
                        setActiveFeatureModal({
                          title: feat.title,
                          subtitle: feat.subtitle,
                          desc: feat.desc,
                          bullets: feat.bullets,
                          metric: feat.metric,
                        })
                      }
                      className="flex items-center gap-1 text-xs font-semibold text-[#173F38] hover:text-[#21866D] transition"
                    >
                      <span>Technical Specs</span>
                      <ArrowRight size={12} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 6. INTERACTIVE COMPOSITION DEMO */}
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-[#E3E9E5] bg-[#FFFFFF] p-8 md:p-12 shadow-sm space-y-8">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 border-b border-[#E3E9E5] pb-6">
              <div>
                <div className="inline-flex items-center gap-1.5 rounded-full border border-[#21866D]/20 bg-[#EAF1ED] px-3.5 py-1 text-[10px] font-mono font-medium uppercase tracking-wider text-[#173F38]">
                  <Layers size={12} className="text-[#21866D]" />
                  <span>Interactive Demonstration</span>
                </div>
                <h2 className="mt-2 font-serif text-3xl sm:text-4xl font-normal italic tracking-tight text-[#193B38]">
                  Explore Composition Guides
                </h2>
                <p className="mt-1 text-xs sm:text-sm text-[#647773] max-w-2xl">
                  Toggle individual compositional layers to observe how FrameSense breaks down spatial structure and guides optimal camera placement.
                </p>
              </div>

              {/* Interactive Layer Switches */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => setDemoGrid(!demoGrid)}
                  className={`flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-medium transition ${
                    demoGrid
                      ? 'border-[#173F38] bg-[#173F38] text-white shadow-sm'
                      : 'border-[#E3E9E5] bg-[#FFFFFF] text-[#647773] hover:text-[#193B38]'
                  }`}
                >
                  <Grid3X3 size={13} /> Rule of Thirds
                </button>
                <button
                  onClick={() => setDemoSymmetry(!demoSymmetry)}
                  className={`flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-medium transition ${
                    demoSymmetry
                      ? 'border-[#173F38] bg-[#173F38] text-white shadow-sm'
                      : 'border-[#E3E9E5] bg-[#FFFFFF] text-[#647773] hover:text-[#193B38]'
                  }`}
                >
                  <Target size={13} /> Center Symmetry
                </button>
                <button
                  onClick={() => setDemoHorizon(!demoHorizon)}
                  className={`flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-medium transition ${
                    demoHorizon
                      ? 'border-[#173F38] bg-[#173F38] text-white shadow-sm'
                      : 'border-[#E3E9E5] bg-[#FFFFFF] text-[#647773] hover:text-[#193B38]'
                  }`}
                >
                  <Compass size={13} /> Horizon Line
                </button>
                <button
                  onClick={() => setDemoSubjectBox(!demoSubjectBox)}
                  className={`flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-medium transition ${
                    demoSubjectBox
                      ? 'border-[#173F38] bg-[#173F38] text-white shadow-sm'
                      : 'border-[#E3E9E5] bg-[#FFFFFF] text-[#647773] hover:text-[#193B38]'
                  }`}
                >
                  <Focus size={13} /> Focus Envelope
                </button>
                <button
                  onClick={() => setDemoAnnotations(!demoAnnotations)}
                  className={`flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-medium transition ${
                    demoAnnotations
                      ? 'border-[#173F38] bg-[#173F38] text-white shadow-sm'
                      : 'border-[#E3E9E5] bg-[#FFFFFF] text-[#647773] hover:text-[#193B38]'
                  }`}
                >
                  <Info size={13} /> Annotations
                </button>
              </div>
            </div>

            {/* Interactive Demo Viewport Container */}
            <div className="relative aspect-[16/9] min-h-[380px] w-full overflow-hidden rounded-3xl border border-[#E3E9E5] bg-[#0A0F0D] shadow-lg">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1400&q=80"
                alt="Interactive Composition Sample"
                className="h-full w-full object-cover filter brightness-[0.93]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />

              {/* Layer 1: Rule of Thirds */}
              {demoGrid && (
                <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none transition-opacity duration-200">
                  <div className="border-r border-b border-white/40" />
                  <div className="border-r border-b border-white/40 relative">
                    <div className="absolute -bottom-3 -right-3 h-6 w-6 rounded-full border-2 border-[#16A085] bg-black/40 flex items-center justify-center">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#16A085]" />
                    </div>
                  </div>
                  <div className="border-b border-white/40" />
                  <div className="border-r border-b border-white/40" />
                  <div className="border-r border-b border-white/40" />
                  <div className="border-b border-white/40" />
                  <div className="border-r border-b border-white/40" />
                  <div className="border-r border-b border-white/40" />
                  <div />
                </div>
              )}

              {/* Layer 2: Center Symmetry */}
              {demoSymmetry && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none transition-opacity duration-200">
                  <div className="h-full w-0.5 border-r border-dashed border-[#E5A33D]" />
                  <div className="absolute inset-x-0 h-0.5 border-b border-dashed border-[#E5A33D]" />
                  <div className="h-20 w-20 rounded-full border border-dashed border-[#E5A33D]/60" />
                </div>
              )}

              {/* Layer 3: Horizon Line */}
              {demoHorizon && (
                <div className="absolute inset-x-12 top-1/2 -translate-y-1/2 flex items-center justify-between pointer-events-none transition-opacity duration-200">
                  <div className="h-0.5 w-24 bg-[#16A085]" />
                  <div className="rounded-full bg-black/70 border border-[#16A085] px-3 py-1 text-[10px] font-mono text-[#16A085]">
                    HORIZON: 0.0° LEVEL (CALIBRATED)
                  </div>
                  <div className="h-0.5 w-24 bg-[#16A085]" />
                </div>
              )}

              {/* Layer 4: Subject Box Focus */}
              {demoSubjectBox && (
                <div className="absolute top-[16%] left-[30%] h-[68%] w-[40%] rounded-2xl border-2 border-[#16A085] bg-[#16A085]/10 p-3 pointer-events-none flex flex-col justify-between transition-opacity duration-200">
                  <span className="text-[10px] font-mono font-semibold text-white bg-[#173F38] px-2 py-0.5 rounded w-max">
                    SUBJECT AUTOFOCUS LOCKED
                  </span>
                  <div className="flex items-center justify-between text-[10px] font-mono text-white/90">
                    <span className="bg-black/70 px-2 py-0.5 rounded">
                      EST. DIST: 4.2 FT
                    </span>
                    <span className="bg-black/70 px-2 py-0.5 rounded">
                      CONFIDENCE: 98%
                    </span>
                  </div>
                </div>
              )}

              {/* Layer 5: Composition Annotations */}
              {demoAnnotations && (
                <div className="absolute inset-0 pointer-events-none p-6 flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="rounded-lg bg-black/70 border border-white/20 px-3 py-1 text-[10px] font-mono text-white">
                      TOP HEADROOM CLEARANCE: 18% (OPTIMAL)
                    </span>
                    <span className="rounded-lg bg-[#16A085] text-white px-3 py-1 text-[10px] font-mono font-semibold">
                      COMPOSITION SCORE: 94 / 100 (GRADE A+)
                    </span>
                  </div>
                  <div className="rounded-xl bg-black/75 border border-white/20 p-3 text-xs text-white max-w-md">
                    <p className="font-semibold text-[#16A085]">AI Framing Diagnostic:</p>
                    <p className="text-[11px] text-white/80 mt-0.5">
                      Subject placed on the upper-right third intersection. Lighting is soft and balanced across key facial features.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* 7. PORTFOLIO SHOWCASE: 3 Categories */}
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#E3E9E5] pb-5">
              <div>
                <div className="inline-flex items-center gap-1.5 rounded-full border border-[#21866D]/20 bg-[#EAF1ED] px-3.5 py-1 text-[10px] font-mono font-medium uppercase tracking-wider text-[#173F38]">
                  <Star size={12} className="text-[#21866D]" />
                  <span>Curated Portfolio</span>
                </div>
                <h2 className="mt-2 font-serif text-3xl sm:text-4xl font-normal italic tracking-tight text-[#193B38]">
                  Compositional Benchmarks
                </h2>
                <p className="mt-1 text-xs sm:text-sm text-[#647773]">
                  High-fidelity editorial captures evaluated under rigorous photographic heuristics.
                </p>
              </div>
              <Link
                href="/gallery"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#173F38] hover:text-[#21866D] transition"
              >
                Browse Full SQLite Gallery <ArrowRight size={14} />
              </Link>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {portfolioPhotos.map((photo) => (
                <div
                  key={photo.id}
                  className="group flex flex-col justify-between overflow-hidden rounded-3xl border border-[#E3E9E5] bg-[#FFFFFF] p-4 shadow-sm transition hover:shadow-lg"
                >
                  <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-[#F7F8F4]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={photo.image}
                      alt={photo.title}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-black/20" />

                    <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                      <span className="rounded-lg bg-white/95 px-2.5 py-1 text-[10px] font-semibold text-[#193B38] shadow-sm">
                        {photo.tag}
                      </span>
                      <span className="rounded-lg bg-[#173F38] px-2.5 py-1 text-[10px] font-bold text-white shadow-sm">
                        Grade {photo.grade}
                      </span>
                    </div>

                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white">
                      <span className="font-semibold text-xs drop-shadow">
                        {photo.title}
                      </span>
                      <span className="font-mono text-[11px] font-bold text-[#16A085] bg-black/60 px-2 py-0.5 rounded">
                        {photo.score} / 10
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 space-y-2 px-1">
                    <div className="text-[10px] uppercase font-mono tracking-wider text-[#647773]">
                      {photo.category}
                    </div>
                    <p className="text-xs text-[#647773] leading-relaxed">
                      {photo.insights}
                    </p>
                    <div className="pt-2">
                      <button
                        onClick={() => setInspectPhoto(photo)}
                        className="flex items-center gap-1.5 text-xs font-semibold text-[#173F38] hover:text-[#21866D] transition"
                      >
                        <Maximize2 size={12} /> Inspect Analysis
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 8. WHY FRAMESENSE AI */}
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-[#E3E9E5] bg-[#FFFFFF] p-8 md:p-12 shadow-sm space-y-8">
            <div className="max-w-2xl space-y-2">
              <div className="inline-flex items-center gap-1.5 rounded-full border border-[#21866D]/20 bg-[#EAF1ED] px-3.5 py-1 text-[10px] font-mono font-medium uppercase tracking-wider text-[#173F38]">
                <ShieldCheck size={12} className="text-[#21866D]" />
                <span>The Pre-Capture Advantage</span>
              </div>
              <h2 className="font-serif text-3xl sm:text-4xl font-normal italic tracking-tight text-[#193B38]">
                Why FrameSense AI?
              </h2>
              <p className="text-sm text-[#647773]">
                Traditional editing fixes photos after they are ruined. FrameSense ensures they are captured perfectly the first time.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {whyReasons.map((reason, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl border border-[#E3E9E5] bg-[#F7F8F4] p-6 space-y-3 transition hover:border-[#21866D]/40 hover:bg-[#FFFFFF]"
                >
                  <span className="inline-block rounded-full bg-[#EAF1ED] border border-[#21866D]/20 px-2.5 py-0.5 text-[9px] font-mono text-[#173F38]">
                    {reason.badge}
                  </span>
                  <h3 className="text-base font-semibold text-[#193B38]">
                    {reason.title}
                  </h3>
                  <p className="text-xs text-[#647773] leading-relaxed">
                    {reason.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 9. FAQ ACCORDION SECTION (8 SPECIFIED QUESTIONS) */}
        <section id="faq" className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 scroll-mt-24">
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <div className="inline-flex items-center gap-1.5 rounded-full border border-[#21866D]/20 bg-[#EAF1ED] px-3.5 py-1 text-[10px] font-mono font-medium uppercase tracking-wider text-[#173F38]">
                <HelpCircle size={12} className="text-[#21866D]" />
                <span>Answers &amp; Verification</span>
              </div>
              <h2 className="font-serif text-3xl sm:text-4xl font-normal italic tracking-tight text-[#193B38]">
                Frequently Asked Questions
              </h2>
              <p className="text-xs sm:text-sm text-[#647773]">
                Technical and operational details about our on-device engine and privacy architecture.
              </p>
            </div>

            <div className="space-y-3 pt-2">
              {faqs.map((faq, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl border border-[#E3E9E5] bg-[#FFFFFF] overflow-hidden shadow-sm transition hover:border-[#21866D]/30"
                >
                  <button
                    onClick={() => toggleFaq(idx)}
                    className="w-full flex items-center justify-between p-5 text-left text-sm font-semibold text-[#193B38] hover:bg-[#F7F8F4] transition"
                  >
                    <span>{faq.q}</span>
                    <span className="shrink-0 ml-4 text-[#647773]">
                      {openFaq === idx ? (
                        <ChevronUp size={18} className="text-[#21866D]" />
                      ) : (
                        <ChevronDown size={18} />
                      )}
                    </span>
                  </button>
                  {openFaq === idx && (
                    <div className="px-5 pb-5 text-xs sm:text-sm text-[#647773] leading-relaxed border-t border-[#E3E9E5] pt-3 bg-[#F7F8F4]/50">
                      {faq.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 10. FINAL CTA SECTION */}
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl bg-[#173F38] p-10 md:p-16 text-center text-white shadow-xl">
            <div className="relative z-10 max-w-2xl mx-auto space-y-5">
              <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal italic tracking-tight leading-tight">
                Ready to Capture Better Photographs?
              </h2>
              <p className="text-sm sm:text-base text-white/80 leading-relaxed">
                Bring intelligent composition guidance into every photography session.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3.5 pt-3">
                <Link
                  href="/live"
                  className="inline-flex items-center gap-2 rounded-2xl bg-white px-7 py-3.5 text-sm font-semibold text-[#173F38] shadow-sm transition hover:bg-[#F7F8F4] hover:scale-[1.01]"
                >
                  <Camera size={17} className="text-[#21866D]" />
                  <span>Open Live Viewfinder</span>
                </Link>
                <Link
                  href="/gallery"
                  className="inline-flex items-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-6 py-3.5 text-sm font-medium text-white backdrop-blur-sm transition hover:bg-white/20"
                >
                  <span>Explore Photo Gallery</span>
                  <ArrowRight size={15} />
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Global Shared Footer */}
      <Footer />

      {/* MODAL: Inspect Portfolio Photo Details */}
      {inspectPhoto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-xl rounded-3xl border border-[#E3E9E5] bg-[#FFFFFF] p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-[#E3E9E5] pb-3">
              <div>
                <span className="text-[10px] font-mono uppercase text-[#647773]">
                  {inspectPhoto.category}
                </span>
                <h3 className="text-lg font-serif italic text-[#193B38]">
                  {inspectPhoto.title}
                </h3>
              </div>
              <button
                onClick={() => setInspectPhoto(null)}
                className="rounded-xl border border-[#E3E9E5] p-1.5 text-[#647773] hover:bg-[#F7F8F4] hover:text-[#193B38]"
              >
                <X size={18} />
              </button>
            </div>

            <div className="relative aspect-[16/10] overflow-hidden rounded-2xl bg-black">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={inspectPhoto.image}
                alt={inspectPhoto.title}
                className="h-full w-full object-cover"
              />
              <div className="absolute top-3 right-3 rounded-lg bg-black/70 px-2.5 py-1 text-xs font-mono font-bold text-[#16A085]">
                {inspectPhoto.score} / 10 (Grade {inspectPhoto.grade})
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-[#193B38]">
                Heuristic Composition Breakdown
              </h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="rounded-xl border border-[#E3E9E5] bg-[#F7F8F4] p-2.5">
                  <span className="text-[10px] text-[#647773] block">Rule of Thirds</span>
                  <span className="font-semibold text-[#173F38]">
                    {inspectPhoto.technical.thirds}
                  </span>
                </div>
                <div className="rounded-xl border border-[#E3E9E5] bg-[#F7F8F4] p-2.5">
                  <span className="text-[10px] text-[#647773] block">Headroom Ratio</span>
                  <span className="font-semibold text-[#173F38]">
                    {inspectPhoto.technical.headroom}
                  </span>
                </div>
                <div className="rounded-xl border border-[#E3E9E5] bg-[#F7F8F4] p-2.5">
                  <span className="text-[10px] text-[#647773] block">Horizon Tilt</span>
                  <span className="font-semibold text-[#173F38]">
                    {inspectPhoto.technical.tilt}
                  </span>
                </div>
                <div className="rounded-xl border border-[#E3E9E5] bg-[#F7F8F4] p-2.5">
                  <span className="text-[10px] text-[#647773] block">Estimated Depth</span>
                  <span className="font-semibold text-[#173F38]">
                    {inspectPhoto.technical.distance}
                  </span>
                </div>
              </div>
              <p className="text-xs text-[#647773] leading-relaxed pt-1">
                {inspectPhoto.insights}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Technical Specs of Key Features */}
      {activeFeatureModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-lg rounded-3xl border border-[#E3E9E5] bg-[#FFFFFF] p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-[#E3E9E5] pb-3">
              <div>
                <span className="text-[10px] font-mono text-[#21866D] font-semibold uppercase">
                  {activeFeatureModal.subtitle}
                </span>
                <h3 className="text-lg font-serif italic text-[#193B38]">
                  {activeFeatureModal.title}
                </h3>
              </div>
              <button
                onClick={() => setActiveFeatureModal(null)}
                className="rounded-xl border border-[#E3E9E5] p-1.5 text-[#647773] hover:bg-[#F7F8F4] hover:text-[#193B38]"
              >
                <X size={18} />
              </button>
            </div>

            <p className="text-xs text-[#647773] leading-relaxed">
              {activeFeatureModal.desc}
            </p>

            <div className="space-y-2">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-[#193B38]">
                Core Specifications
              </h4>
              <ul className="space-y-1.5 text-xs text-[#647773]">
                {activeFeatureModal.bullets.map((bullet, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#21866D]" />
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl border border-[#E3E9E5] bg-[#F7F8F4] p-3 text-xs flex items-center justify-between">
              <span className="text-[#647773]">Target Benchmark</span>
              <span className="font-mono font-semibold text-[#173F38]">
                {activeFeatureModal.metric}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
