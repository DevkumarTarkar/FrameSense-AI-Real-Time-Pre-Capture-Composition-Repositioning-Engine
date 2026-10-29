'use client'

import { useState, useEffect, useRef } from 'react'
import Navbar from '@/components/Navbar'
import Sidebar from '@/components/Sidebar'
import {
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Camera,
  CheckCircle2,
  AlertCircle,
  Save,
  LogOut,
  Upload,
  Trash2,
  Globe,
  Lock,
  KeyRound,
  Eye,
  EyeOff,
  ShieldCheck,
  Home,
  Building,
  Navigation,
  Compass
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { COUNTRIES_DATA } from '@/lib/locationsData'

const InstagramIcon = ({ size = 16, className = '' }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
  </svg>
)

const TwitterIcon = ({ size = 16, className = '' }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M4 4l11.733 16h4.267l-11.733-16zM4 20l6.768-6.768m2.464-2.464L20 4"/>
  </svg>
)

const LinkedinIcon = ({ size = 16, className = '' }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
    <rect width="4" height="12" x="2" y="9"/>
    <circle cx="4" cy="4" r="2"/>
  </svg>
)

export default function ProfilePage() {
  const { user, updateProfile, logout } = useAuth()

  // 1. Name split into First, Middle, Last
  const [firstName, setFirstName] = useState('')
  const [middleName, setMiddleName] = useState('')
  const [lastName, setLastName] = useState('')

  // 2. Personal contact & bio
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [dob, setDob] = useState('')
  const [gender, setGender] = useState('Male')
  const [bio, setBio] = useState('')
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)

  // 3. Address fields breakdown (Cascading Country -> State -> City)
  const [houseNo, setHouseNo] = useState('')
  const [street, setStreet] = useState('')
  const [country, setCountry] = useState('India')
  const [stateName, setStateName] = useState('Uttar Pradesh')
  const [city, setCity] = useState('Mathura')
  const [pincode, setPincode] = useState('')

  // Custom fallback inputs if user chooses "+ Other"
  const [isCustomCountry, setIsCustomCountry] = useState(false)
  const [isCustomState, setIsCustomState] = useState(false)
  const [isCustomCity, setIsCustomCity] = useState(false)

  // 4. Social & Portfolio links
  const [instagram, setInstagram] = useState('')
  const [portfolio, setPortfolio] = useState('')
  const [twitter, setTwitter] = useState('')
  const [linkedin, setLinkedin] = useState('')

  // 5. Change Password State
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showCurrentPass, setShowCurrentPass] = useState(false)
  const [showNewPass, setShowNewPass] = useState(false)
  const [showConfirmPass, setShowConfirmPass] = useState(false)
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [passwordSuccess, setPasswordSuccess] = useState(false)
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false)

  // 6. Profile Saved Success Banner
  const [savedSuccess, setSavedSuccess] = useState(false)

  const fileInputRef = useRef<HTMLInputElement | null>(null)

  // Derived cascading dropdown choices
  const selectedCountryObj = COUNTRIES_DATA.find(
    (c) => c.name.toLowerCase() === country.trim().toLowerCase()
  )
  const availableStates = selectedCountryObj?.states || []

  const selectedStateObj = availableStates.find(
    (s) => s.name.toLowerCase() === stateName.trim().toLowerCase()
  )
  const availableCities = selectedStateObj?.cities || []

  useEffect(() => {
    if (user) {
      setFirstName(user.firstName || user.name.split(' ')[0] || 'Dev')
      setMiddleName(user.middleName || (user.name.split(' ').length > 2 ? user.name.split(' ')[1] : ''))
      setLastName(user.lastName || (user.name.split(' ').length > 2 ? user.name.split(' ').slice(2).join(' ') : user.name.split(' ')[1] || ''))
      setEmail(user.email || '')
      setPhone(user.phone || '+91 98765 43210')
      setDob(user.dob || '2004-05-18')
      setGender(user.gender || 'Male')
      setBio(user.bio || 'Photographer and Computer Vision researcher exploring real-time AI composition & aesthetic intelligence.')

      // Detailed Address Breakdown with intelligent defaults
      setHouseNo(user.houseNo || 'Flat 402, Block B')
      setStreet(user.street || 'Chaumuhan, NH-19 (Near GLA Campus)')

      const initCountry = user.country || 'India'
      const initState = user.state || 'Uttar Pradesh'
      const initCity = user.city || 'Mathura'

      setCountry(initCountry)
      setStateName(initState)
      setCity(initCity)
      setPincode(user.pincode || '281406')

      // Check if custom values needed
      const foundCountry = COUNTRIES_DATA.find(
        (c) => c.name.toLowerCase() === initCountry.toLowerCase()
      )
      setIsCustomCountry(!foundCountry && !!initCountry)

      const foundState = foundCountry?.states.find(
        (s) => s.name.toLowerCase() === initState.toLowerCase()
      )
      setIsCustomState(!foundState && !!initState)

      const foundCity = foundState?.cities.some(
        (ct) => ct.toLowerCase() === initCity.toLowerCase()
      )
      setIsCustomCity(!foundCity && !!initCity)

      setInstagram(user.instagram || '@devkumar_clicks')
      setPortfolio(user.portfolio || 'https://myportfolio.com')
      setTwitter(user.twitter || '@devkumar_ai')
      setLinkedin(user.linkedin || 'https://linkedin.com/in/devkumartarkar')
      setAvatarUrl(user.avatarUrl || null)
    }
  }, [user])

  // Cascading change handlers
  const handleCountryChange = (val: string) => {
    if (val === '__OTHER__') {
      setIsCustomCountry(true)
      setCountry('')
      setIsCustomState(true)
      setStateName('')
      setIsCustomCity(true)
      setCity('')
      return
    }
    setIsCustomCountry(false)
    setCountry(val)
    setIsCustomState(false)
    setIsCustomCity(false)

    const foundCountry = COUNTRIES_DATA.find((c) => c.name === val)
    if (foundCountry && foundCountry.states.length > 0) {
      const firstState = foundCountry.states[0]
      setStateName(firstState.name)
      setCity(firstState.cities[0] || '')
    } else {
      setStateName('')
      setCity('')
    }
  }

  const handleStateChange = (val: string) => {
    if (val === '__OTHER__') {
      setIsCustomState(true)
      setStateName('')
      setIsCustomCity(true)
      setCity('')
      return
    }
    setIsCustomState(false)
    setStateName(val)
    setIsCustomCity(false)

    const foundState = availableStates.find((s) => s.name === val)
    if (foundState && foundState.cities.length > 0) {
      setCity(foundState.cities[0])
    } else {
      setCity('')
    }
  }

  const handleCityChange = (val: string) => {
    if (val === '__OTHER__') {
      setIsCustomCity(true)
      setCity('')
      return
    }
    setIsCustomCity(false)
    setCity(val)
  }

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      const reader = new FileReader()
      reader.onload = (event) => {
        const url = event.target?.result as string
        setAvatarUrl(url)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemoveAvatar = () => {
    setAvatarUrl(null)
  }

  // Handle Save Profile Info
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault()
    const fullLocation = [city, stateName, country].filter(Boolean).join(', ')
    updateProfile({
      firstName,
      middleName,
      lastName,
      email,
      phone,
      dob,
      gender,
      houseNo,
      street,
      city,
      state: stateName,
      country,
      pincode,
      location: fullLocation,
      bio,
      instagram,
      portfolio,
      twitter,
      linkedin,
      avatarUrl: avatarUrl || undefined,
    })

    setSavedSuccess(true)
    setTimeout(() => setSavedSuccess(false), 3500)
  }

  // Handle Update Password
  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordError(null)
    setPasswordSuccess(false)

    if (!currentPassword) {
      setPasswordError('Please enter your current password.')
      return
    }

    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters long.')
      return
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match. Please re-enter.')
      return
    }

    setIsUpdatingPassword(true)

    setTimeout(() => {
      setIsUpdatingPassword(false)
      setPasswordSuccess(true)
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setTimeout(() => setPasswordSuccess(false), 3500)
    }, 600)
  }

  const fullNameDisplay = [firstName, middleName, lastName].filter(Boolean).join(' ') || 'Dev Kumar Tarkar'

  return (
    <div className="min-h-screen bg-[#070a0d] text-[#e7f0ed] selection:bg-[#d9ff5b] selection:text-[#070a0d]">
      <Navbar />

      <main className="mx-auto flex max-w-[1720px] gap-8 px-5 py-7 lg:px-9">
        <Sidebar />

        <div className="min-w-0 flex-1 space-y-7">
          {/* Header */}
          <div className="flex flex-col justify-between gap-4 border-b border-white/[.08] pb-6 sm:flex-row sm:items-center">
            <div>
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#d9ff5b]/10 text-[#d9ff5b]">
                  <User size={18} />
                </div>
                <h1 className="text-xl font-bold tracking-tight text-white lg:text-2xl">
                  User Profile &amp; Account Settings
                </h1>
              </div>
              <p className="mt-1 text-xs text-[#738287]">
                Manage your name, profile photo, social handles, and password security.
              </p>
            </div>

            <button
              onClick={logout}
              className="flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-2 text-xs font-semibold text-rose-400 transition hover:bg-rose-500/20"
            >
              <LogOut size={14} /> Sign Out
            </button>
          </div>

          {savedSuccess && (
            <div className="flex items-center gap-2 rounded-2xl border border-[#d9ff5b]/30 bg-[#d9ff5b]/10 p-4 text-xs font-medium text-[#d9ff5b] shadow-lg animate-in fade-in duration-200">
              <CheckCircle2 size={16} />
              Profile updated successfully! All details have been synced to your active session.
            </div>
          )}

          {/* MAIN PROFILE FORM */}
          <form onSubmit={handleSaveProfile} className="space-y-7">
            {/* SECTION 1: Profile Photo Card */}
            <div className="rounded-3xl border border-white/[.08] bg-[#0e1417] p-7 shadow-sm">
              <h2 className="text-sm font-bold text-white mb-1">Profile Photo</h2>
              <p className="text-xs text-[#6e7d82] mb-5">
                Your avatar appears on your viewfinder HUD, navbar, and exported evaluation cards.
              </p>

              <div className="flex flex-col sm:flex-row items-center gap-6">
                <div className="relative group">
                  <div className="h-24 w-24 rounded-full overflow-hidden border-2 border-[#d9ff5b]/40 shadow-[0_0_25px_rgba(217,255,91,.15)] bg-[#12191d] flex items-center justify-center">
                    {avatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={avatarUrl}
                        alt={fullNameDisplay}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="text-3xl font-black text-[#d9ff5b]">
                        {user?.avatarText || 'DK'}
                      </span>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute inset-0 rounded-full bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition text-[10px] text-white font-medium cursor-pointer"
                  >
                    <Camera size={18} className="mb-0.5 text-[#d9ff5b]" />
                    Change
                  </button>
                </div>

                <div className="space-y-3 text-center sm:text-left">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    className="hidden"
                    onChange={handleAvatarUpload}
                  />

                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center gap-1.5 rounded-xl bg-[#d9ff5b] px-4 py-2 text-xs font-bold text-[#070a0d] shadow-sm transition hover:bg-[#c7f347]"
                    >
                      <Upload size={14} /> Upload New Photo
                    </button>

                    {avatarUrl && (
                      <button
                        type="button"
                        onClick={handleRemoveAvatar}
                        className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/[.04] px-3.5 py-2 text-xs font-medium text-[#8fa0a5] transition hover:bg-rose-500/10 hover:text-rose-400 hover:border-rose-500/30"
                      >
                        <Trash2 size={13} /> Remove
                      </button>
                    )}
                  </div>

                  <p className="text-[11px] text-[#556367]">
                    Recommended: Square JPG, PNG, or WebP. Max file size: 5MB.
                  </p>
                </div>
              </div>
            </div>

            {/* SECTION 2: Personal Information (First, Middle, Last Name) */}
            <div className="rounded-3xl border border-white/[.08] bg-[#0e1417] p-7 shadow-sm space-y-6">
              <div>
                <h2 className="text-sm font-bold text-white">Personal Information</h2>
                <p className="text-xs text-[#6e7d82] mt-0.5">
                  Update your official name, email, contact number, and personal details.
                </p>
              </div>

              {/* Name split into First, Middle, and Last Name */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                {/* First Name */}
                <div>
                  <label className="text-[11px] font-semibold uppercase tracking-wider text-[#88999d]">
                    First Name <span className="text-[#d9ff5b]">*</span>
                  </label>
                  <div className="relative mt-1.5">
                    <input
                      type="text"
                      required
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="e.g. Dev"
                      className="w-full rounded-xl border border-white/10 bg-[#12191d] py-2.5 px-3.5 text-xs text-white placeholder-[#4c595e] focus:border-[#d9ff5b] focus:outline-none"
                    />
                  </div>
                </div>

                {/* Middle Name */}
                <div>
                  <label className="text-[11px] font-semibold uppercase tracking-wider text-[#88999d]">
                    Middle Name <span className="text-[#556367] font-normal">(Optional)</span>
                  </label>
                  <div className="relative mt-1.5">
                    <input
                      type="text"
                      value={middleName}
                      onChange={(e) => setMiddleName(e.target.value)}
                      placeholder="e.g. Kumar"
                      className="w-full rounded-xl border border-white/10 bg-[#12191d] py-2.5 px-3.5 text-xs text-white placeholder-[#4c595e] focus:border-[#d9ff5b] focus:outline-none"
                    />
                  </div>
                </div>

                {/* Last Name */}
                <div>
                  <label className="text-[11px] font-semibold uppercase tracking-wider text-[#88999d]">
                    Last Name <span className="text-[#d9ff5b]">*</span>
                  </label>
                  <div className="relative mt-1.5">
                    <input
                      type="text"
                      required
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="e.g. Tarkar"
                      className="w-full rounded-xl border border-white/10 bg-[#12191d] py-2.5 px-3.5 text-xs text-white placeholder-[#4c595e] focus:border-[#d9ff5b] focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Email, Phone, DOB, Gender, Location */}
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                {/* Email Address */}
                <div>
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-semibold uppercase tracking-wider text-[#88999d]">
                      Email Address
                    </label>
                    <span className="flex items-center gap-1 text-[10px] text-[#10b981] font-semibold">
                      <ShieldCheck size={12} /> Verified
                    </span>
                  </div>
                  <div className="relative mt-1.5">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-[#5e6d72]">
                      <Mail size={15} />
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

                {/* Phone Number */}
                <div>
                  <label className="text-[11px] font-semibold uppercase tracking-wider text-[#88999d]">
                    Phone Number
                  </label>
                  <div className="relative mt-1.5">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-[#5e6d72]">
                      <Phone size={15} />
                    </div>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full rounded-xl border border-white/10 bg-[#12191d] py-2.5 pr-4 pl-10 text-xs text-white placeholder-[#4c595e] focus:border-[#d9ff5b] focus:outline-none"
                    />
                  </div>
                </div>

                {/* Date of Birth */}
                <div>
                  <label className="text-[11px] font-semibold uppercase tracking-wider text-[#88999d]">
                    Date of Birth
                  </label>
                  <div className="relative mt-1.5">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-[#5e6d72]">
                      <Calendar size={15} />
                    </div>
                    <input
                      type="date"
                      value={dob}
                      onChange={(e) => setDob(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-[#12191d] py-2.5 pr-4 pl-10 text-xs text-white focus:border-[#d9ff5b] focus:outline-none"
                    />
                  </div>
                </div>

                {/* Gender */}
                <div>
                  <label className="text-[11px] font-semibold uppercase tracking-wider text-[#88999d]">
                    Gender
                  </label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="mt-1.5 w-full rounded-xl border border-white/10 bg-[#12191d] p-2.5 text-xs text-white focus:border-[#d9ff5b] focus:outline-none"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                  </select>
                </div>

              </div>

              {/* Bio / About Me */}
              <div>
                <label className="text-[11px] font-semibold uppercase tracking-wider text-[#88999d]">
                  Bio / About Me
                </label>
                <textarea
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Share a short bio or photography interest..."
                  className="mt-1.5 w-full rounded-xl border border-white/10 bg-[#12191d] p-3 text-xs text-white placeholder-[#4c595e] focus:border-[#d9ff5b] focus:outline-none"
                />
              </div>
            </div>

            {/* SECTION 3: Residential Address & Location (Detailed Breakdown) */}
            <div className="rounded-3xl border border-white/[.08] bg-[#0e1417] p-7 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <h2 className="text-sm font-bold text-white flex items-center gap-2">
                    <MapPin size={16} className="text-[#d9ff5b]" />
                    Address &amp; Location Details
                  </h2>
                  <p className="text-xs text-[#6e7d82] mt-0.5">
                    Individual breakdown for house/apartment, street/landmark, city, state, country, and postal code.
                  </p>
                </div>
                {/* Live Formatted Summary Pill */}
                <div className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-[#12191d] px-3 py-1 text-[11px] text-[#a0b0b5]">
                  <Globe size={12} className="text-[#d9ff5b]" />
                  <span>{[city, stateName, country].filter(Boolean).join(', ') || 'Location Pending'}</span>
                </div>
              </div>

              {/* Row 1: House No. & Street / Landmark */}
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                {/* House No / Apartment */}
                <div>
                  <label className="text-[11px] font-semibold uppercase tracking-wider text-[#88999d] flex items-center gap-1.5">
                    <Home size={13} className="text-[#d9ff5b]" /> House No. / Flat / Apartment
                  </label>
                  <div className="relative mt-1.5">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-[#5e6d72]">
                      <Home size={14} />
                    </div>
                    <input
                      type="text"
                      value={houseNo}
                      onChange={(e) => setHouseNo(e.target.value)}
                      placeholder="e.g. Flat 402, Block B / H.No. 128"
                      className="w-full rounded-xl border border-white/10 bg-[#12191d] py-2.5 pr-4 pl-10 text-xs text-white placeholder-[#4c595e] focus:border-[#d9ff5b] focus:outline-none"
                    />
                  </div>
                </div>

                {/* Street / Landmark */}
                <div>
                  <label className="text-[11px] font-semibold uppercase tracking-wider text-[#88999d] flex items-center gap-1.5">
                    <Navigation size={13} className="text-[#38bdf8]" /> Street / Area / Landmark
                  </label>
                  <div className="relative mt-1.5">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-[#5e6d72]">
                      <Navigation size={14} />
                    </div>
                    <input
                      type="text"
                      value={street}
                      onChange={(e) => setStreet(e.target.value)}
                      placeholder="e.g. Chaumuhan, NH-19 (Near GLA Campus)"
                      className="w-full rounded-xl border border-white/10 bg-[#12191d] py-2.5 pr-4 pl-10 text-xs text-white placeholder-[#4c595e] focus:border-[#d9ff5b] focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Row 2: Cascading Country -> State -> City Dropdowns + PIN Code */}
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {/* 1. Country Selection */}
                <div>
                  <label className="text-[11px] font-semibold uppercase tracking-wider text-[#88999d] flex items-center gap-1.5">
                    <Globe size={13} className="text-[#34d399]" /> 1. Country <span className="text-[#d9ff5b]">*</span>
                  </label>
                  <div className="relative mt-1.5">
                    <select
                      value={isCustomCountry ? '__OTHER__' : country}
                      onChange={(e) => handleCountryChange(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-[#12191d] p-2.5 text-xs text-white focus:border-[#d9ff5b] focus:outline-none"
                    >
                      <option value="" disabled>Select Country</option>
                      {COUNTRIES_DATA.map((c) => (
                        <option key={c.code} value={c.name} className="bg-[#12191d] text-white">
                          {c.name}
                        </option>
                      ))}
                      <option value="__OTHER__" className="bg-[#12191d] text-[#d9ff5b]">
                        + Other / Custom Country
                      </option>
                    </select>
                  </div>
                  {isCustomCountry && (
                    <input
                      type="text"
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      placeholder="Type country name..."
                      className="mt-2 w-full rounded-xl border border-[#d9ff5b]/40 bg-[#12191d] py-2 px-3 text-xs text-white placeholder-[#4c595e] focus:border-[#d9ff5b] focus:outline-none"
                    />
                  )}
                </div>

                {/* 2. State / Province Selection */}
                <div>
                  <label className="text-[11px] font-semibold uppercase tracking-wider text-[#88999d] flex items-center gap-1.5">
                    <MapPin size={13} className="text-[#f59e0b]" /> 2. State / Province <span className="text-[#d9ff5b]">*</span>
                  </label>
                  <div className="relative mt-1.5">
                    <select
                      disabled={!country && !isCustomCountry}
                      value={isCustomState ? '__OTHER__' : stateName}
                      onChange={(e) => handleStateChange(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-[#12191d] p-2.5 text-xs text-white focus:border-[#d9ff5b] focus:outline-none disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {!country && !isCustomCountry ? (
                        <option value="">Select country first...</option>
                      ) : (
                        <>
                          <option value="" disabled>Select State</option>
                          {availableStates.map((s) => (
                            <option key={s.name} value={s.name} className="bg-[#12191d] text-white">
                              {s.name}
                            </option>
                          ))}
                          <option value="__OTHER__" className="bg-[#12191d] text-[#d9ff5b]">
                            + Other / Custom State
                          </option>
                        </>
                      )}
                    </select>
                  </div>
                  {isCustomState && (
                    <input
                      type="text"
                      value={stateName}
                      onChange={(e) => setStateName(e.target.value)}
                      placeholder="Type state/province name..."
                      className="mt-2 w-full rounded-xl border border-[#d9ff5b]/40 bg-[#12191d] py-2 px-3 text-xs text-white placeholder-[#4c595e] focus:border-[#d9ff5b] focus:outline-none"
                    />
                  )}
                </div>

                {/* 3. City Selection */}
                <div>
                  <label className="text-[11px] font-semibold uppercase tracking-wider text-[#88999d] flex items-center gap-1.5">
                    <Building size={13} className="text-[#a78bfa]" /> 3. City <span className="text-[#d9ff5b]">*</span>
                  </label>
                  <div className="relative mt-1.5">
                    <select
                      disabled={(!stateName && !isCustomState) || (!country && !isCustomCountry)}
                      value={isCustomCity ? '__OTHER__' : city}
                      onChange={(e) => handleCityChange(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-[#12191d] p-2.5 text-xs text-white focus:border-[#d9ff5b] focus:outline-none disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {!stateName && !isCustomState ? (
                        <option value="">Select state first...</option>
                      ) : (
                        <>
                          <option value="" disabled>Select City</option>
                          {availableCities.map((ct) => (
                            <option key={ct} value={ct} className="bg-[#12191d] text-white">
                              {ct}
                            </option>
                          ))}
                          <option value="__OTHER__" className="bg-[#12191d] text-[#d9ff5b]">
                            + Other / Custom City
                          </option>
                        </>
                      )}
                    </select>
                  </div>
                  {isCustomCity && (
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="Type city name..."
                      className="mt-2 w-full rounded-xl border border-[#d9ff5b]/40 bg-[#12191d] py-2 px-3 text-xs text-white placeholder-[#4c595e] focus:border-[#d9ff5b] focus:outline-none"
                    />
                  )}
                </div>

                {/* 4. PIN / Postal Code */}
                <div>
                  <label className="text-[11px] font-semibold uppercase tracking-wider text-[#88999d] flex items-center gap-1.5">
                    <Compass size={13} className="text-[#f43f5e]" /> 4. PIN / Postal Code
                  </label>
                  <div className="relative mt-1.5">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-[#5e6d72]">
                      <Compass size={14} />
                    </div>
                    <input
                      type="text"
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value)}
                      placeholder="e.g. 281406"
                      className="w-full rounded-xl border border-white/10 bg-[#12191d] py-2.5 pr-4 pl-10 text-xs text-white placeholder-[#4c595e] focus:border-[#d9ff5b] focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Complete Address Live Preview Box */}
              {(houseNo || street || city || stateName || pincode || country) && (
                <div className="rounded-2xl border border-white/5 bg-[#12191d]/70 p-3.5 flex items-start gap-2.5 text-xs text-[#8e9fa4]">
                  <MapPin size={15} className="mt-0.5 shrink-0 text-[#d9ff5b]" />
                  <div>
                    <span className="font-semibold text-white mr-1.5">Full Address Preview:</span>
                    <span>
                      {[houseNo, street, city, stateName, pincode ? `- ${pincode}` : '', country]
                        .filter(Boolean)
                        .join(', ')}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* SECTION 4: Social & Portfolio Links */}
            <div className="rounded-3xl border border-white/[.08] bg-[#0e1417] p-7 shadow-sm space-y-6">
              <div>
                <h2 className="text-sm font-bold text-white flex items-center gap-2">
                  <Globe size={16} className="text-[#d9ff5b]" />
                  Social &amp; Portfolio Links
                </h2>
                <p className="text-xs text-[#6e7d82] mt-0.5">
                  Connect your online photography portfolio, social profiles, and creative handles.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                {/* Instagram */}
                <div>
                  <label className="text-[11px] font-semibold uppercase tracking-wider text-[#88999d] flex items-center gap-1.5">
                    <InstagramIcon size={13} className="text-[#ec4899]" /> Instagram Handle
                  </label>
                  <div className="relative mt-1.5">
                    <input
                      type="text"
                      value={instagram}
                      onChange={(e) => setInstagram(e.target.value)}
                      placeholder="@devkumar_clicks"
                      className="w-full rounded-xl border border-white/10 bg-[#12191d] py-2.5 px-3.5 text-xs text-white placeholder-[#4c595e] focus:border-[#d9ff5b] focus:outline-none"
                    />
                  </div>
                </div>

                {/* Portfolio Website */}
                <div>
                  <label className="text-[11px] font-semibold uppercase tracking-wider text-[#88999d] flex items-center gap-1.5">
                    <Globe size={13} className="text-[#38bdf8]" /> Portfolio / Website URL
                  </label>
                  <div className="relative mt-1.5">
                    <input
                      type="url"
                      value={portfolio}
                      onChange={(e) => setPortfolio(e.target.value)}
                      placeholder="https://myportfolio.com"
                      className="w-full rounded-xl border border-white/10 bg-[#12191d] py-2.5 px-3.5 text-xs text-white placeholder-[#4c595e] focus:border-[#d9ff5b] focus:outline-none"
                    />
                  </div>
                </div>

                {/* Twitter / X */}
                <div>
                  <label className="text-[11px] font-semibold uppercase tracking-wider text-[#88999d] flex items-center gap-1.5">
                    <TwitterIcon size={13} className="text-[#38bdf8]" /> Twitter (X) Profile
                  </label>
                  <div className="relative mt-1.5">
                    <input
                      type="text"
                      value={twitter}
                      onChange={(e) => setTwitter(e.target.value)}
                      placeholder="@devkumar_ai"
                      className="w-full rounded-xl border border-white/10 bg-[#12191d] py-2.5 px-3.5 text-xs text-white placeholder-[#4c595e] focus:border-[#d9ff5b] focus:outline-none"
                    />
                  </div>
                </div>

                {/* LinkedIn */}
                <div>
                  <label className="text-[11px] font-semibold uppercase tracking-wider text-[#88999d] flex items-center gap-1.5">
                    <LinkedinIcon size={13} className="text-[#0ea5e9]" /> LinkedIn Profile
                  </label>
                  <div className="relative mt-1.5">
                    <input
                      type="url"
                      value={linkedin}
                      onChange={(e) => setLinkedin(e.target.value)}
                      placeholder="https://linkedin.com/in/devkumartarkar"
                      className="w-full rounded-xl border border-white/10 bg-[#12191d] py-2.5 px-3.5 text-xs text-white placeholder-[#4c595e] focus:border-[#d9ff5b] focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Save Profile Button */}
            <div className="flex items-center justify-between border-t border-white/[.08] pt-5">
              <span className="text-[11px] text-[#5e6e73]">
                Profile edits immediately sync to your active session.
              </span>
              <button
                type="submit"
                className="flex items-center gap-2 rounded-xl bg-[#d9ff5b] px-6 py-2.5 text-xs font-bold text-[#070a0d] shadow-[0_0_20px_rgba(217,255,91,.25)] transition hover:bg-[#c7f347]"
              >
                <Save size={14} /> Save Profile Changes
              </button>
            </div>
          </form>

          {/* SECTION 5: Account Security (Change Password) */}
          <div className="rounded-3xl border border-white/[.08] bg-[#0e1417] p-7 shadow-sm space-y-6">
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Lock size={16} className="text-[#38bdf8]" />
                Account Security &amp; Password
              </h2>
              <p className="text-xs text-[#6e7d82] mt-0.5">
                Update your account password to ensure your studio sessions remain secure.
              </p>
            </div>

            {passwordError && (
              <div className="flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3.5 text-xs text-rose-400">
                <AlertCircle size={15} />
                {passwordError}
              </div>
            )}

            {passwordSuccess && (
              <div className="flex items-center gap-2 rounded-xl border border-[#10b981]/30 bg-[#10b981]/10 p-3.5 text-xs text-[#10b981]">
                <CheckCircle2 size={15} />
                Password updated successfully! Your account credentials have been refreshed.
              </div>
            )}

            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                {/* Current Password */}
                <div>
                  <label className="text-[11px] font-semibold uppercase tracking-wider text-[#88999d]">
                    Current Password
                  </label>
                  <div className="relative mt-1.5">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-[#5e6d72]">
                      <KeyRound size={15} />
                    </div>
                    <input
                      type={showCurrentPass ? 'text' : 'password'}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full rounded-xl border border-white/10 bg-[#12191d] py-2.5 pr-10 pl-10 text-xs text-white placeholder-[#4c595e] focus:border-[#d9ff5b] focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPass(!showCurrentPass)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-[#5e6d72] hover:text-white"
                    >
                      {showCurrentPass ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                {/* New Password */}
                <div>
                  <label className="text-[11px] font-semibold uppercase tracking-wider text-[#88999d]">
                    New Password
                  </label>
                  <div className="relative mt-1.5">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-[#5e6d72]">
                      <Lock size={15} />
                    </div>
                    <input
                      type={showNewPass ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full rounded-xl border border-white/10 bg-[#12191d] py-2.5 pr-10 pl-10 text-xs text-white placeholder-[#4c595e] focus:border-[#d9ff5b] focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPass(!showNewPass)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-[#5e6d72] hover:text-white"
                    >
                      {showNewPass ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                {/* Confirm New Password */}
                <div>
                  <label className="text-[11px] font-semibold uppercase tracking-wider text-[#88999d]">
                    Confirm New Password
                  </label>
                  <div className="relative mt-1.5">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-[#5e6d72]">
                      <Lock size={15} />
                    </div>
                    <input
                      type={showConfirmPass ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full rounded-xl border border-white/10 bg-[#12191d] py-2.5 pr-10 pl-10 text-xs text-white placeholder-[#4c595e] focus:border-[#d9ff5b] focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPass(!showConfirmPass)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-[#5e6d72] hover:text-white"
                    >
                      {showConfirmPass ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={isUpdatingPassword}
                  className="flex items-center gap-2 rounded-xl border border-white/15 bg-white/[.05] px-5 py-2.5 text-xs font-semibold text-white transition hover:bg-white/10 hover:border-white/30 disabled:opacity-50"
                >
                  <KeyRound size={14} />
                  {isUpdatingPassword ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  )
}
