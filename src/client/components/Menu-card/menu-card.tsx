import { useState, useMemo } from "react"
import { useCart } from "../../context/CartContext"
import type { Promotion } from "../../lib/api"

interface MenuItemSize {
  id: number
  size: string
  price: number | string
}

interface MenuItem {
  id: number | string
  name: string
  description?: string
  category: string
  price: number | string
  weight?: string
  image: string
  featured?: boolean
  tags?: string[]
  sizes?: MenuItemSize[]
}

const categoryColors: Record<string, { bg: string; text: string }> = {
  pizza: { bg: "bg-amber-50", text: "text-amber-600" },
  burger: { bg: "bg-orange-50", text: "text-orange-600" },
  sandwich: { bg: "bg-yellow-50", text: "text-yellow-600" },
  tacos: { bg: "bg-red-50", text: "text-red-600" },
}

interface MenuCardProps {
  item: MenuItem
  promotions: Promotion[]
}

export default function MenuCard({ item, promotions }: MenuCardProps) {
  const hasOnlyDefaultSize =
    item.sizes && item.sizes.length === 1 && item.sizes[0].size === "M"

  const [selectedSize, setSelectedSize] = useState<string | null>(
    hasOnlyDefaultSize ? "M" : null
  )
  const [isAdding, setIsAdding] = useState(false)
  const { addToCart } = useCart()

  const activePromo = useMemo(() => {
    if (selectedSize && item.sizes) {
      const currentSizeObj = item.sizes.find(s => s.size === selectedSize)
      if (currentSizeObj) {
        const sizePromo = promotions.find(
          p =>
            p.applicable_sizes.includes(Number(currentSizeObj.id)) &&
            p.display_status === "Live"
        )
        if (sizePromo) return sizePromo
      }
    }

    return promotions.find(
      p =>
        p.applicable_items.includes(Number(item.id)) &&
        p.display_status === "Live"
    )
  }, [promotions, item.id, selectedSize, item.sizes])

  const getCurrentPrice = () => {
    let basePrice = Number(item.price)
    if (item.sizes && selectedSize) {
      const sizeOption = item.sizes.find(s => s.size === selectedSize)
      if (sizeOption) basePrice = Number(sizeOption.price)
    }

    if (activePromo) {
      if (activePromo.promotion_type === "percentage") {
        return basePrice * (1 - parseFloat(activePromo.value) / 100)
      } else if (activePromo.promotion_type === "fixed_amount") {
        return Math.max(0, basePrice - parseFloat(activePromo.value))
      }
    }
    return basePrice
  }

  const getOriginalPrice = () => {
    if (item.sizes && selectedSize) {
      const sizeOption = item.sizes.find(s => s.size === selectedSize)
      return sizeOption ? Number(sizeOption.price) : Number(item.price)
    }
    return Number(item.price)
  }

  const handleAddToCart = () => {
    if (item.sizes && item.sizes.length > 1 && !selectedSize) return
    setIsAdding(true)
    addToCart({
      id: String(item.id) + (selectedSize || ""),
      name: item.name,
      price: getCurrentPrice(),
      image: item.image || undefined,
      quantity: 1,
    })
    setTimeout(() => setIsAdding(false), 600)
  }

  const isButtonDisabled =
    isAdding || (item.sizes && item.sizes.length > 1 && !selectedSize)

  return (
    <div className="bg-[#f5e6d3] rounded-2xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 flex flex-col h-full w-full">
      {/* Image */}
      <div className="relative w-full h-56 overflow-hidden rounded-t-3xl">
        {item.image ? (
          <img
            src={item.image}
            alt={item.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-[#f3f4f6]">
            <div className="text-gray-400 text-sm font-medium">🍽️</div>
          </div>
        )}

        {/* Featured Badge */}
        {item.featured && (
          <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm text-amber-600 text-xs font-bold px-3 py-2 rounded-full shadow-lg flex items-center gap-1.5">
            <span className="text-base">⭐</span>
            <span>Vedette</span>
          </div>
        )}

        {/* Promo Badge */}
        {activePromo && (
          <div
            className="absolute top-4 left-4 text-white text-xs font-bold px-4 py-2 rounded-full shadow-xl"
            style={{ backgroundColor: "#DC2626" }}
          >
            {activePromo.promotion_type === "percentage"
              ? `${parseInt(activePromo.value)}% DE RÉDUCTION`
              : "OFFRE SPÉCIALE"}
          </div>
        )}

        {/* Category */}
        <div className="absolute bottom-4 left-4">
          <span className="bg-white/95 backdrop-blur-sm text-gray-800 text-xs font-bold px-4 py-2 rounded-full shadow-lg">
            {item.category.toUpperCase()}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="px-5 pb-5 pt-4 flex flex-col flex-grow bg-[#fdf8f2]">
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          {item.name}
        </h3>

        <p className="text-sm text-gray-500 leading-relaxed mb-4 line-clamp-2">
          {item.description ||
            "Savourez notre spécialité préparée avec soin, à base d’ingrédients de qualité pour une expérience gustative nostalgique."}
        </p>

        {/* Sizes */}
        {item.sizes && item.sizes.length > 1 && (
          <div className="mb-4">
            <p className="text-xs font-semibold text-gray-400 mb-2.5 uppercase tracking-wider">
              Choisir la taille
            </p>

            <div className="flex gap-2">
              {item.sizes.map(sizeOption => (
                <button
                  key={sizeOption.size}
                  onClick={() => setSelectedSize(sizeOption.size)}
                  className={`flex-1 py-3 px-3 rounded-xl font-semibold text-sm border-2 transition-all ${
                    selectedSize === sizeOption.size
                      ? "bg-[#FDF8F2] text-gray-900 border-amber-500"
                      : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  <div className="font-bold">{sizeOption.size}</div>
                  <div className="text-xs">
                    {Number(sizeOption.price).toFixed(0)} DA
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex-grow"></div>
   {/*footer*/}
        
        <div className="pt-4 border-t border-gray-100">
          <div className="flex items-end justify-between gap-1">

            {/* PRICE (FIXED HEIGHT) */}
            <div className="flex flex-col justify-end min-h-[72px] flex-shrink-0">
              {activePromo && (
                <span className="text-sm text-gray-400 line-through font-semibold">
                  {getOriginalPrice().toFixed(0)} DA
                </span>
              )}
              <div className="text-3xl font-bold text-gray-900 leading-none whitespace-nowrap">
                {getCurrentPrice().toFixed(0)} DA
              </div>
            </div>

            {/* BUTTON (CHROME-COMPATIBLE) */}
            <button
              onClick={handleAddToCart}
              disabled={isButtonDisabled}
              className={`
                flex-shrink
                min-w-[140px]
                max-w-[180px]
                h-[54px]
                flex items-center justify-center gap-1.5
                rounded-2xl
                font-bold text-sm
                shadow-lg
                transition-all
                px-3
                overflow-hidden
                ${
                  isButtonDisabled
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                    : "bg-[#fe9a00] text-white hover:brightness-110 hover:scale-105"
                }
              `}
            >
              <span className="text-base leading-none">🛒</span>
              <span className="leading-none">
                {isAdding ? "Ajouté" : "Ajouter"}
              </span>
            </button>

          </div>
        </div>
      </div>
    </div>
  )
}
