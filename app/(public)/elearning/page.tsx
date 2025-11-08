'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import LayoutNavbar from '@/components/public/LayoutNavbar'
import { CheckCircle, Play, Users, Clock, BookOpen, Star, ArrowRight, Video, FileText, Award } from 'lucide-react'
import Footer from '@/components/public/Footer'

interface Course {
  id: number
  category: string
  title: string
  image: string
  duration: string
  participants: string
  level: string
  rating: number
  instructor: string
  featured?: boolean
}

interface ApiResponse {
  success: boolean
  data: any // Kita akan debug struktur sebenarnya
  message?: string
}

export default function ELearningPage() {
  const [activeCategory, setActiveCategory] = useState('all')
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const categories = [
    { id: 'all', name: 'Semua Kursus' },
    { id: 'essay', name: 'Essay' },
    { id: 'business', name: 'Business Plan' },
    { id: 'research', name: 'Penelitian' },
    { id: 'design', name: 'Desain' }
  ]

  // Fetch data courses dari API
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true)
        const myHeaders = new Headers()
        myHeaders.append("Authorization", "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiZTQzMjM0NWEtMTllOS00MTZkLThiMjMtZDU5Njg0NWY0NjU0IiwiaWF0IjoxNzYxOTgwNDgwLCJleHAiOjE3NjIwNjY4ODB9.gmY2NmzF6hEXlMmuth8OIlKSl_eku6wOosaCozhp4nQ")

        const requestOptions = {
          method: "GET",
          headers: myHeaders,
          redirect: "follow" as RequestRedirect
        }

        console.log('Fetching courses from API...')
        const response = await fetch("http://localhost:3001/api/v1/classes", requestOptions)
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        const result: ApiResponse = await response.json()
        console.log('API Response:', result) // Debug: lihat struktur response
        
        // Handle berbagai kemungkinan struktur response
        let coursesData = []
        
        if (Array.isArray(result)) {
          // Jika response langsung array
          coursesData = result
        } else if (result && Array.isArray(result.data)) {
          // Jika response memiliki property data yang array
          coursesData = result.data
        } else if (result && result.data && typeof result.data === 'object') {
          // Jika data adalah object, convert ke array
          coursesData = Object.values(result.data)
        } else {
          // Fallback ke data statis
          console.warn('Unexpected API response structure, using fallback data')
          setCourses(getFallbackCourses())
          setError('Struktur data tidak sesuai. Menampilkan data contoh.')
          return
        }

        // Transform data dari API ke format yang diharapkan komponen
        const transformedCourses = coursesData.map((item: any, index: number) => ({
          id: item.id || item.class_id || index + 1,
          category: mapCategory(item.category || item.type || getDefaultCategory(index)),
          title: item.title || item.name || item.class_name || `Kursus ${index + 1}`,
          image: item.image || item.image_url || getDefaultImage(index),
          duration: item.duration || item.total_duration || `${Math.floor(Math.random() * 6) + 3} Jam`,
          participants: item.participants?.toString() || item.enrolled_count?.toString() || (Math.floor(Math.random() * 400) + 100).toString(),
          level: item.level || item.difficulty || ['Pemula', 'Menengah', 'Lanjutan'][index % 3],
          rating: item.rating || item.average_rating || parseFloat((4.5 + Math.random() * 0.5).toFixed(1)),
          instructor: item.instructor || item.teacher_name || item.creator || getDefaultInstructor(index),
          featured: item.featured || index < 2
        }))

        console.log('Transformed courses:', transformedCourses) // Debug
        setCourses(transformedCourses)
        setError(null)
      } catch (err) {
        console.error('Error fetching courses:', err)
        setError('Gagal memuat data kursus. Silakan coba lagi.')
        // Fallback ke data statis jika API error
        setCourses(getFallbackCourses())
      } finally {
        setLoading(false)
      }
    }

    fetchCourses()
  }, [])

  // Helper functions untuk transform data
  const mapCategory = (category: string): string => {
    if (!category) return 'essay'
    
    const categoryMap: { [key: string]: string } = {
      'essay': 'essay',
      'business': 'business',
      'research': 'research',
      'design': 'design',
      'writing': 'essay',
      'business-plan': 'business',
      'startup': 'business',
      'scientific': 'research',
      'penelitian': 'research',
      'desain': 'design'
    }
    return categoryMap[category.toLowerCase()] || 'essay'
  }

  const getDefaultCategory = (index: number): string => {
    const categories = ['essay', 'business', 'research', 'design']
    return categories[index % categories.length]
  }

  const getDefaultImage = (index: number): string => {
    const images = ['/essay.png', '/business-plan.png', '/karya-tulis-ilmiah.png', '/poster.png']
    return images[index % images.length]
  }

  const getDefaultInstructor = (index: number): string => {
    const instructors = [
      'Dr. Sarah Wijaya',
      'Prof. Ahmad Rahman',
      'Dr. Lisa Santoso',
      'Maya Desain',
      'Dr. Budi Prasetyo',
      'Prof. Dian Sastro'
    ]
    return instructors[index % instructors.length]
  }

  // Fallback data jika API error
  const getFallbackCourses = (): Course[] => [
    {
      id: 1,
      category: 'essay',
      title: 'Menulis Esai Akademik yang Menang',
      image: '/essay.png',
      duration: '6 Jam',
      participants: '420',
      level: 'Pemula',
      rating: 4.8,
      instructor: 'Dr. Sarah Wijaya',
      featured: true
    },
    {
      id: 2,
      category: 'business',
      title: 'Business Plan untuk Kompetisi Startup',
      image: '/business-plan.png',
      duration: '8 Jam',
      participants: '310',
      level: 'Menengah',
      rating: 4.9,
      instructor: 'Prof. Ahmad Rahman',
      featured: true
    },
    {
      id: 3,
      category: 'research',
      title: 'Karya Tulis Ilmiah & Publikasi',
      image: '/karya-tulis-ilmiah.png',
      duration: '5 Jam',
      participants: '280',
      level: 'Pemula',
      rating: 4.7,
      instructor: 'Dr. Lisa Santoso'
    },
    {
      id: 4,
      category: 'design',
      title: 'Desain Poster Akademik yang Impactful',
      image: '/poster.png',
      duration: '4 Jam',
      participants: '355',
      level: 'Pemula',
      rating: 4.6,
      instructor: 'Maya Desain'
    }
  ]

  const filteredCourses = activeCategory === 'all' 
    ? courses 
    : courses.filter(course => course.category === activeCategory)

  const stats = [
    { value: '180+', label: 'Video Pembelajaran', icon: <Video className="w-5 h-5 sm:w-7 sm:h-7" /> },
    { value: '90+', label: 'Modul Belajar', icon: <FileText className="w-5 h-5 sm:w-6 sm:h-6" /> },
    { value: `${courses.reduce((acc, course) => acc + parseInt(course.participants), 0)}+`, label: 'Peserta Aktif', icon: <Users className="w-5 h-5 sm:w-6 sm:h-6" /> },
    { value: '300+', label: 'Pemenang Kompetisi', icon: <Award className="w-5 h-5 sm:w-6 sm:h-6" /> },
  ]

  const learningPath = [
    {
      step: '1',
      title: 'Belajar Interaktif',
      desc: 'Pelajari konten-konten berkualitas dan tonton video dari mentor berpengalaman.',
      icon: <BookOpen className="w-6 h-6 sm:w-7 sm:h-7" />
    },
    {
      step: '2',
      title: 'Praktik Langsung',
      desc: 'Implementasikan materi dengan latihan dan studi kasus nyata.',
      icon: <Play className="w-6 h-6 sm:w-7 sm:h-7" />
    },
    {
      step: '3',
      title: 'Raih Prestasi',
      desc: 'Siap berkompetisi dan raih prestasi terbaik dengan bekal yang matang!',
      icon: <Award className="w-6 h-6 sm:w-7 sm:h-7" />
    }
  ]

  return (
    <>
      <LayoutNavbar>
        <div className="flex flex-col gap-12 md:gap-16 lg:gap-20 px-4 sm:px-6 lg:px-8 pt-16 md:pt-20">
          {/* Hero Section */}
          <section className="w-full max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 items-center gap-6 md:gap-8 bg-blue-600 rounded-xl md:rounded-2xl lg:rounded-3xl p-6 md:p-8 lg:p-12 text-white">
              <div className="space-y-4 md:space-y-6 order-2 lg:order-1">
                <div className="flex items-center gap-2 bg-blue-700 rounded-full px-3 py-1 md:px-4 md:py-2 w-fit">
                  <BookOpen className="w-4 h-4" />
                  <span className="text-sm font-medium">E-Learning Platform</span>
                </div>
                
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold leading-tight">
                  Tingkatkan Skill & Raih Prestasi Bersama E-Learning
                </h1>
                
                <p className="text-blue-100 text-base md:text-lg leading-relaxed">
                  Pelajari berbagai materi kuliah, lomba, dan keterampilan kompetitif.  
                  Belajar fleksibel dengan video, modul belajar, serta forum diskusi interaktif.
                </p>

                <div className="space-y-2 md:space-y-3">
                  {[
                    "Belajar fleksibel di mana saja & kapan saja",
                    "Modul dikurasi langsung oleh mentor berpengalaman",
                    "Gratis dan mudah diakses oleh seluruh mahasiswa"
                  ].map((item, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <CheckCircle className="text-green-300 flex-shrink-0" size={18} />
                      <span className="text-blue-100 text-sm md:text-base">{item}</span>
                    </div>
                  ))}
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-2 md:pt-4">
                  <button 
                    onClick={() => document.getElementById('courses-section')?.scrollIntoView({ behavior: 'smooth' })}
                    className="bg-white text-blue-700 px-6 py-3 md:px-8 md:py-4 rounded-lg md:rounded-xl font-semibold transition-all duration-300 hover:scale-105 active:scale-95 shadow-md hover:shadow-lg flex items-center gap-2 justify-center"
                  >
                    Jelajahi Kursus
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <button className="border border-white text-white px-6 py-3 md:px-8 md:py-4 rounded-lg md:rounded-xl font-semibold transition-all duration-300 hover:scale-105 active:scale-95 hover:bg-white hover:text-blue-600">
                    Lihat Preview
                  </button>
                </div>
              </div>

              <div className="flex justify-center lg:justify-end order-1 lg:order-2">
                <div className="relative w-full max-w-sm md:max-w-md">
                  <Image
                    src="/e-learning.png"
                    alt="E-Learning"
                    width={500}
                    height={400}
                    className="rounded-xl md:rounded-2xl object-cover shadow-lg"
                  />
                  <div className="absolute -bottom-3 -left-3 bg-white rounded-xl md:rounded-2xl p-3 md:p-4 shadow-md">
                    <div className="flex items-center gap-2 md:gap-3">
                      <div className="bg-green-100 p-1 md:p-2 rounded-lg">
                        <Award className="w-5 h-5 md:w-6 md:h-6 text-green-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800 text-sm md:text-base">300+</p>
                        <p className="text-xs md:text-sm text-gray-600">Pemenang Lomba</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Statistik Section */}
          <section className="w-full max-w-7xl mx-auto">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {stats.map((stat, index) => (
                <div
                  key={index}
                  className="bg-white rounded-lg md:rounded-xl p-4 md:p-6 shadow-md hover:shadow-lg transition-all duration-300 border border-gray-200 group hover:scale-105 cursor-pointer"
                >
                  <div className="flex items-center gap-3 md:gap-4">
                    <div className="bg-blue-100 p-2 md:p-3 rounded-lg text-blue-600 transition-all duration-300 group-hover:bg-blue-600 group-hover:text-white">
                      {stat.icon}
                    </div>
                    <div>
                      <h3 className="text-lg md:text-xl lg:text-2xl font-bold text-gray-800">{stat.value}</h3>
                      <p className="text-gray-600 text-xs md:text-sm">{stat.label}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Kategori Kursus */}
          <section id="courses-section" className="w-full max-w-7xl mx-auto">
            <div className="text-center mb-6 md:mb-8">
              <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 mb-3 md:mb-4">
                Kategori Kursus
              </h2>
              <p className="text-gray-700 max-w-2xl mx-auto text-sm md:text-base">
                Pilih kategori yang sesuai dengan minat dan kebutuhan belajarmu
              </p>
            </div>

            <div className="flex flex-wrap justify-center gap-2 md:gap-3 mb-8 md:mb-12">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={`px-4 py-2 md:px-6 md:py-3 rounded-lg md:rounded-xl font-medium transition-all duration-200 text-sm md:text-base ${
                    activeCategory === category.id
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>

            {/* Loading State */}
            {loading && (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-gray-600">Memuat kursus...</span>
              </div>
            )}

            {/* Error State */}
            {error && !loading && (
              <div className="text-center py-8">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 max-w-md mx-auto">
                  <p className="text-yellow-700 font-medium">{error}</p>
                </div>
              </div>
            )}

            {/* Kursus Grid */}
            {!loading && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
                {filteredCourses.map((course) => (
                  <div
                    key={course.id}
                    className="bg-white rounded-lg md:rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 border border-gray-200 group hover:scale-105 cursor-pointer"
                  >
                    <div className="relative h-40 sm:h-44 md:h-48 overflow-hidden">
                      <Image
                        src={course.image}
                        alt={course.title}
                        width={400}
                        height={200}
                        className="w-full h-full object-cover transition-all duration-500 group-hover:scale-110"
                      />
                      {course.featured && (
                        <div className="absolute top-2 left-2 bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                          Featured
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                        <button className="bg-white text-blue-600 p-2 md:p-3 rounded-full hover:bg-blue-50 transition-colors">
                          <Play className="w-5 h-5 md:w-6 md:h-6" fill="currentColor" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="p-4 md:p-6 space-y-3 md:space-y-4">
                      <div className="flex justify-between items-start">
                        <span className="text-xs md:text-sm text-blue-700 font-semibold bg-blue-100 px-2 py-1 md:px-3 md:py-1 rounded-full">
                          {course.category.charAt(0).toUpperCase() + course.category.slice(1)}
                        </span>
                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                          course.level === 'Pemula' ? 'bg-green-100 text-green-700' :
                          course.level === 'Menengah' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {course.level}
                        </span>
                      </div>

                      <h3 className="text-base md:text-lg font-bold text-gray-800 leading-tight group-hover:text-blue-700 transition-colors">
                        {course.title}
                      </h3>

                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <span className="font-medium text-xs md:text-sm">{course.instructor}</span>
                      </div>

                      <div className="flex items-center justify-between text-xs md:text-sm text-gray-600">
                        <div className="flex items-center gap-3 md:gap-4">
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3 md:w-4 md:h-4" />
                            <span>{course.duration}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="w-3 h-3 md:w-4 md:h-4" />
                            <span>{course.participants}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 md:w-4 md:h-4 text-yellow-400 fill-current" />
                          <span className="font-semibold">{course.rating}</span>
                        </div>
                      </div>

                      <button className="w-full bg-blue-600 text-white py-2 md:py-3 rounded-lg md:rounded-xl font-semibold transition-all duration-300 hover:bg-blue-700 hover:scale-105 active:scale-95 flex items-center justify-center gap-2 text-sm md:text-base">
                        Mulai Belajar
                        <ArrowRight className="w-3 h-3 md:w-4 md:h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Empty State */}
            {!loading && !error && filteredCourses.length === 0 && (
              <div className="text-center py-12">
                <div className="bg-gray-50 rounded-lg p-8 max-w-md mx-auto">
                  <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">Tidak ada kursus ditemukan</h3>
                  <p className="text-gray-500 text-sm">
                    Tidak ada kursus yang tersedia untuk kategori ini.
                  </p>
                </div>
              </div>
            )}
          </section>

          {/* Alur Pembelajaran */}
          <section className="w-full max-w-7xl mx-auto">
            <div className="bg-blue-50 rounded-xl md:rounded-2xl lg:rounded-3xl p-6 md:p-8 lg:p-12">
              <div className="text-center mb-8 md:mb-12">
                <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 mb-3 md:mb-4">
                  Alur Pembelajaran
                </h2>
                <p className="text-gray-700 max-w-2xl mx-auto text-sm md:text-base">
                  Ikuti langkah-langkah sistematis untuk mencapai kesuksesan dalam kompetisi
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
                {learningPath.map((step, index) => (
                  <div
                    key={index}
                    className="bg-white rounded-lg md:rounded-xl p-4 md:p-6 shadow-md hover:shadow-lg transition-all duration-300 group hover:scale-105 text-center cursor-pointer"
                  >
                    <div className="bg-blue-600 text-white w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center text-base md:text-lg font-bold mb-3 md:mb-4 mx-auto transition-all duration-300 group-hover:scale-110">
                      {step.step}
                    </div>
                    <div className="bg-blue-100 text-blue-600 p-2 md:p-3 rounded-lg w-fit mx-auto mb-3 md:mb-4 transition-all duration-300 group-hover:bg-blue-600 group-hover:text-white">
                      {step.icon}
                    </div>
                    <h3 className="font-bold text-base md:text-lg mb-2 md:mb-3 text-gray-800">{step.title}</h3>
                    <p className="text-gray-600 leading-relaxed text-sm md:text-base">{step.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="w-full max-w-7xl mx-auto">
            <div className="bg-blue-600 rounded-xl md:rounded-2xl lg:rounded-3xl p-6 md:p-8 lg:p-12 text-white text-center">
              <h2 className="text-xl md:text-2xl lg:text-3xl font-bold mb-3 md:mb-4">
                Siap Mengembangkan Potensimu?
              </h2>
              <p className="text-blue-100 mb-6 md:mb-8 max-w-2xl mx-auto text-sm md:text-base lg:text-lg">
                Bergabung dengan ribuan mahasiswa lainnya dan raih prestasi terbaik melalui program E-Learning kami.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center">
                <button className="bg-white text-blue-700 px-6 py-3 md:px-8 md:py-4 rounded-lg md:rounded-xl font-semibold transition-all duration-300 hover:scale-105 active:scale-95 shadow-md hover:shadow-lg flex items-center gap-2 justify-center text-sm md:text-base">
                  <BookOpen className="w-4 h-4 md:w-5 md:h-5" />
                  Mulai Belajar Sekarang
                </button>
                <button className="border border-white text-white px-6 py-3 md:px-8 md:py-4 rounded-lg md:rounded-xl font-semibold transition-all duration-300 hover:scale-105 active:scale-95 hover:bg-white hover:text-blue-600 text-sm md:text-base">
                  Lihat Semua Kursus
                </button>
              </div>
            </div>
          </section>
        </div>
      </LayoutNavbar>
      <Footer/>
    </>
  )
}