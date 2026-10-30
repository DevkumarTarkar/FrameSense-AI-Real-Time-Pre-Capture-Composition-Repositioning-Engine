'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Aperture, Lock, Mail, User, Calendar, Eye, EyeOff, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import Footer from '@/components/Footer'

export default function RegisterPage() {
  const { signup } = useAuth()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [dob, setDob] = useState('2004-05-18')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  // Password strength calculation
  const passwordStrength = useMemo(() => {
    if (!password) return { score: 0, label: 'None', color: 'bg-stone-200' }
    let score = 0
    if (password.length >= 6) score += 1
    if (password.length >= 8) score += 1
    if (/[A-Z]/.test(password)) score += 1
    if (/[0-9]/.test(password)) score += 1
    if (/[^A-Za-z0-9]/.test(password)) score += 1

    if (score <= 2) return { score, label: 'Weak', color: 'bg-[#DC5C5C]' }
    if (score <= 4) return { score, label: 'Moderate', color: 'bg-[#E5A33D]' }
    return { score, label: 'Strong', color: 'bg-[#16A085]' }
  }, [password])

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage('')
    setSuccessMessage('')

    // Client-side validation
    if (!fullName.trim() || fullName.trim().length < 2) {
      setErrorMessage('Please enter your full official name (at least 2 characters).')
      return
    }

    if (!email.trim() || !email.includes('@') || !email.includes('.')) {
      setErrorMessage('Please enter a valid email address.')
      return
    }

    if (!dob) {
      setErrorMessage('Please select your date of birth.')
      return
    }

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.')
      return
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please verify both password entries.')
      return
    }

    setIsLoading(true)
    const host = typeof window !== 'undefined' && window.location.hostname ? window.location.hostname : '127.0.0.1'
    const apiUrl = `http://${host}:8000/api/auth/register`

    try {
      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: fullName.trim(),
          email: email.trim(),
          dob,
          password,
          confirm_password: confirmPassword,
          role: 'Photographer',
        }),
      })

      if (res.ok) {
        setSuccessMessage('Account created successfully! Logging you in...')
        setTimeout(() => {
          signup(fullName.trim(), email.trim(), 'Photographer', dob)
        }, 700)
        return
      } else {
        const errData = await res.json().catch(() => null)
        const detail = errData?.detail || 'Failed to create account. Please check your information.'
        setErrorMessage(detail)
      }
    } catch {
      // Fallback for offline environments
      setSuccessMessage('Account created locally! Opening studio...')
      setTimeout(() => {
        signup(fullName.trim(), email.trim(), 'Photographer', dob)
      }, 700)
      return
    } finally {
      setIsLoading(false)
    }
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

        <Link
          href="/login"
          className="text-xs font-medium text-[#193B38] transition hover:text-[#21866D]"
        >
          Already registered? <span className="font-semibold text-[#173F38] underline underline-offset-4">Sign In</span> &rarr;
        </Link>
      </header>

      {/* Main Centered Registration Section */}
      <main className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-lg space-y-6">
          {/* Glassmorphism Card */}
          <div className="rounded-3xl border border-white/60 bg-white/75 p-8 shadow-[0_20px_50px_rgba(23,63,56,0.18)] backdrop-blur-2xl sm:p-10">
            {/* Brand & Heading */}
            <div className="text-center mb-6">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#173F38] text-white shadow-md">
                <Aperture size={26} />
              </div>
              <h1 className="font-serif text-3xl font-normal italic tracking-tight text-[#193B38]">
                Create Your Account
              </h1>
              <p className="mt-1 text-xs text-[#647773]">
                Join FrameSense AI and start capturing better photographs.
              </p>
            </div>

            {/* Error Feedback */}
            {errorMessage && (
              <div className="mb-4 flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50/90 p-3.5 text-xs font-medium text-rose-700 shadow-sm">
                <AlertCircle size={15} className="shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Success Feedback */}
            {successMessage && (
              <div className="mb-4 flex items-center gap-2 rounded-xl border border-[#21866D]/30 bg-[#EAF1ED]/90 p-3.5 text-xs font-medium text-[#173F38] shadow-sm">
                <CheckCircle2 size={15} className="shrink-0 text-[#21866D]" />
                <span>{successMessage}</span>
              </div>
            )}

            {/* Registration Form */}
            <form onSubmit={handleRegister} className="space-y-4">
              {/* Full Name */}
              <div>
                <label className="text-[11px] font-semibold uppercase tracking-wider text-[#647773]">
                  Full Name <span className="text-[#DC5C5C]">*</span>
                </label>
                <div className="relative mt-1.5">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-[#647773]">
                    <User size={16} />
                  </div>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Dev Kumar Tarkar"
                    className="h-12 w-full rounded-xl border border-white/80 bg-white/80 pr-4 pl-11 text-xs text-[#193B38] placeholder-[#8C9E9A] shadow-sm transition focus:border-[#21866D] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#21866D]/20"
                  />
                </div>
              </div>

              {/* Email Address */}
              <div>
                <label className="text-[11px] font-semibold uppercase tracking-wider text-[#647773]">
                  Email Address <span className="text-[#DC5C5C]">*</span>
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

              {/* Date of Birth */}
              <div>
                <label className="text-[11px] font-semibold uppercase tracking-wider text-[#647773]">
                  Date of Birth <span className="text-[#DC5C5C]">*</span>
                </label>
                <div className="relative mt-1.5">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-[#647773]">
                    <Calendar size={16} />
                  </div>
                  <input
                    type="date"
                    required
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    className="h-12 w-full rounded-xl border border-white/80 bg-white/80 pr-4 pl-11 text-xs text-[#193B38] shadow-sm transition focus:border-[#21866D] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#21866D]/20"
                  />
                </div>
              </div>

              {/* Passwords (2 Columns) */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {/* Password */}
                <div>
                  <label className="text-[11px] font-semibold uppercase tracking-wider text-[#647773]">
                    Password <span className="text-[#DC5C5C]">*</span>
                  </label>
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

                {/* Confirm Password */}
                <div>
                  <label className="text-[11px] font-semibold uppercase tracking-wider text-[#647773]">
                    Confirm Password <span className="text-[#DC5C5C]">*</span>
                  </label>
                  <div className="relative mt-1.5">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-[#647773]">
                      <Lock size={16} />
                    </div>
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="h-12 w-full rounded-xl border border-white/80 bg-white/80 pr-11 pl-11 text-xs text-[#193B38] placeholder-[#8C9E9A] shadow-sm transition focus:border-[#21866D] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#21866D]/20"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-[#647773] transition hover:text-[#193B38]"
                    >
                      {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Password Strength Indicator */}
              {password && (
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-[#647773]">Password Strength:</span>
                    <span className="font-semibold text-[#193B38]">{passwordStrength.label}</span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-stone-200">
                    <div
                      className={`h-full transition-all duration-300 ${passwordStrength.color}`}
                      style={{ width: `${Math.min(100, (passwordStrength.score / 5) * 100)}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Primary Create Account Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="mt-3 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#173F38] text-xs font-semibold text-white shadow-md transition hover:bg-[#21866D] disabled:opacity-60"
              >
                {isLoading ? (
                  <span>Creating Account...</span>
                ) : (
                  <>
                    <span>Create Account</span>
                    <ArrowRight size={15} />
                  </>
                )}
              </button>
            </form>

            {/* Login Navigation */}
            <div className="mt-6 text-center text-xs text-[#647773]">
              Already have an account?{' '}
              <Link
                href="/login"
                className="font-semibold text-[#173F38] underline underline-offset-4 transition hover:text-[#21866D]"
              >
                Sign in
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
