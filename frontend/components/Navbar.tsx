'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Aperture,
  Camera,
  UploadCloud,
  History,
  LogIn,
  LogOut,
  Home,
  User,
  Menu,
  X,
  Sparkles,
  ChevronDown
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'

export default function Navbar() {
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false)

  const navLinks = [
    { href: '/', label: 'Home', icon: <Home size={15} /> },
    { href: '/live', label: 'Live Viewfinder', icon: <Camera size={15} /> },
    { href: '/upload', label: 'Upload & Audit', icon: <UploadCloud size={15} /> },
    { href: '/gallery', label: 'Photo Gallery', icon: <History size={15} /> },
  ]

  return (
    <header className="sticky top-0 z-50 border-b border-[#E3E9E5] bg-[#F7F8F4]/90 backdrop-blur-md">
      <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* LEFT: FrameSense Brand Logo + Title + AI Badge + Tagline */}
        <Link
          href="/"
          className="group flex items-center gap-3 transition hover:opacity-95"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#173F38] text-[#F7F8F4] shadow-sm transition group-hover:scale-105">
            <Aperture size={20} className="transition group-hover:rotate-45" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-serif text-lg font-normal italic tracking-tight text-[#193B38] sm:text-xl">
                FrameSense
              </span>
              <span className="rounded-full border border-[#21866D]/20 bg-[#EAF1ED] px-2 py-0.5 text-[9px] font-mono font-semibold tracking-wider text-[#173F38]">
                AI
              </span>
            </div>
            <span className="hidden text-[9px] uppercase tracking-[.18em] text-[#647773] md:block">
              Real-Time Composition &amp; Aesthetic Intelligence
            </span>
          </div>
        </Link>

        {/* CENTER: Primary Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 rounded-2xl border border-[#E3E9E5] bg-[#FFFFFF] p-1.5 shadow-sm">
          {navLinks.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 rounded-xl px-3.5 py-1.5 text-xs font-medium transition ${
                  isActive
                    ? 'bg-[#173F38] text-white shadow-sm'
                    : 'text-[#647773] hover:bg-[#F2F5F1] hover:text-[#193B38]'
                }`}
              >
                <span className={isActive ? 'text-white' : 'text-[#21866D]'}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>

        {/* RIGHT: GPU Status Indicator + User Profile Dropdown / Sign Out */}
        <div className="flex items-center gap-3">
          {/* GPU Hardware Status Indicator */}
          <div className="hidden lg:flex items-center gap-2 rounded-full border border-[#E3E9E5] bg-[#FFFFFF] px-3.5 py-1.5 text-[10px] font-mono text-[#193B38] shadow-sm">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#16A085] opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[#16A085]" />
            </span>
            <span className="font-semibold text-[#173F38]">RTX 3050 CUDA</span>
            <span className="text-[#647773]">• 10.8ms</span>
          </div>

          {/* User Profile Dropdown & Session */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-2.5 rounded-2xl border border-[#E3E9E5] bg-[#FFFFFF] p-1.5 pr-3 text-left shadow-sm transition hover:border-[#21866D]/40 hover:bg-[#F7F8F4]"
                title="Account Menu"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#EAF1ED] text-xs font-semibold text-[#173F38] overflow-hidden">
                  {user.avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={user.avatarUrl}
                      alt={user.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    user.avatarText || 'DK'
                  )}
                </div>
                <div className="hidden sm:block text-left">
                  <div className="text-xs font-semibold text-[#193B38] leading-tight">
                    {user.name}
                  </div>
                  <div className="text-[10px] text-[#647773]">{user.role}</div>
                </div>
                <ChevronDown size={14} className="text-[#647773]" />
              </button>

              {/* Dropdown Menu */}
              {profileDropdownOpen && (
                <div
                  className="absolute right-0 mt-2 w-52 rounded-2xl border border-[#E3E9E5] bg-[#FFFFFF] p-2 shadow-xl animate-in fade-in slide-in-from-top-2 duration-150 z-50"
                  onMouseLeave={() => setProfileDropdownOpen(false)}
                >
                  <div className="border-b border-[#E3E9E5] px-3 py-2">
                    <p className="text-xs font-semibold text-[#193B38]">{user.name}</p>
                    <p className="text-[10px] text-[#647773] truncate">{user.email}</p>
                  </div>
                  <div className="py-1">
                    <Link
                      href="/profile"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs text-[#193B38] hover:bg-[#F7F8F4] transition"
                    >
                      <User size={14} className="text-[#21866D]" />
                      Profile Settings
                    </Link>
                    <Link
                      href="/gallery"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs text-[#193B38] hover:bg-[#F7F8F4] transition"
                    >
                      <History size={14} className="text-[#21866D]" />
                      Saved Captures
                    </Link>
                  </div>
                  <div className="border-t border-[#E3E9E5] pt-1">
                    <button
                      onClick={() => {
                        setProfileDropdownOpen(false)
                        logout()
                      }}
                      className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs text-[#DC5C5C] hover:bg-rose-50 transition"
                    >
                      <LogOut size={14} />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/login"
              className="flex items-center gap-1.5 rounded-xl bg-[#173F38] px-4 py-2 text-xs font-medium text-white shadow-sm transition hover:bg-[#21866D]"
            >
              <LogIn size={14} /> Sign In
            </Link>
          )}

          {/* Mobile Hamburger Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex md:hidden h-10 w-10 items-center justify-center rounded-xl border border-[#E3E9E5] bg-[#FFFFFF] text-[#193B38] shadow-sm transition hover:bg-[#F2F5F1]"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* MOBILE NAVIGATION DRAWER */}
      {mobileMenuOpen && (
        <div className="border-t border-[#E3E9E5] bg-[#FFFFFF] px-4 py-5 shadow-lg md:hidden animate-in slide-in-from-top-4 duration-200">
          <div className="space-y-1.5">
            {navLinks.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
                    isActive
                      ? 'bg-[#173F38] text-white shadow-sm'
                      : 'text-[#193B38] hover:bg-[#F7F8F4]'
                  }`}
                >
                  <span className={isActive ? 'text-white' : 'text-[#21866D]'}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </div>

          <div className="mt-4 border-t border-[#E3E9E5] pt-4">
            <div className="flex items-center justify-between rounded-xl border border-[#E3E9E5] bg-[#F7F8F4] p-3 text-xs">
              <span className="flex items-center gap-2 text-[#647773] font-mono text-[11px]">
                <span className="h-2 w-2 rounded-full bg-[#16A085]" />
                RTX 3050 CUDA 12.4
              </span>
              <span className="font-semibold text-[#173F38]">92 FPS</span>
            </div>

            {user ? (
              <div className="mt-3 flex items-center justify-between pt-2">
                <Link
                  href="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 text-xs font-semibold text-[#193B38]"
                >
                  <User size={15} className="text-[#21866D]" /> My Profile &amp; Settings
                </Link>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false)
                    logout()
                  }}
                  className="flex items-center gap-1 text-xs font-semibold text-[#DC5C5C]"
                >
                  <LogOut size={14} /> Sign Out
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-[#173F38] py-2.5 text-xs font-semibold text-white shadow-sm"
              >
                <LogIn size={15} /> Sign In to FrameSense
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
