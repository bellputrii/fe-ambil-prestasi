'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import LayoutNavbar from '@/components/public/LayoutNavbar'
import Footer from '@/components/public/Footer'
import { 
  ChevronDown,
  ChevronUp,
  CheckCircle,
  Clock,
  BookOpen,
  Users,
  Star,
  ArrowLeft,
  Play,
  FileText,
  Award,
  Calendar,
  Target
} from 'lucide-react'

interface Material {
  id: number
  title: string
  content: string
  materialType: 'video' | 'document' | 'quiz'
  videoUrl?: string
  documentUrl?: string
  order: number
  duration?: string
}

interface Section {
  id: number
  title: string
  description: string | null
  order: number
  materials: Material[]
}

interface ClassDetail {
  id: number
  name: string
  description: string
  image_path: string
  image_path_relative: string
  categoryId: number
  averageRating: number
  totalReviews: number
  sections: Section[]
}

export default function ELearningClassDetailPage() {
  const params = useParams()
  const router = useRouter()
  const classId = params.id as string

  const [classDetail, setClassDetail] = useState<ClassDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedSections, setExpandedSections] = useState<Set<number>>(new Set())

  // Fetch class detail dari API publik
  const fetchClassDetail = async () => {
    try {
      setLoading(true)
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/public/classes/${classId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      
      if (result.success && result.data) {
        setClassDetail(result.data)
        setError(null)
      } else {
        throw new Error(result.message || 'Gagal memuat detail kelas')
      }
    } catch (err) {
      console.error('Error fetching class detail:', err)
      setError('Gagal memuat detail kelas. Silakan coba lagi.')
    } finally {
      setLoading(false)
    }
  }

  // Toggle section
  const toggleSection = (sectionId: number) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev)
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId)
      } else {
        newSet.add(sectionId)
      }
      return newSet
    })
  }

  // Get material icon
  const getMaterialIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <Play className="w-4 h-4" />
      case 'document':
        return <FileText className="w-4 h-4" />
      case 'quiz':
        return <Award className="w-4 h-4" />
      default:
        return <BookOpen className="w-4 h-4" />
    }
  }

  // Get material type label
  const getMaterialTypeLabel = (type: string) => {
    switch (type) {
      case 'video':
        return 'Video'
      case 'document':
        return 'Dokumen'
      case 'quiz':
        return 'Kuis'
      default:
        return 'Materi'
    }
  }

  // Get category name
  const getCategoryName = (categoryId: number): string => {
    const categoryMap: { [key: number]: string } = {
      1: 'Essay',
      2: 'Business Plan',
      3: 'Penelitian',
      4: 'Desain'
    }
    return categoryMap[categoryId] || 'Lainnya'
  }

  // Get course level
  const getCourseLevel = (categoryId: number): string => {
    const levelMap: { [key: number]: string } = {
      1: 'Menengah',
      2: 'Lanjutan',
      3: 'Pemula',
      4: 'Menengah'
    }
    return levelMap[categoryId] || 'Pemula'
  }

  useEffect(() => {
    if (classId) {
      fetchClassDetail()
    }
  }, [classId])

  if (loading) {
    return (
      <LayoutNavbar>
        <div className="min-h-screen bg-white flex justify-center items-center pt-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Memuat detail kelas...</p>
          </div>
        </div>
      </LayoutNavbar>
    )
  }

  if (error) {
    return (
      <LayoutNavbar>
        <div className="min-h-screen bg-white flex justify-center items-center pt-20 px-4">
          <div className="text-center max-w-md">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Award className="w-8 h-8 text-red-600" />
            </div>
            <h1 className="text-xl font-bold text-gray-900 mb-2">Kelas Tidak Ditemukan</h1>
            <p className="text-gray-600 mb-6">{error}</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => router.push('/elearning')}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Kembali ke E-Learning
              </button>
              <button
                onClick={fetchClassDetail}
                className="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
              >
                Coba Lagi
              </button>
            </div>
          </div>
        </div>
      </LayoutNavbar>
    )
  }

  return (
    <>
      <LayoutNavbar>
        <div className="min-h-screen bg-white pt-20">
          {/* Header */}
          <div className="border-b border-gray-200">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
              <button
                onClick={() => router.push('/elearning')}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-6"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Kembali ke E-Learning</span>
              </button>

              <div className="flex flex-col lg:flex-row gap-8">
                {/* Course Image */}
                <div className="lg:w-2/5">
                  <div className="relative h-64 lg:h-80 rounded-xl overflow-hidden bg-gray-100">
                    {classDetail?.image_path_relative ? (
                      <Image
                        src={classDetail.image_path_relative}
                        alt={classDetail.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <BookOpen className="w-16 h-16 text-gray-400" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Course Info */}
                <div className="lg:w-3/5">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                      {classDetail ? getCategoryName(classDetail.categoryId) : 'Kursus'}
                    </span>
                    {/* <span className="bg-green-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                      {classDetail ? getCourseLevel(classDetail.categoryId) : 'Level'}
                    </span> */}
                  </div>

                  <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4">
                    {classDetail?.name}
                  </h1>

                  <p className="text-gray-700 text-lg leading-relaxed mb-6">
                    {classDetail?.description}
                  </p>

                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <div className="text-center">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                        <BookOpen className="w-6 h-6 text-blue-600" />
                      </div>
                      <p className="text-sm text-gray-600">Section</p>
                      <p className="font-bold text-gray-900">{classDetail?.sections?.length || 0}</p>
                    </div>

                    <div className="text-center">
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                        <Target className="w-6 h-6 text-green-600" />
                      </div>
                      <p className="text-sm text-gray-600">Materi</p>
                      <p className="font-bold text-gray-900">
                        {classDetail?.sections?.reduce((total, section) => total + (section.materials?.length || 0), 0)}
                      </p>
                    </div>

                    <div className="text-center">
                      <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-2">
                        <Star className="w-6 h-6 text-yellow-600" />
                      </div>
                      <p className="text-sm text-gray-600">Rating</p>
                      <p className="font-bold text-gray-900">{(classDetail?.averageRating || 0).toFixed(1)}</p>
                    </div>

                    <div className="text-center">
                      <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                        <Users className="w-6 h-6 text-purple-600" />
                      </div>
                      <p className="text-sm text-gray-600">Ulasan</p>
                      <p className="font-bold text-gray-900">{classDetail?.totalReviews || 0}</p>
                    </div>
                  </div>

                  <button 
                    onClick={() => document.getElementById('packages-section')?.scrollIntoView({ behavior: 'smooth' })}
                    className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors text-lg"
                  >
                    Berlangganan untuk Akses Kelas
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
            {/* Curriculum */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Kurikulum Kelas</h2>
              
              <div className="space-y-4">
                {classDetail?.sections?.map((section, sectionIndex) => (
                  <div key={section.id} className="border border-gray-200 rounded-lg overflow-hidden">
                    <button
                      onClick={() => toggleSection(section.id)}
                      className="w-full p-4 bg-gray-50 flex items-center justify-between hover:bg-gray-100 transition-colors"
                    >
                      <div className="text-left">
                        <h3 className="font-semibold text-gray-900 text-lg">
                          Section {sectionIndex + 1}: {section.title}
                        </h3>
                        <p className="text-gray-600 text-sm mt-1">
                          {section.materials?.length || 0} materi
                        </p>
                      </div>
                      {expandedSections.has(section.id) ? (
                        <ChevronUp className="w-5 h-5 text-gray-600" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-600" />
                      )}
                    </button>
                    
                    {expandedSections.has(section.id) && section.materials && section.materials.length > 0 && (
                      <div className="bg-white p-4 border-t border-gray-200">
                        <div className="space-y-3">
                          {section.materials.map((material, materialIndex) => (
                            <div
                              key={material.id}
                              className="flex items-center gap-4 p-3 border border-gray-200 rounded-lg"
                            >
                              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
                                {getMaterialIcon(material.materialType)}
                              </div>
                              <div className="flex-1">
                                <h4 className="font-semibold text-gray-900">{material.title}</h4>
                                <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                                  <span>{getMaterialTypeLabel(material.materialType)}</span>
                                  {material.duration && (
                                    <>
                                      <span>•</span>
                                      <span className="flex items-center gap-1">
                                        <Clock className="w-4 h-4" />
                                        {material.duration}
                                      </span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {(!classDetail?.sections || classDetail.sections.length === 0) && (
                  <div className="text-center py-8 border border-gray-200 rounded-lg">
                    <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">Belum ada materi</h3>
                    <p className="text-gray-600">Materi untuk kelas ini sedang dalam persiapan</p>
                  </div>
                )}
              </div>
            </div>

            {/* Packages Section */}
            <section id="packages-section" className="mb-12">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-3">
                  Pilih Paket Berlangganan
                </h2>
                <p className="text-gray-600 max-w-2xl mx-auto">
                  Akses semua materi premium dengan berlangganan paket pembelajaran kami
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  {
                    name: "1 Bulan",
                    originalPrice: "Rp 50.000",
                    price: "Rp 15.000",
                    discount: "70%",
                    duration: "1 Bulan Akses",
                    features: [
                      "Akses semua materi",
                      "Konsultasi mentor 2x/minggu",
                      "Download modul PDF",
                      "Grup diskusi",
                      "Update materi berkala"
                    ],
                    buttonText: "Pilih Paket 1 Bulan",
                    popular: false
                  },
                  {
                    name: "4 Bulan",
                    originalPrice: "Rp 166.000",
                    price: "Rp 50.000",
                    discount: "70%",
                    duration: "4 Bulan Akses",
                    features: [
                      "Akses semua materi",
                      "Konsultasi mentor 3x/minggu",
                      "Download modul PDF",
                      "Grup diskusi",
                      "Priority support",
                      "Video rekaman sesi"
                    ],
                    buttonText: "Pilih Paket 4 Bulan",
                    popular: true
                  },
                  {
                    name: "1 Tahun",
                    originalPrice: "Rp 333.000",
                    price: "Rp 100.000",
                    discount: "70%",
                    duration: "1 Tahun Akses",
                    features: [
                      "Akses semua materi",
                      "Konsultasi mentor 5x/minggu",
                      "Download modul PDF",
                      "Grup diskusi",
                      "Priority support",
                      "Video rekaman sesi",
                      "Personal learning plan",
                      "Assessment perkembangan"
                    ],
                    buttonText: "Pilih Paket 1 Tahun",
                    popular: false
                  }
                ].map((plan, index) => (
                  <div
                    key={index}
                    className={`border-2 rounded-xl p-6 ${
                      plan.popular 
                        ? 'border-blue-600 bg-blue-50' 
                        : 'border-gray-200 bg-white'
                    }`}
                  >
                    {plan.popular && (
                      <div className="text-center mb-4">
                        <span className="bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                          Paling Populer
                        </span>
                      </div>
                    )}
                    
                    <div className="text-center mb-6">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">Paket {plan.name}</h3>
                      <div className="flex flex-col items-center gap-2 mb-2">
                        <div className="flex items-baseline gap-2">
                          <span className="text-lg line-through text-gray-500">{plan.originalPrice}</span>
                          <span className="text-2xl font-bold text-blue-600">{plan.price}</span>
                        </div>
                        <span className="bg-red-500 text-white px-2 py-1 rounded text-sm font-semibold">
                          Hemat {plan.discount}
                        </span>
                      </div>
                      <p className="text-gray-600 font-semibold">{plan.duration}</p>
                    </div>

                    <ul className="space-y-3 mb-6">
                      {plan.features.map((feature, idx) => (
                        <li key={idx} className="flex items-center gap-3 text-gray-700">
                          <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <button 
                      onClick={() => window.open('https://lynk.id/ambilprestasi', '_blank', 'noopener,noreferrer')}
                      className={`w-full py-3 rounded-lg font-semibold transition-colors ${
                        plan.popular
                          ? 'bg-blue-600 text-white hover:bg-blue-700'
                          : 'bg-gray-900 text-white hover:bg-gray-800'
                      }`}
                    >
                      {plan.buttonText}
                    </button>
                  </div>
                ))}
              </div>
            </section>

            {/* Final CTA */}
            <div className="bg-gray-900 rounded-xl p-8 text-white text-center">
              <h2 className="text-2xl font-bold mb-4">Siap Mengembangkan Skill Anda?</h2>
              <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
                Bergabung dengan ribuan pelajar lainnya dan raih prestasi terbaik melalui program E-Learning kami.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button 
                  onClick={() => document.getElementById('packages-section')?.scrollIntoView({ behavior: 'smooth' })}
                  className="bg-white text-gray-900 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                >
                  Pilih Paket Belajar
                </button>
                <button 
                  onClick={() => router.push('/elearning')}
                  className="border-2 border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-gray-900 transition-colors"
                >
                  Lihat Kursus Lainnya
                </button>
              </div>
            </div>
          </div>
        </div>
      </LayoutNavbar>
      <Footer/>
    </>
  )
}