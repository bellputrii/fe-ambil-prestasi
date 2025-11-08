'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import LayoutNavbar from '@/components/public/LayoutNavbar'
import { BookOpen, Users, FileText, Plus, Play, Filter, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react'
import Footer from '@/components/public/Footer'

interface Class {
  id: number;
  name: string;
  description: string;
  image_path: string;
  image_path_relative?: string;
  categoryId: number;
  studentCount?: number;
  materialCount?: number;
  createdAt?: string;
}

interface Category {
  id: number;
  name: string;
}

// Helper function to get valid image URL
const getValidImageUrl = (path: string | null | undefined): string => {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  if (!path.startsWith('/')) {
    return `/${path}`;
  }
  return path;
};

const isValidImage = (path: string | null | undefined): boolean => {
  if (!path) return false;
  const validUrl = getValidImageUrl(path);
  return validUrl.length > 0;
};

export default function TeacherDashboard() {
  const router = useRouter()
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isVisible, setIsVisible] = useState(false)
  const [classes, setClasses] = useState<Class[]>([])
  const [filteredClasses, setFilteredClasses] = useState<Class[]>([])
  const [categories] = useState<Category[]>([
    { id: 1, name: 'Essay' },
    { id: 2, name: 'Bussiness Plan' },
    { id: 3, name: 'Penelitian' },
    { id: 4, name: 'Desain' }
  ])
  const [activeFilter, setActiveFilter] = useState<number | 'all'>('all')
  const [loading, setLoading] = useState(false)

  const API_BASE_URL = 'http://localhost:3001/api/v1'

  // Get auth token from localStorage
  const getAuthToken = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token') || ''
    }
    return ''
  }

  // Fetch classes from API
  const fetchClasses = async () => {
    setLoading(true)
    try {
      const token = getAuthToken()
      if (!token) {
        console.warn('No auth token found')
        return
      }

      const response = await fetch(`${API_BASE_URL}/classes?page=1&limit=10`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (!response.ok) throw new Error('Failed to fetch classes')
      
      const result = await response.json()
      if (result.success) {
        // Transform API data to match our interface
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const transformedClasses = result.data.map((cls: any) => ({
          ...cls,
          title: cls.name,
          studentCount: Math.floor(Math.random() * 30) + 10,
          materialCount: Math.floor(Math.random() * 15) + 5,
          createdAt: new Date().toISOString()
        }))
        setClasses(transformedClasses)
      }
    } catch (error) {
      console.error('Error fetching classes:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    setIsVisible(true)
    fetchClasses()
  }, [])

  // Filter classes when activeFilter or classes change
  useEffect(() => {
    if (activeFilter === 'all') {
      setFilteredClasses(classes)
    } else {
      setFilteredClasses(classes.filter(classItem => classItem.categoryId === activeFilter))
    }
  }, [activeFilter, classes])

  const heroSlides = [
    {
      title: "Kelola Kelas dengan Mudah",
      subtitle: "Buat, edit, dan atur kelas pembelajaran Anda dalam satu platform",
      icon: <BookOpen className="w-8 h-8 md:w-10 md:h-10" />,
      bgColor: "bg-blue-600"
    },
    {
      title: "Pantau Perkembangan Siswa",
      subtitle: "Lihat statistik dan perkembangan belajar siswa secara real-time",
      icon: <Users className="w-8 h-8 md:w-10 md:h-10" />,
      bgColor: "bg-blue-600"
    },
    {
      title: "Konten Pembelajaran Interaktif",
      subtitle: "Buat materi yang menarik dan mudah dipahami oleh siswa",
      icon: <FileText className="w-8 h-8 md:w-10 md:h-10" />,
      bgColor: "bg-blue-600"
    }
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [heroSlides.length])

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length)
  }

  const stats = [
    { 
      value: classes.length.toString(), 
      label: 'Total Kelas', 
      icon: <BookOpen className="w-6 h-6" />,
      color: 'bg-blue-500'
    },
    { 
      value: classes.reduce((acc, c) => acc + (c.studentCount || 0), 0).toString(), 
      label: 'Total Siswa', 
      icon: <Users className="w-6 h-6" />,
      color: 'bg-green-500'
    },
    { 
      value: classes.reduce((acc, c) => acc + (c.materialCount || 0), 0).toString(), 
      label: 'Total Materi', 
      icon: <FileText className="w-6 h-6" />,
      color: 'bg-purple-500'
    },
  ]

  return (
    <>
      <LayoutNavbar>
        <div className={`flex flex-col gap-8 md:gap-12 px-4 sm:px-6 lg:px-8 pt-16 md:pt-20 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          
          {/* Hero Section dengan Carousel */}
          <section className="w-full max-w-7xl mx-auto">
            <div className="text-center mb-8 md:mb-12">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                Dashboard Teacher
              </h1>
              <p className="text-gray-700 max-w-2xl mx-auto text-lg sm:text-xl">
                Kelola semua kelas dan materi pembelajaran Anda dalam satu platform
              </p>
            </div>

            <div className="relative h-48 sm:h-56 md:h-64 w-full rounded-2xl overflow-hidden group">
              {heroSlides.map((slide, index) => (
                <div
                  key={index}
                  className={`absolute inset-0 transition-transform duration-500 ease-in-out ${
                    slide.bgColor
                  } rounded-2xl flex items-center justify-center text-white p-8 ${
                    index === currentSlide
                      ? 'translate-x-0'
                      : index < currentSlide
                      ? '-translate-x-full'
                      : 'translate-x-full'
                  }`}
                >
                  <div className="flex flex-col md:flex-row items-center gap-6 md:gap-8 max-w-4xl w-full">
                    <div className="bg-blue-700 p-4 rounded-2xl transition-all duration-300 group-hover:scale-110">
                      {slide.icon}
                    </div>
                    <div className="text-center md:text-left">
                      <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 transition-all duration-300 group-hover:scale-105">
                        {slide.title}
                      </h2>
                      <p className="text-lg sm:text-xl opacity-90 transition-all duration-300 group-hover:scale-105">{slide.subtitle}</p>
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Carousel Controls */}
              <button
                onClick={prevSlide}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-blue-800 text-white p-2 rounded-full transition-all duration-200 hover:scale-110 hover:bg-blue-900"
              >
                <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
              <button
                onClick={nextSlide}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-blue-800 text-white p-2 rounded-full transition-all duration-200 hover:scale-110 hover:bg-blue-900"
              >
                <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>

              {/* Carousel Indicators */}
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                {heroSlides.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className={`w-3 h-3 rounded-full transition-all duration-300 hover:scale-125 ${
                      index === currentSlide
                        ? 'bg-white w-6'
                        : 'bg-blue-300'
                    }`}
                  />
                ))}
              </div>
            </div>
          </section>

          {/* Stats Section */}
          <section className="w-full max-w-7xl mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
              {stats.map((stat, index) => (
                <div
                  key={index}
                  className="bg-white rounded-xl p-6 shadow-md border border-gray-200 transition-all duration-300 hover:shadow-lg hover:border-blue-300 cursor-pointer group"
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-xl text-white ${stat.color} transition-all duration-300 group-hover:scale-110`}>
                      {stat.icon}
                    </div>
                    <div>
                      <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 transition-all duration-300 group-hover:text-blue-700">{stat.value}</h3>
                      <p className="text-gray-700 font-medium">{stat.label}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Kelas Saya Section */}
          <section className="w-full max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                  Kelas Saya
                </h2>
                <p className="text-gray-700 text-base sm:text-lg">
                  Kelola semua kelas dan materi pembelajaran Anda
                </p>
              </div>
              <button 
                onClick={() => router.push('/classes')}
                className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 hover:scale-105 hover:shadow-lg active:scale-95 flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                <span>Buat Kelas</span>
              </button>
            </div>

            {/* Filter Section */}
            <div className="mb-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-2">
                  <Filter className="w-5 h-5 text-gray-600" />
                  <span className="text-base font-medium text-gray-700">Filter by Kategori:</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setActiveFilter('all')}
                    className={`px-4 py-2 rounded-lg text-base font-medium transition-all duration-300 hover:scale-105 ${
                      activeFilter === 'all' 
                        ? 'bg-blue-600 text-white shadow-md' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Semua Kelas
                  </button>
                  {categories.map(category => (
                    <button
                      key={category.id}
                      onClick={() => setActiveFilter(category.id)}
                      className={`px-4 py-2 rounded-lg text-base font-medium transition-all duration-300 hover:scale-105 ${
                        activeFilter === category.id 
                          ? 'bg-blue-600 text-white shadow-md' 
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                    >
                      {category.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Filter Info */}
              <div className="mt-3 flex items-center gap-2 text-base text-gray-600">
                <span>Menampilkan:</span>
                <span className="font-medium">
                  {activeFilter === 'all' 
                    ? `Semua Kelas (${filteredClasses.length})` 
                    : `${categories.find(cat => cat.id === activeFilter)?.name} (${filteredClasses.length})`
                  }
                </span>
              </div>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-600 mt-4 text-lg">Memuat data kelas...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredClasses.slice(0, 6).map((classItem) => (
                  <div 
                    key={classItem.id}
                    className="bg-white rounded-xl overflow-hidden shadow-md border border-gray-200 transition-all duration-300 hover:shadow-xl hover:border-blue-300 group"
                  >
                    <div className="relative h-40 w-full overflow-hidden">
                      {isValidImage(classItem.image_path) ? (
                        <Image
                          src={getValidImageUrl(classItem.image_path)}
                          alt={classItem.name}
                          fill
                          className="object-cover transition-all duration-500 group-hover:scale-110"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement
                            target.style.display = 'none'
                          }}
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
                          <BookOpen className="w-12 h-12 text-white opacity-80" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-blue-600 opacity-0 group-hover:opacity-10 transition-all duration-300"></div>
                      
                      {/* Status Badge */}
                      <div className="absolute top-3 left-3">
                        <span className="bg-green-500 text-white text-sm px-3 py-1 rounded-full font-medium">
                          Aktif
                        </span>
                      </div>

                      {/* Category Badge */}
                      <div className="absolute top-3 right-3">
                        <span className="bg-blue-500 text-white text-sm px-3 py-1 rounded-full font-medium">
                          {categories.find(cat => cat.id === classItem.categoryId)?.name || 'Unknown'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="font-bold text-xl text-gray-900 group-hover:text-blue-700 transition-colors flex-1">
                          {classItem.name}
                        </h3>
                      </div>
                      
                      <p className="text-gray-600 text-base mb-4 line-clamp-2">
                        {classItem.description}
                      </p>
                      
                      {/* Class Stats */}
                      <div className="flex justify-between items-center text-base text-gray-600 mb-4">
                        <div className="flex items-center gap-1">
                          <Users className="w-5 h-5 text-blue-500" />
                          <span className="font-medium">{classItem.studentCount || 0}</span>
                          <span className="text-gray-500">Siswa</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <FileText className="w-5 h-5 text-green-500" />
                          <span className="font-medium">{classItem.materialCount || 0}</span>
                          <span className="text-gray-500">Materi</span>
                        </div>
                      </div>

                      {/* Action Button */}
                      <button 
                        onClick={() => router.push(`/classes/${classItem.id}`)}
                        className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold transition-all duration-300 hover:bg-blue-700 hover:scale-105 active:scale-95 flex items-center justify-center gap-2 group"
                      >
                        <Play className="w-5 h-5 transition-transform group-hover:scale-110" />
                        Kelola Kelas
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {filteredClasses.length === 0 && !loading && (
              <div className="text-center py-12">
                <BookOpen className="w-20 h-20 text-gray-300 mx-auto mb-4" />
                <h3 className="text-2xl font-medium text-gray-900 mb-2">
                  {activeFilter === 'all' ? 'Belum ada kelas' : `Tidak ada kelas dalam kategori ${categories.find(cat => cat.id === activeFilter)?.name}`}
                </h3>
                <p className="text-gray-500 mb-6 text-lg">
                  {activeFilter === 'all' 
                    ? 'Mulai dengan membuat kelas pertama Anda' 
                    : `Buat kelas baru dalam kategori ${categories.find(cat => cat.id === activeFilter)?.name}`
                  }
                </p>
                <button 
                  onClick={() => router.push('/classes')}
                  className="bg-green-600 text-white px-8 py-4 rounded-lg font-semibold transition-all duration-300 hover:scale-105 hover:shadow-lg active:scale-95 flex items-center gap-2 mx-auto text-lg"
                >
                  <Plus className="w-6 h-6" />
                  {activeFilter === 'all' ? 'Buat Kelas Pertama' : `Buat Kelas ${categories.find(cat => cat.id === activeFilter)?.name}`}
                </button>
              </div>
            )}

            {/* View All Button */}
            {filteredClasses.length > 6 && (
              <div className="text-center mt-8">
                <button 
                  onClick={() => router.push('/classes')}
                  className="bg-gray-100 text-gray-700 px-8 py-3 rounded-lg font-semibold transition-all duration-300 hover:bg-blue-600 hover:text-white hover:scale-105 active:scale-95 flex items-center gap-2 mx-auto"
                >
                  <span>Lihat Semua Kelas</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </section>
        </div>
      </LayoutNavbar>
      <Footer/>
    </>
  )
}