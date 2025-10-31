'use client'
import { useState, FormEvent, ChangeEvent } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [message, setMessage] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const router = useRouter()

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
        console.log('Login response:', result) // Debug log

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
        console.log('Redirecting to role:', userRole) // Debug log

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

        // Register API call
        const registerResponse = await fetch("http://localhost:3001/api/v1/register", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email,
            password: password,
          }),
        })

        const registerResult = await registerResponse.json()

        if (!registerResponse.ok || !registerResult.success) {
          throw new Error(registerResult?.message || "Pendaftaran gagal")
        }

        setStatus("success")
        setMessage('Pendaftaran berhasil! Silakan login.')
        setEmail('')
        setPassword('')
        setConfirmPassword('')
        setTimeout(() => {
          setStatus("idle")
          setIsLogin(true)
        }, 2000)
      }
    } catch (error: unknown) {
      console.error('Login error:', error)
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-4">
      <Head>
        <title>{isLogin ? 'Masuk' : 'Daftar'} - Ambil Prestasi</title>
      </Head>

      <div className="max-w-6xl w-full flex flex-col md:flex-row items-center justify-between gap-8">
        {/* Bagian kiri */}
        <div className="w-full md:w-1/2 text-center md:text-left">
          <h1 className="text-2xl md:text-3xl font-semibold text-[#0041A3] mb-3">
            Selamat Datang di Ambil Prestasi
          </h1>
          <p className="text-gray-600 max-w-sm mx-auto md:mx-0 text-sm md:text-base">
            Platform belajar online terpadu untuk membantu mahasiswa meraih
            prestasi terbaik mereka
          </p>
        </div>

        {/* Bagian kanan */}
        <div className="w-full md:w-1/2 bg-white rounded-2xl shadow-lg p-6 md:p-8 max-w-md mx-auto">
          {/* Toggle Tab */}
          <div className="flex w-full bg-gray-100 rounded-full mb-6">
            <button
              onClick={() => setIsLogin(true)}
              className={`w-1/2 py-2 text-sm font-medium rounded-full transition-all ${isLogin ? 'bg-white shadow text-[#0041A3]' : 'text-gray-500'
                }`}
            >
              Masuk
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`w-1/2 py-2 text-sm font-medium rounded-full transition-all ${!isLogin ? 'bg-white shadow text-[#0041A3]' : 'text-gray-500'
                }`}
            >
              Daftar
            </button>
          </div>

          {/* Status Messages */}
          {status === "success" && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6 flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm">{message}</span>
            </div>
          )}
          {status === "error" && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center gap-2">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <span className="text-sm">{message}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setEmail(e.target.value)
                }
                placeholder="nama@email.com"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0041A3] focus:border-[#0041A3]"
                required
              />
            </div>

            {/* Password */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setPassword(e.target.value)
                }
                placeholder="••••••••"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0041A3] focus:border-[#0041A3] pr-10"
                required
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute right-3 top-8 text-gray-500 hover:text-gray-700"
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
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Konfirmasi Password
                </label>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setConfirmPassword(e.target.value)
                  }
                  placeholder="••••••••"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0041A3] focus:border-[#0041A3] pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={toggleConfirmPasswordVisibility}
                  className="absolute right-3 top-8 text-gray-500 hover:text-gray-700"
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
                <label className="flex items-center gap-2 text-gray-600">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 text-[#0041A3] focus:ring-[#0041A3] border-gray-300 rounded"
                  />
                  Ingat saya
                </label>
                <button
                  type="button"
                  onClick={() => router.push('/forgot-password')}
                  className="text-[#0041A3] hover:text-blue-800 transition-colors"
                >
                  Lupa password?
                </button>
              </div>
            )}

            {/* Tombol utama */}
            <button
              type="submit"
              disabled={status === "loading"}
              className={`w-full py-3 rounded-lg font-medium text-white transition-colors flex items-center justify-center gap-2 ${status === "loading"
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-[#0041A3] hover:bg-blue-800'
                }`}
            >
              {status === "loading" ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Memproses...</span>
                </>
              ) : (
                <span>{isLogin ? 'Masuk' : 'Daftar'}</span>
              )}
            </button>
          </form>

          {/* Toggle Link */}
          <div className="text-center mt-6">
            <p className="text-gray-600 text-sm">
              {isLogin ? "Belum punya akun?" : "Sudah punya akun?"}{" "}
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="font-semibold text-[#0041A3] hover:text-blue-800 transition-colors"
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