/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import LayoutNavbar from '@/components/public/LayoutNavbar'
import { Plus, Edit, Trash2, BookOpen, Users, FileText, Award, X, CheckCircle, XCircle, AlertTriangle, File, List, ArrowLeft } from 'lucide-react'
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

interface Section {
  id: number;
  title: string;
  description: string;
  order: number;
  Material: any[];
  Quiz: any[];
}

interface Category {
  id: number;
  name: string;
}

interface ApiResponse {
  success: boolean
  data: any
  message?: string
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

export default function ClassDetailPage() {
  const params = useParams()
  const router = useRouter()
  const classId = params.id as string

  const [classData, setClassData] = useState<Class | null>(null)
  const [sections, setSections] = useState<Section[]>([])
  const [categories, setCategories] = useState<Category[]>([
    { id: 1, name: 'Essay' },
    { id: 2, name: 'Bussiness Plan' },
    { id: 3, name: 'Penelitian' },
    { id: 4, name: 'Desain' }
  ])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showSectionModal, setShowSectionModal] = useState(false)
  const [editingSection, setEditingSection] = useState<Section | null>(null)
  const [sectionForm, setSectionForm] = useState({
    title: '',
    description: ''
  })
  
  // State untuk message feedback
  const [messageSuccess, setMessageSuccess] = useState<string | null>(null)
  const [messageFailed, setMessageFailed] = useState<string | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<{show: boolean, sectionId: number | null, sectionTitle: string}>({
    show: false,
    sectionId: null,
    sectionTitle: ''
  })

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

  // Auto hide messages after 5 seconds
  useEffect(() => {
    if (messageSuccess || messageFailed) {
      const timer = setTimeout(() => {
        setMessageSuccess(null)
        setMessageFailed(null)
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [messageSuccess, messageFailed])

  // Fetch class data dengan struktur yang konsisten
  const fetchClassData = async () => {
    try {
      setLoading(true)
      
      const token = localStorage.getItem("token")
      
      if (!token) {
        setError('Token tidak ditemukan. Silakan login kembali.')
        setLoading(false)
        return
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/classes/${classId}`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
        redirect: "follow" as RequestRedirect
      })

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem("token")
          setError('Sesi telah berakhir. Silakan login kembali.')
          setTimeout(() => router.push('/login'), 2000)
          return
        }
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const result: ApiResponse = await response.json()
      
      if (result.success) {
        setClassData(result.data)
        setError(null)
      } else {
        throw new Error(result.message || 'Gagal memuat data kelas')
      }
    } catch (err) {
      console.error('Error fetching class data:', err)
      setError('Gagal memuat data kelas. Silakan coba lagi.')
      setMessageFailed('Gagal memuat data kelas')
      setClassData(getFallbackClassData())
    } finally {
      setLoading(false)
    }
  }

  // Fallback data jika API error
  const getFallbackClassData = (): Class => ({
    id: parseInt(classId),
    name: 'Kelas Contoh',
    description: 'Ini adalah deskripsi kelas contoh',
    image_path: '/placeholder.png',
    categoryId: 1,
    createdAt: new Date().toISOString()
  })

  // Fetch sections dengan struktur yang konsisten
  const fetchSections = async () => {
    try {
      setLoading(true)
      
      // Ambil token dari localStorage
      const token = localStorage.getItem("token")
      
      if (!token) {
        setError('Token tidak ditemukan. Silakan login kembali.')
        setLoading(false)
        return
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/classes/${classId}/sections`, {
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
      
      if (result.success) {
        setSections(result.data || [])
        setError(null)
      } else {
        throw new Error(result.message || 'Gagal memuat data section')
      }
    } catch (err) {
      console.error('Error fetching sections:', err)
      setError('Gagal memuat data section. Silakan coba lagi.')
      setMessageFailed('Gagal memuat data section')
      // Fallback ke data statis jika API error
      setSections(getFallbackSections())
    } finally {
      setLoading(false)
    }
  }

  // Fallback sections jika API error
  const getFallbackSections = (): Section[] => [
    {
      id: 1,
      title: 'Section Contoh',
      description: 'Ini adalah section contoh',
      order: 1,
      Material: [],
      Quiz: []
    }
  ]

  useEffect(() => {
    if (classId) {
      fetchClassData()
      fetchSections()
    }
  }, [classId])

  // Handle section form input changes
  const handleSectionInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setSectionForm(prev => ({
      ...prev,
      [name]: value
    }))
  }

  // Reset section form
  const resetSectionForm = () => {
    setSectionForm({
      title: '',
      description: ''
    })
    setEditingSection(null)
  }

  // Open create section modal
  const handleCreateSection = () => {
    resetSectionForm()
    setShowSectionModal(true)
  }

  // Open edit section modal
  const handleEditSection = (section: Section) => {
    setEditingSection(section)
    setSectionForm({
      title: section.title,
      description: section.description || ''
    })
    setShowSectionModal(true)
  }

  // Submit section form (create or update)
  const handleSubmitSection = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Basic validation
    if (!sectionForm.title.trim()) {
      setMessageFailed('Judul section wajib diisi')
      return
    }

    setLoading(true)

    try {
      const token = localStorage.getItem("token")
      
      if (!token) {
        setMessageFailed('Token tidak ditemukan. Silakan login kembali.')
        setLoading(false)
        return
      }

      // CREATE SECTION - menggunakan application/json
      if (!editingSection) {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/classes/${classId}/sections`, {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
          body: JSON.stringify({
            title: sectionForm.title.trim(),
            description: sectionForm.description.trim()
          }),
        })

        if (!response.ok) {
          if (response.status === 401) {
            localStorage.removeItem("token")
            setMessageFailed('Sesi telah berakhir. Silakan login kembali.')
            setTimeout(() => router.push('/login'), 2000)
            return
          }
          const errorData = await response.json().catch(() => null)
          throw new Error(errorData?.message || `HTTP error! status: ${response.status}`)
        }

        const result = await response.json()
        
        if (result.success) {
          await fetchSections()
          setShowSectionModal(false)
          resetSectionForm()
          setMessageSuccess('Section berhasil dibuat')
        } else {
          throw new Error(result.message || 'Failed to create section')
        }
      } 
      // UPDATE SECTION - menggunakan application/x-www-form-urlencoded
      else {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/classes/${classId}/sections/${editingSection.id}`, {
          method: "PATCH",
          headers: { 
            "Content-Type": "application/x-www-form-urlencoded",
            "Authorization": `Bearer ${token}`,
          },
          body: new URLSearchParams({
            title: sectionForm.title.trim(),
            description: sectionForm.description.trim()
          }),
        })

        if (!response.ok) {
          if (response.status === 401) {
            localStorage.removeItem("token")
            setMessageFailed('Sesi telah berakhir. Silakan login kembali.')
            setTimeout(() => router.push('/login'), 2000)
            return
          }
          const errorData = await response.json().catch(() => null)
          throw new Error(errorData?.message || `HTTP error! status: ${response.status}`)
        }

        const result = await response.json()
        
        if (result.success) {
          await fetchSections()
          setShowSectionModal(false)
          resetSectionForm()
          setMessageSuccess('Section berhasil diperbarui')
        } else {
          throw new Error(result.message || 'Failed to update section')
        }
      }
    } catch (error) {
      console.error('Error saving section:', error)
      setMessageFailed(`Gagal menyimpan section: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  // Delete section
  const handleDeleteSection = async (sectionId: number) => {
    setLoading(true)
    try {
      const token = localStorage.getItem("token")
      
      if (!token) {
        setMessageFailed('Token tidak ditemukan. Silakan login kembali.')
        setLoading(false)
        return
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/classes/${classId}/sections/${sectionId}`, {
        method: "DELETE",
        headers: { 
          "Authorization": `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem("token")
          setMessageFailed('Sesi telah berakhir. Silakan login kembali.')
          setTimeout(() => router.push('/login'), 2000)
          return
        }
        const errorData = await response.json().catch(() => null)
        throw new Error(errorData?.message || `HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      
      if (result.success) {
        await fetchSections()
        setMessageSuccess('Section berhasil dihapus')
      } else {
        throw new Error(result.message || 'Failed to delete section')
      }
    } catch (error) {
      console.error('Error deleting section:', error)
      setMessageFailed(`Gagal menghapus section: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
      setShowDeleteConfirm({ show: false, sectionId: null, sectionTitle: '' })
    }
  }

  // Open delete confirmation
  const openDeleteConfirm = (sectionId: number, sectionTitle: string) => {
    setShowDeleteConfirm({
      show: true,
      sectionId,
      sectionTitle
    })
  }

// Auto-calculate stats from actual data
const totalMaterials = sections.reduce((acc, section) => acc + (section.Material?.length || 0), 0)
const totalQuizzes = sections.reduce((acc, section) => acc + (section.Quiz?.length || 0), 0)

interface Stat {
  value: string
  label: string
  icon: React.ReactNode
}

const stats: Stat[] = [
  { value: sections.length.toString(), label: 'Section', icon: <List className="w-5 h-5" /> },
  { value: totalMaterials.toString(), label: 'Total Materi', icon: <FileText className="w-5 h-5" /> },
  { value: totalQuizzes.toString(), label: 'Total Quiz', icon: <Award className="w-5 h-5" /> },
]

  if (loading && !classData) {
    return (
      <LayoutNavbar>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </LayoutNavbar>
    )
  }

  if (!classData) {
    return (
      <LayoutNavbar>
        <div className="flex flex-col items-center justify-center min-h-screen">
          <BookOpen className="w-16 h-16 text-gray-300 mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Kelas tidak ditemukan</h2>
          <p className="text-gray-600 mb-4">Kelas yang Anda cari tidak ditemukan</p>
          <button 
            onClick={() => router.push('/classes')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Kembali ke Kelas Saya
          </button>
        </div>
      </LayoutNavbar>
    )
  }

  return (
    <>
      <LayoutNavbar>
        {/* Success Message - Increased z-index to appear above modals */}
        {messageSuccess && (
          <div className="fixed top-4 right-4 z-[100] animate-in slide-in-from-right duration-300">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 shadow-lg max-w-sm mx-4">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-green-800 font-medium text-sm">{messageSuccess}</p>
                </div>
                <button 
                  onClick={() => setMessageSuccess(null)}
                  className="text-green-600 hover:text-green-800 transition-colors flex-shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Error Message - Increased z-index to appear above modals */}
        {messageFailed && (
          <div className="fixed top-4 right-4 z-[100] animate-in slide-in-from-right duration-300">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 shadow-lg max-w-sm mx-4">
              <div className="flex items-center gap-3">
                <XCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-red-800 font-medium text-sm">{messageFailed}</p>
                </div>
                <button 
                  onClick={() => setMessageFailed(null)}
                  className="text-red-600 hover:text-red-800 transition-colors flex-shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="px-4 sm:px-6 lg:px-8 pt-16 md:pt-20">
          {/* Header Section */}
          <div className="max-w-7xl mx-auto mb-8">
            <button 
              onClick={() => router.push('/classes')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Kembali ke Kelas Saya</span>
            </button>

            {/* Error State */}
            {error && !loading && (
              <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-yellow-700 font-medium">{error}</p>
                {error.includes('login kembali') && (
                  <button 
                    onClick={() => router.push('/login')}
                    className="mt-3 bg-blue-700 text-white px-4 py-2 rounded-lg hover:bg-blue-800 transition-colors text-sm"
                  >
                    Login Kembali
                  </button>
                )}
              </div>
            )}

            <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
              <div className="flex flex-col lg:flex-row">
                {/* Class Image */}
                <div className="lg:w-1/3 h-64 lg:h-auto relative">
                  {isValidImage(classData.image_path_relative || classData.image_path) ? (
                    <Image
                      src={getValidImageUrl(classData.image_path_relative || classData.image_path)}
                      alt={classData.name}
                      fill
                      className="object-cover"
                      priority
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
                      <BookOpen className="w-16 h-16 text-white opacity-80" />
                    </div>
                  )}
                </div>

                {/* Class Info */}
                <div className="lg:w-2/3 p-4 sm:p-6 lg:p-8">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-4">
                    <div className="flex-1">
                      <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
                        {classData.name}
                      </h1>
                      <div className="flex flex-wrap gap-2 mb-4">
                        <span className="bg-blue-500 text-white text-xs px-3 py-1 rounded-full font-medium">
                          {mapCategory(classData.categoryId)}
                        </span>
                        <span className="bg-green-500 text-white text-xs px-3 py-1 rounded-full font-medium">
                          Aktif
                        </span>
                      </div>
                    </div>
                  </div>

                  <p className="text-gray-600 mb-6 leading-relaxed text-sm sm:text-base">
                    {classData.description}
                  </p>

                  {/* Stats - Improved mobile layout */}
                  <div className="grid grid-cols-3 gap-3 sm:gap-4">
                    {stats.map((stat, index) => (
                      <div
                        key={index}
                        className="bg-gray-50 rounded-lg p-3 sm:p-4 text-center"
                      >
                        <div className="flex justify-center mb-1 sm:mb-2">
                          <div className="bg-blue-100 p-1.5 sm:p-2 rounded-lg text-blue-600">
                            {stat.icon}
                          </div>
                        </div>
                        <h3 className="text-base sm:text-lg font-bold text-gray-900">{stat.value}</h3>
                        <p className="text-gray-600 text-xs sm:text-sm">{stat.label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sections Section */}
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
              <div className="flex-1">
                <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mb-1 sm:mb-2">
                  Section & Materi
                </h2>
                <p className="text-gray-700 text-sm sm:text-base">
                  Kelola section dan materi pembelajaran untuk kelas ini
                </p>
              </div>
              <button 
                onClick={handleCreateSection}
                disabled={loading}
                className="bg-green-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold transition-all duration-300 hover:scale-105 hover:shadow-lg active:scale-95 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto justify-center"
              >
                <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>Tambah Section</span>
              </button>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-600 mt-4">Memuat data section...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sections.map((section, index) => (
                  <div 
                    key={section.id}
                    className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden transition-all duration-300 hover:shadow-md hover:border-blue-300 group"
                  >
                    {/* Section Header dengan Icon */}
                    <div className="relative h-32 w-full overflow-hidden bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                      <List className="w-12 h-12 text-white opacity-90" />
                      
                      {/* Order Badge */}
                      <div className="absolute top-3 left-3">
                        <span className="bg-white text-blue-600 text-xs px-2 py-1 rounded-full font-medium">
                          #{section.order}
                        </span>
                      </div>

                      {/* Materials & Quizzes Badge */}
                      <div className="absolute top-3 right-3">
                        <span className="bg-white/20 text-white text-xs px-2 py-1 rounded-full font-medium backdrop-blur-sm">
                          {section.Material?.length || 0} Materi
                        </span>
                      </div>
                    </div>
                    
                    <div className="p-5">
                      <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-700 transition-colors">
                        {section.title}
                      </h3>
                      
                      {section.description && (
                        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                          {section.description}
                        </p>
                      )}

                      {/* Section Stats */}
                      <div className="flex justify-between items-center text-sm text-gray-600 mb-4">
                        <div className="flex items-center gap-1">
                          <FileText className="w-4 h-4 text-blue-500" />
                          <span className="font-medium">{section.Material?.length || 0}</span>
                          <span className="text-gray-500">Materi</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Award className="w-4 h-4 text-green-500" />
                          <span className="font-medium">{section.Quiz?.length || 0}</span>
                          <span className="text-gray-500">Quiz</span>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        <button 
                          onClick={() => router.push(`/classes/${classId}/sections/${section.id}/materials`)}
                          className="flex-1 bg-blue-500 text-white py-2 px-3 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-blue-600 active:scale-95 flex items-center justify-center gap-2"
                        >
                          <File className="w-4 h-4" />
                          Kelola
                        </button>
                        <button 
                          onClick={() => handleEditSection(section)}
                          disabled={loading}
                          className="bg-gray-100 text-gray-700 py-2 px-3 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-gray-200 active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Edit Section"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => openDeleteConfirm(section.id, section.title)}
                          disabled={loading}
                          className="bg-gray-100 text-gray-700 py-2 px-3 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-red-500 hover:text-white active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Hapus Section"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {sections.length === 0 && !loading && (
              <div className="text-center py-12">
                <List className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Belum ada section</h3>
                <p className="text-gray-500 mb-4 text-sm sm:text-base">Mulai dengan membuat section pertama untuk kelas ini</p>
                <button 
                  onClick={handleCreateSection}
                  disabled={loading}
                  className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 hover:scale-105 hover:shadow-lg active:scale-95 flex items-center gap-2 mx-auto disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Plus className="w-5 h-5" />
                  Buat Section Pertama
                </button>
              </div>
            )}
          </div>
        </div>
      </LayoutNavbar>
      <Footer/>

      {/* Create/Edit Section Modal */}
      {showSectionModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col border border-gray-200 shadow-2xl mx-auto">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-4 sm:p-6 border-b border-gray-200 bg-white flex-shrink-0">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900">
                {editingSection ? 'Edit Section' : 'Tambah Section Baru'}
              </h3>
              <button 
                onClick={() => {
                  setShowSectionModal(false)
                  resetSectionForm()
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1"
                disabled={loading}
              >
                <X className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </div>

            {/* Modal Body - Scrollable */}
            <div className="flex-1 overflow-y-auto">
              <form onSubmit={handleSubmitSection} className="p-4 sm:p-6">
                <div className="space-y-4 sm:space-y-6">
                  {/* Title Input */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Judul Section *
                    </label>
                    <input
                      type="text"
                      name="title"
                      required
                      value={sectionForm.title}
                      onChange={handleSectionInputChange}
                      disabled={loading}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 disabled:opacity-50 bg-white text-sm sm:text-base"
                      placeholder="Masukkan judul section"
                    />
                  </div>
                  
                  {/* Description Input */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Deskripsi
                    </label>
                    <textarea
                      name="description"
                      value={sectionForm.description}
                      onChange={handleSectionInputChange}
                      rows={4}
                      disabled={loading}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 resize-none disabled:opacity-50 bg-white text-sm sm:text-base"
                      placeholder="Deskripsi singkat tentang section (opsional)"
                    />
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="flex gap-3 justify-end mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-gray-200 flex-shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      setShowSectionModal(false)
                      resetSectionForm()
                    }}
                    disabled={loading}
                    className="px-4 sm:px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors font-medium disabled:opacity-50 text-sm sm:text-base"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-blue-600 text-white px-4 sm:px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm sm:text-base"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Menyimpan...
                      </>
                    ) : (
                      editingSection ? 'Simpan Perubahan' : 'Buat Section'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm.show && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full border border-gray-200 shadow-2xl mx-4 sm:mx-auto">
            <div className="p-4 sm:p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-red-100 p-2 rounded-full">
                  <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6 text-red-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">Konfirmasi Hapus</h3>
              </div>
              
              <p className="text-gray-600 mb-6 text-sm sm:text-base">
                Apakah Anda yakin ingin menghapus section <span className="font-semibold text-gray-900">`{showDeleteConfirm.sectionTitle}`</span>? Tindakan ini tidak dapat dibatalkan.
              </p>

              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setShowDeleteConfirm({ show: false, sectionId: null, sectionTitle: '' })}
                  disabled={loading}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors font-medium disabled:opacity-50 text-sm sm:text-base"
                >
                  Batal
                </button>
                <button
                  onClick={() => showDeleteConfirm.sectionId && handleDeleteSection(showDeleteConfirm.sectionId)}
                  disabled={loading}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm sm:text-base"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Menghapus...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4" />
                      Hapus
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}