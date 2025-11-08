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
  const [loading, setLoading] = useState(false)
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

  // Get auth token from localStorage
  const getAuthToken = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token') || ''
    }
    return ''
  }

  // Fetch class data
  const fetchClassData = async () => {
    setLoading(true)
    try {
      const token = getAuthToken()
      if (!token) {
        console.warn('No auth token found')
        return
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/classes/${classId}`, {
        method: "GET",
        headers: { 
          "Authorization": `Bearer ${token}`,
        },
      })
      
      if (!response.ok) throw new Error('Failed to fetch class data')
      
      const result = await response.json()
      if (result.success) {
        const classWithStats = {
          ...result.data,
          studentCount: result.data.students?.length || 0,
          materialCount: Math.floor(Math.random() * 15) + 5 // Mock data
        }
        setClassData(classWithStats)
      }
    } catch (error) {
      console.error('Error fetching class data:', error)
      setMessageFailed('Gagal memuat data kelas')
    } finally {
      setLoading(false)
    }
  }

  // Fetch sections
  const fetchSections = async () => {
    setLoading(true)
    try {
      const token = getAuthToken()
      if (!token) {
        console.warn('No auth token found')
        return
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/classes/${classId}/sections`, {
        method: "GET",
        headers: { 
          "Authorization": `Bearer ${token}`,
        },
      })
      
      if (!response.ok) throw new Error('Failed to fetch sections')
      
      const result = await response.json()
      if (result.success) {
        setSections(result.data)
      }
    } catch (error) {
      console.error('Error fetching sections:', error)
      setMessageFailed('Gagal memuat data section')
    } finally {
      setLoading(false)
    }
  }

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
      const token = getAuthToken()
      if (!token) {
        setMessageFailed('Token autentikasi tidak ditemukan')
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
      const token = getAuthToken()
      if (!token) {
        setMessageFailed('Token autentikasi tidak ditemukan')
        return
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/classes/${classId}/sections/${sectionId}`, {
        method: "DELETE",
        headers: { 
          "Authorization": `Bearer ${token}`,
        },
      })

      if (!response.ok) {
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

  const stats = [
    { value: classData?.studentCount?.toString() || '0', label: 'Siswa', icon: <Users className="w-5 h-5" /> },
    { value: sections.length.toString(), label: 'Section', icon: <List className="w-5 h-5" /> },
    { value: classData?.materialCount?.toString() || '0', label: 'Total Materi', icon: <FileText className="w-5 h-5" /> },
    { value: '4.8', label: 'Rating', icon: <Award className="w-5 h-5" /> },
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
        {/* Success Message */}
        {messageSuccess && (
          <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-right duration-300">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 shadow-lg max-w-sm">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                <div>
                  <p className="text-green-800 font-medium text-sm">{messageSuccess}</p>
                </div>
                <button 
                  onClick={() => setMessageSuccess(null)}
                  className="text-green-600 hover:text-green-800 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {messageFailed && (
          <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-right duration-300">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 shadow-lg max-w-sm">
              <div className="flex items-center gap-3">
                <XCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                <div>
                  <p className="text-red-800 font-medium text-sm">{messageFailed}</p>
                </div>
                <button 
                  onClick={() => setMessageFailed(null)}
                  className="text-red-600 hover:text-red-800 transition-colors"
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

            <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
              <div className="flex flex-col lg:flex-row">
                {/* Class Image */}
                <div className="lg:w-1/3 h-64 lg:h-auto relative">
                  {isValidImage(classData.image_path) ? (
                    <Image
                      src={getValidImageUrl(classData.image_path)}
                      alt={classData.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
                      <BookOpen className="w-16 h-16 text-white opacity-80" />
                    </div>
                  )}
                </div>

                {/* Class Info */}
                <div className="lg:w-2/3 p-6 sm:p-8">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-4">
                    <div>
                      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                        {classData.name}
                      </h1>
                      <div className="flex flex-wrap gap-2 mb-4">
                        <span className="bg-blue-500 text-white text-xs px-3 py-1 rounded-full font-medium">
                          {categories.find(cat => cat.id === classData.categoryId)?.name || 'Unknown'}
                        </span>
                        <span className="bg-green-500 text-white text-xs px-3 py-1 rounded-full font-medium">
                          Aktif
                        </span>
                      </div>
                    </div>
                  </div>

                  <p className="text-gray-600 mb-6 leading-relaxed">
                    {classData.description}
                  </p>

                  {/* Stats */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {stats.map((stat, index) => (
                      <div
                        key={index}
                        className="bg-gray-50 rounded-lg p-4 text-center"
                      >
                        <div className="flex justify-center mb-2">
                          <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
                            {stat.icon}
                          </div>
                        </div>
                        <h3 className="text-lg sm:text-xl font-bold text-gray-900">{stat.value}</h3>
                        <p className="text-gray-600 text-sm">{stat.label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sections Section */}
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                  Section & Materi
                </h2>
                <p className="text-gray-700 text-sm sm:text-base">
                  Kelola section dan materi pembelajaran untuk kelas ini
                </p>
              </div>
              <button 
                onClick={handleCreateSection}
                disabled={loading}
                className="bg-green-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold transition-all duration-300 hover:scale-105 hover:shadow-lg active:scale-95 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="hidden sm:inline">Tambah Section</span>
              </button>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-600 mt-4">Memuat data section...</p>
              </div>
            ) : (
              <div className="space-y-4">
                {sections.map((section, index) => (
                  <div 
                    key={section.id}
                    className="bg-white rounded-xl shadow-md border border-gray-200 transition-all duration-300 hover:shadow-lg"
                  >
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-start gap-4 flex-1">
                          <div className="bg-blue-100 text-blue-600 rounded-lg p-3 mt-1">
                            <List className="w-5 h-5" />
                          </div>
                          <div className="flex-1">
                            <h3 className="text-lg font-bold text-gray-900 mb-2">
                              {section.title}
                            </h3>
                            {section.description && (
                              <p className="text-gray-600 text-sm mb-3">
                                {section.description}
                              </p>
                            )}
                            <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                              <span className="flex items-center gap-1">
                                <FileText className="w-4 h-4" />
                                {section.Material?.length || 0} Materi
                              </span>
                              <span className="flex items-center gap-1">
                                <BookOpen className="w-4 h-4" />
                                {section.Quiz?.length || 0} Quiz
                              </span>
                              <span>Urutan: {section.order}</span>
                            </div>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2 ml-4">
                          <button 
                            onClick={() => handleEditSection(section)}
                            disabled={loading}
                            className="bg-blue-500 text-white p-2 rounded-lg transition-all duration-300 hover:bg-blue-600 hover:scale-105 active:scale-95 disabled:opacity-50"
                            title="Edit Section"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => openDeleteConfirm(section.id, section.title)}
                            disabled={loading}
                            className="bg-red-500 text-white p-2 rounded-lg transition-all duration-300 hover:bg-red-600 hover:scale-105 active:scale-95 disabled:opacity-50"
                            title="Hapus Section"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Quick Actions */}
                      <div className="flex gap-3 pt-4 border-t border-gray-100">
                        <button 
                          onClick={() => router.push(`/classes/${classId}/sections/${section.id}/materials`)}
                          className="flex-1 bg-gray-100 text-gray-700 py-2 px-3 rounded-lg text-sm font-medium transition-all duration-300 hover:bg-blue-500 hover:text-white hover:scale-105 active:scale-95 flex items-center justify-center gap-2 group"
                        >
                          <File className="w-4 h-4" />
                          Kelola Materi
                        </button>
                        <button className="flex-1 bg-gray-100 text-gray-700 py-2 px-3 rounded-lg text-sm font-medium transition-all duration-300 hover:bg-green-500 hover:text-white hover:scale-105 active:scale-95 flex items-center justify-center gap-2 group">
                          <BookOpen className="w-4 h-4" />
                          Kelola Quiz
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {sections.length === 0 && !loading && (
              <div className="text-center py-12">
                <List className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Belum ada section</h3>
                <p className="text-gray-500 mb-4">Mulai dengan membuat section pertama untuk kelas ini</p>
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
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col border border-gray-200 shadow-2xl">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b border-gray-200 bg-white">
              <h3 className="text-xl font-bold text-gray-900">
                {editingSection ? 'Edit Section' : 'Tambah Section Baru'}
              </h3>
              <button 
                onClick={() => {
                  setShowSectionModal(false)
                  resetSectionForm()
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                disabled={loading}
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Body - Scrollable */}
            <div className="flex-1 overflow-y-auto">
              <form onSubmit={handleSubmitSection} className="p-6">
                <div className="space-y-6">
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 disabled:opacity-50 bg-white"
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 resize-none disabled:opacity-50 bg-white"
                      placeholder="Deskripsi singkat tentang section (opsional)"
                    />
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="flex gap-3 justify-end mt-8 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => {
                      setShowSectionModal(false)
                      resetSectionForm()
                    }}
                    disabled={loading}
                    className="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors font-medium disabled:opacity-50"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
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
          <div className="bg-white rounded-xl max-w-md w-full border border-gray-200 shadow-2xl">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-red-100 p-2 rounded-full">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">Konfirmasi Hapus</h3>
              </div>
              
              <p className="text-gray-600 mb-6">
                Apakah Anda yakin ingin menghapus section <span className="font-semibold text-gray-900">`{showDeleteConfirm.sectionTitle}`</span>? Tindakan ini tidak dapat dibatalkan.
              </p>

              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setShowDeleteConfirm({ show: false, sectionId: null, sectionTitle: '' })}
                  disabled={loading}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors font-medium disabled:opacity-50"
                >
                  Batal
                </button>
                <button
                  onClick={() => showDeleteConfirm.sectionId && handleDeleteSection(showDeleteConfirm.sectionId)}
                  disabled={loading}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
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