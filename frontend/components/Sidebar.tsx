'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Camera, UploadCloud, History, User, LogIn, LogOut, CircleHelp, ShieldCheck, Home } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'

export default function Sidebar({ cameraLabel = 'Integrated Webcam', cameraActive = true }: { cameraLabel?: string; cameraActive?: boolean }) {
  const pathname = usePathname()
  const { user, logout } = useAuth()

  const links = [
    { href: '/', label: 'Home', icon: <Home size={16} /> },
    { href: '/live', label: 'Live Viewfinder', icon: <Camera size={16} /> },
    { href: '/upload', label: 'Upload & Audit', icon: <UploadCloud size={16} /> },
    { href: '/gallery', label: 'Photo Gallery', icon: <History size={16} /> },
    { href: '/profile', label: 'My Profile', icon: <User size={16} /> },
  ]

  return (
    <aside className="hidden w-[200px] shrink-0 flex-col justify-between xl:flex">
      <div>
        <div className="mb-4 px-3 text-[10px] uppercase tracking-[.18em] text-[#536064]">Navigation</div>
        <nav className="space-y-1.5">
          {links.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-left text-[12px] font-medium transition ${
                  isActive
                    ? 'bg-[#d9ff5b] font-semibold text-[#10150d] shadow-sm'
                    : 'text-[#738085] hover:bg-white/[.04] hover:text-white'
                }`}
              >
                {item.icon}
                {item.label}
              </Link>
            )
          })}

          {user ? (
            <button
              onClick={logout}
              className="flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-left text-[12px] font-medium text-[#738085] transition hover:bg-rose-500/10 hover:text-rose-400"
            >
              <LogOut size={16} />
              Sign Out
            </button>
          ) : (
            <Link
              href="/login"
              className="flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-left text-[12px] font-medium text-[#d9ff5b] transition hover:bg-[#d9ff5b]/10"
            >
              <LogIn size={16} />
              Sign In
            </Link>
          )}
        </nav>

        <div className="my-7 h-px bg-white/[.07]" />

        <div className="px-3 text-[10px] uppercase tracking-[.18em] text-[#536064]">Hardware Engine</div>
        <div className="mt-3 rounded-2xl border border-white/[.08] bg-[#101619] p-3.5">
          <div className="mb-2.5 flex items-center gap-2">
            <span className={`h-2 w-2 rounded-full ${cameraActive ? 'bg-[#d9ff5b]' : 'bg-[#ff6868]'}`} />
            <span className="text-xs text-[#dbe3df] font-medium">Camera 01</span>
          </div>
          <div className="truncate text-[10px] text-[#657277]" title={cameraLabel}>
            {cameraLabel}
          </div>
          <div className="mt-2 font-mono text-[10px] text-[#8d9a9c]">640x480 / 60 FPS HUD</div>
          <div className="mt-2 text-[9px] text-[#10b981] font-semibold flex items-center gap-1">
            <ShieldCheck size={12} /> CUDA 12.4 (RTX 3050)
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-white/[.07] p-3.5 text-[10px] leading-relaxed text-[#637075]">
        <CircleHelp className="mb-2 text-[#8a9999]" size={15} />
        Dual-Brain Architecture: Host CPU BlazeFace + GPU NIMA
      </div>
    </aside>
  )
}
