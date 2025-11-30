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
  Linkedin,
  Home,
  ClipboardList,
  LayoutDashboard,
  Settings,
  Star,
  Ticket,
  HelpCircle,
  Shield,
  FileText,
  MessageCircle
} from 'lucide-react'

interface FooterProps {
  role?: 'student' | 'teacher' | 'admin'
  hasSubscription?: boolean
}

export default function Footer({ role = 'student', hasSubscription = false }: FooterProps) {
  const currentYear = new Date().getFullYear()

  // Links untuk Student berdasarkan subscription status
  const getStudentQuickLinks = () => {
    if (hasSubscription) {
      return [
        { name: 'Home', href: '/home-student', icon: <Home className="w-4 h-4" /> },
        { name: 'My Courses', href: '/mycourse', icon: <ClipboardList className="w-4 h-4" /> },
      ]
    } else {
      return [
        { name: 'Dashboard', href: '/home', icon: <Home className="w-4 h-4" /> },
        { name: 'E-Learning', href: '/elearning', icon: <BookOpen className="w-4 h-4" /> },
        { name: 'E-Mentoring', href: '/ementoring', icon: <GraduationCap className="w-4 h-4" /> },
      ]
    }
  }

  // Links untuk Teacher
  const teacherQuickLinks = [
    { name: 'Dashboard', href: '/beranda', icon: <Home className="w-4 h-4" /> },
    { name: 'Kelola Kelas', href: '/classes', icon: <LayoutDashboard className="w-4 h-4" /> },
  ]

  // Links untuk Admin
  const adminQuickLinks = [
    { name: 'Dashboard', href: '/dashboard', icon: <Home className="w-4 h-4" /> },
    { name: 'Teacher', href: '/teacher', icon: <Users className="w-4 h-4" /> },
    { name: 'Categories', href: '/categories', icon: <Settings className="w-4 h-4" /> },
    { name: 'Review', href: '/admin-review', icon: <Star className="w-4 h-4" /> },
    { name: 'Redeem', href: '/redeem', icon: <Ticket className="w-4 h-4" /> },
  ]

  // Support links dengan redirect berdasarkan role
  const getSupportLinks = () => {
    const baseHref = role === 'teacher' ? '/beranda' : 
                    role === 'admin' ? '/dashboard' : 
                    hasSubscription ? '/home-student' : '/home'

    return [
      { name: 'Bantuan & FAQ', href: baseHref, icon: <HelpCircle className="w-4 h-4" /> },
      { name: 'Kebijakan Privasi', href: baseHref, icon: <Shield className="w-4 h-4" /> },
      { name: 'Syarat & Ketentuan', href: baseHref, icon: <FileText className="w-4 h-4" /> },
      { name: 'Kontak Kami', href: baseHref, icon: <MessageCircle className="w-4 h-4" /> },
    ]
  }

  const socialLinks = [
    { 
      name: 'Instagram', 
      href: 'https://instagram.com/ambilprestasi', 
      icon: <Instagram className="w-4 h-4" /> 
    },
    { 
      name: 'TikTok', 
      href: 'https://tiktok.com/@ambil.prestasi', 
      icon: <Music className="w-4 h-4" /> 
    },
    { 
      name: 'LinkedIn', 
      href: 'https://www.linkedin.com/company/ambil-prestasi/', 
      icon: <Linkedin className="w-4 h-4" /> 
    },
  ]

  // Tentukan quick links berdasarkan role
  const getQuickLinks = () => {
    switch (role) {
      case 'teacher':
        return teacherQuickLinks
      case 'admin':
        return adminQuickLinks
      case 'student':
      default:
        return getStudentQuickLinks()
    }
  }

  // Tentukan menu title berdasarkan role dan subscription
  const getMenuTitle = () => {
    switch (role) {
      case 'teacher':
        return 'Menu Teacher'
      case 'admin':
        return 'Menu Admin'
      case 'student':
        return hasSubscription ? 'Menu Student Premium' : 'Menu Student'
      default:
        return 'Menu Utama'
    }
  }

  const quickLinks = getQuickLinks()
  const supportLinks = getSupportLinks()
  const menuTitle = getMenuTitle()

  // Tentukan deskripsi berdasarkan role
  const getDescription = () => {
    switch (role) {
      case 'teacher':
        return 'Platform mengajar online terpadu untuk membantu educator membuat dan mengelola kelas dengan efektif.'
      case 'admin':
        return 'Platform administrasi terpadu untuk mengelola sistem pembelajaran dan konten edukasi secara menyeluruh.'
      case 'student':
        return hasSubscription 
          ? 'Platform belajar premium untuk membantu mahasiswa meraih prestasi terbaik dengan akses penuh ke semua fitur.'
          : 'Platform belajar online terpadu untuk membantu mahasiswa meraih prestasi terbaik mereka melalui e-learning, mentoring, dan komunitas inspiratif.'
      default:
        return 'Platform belajar online terpadu untuk membantu mahasiswa meraih prestasi terbaik mereka melalui e-learning, mentoring, dan komunitas inspiratif.'
    }
  }

  return (
    <footer className="bg-blue-800 text-white">
      {/* Main Footer Content */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          
          {/* Brand Section */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-white w-10 h-10 rounded-lg flex items-center justify-center">
                <span className="text-blue-800 font-bold text-sm">AP</span>
              </div>
              <div>
                <h3 className="text-xl font-bold">Ambil Prestasi</h3>
                {role && (
                  <span className="text-xs text-blue-200 mt-1 block">
                    {role === 'teacher' && '(Teacher)'}
                    {role === 'admin' && '(Admin)'}
                    {role === 'student' && hasSubscription && '(Student Premium)'}
                    {role === 'student' && !hasSubscription && '(Student)'}
                  </span>
                )}
              </div>
            </div>
            <p className="text-blue-100 leading-relaxed mb-4 text-sm">
              {getDescription()}
            </p>
            <div className="flex gap-3">
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-blue-700 hover:bg-blue-600 p-2 rounded-lg transition-colors duration-200"
                  aria-label={social.name}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-white">{menuTitle}</h4>
            <ul className="space-y-3">
              {quickLinks.map((link, index) => (
                <li key={index}>
                  <Link
                    href={link.href}
                    className="flex items-center gap-3 text-blue-100 hover:text-white transition-colors duration-200 group py-1"
                  >
                    <span className="bg-blue-700 group-hover:bg-blue-600 p-1 rounded transition-colors flex-shrink-0">
                      {link.icon}
                    </span>
                    <span className="text-sm group-hover:translate-x-1 transition-transform">
                      {link.name}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-white">Dukungan</h4>
            <ul className="space-y-3">
              {supportLinks.map((link, index) => (
                <li key={index}>
                  <Link
                    href={link.href}
                    className="flex items-center gap-3 text-blue-100 hover:text-white transition-colors duration-200 group py-1"
                  >
                    <span className="bg-blue-700 group-hover:bg-blue-600 p-1 rounded transition-colors flex-shrink-0">
                      {link.icon}
                    </span>
                    <span className="text-sm group-hover:translate-x-1 transition-transform">
                      {link.name}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-white">Kontak</h4>
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-blue-100">
                <Mail className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm">ambilprestasi1@gmail.com</span>
              </div>
              <div className="flex items-center gap-3 text-blue-100">
                <Phone className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm">+62 274 123 456</span>
              </div>
              <div className="flex items-start gap-3 text-blue-100">
                <MapPin className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span className="text-sm">
                  Tembalang, Kota Semarang<br />
                  Jawa Tengah<br />
                  Indonesia
                </span>
              </div>
            </div>

            {/* Newsletter Subscription */}
            <div className="mt-6">
              <h5 className="font-semibold mb-3 text-white text-sm">
                {role === 'teacher' || role === 'admin' ? 'Update Terbaru' : 'Berlangganan Newsletter'}
              </h5>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="email"
                  placeholder="Email Anda"
                  className="flex-1 px-3 py-2 rounded-lg bg-blue-700 border border-blue-600 text-white placeholder-blue-300 focus:outline-none focus:border-blue-400 text-sm"
                />
                <button className="bg-white text-blue-700 px-4 py-2 rounded-lg font-semibold hover:bg-blue-50 transition-colors text-sm whitespace-nowrap">
                  Subscribe
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-blue-700">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-blue-200 text-sm text-center md:text-left">
              © {currentYear} Ambil Prestasi. All rights reserved.
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}