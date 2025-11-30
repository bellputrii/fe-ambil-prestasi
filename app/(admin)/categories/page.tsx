/* eslint-disable @next/next/no-img-element */
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import LayoutNavbar from '@/components/public/LayoutNavbar'
import { Plus, Edit, Trash2, BookOpen, X, CheckCircle, XCircle, AlertTriangle, Filter, Search } from 'lucide-react'
import Footer from '@/components/public/Footer'

interface Category {
  id: number;
  name: string;
}

interface ApiResponse {
  success: boolean;
  message: string;
  data: Category[];
}

export default function CategoriesManagement() {
  const router = useRouter()
  const [categories, setCategories] = useState<Category[]>([])
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState({
    name: ''
  })
  const [error, setError] = useState<string | null>(null)
  
  // State untuk message feedback
  const [messageSuccess, setMessageSuccess] = useState<string | null>(null)
  const [messageFailed, setMessageFailed] = useState<string | null>(null)
  const [messageWarning, setMessageWarning] = useState<string | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<{show: boolean, categoryId: number | null, categoryName: string}>({
    show: false,
    categoryId: null,
    categoryName: ''
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

  // Filter categories when searchQuery or categories change
  useEffect(() => {
    let result = categories;
    
    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(category => 
        category.name.toLowerCase().includes(query)
      );
    }
    
    setFilteredCategories(result);
  }, [searchQuery, categories])

  // Fetch categories from API
  const fetchCategories = async () => {
    try {
      setLoading(true)
      
      // Ambil token dari localStorage
      const token = localStorage.getItem("token")
      
      if (!token) {
        setError('Token tidak ditemukan. Silakan login kembali.')
        setLoading(false)
        return
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/categories`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        if (response.status === 401) {
          // Token expired atau invalid
          localStorage.removeItem("token")
          setError('Sesi telah berakhir. Silakan login kembali.')
          setTimeout(() => router.push('/auth/login'), 2000)
          return
        }
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const result: ApiResponse = await response.json()
      
      if (result.success && result.data) {
        setCategories(result.data)
        setError(null)
      } else {
        throw new Error(result.message || 'Gagal memuat data categories')
      }
    } catch (err) {
      console.error('Error fetching categories:', err)
      setError('Gagal memuat data categories. Silakan coba lagi.')
      setMessageFailed('Gagal memuat data categories')
      // Fallback ke data statis jika API error
      setCategories(getFallbackCategories())
    } finally {
      setLoading(false)
    }
  }

  // Fallback data jika API error
  const getFallbackCategories = (): Category[] => [
    {
      id: 1,
      name: 'Essay'
    },
    {
      id: 2,
      name: 'Business Plan'
    },
    {
      id: 3,
      name: 'Penelitian'
    },
    {
      id: 4,
      name: 'Desain'
    }
  ]

  useEffect(() => {
    fetchCategories()
  }, [])

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  // Reset form
  const resetForm = () => {
    setFormData({
      name: ''
    })
    setEditingCategory(null)
  }

  // Open create modal
  const handleCreateCategory = () => {
    resetForm()
    setShowCreateModal(true)
  }

  // Open edit modal
  const handleEditCategory = (category: Category) => {
    setEditingCategory(category)
    setFormData({
      name: category.name
    })
    setShowCreateModal(true)
  }

  // Submit form (create or update)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validasi form
    if (!formData.name.trim()) {
      setMessageFailed('Harap isi nama kategori')
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

      // Format data untuk API (application/x-www-form-urlencoded)
      const urlencoded = new URLSearchParams()
      urlencoded.append('name', formData.name.trim())

      const url = editingCategory 
        ? `${process.env.NEXT_PUBLIC_API_URL}/categories/${editingCategory.id}`
        : `${process.env.NEXT_PUBLIC_API_URL}/categories`

      const method = editingCategory ? 'PATCH' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: urlencoded
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
        await fetchCategories()
        setShowCreateModal(false)
        resetForm()
        setMessageSuccess(editingCategory ? 'Category berhasil diperbarui' : 'Category berhasil dibuat')
      } else {
        throw new Error(result.message || 'Failed to save category')
      }
    } catch (error) {
      console.error('Error saving category:', error)
      setMessageFailed(`Gagal menyimpan category: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }



  // Delete category
  // Auto hide messages after 5 seconds
useEffect(() => {
  if (messageSuccess || messageFailed || messageWarning) {
    const timer = setTimeout(() => {
      setMessageSuccess(null)
      setMessageFailed(null)
      setMessageWarning(null)
    }, 5000)
    return () => clearTimeout(timer)
  }
}, [messageSuccess, messageFailed, messageWarning])



    // Modifikasi fungsi handleDeleteCategory
    const handleDeleteCategory = async (categoryId: number) => {
      setLoading(true)
      try {
        const token = localStorage.getItem("token")
        
        if (!token) {
          setMessageFailed('Token tidak ditemukan. Silakan login kembali.')
          setLoading(false)
          return
        }

        const urlencoded = new URLSearchParams()

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/categories/${categoryId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          body: urlencoded
        })

        const result = await response.json()
        
        if (!response.ok) {
          if (response.status === 401) {
            localStorage.removeItem("token")
            setMessageFailed('Sesi telah berakhir. Silakan login kembali.')
            setTimeout(() => router.push('/auth/login'), 2000)
            return
          }
          
          // Handle case where category cannot be deleted due to existing classes
          if (result.success === false && result.data && result.data.totalClasses > 0) {
            const classNames = result.data.classes.map((cls: any) => cls.name).join(', ')
            const classCount = result.data.totalClasses
            const classText = classCount === 1 ? 'kelas' : 'kelas-kelas'
            
            setMessageWarning(
              `Tidak dapat menghapus category "${showDeleteConfirm.categoryName}". Category ini sedang digunakan oleh ${classCount} ${classText}: ${classNames}. Harap hapus atau pindahkan ${classCount === 1 ? 'kelas tersebut' : 'kelas-kelas tersebut'} terlebih dahulu.`
            )
            setShowDeleteConfirm({ show: false, categoryId: null, categoryName: '' })
            setLoading(false)
            return
          }
          
          throw new Error(result.message || `HTTP error! status: ${response.status}`)
        }

        if (result.success) {
          await fetchCategories()
          setMessageSuccess('Category berhasil dihapus')
        } else {
          throw new Error(result.message || 'Failed to delete category')
        }
      } catch (error) {
        console.error('Error deleting category:', error)
        setMessageFailed(`Gagal menghapus category: ${error instanceof Error ? error.message : 'Unknown error'}`)
      } finally {
        setLoading(false)
        setShowDeleteConfirm({ show: false, categoryId: null, categoryName: '' })
      }
    }

  // Open delete confirmation
  const openDeleteConfirm = (categoryId: number, categoryName: string) => {
    setShowDeleteConfirm({
      show: true,
      categoryId,
      categoryName
    })
  }

  return (
    <>
      <LayoutNavbar>
        {/* Success Message */}
        {messageSuccess && (
          <div className="fixed top-4 right-4 z-50">
            <div className="bg-green-600 border border-green-700 rounded-lg p-4 shadow-lg max-w-sm">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-white" />
                <div>
                  <p className="text-white font-medium text-sm">{messageSuccess}</p>
                </div>
                <button 
                  onClick={() => setMessageSuccess(null)}
                  className="text-white hover:text-green-200 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {messageFailed && (
          <div className="fixed top-4 right-4 z-50">
            <div className="bg-red-600 border border-red-700 rounded-lg p-4 shadow-lg max-w-sm">
              <div className="flex items-center gap-3">
                <XCircle className="w-5 h-5 text-white" />
                <div>
                  <p className="text-white font-medium text-sm">{messageFailed}</p>
                </div>
                <button 
                  onClick={() => setMessageFailed(null)}
                  className="text-white hover:text-red-200 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="min-h-screen bg-gray-50 pt-16">
          {/* Header Section */}
          <div className="bg-white border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div>
                  <h1 className="text-xl md:text-2xl font-bold text-gray-900">Kelola Categories</h1>
                  <p className="text-gray-600 text-sm mt-1">Kelola data categories untuk tugas</p>
                </div>
                <button 
                  onClick={handleCreateCategory}
                  disabled={loading}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors hover:bg-blue-700 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed w-full md:w-auto justify-center"
                >
                  <Plus className="w-4 h-4" />
                  Tambah Category
                </button>
              </div>

              {/* Error State */}
              {error && !loading && (
                <div className="mt-3 bg-yellow-500 border border-yellow-600 rounded-lg p-3">
                  <p className="text-white font-medium text-sm">{error}</p>
                  {error.includes('login kembali') && (
                    <button 
                      onClick={() => router.push('/auth/login')}
                      className="mt-2 bg-white text-yellow-600 px-3 py-1 rounded text-sm hover:bg-gray-100 transition-colors"
                    >
                      Login Kembali
                    </button>
                  )}
                </div>
              )}

              {/* Stats Cards */}
              <div className="grid grid-cols-1 gap-3 mt-4">
                <div className="bg-white rounded-lg p-3 border border-gray-200 shadow-sm">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg text-white bg-blue-500">
                      <BookOpen className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">{categories.length}</h3>
                      <p className="text-gray-600 text-xs">Total Categories</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
            {/* Search Section */}
            <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
                {/* Search Bar */}
                <div className="flex-1">
                  <div className="relative">
                    <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Cari category..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Filter Info */}
              <div className="mt-3 flex items-center gap-2 text-sm text-gray-600">
                <Filter className="w-4 h-4" />
                <span>Menampilkan:</span>
                <span className="font-medium">
                  {filteredCategories.length} dari {categories.length} categories
                </span>
                {searchQuery && (
                  <>
                    <span>•</span>
                    <span>Pencarian: `{searchQuery}`</span>
                  </>
                )}
              </div>
            </div>

            {/* Categories Grid */}
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-600 mt-2 text-sm">Memuat data categories...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredCategories.map((category) => (
                  <div 
                    key={category.id}
                    className="bg-white rounded-lg border border-gray-200 overflow-hidden transition-colors hover:border-blue-300"
                  >
                    <div className="p-4">
                      {/* Category Header */}
                      <div className="flex items-start gap-3 mb-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <BookOpen className="w-6 h-6 text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-gray-900 text-lg">
                            {category.name}
                          </h3>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-gray-500">ID: {category.id}</span>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2 pt-3 border-t border-gray-100">
                        <button 
                          onClick={() => handleEditCategory(category)}
                          disabled={loading}
                          className="flex-1 bg-blue-500 text-white py-2 px-3 rounded text-sm font-medium transition-colors hover:bg-blue-600 flex items-center justify-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Edit className="w-3 h-3" />
                          Edit
                        </button>
                        <button 
                          onClick={() => openDeleteConfirm(category.id, category.name)}
                          disabled={loading}
                          className="bg-gray-100 text-gray-700 py-2 px-3 rounded text-sm font-medium transition-colors hover:bg-red-500 hover:text-white flex items-center justify-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Empty State */}
            {filteredCategories.length === 0 && !loading && (
              <div className="text-center py-8 bg-white rounded-lg border border-gray-200">
                <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <h3 className="text-base font-medium text-gray-900 mb-1">
                  {!searchQuery ? 'Belum ada categories' : 'Category tidak ditemukan'}
                </h3>
                <p className="text-gray-500 text-sm mb-4 max-w-md mx-auto">
                  {!searchQuery 
                    ? 'Mulai dengan menambahkan category pertama untuk mengelola jenis tugas' 
                    : `Tidak ada category yang sesuai dengan pencarian "${searchQuery}"`
                  }
                </p>
                <button 
                  onClick={handleCreateCategory}
                  disabled={loading}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors hover:bg-blue-700 flex items-center gap-2 mx-auto disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  <Plus className="w-4 h-4" />
                  Tambah Category Pertama
                </button>
              </div>
            )}
          </div>
        </div>
      </LayoutNavbar>
      <Footer/>

      {/* Create/Edit Category Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-hidden flex flex-col border border-gray-200 shadow-lg">
            <div className="flex justify-between items-center p-4 border-b border-gray-200 bg-white">
              <h3 className="text-lg font-bold text-gray-900">
                {editingCategory ? 'Edit Category' : 'Tambah Category Baru'}
              </h3>
              <button 
                onClick={() => {
                  setShowCreateModal(false)
                  resetForm()
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                disabled={loading}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              <form onSubmit={handleSubmit} className="p-4">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nama Category *
                    </label>
                    <input
                      type="text"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleInputChange}
                      disabled={loading}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 disabled:opacity-50 bg-white text-sm"
                      placeholder="Masukkan nama category"
                    />
                  </div>
                </div>

                <div className="flex gap-2 justify-end mt-6 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateModal(false)
                      resetForm()
                    }}
                    disabled={loading}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors font-medium disabled:opacity-50 text-sm"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                        Menyimpan...
                      </>
                    ) : (
                      editingCategory ? 'Simpan' : 'Tambah'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Warning Message */}
      {messageWarning && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-yellow-500 border border-yellow-700 rounded-lg p-4 shadow-lg max-w-sm">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-white" />
              <div>
                <p className="text-white font-medium text-sm">{messageWarning}</p>
              </div>
              <button 
                onClick={() => setMessageWarning(null)}
                className="text-white hover:text-yellow-200 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm.show && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-sm w-full border border-gray-200 shadow-lg">
            <div className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="bg-red-100 p-2 rounded-full">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                </div>
                <h3 className="text-base font-bold text-gray-900">Konfirmasi Hapus</h3>
              </div>
              
              <p className="text-gray-600 text-sm mb-4">
                Apakah Anda yakin ingin menghapus category <span className="font-semibold text-gray-900">`{showDeleteConfirm.categoryName}`</span>? Tindakan ini tidak dapat dibatalkan.
              </p>

              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => setShowDeleteConfirm({ show: false, categoryId: null, categoryName: '' })}
                  disabled={loading}
                  className="px-3 py-2 text-gray-600 hover:text-gray-800 transition-colors font-medium disabled:opacity-50 text-sm"
                >
                  Batal
                </button>
                <button
                  onClick={() => showDeleteConfirm.categoryId && handleDeleteCategory(showDeleteConfirm.categoryId)}
                  disabled={loading}
                  className="bg-red-600 text-white px-3 py-2 rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                      Menghapus...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-3 h-3" />
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