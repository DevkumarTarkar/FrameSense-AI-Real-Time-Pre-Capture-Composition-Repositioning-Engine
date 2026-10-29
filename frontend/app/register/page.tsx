'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Aperture, Lock, Mail, User, ShieldCheck, Sparkles, ArrowRight, Camera, Cpu } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'

export default function RegisterPage() {
  const { signup } = useAuth()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('Photographer')
  const [hardware, setHardware] = useState('cuda')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [agreed, setAgreed] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    setTimeout(() => {
      setIsLoading(false)
      setSuccess(true)
      setTimeout(() => {
        signup(fullName || 'Photographer', email, role)
      }, 700)
    }, 600)
  }

  return (
    <div className="flex min-h-screen flex-col justify-between bg-[#070a0d] text-[#e7f0ed] selection:bg-[#d9ff5b] selection:text-[#070a0d]">
      {/* Top Bar */}
      <header className="flex h-16 items-center justify-between border-b border-white/[.08] px-6 lg:px-12">
        <Link href="/" className="flex items-center gap-3 transition hover:opacity-90">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#d9ff5b] text-[#0b1008] shadow-[0_0_20px_rgba(217,255,91,.2)]">
            <Aperture size={20} />
          </div>
          <div className="flex items-center gap-2 text-sm font-semibold tracking-tight text-white">
            FrameSense <span className="rounded-full bg-[#d9ff5b]/15 px-2 py-0.5 text-[9px] font-bold tracking-widest text-[#d9ff5b]">AI</span>
          </div>
        </Link>

        <Link
          href="/login"
          className="text-xs text-[#7f8e93] transition hover:text-white"
        >
          Already registered? <span className="text-[#d9ff5b]">Sign In</span> &rarr;
        </Link>
      </header>

      {/* Main Register Card */}
      <main className="flex flex-1 items-center justify-center px-4 py-10">
        <div className="w-full max-w-lg space-y-6">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#d9ff5b]/20 bg-[#d9ff5b]/[.06] px-3.5 py-1 text-[11px] font-medium text-[#badb7b]">
              <Sparkles size={12} className="text-[#d9ff5b]" />
              New Studio Onboarding
            </div>
            <h1 className="mt-3 text-2xl font-black tracking-tight text-white lg:text-3xl">
              Create Your FrameSense Account
            </h1>
            <p className="mt-1 text-xs text-[#718085]">
              Join the real-time AI composition &amp; aesthetic intelligence platform.
            </p>
          </div>

          <div className="rounded-3xl border border-white/[.08] bg-[#0d1316] p-7 shadow-2xl">
            {success ? (
              <div className="py-8 text-center space-y-3">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#d9ff5b]/20 text-[#d9ff5b]">
                  <ShieldCheck size={32} />
                </div>
                <h3 className="text-lg font-bold text-white">Account Created Successfully!</h3>
                <p className="text-xs text-[#819196]">
                  Redirecting to studio login in a moment...
                </p>
              </div>
            ) : (
              <form onSubmit={handleRegister} className="space-y-4">
                {/* Full Name */}
                <div>
                  <label className="text-[11px] font-semibold uppercase tracking-wider text-[#88999d]">
                    Full Name
                  </label>
                  <div className="relative mt-1.5">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-[#5e6d72]">
                      <User size={16} />
                    </div>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Dev Kumar Tarkar"
                      className="w-full rounded-xl border border-white/10 bg-[#12191d] py-2.5 pr-4 pl-10 text-xs text-white placeholder-[#4c595e] focus:border-[#d9ff5b] focus:outline-none"
                    />
                  </div>
                </div>

                {/* Email Address */}
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
                      placeholder="dev.kumar@gla.ac.in"
                      className="w-full rounded-xl border border-white/10 bg-[#12191d] py-2.5 pr-4 pl-10 text-xs text-white placeholder-[#4c595e] focus:border-[#d9ff5b] focus:outline-none"
                    />
                  </div>
                </div>

                {/* Role & Hardware Selection */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="text-[11px] font-semibold uppercase tracking-wider text-[#88999d]">
                      Primary Role
                    </label>
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      className="mt-1.5 w-full rounded-xl border border-white/10 bg-[#12191d] p-2.5 text-xs text-white focus:border-[#d9ff5b] focus:outline-none"
                    >
                      <option value="Photographer">Photographer</option>
                      <option value="Researcher">Researcher / Student</option>
                      <option value="Mentor">Faculty / Evaluator</option>
                      <option value="Creator">Content Creator</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold uppercase tracking-wider text-[#88999d]">
                      Inference Target
                    </label>
                    <select
                      value={hardware}
                      onChange={(e) => setHardware(e.target.value)}
                      className="mt-1.5 w-full rounded-xl border border-white/10 bg-[#12191d] p-2.5 text-xs text-white focus:border-[#d9ff5b] focus:outline-none"
                    >
                      <option value="cuda">NVIDIA RTX 3050 CUDA</option>
                      <option value="cpu">Host CPU (General)</option>
                    </select>
                  </div>
                </div>

                {/* Passwords */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="text-[11px] font-semibold uppercase tracking-wider text-[#88999d]">
                      Password
                    </label>
                    <div className="relative mt-1.5">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-[#5e6d72]">
                        <Lock size={16} />
                      </div>
                      <input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full rounded-xl border border-white/10 bg-[#12191d] py-2.5 pr-4 pl-10 text-xs text-white placeholder-[#4c595e] focus:border-[#d9ff5b] focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold uppercase tracking-wider text-[#88999d]">
                      Confirm Password
                    </label>
                    <div className="relative mt-1.5">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-[#5e6d72]">
                        <Lock size={16} />
                      </div>
                      <input
                        type="password"
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full rounded-xl border border-white/10 bg-[#12191d] py-2.5 pr-4 pl-10 text-xs text-white placeholder-[#4c595e] focus:border-[#d9ff5b] focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Terms Agreement */}
                <div className="flex items-center gap-2 pt-1 text-xs text-[#718085]">
                  <input
                    type="checkbox"
                    id="terms"
                    checked={agreed}
                    onChange={(e) => setAgreed(e.target.checked)}
                    required
                    className="rounded border-white/20 bg-white/5 text-[#d9ff5b] accent-[#d9ff5b]"
                  />
                  <label htmlFor="terms" className="cursor-pointer text-[11px]">
                    I agree to the FrameSense evaluation guidelines &amp; local processing terms
                  </label>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-[#d9ff5b] py-3 text-xs font-bold text-[#070a0d] shadow-[0_0_20px_rgba(217,255,91,.25)] transition hover:bg-[#c7f347] disabled:opacity-50"
                >
                  {isLoading ? (
                    <span>Registering Account...</span>
                  ) : (
                    <>
                      <span>Complete Registration</span>
                      <ArrowRight size={14} />
                    </>
                  )}
                </button>
              </form>
            )}
          </div>

          {/* Login prompt */}
          <div className="text-center text-xs text-[#718085]">
            Already have an account?{' '}
            <Link href="/login" className="font-semibold text-[#d9ff5b] hover:underline">
              Sign In here &rarr;
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
