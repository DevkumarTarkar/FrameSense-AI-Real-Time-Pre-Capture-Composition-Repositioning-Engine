'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'

export interface User {
  name: string
  firstName?: string
  middleName?: string
  lastName?: string
  email: string
  role: string
  phone?: string
  dob?: string
  gender?: string
  location?: string
  // Address fields breakdown
  houseNo?: string
  street?: string
  city?: string
  state?: string
  country?: string
  pincode?: string
  bio?: string
  instagram?: string
  portfolio?: string
  twitter?: string
  linkedin?: string
  avatarUrl?: string
  avatarText: string
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, name?: string, role?: string, dob?: string) => void
  signup: (name: string, email: string, role?: string, dob?: string) => void
  updateProfile: (updatedData: Partial<User>) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const STORAGE_KEY = 'framesense_user_session'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  // Load user session on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        setUser(parsed)
      }
    } catch (e) {
      console.error('Failed to parse auth session:', e)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Route protection guard
  useEffect(() => {
    if (isLoading) return

    const isAuthPage = pathname === '/login' || pathname === '/register'

    // If user is NOT logged in and trying to access protected routes -> redirect to /login
    if (!user && !isAuthPage) {
      router.replace('/login')
    }

    // If user IS logged in and tries to access /login or /register -> redirect to /
    if (user && isAuthPage) {
      router.replace('/')
    }
  }, [user, isLoading, pathname, router])

  const login = (email: string, name?: string, role?: string, dob?: string) => {
    let resolvedFirst = 'Dev'
    let resolvedMiddle = 'Kumar'
    let resolvedLast = 'Tarkar'
    let resolvedRole = 'Lead Researcher'

    if (email.startsWith('dev.aggarwal')) {
      resolvedFirst = 'Dev'
      resolvedMiddle = ''
      resolvedLast = 'Aggarwal'
      resolvedRole = 'ML Engineer'
    } else if (email.startsWith('sanjana')) {
      resolvedFirst = 'Sanjana'
      resolvedMiddle = ''
      resolvedLast = 'Shaw'
      resolvedRole = 'Faculty Mentor'
    } else if (name) {
      const parts = name.trim().split(' ')
      resolvedFirst = parts[0] || 'User'
      resolvedMiddle = parts.length > 2 ? parts[1] : ''
      resolvedLast = parts.length > 2 ? parts.slice(2).join(' ') : parts[1] || ''
    }

    const fullName = [resolvedFirst, resolvedMiddle, resolvedLast].filter(Boolean).join(' ')
    const initials = (resolvedFirst[0] + (resolvedLast[0] || '')).toUpperCase()

    const newUser: User = {
      name: fullName,
      firstName: resolvedFirst,
      middleName: resolvedMiddle,
      lastName: resolvedLast,
      email,
      role: role || resolvedRole,
      phone: email.startsWith('dev.kumar') ? '+91 98765 43210' : '+91 91234 56789',
      dob: dob || (email.startsWith('dev.kumar') ? '2004-05-18' : '2004-08-22'),
      gender: email.startsWith('sanjana') ? 'Female' : 'Male',
      houseNo: email.startsWith('dev.kumar') ? 'Flat 402, Block B' : 'House 12',
      street: email.startsWith('dev.kumar') ? 'Chaumuhan, NH-19 (Near GLA Campus)' : 'Civil Lines',
      city: 'Mathura',
      state: 'Uttar Pradesh',
      country: 'India',
      pincode: '281406',
      location: 'Mathura, Uttar Pradesh, India',
      bio: 'Photographer and Computer Vision researcher exploring real-time AI composition & aesthetic intelligence.',
      instagram: email.startsWith('dev.kumar') ? '@devkumar_clicks' : '@framesense_creator',
      portfolio: email.startsWith('dev.kumar') ? 'https://devkumar.visuals.com' : 'https://framesense.ai',
      twitter: email.startsWith('dev.kumar') ? '@devkumar_ai' : '',
      linkedin: email.startsWith('dev.kumar') ? 'https://linkedin.com/in/devkumartarkar' : '',
      avatarText: initials || 'DK',
    }

    setUser(newUser)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newUser))
    router.replace('/')
  }

  const signup = (name: string, email: string, role?: string, dob?: string) => {
    const parts = name.trim().split(' ')
    const resolvedFirst = parts[0] || 'Photographer'
    const resolvedMiddle = parts.length > 2 ? parts[1] : ''
    const resolvedLast = parts.length > 2 ? parts.slice(2).join(' ') : parts[1] || ''
    const fullName = [resolvedFirst, resolvedMiddle, resolvedLast].filter(Boolean).join(' ')
    const initials = (resolvedFirst[0] + (resolvedLast[0] || '')).toUpperCase()

    const newUser: User = {
      name: fullName,
      firstName: resolvedFirst,
      middleName: resolvedMiddle,
      lastName: resolvedLast,
      email,
      role: role || 'Photographer',
      phone: '',
      dob: dob || '2004-01-01',
      gender: 'Male',
      houseNo: '',
      street: '',
      city: 'Mathura',
      state: 'Uttar Pradesh',
      country: 'India',
      pincode: '281406',
      location: 'Mathura, Uttar Pradesh, India',
      bio: 'Photographer and creator exploring real-time AI composition with FrameSense AI.',
      instagram: '',
      portfolio: '',
      twitter: '',
      linkedin: '',
      avatarText: initials || 'FS',
    }

    setUser(newUser)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newUser))
    router.replace('/')
  }

  const updateProfile = (updatedData: Partial<User>) => {
    setUser((prev) => {
      if (!prev) return null
      const updated = { ...prev, ...updatedData }

      const first = updated.firstName !== undefined ? updated.firstName : prev.firstName || ''
      const middle = updated.middleName !== undefined ? updated.middleName : prev.middleName || ''
      const last = updated.lastName !== undefined ? updated.lastName : prev.lastName || ''

      const full = [first, middle, last].filter(Boolean).join(' ')
      if (full) {
        updated.name = full
        const init = ((first[0] || '') + (last[0] || '')).toUpperCase()
        updated.avatarText = init || 'DK'
      }

      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
      return updated
    })
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem(STORAGE_KEY)
    router.replace('/login')
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        signup,
        updateProfile,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
