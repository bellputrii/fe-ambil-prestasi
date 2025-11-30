'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { 
  ChevronLeft,
  Award,
  CheckCircle,
  XCircle,
  BarChart3,
  Clock,
  Target,
  FileText,
  RotateCcw,
  AlertCircle
} from 'lucide-react'

interface QuizAnswer {
  id: number
  answer: string
  is_correct: boolean
  createdAt?: string
  updatedAt?: string
  questionId?: number
}

interface QuizQuestion {
  id: number
  question: string
  type: 'MultipleChoice' | 'Essay'
  points: number
  explanation: string | null
  createdAt?: string
  updatedAt?: string
  quizId?: number
  quiz_answer?: QuizAnswer[]
}

interface Quiz {
  id: number
  title: string
  description: string | null
  max_attempts: number
  time_limit: number
  passing_grade: number
  xp: number
  materialId: number
  quiz_question?: QuizQuestion[]
}

interface AttemptMultipleAnswer {
  id: number
  createdAt?: string
  updatedAt?: string
  attempt_answerId?: number
  answerId: number
  quiz_answer: QuizAnswer
}

interface AttemptAnswer {
  id: number
  path: string | null
  answer: string
  createdAt?: string
  updatedAt?: string
  attemptId?: number
  questionId: number
  quiz_question: QuizQuestion
  attemp_multiple_answer: AttemptMultipleAnswer[]
}

interface QuizAttempt {
  id: number
  score: number | null
  started_at: string
  submitted_at: string | null
  is_graded: boolean
  userId: string
  quizId: number
  quiz: Quiz
  attemp_answer?: AttemptAnswer[]
}

export default function QuizResultsPage() {
  const params = useParams()
  const router = useRouter()
  const classId = params.id as string
  const sectionId = params.sectionId as string
  const materialId = params.materialId as string
  const quizId = params.quizId as string
  const attemptId = params.attemptId as string

  const [quizAttempt, setQuizAttempt] = useState<QuizAttempt | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchQuizResults = async () => {
    try {
      setIsLoading(true)
      const token = localStorage.getItem("token")
      
      if (!token) {
        setError('Token tidak ditemukan. Silakan login kembali.')
        setIsLoading(false)
        return
      }

      console.log('Fetching quiz results for attempt:', attemptId)

      // Coba GET request terlebih dahulu
      let response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/classes/sections/materials/${materialId}/quizzes/attempts/${attemptId}/result`,
        {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        }
      )

      // Jika GET gagal, coba POST
      if (!response.ok) {
        console.log('GET failed, trying POST...')
        
        response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/classes/sections/materials/${materialId}/quizzes/attempts/${attemptId}/result`,
          {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              attemptId: parseInt(attemptId)
            })
          }
        )
      }

      if (!response.ok) {
        const errorText = await response.text()
        console.error('API Error Response:', errorText)
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      console.log('Results API Response:', result)
      
      if (result.success && result.data) {
        setQuizAttempt(result.data)
        setError(null)
      } else {
        throw new Error(result.message || 'Gagal memuat hasil quiz')
      }
    } catch (err) {
      console.error('Error fetching quiz results:', err)
      setError('Gagal memuat hasil quiz. Silakan coba lagi.')
    } finally {
      setIsLoading(false)
    }
  }

  // Fungsi untuk mendapatkan jawaban yang benar untuk suatu soal
  const getCorrectAnswersForQuestion = (question: QuizQuestion): QuizAnswer[] => {
    if (!question?.quiz_answer) return []
    return question.quiz_answer.filter(answer => answer?.is_correct) || []
  }

  // Fungsi untuk mendapatkan jawaban yang dipilih user untuk suatu soal
  const getUserAnswersForQuestion = (questionId: number): AttemptMultipleAnswer[] => {
    if (!quizAttempt?.attemp_answer) return []
    
    const attemptAnswer = quizAttempt.attemp_answer.find(a => a.questionId === questionId)
    return attemptAnswer?.attemp_multiple_answer || []
  }

  // Check if user's answer is correct for a question
  const isAnswerCorrect = (question: QuizQuestion): boolean => {
    if (question.type === 'Essay') {
      // Untuk essay, kita tidak bisa menentukan benar/salah secara otomatis
      return false
    }

    const correctAnswers = getCorrectAnswersForQuestion(question)
    const userAnswers = getUserAnswersForQuestion(question.id)
    
    if (correctAnswers.length === 0 || userAnswers.length === 0) {
      return false
    }

    // Untuk multiple choice, user harus memilih semua jawaban yang benar
    // dan tidak memilih jawaban yang salah
    const correctAnswerIds = correctAnswers.map(ca => ca.id)
    const userAnswerIds = userAnswers.map(ua => ua.answerId)

    // Cek apakah user memilih semua jawaban yang benar
    const hasAllCorrectAnswers = correctAnswerIds.every(id => userAnswerIds.includes(id))
    
    // Cek apakah user tidak memilih jawaban yang salah
    const hasNoWrongAnswers = userAnswerIds.every(id => correctAnswerIds.includes(id))

    return hasAllCorrectAnswers && hasNoWrongAnswers
  }

  // Calculate points earned for a question
  const getPointsEarned = (question: QuizQuestion): number => {
    if (isAnswerCorrect(question)) {
      return question.points || 0
    }
    return 0
  }

  // Get user's selected answer text
  const getUserSelectedAnswer = (questionId: number): string => {
    const userAnswers = getUserAnswersForQuestion(questionId)
    if (userAnswers.length === 0) return 'Tidak dijawab'
    
    return userAnswers
      .map(ua => ua.quiz_answer?.answer)
      .filter(Boolean)
      .join(', ') || 'Tidak dijawab'
  }

  // Get correct answer text
  const getCorrectAnswerText = (question: QuizQuestion): string => {
    const correctAnswers = getCorrectAnswersForQuestion(question)
    if (correctAnswers.length === 0) return 'Tidak ada jawaban benar'
    
    return correctAnswers.map(ca => ca.answer).join(', ')
  }

  // Check if a specific answer option was selected by user
  const isAnswerSelectedByUser = (questionId: number, answerId: number): boolean => {
    const userAnswers = getUserAnswersForQuestion(questionId)
    return userAnswers.some(ua => ua.answerId === answerId)
  }

  // Check if a specific answer option is correct
  const isAnswerCorrectOption = (answer: QuizAnswer): boolean => {
    return answer?.is_correct || false
  }

  useEffect(() => {
    if (attemptId) {
      fetchQuizResults()
    }
  }, [attemptId])

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Memuat hasil quiz...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => router.push(`/mycourse/${classId}/sections/${sectionId}/materials/${materialId}/quiz/${quizId}`)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            <span className="hidden sm:inline">Kembali ke Detail Quiz</span>
          </button>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <AlertCircle className="w-12 h-12 sm:w-16 sm:h-16 text-red-500 mx-auto mb-4" />
          <p className="text-red-700 font-medium mb-4">{error}</p>
          <button 
            onClick={fetchQuizResults}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Coba Lagi
          </button>
        </div>
      </div>
    )
  }

  if (!quizAttempt) {
    return (
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => router.push(`/mycourse/${classId}/sections/${sectionId}/materials/${materialId}/quiz/${quizId}`)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            <span className="hidden sm:inline">Kembali ke Detail Quiz</span>
          </button>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <FileText className="w-12 h-12 sm:w-16 sm:h-16 text-yellow-500 mx-auto mb-4" />
          <p className="text-yellow-700">Hasil quiz tidak ditemukan</p>
        </div>
      </div>
    )
  }

  // Data dengan pengecekan keamanan
  const isPassed = quizAttempt.score !== null && quizAttempt.score >= quizAttempt.quiz.passing_grade
  const totalQuestions = quizAttempt.quiz.quiz_question?.length || 0
  
  // Hitung jawaban benar dan poin
  let correctAnswers = 0
  let earnedPoints = 0

  quizAttempt.quiz.quiz_question?.forEach(question => {
    if (isAnswerCorrect(question)) {
      correctAnswers++
      earnedPoints += question.points || 0
    }
  })

  const totalPoints = quizAttempt.quiz.quiz_question?.reduce((sum, question) => sum + (question?.points || 0), 0) || 0
  const timeSpent = quizAttempt.submitted_at ? 
    Math.round((new Date(quizAttempt.submitted_at).getTime() - new Date(quizAttempt.started_at).getTime()) / 60000) : 0

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => router.push(`/mycourse/${classId}/sections/${sectionId}/materials/${materialId}/quiz/${quizId}`)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
          <span className="hidden sm:inline">Kembali ke Detail Quiz</span>
        </button>
        <div className="flex-1">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Hasil Quiz</h1>
          <p className="text-gray-600 mt-1 text-sm sm:text-base">{quizAttempt.quiz.title}</p>
        </div>
      </div>

      {/* Results Summary */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-8">
        <div className="text-center mb-6 sm:mb-8">
          <div className={`w-16 h-16 sm:w-24 sm:h-24 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 ${
            isPassed ? 'bg-green-100' : 'bg-red-100'
          }`}>
            {isPassed ? (
              <CheckCircle className="w-8 h-8 sm:w-12 sm:h-12 text-green-600" />
            ) : (
              <XCircle className="w-8 h-8 sm:w-12 sm:h-12 text-red-600" />
            )}
          </div>
          
          <h2 className="text-xl sm:text-3xl font-bold text-gray-900 mb-2">
            {isPassed ? 'Selamat! Anda Lulus' : 'Anda Belum Lulus'}
          </h2>
          
          <div className="text-4xl sm:text-5xl font-bold text-gray-900 mb-2">
            {quizAttempt.score !== null ? `${quizAttempt.score}%` : 'Belum Dinilai'}
          </div>
          
          <p className={`text-base sm:text-lg font-semibold mb-4 ${
            isPassed ? 'text-green-600' : 'text-red-600'
          }`}>
            {isPassed ? 'LULUS' : 'TIDAK LULUS'}
          </p>

          <p className="text-gray-600 mb-6 text-sm sm:text-base">
            Nilai kelulusan: {quizAttempt.quiz.passing_grade}%
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4 text-center">
            <BarChart3 className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600 mx-auto mb-2" />
            <div className="text-lg sm:text-2xl font-bold text-blue-700">{correctAnswers}/{totalQuestions}</div>
            <div className="text-xs sm:text-sm text-blue-600">Jawaban Benar</div>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 sm:p-4 text-center">
            <Award className="w-6 h-6 sm:w-8 sm:h-8 text-green-600 mx-auto mb-2" />
            <div className="text-lg sm:text-2xl font-bold text-green-700">
              {earnedPoints}/{totalPoints}
            </div>
            <div className="text-xs sm:text-sm text-green-600">Poin Didapat</div>
          </div>
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 sm:p-4 text-center">
            <Clock className="w-6 h-6 sm:w-8 sm:h-8 text-orange-600 mx-auto mb-2" />
            <div className="text-lg sm:text-2xl font-bold text-orange-700">{timeSpent}</div>
            <div className="text-xs sm:text-sm text-orange-600">Menit Dihabiskan</div>
          </div>
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 sm:p-4 text-center">
            <Target className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600 mx-auto mb-2" />
            <div className="text-lg sm:text-2xl font-bold text-purple-700">{quizAttempt.quiz.passing_grade}%</div>
            <div className="text-xs sm:text-sm text-purple-600">Nilai Kelulusan</div>
          </div>
        </div>

        {/* Question Review */}
        <div className="space-y-4 sm:space-y-6">
          <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">Review Jawaban</h3>
          
          {quizAttempt.quiz.quiz_question?.map((question, index) => {
            const isCorrect = isAnswerCorrect(question)
            const pointsEarned = getPointsEarned(question)
            const userAnswer = getUserSelectedAnswer(question.id)
            const correctAnswer = getCorrectAnswerText(question)
            const userAnswers = getUserAnswersForQuestion(question.id)

            return (
              <div key={question.id} className={`border rounded-lg p-4 sm:p-6 ${
                isCorrect ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
              }`}>
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-4">
                  <h4 className="text-base sm:text-lg font-semibold text-gray-900 flex-1">
                    Soal {index + 1}: {question.question}
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      isCorrect 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {isCorrect ? 'Benar' : 'Salah'}
                    </span>
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                      {pointsEarned}/{question.points} poin
                    </span>
                    <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs font-medium">
                      {question.type === 'MultipleChoice' ? 'PG' : 'Essay'}
                    </span>
                  </div>
                </div>

                {/* User's Answer */}
                <div className="mb-4">
                  <p className="font-medium text-gray-900 mb-2 text-sm sm:text-base">Jawaban Anda:</p>
                  {question.type === 'Essay' ? (
                    <div className="bg-white border border-gray-300 rounded-lg p-3 sm:p-4">
                      <p className="text-gray-700 text-sm sm:text-base">{userAnswer}</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className={`p-3 rounded-lg border ${
                        isCorrect
                          ? 'bg-green-100 border-green-300 text-green-800'
                          : 'bg-red-100 border-red-300 text-red-800'
                      }`}>
                        <div className="flex items-center gap-2">
                          {isCorrect ? (
                            <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                          ) : (
                            <XCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                          )}
                          <span className="text-sm sm:text-base">{userAnswer}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Correct Answer (for multiple choice) */}
                {question.type === 'MultipleChoice' && !isCorrect && (
                  <div className="mb-4">
                    <p className="font-medium text-green-900 mb-2 text-sm sm:text-base">Jawaban yang Benar:</p>
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <div className="flex items-center gap-2 text-green-800">
                        <CheckCircle className="w-4 h-4 flex-shrink-0" />
                        <span className="text-sm sm:text-base">{correctAnswer}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* All Options (for multiple choice) */}
                {question.type === 'MultipleChoice' && (
                  <div className="mb-4">
                    <p className="font-medium text-gray-900 mb-2 text-sm sm:text-base">Semua Pilihan Jawaban:</p>
                    <div className="space-y-2">
                      {question.quiz_answer?.map((answer) => {
                        if (!answer) return null
                        
                        const isSelected = isAnswerSelectedByUser(question.id, answer.id)
                        const isCorrectAnswer = isAnswerCorrectOption(answer)

                        return (
                          <div
                            key={answer.id}
                            className={`p-3 rounded-lg border ${
                              isCorrectAnswer
                                ? 'bg-green-50 border-green-200 text-green-800'
                                : isSelected && !isCorrectAnswer
                                ? 'bg-red-50 border-red-200 text-red-800'
                                : 'bg-gray-50 border-gray-200 text-gray-700'
                            } ${isSelected ? 'ring-2 ring-offset-1' : ''} ${
                              isSelected && isCorrectAnswer 
                                ? 'ring-green-300' 
                                : isSelected && !isCorrectAnswer 
                                ? 'ring-red-300' 
                                : ''
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              {isCorrectAnswer && (
                                <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                              )}
                              {isSelected && !isCorrectAnswer && (
                                <XCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                              )}
                              {!isSelected && !isCorrectAnswer && (
                                <div className="w-4 h-4 border border-gray-300 rounded flex-shrink-0"></div>
                              )}
                              <span className="flex-1 text-sm sm:text-base">{answer.answer}</span>
                              {isSelected && (
                                <span className="text-xs font-medium px-2 py-1 rounded bg-blue-100 text-blue-800 flex-shrink-0">
                                  Dipilih
                                </span>
                              )}
                              {isCorrectAnswer && (
                                <span className="text-xs font-medium px-2 py-1 rounded bg-green-100 text-green-800 flex-shrink-0">
                                  Benar
                                </span>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                    
                    {/* Additional info about correct answers */}
                    <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-xs sm:text-sm text-blue-800">
                        <strong>Keterangan:</strong> Jawaban yang benar ditandai dengan warna hijau. 
                        Jawaban yang Anda pilih ditandai dengan outline.
                      </p>
                    </div>
                  </div>
                )}

                {/* Explanation */}
                {question.explanation && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4">
                    <p className="font-medium text-blue-900 mb-1 text-sm sm:text-base">Penjelasan:</p>
                    <p className="text-blue-800 text-xs sm:text-sm">{question.explanation}</p>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 mt-6 sm:mt-8 pt-6 border-t border-gray-200">
          <button
            onClick={() => router.push(`/mycourse/${classId}/sections/${sectionId}/materials/${materialId}/quiz/${quizId}`)}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 text-sm sm:text-base"
          >
            <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            Kembali ke Detail Quiz
          </button>
          
          {!isPassed && (
            <button
              onClick={() => router.push(`/mycourse/${classId}/sections/${sectionId}/materials/${materialId}/quiz/${quizId}`)}
              className="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 text-sm sm:text-base"
            >
              <RotateCcw className="w-4 h-4 sm:w-5 sm:h-5" />
              Coba Lagi
            </button>
          )}
        </div>
      </div>
    </div>
  )
}