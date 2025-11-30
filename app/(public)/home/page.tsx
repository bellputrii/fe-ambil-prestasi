'use client'

import { useState } from 'react'
import Image from 'next/image'
import LayoutNavbar from '@/components/public/LayoutNavbar'
import { CheckCircle, Play, Users, Clock, BookOpen, Star, ArrowRight, Video, FileText, Award, ChevronDown } from 'lucide-react'
import Footer from '@/components/public/Footer'
import { useRouter } from 'next/navigation'

export default function HomePage() {
  const router = useRouter()

  // Data untuk paket berlangganan - HARGA BARU
  const plans = [
    {
      name: "Paket 1 Bulan",
      originalPrice: "Rp 50.000",
      price: "Rp 15.000",
      discount: "70%",
      duration: "1 Bulan",
      features: [
        "Akses ke SEMUA kursus dan materi",
        "Download modul PDF eksklusif",
        "Grup diskusi komunitas",
        "Update kursus berkala",
        "Forum tanya jawab",
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
        "Akses ke SEMUA kursus dan materi",
        "Download modul PDF eksklusif",
        "Grup diskusi komunitas",
        "Update kursus berkala",
        "Forum tanya jawab",
        "Priority support",
        "Video rekaman materi",
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
        "Akses ke SEMUA kursus dan materi",
        "Download modul PDF eksklusif",
        "Grup diskusi komunitas",
        "Update kursus berkala",
        "Forum tanya jawab",
        "Priority support",
        "Video rekaman materi",
        "Personal learning path",
        "Assessment perkembangan belajar",
        "Berkesempatan menjadi Brand Ambassador"
      ],
      buttonText: "Pilih Paket 1 Tahun",
      popular: false,
      link: "https://lynk.id/ambilprestasi"
    }
  ]

  // Data testimonials
  const testimonials = [
    {
      text: "Dengan paket berlangganan, saya bisa akses semua kursus dan materi pembelajaran. Sangat membantu persiapan lomba!",
      name: "Nina, Mahasiswa Psikologi",
      role: "Peserta Program 4 Bulan",
      rating: 5
    },
    {
      text: "Materi kursusnya lengkap dan selalu update. Pembelajaran jadi lebih terstruktur dan mudah dipahami.",
      name: "Dimas, Fresh Graduate",
      role: "Peserta Program 1 Tahun",
      rating: 5
    },
    {
      text: "Harga sangat terjangkau untuk akses seluas ini. Saya bisa belajar semua topik yang saya butuhkan untuk kompetisi.",
      name: "Rani, Pegawai Swasta",
      role: "Peserta Program 1 Bulan",
      rating: 5
    }
  ]

  // Fungsi untuk handle pemilihan paket
  const handlePackageSelect = (link: string) => {
    window.open(link, '_blank', 'noopener,noreferrer')
  }

  const stats = [
    { value: '180+', label: 'Video Pembelajaran', icon: <Video className="w-4 h-4 sm:w-5 sm:h-5" /> },
    { value: '90+', label: 'Modul Belajar', icon: <FileText className="w-4 h-4 sm:w-6 sm:h-6" /> },
    { value: '2500+', label: 'Peserta Aktif', icon: <Users className="w-4 h-4 sm:w-6 sm:h-6" /> },
    { value: '300+', label: 'Pemenang Kompetisi', icon: <Award className="w-4 h-4 sm:w-6 sm:h-6" /> },
  ]

  const features = [
    {
      icon: <BookOpen className="w-5 h-5 sm:w-6 sm:h-6" />,
      title: "Akses Semua Materi",
      description: "Dapatkan akses ke seluruh modul pembelajaran selama periode berlangganan"
    },
    {
      icon: <Video className="w-5 h-5 sm:w-6 sm:h-6" />,
      title: "Belajar Fleksibel",
      description: "Belajar kapan saja dan di mana saja sesuai dengan waktu luang Anda"
    },
    {
      icon: <Award className="w-5 h-5 sm:w-6 sm:h-6" />,
      title: "Brand Ambassador",
      description: "Kesempatan menjadi brand ambassador dengan benefit eksklusif"
    },
    {
      icon: <Users className="w-5 h-5 sm:w-6 sm:h-6" />,
      title: "Komunitas Eksklusif",
      description: "Bergabung dengan komunitas belajar yang supportive dan inspiratif"
    }
  ]

  const learningPath = [
    {
      step: '1',
      title: 'Belajar Interaktif',
      desc: 'Pelajari konten-konten berkualitas dan tonton video dari mentor berpengalaman.',
      icon: <BookOpen className="w-5 h-5 sm:w-6 sm:h-6" />
    },
    {
      step: '2',
      title: 'Praktik Langsung',
      desc: 'Implementasikan materi dengan latihan dan studi kasus nyata.',
      icon: <Play className="w-5 h-5 sm:w-6 sm:h-6" />
    },
    {
      step: '3',
      title: 'Raih Prestasi',
      desc: 'Siap berkompetisi dan raih prestasi terbaik dengan bekal yang matang!',
      icon: <Award className="w-5 h-5 sm:w-6 sm:h-6" />
    }
  ]

  return (
    <>
      <LayoutNavbar>
        <div className="flex flex-col gap-8 md:gap-16 px-3 sm:px-6 pt-12 md:pt-20">
          {/* Hero Section */}
          <section className="w-full max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 items-center gap-4 md:gap-6 bg-blue-800 rounded-xl p-4 md:p-6 text-white">
              <div className="space-y-3 md:space-y-4 order-2 lg:order-1">
                <div className="flex items-center gap-2 bg-blue-700 rounded-full px-3 py-1 w-fit">
                  <BookOpen className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="text-xs sm:text-sm font-medium">Platform Belajar Premium</span>
                </div>
                
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold leading-tight">
                  Raih Prestasi Terbaik dengan Pembelajaran Berkualitas
                </h1>
                
                <p className="text-blue-100 text-sm sm:text-base leading-relaxed">
                  Akses semua materi pembelajaran premium dengan paket berlangganan.  
                  Belajar dari mentor ahli dan wujudkan impian kompetisimu!
                </p>

                <div className="space-y-2">
                  {[
                    "Akses ke SEMUA materi pembelajaran selama berlangganan",
                    "Konsultasi langsung dengan mentor berpengalaman",
                    "Kesempatan menjadi Brand Ambassador"
                  ].map((item, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <CheckCircle className="text-green-300 flex-shrink-0" size={16} />
                      <span className="text-blue-100 text-xs sm:text-sm">{item}</span>
                    </div>
                  ))}
                </div>

                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-2">
                  <button 
                    onClick={() => document.getElementById('packages-section')?.scrollIntoView({ behavior: 'smooth' })}
                    className="bg-white text-blue-700 px-4 py-2.5 sm:px-6 sm:py-3 rounded-lg font-semibold transition-colors hover:bg-blue-50 shadow-md flex items-center gap-2 justify-center text-sm sm:text-base"
                  >
                    Lihat Paket Harga
                    <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
                  </button>
                  <button 
                    onClick={() => router.push('/elearning')}
                    className="border-2 border-white text-white px-4 py-2.5 sm:px-6 sm:py-3 rounded-lg font-semibold transition-colors hover:bg-white hover:text-blue-700 text-sm sm:text-base"
                  >
                    Jelajahi Kursus
                  </button>
                </div>
              </div>

              <div className="flex justify-center lg:justify-end order-1 lg:order-2">
                <div className="relative w-full max-w-xs sm:max-w-sm">
                  <Image
                    src="/home.png"
                    alt="Home"
                    width={500}
                    height={400}
                    className="rounded-xl object-cover shadow-lg w-full h-auto"
                  />
                  <div className="absolute -bottom-3 -left-3 bg-white rounded-xl p-2 sm:p-3 shadow-md">
                    <div className="flex items-center gap-2">
                      <div className="bg-green-100 p-1.5 sm:p-2 rounded-lg">
                        <Award className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800 text-xs sm:text-sm">300+</p>
                        <p className="text-xs text-gray-600">Pemenang Lomba</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Statistik Section */}
          <section className="w-full max-w-7xl mx-auto">
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              {stats.map((stat, index) => (
                <div
                  key={index}
                  className="bg-white rounded-lg p-3 sm:p-4 shadow-md border border-gray-200"
                >
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="bg-blue-100 p-1.5 sm:p-2 rounded-lg text-blue-700">
                      {stat.icon}
                    </div>
                    <div>
                      <h3 className="text-base sm:text-lg font-bold text-gray-800">{stat.value}</h3>
                      <p className="text-gray-600 text-xs">{stat.label}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Features Section */}
          <section className="w-full max-w-7xl mx-auto">
            <div className="text-center mb-6 md:mb-8">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 sm:mb-3">
                Keunggulan Platform Kami
              </h2>
              <p className="text-gray-700 max-w-2xl mx-auto text-xs sm:text-sm px-2">
                Dapatkan pengalaman belajar terbaik dengan fitur-fitur premium yang kami sediakan
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="bg-white rounded-lg p-3 sm:p-4 shadow-md border border-gray-200 text-center"
                >
                  <div className="bg-blue-100 p-2 sm:p-3 rounded-lg w-fit mx-auto mb-2 sm:mb-3 text-blue-700">
                    {feature.icon}
                  </div>
                  <h3 className="font-bold text-sm sm:text-base mb-1 text-gray-800">{feature.title}</h3>
                  <p className="text-gray-600 text-xs leading-relaxed">{feature.description}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Pricing Section */}
          <section id="packages-section" className="w-full max-w-7xl mx-auto">
            <div className="text-center mb-6 md:mb-8">
              <h2 className="text-xl sm:text-2xl font-bold text-blue-800 mb-2 sm:mb-3">
                Paket Berlangganan
              </h2>
              <p className="text-gray-600 text-xs sm:text-sm max-w-2xl mx-auto px-2">
                Pilih paket berlangganan yang sesuai dengan kebutuhan belajar Anda. Akses semua materi selama periode berlangganan!
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 md:gap-6 md:grid-cols-2 lg:grid-cols-3">
              {plans.map((plan, index) => (
                <div
                  key={index}
                  className={`bg-white rounded-xl p-4 sm:p-6 shadow-lg border-2 ${
                    plan.popular 
                      ? 'border-blue-600 relative' 
                      : 'border-gray-200'
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs sm:text-sm font-semibold">
                        Paling Populer
                      </span>
                    </div>
                  )}
                  
                  <div className="text-center mb-4 sm:mb-6">
                    <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-2">{plan.name}</h3>
                    <div className="flex flex-col items-center gap-1 sm:gap-2 mb-2">
                      <div className="flex items-baseline gap-1 sm:gap-2">
                        <span className="text-sm sm:text-xl line-through text-gray-400">{plan.originalPrice}</span>
                        <span className="text-lg sm:text-2xl font-bold text-blue-600">{plan.price}</span>
                      </div>
                      <span className="bg-red-100 text-red-600 px-2 py-1 rounded-full text-xs sm:text-sm font-semibold">
                        Hemat {plan.discount}
                      </span>
                    </div>
                    <p className="text-gray-600 font-semibold text-sm">{plan.duration} Akses Penuh</p>
                  </div>

                  <div className="mb-3 sm:mb-4 p-2 sm:p-3 bg-blue-50 rounded-lg text-center">
                    <p className="text-blue-700 font-semibold text-xs sm:text-sm">
                      ✅ Akses ke SEMUA Materi Pembelajaran
                    </p>
                  </div>

                  <ul className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-gray-600">
                        <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-xs sm:text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <button 
                    onClick={() => handlePackageSelect(plan.link)}
                    className={`w-full py-2.5 sm:py-3 rounded-lg font-semibold transition-colors text-sm sm:text-base ${
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

            <div className="text-center mt-6 md:mt-8">
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 sm:p-4 max-w-2xl mx-auto">
                <p className="text-green-700 font-semibold text-sm sm:text-base">
                  💫 Spesial Diskon 70%! Akses semua materi dengan harga terjangkau
                </p>
                <p className="text-green-600 text-xs sm:text-sm mt-1">
                  Dapatkan kesempatan menjadi Brand Ambassador dan berbagai benefit eksklusif lainnya
                </p>
              </div>
            </div>
          </section>

          {/* Testimonials Section */}
          <section className="w-full max-w-7xl mx-auto">
            <div className="bg-blue-700 rounded-xl p-4 md:p-6 text-white">
              <div className="text-center mb-6 md:mb-8">
                <h2 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-3">
                  Testimoni Peserta
                </h2>
                <p className="text-blue-100 text-xs sm:text-sm max-w-2xl mx-auto px-2">
                  Dengarkan pengalaman langsung dari peserta yang telah merasakan manfaat program berlangganan kami
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 md:gap-6 md:grid-cols-3">
                {testimonials.map((testimonial, index) => (
                  <div
                    key={index}
                    className="bg-blue-600 rounded-lg p-3 sm:p-4 shadow-lg"
                  >
                    <div className="flex gap-1 mb-2 sm:mb-3">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star 
                          key={i} 
                          className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400 fill-current" 
                        />
                      ))}
                    </div>
                    <p className="text-blue-100 italic mb-2 sm:mb-3 leading-relaxed text-xs sm:text-sm">
                      &quot;{testimonial.text}&quot;
                    </p>
                    <div>
                      <p className="font-semibold text-sm">{testimonial.name}</p>
                      <p className="text-blue-200 text-xs">{testimonial.role}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Alur Pembelajaran */}
          <section className="w-full max-w-7xl mx-auto">
            <div className="bg-blue-100 rounded-xl p-4 md:p-6">
              <div className="text-center mb-6 md:mb-8">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 sm:mb-3">
                  Alur Pembelajaran
                </h2>
                <p className="text-gray-700 max-w-2xl mx-auto text-xs sm:text-sm px-2">
                  Ikuti langkah-langkah sistematis untuk mencapai kesuksesan dalam kompetisi
                </p>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-3">
                {learningPath.map((step, index) => (
                  <div
                    key={index}
                    className="bg-white rounded-lg p-3 sm:p-4 shadow-md text-center"
                  >
                    <div className="bg-blue-700 text-white w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-sm sm:text-base font-bold mb-2 sm:mb-3 mx-auto">
                      {step.step}
                    </div>
                    <div className="bg-blue-200 text-blue-700 p-1.5 sm:p-2 rounded-lg w-fit mx-auto mb-2 sm:mb-3">
                      {step.icon}
                    </div>
                    <h3 className="font-bold text-sm sm:text-base mb-1 sm:mb-2 text-gray-800">{step.title}</h3>
                    <p className="text-gray-600 leading-relaxed text-xs sm:text-sm">{step.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="w-full max-w-7xl mx-auto">
            <div className="bg-blue-700 rounded-xl p-4 md:p-6 text-white text-center">
              <h2 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-3">
                Siap Mengembangkan Potensimu?
              </h2>
              <p className="text-blue-100 mb-4 sm:mb-6 max-w-2xl mx-auto text-xs sm:text-sm px-2">
                Bergabung dengan ribuan peserta lainnya dan raih prestasi terbaik melalui program kami.
              </p>
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-center">
                <button 
                  onClick={() => document.getElementById('packages-section')?.scrollIntoView({ behavior: 'smooth' })}
                  className="bg-white text-blue-700 px-4 py-2.5 sm:px-6 sm:py-3 rounded-lg font-semibold transition-colors hover:bg-blue-50 shadow-md flex items-center gap-2 justify-center text-sm sm:text-base"
                >
                  <BookOpen className="w-3 h-3 sm:w-4 sm:h-4" />
                  Pilih Paket Belajar
                </button>
                <button 
                  onClick={() => router.push('/elearning')}
                  className="border-2 border-white text-white px-4 py-2.5 sm:px-6 sm:py-3 rounded-lg font-semibold transition-colors hover:bg-white hover:text-blue-700 text-sm sm:text-base"
                >
                  Lihat Kursus
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