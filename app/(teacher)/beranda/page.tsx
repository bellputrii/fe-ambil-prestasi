'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import LayoutNavbar from '@/components/public/LayoutNavbar'
import { BookOpen, Users, FileText, Plus, Play, Filter, ArrowRight } from 'lucide-react' 
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

interface ApiResponse {
  success: boolean
  message?: string
  data: Array<{
    id: number
    name: string
    description: string
    image_path: string
    categoryId: number
    image_path_relative: string
  }>
  meta: {
    totalItems: number
    itemsPerPage: number
    totalPages: number
    currentPage: number
  }
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
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fungsi untuk map category
  const mapCategory = (categoryId: number): string => {
    const categoryMap: { [key: number]: string } = {
      1: 'Essay',
      2: 'Business Plan',
      3: 'Penelitian',
      4: 'Desain'
    }
    return categoryMap[categoryId] || 'Kursus'
  }

  // Fetch classes from API dengan struktur yang sesuai
  const fetchClasses = async () => {
    try {
      setLoading(true)
      
      // Ambil token dari localStorage
      const token = localStorage.getItem("token")
      
      if (!token) {
        setError('Token tidak ditemukan. Silakan login kembali.')
        setLoading(false)
        return
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/classes`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
        redirect: "follow" as RequestRedirect
      })

      if (!response.ok) {
        if (response.status === 401) {
          // Token expired atau invalid
          localStorage.removeItem("token")
          setError('Sesi telah berakhir. Silakan login kembali.')
          setTimeout(() => router.push('/login'), 2000)
          return
        }
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const result: ApiResponse = await response.json()
      
      if (result.success && result.data) {
        // Transform data dari API ke format yang diharapkan komponen
        const transformedClasses = result.data.map((classItem) => ({
          id: classItem.id,
          name: classItem.name,
          description: classItem.description,
          image_path: classItem.image_path,
          image_path_relative: classItem.image_path_relative,
          categoryId: classItem.categoryId,
          studentCount: Math.floor(Math.random() * 30) + 10, // Data dummy untuk demo
          materialCount: Math.floor(Math.random() * 15) + 5, // Data dummy untuk demo
          createdAt: new Date().toISOString()
        }))

        setClasses(transformedClasses)
        setError(null)
      } else {
        throw new Error(result.message || 'Gagal memuat data kelas')
      }
    } catch (err) {
      console.error('Error fetching classes:', err)
      setError('Gagal memuat data kelas. Silakan coba lagi.')
      // Fallback ke data statis jika API error
      setClasses(getFallbackClasses())
    } finally {
      setLoading(false)
    }
  }

  // Fallback data jika API error
  const getFallbackClasses = (): Class[] => [
    {
      id: 1,
      name: 'Menulis Esai Akademik yang Menang',
      description: 'Pelajari teknik menulis esai akademik yang efektif untuk kompetisi',
      image_path: '/essay.png',
      categoryId: 1,
      studentCount: 25,
      materialCount: 8,
      createdAt: new Date().toISOString()
    },
    {
      id: 2,
      name: 'Business Plan untuk Kompetisi Startup',
      description: 'Buat business plan yang menarik untuk kompetisi startup',
      image_path: '/business-plan.png',
      categoryId: 2,
      studentCount: 18,
      materialCount: 12,
      createdAt: new Date().toISOString()
    },
    {
      id: 3,
      name: 'Karya Tulis Ilmiah & Publikasi',
      description: 'Teknik menulis karya ilmiah dan strategi publikasi',
      image_path: '/karya-tulis-ilmiah.png',
      categoryId: 3,
      studentCount: 32,
      materialCount: 10,
      createdAt: new Date().toISOString()
    }
  ]

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

  const stats = [
    { 
      value: classes.length.toString(), 
      label: 'Total Kelas', 
      icon: <BookOpen className="w-6 h-6" />,
      color: 'bg-blue-500'
    },
  ]

  return (
    <>
      <LayoutNavbar>
        <div className={`flex flex-col gap-8 md:gap-12 px-4 sm:px-6 lg:px-8 pt-16 md:pt-20 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          
          {/* Header Section */}
          <section className="w-full max-w-7xl mx-auto">
            <div className="text-center mb-4 md:mb-8">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900">
                Dashboard Teacher
              </h1>
              <p className="text-gray-700 max-w-2xl mx-auto mt-3 text-lg sm:text-xl">
                Kelola semua kelas dan materi pembelajaran Anda dalam satu platform
              </p>
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

          {/* Error State */}
          {error && !loading && (
            <section className="w-full max-w-7xl mx-auto">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                <p className="text-yellow-700 font-medium">{error}</p>
                {error.includes('login kembali') && (
                  <button 
                    onClick={() => router.push('/login')}
                    className="mt-3 bg-blue-700 text-white px-4 py-2 rounded-lg hover:bg-blue-800 transition-colors"
                  >
                    Login Kembali
                  </button>
                )}
              </div>
            </section>
          )}

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
                      {isValidImage(classItem.image_path_relative || classItem.image_path) ? (
                        <Image
                          src={getValidImageUrl(classItem.image_path_relative || classItem.image_path)}
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
                          {mapCategory(classItem.categoryId)}
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

            {filteredClasses.length === 0 && !loading && !error && (
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