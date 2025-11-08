'use client'

import { useState } from 'react'
import Image from 'next/image'
import LayoutNavbar from '@/components/public/LayoutNavbar'
import { Star, Video, MessageSquare, Calendar, BookOpen, Users, Award, Clock, CheckCircle, Play } from 'lucide-react'
import Footer from '@/components/public/Footer'

export default function EMentoringPage() {
  const [activeCategory, setActiveCategory] = useState('all')

  const categories = [
    { id: 'all', name: 'Semua Mentor' },
    { id: 'business', name: 'Bisnis & Karier' },
    { id: 'leadership', name: 'Leadership' },
    { id: 'research', name: 'Penelitian' },
    { id: 'design', name: 'Desain' }
  ]

  const stats = [
    { value: '50+', label: 'Mentor Berpengalaman', icon: <Users className="w-5 h-5 sm:w-6 sm:h-6" /> },
    { value: '1000+', label: 'Sesi Mentoring', icon: <Video className="w-5 h-5 sm:w-6 sm:h-6" /> },
    { value: '95%', label: 'Kepuasan Peserta', icon: <Star className="w-5 h-5 sm:w-6 sm:h-6" /> },
    { value: '24/7', label: 'Konsultasi Tersedia', icon: <MessageSquare className="w-5 h-5 sm:w-6 sm:h-6" /> },
  ]

  const features = [
    {
      icon: <Video className="w-6 h-6 sm:w-8 sm:h-8" />,
      title: "Video Call",
      description: "Mentoring tatap muka virtual dengan kualitas HD",
      color: "text-blue-600"
    },
    {
      icon: <MessageSquare className="w-6 h-6 sm:w-8 sm:h-8" />,
      title: "Chat Support",
      description: "Konsultasi via chat 24/7 dengan mentor berpengalaman",
      color: "text-green-600"
    },
    {
      icon: <Calendar className="w-6 h-6 sm:w-8 sm:h-8" />,
      title: "Jadwal Fleksibel",
      description: "Atur jadwal sesi mentoring sesuai waktu luang Anda",
      color: "text-purple-600"
    },
    {
      icon: <BookOpen className="w-6 h-6 sm:w-8 sm:h-8" />,
      title: "Materi Terstruktur",
      description: "Kurikulum pengembangan skill yang sistematis",
      color: "text-orange-600"
    }
  ]

  const mentors = [
    {
      id: 1,
      name: "Dr. Arief Wiyono",
      field: "Bisnis & Karier",
      specialization: "Business Strategy & Career Development",
      image: "/person2.png",
      rating: 4.9,
      sessions: 250,
      experience: "15+ tahun",
      price: "Rp 200.000/sesi",
      category: 'business',
      featured: true
    },
    {
      id: 2,
      name: "Prof. Sarah Kusuma",
      field: "Leadership & HRD",
      specialization: "Leadership Development & Human Resources",
      image: "/person1.png",
      rating: 4.8,
      sessions: 180,
      experience: "12+ tahun",
      price: "Rp 180.000/sesi",
      category: 'leadership'
    },
    {
      id: 3,
      name: "Dr. Bambang Prasetyo",
      field: "Produktivitas & Inovasi",
      specialization: "Productivity System & Innovation Management",
      image: "/person3.png",
      rating: 4.9,
      sessions: 220,
      experience: "10+ tahun",
      price: "Rp 220.000/sesi",
      category: 'business'
    },
    {
      id: 4,
      name: "Dra. Mega Inti",
      field: "Desain & Presentasi",
      specialization: "Design Thinking & Presentation Skills",
      image: "/person1.png",
      rating: 4.7,
      sessions: 150,
      experience: "8+ tahun",
      price: "Rp 150.000/sesi",
      category: 'design'
    },
    {
      id: 5,
      name: "Dr. Rina Santoso",
      field: "Academic Research",
      specialization: "Research Methodology & Scientific Writing",
      image: "/person4.png",
      rating: 4.8,
      sessions: 190,
      experience: "11+ tahun",
      price: "Rp 190.000/sesi",
      category: 'research'
    },
    {
      id: 6,
      name: "Prof. Andi Wijaya",
      field: "Technology & Innovation",
      specialization: "Tech Entrepreneurship & Digital Transformation",
      image: "/person2.png",
      rating: 4.9,
      sessions: 210,
      experience: "14+ tahun",
      price: "Rp 230.000/sesi",
      category: 'business'
    }
  ]

  const plans = [
    {
      name: "Konsultasi Dasar",
      price: "Gratis",
      duration: "30 menit",
      features: [
        "Diskusi awal perencanaan",
        "1 topik pilihan",
        "Assessment kebutuhan",
        "Rekomendasi tindak lanjut"
      ],
      buttonText: "Mulai Konsultasi",
      popular: false
    },
    {
      name: "Paket Standar",
      price: "Rp 200.000",
      duration: "60 menit",
      features: [
        "Mentoring dua arah interaktif",
        "Materi pembelajaran eksklusif",
        "Grup support komunitas",
        "Feedback personalisasi",
        "Rekaman sesi mentoring"
      ],
      buttonText: "Pilih Paket",
      popular: true
    },
    {
      name: "Paket Premium",
      price: "Rp 500.000",
      duration: "4 Sesi",
      features: [
        "Sesi mentoring berkelanjutan",
        "Akses seluruh materi premium",
        "Feedback mendalam & evaluasi",
        "Sertifikat penyelesaian",
        "Priority scheduling",
        "Follow-up konsultasi"
      ],
      buttonText: "Pilih Paket",
      popular: false
    }
  ]

  const testimonials = [
    {
      text: "Mentornya sangat sabar dan insightful! Saya jadi lebih percaya diri presentasi di depan umum setelah mengikuti sesi mentoring.",
      name: "Nina, Mahasiswa Psikologi",
      role: "Peserta Mentoring 2024",
      rating: 5
    },
    {
      text: "Kelas mentoring yang interaktif dan penuh insight baru, cocok buat yang ingin berkembang cepat dalam karier!",
      name: "Dimas, Fresh Graduate",
      role: "Peserta Program Karier",
      rating: 5
    },
    {
      text: "Saya belajar banyak tentang strategi komunikasi efektif, sangat bermanfaat untuk dunia kerja dan organisasi!",
      name: "Rani, Pegawai Swasta",
      role: "Peserta E-Mentoring Plan",
      rating: 5
    }
  ]

  const filteredMentors = activeCategory === 'all' 
    ? mentors 
    : mentors.filter(mentor => mentor.category === activeCategory)

  return (
    <>
      <LayoutNavbar>
        <div className="flex flex-col gap-12 md:gap-20 px-4 sm:px-6 lg:px-8 pt-16 md:pt-20">
          {/* Hero Section */}
          <section className="w-full max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 items-center gap-6 md:gap-8 bg-blue-700 rounded-2xl md:rounded-3xl p-6 md:p-8 lg:p-12 text-white">
              <div className="space-y-4 md:space-y-6 order-2 lg:order-1">
                <div className="flex items-center gap-2 bg-blue-600 rounded-full px-3 py-1.5 md:px-4 md:py-2 w-fit">
                  <Users className="w-4 h-4" />
                  <span className="text-xs md:text-sm font-medium">Mentoring Professional</span>
                </div>
                
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold leading-tight">
                  E-Mentoring
                </h1>
                
                <p className="text-blue-100 text-base md:text-lg leading-relaxed">
                  Belajar langsung dari mentor berpengalaman untuk meningkatkan
                  perkembangan pribadi dan profesional kamu dengan pendekatan personal.
                </p>

                <div className="space-y-2 md:space-y-3">
                  {[
                    "Workshop personal dengan para ahli di bidangnya",
                    "Belajar fleksibel dengan diskusi daring dan tatap muka",
                    "Dapatkan feedback yang disesuaikan dengan kebutuhanmu"
                  ].map((item, index) => (
                    <div key={index} className="flex items-center gap-2 md:gap-3">
                      <CheckCircle className="text-green-300 flex-shrink-0 w-4 h-4 md:w-5 md:h-5" />
                      <span className="text-blue-100 text-sm md:text-base">{item}</span>
                    </div>
                  ))}
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-2 md:pt-4">
                  <button className="bg-white text-blue-700 px-6 py-3 md:px-8 md:py-4 rounded-xl font-semibold hover:bg-blue-50 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-2 justify-center">
                    <Video className="w-4 h-4 md:w-5 md:h-5" />
                    <span>Mulai Mentoring</span>
                  </button>
                  <button className="border-2 border-white text-white px-6 py-3 md:px-8 md:py-4 rounded-xl font-semibold hover:bg-blue-600 transition-all duration-200">
                    Lihat Mentor
                  </button>
                </div>
              </div>

              <div className="flex justify-center lg:justify-end order-1 lg:order-2 mb-4 lg:mb-0">
                <div className="relative w-full max-w-sm md:max-w-md">
                  <Image
                    src="/e-learning.png"
                    alt="E-Mentoring Session"
                    width={500}
                    height={400}
                    className="rounded-2xl object-cover shadow-2xl w-full h-auto"
                  />
                  <div className="absolute -bottom-3 -left-3 md:-bottom-4 md:-left-4 bg-white rounded-xl md:rounded-2xl p-3 md:p-4 shadow-lg">
                    <div className="flex items-center gap-2 md:gap-3">
                      <div className="bg-green-100 p-1.5 md:p-2 rounded-lg">
                        <Award className="w-4 h-4 md:w-6 md:h-6 text-green-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800 text-sm md:text-base">95%</p>
                        <p className="text-xs md:text-sm text-gray-600">Kepuasan Peserta</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Statistik Section */}
          <section className="w-full max-w-7xl mx-auto">
            <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-4">
              {stats.map((stat, index) => (
                <div
                  key={index}
                  className="bg-white rounded-xl md:rounded-2xl p-4 md:p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 group hover:scale-105"
                >
                  <div className="flex items-center gap-3 md:gap-4">
                    <div className="bg-blue-100 p-2 md:p-3 rounded-xl text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                      {stat.icon}
                    </div>
                    <div>
                      <h3 className="text-lg md:text-2xl font-bold text-gray-800">{stat.value}</h3>
                      <p className="text-gray-600 text-xs md:text-sm">{stat.label}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Features Section */}
          <section className="w-full max-w-7xl mx-auto">
            <div className="text-center mb-8 md:mb-10">
              <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-blue-800 mb-3 md:mb-4">
                Fitur Unggulan E-Mentoring
              </h2>
              <p className="text-gray-600 text-sm md:text-base max-w-2xl mx-auto px-4">
                Nikmati pengalaman mentoring yang lengkap dan terpersonalisasi untuk kebutuhan perkembangan Anda
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="bg-white rounded-xl md:rounded-2xl p-4 md:p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 group hover:scale-105 text-center"
                >
                  <div className={`bg-blue-100 p-3 md:p-4 rounded-xl w-fit mx-auto mb-3 md:mb-4 group-hover:bg-blue-600 transition-colors ${feature.color}`}>
                    {feature.icon}
                  </div>
                  <h3 className="font-bold text-base md:text-lg mb-1 md:mb-2 text-gray-800">{feature.title}</h3>
                  <p className="text-gray-600 text-xs md:text-sm leading-relaxed">{feature.description}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Mentor Section */}
          <section className="w-full max-w-7xl mx-auto">
            <div className="text-center mb-8 md:mb-10">
              <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-blue-800 mb-3 md:mb-4">
                Mentor Kami
              </h2>
              <p className="text-gray-600 text-sm md:text-base max-w-2xl mx-auto px-4">
                Belajar dari para profesional berpengalaman di bidangnya masing-masing
              </p>
            </div>

            <div className="flex flex-wrap justify-center gap-2 md:gap-3 mb-8 md:mb-12 px-2">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={`px-4 py-2 md:px-6 md:py-3 rounded-xl font-medium transition-all duration-200 text-sm md:text-base ${
                    activeCategory === category.id
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>

            {/* Mentors Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
              {filteredMentors.map((mentor) => (
                <div
                  key={mentor.id}
                  className="bg-white rounded-xl md:rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 group hover:scale-105"
                >
                  <div className="relative h-40 sm:h-48 overflow-hidden">
                    <Image
                      src={mentor.image}
                      alt={mentor.name}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    {mentor.featured && (
                      <div className="absolute top-2 left-2 bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                        Featured
                      </div>
                    )}
                    <div className="absolute top-2 right-2 bg-white/95 px-2 py-1 rounded-full flex items-center gap-1">
                      <Star className="w-3 h-3 text-yellow-400 fill-current" />
                      <span className="text-xs font-bold">{mentor.rating}</span>
                    </div>
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <button className="bg-white/90 text-blue-600 p-2 md:p-3 rounded-full hover:bg-white transition-colors">
                        <Play className="w-4 h-4 md:w-6 md:h-6" fill="currentColor" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="p-4 md:p-6 space-y-3 md:space-y-4">
                    <div className="flex justify-between items-start">
                      <span className="text-xs md:text-sm text-blue-700 font-semibold bg-blue-100 px-2 py-1 md:px-3 md:py-1 rounded-full">
                        {mentor.field}
                      </span>
                      <span className="text-xs md:text-sm font-semibold text-gray-800">{mentor.price}</span>
                    </div>

                    <h3 className="text-base md:text-lg font-bold text-gray-800 leading-tight group-hover:text-blue-700 transition-colors">
                      {mentor.name}
                    </h3>

                    <p className="text-xs md:text-sm text-gray-600 leading-relaxed">
                      {mentor.specialization}
                    </p>

                    <div className="flex items-center justify-between text-xs md:text-sm text-gray-600">
                      <div className="flex items-center gap-3 md:gap-4">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3 md:w-4 md:h-4" />
                          <span>{mentor.experience}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="w-3 h-3 md:w-4 md:h-4" />
                          <span>{mentor.sessions}+ sesi</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 md:gap-3">
                      <button className="flex-1 bg-blue-600 text-white py-2 md:py-3 rounded-xl font-semibold hover:bg-blue-700 transition-all duration-200 group-hover:shadow-lg flex items-center justify-center gap-1 md:gap-2 text-sm">
                        <Video className="w-3 h-3 md:w-4 md:h-4" />
                        Pilih Mentor
                      </button>
                      <button className="px-3 md:px-4 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors text-sm">
                        ⋮
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Pricing Section */}
          <section className="w-full max-w-7xl mx-auto">
            <div className="text-center mb-8 md:mb-10">
              <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-blue-800 mb-3 md:mb-4">
                Paket Mentoring
              </h2>
              <p className="text-gray-600 text-sm md:text-base max-w-2xl mx-auto px-4">
                Pilih paket mentoring yang sesuai dengan kebutuhan dan budget Anda
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
              {plans.map((plan, index) => (
                <div
                  key={index}
                  className={`bg-white rounded-xl md:rounded-2xl p-4 md:p-6 shadow-lg hover:shadow-xl transition-all duration-300 border-2 ${
                    plan.popular 
                      ? 'border-blue-600 relative scale-105' 
                      : 'border-gray-200'
                  } group hover:scale-105`}
                >
                  {plan.popular && (
                    <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                      <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
                        Paling Populer
                      </span>
                    </div>
                  )}
                  
                  <div className="text-center mb-4 md:mb-6">
                    <h3 className="text-lg md:text-xl font-bold text-gray-800 mb-1 md:mb-2">{plan.name}</h3>
                    <div className="flex items-baseline justify-center gap-1 mb-1 md:mb-2">
                      <span className="text-2xl md:text-3xl font-bold text-blue-600">{plan.price}</span>
                      {plan.price !== "Gratis" && (
                        <span className="text-gray-500 text-sm">/sesi</span>
                      )}
                    </div>
                    <p className="text-gray-600 text-xs md:text-sm">{plan.duration}</p>
                  </div>

                  <ul className="space-y-2 md:space-y-3 mb-4 md:mb-6">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-2 md:gap-3 text-xs md:text-sm text-gray-600">
                        <CheckCircle className="w-3 h-3 md:w-4 md:h-4 text-green-500 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <button className={`w-full py-2 md:py-3 rounded-xl font-semibold transition-all duration-200 text-sm md:text-base ${
                    plan.popular
                      ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl'
                      : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                  }`}>
                    {plan.buttonText}
                  </button>
                </div>
              ))}
            </div>
          </section>

          {/* Testimonials Section */}
          <section className="w-full max-w-7xl mx-auto">
            <div className="bg-blue-700 rounded-2xl md:rounded-3xl p-6 md:p-8 lg:p-12 text-white">
              <div className="text-center mb-8 md:mb-10">
                <h2 className="text-xl md:text-2xl lg:text-3xl font-bold mb-3 md:mb-4">
                  Testimoni Peserta
                </h2>
                <p className="text-blue-100 text-sm md:text-base max-w-2xl mx-auto px-4">
                  Dengarkan pengalaman langsung dari peserta yang telah merasakan manfaat program mentoring kami
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                {testimonials.map((testimonial, index) => (
                  <div
                    key={index}
                    className="bg-blue-600 rounded-xl md:rounded-2xl p-4 md:p-6 shadow-lg hover:shadow-xl transition-all duration-300 group hover:scale-105"
                  >
                    <div className="flex gap-1 mb-3 md:mb-4">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star 
                          key={i} 
                          className="w-3 h-3 md:w-4 md:h-4 text-yellow-400 fill-current" 
                        />
                      ))}
                    </div>
                    <p className="text-blue-100 italic mb-3 md:mb-4 leading-relaxed text-sm md:text-base">
                      &quot;{testimonial.text}&quot;
                    </p>
                    <div>
                      <p className="font-semibold text-sm md:text-base">{testimonial.name}</p>
                      <p className="text-blue-200 text-xs md:text-sm">{testimonial.role}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="w-full max-w-7xl mx-auto">
            <div className="bg-blue-700 rounded-2xl md:rounded-3xl p-6 md:p-8 lg:p-12 text-white text-center">
              <h2 className="text-xl md:text-2xl lg:text-3xl font-bold mb-3 md:mb-4">
                Siap Mengembangkan Potensimu?
              </h2>
              <p className="text-blue-100 mb-6 md:mb-8 text-sm md:text-base max-w-2xl mx-auto px-4">
                Bergabunglah dengan program mentoring kami dan raih kesuksesan bersama mentor berpengalaman
              </p>
              <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center">
                <button className="bg-white text-blue-700 px-6 py-3 md:px-8 md:py-4 rounded-xl font-semibold hover:bg-blue-50 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-2 justify-center text-sm md:text-base">
                  <Video className="w-4 h-4 md:w-5 md:h-5" />
                  Mulai Mentoring Sekarang
                </button>
                <button className="border-2 border-white text-white px-6 py-3 md:px-8 md:py-4 rounded-xl font-semibold hover:bg-blue-600 transition-all duration-200 text-sm md:text-base">
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