'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Camera, UploadCloud, History, User, LogIn, LogOut, CircleHelp, ShieldCheck, Home } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'

export default function Sidebar({
  cameraLabel = 'Integrated Webcam',
  cameraActive = true,
}: {
  cameraLabel?: string
  cameraActive?: boolean
}) {
  const pathname = usePathname()
  const { user, logout } = useAuth()

  const links = [
    { href: '/', label: 'Home', icon: <Home size={18} /> },
    { href: '/live', label: 'Live Viewfinder', icon: <Camera size={18} /> },
    { href: '/upload', label: 'Upload & Audit', icon: <UploadCloud size={18} /> },
    { href: '/gallery', label: 'Photo Gallery', icon: <History size={18} /> },
    { href: '/profile', label: 'My Profile', icon: <User size={18} /> },
  ]

  return (
    <aside className="hidden w-[210px] shrink-0 flex-col justify-between pt-1 xl:flex">
      <div>
        <nav className="space-y-1.5">
          {links.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex h-12 w-full items-center gap-3 rounded-xl px-4 text-left text-xs font-medium transition ${
                  isActive
                    ? 'bg-[#173F38] font-semibold text-white shadow-sm'
                    : 'text-[#647773] hover:bg-white hover:text-[#193B38]'
                }`}
              >
                <span className={isActive ? 'text-white' : 'text-[#21866D]'}>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            )
          })}

          {user ? (
            <button
              onClick={logout}
              className="flex h-12 w-full items-center gap-3 rounded-xl px-4 text-left text-xs font-medium text-[#647773] transition hover:bg-rose-50 hover:text-rose-600"
            >
              <LogOut size={18} />
              <span>Sign Out</span>
            </button>
          ) : (
            <Link
              href="/login"
              className="flex h-12 w-full items-center gap-3 rounded-xl px-4 text-left text-xs font-medium text-[#193B38] transition hover:bg-[#EAF1ED]"
            >
              <LogIn size={18} />
              <span>Sign In</span>
            </Link>
          )}
        </nav>

        <div className="my-6 h-px bg-[#E3E9E5]" />

        <div className="px-3 text-[10px] uppercase tracking-[.18em] text-[#647773] font-semibold">
          Hardware Engine
        </div>
        <div className="mt-2.5 rounded-2xl border border-[#E3E9E5] bg-[#FFFFFF] p-4 shadow-sm">
          <div className="mb-2 flex items-center gap-2">
            <span
              className={`h-2 w-2 rounded-full ${
                cameraActive ? 'bg-[#16A085]' : 'bg-[#DC5C5C]'
              }`}
            />
            <span className="text-xs text-[#193B38] font-semibold">Camera Sensor 01</span>
          </div>
          <div className="truncate text-[11px] text-[#647773]" title={cameraLabel}>
            {cameraLabel}
          </div>
          <div className="mt-2 font-mono text-[10px] text-[#647773]">640x480 / 60 FPS HUD</div>
          <div className="mt-2.5 flex items-center gap-1.5 text-[10px] font-semibold text-[#21866D]">
            <ShieldCheck size={13} /> CUDA 12.4 (RTX 3050)
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-[#E3E9E5] bg-[#EAF1ED]/60 p-4 text-[11px] leading-relaxed text-[#647773]">
        <CircleHelp className="mb-2 text-[#173F38]" size={16} />
        Dual-Brain Architecture: Host CPU BlazeFace + GPU NIMA
      </div>
    </aside>
  )
}
