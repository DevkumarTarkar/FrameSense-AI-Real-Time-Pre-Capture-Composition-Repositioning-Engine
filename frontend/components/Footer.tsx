import Link from 'next/link'
import { Aperture, ShieldCheck, Database, Cpu } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-[#E3E9E5] bg-[#FFFFFF] text-[#193B38] font-sans">
      <div className="mx-auto max-w-[1720px] px-6 py-12 lg:px-12">
        {/* Main 3-Column Desktop / 2-Column Tablet / 1-Column Mobile Layout */}
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-12">
          {/* COLUMN 1 - BRAND (lg:col-span-5) */}
          <div className="space-y-4 lg:col-span-5">
            <Link href="/" className="inline-flex items-center gap-3 transition hover:opacity-90">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#173F38] text-white shadow-sm">
                <Aperture size={22} />
              </div>
              <div className="flex items-center gap-2 font-serif text-xl font-normal italic tracking-tight text-[#193B38]">
                FrameSense <span className="rounded-full border border-[#21866D]/20 bg-[#EAF1ED] px-2 py-0.5 text-[9px] font-mono font-semibold tracking-wider text-[#173F38] not-italic">AI</span>
              </div>
            </Link>

            <p className="text-xs font-semibold text-[#173F38]">
              Capture smarter. Compose better. Create with confidence.
            </p>

            <p className="max-w-md text-xs leading-relaxed text-[#647773]">
              Real-time spatial scene understanding, tilt sensor calibration, and deep aesthetic scoring for mobile and studio cameras.
            </p>
          </div>

          {/* COLUMN 2 - PRODUCT NAVIGATION (lg:col-span-3) */}
          <div className="space-y-3 lg:col-span-3">
            <h4 className="text-[11px] font-semibold uppercase tracking-[.18em] text-[#647773]">
              Product
            </h4>
            <ul className="space-y-2.5 text-xs font-medium text-[#193B38]">
              <li>
                <Link
                  href="/live"
                  className="transition hover:text-[#21866D] hover:underline hover:underline-offset-4"
                >
                  Live Viewfinder
                </Link>
              </li>
              <li>
                <Link
                  href="/upload"
                  className="transition hover:text-[#21866D] hover:underline hover:underline-offset-4"
                >
                  Upload &amp; Audit
                </Link>
              </li>
              <li>
                <Link
                  href="/gallery"
                  className="transition hover:text-[#21866D] hover:underline hover:underline-offset-4"
                >
                  Photo Gallery
                </Link>
              </li>
              <li>
                <Link
                  href="/profile"
                  className="transition hover:text-[#21866D] hover:underline hover:underline-offset-4"
                >
                  Profile &amp; Settings
                </Link>
              </li>
            </ul>
          </div>

          {/* COLUMN 3 - ACADEMIC INFORMATION (lg:col-span-4) */}
          <div className="space-y-3 lg:col-span-4">
            <h4 className="text-[11px] font-semibold uppercase tracking-[.18em] text-[#647773]">
              Academic Information
            </h4>
            <div className="space-y-2 text-xs text-[#647773] leading-relaxed">
              <p>
                Department of Computer Science &amp; Engineering,
                <br />
                <span className="font-medium text-[#193B38]">GLA University, Mathura</span>
              </p>
              <p>
                Project Lead: <span className="font-semibold text-[#173F38]">Dev Kumar Tarkar</span>
              </p>
              <p className="font-mono text-[11px] text-[#647773]">
                Class of 2026
              </p>
            </div>
          </div>
        </div>

        {/* BOTTOM BAR DIVIDER */}
        <div className="mt-10 border-t border-[#E3E9E5] pt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between text-[11px] text-[#647773]">
          <div>
            &copy; 2026 FrameSense AI. All rights reserved.
          </div>

          <div className="flex flex-wrap items-center gap-4 text-[11px]">
            <span className="flex items-center gap-1.5 text-[#21866D] font-medium">
              <ShieldCheck size={13} /> On-Device Privacy
            </span>
            <span className="hidden sm:inline text-[#E3E9E5]">&bull;</span>
            <span className="flex items-center gap-1.5 text-[#173F38] font-medium">
              <Database size={13} /> SQLite Persistent Storage
            </span>
            <span className="hidden sm:inline text-[#E3E9E5]">&bull;</span>
            <span className="flex items-center gap-1.5 text-[#21866D] font-medium">
              <Cpu size={13} /> NVIDIA CUDA Powered
            </span>
          </div>
        </div>
      </div>
    </footer>
  )
}
