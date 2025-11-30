/* eslint-disable @next/next/no-img-element */
'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import LayoutNavbar from '@/components/public/LayoutNavbar'
import { Plus, Edit, Trash2, BookOpen, Users, FileText, X, Upload, Image as ImageIcon, CheckCircle, XCircle, AlertTriangle, Filter, Search, ChevronDown, ChevronUp } from 'lucide-react'
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

// Helper function to check if image exists and is valid
const isValidImage = (path: string | null | undefined): boolean => {
  if (!path) return false;
  const validUrl = getValidImageUrl(path);
  return validUrl.length > 0;
};

export default function TeacherHome() {
  const router = useRouter()
  const [classes, setClasses] = useState<Class[]>([])
  const [filteredClasses, setFilteredClasses] = useState<Class[]>([])
  const [displayedClasses, setDisplayedClasses] = useState<Class[]>([])
  const [categories] = useState<Category[]>([
    { id: 1, name: 'Essay' },
    { id: 2, name: 'Bussiness Plan' },
    { id: 3, name: 'Penelitian' },
    { id: 4, name: 'Desain' }
  ])
  const [activeFilter, setActiveFilter] = useState<number | 'all'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingClass, setEditingClass] = useState<Class | null>(null)
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    categoryId: '',
    image: null as File | null
  })
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [showMore, setShowMore] = useState(false)
  const initialDisplayCount = 6
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // State untuk message feedback
  const [messageSuccess, setMessageSuccess] = useState<string | null>(null)
  const [messageFailed, setMessageFailed] = useState<string | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<{show: boolean, classId: number | null, className: string}>({
    show: false,
    classId: null,
    className: ''
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

  // Filter classes when activeFilter, searchQuery or classes change
  useEffect(() => {
    let result = classes;
    
    // Apply category filter
    if (activeFilter !== 'all') {
      result = result.filter(classItem => classItem.categoryId === activeFilter);
    }
    
    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(classItem => 
        classItem.name.toLowerCase().includes(query) ||
        classItem.description.toLowerCase().includes(query)
      );
    }
    
    setFilteredClasses(result);
  }, [activeFilter, searchQuery, classes])

  // Update displayed classes when filtered classes or showMore changes
  useEffect(() => {
    if (showMore) {
      setDisplayedClasses(filteredClasses);
    } else {
      setDisplayedClasses(filteredClasses.slice(0, initialDisplayCount));
    }
  }, [filteredClasses, showMore])

  // Fetch classes from API - SESUAI STRUKTUR BARU
  const fetchClasses = async () => {
    try {
      setLoading(true)
      
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
          localStorage.removeItem("token")
          setError('Sesi telah berakhir. Silakan login kembali.')
          setTimeout(() => router.push('/auth/login'), 2000)
          return
        }
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const result: ApiResponse = await response.json()
      
      if (result.success && result.data) {
        // PERUBAHAN: result.data langsung array, bukan result.data.classes
        const transformedClasses = result.data.map((classItem) => ({
          id: classItem.id,
          name: classItem.name,
          description: classItem.description,
          image_path: classItem.image_path,
          image_path_relative: classItem.image_path_relative,
          categoryId: classItem.categoryId,
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
      setMessageFailed('Gagal memuat data kelas')
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
      createdAt: new Date().toISOString()
    },
    {
      id: 2,
      name: 'Business Plan untuk Kompetisi Startup',
      description: 'Buat business plan yang menarik untuk kompetisi startup',
      image_path: '/business-plan.png',
      categoryId: 2,
      createdAt: new Date().toISOString()
    },
    {
      id: 3,
      name: 'Karya Tulis Ilmiah & Publikasi',
      description: 'Teknik menulis karya ilmiah dan strategi publikasi',
      image_path: '/karya-tulis-ilmiah.png',
      categoryId: 3,
      createdAt: new Date().toISOString()
    },
    {
      id: 4,
      name: 'Desain Grafis untuk Pemula',
      description: 'Pelajari dasar-dasar desain grafis untuk pemula',
      image_path: '/desain-grafis.png',
      categoryId: 4,
      createdAt: new Date().toISOString()
    },
    {
      id: 5,
      name: 'Advanced Essay Writing',
      description: 'Teknik lanjutan menulis esai untuk kompetisi tingkat tinggi',
      image_path: '/advanced-essay.png',
      categoryId: 1,
      createdAt: new Date().toISOString()
    },
    {
      id: 6,
      name: 'Startup Funding Strategy',
      description: 'Strategi mendapatkan funding untuk startup Anda',
      image_path: '/startup-funding.png',
      categoryId: 2,
      createdAt: new Date().toISOString()
    },
    {
      id: 7,
      name: 'Metodologi Penelitian Kuantitatif',
      description: 'Panduan lengkap metodologi penelitian kuantitatif',
      image_path: '/metodologi-penelitian.png',
      categoryId: 3,
      createdAt: new Date().toISOString()
    },
    {
      id: 8,
      name: 'UI/UX Design Fundamentals',
      description: 'Dasar-dasar desain UI/UX untuk aplikasi modern',
      image_path: '/ui-ux-design.png',
      categoryId: 4,
      createdAt: new Date().toISOString()
    }
  ]

  useEffect(() => {
    fetchClasses()
  }, [])

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  // Handle image upload
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setMessageFailed('Ukuran file maksimal 2MB')
        return
      }

      if (!file.type.startsWith('image/')) {
        setMessageFailed('File harus berupa gambar')
        return
      }

      setFormData(prev => ({
        ...prev,
        image: file
      }))
      
      // Create URL untuk preview
      const reader = new FileReader()
      reader.onload = (e) => {
        if (e.target?.result) {
          setImagePreview(e.target.result as string)
        }
      }
      reader.onerror = () => {
        setMessageFailed('Gagal memuat gambar')
      }
      reader.readAsDataURL(file)
    }
  }

  // Reset form
  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      categoryId: '',
      image: null
    })
    setImagePreview(null)
    setEditingClass(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  // Open create modal
  const handleCreateClass = () => {
    resetForm()
    setShowCreateModal(true)
  }

  // Open edit modal
  const handleEditClass = (classItem: Class) => {
    setEditingClass(classItem)
    setFormData({
      name: classItem.name,
      description: classItem.description,
      categoryId: classItem.categoryId.toString(),
      image: null
    })
    if (isValidImage(classItem.image_path_relative || classItem.image_path)) {
      setImagePreview(getValidImageUrl(classItem.image_path_relative || classItem.image_path))
    } else {
      setImagePreview(null)
    }
    setShowCreateModal(true)
  }

  // Submit form (create or update)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name.trim() || !formData.description.trim() || !formData.categoryId) {
      setMessageFailed('Harap isi semua field yang wajib diisi')
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

      const submitData = new FormData()
      submitData.append('name', formData.name.trim())
      submitData.append('description', formData.description.trim())
      submitData.append('categoryId', formData.categoryId)
      
      if (formData.image) {
        submitData.append('file', formData.image)
      }

      const url = editingClass 
        ? `${process.env.NEXT_PUBLIC_API_URL}/classes/${editingClass.id}`
        : `${process.env.NEXT_PUBLIC_API_URL}/classes`

      const method = editingClass ? 'PATCH' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: submitData
      })

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem("token")
          setMessageFailed('Sesi telah berakhir. Silakan login kembali.')
          setTimeout(() => router.push('/auth/login'), 2000)
          return
        }
        const errorData = await response.json().catch(() => null)
        throw new Error(errorData?.message || `HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      
      if (result.success) {
        await fetchClasses()
        setShowCreateModal(false)
        resetForm()
        setMessageSuccess(editingClass ? 'Kelas berhasil diperbarui' : 'Kelas berhasil dibuat')
      } else {
        throw new Error(result.message || 'Failed to save class')
      }
    } catch (error) {
      console.error('Error saving class:', error)
      setMessageFailed(`Gagal menyimpan kelas: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  // Delete class
  const handleDeleteClass = async (classId: number) => {
    setLoading(true)
    try {
      const token = localStorage.getItem("token")
      
      if (!token) {
        setMessageFailed('Token tidak ditemukan. Silakan login kembali.')
        setLoading(false)
        return
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/classes/${classId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      })

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem("token")
          setMessageFailed('Sesi telah berakhir. Silakan login kembali.')
          setTimeout(() => router.push('/auth/login'), 2000)
          return
        }
        const errorData = await response.json().catch(() => null)
        throw new Error(errorData?.message || `HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      
      if (result.success) {
        await fetchClasses()
        setMessageSuccess('Kelas berhasil dihapus')
      } else {
        throw new Error(result.message || 'Failed to delete class')
      }
    } catch (error) {
      console.error('Error deleting class:', error)
      setMessageFailed(`Gagal menghapus kelas: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
      setShowDeleteConfirm({ show: false, classId: null, className: '' })
    }
  }

  // Open delete confirmation
  const openDeleteConfirm = (classId: number, className: string) => {
    setShowDeleteConfirm({
      show: true,
      classId,
      className
    })
  }

  // Stats untuk header - hanya total section
  const stats = [
    { value: classes.length.toString(), label: 'Total Kelas', icon: <BookOpen className="w-5 h-5" /> }
  ]

  // Toggle show more
  const toggleShowMore = () => {
    setShowMore(!showMore)
  }

  // Handle click on image upload area
  const handleImageAreaClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  // Handle remove image
  const handleRemoveImage = () => {
    setImagePreview(null)
    setFormData(prev => ({ ...prev, image: null }))
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
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

        <div className="min-h-screen bg-gray-50 pt-16 md:pt-20">
          {/* Header Section */}
          <div className="bg-white border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Kelas Saya</h1>
                  <p className="text-gray-600 mt-2">Kelola semua kelas dan materi pembelajaran Anda</p>
                </div>
                <button 
                  onClick={handleCreateClass}
                  disabled={loading}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 hover:bg-blue-700 hover:shadow-lg active:scale-95 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed w-full md:w-auto justify-center"
                >
                  <Plus className="w-5 h-5" />
                  Buat Kelas Baru
                </button>
              </div>

              {/* Error State */}
              {error && !loading && (
                <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-yellow-700 font-medium">{error}</p>
                  {error.includes('login kembali') && (
                    <button 
                      onClick={() => router.push('/auth/login')}
                      className="mt-3 bg-blue-700 text-white px-4 py-2 rounded-lg hover:bg-blue-800 transition-colors"
                    >
                      Login Kembali
                    </button>
                  )}
                </div>
              )}

              {/* Stats Cards - Hanya Total Section */}
              <div className="grid grid-cols-1 gap-4 mt-6 max-w-xs">
                {stats.map((stat, index) => (
                  <div
                    key={index}
                    className="bg-gray-50 rounded-lg p-4 border border-gray-200"
                  >
                    <div className="flex items-center gap-3">
                      <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
                        {stat.icon}
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-gray-900">{stat.value}</h3>
                        <p className="text-gray-600 text-sm">{stat.label}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Search and Filter Section */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                {/* Search Bar */}
                <div className="flex-1 max-w-md">
                  <div className="relative">
                    <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Cari kelas..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Filter Buttons */}
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setActiveFilter('all')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      activeFilter === 'all' 
                        ? 'bg-blue-600 text-white shadow-sm' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Semua
                  </button>
                  {categories.map(category => (
                    <button
                      key={category.id}
                      onClick={() => setActiveFilter(category.id)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                        activeFilter === category.id 
                          ? 'bg-blue-600 text-white shadow-sm' 
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {category.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Filter Info */}
              <div className="mt-4 flex items-center gap-2 text-sm text-gray-600">
                <Filter className="w-4 h-4" />
                <span>Menampilkan:</span>
                <span className="font-medium">
                  {activeFilter === 'all' 
                    ? `Semua Kelas (${filteredClasses.length})` 
                    : `${categories.find(cat => cat.id === activeFilter)?.name} (${filteredClasses.length})`
                  }
                </span>
                {searchQuery && (
                  <>
                    <span>•</span>
                    <span>Pencarian: `{searchQuery}`</span>
                  </>
                )}
              </div>
            </div>

            {/* Classes Grid */}
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-600 mt-4">Memuat data kelas...</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {displayedClasses.map((classItem) => (
                    <div 
                      key={classItem.id}
                      className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden transition-all duration-300 hover:shadow-md hover:border-blue-300 group"
                    >
                      <div className="relative h-48 w-full overflow-hidden">
                        {isValidImage(classItem.image_path_relative || classItem.image_path) ? (
                          <Image
                            src={getValidImageUrl(classItem.image_path_relative || classItem.image_path)}
                            alt={classItem.name}
                            fill
                            className="object-cover transition-all duration-500 group-hover:scale-105"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement
                              target.style.display = 'none'
                            }}
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                            <BookOpen className="w-12 h-12 text-white opacity-90" />
                          </div>
                        )}
                        
                        {/* Category Badge */}
                        <div className="absolute top-3 right-3">
                          <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                            {mapCategory(classItem.categoryId)}
                          </span>
                        </div>
                      </div>
                      
                      <div className="p-5">
                        <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-1 group-hover:text-blue-700 transition-colors">
                          {classItem.name}
                        </h3>
                        
                        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                          {classItem.description}
                        </p>

                        {/* Stats - Only Section Count */}
                        <div className="flex items-center gap-2 text-sm text-gray-500 mb-4 pb-4 border-b border-gray-100">
                          <BookOpen className="w-4 h-4" />
                          <span>Belum ada section</span>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2">
                          <button 
                            onClick={() => router.push(`/classes/${classItem.id}`)}
                            className="flex-1 bg-blue-500 text-white py-2 px-3 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-blue-600 active:scale-95 flex items-center justify-center gap-2"
                          >
                            <BookOpen className="w-4 h-4" />
                            Kelola
                          </button>
                          <button 
                            onClick={() => handleEditClass(classItem)}
                            disabled={loading}
                            className="bg-gray-100 text-gray-700 py-2 px-3 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-gray-200 active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => openDeleteConfirm(classItem.id, classItem.name)}
                            disabled={loading}
                            className="bg-gray-100 text-gray-700 py-2 px-3 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-red-500 hover:text-white active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Show More Button */}
                {filteredClasses.length > initialDisplayCount && (
                  <div className="flex justify-center mt-8">
                    <button
                      onClick={toggleShowMore}
                      className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-all duration-200 hover:shadow-md"
                    >
                      {showMore ? (
                        <>
                          <ChevronUp className="w-5 h-5" />
                          Tampilkan Lebih Sedikit
                        </>
                      ) : (
                        <>
                          <ChevronDown className="w-5 h-5" />
                          Tampilkan Lebih Banyak ({filteredClasses.length - initialDisplayCount} lainnya)
                        </>
                      )}
                    </button>
                  </div>
                )}
              </>
            )}

            {/* Empty State */}
            {filteredClasses.length === 0 && !loading && (
              <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-200">
                <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {activeFilter === 'all' && !searchQuery ? 'Belum ada kelas' : 'Kelas tidak ditemukan'}
                </h3>
                <p className="text-gray-500 mb-6 max-w-md mx-auto">
                  {activeFilter === 'all' && !searchQuery 
                    ? 'Mulai dengan membuat kelas pertama Anda untuk mengelola materi pembelajaran' 
                    : searchQuery
                    ? `Tidak ada kelas yang sesuai dengan pencarian "${searchQuery}"`
                    : `Tidak ada kelas dalam kategori ${categories.find(cat => cat.id === activeFilter)?.name}`
                  }
                </p>
                <button 
                  onClick={handleCreateClass}
                  disabled={loading}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 hover:bg-blue-700 hover:shadow-lg active:scale-95 flex items-center gap-2 mx-auto disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Plus className="w-5 h-5" />
                  Buat Kelas Pertama
                </button>
              </div>
            )}
          </div>
        </div>
      </LayoutNavbar>
      <Footer/>

      {/* Create/Edit Class Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col border border-gray-200 shadow-2xl">
            <div className="flex justify-between items-center p-6 border-b border-gray-200 bg-white">
              <h3 className="text-xl font-bold text-gray-900">
                {editingClass ? 'Edit Kelas' : 'Buat Kelas Baru'}
              </h3>
              <button 
                onClick={() => {
                  setShowCreateModal(false)
                  resetForm()
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                disabled={loading}
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              <form onSubmit={handleSubmit} className="p-6">
                <div className="space-y-6">
                  {/* Image Upload Section */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Gambar Kelas
                    </label>
                    
                    {/* Upload Area - Selalu Tampil */}
                    <div className="flex items-center justify-center mb-4">
                      <div 
                        onClick={handleImageAreaClick}
                        className="flex flex-col items-center justify-center w-full max-w-md border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 transition-colors bg-gray-50 p-8"
                      >
                        <ImageIcon className="w-12 h-12 text-gray-400 mb-3" />
                        <p className="text-sm text-gray-500 text-center mb-1">Klik untuk upload gambar</p>
                        <p className="text-xs text-gray-400 text-center">Format: JPG, PNG, GIF - Maksimal 2MB</p>
                        <input 
                          ref={fileInputRef}
                          type="file" 
                          className="hidden" 
                          accept="image/*"
                          onChange={handleImageChange}
                          disabled={loading}
                        />
                      </div>
                    </div>

                    {/* Preview Area - Hanya Tampil Jika Ada Gambar */}
                    {imagePreview && (
                      <div className="text-center mt-4">
                        <div className="inline-block relative">
                          <img 
                            src={imagePreview} 
                            alt="Preview Gambar Kelas" 
                            className="w-48 h-48 object-cover rounded-lg border border-gray-300 shadow-sm"
                          />
                          <button
                            type="button"
                            onClick={handleRemoveImage}
                            className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="text-gray-500 text-sm mt-2">Preview Gambar Kelas</div>
                      </div>
                    )}
                  </div>

                  {/* Name Input */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nama Kelas *
                    </label>
                    <input
                      type="text"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleInputChange}
                      disabled={loading}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 disabled:opacity-50 bg-white"
                      placeholder="Masukkan nama kelas"
                    />
                  </div>
                  
                  {/* Description Input */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Deskripsi *
                    </label>
                    <textarea
                      name="description"
                      required
                      value={formData.description}
                      onChange={handleInputChange}
                      rows={4}
                      disabled={loading}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 resize-none disabled:opacity-50 bg-white"
                      placeholder="Deskripsi singkat tentang kelas"
                    />
                  </div>

                  {/* Category Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Kategori *
                    </label>
                    <select
                      name="categoryId"
                      required
                      value={formData.categoryId}
                      onChange={handleInputChange}
                      disabled={loading}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 disabled:opacity-50 bg-white"
                    >
                      <option value="">Pilih Kategori</option>
                      {categories.map(category => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex gap-3 justify-end mt-8 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateModal(false)
                      resetForm()
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
                      editingClass ? 'Simpan Perubahan' : 'Buat Kelas'
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
                Apakah Anda yakin ingin menghapus kelas <span className="font-semibold text-gray-900">`{showDeleteConfirm.className}`</span>? Tindakan ini tidak dapat dibatalkan.
              </p>

              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setShowDeleteConfirm({ show: false, classId: null, className: '' })}
                  disabled={loading}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors font-medium disabled:opacity-50"
                >
                  Batal
                </button>
                <button
                  onClick={() => showDeleteConfirm.classId && handleDeleteClass(showDeleteConfirm.classId)}
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