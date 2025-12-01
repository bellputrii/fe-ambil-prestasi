'use client'
import { useState, FormEvent, ChangeEvent } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [message, setMessage] = useState<string | null>(null)
  const [showOtpVerification, setShowOtpVerification] = useState(false)
  const [otp, setOtp] = useState('')
  const [otpCountdown, setOtpCountdown] = useState(0)
  const [resetToken, setResetToken] = useState('')
  
  const router = useRouter()

  // Fungsi untuk memulai countdown OTP
  const startOtpCountdown = () => {
    setOtpCountdown(300) // 300 detik
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

  // Fungsi untuk mengirim permintaan reset password
  const handleForgotPassword = async (e: FormEvent) => {
    e.preventDefault()
    setStatus("loading")
    setMessage(null)

    try {
      // Validasi email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(email.trim())) {
        setStatus("error")
        setMessage('Format email tidak valid')
        setTimeout(() => setStatus("idle"), 4000)
        return
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/forgot-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          email: email.trim(),
        }),
      })

      const result = await response.json()
      console.log('Forgot password response:', result)

      if (!response.ok) {
        throw new Error(result?.message || `HTTP error! status: ${response.status}`)
      }

      if (!result.success) {
        throw new Error(result.message || "Gagal mengirim OTP")
      }

      setStatus("success")
      setMessage('OTP reset password telah dikirim ke email Anda')
      setShowOtpVerification(true)
      startOtpCountdown()
      
      // Simpan email di localStorage untuk digunakan di halaman reset password
      localStorage.setItem('resetEmail', email.trim())
      
      setTimeout(() => setStatus("idle"), 3000)
      
    } catch (error: unknown) {
      console.error('Forgot password error:', error)
      setStatus("error")
      const errMsg = error instanceof Error ? error.message : 'Terjadi kesalahan. Silakan coba lagi.'
      setMessage(errMsg)
      setTimeout(() => setStatus("idle"), 4000)
    }
  }

  // Fungsi untuk verifikasi OTP dan mendapatkan reset token
  const handleVerifyOtp = async (e: FormEvent) => {
    e.preventDefault()
    setStatus("loading")
    setMessage(null)

    try {
      // Asumsi: OTP yang diterima user adalah reset_token
      // Jika ada endpoint verifikasi OTP terpisah, sesuaikan dengan API
      const token = localStorage.getItem("token")
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/verify-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          ...(token && { "Authorization": `Bearer ${token}` })
        },
        body: new URLSearchParams({
          email: email.trim(),
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

      // Simpan reset token (dari OTP atau dari response)
      // Asumsi: OTP adalah reset_token atau API mengembalikan reset_token
      const tokenToUse = result.data?.reset_token || otp
      setResetToken(tokenToUse)
      
      // Simpan di localStorage untuk halaman reset password
      localStorage.setItem('resetToken', tokenToUse)
      
      setStatus("success")
      setMessage('OTP berhasil diverifikasi. Mengarahkan ke halaman reset password...')
      
      setTimeout(() => {
        router.push('/auth/reset-password')
      }, 2000)
      
    } catch (error: unknown) {
      console.error('Verify OTP error:', error)
      setStatus("error")
      const errMsg = error instanceof Error ? error.message : 'Verifikasi OTP gagal'
      setMessage(errMsg)
      setTimeout(() => setStatus("idle"), 4000)
    }
  }

  // Fungsi resend OTP untuk forgot password
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
          email: email.trim(),
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
      setTimeout(() => setStatus("idle"), 3000)
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
              <span className="font-semibold text-gray-800">{email}</span>
            </p>
            <p className="text-gray-500 text-xs mt-2">
              Masukkan kode OTP yang Anda terima di email untuk melanjutkan proses reset password
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
                <span className="text-sm sm:text-base">Verifikasi OTP</span>
              )}
            </button>
          </form>

          {/* Info */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-blue-800 text-sm text-center">
              <strong>Perhatian:</strong> Kode OTP akan kadaluarsa dalam 5 menit
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-4 sm:p-6 lg:p-8">
      <Head>
        <title>Lupa Password - Ambil Prestasi</title>
        <meta name="theme-color" content="#0041A3" />
        <meta name="color-scheme" content="light only" />
      </Head>

      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg border border-gray-200 p-6 sm:p-8 mx-auto">
        {/* Back to Login */}
        <div className="mb-6">
          <Link 
            href="/login" 
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span className="text-sm font-medium">Kembali ke Login</span>
          </Link>
        </div>

        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-[#0041A3] mb-2">
            Lupa Password?
          </h1>
          <p className="text-gray-600 text-sm">
            Masukkan email Anda yang terdaftar. Kami akan mengirimkan
            kode OTP untuk mereset password Anda.
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

        {/* Email Form */}
        <form onSubmit={handleForgotPassword} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
              placeholder="nama@email.com"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0041A3] focus:border-[#0041A3] outline-none transition-all text-gray-900 placeholder-gray-500"
              required
              disabled={status === "loading"}
            />
          </div>

          {/* Submit Button */}
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
                <span className="text-sm sm:text-base">Mengirim OTP...</span>
              </>
            ) : (
              <span className="text-sm sm:text-base">Kirim OTP</span>
            )}
          </button>
        </form>

        {/* Additional Info */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-blue-800 text-sm text-center">
            <strong>Tips:</strong> Pastikan email yang Anda masukkan sama dengan email yang digunakan saat mendaftar
          </p>
        </div>
      </div>
    </div>
  )
}