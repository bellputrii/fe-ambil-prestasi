/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import LayoutNavbar from '@/components/public/LayoutNavbar'
import { ArrowLeft, Plus, Edit, Trash2, FileText, CheckCircle, XCircle, AlertTriangle, BookOpen, Check, X, HelpCircle, Hash } from 'lucide-react'
import Footer from '@/components/public/Footer'

interface QuizAnswer {
  id: number;
  answer: string;
  is_correct: boolean;
  createdAt?: string;
  updatedAt?: string;
  questionId: number;
}

interface QuizQuestion {
  id: number;
  question: string;
  type: string;
  points: number;
  createdAt?: string;
  updatedAt?: string;
  quizId: number;
  quiz_answer: QuizAnswer[];
}

interface Quiz {
  id: number;
  title: string;
  description: string;
}

interface ApiResponse {
  success: boolean
  data: any
  message?: string
}

export default function QuestionsPage() {
  const params = useParams()
  const router = useRouter()
  const classId = params.id as string
  const sectionId = params.sectionId as string
  const materialId = params.materialId as string
  const quizId = params.quizId as string

  const [questions, setQuestions] = useState<QuizQuestion[]>([])
  const [quiz, setQuiz] = useState<Quiz | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showQuestionModal, setShowQuestionModal] = useState(false)
  const [editingQuestion, setEditingQuestion] = useState<QuizQuestion | null>(null)
  const [questionForm, setQuestionForm] = useState({
    question: '',
    type: 'MultipleChoice',
    points: 5,
    answers: [
      { answer: '', is_correct: false },
      { answer: '', is_correct: false },
      { answer: '', is_correct: false }
    ]
  })
  
  // State untuk message feedback dengan z-[100]
  const [messageSuccess, setMessageSuccess] = useState<string | null>(null)
  const [messageFailed, setMessageFailed] = useState<string | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<{show: boolean, questionId: number | null, questionText: string}>({
    show: false,
    questionId: null,
    questionText: ''
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

  // Fetch quiz data
  const fetchQuizData = async () => {
    try {
      const token = localStorage.getItem("token")
      
      if (!token) {
        setError('Token tidak ditemukan. Silakan login kembali.')
        return
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/classes/sections/materials/${materialId}/quizzes/${quizId}`, {
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
        setQuiz(result.data)
        setError(null)
      } else {
        throw new Error(result.message || 'Gagal memuat data quiz')
      }
    } catch (err) {
      console.error('Error fetching quiz data:', err)
      setError('Gagal memuat data quiz. Silakan coba lagi.')
      setMessageFailed('Gagal memuat data quiz')
    }
  }

  // Fetch questions
  const fetchQuestions = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem("token")
      
      if (!token) {
        setError('Token tidak ditemukan. Silakan login kembali.')
        setLoading(false)
        return
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/classes/sections/materials/${materialId}/quizzes/${quizId}/questions`, {
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
        setQuestions(result.data || [])
        setError(null)
      } else {
        throw new Error(result.message || 'Gagal memuat data questions')
      }
    } catch (err) {
      console.error('Error fetching questions:', err)
      setError('Gagal memuat data questions. Silakan coba lagi.')
      setMessageFailed('Gagal memuat data questions')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (quizId) {
      fetchQuizData()
      fetchQuestions()
    } 
  }, [quizId])

  // Reset question form
  const resetQuestionForm = () => {
    setQuestionForm({
      question: '',
      type: 'MultipleChoice',
      points: 5,
      answers: [
        { answer: '', is_correct: false },
        { answer: '', is_correct: false },
        { answer: '', is_correct: false }
      ]
    })
    setEditingQuestion(null)
  }

  // Open create question modal
  const handleCreateQuestion = () => {
    resetQuestionForm()
    setShowQuestionModal(true)
  }

  // Open edit question modal
  const handleEditQuestion = (question: QuizQuestion) => {
    setEditingQuestion(question)
    setQuestionForm({
      question: question.question,
      type: question.type,
      points: question.points,
      answers: question.quiz_answer.map((answer: QuizAnswer) => ({
        answer: answer.answer,
        is_correct: answer.is_correct
      }))
    })
    setShowQuestionModal(true)
  }

  // Handle question form input changes
  const handleQuestionInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setQuestionForm(prev => ({
      ...prev,
      [name]: value
    }))
  }

  // Handle answer input changes
  const handleAnswerChange = (index: number, field: string, value: string | boolean) => {
    setQuestionForm(prev => ({
      ...prev,
      answers: prev.answers.map((answer, i) => 
        i === index ? { ...answer, [field]: value } : answer
      )
    }))
  }

  // Add new answer option
  const addAnswer = () => {
    setQuestionForm(prev => ({
      ...prev,
      answers: [...prev.answers, { answer: '', is_correct: false }]
    }))
  }

  // Remove answer option
  const removeAnswer = (index: number) => {
    if (questionForm.answers.length > 2) {
      setQuestionForm(prev => ({
        ...prev,
        answers: prev.answers.filter((_, i) => i !== index)
      }))
    }
  }

  // Set correct answer (only one for MultipleChoice)
  const setCorrectAnswer = (index: number) => {
    setQuestionForm(prev => ({
      ...prev,
      answers: prev.answers.map((answer, i) => ({
        ...answer,
        is_correct: i === index
      }))
    }))
  }

  // Submit question form (create atau update)
  const handleSubmitQuestion = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validasi
    if (!questionForm.question.trim()) {
      setMessageFailed('Pertanyaan wajib diisi')
      return
    }

    // Validasi harus ada jawaban benar
    const hasCorrectAnswer = questionForm.answers.some(answer => answer.is_correct)
    if (!hasCorrectAnswer) {
      setMessageFailed('Harus ada minimal satu jawaban yang benar')
      return
    }

    // Validasi semua jawaban harus diisi
    const hasEmptyAnswers = questionForm.answers.some(answer => !answer.answer.trim())
    if (hasEmptyAnswers) {
      setMessageFailed('Semua jawaban harus diisi')
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

      const payload = {
        question: questionForm.question.trim(),
        type: questionForm.type,
        points: Number(questionForm.points),
        answers: questionForm.answers.map(answer => ({
          answer: answer.answer.trim(),
          is_correct: answer.is_correct
        }))
      }

      let url = ''
      let method = ''

      if (!editingQuestion) {
        // CREATE
        url = `${process.env.NEXT_PUBLIC_API_URL}/classes/sections/materials/${materialId}/quizzes/${quizId}/questions`
        method = 'POST'
      } else {
        // UPDATE
        url = `${process.env.NEXT_PUBLIC_API_URL}/classes/sections/materials/${materialId}/quizzes/questions/${editingQuestion.id}`
        method = 'PUT'
      }

      const response = await fetch(url, {
        method,
        headers: { 
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload),
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

      const result: ApiResponse = await response.json()
      
      if (result.success) {
        await fetchQuestions()
        setShowQuestionModal(false)
        resetQuestionForm()
        setMessageSuccess(editingQuestion ? 'Question berhasil diperbarui' : 'Question berhasil dibuat')
      } else {
        throw new Error(result.message || 'Failed to save question')
      }
    } catch (error) {
      console.error('Error saving question:', error)
      setMessageFailed(`Gagal menyimpan question: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  // Delete question
  const handleDeleteQuestion = async (questionId: number) => {
    setLoading(true)
    try {
      const token = localStorage.getItem("token")
      
      if (!token) {
        setMessageFailed('Token tidak ditemukan. Silakan login kembali.')
        setLoading(false)
        return
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/classes/sections/materials/${materialId}/quizzes/questions/${questionId}`, {
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

      const result: ApiResponse = await response.json()
      
      if (result.success) {
        await fetchQuestions()
        setMessageSuccess('Question berhasil dihapus')
      } else {
        throw new Error(result.message || 'Failed to delete question')
      }
    } catch (error) {
      console.error('Error deleting question:', error)
      setMessageFailed(`Gagal menghapus question: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
      setShowDeleteConfirm({ show: false, questionId: null, questionText: '' })
    }
  }

  // Open delete confirmation
  const openDeleteConfirm = (questionId: number, questionText: string) => {
    setShowDeleteConfirm({
      show: true,
      questionId,
      questionText: questionText.length > 50 ? questionText.substring(0, 50) + '...' : questionText
    })
  }

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading && !quiz) {
    return (
      <LayoutNavbar>
        <div className="flex items-center justify-center min-h-screen bg-white">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </LayoutNavbar>
    )
  }

  if (!quiz) {
    return (
      <LayoutNavbar>
        <div className="flex flex-col items-center justify-center min-h-screen bg-white">
          <FileText className="w-16 h-16 text-gray-300 mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Quiz tidak ditemukan</h2>
          <p className="text-gray-600 mb-4">Quiz yang Anda cari tidak ditemukan</p>
          <button 
            onClick={() => router.push(`/classes/${classId}/sections/${sectionId}/materials/${materialId}/quizzes`)}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Kembali ke Quiz
          </button>
        </div>
      </LayoutNavbar>
    )
  }

  return (
    <>
      <LayoutNavbar>
        {/* Success Message dengan z-[100] dan mx-4 untuk mobile */}
        {messageSuccess && (
          <div className="fixed top-4 right-4 z-[100] animate-in slide-in-from-right duration-300 mx-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 shadow-lg max-w-sm">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-green-800 font-medium text-sm break-words">{messageSuccess}</p>
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

        {/* Error Message dengan z-[100] dan mx-4 untuk mobile */}
        {messageFailed && (
          <div className="fixed top-4 right-4 z-[100] animate-in slide-in-from-right duration-300 mx-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 shadow-lg max-w-sm">
              <div className="flex items-center gap-3">
                <XCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-red-800 font-medium text-sm break-words">{messageFailed}</p>
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

        <div className="min-h-screen bg-gray-50">
          <div className="px-4 sm:px-6 lg:px-8 pt-16 md:pt-20">
            {/* Header Section */}
            <div className="max-w-7xl mx-auto mb-8">
              <div className="flex items-center gap-4 mb-6">
                <button 
                  onClick={() => router.push(`/classes/${classId}/sections/${sectionId}/materials/${materialId}/quizzes`)}
                  className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                  <span className="text-sm sm:text-base">Kembali ke Quiz</span>
                </button>
              </div>

              {/* Error State */}
              {error && !loading && (
                <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <p className="text-yellow-700 font-medium text-sm sm:text-base break-words">{error}</p>
                    {error.includes('login kembali') && (
                      <button 
                        onClick={() => router.push('/login')}
                        className="bg-blue-700 text-white px-4 py-2 rounded-lg hover:bg-blue-800 transition-colors text-sm w-full sm:w-auto"
                      >
                        Login Kembali
                      </button>
                    )}
                  </div>
                </div>
              )}

              <div className="bg-white rounded-xl shadow-md border border-gray-200 p-4 sm:p-6">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-4">
                  <div className="flex-1 min-w-0">
                    <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-2 break-words">
                      Kelola Questions
                    </h1>
                    <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-sm text-gray-600">
                      <span className="flex items-center gap-1 break-words">
                        <BookOpen className="w-4 h-4 flex-shrink-0" />
                        Quiz: {quiz.title}
                      </span>
                      {quiz.description && (
                        <span className="text-gray-500 break-words">{quiz.description}</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Questions Section */}
            <div className="max-w-7xl mx-auto">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
                <div className="flex-1 min-w-0">
                  <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mb-1 sm:mb-2 break-words">
                    Daftar Questions
                  </h2>
                  <p className="text-gray-700 text-sm sm:text-base break-words">
                    Kelola questions untuk quiz `{quiz.title}`
                  </p>
                </div>
                <button 
                  onClick={handleCreateQuestion}
                  disabled={loading}
                  className="bg-green-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold transition-all duration-300 hover:scale-105 hover:shadow-lg active:scale-95 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto justify-center"
                >
                  <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="text-sm sm:text-base">Tambah Question</span>
                </button>
              </div>

              {loading ? (
                <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-gray-600 mt-4 text-sm sm:text-base">Memuat data questions...</p>
                </div>
              ) : (
                <div className="space-y-4 sm:space-y-6">
                  {questions.map((question, index) => (
                    <div 
                      key={question.id}
                      className="bg-white rounded-xl shadow-sm border border-gray-200 transition-all duration-300 hover:shadow-md hover:border-blue-300 group"
                    >
                      <div className="p-4 sm:p-6">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-4">
                          <div className="flex items-start gap-3 flex-1 min-w-0">
                            <div className="bg-blue-100 text-blue-600 rounded-lg p-2 mt-1 flex-shrink-0">
                              <HelpCircle className="w-5 h-5" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                                <h3 className="font-bold text-gray-900 text-base sm:text-lg break-words">
                                  {index + 1}. {question.question}
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                  <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs font-medium break-words">
                                    {question.type}
                                  </span>
                                  <span className="bg-green-100 text-green-600 px-2 py-1 rounded text-xs font-medium flex items-center gap-1 break-words">
                                    <Hash className="w-3 h-3" />
                                    {question.points} points
                                  </span>
                                </div>
                              </div>
                              
                              {/* Answers */}
                              <div className="space-y-2 mt-4">
                                {question.quiz_answer.map((answer, ansIndex) => (
                                  <div 
                                    key={answer.id}
                                    className={`flex items-center gap-3 p-3 rounded-lg border ${
                                      answer.is_correct 
                                        ? 'bg-green-50 border-green-200' 
                                        : 'bg-gray-50 border-gray-200'
                                    }`}
                                  >
                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                                      answer.is_correct 
                                        ? 'bg-green-500 text-white' 
                                        : 'bg-gray-300 text-gray-600'
                                    }`}>
                                      {String.fromCharCode(65 + ansIndex)}
                                    </div>
                                    <span className={`flex-1 break-words ${answer.is_correct ? 'text-green-800 font-medium' : 'text-gray-700'}`}>
                                      {answer.answer}
                                    </span>
                                    {answer.is_correct && (
                                      <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex gap-2 sm:ml-4 justify-end sm:justify-start">
                            <button 
                              onClick={() => handleEditQuestion(question)}
                              disabled={loading}
                              className="bg-blue-500 text-white p-2 rounded-lg transition-all duration-300 hover:bg-blue-600 hover:scale-105 active:scale-95 disabled:opacity-50 flex items-center justify-center"
                              title="Edit Question"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => openDeleteConfirm(question.id, question.question)}
                              disabled={loading}
                              className="bg-red-500 text-white p-2 rounded-lg transition-all duration-300 hover:bg-red-600 hover:scale-105 active:scale-95 disabled:opacity-50 flex items-center justify-center"
                              title="Hapus Question"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* Metadata */}
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-xs text-gray-500 pt-3 border-t border-gray-100 gap-2">
                          <span className="break-words">
                            {question.quiz_answer.length} pilihan jawaban
                          </span>
                          <span className="break-words">
                            {question.createdAt && `Dibuat: ${new Date(question.createdAt).toLocaleDateString('id-ID')}`}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {questions.length === 0 && !loading && (
                <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-200">
                  <HelpCircle className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Belum ada questions</h3>
                  <p className="text-gray-500 mb-6 text-sm sm:text-base max-w-md mx-auto break-words">
                    Mulai dengan membuat question pertama untuk quiz `{quiz.title}`
                  </p>
                  <button 
                    onClick={handleCreateQuestion}
                    disabled={loading}
                    className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 hover:scale-105 hover:shadow-lg active:scale-95 flex items-center gap-2 mx-auto disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Plus className="w-5 h-5" />
                    Buat Question Pertama
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </LayoutNavbar>
      <Footer/>

      {/* Create/Edit Question Modal dengan standar yang ditentukan */}
      {showQuestionModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col border border-gray-200 shadow-2xl">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-4 sm:p-6 border-b border-gray-200 bg-white">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900">
                {editingQuestion ? 'Edit Question' : 'Tambah Question Baru'}
              </h3>
              <button 
                onClick={() => {
                  setShowQuestionModal(false)
                  resetQuestionForm()
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                disabled={loading}
              >
                <X className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </div>

            {/* Modal Body - Scrollable */}
            <div className="flex-1 overflow-y-auto">
              <form onSubmit={handleSubmitQuestion} className="p-4 sm:p-6">
                <div className="space-y-4 sm:space-y-6">
                  {/* Question Input */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Pertanyaan *
                    </label>
                    <textarea
                      name="question"
                      required
                      value={questionForm.question}
                      onChange={handleQuestionInputChange}
                      disabled={loading}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 disabled:opacity-50 bg-white resize-none text-sm sm:text-base"
                      placeholder="Masukkan pertanyaan"
                    />
                  </div>
                  
                  {/* Question Settings */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                    {/* Question Type */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tipe Pertanyaan
                      </label>
                      <select
                        name="type"
                        value={questionForm.type}
                        onChange={handleQuestionInputChange}
                        disabled={loading}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 disabled:opacity-50 bg-white text-sm sm:text-base"
                      >
                        <option value="MultipleChoice">Pilihan Ganda</option>
                        <option value="TrueFalse">Benar/Salah</option>
                      </select>
                    </div>

                    {/* Points */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Poin *
                      </label>
                      <input
                        type="number"
                        name="points"
                        min="1"
                        max="100"
                        required
                        value={questionForm.points}
                        onChange={handleQuestionInputChange}
                        disabled={loading}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 disabled:opacity-50 bg-white text-sm sm:text-base"
                      />
                    </div>
                  </div>

                  {/* Answers */}
                  <div>
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-4">
                      <label className="block text-sm font-medium text-gray-700">
                        Jawaban *
                      </label>
                      <button
                        type="button"
                        onClick={addAnswer}
                        disabled={loading || questionForm.answers.length >= 6}
                        className="text-sm bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700 transition-colors disabled:opacity-50 w-full sm:w-auto hover:scale-105 active:scale-95 transition-all duration-200"
                      >
                        + Tambah Jawaban
                      </button>
                    </div>
                    
                    <div className="space-y-3">
                      {questionForm.answers.map((answer, index) => (
                        <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          <button
                            type="button"
                            onClick={() => setCorrectAnswer(index)}
                            disabled={loading}
                            className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-200 ${
                              answer.is_correct 
                                ? 'bg-green-500 text-white hover:bg-green-600' 
                                : 'bg-gray-300 text-gray-600 hover:bg-gray-400 hover:scale-105'
                            }`}
                            title={answer.is_correct ? 'Jawaban Benar' : 'Tandai sebagai Benar'}
                          >
                            {String.fromCharCode(65 + index)}
                          </button>
                          
                          <input
                            type="text"
                            value={answer.answer}
                            onChange={(e) => handleAnswerChange(index, 'answer', e.target.value)}
                            disabled={loading}
                            placeholder={`Jawaban ${String.fromCharCode(65 + index)}`}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 disabled:opacity-50 bg-white text-sm sm:text-base min-w-0"
                          />
                          
                          {questionForm.answers.length > 2 && (
                            <button
                              type="button"
                              onClick={() => removeAnswer(index)}
                              disabled={loading}
                              className="text-red-500 hover:text-red-700 transition-colors p-1 hover:scale-105 active:scale-95 transition-all duration-200 flex-shrink-0"
                              title="Hapus Jawaban"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                    
                    <div className="mt-3 text-sm text-gray-500 space-y-1">
                      <p className="break-words">• Klik huruf untuk menandai jawaban yang benar</p>
                      <p className="break-words">• Minimal 2 jawaban, maksimal 6 jawaban</p>
                      <p className="break-words">• Harus ada satu jawaban yang benar</p>
                    </div>
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="flex gap-3 justify-end mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => {
                      setShowQuestionModal(false)
                      resetQuestionForm()
                    }}
                    disabled={loading}
                    className="px-4 sm:px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors font-medium disabled:opacity-50 text-sm sm:text-base"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-blue-600 text-white px-4 sm:px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm sm:text-base hover:scale-105 active:scale-95 transition-all duration-200"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span className="text-sm sm:text-base">Menyimpan...</span>
                      </>
                    ) : (
                      editingQuestion ? 'Simpan Perubahan' : 'Buat Question'
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
          <div className="bg-white rounded-xl max-w-md w-full border border-gray-200 shadow-2xl mx-4">
            <div className="p-4 sm:p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-red-100 p-2 rounded-full">
                  <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6 text-red-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 break-words">Konfirmasi Hapus</h3>
              </div>
              
              <p className="text-gray-600 mb-6 text-sm sm:text-base break-words">
                Apakah Anda yakin ingin menghapus question <span className="font-semibold text-gray-900">`{showDeleteConfirm.questionText}`</span>? Tindakan ini tidak dapat dibatalkan.
              </p>

              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setShowDeleteConfirm({ show: false, questionId: null, questionText: '' })}
                  disabled={loading}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors font-medium disabled:opacity-50 text-sm sm:text-base"
                >
                  Batal
                </button>
                <button
                  onClick={() => showDeleteConfirm.questionId && handleDeleteQuestion(showDeleteConfirm.questionId)}
                  disabled={loading}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm sm:text-base hover:scale-105 active:scale-95 transition-all duration-200"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span className="text-sm sm:text-base">Menghapus...</span>
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