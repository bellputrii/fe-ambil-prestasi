'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import LayoutNavbar from '@/components/public/LayoutNavbar'
import { Star, Video, Calendar, BookOpen, Users, Award, Clock, CheckCircle, Mail, Zap } from 'lucide-react'
import Footer from '@/components/public/Footer'

interface Mentor {
  id: string
  name: string
  field: string
  specialization: string
  image: string
  rating: number
  sessions: number
  experience: string
  category: string
  featured?: boolean
  bio?: string
  email?: string
  telp?: string | null
}

interface ApiResponse {
  success: boolean
  data: Array<{
    id: string
    name: string
    email: string
    username: string
    profileImage: string
    roleId: number
    telp: string | null
    status: string
    specialization: string | null
    bio: string | null
  }>
  message?: string
  meta: {
    totalItems: number
    itemsPerPage: number
    totalPages: number
    currentPage: number
  }
}

export default function EMentoringPage() {
  const [activeCategory, setActiveCategory] = useState('all')
  const [mentors, setMentors] = useState<Mentor[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedMentor, setSelectedMentor] = useState<Mentor | null>(null)

  const categories = [
    { id: 'all', name: 'Semua Mentor' },
    { id: 'essay', name: 'Essay' },
    { id: 'business', name: 'Business Plan' },
    { id: 'research', name: 'Penelitian' },
    { id: 'design', name: 'Desain' }
  ]

  // Fetch data mentors dari API tanpa perlu login
  useEffect(() => {
    const fetchMentors = async () => {
      try {
        setLoading(true)
        setError(null)

        console.log('Fetching mentors from API...')
        
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/public/teachers`, {
          method: "GET",
          headers: {
            'Content-Type': 'application/json',
          },
        })

        console.log('Response status:', response.status)
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        const result: ApiResponse = await response.json()
        console.log('API Response:', result)
        
        if (result.success && result.data && Array.isArray(result.data)) {
          console.log('Transforming mentors data...')
          
          const transformedMentors = result.data.map((teacher, index) => {
            // Handle kemungkinan null values
            const specialization = teacher.specialization || 'General'
            const profileImage = teacher.profileImage || '/person1.png'
            const bio = teacher.bio || 'Mentor berpengalaman di bidang pendidikan dengan komitmen untuk membantu siswa mencapai potensi terbaik mereka.'
            
            return {
              id: teacher.id,
              name: teacher.name,
              field: mapField(specialization),
              specialization: specialization,
              image: profileImage,
              rating: parseFloat((4.5 + Math.random() * 0.5).toFixed(1)),
              sessions: Math.floor(Math.random() * 200) + 50,
              experience: `${Math.floor(Math.random() * 10) + 5}+ tahun`,
              category: mapCategory(specialization),
              featured: index < 2, // Jadikan 2 mentor pertama sebagai featured
              bio: bio,
              email: teacher.email,
              telp: teacher.telp
            }
          })

          console.log('Transformed mentors:', transformedMentors)
          setMentors(transformedMentors)
        } else {
          console.warn('API response structure unexpected:', result)
          throw new Error(result.message || 'Struktur data mentor tidak sesuai')
        }
      } catch (err) {
        console.error('Error fetching mentors:', err)
        setError('Gagal memuat data mentor. Silakan coba lagi.')
        // Fallback ke data sample jika API gagal
        setMentors(getFallbackMentors())
      } finally {
        setLoading(false)
      }
    }

    fetchMentors()
  }, [])

  const mapField = (specialization: string): string => {
    if (!specialization) return 'Pendidikan Umum'
    
    const fieldMap: { [key: string]: string } = {
      'esai': 'Essay & Penulisan',
      'bplan': 'Bisnis & Business Plan',
      'poster': 'Desain & Kreatif',
      'mathematics': 'Matematika & Essay',
      'science': 'Sains & Penelitian',
      'language': 'Bahasa & Essay',
      'technology': 'Teknologi & Business Plan',
      'business': 'Bisnis & Business Plan',
      'research': 'Penelitian & Analisis',
      'design': 'Desain Kreatif',
      'general': 'Pendidikan Umum'
    }
    
    const key = specialization.toLowerCase()
    return fieldMap[key] || 'Pendidikan Umum'
  }

  const mapCategory = (specialization: string): string => {
    if (!specialization) return 'essay'
    
    const categoryMap: { [key: string]: string } = {
      'esai': 'essay',
      'bplan': 'business',
      'poster': 'design',
      'mathematics': 'essay',
      'science': 'research',
      'language': 'essay',
      'technology': 'business',
      'business': 'business',
      'research': 'research',
      'design': 'design',
      'general': 'essay'
    }
    
    const key = specialization.toLowerCase()
    return categoryMap[key] || 'essay'
  }

  const getFallbackMentors = (): Mentor[] => [
    {
      id: '1',
      name: "Dr. Arief Wiyono",
      field: "Bisnis & Business Plan",
      specialization: "Business Strategy & Career Development",
      image: "/person2.png",
      rating: 4.9,
      sessions: 250,
      experience: "15+ tahun",
      category: 'business',
      featured: true,
      bio: "Pakar bisnis dengan pengalaman 15+ tahun dalam konsultasi business plan dan pengembangan karier.",
      email: "arief.wiyono@example.com",
      telp: "08123456789"
    },
    {
      id: '2',
      name: "Prof. Sarah Kusuma",
      field: "Penelitian & Analisis",
      specialization: "Research Methodology & Scientific Writing",
      image: "/person1.png",
      rating: 4.8,
      sessions: 180,
      experience: "12+ tahun",
      category: 'research',
      bio: "Ahli metodologi penelitian dengan spesialisasi dalam penulisan karya ilmiah dan publikasi.",
      email: "sarah.kusuma@example.com",
      telp: "08123456788"
    }
  ]

  const stats = [
    { value: `${mentors.length}+`, label: 'Mentor Berpengalaman', icon: <Users className="w-5 h-5" /> },
    { value: `${mentors.reduce((acc, mentor) => acc + mentor.sessions, 0)}+`, label: 'Sesi Mentoring', icon: <Video className="w-5 h-5" /> },
    { value: '95%', label: 'Kepuasan Peserta', icon: <Star className="w-5 h-5" /> },
    { value: '500+', label: 'Materi Pembelajaran', icon: <BookOpen className="w-5 h-5" /> },
  ]

  const features = [
    {
      icon: <BookOpen className="w-6 h-6" />,
      title: "Akses Semua Materi",
      description: "Dapatkan akses ke seluruh modul pembelajaran selama periode berlangganan"
    },
    {
      icon: <Video className="w-6 h-6" />,
      title: "Mentoring Langsung",
      description: "Sesi konsultasi langsung dengan mentor ahli di bidangnya"
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Update Berkala",
      description: "Materi selalu diperbarui dengan konten terbaru dan terbaik"
    },
    {
      icon: <Calendar className="w-6 h-6" />,
      title: "Fleksibel",
      description: "Belajar kapan saja dan di mana saja selama periode berlangganan"
    }
  ]

  const plans = [
    {
      name: "Paket 1 Bulan",
      originalPrice: "Rp 50.000",
      price: "Rp 15.000",
      discount: "70%",
      duration: "1 Bulan",
      features: [
        "Akses ke SEMUA materi pembelajaran",
        "Konsultasi dengan mentor 2x per minggu",
        "Download materi PDF eksklusif",
        "Grup diskusi komunitas",
        "Update materi berkala",
        "Berkesempatan menjadi Brand Ambassador"
      ],
      buttonText: "Pilih Paket 1 Bulan",
      popular: false,
      link: "https://lynk.id/ambilprestasi"
    },
    {
      name: "Paket 4 Bulan",
      originalPrice: "Rp 166.000",
      price: "Rp 50.000",
      discount: "70%",
      duration: "4 Bulan",
      features: [
        "Akses ke SEMUA materi pembelajaran",
        "Konsultasi dengan mentor 3x per minggu",
        "Download materi PDF eksklusif",
        "Grup diskusi komunitas",
        "Update materi berkala",
        "Priority support",
        "Video rekaman sesi",
        "Berkesempatan menjadi Brand Ambassador"
      ],
      buttonText: "Pilih Paket 4 Bulan",
      popular: true,
      link: "https://lynk.id/ambilprestasi"
    },
    {
      name: "Paket 1 Tahun",
      originalPrice: "Rp 333.000",
      price: "Rp 100.000",
      discount: "70%",
      duration: "1 Tahun",
      features: [
        "Akses ke SEMUA materi pembelajaran",
        "Konsultasi dengan mentor 5x per minggu",
        "Download materi PDF eksklusif",
        "Grup diskusi komunitas",
        "Update materi berkala",
        "Priority support",
        "Video rekaman sesi",
        "Personal learning plan",
        "Assessment perkembangan",
        "Berkesempatan menjadi Brand Ambassador"
      ],
      buttonText: "Pilih Paket 1 Tahun",
      popular: false,
      link: "https://lynk.id/ambilprestasi"
    }
  ]

  const testimonials = [
    {
      text: "Dengan paket berlangganan, saya bisa akses semua materi dan konsultasi kapan saja. Sangat worth it!",
      name: "Nina, Mahasiswa Psikologi",
      role: "Peserta Program 2 Bulan",
      rating: 5
    },
    {
      text: "Materinya lengkap dan selalu update. Mentor juga sangat responsif dalam memberikan bimbingan.",
      name: "Dimas, Fresh Graduate",
      role: "Peserta Program 3 Bulan",
      rating: 5
    },
    {
      text: "Harga sangat terjangkau untuk akses seluas ini. Saya bisa belajar semua topik yang saya butuhkan.",
      name: "Rani, Pegawai Swasta",
      role: "Peserta Program 1 Bulan",
      rating: 5
    }
  ]

  const filteredMentors = activeCategory === 'all' 
    ? mentors 
    : mentors.filter(mentor => mentor.category === activeCategory)

  const handlePackageSelect = (link: string) => {
    window.open(link, '_blank', 'noopener,noreferrer')
  }

  return (
    <>
      <LayoutNavbar>
        <div className="flex flex-col gap-8 md:gap-16 px-4 sm:px-6 lg:px-8 pt-16 md:pt-20">
          {/* Hero Section */}
          <section className="w-full max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 items-center gap-6 bg-blue-800 rounded-2xl p-6 text-white">
              <div className="space-y-4 order-2 lg:order-1">
                <div className="flex items-center gap-2 bg-blue-700 rounded-full px-3 py-1 w-fit">
                  <Users className="w-4 h-4" />
                  <span className="text-sm font-medium">Mentoring Professional</span>
                </div>
                
                <h1 className="text-2xl sm:text-3xl font-bold leading-tight">
                  E-Mentoring Excellence
                </h1>
                
                <p className="text-blue-200 text-base leading-relaxed">
                  Akses semua materi pembelajaran premium dengan paket berlangganan bulanan. 
                  Belajar dari mentor ahli dan raih prestasi terbaikmu!
                </p>

                <div className="space-y-2">
                  {[
                    "Akses ke SEMUA materi pembelajaran selama berlangganan",
                    "Konsultasi langsung dengan mentor berpengalaman",
                    "Update materi berkala dan konten terbaru"
                  ].map((item, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <CheckCircle className="text-green-400 w-4 h-4" />
                      <span className="text-blue-200 text-sm">{item}</span>
                    </div>
                  ))}
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <button 
                    onClick={() => document.getElementById('packages-section')?.scrollIntoView({ behavior: 'smooth' })}
                    className="bg-white text-blue-800 px-6 py-3 rounded-lg font-semibold hover:bg-blue-100 transition-colors flex items-center gap-2 justify-center"
                  >
                    <Zap className="w-4 h-4" />
                    <span>Lihat Paket Langganan</span>
                  </button>
                  <button 
                    onClick={() => document.getElementById('mentors-section')?.scrollIntoView({ behavior: 'smooth' })}
                    className="border-2 border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                  >
                    Kenali Mentor Kami
                  </button>
                </div>
              </div>

              <div className="flex justify-center lg:justify-end order-1 lg:order-2">
                <div className="relative w-full max-w-sm">
                  <Image
                    src="/ementoring.jpg"
                    alt="E-Mentoring Session"
                    width={400}
                    height={300}
                    className="rounded-xl object-cover w-full h-auto"
                  />
                  <div className="absolute -bottom-3 -left-3 bg-white rounded-lg p-3 shadow-lg">
                    <div className="flex items-center gap-2">
                      <div className="bg-green-100 p-2 rounded-lg">
                        <Award className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800 text-sm">500+</p>
                        <p className="text-xs text-gray-600">Materi Tersedia</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Statistik Section */}
          <section className="w-full max-w-7xl mx-auto">
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              {stats.map((stat, index) => (
                <div
                  key={index}
                  className="bg-white rounded-lg p-4 shadow-md border border-gray-200"
                >
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
                      {stat.icon}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-800">{stat.value}</h3>
                      <p className="text-gray-600 text-xs">{stat.label}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Features Section */}
          <section className="w-full max-w-7xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-xl md:text-2xl font-bold text-blue-800 mb-2">
                Keunggulan Program Langganan
              </h2>
              <p className="text-gray-600 text-sm max-w-2xl mx-auto">
                Dapatkan pengalaman belajar terbaik dengan akses penuh ke semua materi dan bimbingan mentor
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="bg-white rounded-lg p-4 shadow-md border border-gray-200 text-center"
                >
                  <div className="bg-blue-100 p-3 rounded-lg w-fit mx-auto mb-3 text-blue-600">
                    {feature.icon}
                  </div>
                  <h3 className="font-bold text-base mb-1 text-gray-800">{feature.title}</h3>
                  <p className="text-gray-600 text-xs leading-relaxed">{feature.description}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Pricing Section */}
          <section id="packages-section" className="w-full max-w-7xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-xl md:text-2xl font-bold text-blue-800 mb-2">
                Paket Berlangganan
              </h2>
              <p className="text-gray-600 text-sm max-w-2xl mx-auto">
                Pilih paket berlangganan yang sesuai dengan kebutuhan belajar Anda. Akses semua materi selama periode berlangganan!
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {plans.map((plan, index) => (
                <div
                  key={index}
                  className={`bg-white rounded-lg p-6 shadow-md border-2 ${
                    plan.popular 
                      ? 'border-blue-600 relative' 
                      : 'border-gray-200'
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <span className="bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                        Paling Populer
                      </span>
                    </div>
                  )}
                  
                  <div className="text-center mb-4">
                    <h3 className="text-lg font-bold text-gray-800 mb-2">{plan.name}</h3>
                    <div className="flex flex-col items-center gap-1 mb-2">
                      <div className="flex items-baseline gap-2">
                        <span className="text-lg line-through text-gray-400">{plan.originalPrice}</span>
                        <span className="text-2xl font-bold text-blue-600">{plan.price}</span>
                      </div>
                      <span className="bg-red-100 text-red-600 px-2 py-1 rounded-full text-xs font-semibold">
                        Hemat {plan.discount}
                      </span>
                    </div>
                    <p className="text-gray-600 font-semibold text-sm">{plan.duration} Akses Penuh</p>
                  </div>

                  <div className="mb-4 p-3 bg-blue-50 rounded-lg text-center">
                    <p className="text-blue-700 font-semibold text-xs">
                      ✅ Akses ke SEMUA Materi Pembelajaran
                    </p>
                  </div>

                  <ul className="space-y-2 mb-4">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-gray-600">
                        <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                        <span className="text-xs">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <button 
                    onClick={() => handlePackageSelect(plan.link)}
                    className={`w-full py-3 rounded-lg font-semibold transition-colors ${
                      plan.popular
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                    }`}
                  >
                    {plan.buttonText}
                  </button>
                </div>
              ))}
            </div>

            <div className="text-center mt-6">
              <div className="bg-green-100 border border-green-300 rounded-lg p-4 max-w-2xl mx-auto">
                <p className="text-green-800 font-semibold text-sm">
                  💫 Spesial Diskon 70%! Harga normal Rp 100.000/bulan menjadi Rp 30.000/bulan
                </p>
                <p className="text-green-700 text-xs mt-1">
                  Akses semua materi, konsultasi mentor, dan fitur premium lainnya
                </p>
              </div>
            </div>
          </section>

          {/* Mentor Section */}
          <section id="mentors-section" className="w-full max-w-7xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-xl md:text-2xl font-bold text-blue-800 mb-2">
                Tim Mentor Kami
              </h2>
              <p className="text-gray-600 text-sm max-w-2xl mx-auto">
                Kenali mentor ahli kami yang siap membimbing Anda menuju kesuksesan akademis dan profesional
              </p>
            </div>

            <div className="flex flex-wrap justify-center gap-2 mb-6">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors text-sm ${
                    activeCategory === category.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>

            {/* Loading State */}
            {loading && (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2 text-gray-600">Memuat mentor...</span>
              </div>
            )}

            {/* Error State */}
            {error && !loading && (
              <div className="text-center py-6">
                <div className="bg-yellow-100 border border-yellow-400 rounded-lg p-4 max-w-md mx-auto">
                  <p className="text-yellow-800 font-medium">{error}</p>
                  <button 
                    onClick={() => window.location.reload()}
                    className="mt-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                  >
                    Coba Lagi
                  </button>
                </div>
              </div>
            )}

            {/* Mentors Grid */}
            {!loading && !error && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredMentors.map((mentor) => (
                  <div
                    key={mentor.id}
                    className="bg-white rounded-lg overflow-hidden shadow-md border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => setSelectedMentor(mentor)}
                  >
                    <div className="relative h-40 bg-blue-50">
                      <div className="w-full h-full flex items-center justify-center p-4">
                        <div className="relative">
                          <Image
                            src={mentor.image}
                            alt={mentor.name}
                            width={80}
                            height={80}
                            className="w-20 h-20 rounded-full object-cover border-2 border-white shadow-md"
                          />
                          {mentor.featured && (
                            <div className="absolute -top-1 -right-1 bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                              Featured
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="absolute top-2 right-2 bg-white px-2 py-1 rounded-full flex items-center gap-1 shadow-sm">
                        <Star className="w-3 h-3 text-yellow-400 fill-current" />
                        <span className="text-sm font-bold text-gray-800">{mentor.rating}</span>
                      </div>
                    </div>
                    
                    <div className="p-4 space-y-3">
                      <div className="flex justify-between items-start">
                        <span className="text-xs text-blue-700 font-semibold bg-blue-100 px-2 py-1 rounded">
                          {mentor.field}
                        </span>
                      </div>

                      <div>
                        <h3 className="text-base font-bold text-gray-800">
                          {mentor.name}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          {mentor.specialization}
                        </p>
                      </div>

                      <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">
                        {mentor.bio}
                      </p>

                      <div className="flex items-center justify-between text-xs text-gray-600">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>{mentor.experience}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            <span>{mentor.sessions}+ sesi</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Empty State */}
            {!loading && !error && filteredMentors.length === 0 && (
              <div className="text-center py-8">
                <div className="bg-gray-50 rounded-lg p-6 max-w-md mx-auto">
                  <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <h3 className="text-base font-semibold text-gray-700 mb-1">Tidak ada mentor ditemukan</h3>
                  <p className="text-gray-500 text-xs mb-3">
                    Tidak ada mentor yang tersedia untuk kategori {categories.find(c => c.id === activeCategory)?.name.toLowerCase()}.
                  </p>
                  <button 
                    onClick={() => setActiveCategory('all')}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                  >
                    Lihat Semua Mentor
                  </button>
                </div>
              </div>
            )}
          </section>

          {/* Mentor Detail Modal */}
          {selectedMentor && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
                <div className="relative">
                  <div className="bg-blue-800 p-4 rounded-t-lg text-white">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        <Image
                          src={selectedMentor.image}
                          alt={selectedMentor.name}
                          width={60}
                          height={60}
                          className="w-15 h-15 rounded-full border-2 border-white object-cover"
                        />
                        <div>
                          <h2 className="text-lg font-bold">{selectedMentor.name}</h2>
                          <p className="text-blue-200 text-sm">{selectedMentor.specialization}</p>
                          <div className="flex items-center gap-1 mt-1">
                            <Star className="w-3 h-3 text-yellow-400 fill-current" />
                            <span className="text-xs">{selectedMentor.rating} • {selectedMentor.sessions}+ sesi</span>
                          </div>
                        </div>
                      </div>
                      <button 
                        onClick={() => setSelectedMentor(null)}
                        className="text-white text-xl"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                  
                  <div className="p-4 space-y-4">
                    <div>
                      <h3 className="font-semibold text-gray-800 mb-2">Tentang Mentor</h3>
                      <p className="text-gray-600 text-sm leading-relaxed">{selectedMentor.bio}</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <div className="flex items-center gap-2 text-blue-700 mb-1">
                          <Clock className="w-3 h-3" />
                          <span className="font-semibold text-sm">Pengalaman</span>
                        </div>
                        <p className="text-gray-700 text-sm">{selectedMentor.experience}</p>
                      </div>
                      <div className="bg-green-50 p-3 rounded-lg">
                        <div className="flex items-center gap-2 text-green-700 mb-1">
                          <Users className="w-3 h-3" />
                          <span className="font-semibold text-sm">Total Sesi</span>
                        </div>
                        <p className="text-gray-700 text-sm">{selectedMentor.sessions}+ sesi</p>
                      </div>
                    </div>

                    {selectedMentor.email && (
                      <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                        <Mail className="w-4 h-4 text-gray-600" />
                        <div>
                          <p className="text-xs text-gray-500">Email</p>
                          <p className="text-gray-800 text-sm">{selectedMentor.email}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Testimonials Section */}
          <section className="w-full max-w-7xl mx-auto">
            <div className="bg-blue-800 rounded-2xl p-6 text-white">
              <div className="text-center mb-6">
                <h2 className="text-xl md:text-2xl font-bold mb-2">
                  Testimoni Peserta
                </h2>
                <p className="text-blue-200 text-sm max-w-2xl mx-auto">
                  Dengarkan pengalaman langsung dari peserta yang telah merasakan manfaat program berlangganan kami
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {testimonials.map((testimonial, index) => (
                  <div
                    key={index}
                    className="bg-blue-700 rounded-lg p-4"
                  >
                    <div className="flex gap-1 mb-3">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star 
                          key={i} 
                          className="w-3 h-3 text-yellow-400 fill-current" 
                        />
                      ))}
                    </div>
                    <p className="text-blue-100 text-sm mb-3 leading-relaxed">
                      &quot;{testimonial.text}&quot;
                    </p>
                    <div>
                      <p className="font-semibold text-sm">{testimonial.name}</p>
                      <p className="text-blue-300 text-xs">{testimonial.role}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="w-full max-w-7xl mx-auto">
            <div className="bg-blue-800 rounded-2xl p-6 text-white text-center">
              <h2 className="text-xl md:text-2xl font-bold mb-2">
                Siap Bergabung dengan Program Kami?
              </h2>
              <p className="text-blue-200 mb-4 text-sm max-w-2xl mx-auto">
                Dapatkan akses ke semua materi premium dan bimbingan mentor ahli dengan paket berlangganan spesial
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button 
                  onClick={() => document.getElementById('packages-section')?.scrollIntoView({ behavior: 'smooth' })}
                  className="bg-white text-blue-800 px-6 py-3 rounded-lg font-semibold hover:bg-blue-100 transition-colors flex items-center gap-2 justify-center text-sm"
                >
                  <Zap className="w-4 h-4" />
                  Lihat Paket Berlangganan
                </button>
                <button 
                  onClick={() => handlePackageSelect("https://link.id/ambilprestasi-konsultasi")}
                  className="border-2 border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors text-sm"
                >
                  Konsultasi Gratis
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