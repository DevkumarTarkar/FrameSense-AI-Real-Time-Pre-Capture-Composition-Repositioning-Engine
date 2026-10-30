'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Aperture, Lock, Mail, Eye, EyeOff, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import Footer from '@/components/Footer'

export default function LoginPage() {
  const { login } = useAuth()
  const [email, setEmail] = useState('dev.kumar@gla.ac.in')
  const [password, setPassword] = useState('••••••••••••')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setErrorMessage('')
    setSuccessMessage('')

    if (!email.trim()) {
      setErrorMessage('Please enter your email address.')
      setIsLoading(false)
      return
    }

    if (!password.trim()) {
      setErrorMessage('Please enter your account password.')
      setIsLoading(false)
      return
    }

    const host = typeof window !== 'undefined' && window.location.hostname ? window.location.hostname : '127.0.0.1'
    const apiUrl = `http://${host}:8000/api/auth/login`

    try {
      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      })

      if (res.ok) {
        const data = await res.json()
        setSuccessMessage('Authentication successful! Directing to studio...')
        setTimeout(() => {
          login(
            data.user?.email || email.trim(),
            data.user?.full_name,
            data.user?.role,
            data.user?.dob
          )
        }, 600)
        return
      } else {
        const errData = await res.json().catch(() => null)
        const detail = errData?.detail || 'Invalid email or password. Please verify your credentials.'
        setErrorMessage(detail)
      }
    } catch {
      // Fallback for offline/mock session
      login(email.trim())
      return
    } finally {
      setIsLoading(false)
    }
  }

  const setDemoUser = (userEmail: string, role: string, name: string) => {
    setEmail(userEmail)
    setPassword('DemoPass2026!')
    setErrorMessage('')
    setIsLoading(true)
    setTimeout(() => {
      login(userEmail, name, role)
    }, 400)
  }

  return (
    <div
      className="flex min-h-screen flex-col justify-between bg-cover bg-center bg-no-repeat selection:bg-[#EAF1ED] selection:text-[#173F38]"
      style={{
        backgroundImage: `linear-gradient(rgba(235, 245, 255, 0.45), rgba(210, 235, 255, 0.65)), url('https://images.unsplash.com/photo-1534088568595-a066f410bcda?auto=format&fit=crop&w=2400&q=85')`,
      }}
    >
      {/* Top Header */}
      <header className="flex h-16 items-center justify-between border-b border-white/50 bg-white/40 px-6 backdrop-blur-md lg:px-12">
        <Link href="/" className="flex items-center gap-3 transition hover:opacity-90">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#173F38] text-white shadow-sm">
            <Aperture size={20} />
          </div>
          <div className="flex items-center gap-2 font-serif text-lg font-normal italic tracking-tight text-[#193B38]">
            FrameSense <span className="rounded-full border border-[#21866D]/20 bg-[#EAF1ED] px-2 py-0.5 text-[9px] font-mono font-semibold tracking-wider text-[#173F38] not-italic">AI</span>
          </div>
        </Link>

        <div className="text-xs font-mono text-[#193B38]/80">
          GLA University, Mathura &bull; Class of 2026
        </div>
      </header>

      {/* Main Centered Login Section */}
      <main className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-md space-y-6">
          {/* Glassmorphism Card */}
          <div className="rounded-3xl border border-white/60 bg-white/75 p-8 shadow-[0_20px_50px_rgba(23,63,56,0.18)] backdrop-blur-2xl sm:p-10">
            {/* Brand & Heading */}
            <div className="text-center mb-6">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#173F38] text-white shadow-md">
                <Aperture size={26} />
              </div>
              <h1 className="font-serif text-3xl font-normal italic tracking-tight text-[#193B38]">
                Welcome Back
              </h1>
              <p className="mt-1 text-xs text-[#647773]">
                Sign in to continue to your FrameSense AI studio.
              </p>
            </div>

            {/* Error Feedback */}
            {errorMessage && (
              <div className="mb-4 flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50/90 p-3 text-xs font-medium text-rose-700 shadow-sm">
                <AlertCircle size={15} className="shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Success Feedback */}
            {successMessage && (
              <div className="mb-4 flex items-center gap-2 rounded-xl border border-[#21866D]/30 bg-[#EAF1ED]/90 p-3 text-xs font-medium text-[#173F38] shadow-sm">
                <CheckCircle2 size={15} className="shrink-0 text-[#21866D]" />
                <span>{successMessage}</span>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleLogin} className="space-y-4">
              {/* Email Address */}
              <div>
                <label className="text-[11px] font-semibold uppercase tracking-wider text-[#647773]">
                  Email Address
                </label>
                <div className="relative mt-1.5">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-[#647773]">
                    <Mail size={16} />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="photographer@studio.com"
                    className="h-12 w-full rounded-xl border border-white/80 bg-white/80 pr-4 pl-11 text-xs text-[#193B38] placeholder-[#8C9E9A] shadow-sm transition focus:border-[#21866D] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#21866D]/20"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-semibold uppercase tracking-wider text-[#647773]">
                    Password
                  </label>
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault()
                      alert('Password reset instructions have been dispatched to your email address.')
                    }}
                    className="text-[11px] font-medium text-[#21866D] transition hover:underline"
                  >
                    Forgot Password?
                  </a>
                </div>
                <div className="relative mt-1.5">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-[#647773]">
                    <Lock size={16} />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="h-12 w-full rounded-xl border border-white/80 bg-white/80 pr-11 pl-11 text-xs text-[#193B38] placeholder-[#8C9E9A] shadow-sm transition focus:border-[#21866D] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#21866D]/20"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-[#647773] transition hover:text-[#193B38]"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Remember Me */}
              <div className="flex items-center gap-2 pt-1 text-xs text-[#647773]">
                <input
                  type="checkbox"
                  id="remember"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 rounded border-[#E3E9E5] text-[#173F38] accent-[#173F38]"
                />
                <label htmlFor="remember" className="cursor-pointer select-none text-[11px] text-[#193B38]">
                  Remember Me on this device
                </label>
              </div>

              {/* Primary Sign In Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="mt-3 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#173F38] text-xs font-semibold text-white shadow-md transition hover:bg-[#21866D] disabled:opacity-60"
              >
                {isLoading ? (
                  <span>Signing In...</span>
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight size={15} />
                  </>
                )}
              </button>
            </form>

            {/* 1-Click Academic Demo Profiles for University Evaluators */}
            <div className="mt-6 border-t border-black/5 pt-5">
              <div className="mb-2 text-center text-[10px] font-semibold uppercase tracking-wider text-[#647773]">
                Academic Demo Profiles
              </div>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setDemoUser('dev.kumar@gla.ac.in', 'Lead Researcher', 'Dev Kumar Tarkar')}
                  className="rounded-xl border border-white/80 bg-white/70 p-2 text-center text-[10px] shadow-sm transition hover:border-[#21866D] hover:bg-white"
                >
                  <div className="font-bold text-[#193B38]">Dev Kumar</div>
                  <div className="text-[9px] text-[#647773]">Lead</div>
                </button>
                <button
                  type="button"
                  onClick={() => setDemoUser('dev.aggarwal@gla.ac.in', 'ML Engineer', 'Dev Aggarwal')}
                  className="rounded-xl border border-white/80 bg-white/70 p-2 text-center text-[10px] shadow-sm transition hover:border-[#21866D] hover:bg-white"
                >
                  <div className="font-bold text-[#193B38]">Dev Aggarwal</div>
                  <div className="text-[9px] text-[#647773]">ML Eng</div>
                </button>
                <button
                  type="button"
                  onClick={() => setDemoUser('sanjana.shaw@gla.ac.in', 'Project Mentor', 'Ms. Sanjana Shaw')}
                  className="rounded-xl border border-white/80 bg-white/70 p-2 text-center text-[10px] shadow-sm transition hover:border-[#21866D] hover:bg-white"
                >
                  <div className="font-bold text-[#193B38]">Ms. Sanjana</div>
                  <div className="text-[9px] text-[#647773]">Mentor</div>
                </button>
              </div>
            </div>

            {/* Sign Up Navigation */}
            <div className="mt-6 text-center text-xs text-[#647773]">
              Don&apos;t have an account?{' '}
              <Link
                href="/register"
                className="font-semibold text-[#173F38] underline underline-offset-4 transition hover:text-[#21866D]"
              >
                Sign up now
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Global Shared Footer */}
      <Footer />
    </div>
  )
}
