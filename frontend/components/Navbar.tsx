'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Aperture, Camera, UploadCloud, History, LogIn, LogOut, Home } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'

export default function Navbar() {
  const pathname = usePathname()
  const { user, logout } = useAuth()

  const navLinks = [
    { href: '/', label: 'Home', icon: <Home size={14} /> },
    { href: '/live', label: 'Live Viewfinder', icon: <Camera size={14} /> },
    { href: '/upload', label: 'Upload & Audit', icon: <UploadCloud size={14} /> },
    { href: '/gallery', label: 'Photo Gallery', icon: <History size={14} /> },
  ]

  return (
    <header className="flex h-[74px] items-center justify-between border-b border-white/[.08] bg-[#070a0d] px-5 lg:px-9 sticky top-0 z-50">
      {/* Brand Logo */}
      <Link href="/" className="flex items-center gap-3.5 transition hover:opacity-90">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#d9ff5b] text-[#0b1008] shadow-[0_0_30px_rgba(217,255,91,.18)]">
          <Aperture size={21} />
        </div>
        <div>
          <div className="flex items-center gap-2 text-[15px] font-semibold tracking-[-.03em] text-white">
            FrameSense <span className="rounded-full bg-[#d9ff5b]/15 px-2 py-0.5 text-[9px] font-bold tracking-[.16em] text-[#d9ff5b]">AI</span>
          </div>
          <div className="mt-0.5 text-[9px] uppercase tracking-[.2em] text-[#6c777a]">
            Real-time composition &amp; aesthetic intelligence
          </div>
        </div>
      </Link>

      {/* Center Nav Links */}
      {user && (
        <nav className="hidden md:flex items-center gap-1.5 rounded-2xl border border-white/[.08] bg-[#101619] p-1.5">
          {navLinks.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition ${
                  isActive
                    ? 'bg-[#d9ff5b] text-[#070a0d] shadow-sm'
                    : 'text-[#8b999c] hover:bg-white/[.04] hover:text-white'
                }`}
              >
                {item.icon}
                {item.label}
              </Link>
            )
          })}
        </nav>
      )}

      {/* Right Controls & Auth */}
      <div className="flex items-center gap-3">
        {/* Hardware badge */}
        <div className="hidden items-center gap-2 rounded-full border border-[#d9ff5b]/20 bg-[#d9ff5b]/[.06] px-3.5 py-1.5 text-[10px] uppercase tracking-[.12em] text-[#badb7b] sm:flex">
          <span className="h-1.5 w-1.5 rounded-full bg-[#d9ff5b] shadow-[0_0_9px_#d9ff5b]" />
          RTX 3050 CUDA Online
        </div>

        {/* User Session Profile / Sign Out */}
        {user ? (
          <div className="flex items-center gap-2">
            <Link
              href="/profile"
              className="flex items-center gap-2 rounded-xl border border-white/10 bg-[#101619] p-1.5 pr-3 text-left transition hover:border-[#d9ff5b]/40 hover:bg-[#141b1f]"
              title="View Profile & Settings"
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#1d2926] text-[11px] font-bold text-[#d9ff5b] overflow-hidden">
                {user.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={user.avatarUrl} alt={user.name} className="h-full w-full object-cover" />
                ) : (
                  user.avatarText || 'DK'
                )}
              </div>
              <div className="hidden lg:block">
                <div className="text-[11px] font-semibold text-white leading-tight">{user.name}</div>
                <div className="text-[9px] text-[#6c777a]">{user.role}</div>
              </div>
            </Link>

            <button
              onClick={logout}
              className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/[.04] p-2 text-xs text-[#8c9ca0] transition hover:border-rose-500/40 hover:bg-rose-500/10 hover:text-rose-400"
              title="Sign Out"
            >
              <LogOut size={15} />
            </button>
          </div>
        ) : (
          <Link
            href="/login"
            className="flex items-center gap-1.5 rounded-xl bg-[#d9ff5b] px-4 py-2 text-xs font-bold text-[#070a0d] shadow-sm transition hover:bg-[#c7f347]"
          >
            <LogIn size={14} /> Sign In
          </Link>
        )}
      </div>
    </header>
  )
}
