"use client";

import { useState, useEffect } from "react";
import { Menu, X, Home, BookOpen, Users, GraduationCap, ClipboardList, LogIn, UserPlus, User, LogOut, LayoutDashboard } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

export default function NavBar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  // Cek apakah sedang di halaman teacher
  const isTeacherPage = pathname.includes('/beranda') || pathname.includes('/classes');

  // Effect untuk mendeteksi scroll
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Effect untuk mengecek status login
  useEffect(() => {
    checkAuthStatus();
  }, []);

  // Fungsi untuk mengecek status autentikasi
  const checkAuthStatus = () => {
    const token = localStorage.getItem("token");
    if (token) {
      setIsLoggedIn(true);
    } else {
      setIsLoggedIn(false);
    }
  };

  // Fungsi logout
  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      localStorage.removeItem("token");
      localStorage.removeItem("rememberMe");
      setIsLoggedIn(false);
      setUserData(null);
      setShowLogoutConfirm(false);
      
      // Redirect berdasarkan halaman saat ini
      if (isTeacherPage) {
        router.push("/beranda");
      } else {
        router.push("/home");
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  // Fungsi untuk menampilkan modal konfirmasi logout
  const showLogoutConfirmation = () => {
    setShowLogoutConfirm(true);
  };

  // Fungsi untuk menutup modal konfirmasi
  const closeLogoutConfirmation = () => {
    setShowLogoutConfirm(false);
  };

  // Menu items untuk public/student
  const publicMenuItems = [
    { name: "Home", icon: <Home size={18} />, href: "/home" },
    { name: "E-Learning", icon: <BookOpen size={18} />, href: "/elearning" },
    { name: "Kisah Inspiratif", icon: <Users size={18} />, href: "/kisah-inspiratif" },
    { name: "E-Mentoring", icon: <GraduationCap size={18} />, href: "/ementoring" },
    { name: "Course Saya", icon: <ClipboardList size={18} />, href: "/mycourse" },
  ];

  // Menu items untuk teacher
  const teacherMenuItems = [
    { name: "Beranda", icon: <Home size={18} />, href: "/beranda" },
    { name: "Kelola Kelas", icon: <LayoutDashboard size={18} />, href: "/classes" },
  ];

  // Pilih menu berdasarkan halaman
  const menuItems = isTeacherPage ? teacherMenuItems : publicMenuItems;

  // Fungsi untuk mengecek apakah link aktif
  const isActiveLink = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }
    return pathname === href || pathname.startsWith(href);
  };

  // Tentukan URL logo berdasarkan halaman
  const getLogoHref = () => {
    if (isTeacherPage) {
      return "/beranda";
    }
    return "/home";
  };

  return (
    <>
      <nav 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled 
            ? "bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-100 py-2" 
            : "bg-white shadow-sm border-b border-gray-200 py-3"
        } ${isTeacherPage ? 'bg-blue-50 border-blue-200' : ''}`}
      >
        <div className="mx-auto flex items-center justify-between px-4 sm:px-6 lg:px-8 max-w-7xl">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className={`transition-all duration-300 ${
              isScrolled ? "w-8 h-8" : "w-10 h-10"
            } relative flex items-center justify-center`}>
              <Image
                src="/logo-ambil-prestasi.png"
                alt="Ambil Prestasi"
                width={isScrolled ? 32 : 40}
                height={isScrolled ? 32 : 40}
                className="object-contain"
              />
            </div>
            <Link 
              href={getLogoHref()}
              className={`font-bold transition-all duration-300 ${
                isScrolled ? "text-xl" : "text-xl"
              } ${isTeacherPage ? "text-blue-800" : "text-blue-800"}`}
            >
              Ambil Prestasi
              {isTeacherPage && (
                <span className="text-sm font-normal text-blue-600 ml-2"></span>
              )}
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-1">
            {menuItems.map((item, index) => (
              <Link
                key={index}
                href={item.href}
                className={`flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-xl transition-all duration-200 ${
                  isActiveLink(item.href)
                    ? isTeacherPage 
                      ? "bg-blue-600 text-white shadow-md transform scale-105"
                      : "bg-blue-600 text-white shadow-md transform scale-105"
                    : isTeacherPage
                    ? "text-blue-700 hover:text-blue-800 hover:bg-blue-100"
                    : "text-gray-700 hover:text-blue-700 hover:bg-blue-50"
                } ${isScrolled ? "py-2" : "py-2.5"}`}
              >
                <span className={`transition-transform duration-200 ${
                  isActiveLink(item.href) ? "scale-110" : ""
                }`}>
                  {item.icon}
                </span>
                <span>{item.name}</span>
              </Link>
            ))}
          </div>

          {/* Auth Buttons & Profile Section */}
          <div className="flex items-center gap-3">
            {isLoggedIn ? (
              // Tampilan ketika user sudah login
              <div className="flex items-center gap-3">
                {/* Profile Picture & Dropdown */}
                <div className="relative group">
                  <button className="flex items-center gap-2 p-1 rounded-full hover:bg-gray-100 transition-colors">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-medium ${
                      isTeacherPage ? "bg-blue-700" : "bg-blue-600"
                    }`}>
                      <User size={16} />
                    </div>
                    {isTeacherPage && (
                      <span className="text-sm font-medium text-blue-800 hidden sm:inline">
                        Teacher
                      </span>
                    )}
                  </button>
                  
                  {/* Dropdown Menu */}
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">
                        {isTeacherPage ? "Teacher Profile" : "User Profile"}
                      </p>
                      <p className="text-xs text-gray-500">
                        {isTeacherPage ? "teacher@example.com" : "user@example.com"}
                      </p>
                    </div>
                    
                    <button
                      onClick={showLogoutConfirmation}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut size={16} />
                      <span>Logout</span>
                    </button>
                  </div>
                </div>

                {/* Tombol Logout (Desktop) */}
                <button
                  onClick={showLogoutConfirmation}
                  className="hidden md:flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200"
                >
                  <LogOut size={16} />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              // Tampilan ketika user belum login
              <div className="hidden md:flex items-center gap-2">
                {!isTeacherPage && (
                  <Link
                    href="/auth/login"
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-700 hover:text-blue-800 hover:bg-blue-50 rounded-xl transition-all duration-200"
                  >
                    <LogIn size={16} />
                    <span>Login</span>
                  </Link>
                )}
                <Link
                  href={isTeacherPage ? "/auth/login?role=teacher" : "/auth/login?tab=register"}
                  className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl shadow-md transition-all duration-200 ${
                    isTeacherPage
                      ? "bg-blue-700 text-white hover:bg-blue-800"
                      : "bg-blue-600 text-white hover:bg-blue-700"
                  }`}
                >
                  <UserPlus size={16} />
                  <span>{isTeacherPage ? "Teacher Login" : "Daftar"}</span>
                </Link>
              </div>
            )}

            {/* Mobile menu toggle */}
            <button
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className={`md:hidden absolute top-full left-0 right-0 backdrop-blur-md border-t shadow-lg ${
            isTeacherPage 
              ? "bg-blue-50/95 border-blue-200" 
              : "bg-white/95 border-gray-200"
          }`}>
            <div className="px-4 py-3 space-y-1">
              {menuItems.map((item, index) => (
                <Link
                  key={index}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3 py-3 px-4 rounded-xl transition-all ${
                    isActiveLink(item.href)
                      ? isTeacherPage
                        ? "bg-blue-600 text-white shadow-inner"
                        : "bg-blue-600 text-white shadow-inner"
                      : isTeacherPage
                      ? "text-blue-700 hover:bg-blue-100 hover:text-blue-800"
                      : "text-gray-700 hover:bg-blue-50 hover:text-blue-700"
                  }`}
                >
                  <span className={`transition-transform ${
                    isActiveLink(item.href) ? "scale-110" : ""
                  }`}>
                    {item.icon}
                  </span>
                  <span className="font-medium">{item.name}</span>
                  {isActiveLink(item.href) && (
                    <div className="ml-auto w-2 h-2 bg-white rounded-full"></div>
                  )}
                </Link>
              ))}
              
              {/* Auth Buttons di Mobile */}
              <div className={`border-t pt-3 mt-3 space-y-2 ${
                isTeacherPage ? "border-blue-200" : "border-gray-200"
              }`}>
                {isLoggedIn ? (
                  // Mobile menu ketika login
                  <>
                    <div className={`flex items-center gap-3 py-3 px-4 rounded-xl border ${
                      isTeacherPage 
                        ? "bg-blue-100 border-blue-200" 
                        : "bg-blue-50 border-blue-200"
                    }`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white ${
                        isTeacherPage ? "bg-blue-700" : "bg-blue-600"
                      }`}>
                        <User size={16} />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {isTeacherPage ? "Teacher Profile" : "User Profile"}
                        </p>
                        <p className="text-xs text-gray-500">
                          {isTeacherPage ? "teacher@example.com" : "user@example.com"}
                        </p>
                      </div>
                    </div>
                    
                    {/* Switch Role Button */}
                    {isTeacherPage ? (
                      <Link
                        href="/home"
                        onClick={() => setIsOpen(false)}
                        className="flex items-center gap-3 py-3 px-4 rounded-xl text-gray-700 hover:bg-gray-50 transition-all w-full text-left"
                      >
                        <User size={18} />
                        <span className="font-medium">Switch to Student</span>
                      </Link>
                    ) : (
                      <Link
                        href="/beranda"
                        onClick={() => setIsOpen(false)}
                        className="flex items-center gap-3 py-3 px-4 rounded-xl text-gray-700 hover:bg-gray-50 transition-all w-full text-left"
                      >
                        <LayoutDashboard size={18} />
                        <span className="font-medium">Switch to Teacher</span>
                      </Link>
                    )}
                    
                    <button
                      onClick={() => {
                        setIsOpen(false);
                        showLogoutConfirmation();
                      }}
                      className="flex items-center gap-3 py-3 px-4 rounded-xl text-red-600 hover:bg-red-50 transition-all w-full text-left"
                    >
                      <LogOut size={18} />
                      <span className="font-medium">Logout</span>
                    </button>
                  </>
                ) : (
                  // Mobile menu ketika belum login
                  <>
                    {!isTeacherPage && (
                      <Link
                        href="/auth/login"
                        onClick={() => setIsOpen(false)}
                        className="flex items-center gap-3 py-3 px-4 rounded-xl text-blue-700 hover:bg-blue-50 transition-all"
                      >
                        <LogIn size={18} />
                        <span className="font-medium">Login</span>
                      </Link>
                    )}
                    <Link
                      href={isTeacherPage ? "/auth/login?role=teacher" : "/auth/login?tab=register"}
                      onClick={() => setIsOpen(false)}
                      className={`flex items-center gap-3 py-3 px-4 rounded-xl text-white hover:bg-blue-700 transition-all ${
                        isTeacherPage ? "bg-blue-700" : "bg-blue-600"
                      }`}
                    >
                      <UserPlus size={18} />
                      <span className="font-medium">
                        {isTeacherPage ? "Teacher Login" : "Daftar"}
                      </span>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl p-6 mx-4 max-w-sm w-full transform transition-all duration-200 scale-100">
            <div className="text-center">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <LogOut className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Konfirmasi Logout
              </h3>
              <p className="text-gray-600 text-sm mb-6">
                Apakah Anda yakin ingin logout dari akun Anda?
              </p>
              <div className="flex gap-3">
                <button
                  onClick={closeLogoutConfirmation}
                  className="flex-1 py-2.5 px-4 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                  disabled={isLoggingOut}
                >
                  Batal
                </button>
                <button
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="flex-1 py-2.5 px-4 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50 font-medium flex items-center justify-center gap-2"
                >
                  {isLoggingOut ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      <span>Loading...</span>
                    </>
                  ) : (
                    'Logout'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}