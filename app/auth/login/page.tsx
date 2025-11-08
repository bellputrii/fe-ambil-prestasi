'use client'
import { useState, FormEvent, ChangeEvent } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [message, setMessage] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  
  // State untuk OTP verification
  const [showOtpVerification, setShowOtpVerification] = useState(false)
  const [otp, setOtp] = useState('')
  const [otpEmail, setOtpEmail] = useState('')
  const [otpCountdown, setOtpCountdown] = useState(0)

  const router = useRouter()

  // Fungsi untuk memulai countdown OTP
  const startOtpCountdown = () => {
    setOtpCountdown(60) // 60 detik
    const interval = setInterval(() => {
      setOtpCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval)
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  // Fungsi resend OTP
  const handleResendOtp = async () => {
    if (otpCountdown > 0) return
    
    setStatus("loading")
    setMessage(null)

    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/resend-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          ...(token && { "Authorization": `Bearer ${token}` })
        },
        body: new URLSearchParams({
          email: otpEmail,
        }),
      })

      const result = await response.json()
      console.log('Resend OTP response:', result)

      if (!response.ok) {
        throw new Error(result?.message || "Gagal mengirim ulang OTP")
      }

      if (!result.success) {
        throw new Error(result.message || "Gagal mengirim ulang OTP")
      }

      setStatus("success")
      setMessage('OTP telah dikirim ulang ke email Anda')
      startOtpCountdown()
      
    } catch (error: unknown) {
      console.error('Resend OTP error:', error)
      setStatus("error")
      const errMsg = error instanceof Error ? error.message : 'Gagal mengirim ulang OTP'
      setMessage(errMsg)
    } finally {
      setTimeout(() => setStatus("idle"), 3000)
    }
  }

  // Fungsi verifikasi OTP
  const handleVerifyOtp = async (e: FormEvent) => {
    e.preventDefault()
    setStatus("loading")
    setMessage(null)

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/verify-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          email: otpEmail,
          code: otp,
        }),
      })

      const result = await response.json()
      console.log('Verify OTP response:', result)

      if (!response.ok) {
        throw new Error(result?.message || "Verifikasi OTP gagal")
      }

      if (!result.success) {
        throw new Error(result.message || "Verifikasi OTP gagal")
      }

      setStatus("success")
      setMessage('Verifikasi berhasil! Akun Anda telah aktif. Silakan login.')
      
      setTimeout(() => {
        setShowOtpVerification(false)
        setIsLogin(true)
        setStatus("idle")
        setOtp('')
      }, 2000)
      
    } catch (error: unknown) {
      console.error('Verify OTP error:', error)
      setStatus("error")
      const errMsg = error instanceof Error ? error.message : 'Verifikasi OTP gagal'
      setMessage(errMsg)
      setTimeout(() => setStatus("idle"), 4000)
    }
  }

  // Fungsi submit utama
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setStatus("loading")
    setMessage(null)

    try {
      if (isLogin) {
        // 🔹 Login logic
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/login`, {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({
            usernameoremail: email,
            password: password,
          }),
        })

        const result = await response.json()
        console.log('Login response:', result)

        if (!response.ok) {
          throw new Error(result?.message || "Login gagal")
        }

        if (!result.success) {
          throw new Error(result.message || "Login gagal")
        }

        // Simpan token JWT dari backend
        const token = result.data.token
        localStorage.setItem("token", token)

        // Jika ada rememberMe, simpan di localStorage
        if (rememberMe) {
          localStorage.setItem("rememberMe", "true")
        }

        setStatus("success")

        // Handle jika perlu update password
        if (result.data.isSameCredentials) {
          setMessage("Login berhasil! Silakan update password Anda.")
          setTimeout(() => router.push('/update-password'), 1000)
          return
        }

        setMessage("Login berhasil!")

        // Debug: Log role yang diterima
        console.log('User role:', result.data.role)

        // Redirect berdasarkan role dari response backend
        const userRole = result.data.role?.toLowerCase()
        console.log('Redirecting to role:', userRole)

        // Gunakan router.replace bukan router.push untuk menghindari history stack
        switch (userRole) {
          case 'admin':
            setTimeout(() => router.replace('/teacher'), 500)
            break
          case 'teacher':
            setTimeout(() => router.replace('/beranda'), 500)
            break
          case 'student':
            setTimeout(() => router.replace('/home'), 500)
            break
          default:
            setStatus("error")
            setMessage('Role tidak dikenali: ' + userRole)
            setTimeout(() => setStatus("idle"), 4000)
        }

      } else {
        // 🔹 Register logic
        if (password !== confirmPassword) {
          setStatus("error")
          setMessage('Konfirmasi password tidak cocok')
          setTimeout(() => setStatus("idle"), 4000)
          return
        }

        // Validasi field required untuk register
        if (!name.trim() || !username.trim()) {
          setStatus("error")
          setMessage('Nama dan username harus diisi')
          setTimeout(() => setStatus("idle"), 4000)
          return
        }

        // Register API call dengan format yang benar
        const registerResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/register`, {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({
            username: username.trim(),
            name: name.trim(),
            email: email.trim(),
            password: password,
            passwordConfirmation: confirmPassword,
          }),
        })

        const registerResult = await registerResponse.json()
        console.log('Register response:', registerResult)

        if (!registerResponse.ok) {
          throw new Error(registerResult?.message || `HTTP error! status: ${registerResponse.status}`)
        }

        if (!registerResult.success) {
          throw new Error(registerResult.message || "Pendaftaran gagal")
        }

        setStatus("success")
        setMessage('Pendaftaran berhasil! Silakan verifikasi OTP yang dikirim ke email Anda.')
        
        // Set state untuk OTP verification
        setOtpEmail(email.trim())
        setShowOtpVerification(true)
        startOtpCountdown()
        
        // Reset form
        setEmail('')
        setName('')
        setUsername('')
        setPassword('')
        setConfirmPassword('')
        
        setTimeout(() => setStatus("idle"), 2000)
      }
    } catch (error: unknown) {
      console.error('Auth error:', error)
      setStatus("error")
      const errMsg =
        error instanceof Error
          ? error.message
          : typeof error === 'string'
            ? error
            : 'Terjadi kesalahan. Silakan coba lagi.'
      setMessage(errMsg)
      setTimeout(() => setStatus("idle"), 4000)
    }
  }

  // Toggle show/hide password
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword)
  }

  // Reset form ketika switch mode
  const handleToggleMode = () => {
    setIsLogin(!isLogin)
    setMessage(null)
    setStatus("idle")
    if (!isLogin) {
      // Reset fields register ketika switch ke login
      setName('')
      setUsername('')
      setConfirmPassword('')
    }
  }

  // Jika sedang menampilkan OTP verification
  if (showOtpVerification) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white p-4 sm:p-6 lg:p-8">
        <Head>
          <title>Verifikasi OTP - Ambil Prestasi</title>
          <meta name="theme-color" content="#0041A3" />
          <meta name="color-scheme" content="light only" />
        </Head>

        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg border border-gray-200 p-6 sm:p-8 mx-auto">
          {/* Back Button */}
          <button
            onClick={() => setShowOtpVerification(false)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-6 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span className="text-sm font-medium">Kembali</span>
          </button>

          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-[#0041A3] mb-2">
              Verifikasi OTP
            </h1>
            <p className="text-gray-600 text-sm">
              Kami telah mengirim kode OTP ke <br />
              <span className="font-semibold text-gray-800">{otpEmail}</span>
            </p>
          </div>

          {/* Status Messages */}
          {status === "success" && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6 flex items-center gap-3">
              <div className="w-3 h-3 bg-green-500 rounded-full flex-shrink-0"></div>
              <span className="text-sm">{message}</span>
            </div>
          )}
          {status === "error" && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center gap-3">
              <div className="w-3 h-3 bg-red-500 rounded-full flex-shrink-0"></div>
              <span className="text-sm">{message}</span>
            </div>
          )}

          {/* OTP Form */}
          <form onSubmit={handleVerifyOtp} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">
                Kode OTP
              </label>
              <input
                type="text"
                value={otp}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setOtp(e.target.value)}
                placeholder="Masukkan 6 digit kode OTP"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0041A3] focus:border-[#0041A3] outline-none transition-all text-gray-900 placeholder-gray-500 text-center text-lg font-semibold tracking-widest"
                required
                maxLength={6}
                disabled={status === "loading"}
              />
            </div>

            {/* Resend OTP */}
            <div className="text-center">
              {otpCountdown > 0 ? (
                <p className="text-gray-500 text-sm">
                  Kirim ulang OTP dalam <span className="font-semibold">{otpCountdown}</span> detik
                </p>
              ) : (
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={status === "loading"}
                  className="text-[#0041A3] hover:text-blue-800 font-medium text-sm transition-colors"
                >
                  Kirim ulang OTP
                </button>
              )}
            </div>

            {/* Verify Button */}
            <button
              type="submit"
              disabled={status === "loading" || otp.length !== 6}
              className={`w-full py-3 sm:py-4 rounded-lg font-semibold text-white transition-all duration-300 flex items-center justify-center gap-2 ${
                status === "loading" || otp.length !== 6
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-[#0041A3] hover:bg-blue-800 active:scale-95'
              }`}
            >
              {status === "loading" ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-sm sm:text-base">Memverifikasi...</span>
                </>
              ) : (
                <span className="text-sm sm:text-base">Verifikasi</span>
              )}
            </button>
          </form>

          {/* Info */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-blue-800 text-sm text-center">
              <strong>Perhatian:</strong> Kode OTP akan kadaluarsa dalam 10 menit
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-4 sm:p-6 lg:p-8">
      <Head>
        <title>{isLogin ? 'Masuk' : 'Daftar'} - Ambil Prestasi</title>
        <meta name="theme-color" content="#0041A3" />
        <meta name="color-scheme" content="light only" />
      </Head>

      <div className="max-w-6xl w-full flex flex-col lg:flex-row items-center justify-between gap-6 lg:gap-12">
        {/* Bagian kiri - Hero Section */}
        <div className="w-full lg:w-1/2 text-center lg:text-left">
          <div className="mb-6 lg:mb-8">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#0041A3] mb-3 lg:mb-4 leading-tight">
              Selamat Datang di<br />Ambil Prestasi
            </h1>
            <p className="text-gray-600 max-w-md mx-auto lg:mx-0 text-sm sm:text-base lg:text-lg leading-relaxed">
              Platform belajar online terpadu untuk membantu mahasiswa meraih
              prestasi terbaik mereka dengan materi berkualitas dan mentor berpengalaman
            </p>
          </div>
          
          {/* Features List */}
          <div className="hidden lg:block space-y-3 mt-8">
            <div className="flex items-center gap-3 text-gray-700">
              <div className="w-2 h-2 bg-[#0041A3] rounded-full"></div>
              <span className="text-sm">Materi pembelajaran lengkap</span>
            </div>
            <div className="flex items-center gap-3 text-gray-700">
              <div className="w-2 h-2 bg-[#0041A3] rounded-full"></div>
              <span className="text-sm">Mentor profesional dan berpengalaman</span>
            </div>
            <div className="flex items-center gap-3 text-gray-700">
              <div className="w-2 h-2 bg-[#0041A3] rounded-full"></div>
              <span className="text-sm">Fleksibel belajar kapan saja</span>
            </div>
          </div>
        </div>

        {/* Bagian kanan - Form Section */}
        <div className="w-full lg:w-1/2 bg-white rounded-2xl shadow-lg border border-gray-200 p-6 sm:p-8 max-w-md mx-auto">
          {/* Toggle Tab */}
          <div className="flex w-full bg-gray-100 rounded-full mb-6 sm:mb-8 p-1">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2 sm:py-3 text-sm font-medium rounded-full transition-all duration-300 ${
                isLogin 
                  ? 'bg-white shadow text-[#0041A3] font-semibold' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Masuk
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2 sm:py-3 text-sm font-medium rounded-full transition-all duration-300 ${
                !isLogin 
                  ? 'bg-white shadow text-[#0041A3] font-semibold' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Daftar
            </button>
          </div>

          {/* Status Messages */}
          {status === "success" && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6 flex items-center gap-3">
              <div className="w-3 h-3 bg-green-500 rounded-full flex-shrink-0"></div>
              <span className="text-sm">{message}</span>
            </div>
          )}
          {status === "error" && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center gap-3">
              <div className="w-3 h-3 bg-red-500 rounded-full flex-shrink-0"></div>
              <span className="text-sm">{message}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setEmail(e.target.value)
                }
                placeholder="nama@email.com"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0041A3] focus:border-[#0041A3] outline-none transition-all text-gray-900 placeholder-gray-500"
                required
                disabled={status === "loading"}
              />
            </div>

            {/* Name - hanya untuk register */}
            {!isLogin && (
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setName(e.target.value)
                  }
                  placeholder="Masukkan nama lengkap"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0041A3] focus:border-[#0041A3] outline-none transition-all text-gray-900 placeholder-gray-500"
                  required
                  disabled={status === "loading"}
                />
              </div>
            )}

            {/* Username - hanya untuk register */}
            {!isLogin && (
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  Username
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setUsername(e.target.value)
                  }
                  placeholder="Pilih username"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0041A3] focus:border-[#0041A3] outline-none transition-all text-gray-900 placeholder-gray-500"
                  required
                  disabled={status === "loading"}
                />
              </div>
            )}

            {/* Password */}
            <div className="relative">
              <label className="block text-sm font-semibold text-gray-800 mb-2">
                Password
              </label>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setPassword(e.target.value)
                }
                placeholder="••••••••"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0041A3] focus:border-[#0041A3] outline-none transition-all text-gray-900 placeholder-gray-500 pr-12"
                required
                disabled={status === "loading"}
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute right-3 top-[38px] text-gray-500 hover:text-gray-700 p-1 transition-colors"
                disabled={status === "loading"}
              >
                {showPassword ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>

            {/* Konfirmasi Password (khusus daftar) */}
            {!isLogin && (
              <div className="relative">
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  Konfirmasi Password
                </label>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setConfirmPassword(e.target.value)
                  }
                  placeholder="••••••••"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0041A3] focus:border-[#0041A3] outline-none transition-all text-gray-900 placeholder-gray-500 pr-12"
                  required
                  disabled={status === "loading"}
                />
                <button
                  type="button"
                  onClick={toggleConfirmPasswordVisibility}
                  className="absolute right-3 top-[38px] text-gray-500 hover:text-gray-700 p-1 transition-colors"
                  disabled={status === "loading"}
                >
                  {showConfirmPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            )}

            {/* Ingat saya + lupa password (hanya login) */}
            {isLogin && (
              <div className="flex items-center justify-between text-sm mt-2">
                <label className="flex items-center gap-2 text-gray-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 text-[#0041A3] focus:ring-[#0041A3] border-gray-300 rounded"
                    disabled={status === "loading"}
                  />
                  Ingat saya
                </label>
                <button
                  type="button"
                  onClick={() => router.push('/forgot-password')}
                  className="text-[#0041A3] hover:text-blue-800 transition-colors font-medium"
                  disabled={status === "loading"}
                >
                  Lupa password?
                </button>
              </div>
            )}

            {/* Tombol utama */}
            <button
              type="submit"
              disabled={status === "loading"}
              className={`w-full py-3 sm:py-4 rounded-lg font-semibold text-white transition-all duration-300 flex items-center justify-center gap-2 ${
                status === "loading"
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-[#0041A3] hover:bg-blue-800 active:scale-95'
              }`}
            >
              {status === "loading" ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-sm sm:text-base">Memproses...</span>
                </>
              ) : (
                <span className="text-sm sm:text-base">{isLogin ? 'Masuk' : 'Daftar'}</span>
              )}
            </button>
          </form>

          {/* Toggle Link */}
          <div className="text-center mt-6 sm:mt-8">
            <p className="text-gray-600 text-sm sm:text-base">
              {isLogin ? "Belum punya akun?" : "Sudah punya akun?"}{" "}
              <button
                onClick={handleToggleMode}
                className="font-semibold text-[#0041A3] hover:text-blue-800 transition-colors"
                disabled={status === "loading"}
              >
                {isLogin ? "Daftar di sini" : "Masuk di sini"}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}