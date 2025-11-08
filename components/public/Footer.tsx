'use client'

import Link from 'next/link'
import { 
  BookOpen, 
  Users, 
  GraduationCap, 
  Mail, 
  Phone, 
  MapPin, 
  Instagram,
  Music,
  ArrowRight,
  Home,
  Settings
} from 'lucide-react'

interface FooterProps {
  role?: 'student' | 'teacher'
}

export default function Footer({ role = 'student' }: FooterProps) {
  const currentYear = new Date().getFullYear()

  // Links untuk Student
  const studentQuickLinks = [
    { name: 'E-Learning', href: '/elearning', icon: <BookOpen className="w-4 h-4" /> },
    { name: 'Kisah Inspiratif', href: '/kisah-inspiratif', icon: <Users className="w-4 h-4" /> },
    { name: 'E-Mentoring', href: '/ementoring', icon: <GraduationCap className="w-4 h-4" /> },
    { name: 'Course Saya', href: '/mycourse', icon: <BookOpen className="w-4 h-4" /> },
  ]

  // Links untuk Teacher
  const teacherQuickLinks = [
    { name: 'Home', href: '/teacher', icon: <Home className="w-4 h-4" /> },
    { name: 'Kelola Kelas', href: '/teacher/kelola-kelas', icon: <Settings className="w-4 h-4" /> },
  ]

  const supportLinks = [
    { name: 'Bantuan & FAQ', href: '/help' },
    { name: 'Kebijakan Privasi', href: '/privacy' },
    { name: 'Syarat & Ketentuan', href: '/terms' },
    { name: 'Kontak Kami', href: '/contact' },
  ]

  const socialLinks = [
    { 
      name: 'Instagram', 
      href: 'https://instagram.com/ambilprestasi', 
      icon: <Instagram className="w-4 h-4 sm:w-5 sm:h-5" /> 
    },
    { 
      name: 'TikTok', 
      href: 'https://tiktok.com/@ambil.prestasi', 
      icon: <Music className="w-4 h-4 sm:w-5 sm:h-5" /> 
    },
  ]

  const quickLinks = role === 'teacher' ? teacherQuickLinks : studentQuickLinks
  const menuTitle = role === 'teacher' ? 'Menu Teacher' : 'Menu Utama'

  return (
    <footer className="bg-blue-800 text-white">
      {/* Main Footer Content */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 lg:gap-12">
          
          {/* Brand Section */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3 mb-4 sm:mb-6">
              <div className="bg-white w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center">
                <span className="text-blue-800 font-bold text-xs sm:text-sm">AP</span>
              </div>
              <h3 className="text-lg sm:text-xl font-bold">Ambil Prestasi</h3>
            </div>
            <p className="text-blue-100 leading-relaxed mb-4 sm:mb-6 text-sm sm:text-base">
              {role === 'teacher' 
                ? 'Platform mengajar online terpadu untuk membantu educator membuat dan mengelola kelas dengan efektif.'
                : 'Platform belajar online terpadu untuk membantu mahasiswa meraih prestasi terbaik mereka melalui e-learning, mentoring, dan komunitas inspiratif.'
              }
            </p>
            <div className="flex gap-3 sm:gap-4">
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-blue-700 hover:bg-blue-600 p-2 rounded-lg transition-all duration-200 hover:scale-110"
                  aria-label={social.name}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-base sm:text-lg font-semibold mb-4 sm:mb-6 text-white">{menuTitle}</h4>
            <ul className="space-y-2 sm:space-y-3">
              {quickLinks.map((link, index) => (
                <li key={index}>
                  <Link
                    href={link.href}
                    className="flex items-center gap-2 sm:gap-3 text-blue-100 hover:text-white transition-all duration-200 group py-1"
                  >
                    <span className="bg-blue-700 group-hover:bg-blue-600 p-1 rounded transition-colors flex-shrink-0">
                      {link.icon}
                    </span>
                    <span className="text-sm sm:text-base group-hover:translate-x-1 transition-transform">
                      {link.name}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h4 className="text-base sm:text-lg font-semibold mb-4 sm:mb-6 text-white">Dukungan</h4>
            <ul className="space-y-2 sm:space-y-3">
              {supportLinks.map((link, index) => (
                <li key={index}>
                  <Link
                    href={link.href}
                    className="flex items-center gap-2 sm:gap-3 text-blue-100 hover:text-white transition-all duration-200 group py-1"
                  >
                    <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                    <span className="text-sm sm:text-base group-hover:translate-x-1 transition-transform">
                      {link.name}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-base sm:text-lg font-semibold mb-4 sm:mb-6 text-white">Kontak</h4>
            <div className="space-y-3 sm:space-y-4">
              <div className="flex items-center gap-2 sm:gap-3 text-blue-100">
                <Mail className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                <span className="text-sm sm:text-base">hello@ambilprestasi.ac.id</span>
              </div>
              <div className="flex items-center gap-2 sm:gap-3 text-blue-100">
                <Phone className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                <span className="text-sm sm:text-base">+62 274 123 456</span>
              </div>
              <div className="flex items-start gap-2 sm:gap-3 text-blue-100">
                <MapPin className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 mt-0.5" />
                <span className="text-sm sm:text-base">
                  Jl. Pendidikan No. 45<br />
                  Sleman, Yogyakarta 55281<br />
                  Indonesia
                </span>
              </div>
            </div>

            {/* Newsletter Subscription */}
            <div className="mt-4 sm:mt-6">
              <h5 className="font-semibold mb-2 sm:mb-3 text-white text-sm sm:text-base">
                {role === 'teacher' ? 'Update Terbaru' : 'Berlangganan Newsletter'}
              </h5>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="email"
                  placeholder="Email Anda"
                  className="flex-1 px-3 py-2 rounded-lg bg-blue-700 border border-blue-600 text-white placeholder-blue-300 focus:outline-none focus:border-blue-400 text-sm"
                />
                <button className="bg-white text-blue-700 px-3 py-2 rounded-lg font-semibold hover:bg-blue-50 transition-colors text-sm whitespace-nowrap sm:mt-0">
                  Subscribe
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-blue-700">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-3 sm:gap-4">
            <div className="text-blue-200 text-xs sm:text-sm text-center md:text-left">
              © {currentYear} Ambil Prestasi. All rights reserved.
            </div>
            <div className="flex items-center gap-4 sm:gap-6 text-xs sm:text-sm text-blue-200">
              <Link href="/privacy" className="hover:text-white transition-colors">
                Kebijakan Privasi
              </Link>
              <Link href="/terms" className="hover:text-white transition-colors">
                Syarat & Ketentuan
              </Link>
              <Link href="/sitemap" className="hover:text-white transition-colors">
                Sitemap
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}