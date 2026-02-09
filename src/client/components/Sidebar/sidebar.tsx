"use client"

import { useState, useEffect } from "react"
import { Timer, Tag, Flame, Check, ChevronLeft, ChevronRight, Package } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import type { Promotion } from "../../lib/api"
import { useCart } from "../../context/CartContext"

const categories = [
  { id: "popular", label: "Tout", image: "/images/all.png" },
  { id: "burger", label: "Burger", image: "/images/Barger.png" },
  { id: "sandwich", label: "Sandwich", image: "/images/sndwich.png" },
  { id: "pizza", label: "Pizza", image: "/images/pizza.png" },
  { id: "plat", label: "Plat", image: "/images/plat.png" },
  { id: "tacos", label: "Tacos", image: "/images/tacos.png" },
  { id: "desserts", label: "Desserts", image: "/images/dessert.png" },
  { id: "drinks", label: "Boissons", image: "/images/drinks.png" },
]

type Props = {
  onSelectCategory: (categoryId: string) => void
  onClose?: () => void
  promotions?: Promotion[]
}

export default function RestaurantLayout({ onSelectCategory, onClose, promotions = [] }: Props) {
  const [selectedCategory, setSelectedCategory] = useState("popular")
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAdding, setIsAdding] = useState(false)
  const [direction, setDirection] = useState(0)
  const [mobileSlideIndex, setMobileSlideIndex] = useState(0)
  const { addToCart } = useCart()

  useEffect(() => {
    if (promotions.length <= 1) return
    const interval = setInterval(() => {
      nextSlide()
    }, 6000)
    return () => clearInterval(interval)
  }, [promotions, currentIndex])

  useEffect(() => {
    const totalSlides = promotions.length + 1
    const interval = setInterval(() => {
      setMobileSlideIndex((prev) => (prev + 1) % totalSlides)
    }, 4000)
    return () => clearInterval(interval)
  }, [promotions])

  const handleCategoryClick = (categoryId: string) => {
    setSelectedCategory(categoryId)
    onSelectCategory(categoryId)
    if (onClose) onClose()
  }

  const nextSlide = () => {
    setDirection(1)
    setCurrentIndex((prev) => (prev + 1) % promotions.length)
  }

  const prevSlide = () => {
    setDirection(-1)
    setCurrentIndex((prev) => (prev - 1 + promotions.length) % promotions.length)
  }

  const colorThemes: Record<string, { bg: string; accent: string; light: string; text: string }> = {
    percentage: {
      bg: "bg-slate-950",
      accent: "from-amber-400 to-orange-500",
      light: "bg-amber-500/10",
      text: "text-amber-400"
    },
    fixed_amount: {
      bg: "bg-slate-950",
      accent: "from-emerald-400 to-teal-500",
      light: "bg-emerald-500/10",
      text: "text-emerald-400"
    },
    combo_fixed_price: {
      bg: "bg-slate-950",
      accent: "from-indigo-400 to-violet-500",
      light: "bg-indigo-500/10",
      text: "text-indigo-400"
    }
  }

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0,
      scale: 0.9,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
      scale: 1,
      transition: {
        x: { type: "spring", stiffness: 300, damping: 30 } as const,
        opacity: { duration: 0.4 },
        scale: { duration: 0.4 }
      }
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0,
      scale: 1.1,
      transition: {
        x: { type: "spring", stiffness: 300, damping: 30 } as const,
        opacity: { duration: 0.4 }
      }
    })
  }

  const hasPromotions = promotions.length > 0
  const current = hasPromotions ? promotions[currentIndex] : null
  const theme = current ? (colorThemes[current.promotion_type] || colorThemes.percentage) : null

  const handleAction = (promo: Promotion) => {
    if (!promo) return
    if (promo.promotion_type === 'combo_fixed_price') {
      setIsAdding(true)
      addToCart({
        id: `promo_${promo.id}`,
        name: promo.name,
        price: parseFloat(promo.value),
        quantity: 1,
      })
      setTimeout(() => setIsAdding(false), 1500)
    } else {
      const menuElement = document.getElementById('menu-grid') || document.querySelector('main')
      if (menuElement) {
        menuElement.scrollIntoView({ behavior: 'smooth' })
      }
    }
  }

  return (
    <div className="bg-gray-50 pb-8">
      <div
        className={`
          mx-2 mt-3 sm:mx-4 sm:mt-4
          rounded-3xl overflow-hidden shadow-2xl relative
          text-white
          h-[180px] md:h-auto
          ${mobileSlideIndex === 0 ? 'bg-[#3A2C1C]' : 'bg-transparent'}
          md:bg-[#3A2C1C]
        `}
      >
        {(mobileSlideIndex === 0 || typeof window !== 'undefined' && window.innerWidth >= 768) && (
          <div className="absolute inset-0 opacity-25">
            <img
              src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200"
              alt="fond nourriture"
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div
          className={`
            relative flex items-center justify-between gap-6
            flex-wrap sm:flex-nowrap
            h-full
            ${mobileSlideIndex === 0 ? 'px-4 sm:px-8 py-6 sm:py-10' : 'p-0'}
            md:px-8 md:py-10
          `}
        >
          <div className={`flex items-center gap-4 z-10 ${mobileSlideIndex !== 0 && hasPromotions ? 'hidden' : 'flex'} md:flex`}>
            <div
              className="
                w-16 h-16 sm:w-20 sm:h-20
                rounded-full bg-[#392c1c]
                flex items-center justify-center
                shadow-lg overflow-hidden
              "
            >
              <img
                  src="https://firebasestorage.googleapis.com/v0/b/daroui.firebasestorage.app/o/imageapp%2Flogo.png?alt=media&token=baa79678-993f-4229-bf66-a89f5fa28a8a"
                alt="logo"
                className="w-12 h-12 sm:w-14 sm:h-14 object-contain"
              />
            </div>

            <div>
              <h1 className="text-2xl sm:text-3xl font-black mb-1">
                Nostalgie
              </h1>
              <p className="text-xs sm:text-sm text-indigo-200">
                Toujours frais par Daroui Market
              </p>
            </div>
          </div>

          <div className="hidden md:flex z-10">
            <div
              className="
                overflow-hidden relative
                w-48 h-56
                bg-[#FF5C5C]
                rounded-xl
                text-white
                flex flex-col
                justify-between
                items-center
                p-3
                shadow-xl
              "
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 100 100"
                preserveAspectRatio="xMidYMid meet"
                className="absolute opacity-20 -rotate-12 -bottom-10 -right-10 w-32 h-32 stroke-current"
              >
                <path
                  strokeWidth="7"
                  strokeLinejoin="round"
                  strokeLinecap="round"
                  fill="none"
                  d="M65.8,46.1V30.3a15.8,15.8,0,1,0-31.6,0V46.1M22.4,38.2H77.6l4,47.3H18.4Z"
                />
              </svg>

              <div className="z-10 text-center">
                <p className="text-sm font-extrabold uppercase tracking-wider">
                  {current?.promotion_type === "percentage" ? "Remise" : "Offre"}
                </p>
                <p className="text-[10px] opacity-90">
                  Limitée
                </p>
              </div>

              <h2 className="z-10 text-xs font-semibold text-center px-1 leading-tight">
                {current?.name}
              </h2>

              <span className="z-10 font-extrabold text-5xl -skew-x-12 -skew-y-12">
                {current?.promotion_type === "percentage"
                  ? `${parseInt(current.value)}%`
                  : `${current?.value} DA`}
              </span>

              <button
                onClick={() => current && handleAction(current)}
                disabled={isAdding}
                className="
                  z-10 text-xs
                  font-bold px-3 py-1.5
                  bg-white text-[#FF5C5C]
                  hover:bg-[#3A2C1C] hover:text-white
                  rounded
                "
              >
                {isAdding ? "Ajouté" : "Acheter"}
              </button>

              <p className="z-10 text-[9px] opacity-80">
                *Offre limitée
              </p>
            </div>
          </div>

          <div className="md:hidden z-10 w-full h-full flex items-center justify-center">
            {mobileSlideIndex > 0 && hasPromotions ? (
              <div className="relative w-full h-full overflow-hidden rounded-xl">
                <AnimatePresence initial={false} custom={direction}>
                  {promotions[mobileSlideIndex - 1] && (
                    <motion.div
                      key={`promo-${mobileSlideIndex}`}
                      custom={direction}
                      variants={variants}
                      initial="enter"
                      animate="center"
                      exit="exit"
                      className="absolute w-full h-full"
                    >
                      <div
                        className="
                          overflow-hidden relative
                          w-full h-full
                          bg-[#FF5C5C]
                          rounded-xl
                          text-white
                          flex flex-col
                          justify-between
                          items-center
                          p-4
                          shadow-xl
                        "
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 100 100"
                          preserveAspectRatio="xMidYMid meet"
                          className="absolute opacity-20 -rotate-12 -bottom-10 -right-10 w-40 h-40 stroke-current"
                        >
                          <path
                            strokeWidth="7"
                            strokeLinejoin="round"
                            strokeLinecap="round"
                            fill="none"
                            d="M65.8,46.1V30.3a15.8,15.8,0,1,0-31.6,0V46.1M22.4,38.2H77.6l4,47.3H18.4Z"
                          />
                        </svg>

                        <div className="z-10 text-center">
                          <p className="text-base font-extrabold uppercase tracking-wider">
                            {promotions[mobileSlideIndex - 1].promotion_type === "percentage"
                              ? "Remise"
                              : "Offre"}
                          </p>
                          <p className="text-xs opacity-90">
                            Offre limitée
                          </p>
                        </div>

                        <h2 className="z-10 text-sm font-semibold text-center px-2 leading-tight">
                          {promotions[mobileSlideIndex - 1].name}
                        </h2>

                        <span className="z-10 font-extrabold text-6xl -skew-x-12 -skew-y-12">
                          {promotions[mobileSlideIndex - 1].promotion_type === "percentage"
                            ? `${parseInt(promotions[mobileSlideIndex - 1].value)}%`
                            : `${promotions[mobileSlideIndex - 1].value} DA`}
                        </span>

                        <button
                          onClick={() => handleAction(promotions[mobileSlideIndex - 1])}
                          disabled={isAdding}
                          className="
                            z-10 text-sm
                            font-bold px-4 py-2
                            bg-white text-[#FF5C5C]
                            hover:bg-[#3A2C1C] hover:text-white
                            rounded
                            transition-colors
                          "
                        >
                          {isAdding ? "Ajouté" : "Acheter maintenant"}
                        </button>

                        <p className="z-10 text-[10px] opacity-80">
                          *Offre limitée
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-2 z-20">
                  {[...Array(promotions.length + 1)].map((_, idx) => (
                    <div
                      key={idx}
                      className={`w-2 h-2 rounded-full transition-all ${
                        mobileSlideIndex === idx ? "bg-white w-6" : "bg-white/50"
                      }`}
                    />
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <div className="px-4 mt-6">
        <div className="flex gap-3 overflow-x-auto lg:justify-center pb-4 scrollbar-hide snap-x snap-mandatory">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => handleCategoryClick(category.id)}
              className={`
                flex-shrink-0 w-28 h-36 sm:w-36 sm:h-44 rounded-2xl 
                flex flex-col items-center justify-center gap-2 
                transition-all duration-300 snap-center 
                ${
                  selectedCategory === category.id
                    ? "bg-[#3A2C1C] text-white"
                    : "bg-[#F5E6D3] text-[#3A2C1C] hover:scale-105"
                }
              `}
            >
              <div
                className={`
                  w-20 h-20 sm:w-24 sm:h-24 flex items-center justify-center 
                  transition-transform duration-300
                  ${
                    selectedCategory === category.id
                      ? "scale-110"
                      : "scale-100"
                  }
                `}
              >
                <img
                  src={category.image}
                  alt={category.label}
                  className="w-full h-full object-contain drop-shadow-md"
                />
              </div>

              <span
                className={`
                  font-bold text-sm sm:text-base px-2 text-center leading-tight
                  ${
                    selectedCategory === category.id
                      ? "text-white"
                      : "text-[#3A2C1C]"
                  }
                `}
              >
                {category.label}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}