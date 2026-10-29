'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Aperture, Lock, Mail, Eye, EyeOff, ArrowRight, Sparkles } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'

export default function LoginPage() {
  const { login } = useAuth()
  const [email, setEmail] = useState('dev.kumar@gla.ac.in')
  const [password, setPassword] = useState('••••••••••••')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setErrorMessage('')

    setTimeout(() => {
      login(email)
    }, 400)
  }

  const setDemoUser = (userEmail: string, role: string, name: string) => {
    setEmail(userEmail)
    setPassword('DemoPass2026!')
    setIsLoading(true)
    setTimeout(() => {
      login(userEmail, name, role)
    }, 300)
  }

  return (
    <div className="flex min-h-screen flex-col justify-between bg-[#070a0d] text-[#e7f0ed] selection:bg-[#d9ff5b] selection:text-[#070a0d]">
      {/* Top Bar */}
      <header className="flex h-16 items-center justify-between border-b border-white/[.08] px-6 lg:px-12">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#d9ff5b] text-[#0b1008] shadow-[0_0_20px_rgba(217,255,91,.2)]">
            <Aperture size={20} />
          </div>
          <div className="flex items-center gap-2 text-sm font-semibold tracking-tight text-white">
            FrameSense <span className="rounded-full bg-[#d9ff5b]/15 px-2 py-0.5 text-[9px] font-bold tracking-widest text-[#d9ff5b]">AI</span>
          </div>
        </div>

        <div className="text-xs text-[#7f8e93]">
          GLA University, Mathura &bull; Class of 2026
        </div>
      </header>

      {/* Main Login Card */}
      <main className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#d9ff5b]/20 bg-[#d9ff5b]/[.06] px-3.5 py-1 text-[11px] font-medium text-[#badb7b]">
              <Sparkles size={12} className="text-[#d9ff5b]" />
              Studio Access Required
            </div>
            <h1 className="mt-4 text-2xl font-black tracking-tight text-white lg:text-3xl">
              Sign In to FrameSense
            </h1>
            <p className="mt-1 text-xs text-[#718085]">
              Please authenticate to access the Live Viewfinder, Upload Studio, and Gallery.
            </p>
          </div>

          <div className="rounded-3xl border border-white/[.08] bg-[#0d1316] p-7 shadow-2xl">
            <form onSubmit={handleLogin} className="space-y-4">
              {errorMessage && (
                <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-400">
                  {errorMessage}
                </div>
              )}

              {/* Email */}
              <div>
                <label className="text-[11px] font-semibold uppercase tracking-wider text-[#88999d]">
                  Email Address
                </label>
                <div className="relative mt-1.5">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-[#5e6d72]">
                    <Mail size={16} />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="photographer@studio.com"
                    className="w-full rounded-xl border border-white/10 bg-[#12191d] py-2.5 pr-4 pl-10 text-xs text-white placeholder-[#4c595e] focus:border-[#d9ff5b] focus:outline-none"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-semibold uppercase tracking-wider text-[#88999d]">
                    Password
                  </label>
                  <a href="#" className="text-[10px] text-[#38bdf8] hover:underline">
                    Forgot Password?
                  </a>
                </div>
                <div className="relative mt-1.5">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-[#5e6d72]">
                    <Lock size={16} />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full rounded-xl border border-white/10 bg-[#12191d] py-2.5 pr-10 pl-10 text-xs text-white placeholder-[#4c595e] focus:border-[#d9ff5b] focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-[#5e6d72] hover:text-white"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Remember Me */}
              <div className="flex items-center gap-2 pt-1 text-xs text-[#718085]">
                <input
                  type="checkbox"
                  id="remember"
                  defaultChecked
                  className="rounded border-white/20 bg-white/5 text-[#d9ff5b] accent-[#d9ff5b]"
                />
                <label htmlFor="remember" className="cursor-pointer text-[11px]">
                  Keep me signed in on this device
                </label>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isLoading}
                className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-[#d9ff5b] py-3 text-xs font-bold text-[#070a0d] shadow-[0_0_20px_rgba(217,255,91,.25)] transition hover:bg-[#c7f347] disabled:opacity-50"
              >
                {isLoading ? (
                  <span>Signing In...</span>
                ) : (
                  <>
                    <span>Enter Studio Viewfinder</span>
                    <ArrowRight size={14} />
                  </>
                )}
              </button>
            </form>

            {/* Quick Demo Logins for Evaluation / Viva */}
            <div className="mt-6 border-t border-white/[.07] pt-5">
              <div className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-[#526065]">
                1-Click Academic Demo Profiles
              </div>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setDemoUser('dev.kumar@gla.ac.in', 'Lead Researcher', 'Dev Kumar Tarkar')}
                  className="rounded-xl border border-white/10 bg-[#12191d] p-2 text-center text-[10px] transition hover:border-[#d9ff5b]/40 hover:bg-[#162025]"
                >
                  <div className="font-bold text-white">Dev Kumar</div>
                  <div className="text-[9px] text-[#6b7a7f]">Lead</div>
                </button>
                <button
                  type="button"
                  onClick={() => setDemoUser('dev.aggarwal@gla.ac.in', 'ML Engineer', 'Dev Aggarwal')}
                  className="rounded-xl border border-white/10 bg-[#12191d] p-2 text-center text-[10px] transition hover:border-[#d9ff5b]/40 hover:bg-[#162025]"
                >
                  <div className="font-bold text-white">Dev Aggarwal</div>
                  <div className="text-[9px] text-[#6b7a7f]">ML Eng</div>
                </button>
                <button
                  type="button"
                  onClick={() => setDemoUser('sanjana.shaw@gla.ac.in', 'Project Mentor', 'Ms. Sanjana Shaw')}
                  className="rounded-xl border border-white/10 bg-[#12191d] p-2 text-center text-[10px] transition hover:border-[#d9ff5b]/40 hover:bg-[#162025]"
                >
                  <div className="font-bold text-white">Ms. Sanjana</div>
                  <div className="text-[9px] text-[#6b7a7f]">Mentor</div>
                </button>
              </div>
            </div>
          </div>

          {/* Sign up prompt */}
          <div className="text-center text-xs text-[#718085]">
            New to FrameSense AI?{' '}
            <Link href="/register" className="font-semibold text-[#d9ff5b] hover:underline">
              Create a free account &rarr;
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/[.07] py-4 text-center text-[11px] text-[#556367]">
        B.Tech Major Project &bull; GLA University, Mathura &bull; Class of 2026
      </footer>
    </div>
  )
}
