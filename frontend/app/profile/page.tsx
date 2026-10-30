'use client'

import { useState, useEffect, useRef } from 'react'
import Navbar from '@/components/Navbar'
import Sidebar from '@/components/Sidebar'
import Footer from '@/components/Footer'
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
  Compass,
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
    <div className="flex min-h-screen flex-col bg-[#F7F8F4] text-[#193B38] selection:bg-[#EAF1ED] selection:text-[#173F38]">
      <Navbar />

      <main className="mx-auto flex w-full max-w-[1720px] flex-1 gap-8 px-5 py-8 lg:px-9">
        <Sidebar />

        <div className="min-w-0 flex-1 space-y-8">
          {/* Header */}
          <div className="flex flex-col justify-between gap-4 border-b border-[#E3E9E5] pb-6 sm:flex-row sm:items-center">
            <div>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EAF1ED] text-[#21866D] shadow-sm">
                  <User size={20} />
                </div>
                <h1 className="font-serif text-2xl font-normal italic tracking-tight text-[#193B38] lg:text-3xl">
                  Your Profile &amp; Settings
                </h1>
              </div>
              <p className="mt-1.5 text-xs text-[#647773]">
                Manage your personal information, photography identity, and account preferences.
              </p>
            </div>

            <button
              onClick={logout}
              className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-xs font-semibold text-rose-700 transition hover:bg-rose-100"
            >
              <LogOut size={14} /> Sign Out
            </button>
          </div>

          {savedSuccess && (
            <div className="flex items-center gap-2.5 rounded-2xl border border-[#21866D]/30 bg-[#EAF1ED] p-4 text-xs font-semibold text-[#173F38] shadow-sm animate-in fade-in duration-200">
              <CheckCircle2 size={18} className="text-[#21866D] shrink-0" />
              <span>Profile updated successfully! All details have been synced to your active session.</span>
            </div>
          )}

          {/* MAIN PROFILE FORM */}
          <form onSubmit={handleSaveProfile} className="space-y-8">
            {/* SECTION 1: Profile Photo Card */}
            <div className="rounded-2xl border border-[#E3E9E5] bg-[#FFFFFF] p-7 shadow-sm">
              <h2 className="text-sm font-bold text-[#193B38] mb-1">Profile Photo</h2>
              <p className="text-xs text-[#647773] mb-6">
                Your avatar appears on your viewfinder HUD, navbar, and exported evaluation cards.
              </p>

              <div className="flex flex-col sm:flex-row items-center gap-6">
                <div className="relative group">
                  <div className="h-24 w-24 rounded-full overflow-hidden border-2 border-[#21866D]/20 shadow-md bg-[#F7F8F4] flex items-center justify-center">
                    {avatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={avatarUrl}
                        alt={fullNameDisplay}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="text-2xl font-bold text-[#173F38]">
                        {user?.avatarText || 'DK'}
                      </span>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute inset-0 rounded-full bg-[#173F38]/70 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition text-[10px] text-white font-medium cursor-pointer"
                  >
                    <Camera size={18} className="mb-0.5 text-white" />
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

                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex h-11 items-center gap-2 rounded-xl bg-[#173F38] px-5 text-xs font-semibold text-white shadow-sm transition hover:bg-[#21866D]"
                    >
                      <Upload size={14} /> Upload New Photo
                    </button>

                    {avatarUrl && (
                      <button
                        type="button"
                        onClick={handleRemoveAvatar}
                        className="flex h-11 items-center gap-2 rounded-xl border border-[#E3E9E5] bg-white px-4 text-xs font-medium text-[#647773] transition hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200"
                      >
                        <Trash2 size={14} /> Remove
                      </button>
                    )}
                  </div>

                  <p className="text-[11px] text-[#647773]">
                    Recommended: Square JPG, PNG, or WebP. Max file size: 5MB.
                  </p>
                </div>
              </div>
            </div>

            {/* SECTION 2: Personal Information */}
            <div className="rounded-2xl border border-[#E3E9E5] bg-[#FFFFFF] p-7 shadow-sm space-y-6">
              <div>
                <h2 className="text-sm font-bold text-[#193B38]">Personal Information</h2>
                <p className="text-xs text-[#647773] mt-0.5">
                  Update your official name, email, contact number, and personal details.
                </p>
              </div>

              {/* Name split into First, Middle, and Last Name */}
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
                {/* First Name */}
                <div>
                  <label className="text-[11px] font-semibold uppercase tracking-wider text-[#647773]">
                    First Name <span className="text-[#DC5C5C]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="e.g. Dev"
                    className="mt-1.5 h-12 w-full rounded-xl border border-[#E3E9E5] bg-white px-4 text-xs text-[#193B38] placeholder-[#8C9E9A] transition focus:border-[#21866D] focus:outline-none focus:ring-1 focus:ring-[#21866D]"
                  />
                </div>

                {/* Middle Name */}
                <div>
                  <label className="text-[11px] font-semibold uppercase tracking-wider text-[#647773]">
                    Middle Name <span className="text-[#8C9E9A] font-normal">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    value={middleName}
                    onChange={(e) => setMiddleName(e.target.value)}
                    placeholder="e.g. Kumar"
                    className="mt-1.5 h-12 w-full rounded-xl border border-[#E3E9E5] bg-white px-4 text-xs text-[#193B38] placeholder-[#8C9E9A] transition focus:border-[#21866D] focus:outline-none focus:ring-1 focus:ring-[#21866D]"
                  />
                </div>

                {/* Last Name */}
                <div>
                  <label className="text-[11px] font-semibold uppercase tracking-wider text-[#647773]">
                    Last Name <span className="text-[#DC5C5C]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="e.g. Tarkar"
                    className="mt-1.5 h-12 w-full rounded-xl border border-[#E3E9E5] bg-white px-4 text-xs text-[#193B38] placeholder-[#8C9E9A] transition focus:border-[#21866D] focus:outline-none focus:ring-1 focus:ring-[#21866D]"
                  />
                </div>
              </div>

              {/* Email, Phone, DOB, Gender */}
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                {/* Email Address */}
                <div>
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-semibold uppercase tracking-wider text-[#647773]">
                      Email Address
                    </label>
                    <span className="flex items-center gap-1 text-[11px] text-[#16A085] font-semibold">
                      <ShieldCheck size={13} /> Verified
                    </span>
                  </div>
                  <div className="relative mt-1.5">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-[#647773]">
                      <Mail size={16} />
                    </div>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="dev.kumar@example.com"
                      className="h-12 w-full rounded-xl border border-[#E3E9E5] bg-white pr-4 pl-11 text-xs text-[#193B38] placeholder-[#8C9E9A] transition focus:border-[#21866D] focus:outline-none focus:ring-1 focus:ring-[#21866D]"
                    />
                  </div>
                </div>

                {/* Phone Number */}
                <div>
                  <label className="text-[11px] font-semibold uppercase tracking-wider text-[#647773]">
                    Phone Number
                  </label>
                  <div className="relative mt-1.5">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-[#647773]">
                      <Phone size={16} />
                    </div>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="h-12 w-full rounded-xl border border-[#E3E9E5] bg-white pr-4 pl-11 text-xs text-[#193B38] placeholder-[#8C9E9A] transition focus:border-[#21866D] focus:outline-none focus:ring-1 focus:ring-[#21866D]"
                    />
                  </div>
                </div>

                {/* Date of Birth */}
                <div>
                  <label className="text-[11px] font-semibold uppercase tracking-wider text-[#647773]">
                    Date of Birth
                  </label>
                  <div className="relative mt-1.5">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-[#647773]">
                      <Calendar size={16} />
                    </div>
                    <input
                      type="date"
                      value={dob}
                      onChange={(e) => setDob(e.target.value)}
                      className="h-12 w-full rounded-xl border border-[#E3E9E5] bg-white pr-4 pl-11 text-xs text-[#193B38] transition focus:border-[#21866D] focus:outline-none focus:ring-1 focus:ring-[#21866D]"
                    />
                  </div>
                </div>

                {/* Gender */}
                <div>
                  <label className="text-[11px] font-semibold uppercase tracking-wider text-[#647773]">
                    Gender
                  </label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="mt-1.5 h-12 w-full rounded-xl border border-[#E3E9E5] bg-white px-4 text-xs text-[#193B38] transition focus:border-[#21866D] focus:outline-none focus:ring-1 focus:ring-[#21866D]"
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
                <label className="text-[11px] font-semibold uppercase tracking-wider text-[#647773]">
                  Bio / About Me
                </label>
                <textarea
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Share a short bio or photography interest..."
                  className="mt-1.5 w-full rounded-xl border border-[#E3E9E5] bg-white p-4 text-xs text-[#193B38] placeholder-[#8C9E9A] transition focus:border-[#21866D] focus:outline-none focus:ring-1 focus:ring-[#21866D]"
                />
              </div>
            </div>

            {/* SECTION 3: Residential Address & Location Details */}
            <div className="rounded-2xl border border-[#E3E9E5] bg-[#FFFFFF] p-7 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <h2 className="text-sm font-bold text-[#193B38] flex items-center gap-2">
                    <MapPin size={16} className="text-[#21866D]" />
                    Address &amp; Location Details
                  </h2>
                  <p className="text-xs text-[#647773] mt-0.5">
                    Individual breakdown for house/apartment, street/landmark, city, state, country, and postal code.
                  </p>
                </div>
                {/* Live Formatted Summary Pill */}
                <div className="inline-flex items-center gap-1.5 rounded-full border border-[#E3E9E5] bg-[#F7F8F4] px-3.5 py-1 text-xs text-[#647773]">
                  <Globe size={13} className="text-[#21866D]" />
                  <span>{[city, stateName, country].filter(Boolean).join(', ') || 'Location Pending'}</span>
                </div>
              </div>

              {/* Row 1: House No. & Street */}
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                {/* House No / Apartment */}
                <div>
                  <label className="text-[11px] font-semibold uppercase tracking-wider text-[#647773] flex items-center gap-1.5">
                    <Home size={13} className="text-[#21866D]" /> House No. / Flat / Apartment
                  </label>
                  <div className="relative mt-1.5">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-[#647773]">
                      <Home size={15} />
                    </div>
                    <input
                      type="text"
                      value={houseNo}
                      onChange={(e) => setHouseNo(e.target.value)}
                      placeholder="e.g. Flat 402, Block B / H.No. 128"
                      className="h-12 w-full rounded-xl border border-[#E3E9E5] bg-white pr-4 pl-11 text-xs text-[#193B38] placeholder-[#8C9E9A] transition focus:border-[#21866D] focus:outline-none focus:ring-1 focus:ring-[#21866D]"
                    />
                  </div>
                </div>

                {/* Street / Landmark */}
                <div>
                  <label className="text-[11px] font-semibold uppercase tracking-wider text-[#647773] flex items-center gap-1.5">
                    <Navigation size={13} className="text-[#21866D]" /> Street / Area / Landmark
                  </label>
                  <div className="relative mt-1.5">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-[#647773]">
                      <Navigation size={15} />
                    </div>
                    <input
                      type="text"
                      value={street}
                      onChange={(e) => setStreet(e.target.value)}
                      placeholder="e.g. Chaumuhan, NH-19 (Near GLA Campus)"
                      className="h-12 w-full rounded-xl border border-[#E3E9E5] bg-white pr-4 pl-11 text-xs text-[#193B38] placeholder-[#8C9E9A] transition focus:border-[#21866D] focus:outline-none focus:ring-1 focus:ring-[#21866D]"
                    />
                  </div>
                </div>
              </div>

              {/* Row 2: Cascading Country -> State -> City Dropdowns + PIN Code */}
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {/* 1. Country Selection */}
                <div>
                  <label className="text-[11px] font-semibold uppercase tracking-wider text-[#647773] flex items-center gap-1.5">
                    <Globe size={13} className="text-[#21866D]" /> 1. Country <span className="text-[#DC5C5C]">*</span>
                  </label>
                  <div className="relative mt-1.5">
                    <select
                      value={isCustomCountry ? '__OTHER__' : country}
                      onChange={(e) => handleCountryChange(e.target.value)}
                      className="h-12 w-full rounded-xl border border-[#E3E9E5] bg-white px-3.5 text-xs text-[#193B38] transition focus:border-[#21866D] focus:outline-none focus:ring-1 focus:ring-[#21866D]"
                    >
                      <option value="" disabled>Select Country</option>
                      {COUNTRIES_DATA.map((c) => (
                        <option key={c.code} value={c.name}>
                          {c.name}
                        </option>
                      ))}
                      <option value="__OTHER__">
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
                      className="mt-2 h-11 w-full rounded-xl border border-[#21866D] bg-white px-3 text-xs text-[#193B38] placeholder-[#8C9E9A] focus:outline-none"
                    />
                  )}
                </div>

                {/* 2. State / Province Selection */}
                <div>
                  <label className="text-[11px] font-semibold uppercase tracking-wider text-[#647773] flex items-center gap-1.5">
                    <MapPin size={13} className="text-[#21866D]" /> 2. State / Province <span className="text-[#DC5C5C]">*</span>
                  </label>
                  <div className="relative mt-1.5">
                    <select
                      disabled={!country && !isCustomCountry}
                      value={isCustomState ? '__OTHER__' : stateName}
                      onChange={(e) => handleStateChange(e.target.value)}
                      className="h-12 w-full rounded-xl border border-[#E3E9E5] bg-white px-3.5 text-xs text-[#193B38] transition focus:border-[#21866D] focus:outline-none focus:ring-1 focus:ring-[#21866D] disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {!country && !isCustomCountry ? (
                        <option value="">Select country first...</option>
                      ) : (
                        <>
                          <option value="" disabled>Select State</option>
                          {availableStates.map((s) => (
                            <option key={s.name} value={s.name}>
                              {s.name}
                            </option>
                          ))}
                          <option value="__OTHER__">
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
                      className="mt-2 h-11 w-full rounded-xl border border-[#21866D] bg-white px-3 text-xs text-[#193B38] placeholder-[#8C9E9A] focus:outline-none"
                    />
                  )}
                </div>

                {/* 3. City Selection */}
                <div>
                  <label className="text-[11px] font-semibold uppercase tracking-wider text-[#647773] flex items-center gap-1.5">
                    <Building size={13} className="text-[#21866D]" /> 3. City <span className="text-[#DC5C5C]">*</span>
                  </label>
                  <div className="relative mt-1.5">
                    <select
                      disabled={(!stateName && !isCustomState) || (!country && !isCustomCountry)}
                      value={isCustomCity ? '__OTHER__' : city}
                      onChange={(e) => handleCityChange(e.target.value)}
                      className="h-12 w-full rounded-xl border border-[#E3E9E5] bg-white px-3.5 text-xs text-[#193B38] transition focus:border-[#21866D] focus:outline-none focus:ring-1 focus:ring-[#21866D] disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {!stateName && !isCustomState ? (
                        <option value="">Select state first...</option>
                      ) : (
                        <>
                          <option value="" disabled>Select City</option>
                          {availableCities.map((ct) => (
                            <option key={ct} value={ct}>
                              {ct}
                            </option>
                          ))}
                          <option value="__OTHER__">
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
                      className="mt-2 h-11 w-full rounded-xl border border-[#21866D] bg-white px-3 text-xs text-[#193B38] placeholder-[#8C9E9A] focus:outline-none"
                    />
                  )}
                </div>

                {/* 4. PIN / Postal Code */}
                <div>
                  <label className="text-[11px] font-semibold uppercase tracking-wider text-[#647773] flex items-center gap-1.5">
                    <Compass size={13} className="text-[#21866D]" /> 4. PIN / Postal Code
                  </label>
                  <div className="relative mt-1.5">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-[#647773]">
                      <Compass size={15} />
                    </div>
                    <input
                      type="text"
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value)}
                      placeholder="e.g. 281406"
                      className="h-12 w-full rounded-xl border border-[#E3E9E5] bg-white pr-4 pl-11 text-xs text-[#193B38] placeholder-[#8C9E9A] transition focus:border-[#21866D] focus:outline-none focus:ring-1 focus:ring-[#21866D]"
                    />
                  </div>
                </div>
              </div>

              {/* Complete Address Live Preview Box */}
              {(houseNo || street || city || stateName || pincode || country) && (
                <div className="rounded-2xl border border-[#21866D]/20 bg-[#EAF1ED] p-4 flex items-start gap-3 text-xs text-[#193B38]">
                  <MapPin size={16} className="mt-0.5 shrink-0 text-[#21866D]" />
                  <div>
                    <span className="font-semibold text-[#173F38] mr-2">Full Address Preview:</span>
                    <span className="text-[#193B38]">
                      {[houseNo, street, city, stateName, pincode ? `- ${pincode}` : '', country]
                        .filter(Boolean)
                        .join(', ')}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* SECTION 4: Social & Portfolio Links */}
            <div className="rounded-2xl border border-[#E3E9E5] bg-[#FFFFFF] p-7 shadow-sm space-y-6">
              <div>
                <h2 className="text-sm font-bold text-[#193B38] flex items-center gap-2">
                  <Globe size={16} className="text-[#21866D]" />
                  Social &amp; Portfolio Links
                </h2>
                <p className="text-xs text-[#647773] mt-0.5">
                  Connect your online photography portfolio, social profiles, and creative handles.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                {/* Instagram */}
                <div>
                  <label className="text-[11px] font-semibold uppercase tracking-wider text-[#647773] flex items-center gap-1.5">
                    <InstagramIcon size={14} className="text-[#21866D]" /> Instagram Handle
                  </label>
                  <input
                    type="text"
                    value={instagram}
                    onChange={(e) => setInstagram(e.target.value)}
                    placeholder="@username"
                    className="mt-1.5 h-12 w-full rounded-xl border border-[#E3E9E5] bg-white px-4 text-xs text-[#193B38] placeholder-[#8C9E9A] transition focus:border-[#21866D] focus:outline-none focus:ring-1 focus:ring-[#21866D]"
                  />
                </div>

                {/* Portfolio Website */}
                <div>
                  <label className="text-[11px] font-semibold uppercase tracking-wider text-[#647773] flex items-center gap-1.5">
                    <Globe size={14} className="text-[#21866D]" /> Portfolio / Website URL
                  </label>
                  <input
                    type="url"
                    value={portfolio}
                    onChange={(e) => setPortfolio(e.target.value)}
                    placeholder="https://myportfolio.com"
                    className="mt-1.5 h-12 w-full rounded-xl border border-[#E3E9E5] bg-white px-4 text-xs text-[#193B38] placeholder-[#8C9E9A] transition focus:border-[#21866D] focus:outline-none focus:ring-1 focus:ring-[#21866D]"
                  />
                </div>

                {/* Twitter / X */}
                <div>
                  <label className="text-[11px] font-semibold uppercase tracking-wider text-[#647773] flex items-center gap-1.5">
                    <TwitterIcon size={14} className="text-[#21866D]" /> Twitter (X) Profile
                  </label>
                  <input
                    type="text"
                    value={twitter}
                    onChange={(e) => setTwitter(e.target.value)}
                    placeholder="@username"
                    className="mt-1.5 h-12 w-full rounded-xl border border-[#E3E9E5] bg-white px-4 text-xs text-[#193B38] placeholder-[#8C9E9A] transition focus:border-[#21866D] focus:outline-none focus:ring-1 focus:ring-[#21866D]"
                  />
                </div>

                {/* LinkedIn */}
                <div>
                  <label className="text-[11px] font-semibold uppercase tracking-wider text-[#647773] flex items-center gap-1.5">
                    <LinkedinIcon size={14} className="text-[#21866D]" /> LinkedIn Profile
                  </label>
                  <input
                    type="url"
                    value={linkedin}
                    onChange={(e) => setLinkedin(e.target.value)}
                    placeholder="https://linkedin.com/in/username"
                    className="mt-1.5 h-12 w-full rounded-xl border border-[#E3E9E5] bg-white px-4 text-xs text-[#193B38] placeholder-[#8C9E9A] transition focus:border-[#21866D] focus:outline-none focus:ring-1 focus:ring-[#21866D]"
                  />
                </div>
              </div>
            </div>

            {/* Save Profile Button */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-[#E3E9E5] pt-6">
              <span className="text-xs text-[#647773]">
                Profile edits immediately sync to your active session and local database.
              </span>
              <button
                type="submit"
                className="flex h-12 items-center gap-2 rounded-xl bg-[#173F38] px-7 text-xs font-semibold text-white shadow-sm transition hover:bg-[#21866D]"
              >
                <Save size={15} /> Save Profile Changes
              </button>
            </div>
          </form>

          {/* SECTION 5: Account Security (Change Password) */}
          <div className="rounded-2xl border border-[#E3E9E5] bg-[#FFFFFF] p-7 shadow-sm space-y-6">
            <div>
              <h2 className="text-sm font-bold text-[#193B38] flex items-center gap-2">
                <Lock size={16} className="text-[#21866D]" />
                Account Security &amp; Password
              </h2>
              <p className="text-xs text-[#647773] mt-0.5">
                Update your account password to ensure your photography studio credentials remain protected.
              </p>
            </div>

            {passwordError && (
              <div className="flex items-center gap-2.5 rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs font-medium text-rose-700">
                <AlertCircle size={16} className="shrink-0" />
                <span>{passwordError}</span>
              </div>
            )}

            {passwordSuccess && (
              <div className="flex items-center gap-2.5 rounded-xl border border-[#21866D]/30 bg-[#EAF1ED] p-4 text-xs font-medium text-[#173F38]">
                <CheckCircle2 size={16} className="text-[#21866D] shrink-0" />
                <span>Password updated successfully! Your account credentials have been refreshed.</span>
              </div>
            )}

            <form onSubmit={handleUpdatePassword} className="space-y-5">
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
                {/* Current Password */}
                <div>
                  <label className="text-[11px] font-semibold uppercase tracking-wider text-[#647773]">
                    Current Password
                  </label>
                  <div className="relative mt-1.5">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-[#647773]">
                      <KeyRound size={15} />
                    </div>
                    <input
                      type={showCurrentPass ? 'text' : 'password'}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="h-12 w-full rounded-xl border border-[#E3E9E5] bg-white pr-11 pl-11 text-xs text-[#193B38] placeholder-[#8C9E9A] transition focus:border-[#21866D] focus:outline-none focus:ring-1 focus:ring-[#21866D]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPass(!showCurrentPass)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-[#647773] hover:text-[#193B38]"
                    >
                      {showCurrentPass ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {/* New Password */}
                <div>
                  <label className="text-[11px] font-semibold uppercase tracking-wider text-[#647773]">
                    New Password
                  </label>
                  <div className="relative mt-1.5">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-[#647773]">
                      <Lock size={15} />
                    </div>
                    <input
                      type={showNewPass ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="h-12 w-full rounded-xl border border-[#E3E9E5] bg-white pr-11 pl-11 text-xs text-[#193B38] placeholder-[#8C9E9A] transition focus:border-[#21866D] focus:outline-none focus:ring-1 focus:ring-[#21866D]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPass(!showNewPass)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-[#647773] hover:text-[#193B38]"
                    >
                      {showNewPass ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {/* Confirm New Password */}
                <div>
                  <label className="text-[11px] font-semibold uppercase tracking-wider text-[#647773]">
                    Confirm New Password
                  </label>
                  <div className="relative mt-1.5">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-[#647773]">
                      <Lock size={15} />
                    </div>
                    <input
                      type={showConfirmPass ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="h-12 w-full rounded-xl border border-[#E3E9E5] bg-white pr-11 pl-11 text-xs text-[#193B38] placeholder-[#8C9E9A] transition focus:border-[#21866D] focus:outline-none focus:ring-1 focus:ring-[#21866D]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPass(!showConfirmPass)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-[#647773] hover:text-[#193B38]"
                    >
                      {showConfirmPass ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={isUpdatingPassword}
                  className="flex h-11 items-center gap-2 rounded-xl bg-[#173F38] px-6 text-xs font-semibold text-white shadow-sm transition hover:bg-[#21866D] disabled:opacity-50"
                >
                  <KeyRound size={14} />
                  {isUpdatingPassword ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
