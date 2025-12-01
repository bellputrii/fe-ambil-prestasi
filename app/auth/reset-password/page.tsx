'use client'
import { useState, FormEvent, ChangeEvent, useEffect } from 'react'
import Head from 'next/head'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

export default function ResetPasswordPage() {
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [message, setMessage] = useState<string | null>(null)
  const [resetToken, setResetToken] = useState('')
  const [email, setEmail] = useState('')
  
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    // Ambil reset token dari URL atau localStorage
    const tokenFromUrl = searchParams.get('reset_token')
    const tokenFromStorage = localStorage.getItem('resetToken')
    const emailFromStorage = localStorage.getItem('resetEmail')
    
    if (tokenFromUrl) {
      setResetToken(tokenFromUrl)
    } else if (tokenFromStorage) {
      setResetToken(tokenFromStorage)
    }
    
    if (emailFromStorage) {
      setEmail(emailFromStorage)
    }
    
    // Jika tidak ada token, redirect ke forgot password
    if (!tokenFromUrl && !tokenFromStorage) {
      setStatus("error")
      setMessage('Token reset tidak valid atau telah kadaluarsa. Silakan request reset password lagi.')
      setTimeout(() => {
        router.push('/forgot-password')
      }, 3000)
    }
  }, [searchParams, router])

  // Toggle show/hide password
  const toggleNewPasswordVisibility = () => {
    setShowNewPassword(!showNewPassword)
  }

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword)
  }

  // Fungsi reset password
  const handleResetPassword = async (e: FormEvent) => {
    e.preventDefault()
    setStatus("loading")
    setMessage(null)

    try {
      // Validasi password
      if (newPassword.length < 6) {
        setStatus("error")
        setMessage('Password minimal 6 karakter')
        setTimeout(() => setStatus("idle"), 4000)
        return
      }

      if (newPassword !== confirmPassword) {
        setStatus("error")
        setMessage('Konfirmasi password tidak cocok')
        setTimeout(() => setStatus("idle"), 4000)
        return
      }

      // Validasi reset token
      if (!resetToken) {
        setStatus("error")
        setMessage('Token reset tidak valid. Silakan request reset password lagi.')
        setTimeout(() => setStatus("idle"), 4000)
        return
      }

      const token = localStorage.getItem("token")
      
      // Gunakan reset_token dari OTP yang telah diverifikasi
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/reset-password`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          ...(token && { "Authorization": `Bearer ${token}` })
        },
        body: new URLSearchParams({
          reset_token: resetToken,
          newPassword: newPassword,
          confirmPassword: confirmPassword,
        }),
      })

      const result = await response.json()
      console.log('Reset password response:', result)

      if (!response.ok) {
        throw new Error(result?.message || `HTTP error! status: ${response.status}`)
      }

      if (!result.success) {
        throw new Error(result.message || "Reset password gagal")
      }

      setStatus("success")
      setMessage('Password berhasil direset! Mengarahkan ke halaman login...')
      
      // Bersihkan localStorage
      localStorage.removeItem('resetToken')
      localStorage.removeItem('resetEmail')
      
      setTimeout(() => {
        router.push('/auth/login')
      }, 2000)
      
    } catch (error: unknown) {
      console.error('Reset password error:', error)
      setStatus("error")
      const errMsg = error instanceof Error ? error.message : 'Terjadi kesalahan. Silakan coba lagi.'
      setMessage(errMsg)
      setTimeout(() => setStatus("idle"), 4000)
    }
  }

  // Fungsi untuk request reset password ulang
  const handleRequestNewReset = () => {
    localStorage.removeItem('resetToken')
    localStorage.removeItem('resetEmail')
    router.push('/forgot-password')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-4 sm:p-6 lg:p-8">
      <Head>
        <title>Reset Password - Ambil Prestasi</title>
        <meta name="theme-color" content="#0041A3" />
        <meta name="color-scheme" content="light only" />
      </Head>

      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg border border-gray-200 p-6 sm:p-8 mx-auto">
        {/* Back to Login */}
        <div className="mb-6">
          <Link 
            href="/auth/login" 
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
            Reset Password
          </h1>
          <p className="text-gray-600 text-sm">
            Buat password baru untuk akun Anda
            {email && (
              <span className="block mt-1">
                Email: <span className="font-semibold">{email}</span>
              </span>
            )}
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

        {/* Jika token tidak valid */}
        {!resetToken && status !== "error" && (
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-lg mb-6 flex items-center gap-3">
            <div className="w-3 h-3 bg-yellow-500 rounded-full flex-shrink-0"></div>
            <div className="flex-1">
              <span className="text-sm font-medium">Token tidak ditemukan</span>
              <p className="text-xs mt-1">Silakan request reset password lagi</p>
            </div>
            <button
              onClick={handleRequestNewReset}
              className="px-3 py-1 bg-yellow-500 hover:bg-yellow-600 text-white text-xs font-medium rounded transition-colors"
            >
              Request Baru
            </button>
          </div>
        )}

        {/* Password Form */}
        <form onSubmit={handleResetPassword} className="space-y-6">
          {/* New Password */}
          <div className="relative">
            <label className="block text-sm font-semibold text-gray-800 mb-2">
              Password Baru
            </label>
            <input
              type={showNewPassword ? "text" : "password"}
              value={newPassword}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setNewPassword(e.target.value)
              }
              placeholder="••••••••"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0041A3] focus:border-[#0041A3] outline-none transition-all text-gray-900 placeholder-gray-500 pr-12"
              required
              disabled={status === "loading" || !resetToken}
              minLength={6}
            />
            <button
              type="button"
              onClick={toggleNewPasswordVisibility}
              className="absolute right-3 top-[38px] text-gray-500 hover:text-gray-700 p-1 transition-colors"
              disabled={status === "loading" || !resetToken}
            >
              {showNewPassword ? (
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
            <p className="text-xs text-gray-500 mt-1">
              Minimal 6 karakter
            </p>
          </div>

          {/* Confirm Password */}
          <div className="relative">
            <label className="block text-sm font-semibold text-gray-800 mb-2">
              Konfirmasi Password Baru
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
              disabled={status === "loading" || !resetToken}
              minLength={6}
            />
            <button
              type="button"
              onClick={toggleConfirmPasswordVisibility}
              className="absolute right-3 top-[38px] text-gray-500 hover:text-gray-700 p-1 transition-colors"
              disabled={status === "loading" || !resetToken}
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

          {/* Submit Button */}
          <button
            type="submit"
            disabled={status === "loading" || !resetToken}
            className={`w-full py-3 sm:py-4 rounded-lg font-semibold text-white transition-all duration-300 flex items-center justify-center gap-2 ${
              status === "loading" || !resetToken
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
              <span className="text-sm sm:text-base">Reset Password</span>
            )}
          </button>
        </form>

        {/* Password Requirements */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <h3 className="text-sm font-semibold text-gray-800 mb-2">
            Persyaratan Password:
          </h3>
          <ul className="text-xs text-gray-600 space-y-1">
            <li className="flex items-center gap-2">
              <svg className="w-3 h-3 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span>Minimal 6 karakter</span>
            </li>
            <li className="flex items-center gap-2">
              <svg className="w-3 h-3 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span>Password dan konfirmasi harus sama</span>
            </li>
          </ul>
        </div>

        {/* Need Help */}
        <div className="mt-6 text-center">
          <p className="text-gray-600 text-sm">
            Masih mengalami masalah?{' '}
            <button
              onClick={handleRequestNewReset}
              className="text-[#0041A3] hover:text-blue-800 font-medium transition-colors"
            >
              Request reset password baru
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}