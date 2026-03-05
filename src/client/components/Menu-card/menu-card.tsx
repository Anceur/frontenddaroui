import { useState, useMemo } from "react"
import { useCart } from "../../context/CartContext"
import type { Promotion } from "../../lib/api"

interface MenuItemSize {
  id: number
  size: string
  price: number | string
}

export interface MenuItemExtra {
  id: number | string
  name: string
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
  extras?: MenuItemExtra[]
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
  const [selectedExtras, setSelectedExtras] = useState<MenuItemExtra[]>([])
  const [isAdding, setIsAdding] = useState(false)
  const [isFlipped, setIsFlipped] = useState(false)
  const { addToCart } = useCart()

  const toggleExtra = (extra: MenuItemExtra) => {
    setSelectedExtras(prev =>
      prev.some(e => e.id === extra.id)
        ? prev.filter(e => e.id !== extra.id)
        : [...prev, extra]
    )
  }

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
    let finalPrice = basePrice
    if (activePromo) {
      if (activePromo.promotion_type === "percentage") {
        finalPrice = basePrice * (1 - parseFloat(activePromo.value) / 100)
      } else if (activePromo.promotion_type === "fixed_amount") {
        finalPrice = Math.max(0, basePrice - parseFloat(activePromo.value))
      }
    }
    const extrasPrice = selectedExtras.reduce((sum, extra) => sum + Number(extra.price), 0)
    return finalPrice + extrasPrice
  }

  const getOriginalPrice = () => {
    let basePrice = Number(item.price)
    if (item.sizes && selectedSize) {
      const sizeOption = item.sizes.find(s => s.size === selectedSize)
      if (sizeOption) basePrice = Number(sizeOption.price)
    }
    const extrasPrice = selectedExtras.reduce((sum, extra) => sum + Number(extra.price), 0)
    return basePrice + extrasPrice
  }

  const handleAddToCart = () => {
    if (item.sizes && item.sizes.length > 1 && !selectedSize) return
    setIsAdding(true)
    const extrasKey = selectedExtras.length > 0
      ? "-" + selectedExtras.map(e => e.id).sort().join("-")
      : ""
    addToCart({
      id: String(item.id) + (selectedSize ? `-${selectedSize}` : "") + extrasKey,
      name: item.name + (selectedSize && item.sizes && item.sizes.length > 1 ? ` (${selectedSize})` : ""),
      price: getCurrentPrice(),
      image: item.image || undefined,
      quantity: 1,
      extras: selectedExtras,
    })
    setTimeout(() => setIsAdding(false), 600)
  }

  const isButtonDisabled =
    isAdding || (item.sizes && item.sizes.length > 1 && !selectedSize)

  return (
    <div style={{ perspective: "1200px" }} className="w-full h-full">
      <div
        className="relative w-full h-full"
        style={{
          transformStyle: "preserve-3d",
          transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
          transition: "transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
          minHeight: "520px",
        }}
      >
        {/* ─────────────────── FRONT FACE ─────────────────── */}
        <div
          className="absolute inset-0 bg-[#f5e6d3] rounded-2xl overflow-hidden shadow-md flex flex-col"
          style={{ backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden" }}
        >
          {/* Image */}
          <div className="relative w-full h-56 overflow-hidden rounded-t-3xl flex-shrink-0">
            {item.image ? (
              <img
                src={item.image}
                alt={item.name}
                className="w-full h-full object-cover transition-transform duration-700 hover:scale-110"
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
            <h3 className="text-xl font-bold text-gray-900 mb-2">{item.name}</h3>

            <p className="text-sm text-gray-500 leading-relaxed mb-4 line-clamp-2">
              {item.description ||
                "Savourez notre spécialité préparée avec soin, à base d'ingrédients de qualité pour une expérience gustative nostalgique."}
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
                      <div className="text-xs">{Number(sizeOption.price).toFixed(0)} DA</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Supplements trigger button — only shown when extras exist */}
            {item.extras && item.extras.length > 0 && (
              <button
                onClick={() => setIsFlipped(true)}
                className="mb-4 w-full flex flex-col px-4 py-3 rounded-xl border-2 border-amber-200 bg-amber-50 hover:bg-amber-100 hover:border-amber-400 transition-all group text-left"
              >
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-2">
                    <span className="text-amber-500 text-base">✨</span>
                    <span className="text-sm font-semibold text-gray-700">Suppléments</span>
                    {selectedExtras.length > 0 && (
                      <span className="bg-amber-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                        {selectedExtras.length}
                      </span>
                    )}
                  </div>
                  <span className="text-amber-500 font-bold text-lg group-hover:translate-x-1 transition-transform">
                    →
                  </span>
                </div>
                {/* Selected extras chips summary */}
                {selectedExtras.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {selectedExtras.map(e => (
                      <span
                        key={e.id}
                        className="bg-amber-100 border border-amber-300 text-amber-800 text-xs font-semibold px-2 py-0.5 rounded-full"
                      >
                        {e.name}
                      </span>
                    ))}
                  </div>
                )}
              </button>
            )}

            <div className="flex-grow" />

            {/* Footer */}
            <div className="pt-4 border-t border-gray-100">
              <div className="flex items-end justify-between gap-1">
                {/* Price */}
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

                {/* Add to cart button */}
                <button
                  onClick={handleAddToCart}
                  disabled={isButtonDisabled}
                  className={`
                    flex-shrink min-w-[130px] max-w-[180px] h-[40px]
                    flex items-center justify-center gap-1.5
                    rounded-2xl font-bold text-sm shadow-lg transition-all px-3 overflow-hidden
                    ${isButtonDisabled
                      ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                      : "bg-[#fe9a00] text-white hover:brightness-110 hover:scale-105"
                    }
                  `}
                >
                  <span className="text-base leading-none">🛒</span>
                  <span className="leading-none">{isAdding ? "Ajouté" : "Ajouter"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ─────────────────── BACK FACE (Supplements) ─────────────────── */}
        <div
          className="absolute inset-0 bg-[#fdf8f2] rounded-2xl overflow-hidden shadow-md flex flex-col"
          style={{
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
          }}
        >
          {/* Header */}
          <div className="bg-[#fe9a00] px-5 py-4 flex items-center justify-between flex-shrink-0">
            <div>
              <h3 className="text-white font-bold text-lg leading-tight">{item.name}</h3>
              <p className="text-amber-100 text-xs mt-0.5">Choisissez vos suppléments</p>
            </div>
            <button
              onClick={() => setIsFlipped(false)}
              className="bg-white/20 hover:bg-white/30 text-white rounded-full w-9 h-9 flex items-center justify-center transition-colors text-lg font-bold flex-shrink-0"
              aria-label="Retour"
            >
              ←
            </button>
          </div>

          {/* Extras list — no flex-grow so height wraps content */}
          <div className="px-5 pt-4 pb-2 flex flex-col gap-2.5">
            {item.extras && item.extras.map(extra => {
              const checked = selectedExtras.some(e => e.id === extra.id)
              return (
                <label
                  key={extra.id}
                  className={`flex items-center justify-between p-3.5 rounded-2xl border-2 cursor-pointer transition-all ${
                    checked
                      ? "border-amber-400 bg-amber-50 shadow-sm"
                      : "border-gray-200 bg-white hover:border-amber-300 hover:bg-amber-50/50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {/* Custom checkbox */}
                    <div
                      className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                        checked
                          ? "border-amber-500 bg-amber-500 scale-110"
                          : "border-gray-300 bg-white"
                      }`}
                    >
                      {checked && (
                        <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <span className={`text-sm font-bold tracking-wide uppercase ${checked ? "text-gray-900" : "text-gray-600"}`}>
                      {extra.name}
                    </span>
                  </div>
                  <span className={`text-sm font-bold ml-2 flex-shrink-0 ${checked ? "text-amber-600" : "text-gray-400"}`}>
                    +{Number(extra.price).toFixed(0)} DA
                  </span>
                  <input type="checkbox" checked={checked} onChange={() => toggleExtra(extra)} className="sr-only" />
                </label>
              )
            })}
          </div>

          {/* Spacer pushes footer to bottom */}
          <div className="flex-grow" />

          {/* Footer */}
          <div className="px-5 py-4 border-t border-gray-100 bg-white flex-shrink-0 rounded-b-2xl">
            {/* Extras total line */}
            {selectedExtras.length > 0 && (
              <p className="text-xs text-gray-400 mb-1">
                {selectedExtras.length} supplément{selectedExtras.length !== 1 ? "s" : ""} · +{selectedExtras.reduce((s, e) => s + Number(e.price), 0).toFixed(0)} DA
              </p>
            )}
            <div className="flex items-center justify-between">
              <div>
                {activePromo && (
                  <span className="text-sm text-gray-400 line-through font-semibold block">
                    {getOriginalPrice().toFixed(0)} DA
                  </span>
                )}
                <div className="text-2xl font-bold text-gray-900 leading-none">
                  {getCurrentPrice().toFixed(0)} DA
                </div>
              </div>

              <button
                onClick={() => {
                  handleAddToCart()
                  setIsFlipped(false)
                }}
                disabled={isButtonDisabled}
                className={`
                  min-w-[130px] h-[44px]
                  flex items-center justify-center gap-2
                  rounded-2xl font-bold text-sm shadow-lg transition-all px-4
                  ${isButtonDisabled
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                    : "bg-[#fe9a00] text-white hover:brightness-110 hover:scale-105 active:scale-95"
                  }
                `}
              >
                <span className="text-base">🛒</span>
                <span>{isAdding ? "Ajouté ✓" : "Ajouter"}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}