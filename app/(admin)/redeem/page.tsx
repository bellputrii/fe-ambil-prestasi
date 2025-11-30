/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import LayoutNavbar from '@/components/public/LayoutNavbar'
import Footer from '@/components/public/Footer'
import { Plus, Edit, Trash2, ArrowLeft, Search, Copy, CheckCircle2, XCircle, X, CheckCircle, AlertTriangle, Ticket, Calendar } from 'lucide-react'

interface RedeemCode {
  id: number;
  code: string;
  durationDays: number;
  maxUses: number;
  usedCount: number;
  expiresAt: string | null;
  createdAt: string;
  updatedAt: string;
}

interface ApiResponseRedeemCodes {
  success: boolean;
  message: string;
  data: RedeemCode[];
  meta: {
    totalItems: number;
    itemsPerPage: number;
    totalPages: number;
    currentPage: number;
  };
}

interface CreateRedeemCodeResponse {
  success: boolean;
  message: string;
  data: {
    code: string;
    durationDays: number;
    maxUses: number;
    expiresAt: string | null;
    message: string;
  };
}

export default function RedeemCodePage() {
  const router = useRouter()
  const [redeemCodes, setRedeemCodes] = useState<RedeemCode[]>([])
  const [filteredCodes, setFilteredCodes] = useState<RedeemCode[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [copiedCode, setCopiedCode] = useState<string | null>(null)

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingRedeemCode, setEditingRedeemCode] = useState<RedeemCode | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<{show: boolean, codeId: number | null, code: string}>({
    show: false,
    codeId: null,
    code: ''
  })

  // Message states
  const [messageSuccess, setMessageSuccess] = useState<string | null>(null)
  const [messageFailed, setMessageFailed] = useState<string | null>(null)

  // Form state - DIPERBARUI dengan expiresAt
  const [formData, setFormData] = useState({
    durationDays: 30,
    maxUses: 1,
    expiresAt: '' // Format: YYYY-MM-DDTHH:mm
  })

  const isCodeActive = (code: RedeemCode) => {
    const isExpired = code.expiresAt ? new Date(code.expiresAt) < new Date() : false
    return !isExpired && code.usedCount < code.maxUses
  }

  // Usage status helper (label + badge color)
  const getRedeemStatus = (code: RedeemCode) => {
    const expired = code.expiresAt ? new Date(code.expiresAt) < new Date() : false
    if (expired) return { label: 'Kadaluarsa', badge: 'bg-gray-100 text-gray-800 border border-gray-300' }
    if (code.usedCount === 0) return { label: 'Belum Terpakai', badge: 'bg-blue-100 text-blue-800 border border-blue-200' }
    if (code.usedCount < code.maxUses) return { label: 'Sebagian digunakan', badge: 'bg-yellow-100 text-yellow-800 border border-yellow-200' }
    return { label: 'Terpakai', badge: 'bg-red-100 text-red-800 border border-red-200' }
  }

  // Stats calculation
  const stats = [
    { 
      value: redeemCodes.length.toString(), 
      label: 'Total Kode', 
      icon: <Ticket className="w-4 h-4" />,
      color: 'bg-purple-500'
    },
    { 
      value: redeemCodes.filter(code => isCodeActive(code)).length.toString(), 
      label: 'Kode Aktif', 
      icon: <CheckCircle className="w-4 h-4" />,
      color: 'bg-green-500'
    },
    { 
      value: redeemCodes.reduce((sum, code) => sum + code.usedCount, 0).toString(), 
      label: 'Total Ditukar', 
      icon: <CheckCircle2 className="w-4 h-4" />,
      color: 'bg-blue-500'
    },
  ]

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

  // Filter codes when searchTerm or redeemCodes change
  useEffect(() => {
    let result = redeemCodes;
    
    if (searchTerm.trim()) {
      const query = searchTerm.toLowerCase();
      result = result.filter(code => 
        code.code.toLowerCase().includes(query)
      );
    }
    
    setFilteredCodes(result);
  }, [searchTerm, redeemCodes])

  const fetchRedeemCodes = async () => {
    try {
      setLoading(true)
      setError(null)
      const token = localStorage.getItem("token")
      
      if (!token) {
        setError('Token tidak ditemukan. Silakan login kembali.')
        setLoading(false)
        return
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/redeem/admin`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
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

      const data: ApiResponseRedeemCodes = await response.json()
      if (data.success) {
        setRedeemCodes(data.data)
      } else {
        throw new Error('Gagal memuat data redeem code')
      }
    } catch (err) {
      console.error('Error fetching redeem codes:', err)
      setError('Gagal memuat data redeem code. Silakan coba lagi.')
      setMessageFailed('Gagal memuat data redeem code')
    } finally {
      setLoading(false)
    }
  }

  // Handle form input changes - DIPERBARUI untuk menangani expiresAt
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target
    
    if (type === 'datetime-local') {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: parseInt(value) || 0
      }))
    }
  }

  // Format date for datetime-local input
  const formatDateForInput = (dateString: string | null) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toISOString().slice(0, 16) // Format: YYYY-MM-DDTHH:mm
  }

  // Reset form
  const resetForm = () => {
    setFormData({
      durationDays: 30,
      maxUses: 1,
      expiresAt: ''
    })
    setEditingRedeemCode(null)
  }

  // Open create modal
  const handleCreateCode = () => {
    resetForm()
    setShowCreateModal(true)
  }

  // Open edit modal - DIPERBARUI untuk mengatur expiresAt
  const handleEditCode = (code: RedeemCode) => {
    setEditingRedeemCode(code)
    setFormData({
      durationDays: code.durationDays,
      maxUses: code.maxUses,
      expiresAt: formatDateForInput(code.expiresAt)
    })
    setShowCreateModal(true)
  }

  // Submit form (create or update) - DIPERBARUI untuk mengirim expiresAt
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validasi form
    if (formData.durationDays < 1 || formData.maxUses < 1) {
      setMessageFailed('Durasi dan maksimal penggunaan harus lebih dari 0')
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

      // Prepare request body
      const requestBody: any = {
        durationDays: formData.durationDays,
        maxUses: formData.maxUses,
      }

      // Only include expiresAt if it's provided
      if (formData.expiresAt) {
        // Convert to ISO string with milliseconds
        const date = new Date(formData.expiresAt)
        requestBody.expiresAt = date.toISOString()
      }

      const url = editingRedeemCode 
        ? `${process.env.NEXT_PUBLIC_API_URL}/redeem/admin/${editingRedeemCode.id}`
        : `${process.env.NEXT_PUBLIC_API_URL}/redeem/admin`

      const method = editingRedeemCode ? 'PATCH' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
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
        await fetchRedeemCodes()
        setShowCreateModal(false)
        resetForm()
        setMessageSuccess(editingRedeemCode ? 'Kode redeem berhasil diperbarui' : 'Kode redeem berhasil dibuat')
      } else {
        throw new Error(result.message || 'Failed to save redeem code')
      }
    } catch (error) {
      console.error('Error saving redeem code:', error)
      setMessageFailed(`Gagal menyimpan kode redeem: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  // Delete redeem code
  const handleDeleteCode = async (codeId: number) => {
    setLoading(true)
    try {
      const token = localStorage.getItem("token")
      
      if (!token) {
        setMessageFailed('Token tidak ditemukan. Silakan login kembali.')
        setLoading(false)
        return
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/redeem/admin/${codeId}`, {
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
        await fetchRedeemCodes()
        setMessageSuccess('Kode redeem berhasil dihapus')
      } else {
        throw new Error(result.message || 'Failed to delete redeem code')
      }
    } catch (error) {
      console.error('Error deleting redeem code:', error)
      setMessageFailed(`Gagal menghapus kode redeem: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
      setShowDeleteConfirm({ show: false, codeId: null, code: '' })
    }
  }

  // Open delete confirmation
  const openDeleteConfirm = (codeId: number, code: string) => {
    setShowDeleteConfirm({
      show: true,
      codeId,
      code
    })
  }

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code)
    setCopiedCode(code)
    setTimeout(() => setCopiedCode(null), 2000)
  }

  useEffect(() => {
    fetchRedeemCodes()
  }, [])

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
            <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4">
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span className="text-sm">Kembali</span>
                  </button>
                  <button 
                    onClick={handleCreateCode}
                    disabled={loading}
                    className="bg-purple-600 text-white px-3 py-2 rounded-lg font-semibold transition-colors hover:bg-purple-700 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                  >
                    <Plus className="w-4 h-4" />
                    <span className="hidden sm:inline">Buat Kode Baru</span>
                    <span className="sm:hidden">Baru</span>
                  </button>
                </div>
                
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Kelola Redeem Code</h1>
                  <p className="text-gray-600 text-sm mt-1">Buat dan kelola kode redeem untuk akses kelas premium</p>
                </div>

                {/* Error State */}
                {error && !loading && (
                  <div className="bg-yellow-500 border border-yellow-600 rounded-lg p-3">
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
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {stats.map((stat, index) => (
                    <div
                      key={index}
                      className="bg-white rounded-lg p-2 border border-gray-200 shadow-sm"
                    >
                      <div className="flex items-center gap-2">
                        <div className={`p-1.5 rounded-lg text-white ${stat.color}`}>
                          {stat.icon}
                        </div>
                        <div>
                          <h3 className="text-base font-bold text-gray-900">{stat.value}</h3>
                          <p className="text-gray-600 text-xs">{stat.label}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4">
            {/* Search Section */}
            <div className="bg-white rounded-lg border border-gray-200 p-3 mb-4">
              <div className="flex flex-col gap-3">
                {/* Search Bar */}
                <div className="flex-1">
                  <div className="relative">
                    <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Cari kode redeem..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                    />
                  </div>
                </div>

                {/* Search Info */}
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span>Menampilkan:</span>
                  <span className="font-medium">
                    {searchTerm 
                      ? `${filteredCodes.length} hasil` 
                      : `${filteredCodes.length} kode`
                    }
                  </span>
                </div>
              </div>
            </div>

            {/* Redeem Codes - Mobile Card View */}
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
                <p className="text-gray-600 mt-2 text-sm">Memuat data redeem code...</p>
              </div>
            ) : (
              <div>
                {/* Mobile Card View */}
                <div className="lg:hidden space-y-3">
                  {filteredCodes.map((redeemCode) => {
                    const status = getRedeemStatus(redeemCode)
                    return (
                      <div key={redeemCode.id} className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                        {/* Header */}
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex items-center gap-2">
                            <div className="font-mono font-bold text-gray-900 text-base">
                              {redeemCode.code}
                            </div>
                            <button
                              onClick={() => copyToClipboard(redeemCode.code)}
                              className="text-gray-400 hover:text-gray-600 transition-colors"
                              disabled={loading}
                            >
                              {copiedCode === redeemCode.code ? (
                                <CheckCircle2 className="w-4 h-4 text-green-500" />
                              ) : (
                                <Copy className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                          <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${status.badge}`}>
                            {status.label}
                          </div>
                        </div>

                        {/* Details */}
                        <div className="grid grid-cols-2 gap-3 text-sm mb-3">
                          <div>
                            <span className="text-gray-500">Durasi:</span>
                            <div className="font-medium text-gray-900">{redeemCode.durationDays} hari</div>
                          </div>
                          <div>
                            <span className="text-gray-500">Penggunaan:</span>
                            <div className="font-medium text-gray-900">{redeemCode.usedCount}/{redeemCode.maxUses}</div>
                          </div>
                          <div className="col-span-2">
                            <span className="text-gray-500">Kadaluarsa:</span>
                            <div className="font-medium text-gray-900">
                              {redeemCode.expiresAt 
                                ? new Date(redeemCode.expiresAt).toLocaleDateString('id-ID', {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric'
                                  })
                                : 'Tidak ada'
                              }
                            </div>
                          </div>
                          <div className="col-span-2">
                            <span className="text-gray-500">Dibuat:</span>
                            <div className="font-medium text-gray-900">
                              {new Date(redeemCode.createdAt).toLocaleDateString('id-ID', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              })}
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2 pt-3 border-t border-gray-100">
                          <button
                            onClick={() => handleEditCode(redeemCode)}
                            disabled={loading}
                            className="flex-1 bg-blue-500 text-white py-2 px-3 rounded text-xs font-medium transition-colors hover:bg-blue-600 flex items-center justify-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Edit className="w-3 h-3" />
                            Edit
                          </button>
                          <button
                            onClick={() => openDeleteConfirm(redeemCode.id, redeemCode.code)}
                            disabled={loading}
                            className="flex-1 bg-gray-100 text-gray-700 py-2 px-3 rounded text-xs font-medium transition-colors hover:bg-red-500 hover:text-white flex items-center justify-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Trash2 className="w-3 h-3" />
                            Hapus
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* Desktop Table View */}
                <div className="hidden lg:block bg-white rounded-lg shadow overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Kode
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Durasi (Hari)
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Penggunaan
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Expires At
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Created At
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredCodes.map((redeemCode) => {
                        const status = getRedeemStatus(redeemCode)
                        return (
                          <tr key={redeemCode.id} className="hover:bg-gray-50">
                            <td className="px-4 py-4 whitespace-nowrap">
                              <div className="flex items-center gap-2">
                                <div className="text-sm font-mono font-medium text-gray-900">
                                  {redeemCode.code}
                                </div>
                                <button
                                  onClick={() => copyToClipboard(redeemCode.code)}
                                  className="text-gray-400 hover:text-gray-600 transition-colors"
                                  disabled={loading}
                                >
                                  {copiedCode === redeemCode.code ? (
                                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                                  ) : (
                                    <Copy className="w-4 h-4" />
                                  )}
                                </button>
                              </div>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap">
                              <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${status.badge}`}>
                                {status.label}
                              </div>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{redeemCode.durationDays}</div>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {redeemCode.usedCount} / {redeemCode.maxUses}
                              </div>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {redeemCode.expiresAt 
                                  ? new Date(redeemCode.expiresAt).toLocaleDateString('id-ID', {
                                      year: 'numeric',
                                      month: 'short',
                                      day: 'numeric',
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })
                                  : 'Tidak ada'
                                }
                              </div>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {new Date(redeemCode.createdAt).toLocaleDateString('id-ID', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </div>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleEditCode(redeemCode)}
                                  disabled={loading}
                                  className="bg-blue-500 text-white py-1 px-3 rounded text-xs font-medium transition-colors hover:bg-blue-600 flex items-center justify-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  <Edit className="w-3 h-3" />
                                  Edit
                                </button>
                                <button
                                  onClick={() => openDeleteConfirm(redeemCode.id, redeemCode.code)}
                                  disabled={loading}
                                  className="bg-gray-100 text-gray-700 py-1 px-3 rounded text-xs font-medium transition-colors hover:bg-red-500 hover:text-white flex items-center justify-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Empty State */}
                {filteredCodes.length === 0 && !loading && (
                  <div className="text-center py-8 bg-white rounded-lg border border-gray-200">
                    <Ticket className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <h3 className="text-base font-medium text-gray-900 mb-1">
                      {searchTerm ? 'Kode redeem tidak ditemukan' : 'Belum ada kode redeem'}
                    </h3>
                    <p className="text-gray-500 text-sm mb-4 max-w-md mx-auto">
                      {searchTerm 
                        ? `Tidak ada kode redeem yang sesuai dengan pencarian "${searchTerm}"` 
                        : 'Mulai dengan membuat kode redeem pertama untuk akses kelas premium'
                      }
                    </p>
                    {!searchTerm && (
                      <button 
                        onClick={handleCreateCode}
                        disabled={loading}
                        className="bg-purple-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors hover:bg-purple-700 flex items-center gap-2 mx-auto disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                      >
                        <Plus className="w-4 h-4" />
                        Buat Kode Pertama
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </LayoutNavbar>
      <Footer/>

      {/* Create/Edit Redeem Code Modal - DIPERBARUI dengan field expiresAt */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-3">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-hidden flex flex-col border border-gray-200 shadow-lg">
            <div className="flex justify-between items-center p-4 border-b border-gray-200 bg-white">
              <h3 className="text-lg font-bold text-gray-900">
                {editingRedeemCode ? 'Edit Kode Redeem' : 'Buat Kode Redeem Baru'}
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
                  {/* Show code if editing */}
                  {editingRedeemCode && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Kode Redeem
                      </label>
                      <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900 font-mono text-sm">
                        {editingRedeemCode.code}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Kode tidak dapat diubah
                      </p>
                    </div>
                  )}

                  {/* Usage info if editing */}
                  {editingRedeemCode && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Penggunaan Saat Ini
                      </label>
                      <div className="text-sm text-gray-900 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                        <div className="font-medium">Sudah digunakan: {editingRedeemCode.usedCount} kali</div>
                        <div className="text-xs text-yellow-700 mt-1">
                          {editingRedeemCode.usedCount >= editingRedeemCode.maxUses 
                            ? 'Kode sudah mencapai batas penggunaan maksimal'
                            : `Masih dapat digunakan ${editingRedeemCode.maxUses - editingRedeemCode.usedCount} kali lagi`
                          }
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Durasi (Hari) *
                      </label>
                      <input
                        type="number"
                        name="durationDays"
                        required
                        value={formData.durationDays}
                        onChange={handleInputChange}
                        disabled={loading}
                        min="1"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 disabled:opacity-50 bg-white text-sm"
                        placeholder="Masukkan durasi dalam hari"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Durasi akses premium dalam hari
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Maksimal Penggunaan *
                      </label>
                      <input
                        type="number"
                        name="maxUses"
                        required
                        value={formData.maxUses}
                        onChange={handleInputChange}
                        disabled={loading}
                        min="1"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 disabled:opacity-50 bg-white text-sm"
                        placeholder="Masukkan maksimal penggunaan"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Jumlah maksimal penggunaan kode
                      </p>
                    </div>
                  </div>

                  {/* Expires At Field - BARU */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tanggal Kadaluarsa
                    </label>
                    <div className="relative">
                      <Calendar className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                      <input
                        type="datetime-local"
                        name="expiresAt"
                        value={formData.expiresAt}
                        onChange={handleInputChange}
                        disabled={loading}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 disabled:opacity-50 bg-white text-sm"
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Kosongkan jika kode tidak memiliki tanggal kadaluarsa
                    </p>
                  </div>

                  {/* Additional Info */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <div className="flex items-start gap-2">
                      <Ticket className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="text-sm font-medium text-blue-900">Informasi Kode Redeem</h4>
                        <ul className="text-xs text-blue-700 mt-1 space-y-1">
                          <li>• Kode akan digenerate otomatis oleh sistem</li>
                          <li>• Setiap kode dapat digunakan untuk satu user</li>
                          <li>• Kode berlaku sampai mencapai batas penggunaan atau tanggal kadaluarsa</li>
                        </ul>
                      </div>
                    </div>
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
                    className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                        Menyimpan...
                      </>
                    ) : (
                      editingRedeemCode ? 'Simpan Perubahan' : 'Buat Kode'
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-3">
          <div className="bg-white rounded-lg max-w-sm w-full border border-gray-200 shadow-lg">
            <div className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="bg-red-100 p-2 rounded-full">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                </div>
                <h3 className="text-base font-bold text-gray-900">Konfirmasi Hapus</h3>
              </div>
              
              <p className="text-gray-600 text-sm mb-4">
                Apakah Anda yakin ingin menghapus kode redeem <span className="font-mono font-semibold text-gray-900">`{showDeleteConfirm.code}`</span>? Tindakan ini tidak dapat dibatalkan.
              </p>

              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => setShowDeleteConfirm({ show: false, codeId: null, code: '' })}
                  disabled={loading}
                  className="px-3 py-2 text-gray-600 hover:text-gray-800 transition-colors font-medium disabled:opacity-50 text-sm"
                >
                  Batal
                </button>
                <button
                  onClick={() => showDeleteConfirm.codeId && handleDeleteCode(showDeleteConfirm.codeId)}
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