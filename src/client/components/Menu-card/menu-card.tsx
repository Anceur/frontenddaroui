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
  const [selectedExtras, setSelectedExtras] = useState<MenuItemExtra[]>([])
  const [isAdding, setIsAdding] = useState(false)
  const [flipped, setFlipped] = useState(false)
  const { addToCart } = useCart()

  const hasExtras = !!(item.extras && item.extras.length > 0)

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
    const extrasPrice = selectedExtras.reduce((sum, e) => sum + Number(e.price), 0)
    return finalPrice + extrasPrice
  }

  const getOriginalPrice = () => {
    let basePrice = Number(item.price)
    if (item.sizes && selectedSize) {
      const sizeOption = item.sizes.find(s => s.size === selectedSize)
      if (sizeOption) basePrice = Number(sizeOption.price)
    }
    const extrasPrice = selectedExtras.reduce((sum, e) => sum + Number(e.price), 0)
    return basePrice + extrasPrice
  }

  const commitToCart = () => {
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
    setFlipped(false)
    setTimeout(() => setIsAdding(false), 600)
  }

  const handleAddToCart = () => {
    if (item.sizes && item.sizes.length > 1 && !selectedSize) return
    if (hasExtras) { setFlipped(true); return }
    commitToCart()
  }

  const isButtonDisabled =
    isAdding || (item.sizes && item.sizes.length > 1 && !selectedSize)

  const extrasTotal = selectedExtras.reduce((s, e) => s + Number(e.price), 0)

  return (
    <div
      style={{ perspective: "1200px" }}
      className="h-full w-full"
    >
      <div
        style={{
          transformStyle: "preserve-3d",
          transition: "transform 0.6s cubic-bezier(0.4, 0.2, 0.2, 1)",
          transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
          position: "relative",
          height: "100%",
          width: "100%",
        }}
      >

        {/* ══════════════ FRONT ══════════════ */}
        <div
          style={{ backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden" }}
          className="absolute inset-0 bg-[#f5e6d3] rounded-2xl overflow-hidden shadow-md flex flex-col h-full w-full"
        >
          {/* Image */}
          <div className="relative w-full h-56 overflow-hidden rounded-t-3xl flex-shrink-0">
            {item.image ? (
              <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-[#f3f4f6]">
                <span className="text-gray-400 text-sm font-medium">🍽️</span>
              </div>
            )}
            {item.featured && (
              <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm text-amber-600 text-xs font-bold px-3 py-2 rounded-full shadow-lg flex items-center gap-1.5">
                <span>⭐</span><span>Vedette</span>
              </div>
            )}
            {activePromo && (
              <div className="absolute top-4 left-4 text-white text-xs font-bold px-4 py-2 rounded-full shadow-xl" style={{ backgroundColor: "#DC2626" }}>
                {activePromo.promotion_type === "percentage"
                  ? `${parseInt(activePromo.value)}% DE RÉDUCTION`
                  : "OFFRE SPÉCIALE"}
              </div>
            )}
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
              {item.description || "Savourez notre spécialité préparée avec soin, à base d'ingrédients de qualité pour une expérience gustative nostalgique."}
            </p>

            {/* Sizes */}
            {item.sizes && item.sizes.length > 1 && (
              <div className="mb-4">
                <p className="text-xs font-semibold text-gray-400 mb-2.5 uppercase tracking-wider">Choisir la taille</p>
                <div className="flex gap-2">
                  {item.sizes.map(s => (
                    <button key={s.size} onClick={() => setSelectedSize(s.size)}
                      className={`flex-1 py-3 px-3 rounded-xl font-semibold text-sm border-2 transition-all ${selectedSize === s.size ? "bg-[#FDF8F2] text-gray-900 border-amber-500" : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"}`}>
                      <div className="font-bold">{s.size}</div>
                      <div className="text-xs">{Number(s.price).toFixed(0)} DA</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Extras summary badge if any selected */}
            {hasExtras && selectedExtras.length > 0 && (
              <div className="mb-3 flex items-center gap-2 px-3 py-2 bg-amber-50 rounded-xl border border-amber-200">
                <span className="text-xs">✨</span>
                <span className="text-xs font-semibold text-amber-700 truncate flex-1">
                  {selectedExtras.map(e => e.name).join(", ")}
                </span>
                <span className="text-xs font-bold text-amber-600 flex-shrink-0">+{extrasTotal.toFixed(0)} DA</span>
              </div>
            )}

            <div className="flex-grow" />

            {/* Footer */}
            <div className="pt-4 border-t border-gray-100">
              <div className="flex items-end justify-between gap-1">
                <div className="flex flex-col justify-end min-h-[72px] flex-shrink-0">
                  {activePromo && (
                    <span className="text-sm text-gray-400 line-through font-semibold">{getOriginalPrice().toFixed(0)} DA</span>
                  )}
                  <div className="text-3xl font-bold text-gray-900 leading-none whitespace-nowrap">
                    {getCurrentPrice().toFixed(0)} DA
                  </div>
                </div>
                <button
                  onClick={handleAddToCart}
                  disabled={isButtonDisabled}
                  className={`flex-shrink min-w-[130px] max-w-[180px] h-[40px] flex items-center justify-center gap-1.5 rounded-2xl font-bold text-sm shadow-lg transition-all px-3 overflow-hidden
                    ${isButtonDisabled ? "bg-gray-200 text-gray-400 cursor-not-allowed" : "bg-[#fe9a00] text-white hover:brightness-110 hover:scale-105"}`}
                >
                  <span className="text-base leading-none">{hasExtras ? "✨" : "🛒"}</span>
                  <span className="leading-none">{isAdding ? "Ajouté ✓" : hasExtras ? "Suppléments" : "Ajouter"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ══════════════ BACK ══════════════ */}
        <div
          style={{
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
            background: "linear-gradient(160deg, #fffbf2 0%, #fff8ed 100%)",
          }}
          className="absolute inset-0 rounded-2xl overflow-hidden shadow-xl flex flex-col h-full w-full"
        >
          {/* Back header with item image blurred */}
          <div className="relative h-24 flex-shrink-0 overflow-hidden">
            {item.image && (
              <img src={item.image} alt="" className="absolute inset-0 w-full h-full object-cover scale-110" style={{ filter: "blur(8px) brightness(0.6)" }} />
            )}
            <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-black/60" />
            <div className="relative z-10 h-full flex items-center justify-between px-5">
              <div>
                <p className="text-[10px] font-bold text-amber-300 uppercase tracking-widest">Suppléments</p>
                <p className="text-white font-bold text-base leading-tight">{item.name}</p>
              </div>
              {/* Close / flip back */}
              <button
                onClick={() => setFlipped(false)}
                className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm flex items-center justify-center transition-colors"
              >
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Extras grid */}
          <div className="flex-1 overflow-y-auto px-4 py-4 bg-[#fdf8f2]">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">
              Choisissez vos suppléments
            </p>
            <div className="grid grid-cols-2 gap-2">
              {(item.extras || []).map(extra => {
                const isSelected = selectedExtras.some(e => e.id === extra.id)
                return (
                  <button
                    key={extra.id}
                    type="button"
                    onClick={() => toggleExtra(extra)}
                    className={`
                      relative flex flex-col items-center justify-center
                      p-3 rounded-2xl border-2 transition-all duration-200
                      ${isSelected
                        ? "border-amber-400 bg-amber-50 shadow-lg shadow-amber-100"
                        : "border-gray-100 bg-white hover:border-amber-200 hover:shadow-sm"
                      }
                    `}
                  >
                    {/* Check badge */}
                    {isSelected && (
                      <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-amber-500 flex items-center justify-center shadow-sm">
                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                    <span className="text-xl mb-1">🧂</span>
                    <span className={`text-xs font-bold text-center leading-tight mb-1.5 ${isSelected ? "text-gray-900" : "text-gray-600"}`}>
                      {extra.name}
                    </span>
                    <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full transition-all ${isSelected ? "bg-amber-500 text-white" : "bg-gray-100 text-gray-500"}`}>
                      +{Number(extra.price).toFixed(0)} DA
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Back footer */}
          <div className="px-4 pb-5 pt-3 border-t border-gray-100 bg-[#fdf8f2] flex-shrink-0">
            {selectedExtras.length > 0 && (
              <div className="mb-3 flex flex-wrap gap-1.5">
                {selectedExtras.map(e => (
                  <span key={e.id} className="text-[11px] font-semibold bg-amber-100 text-amber-700 px-2.5 py-1 rounded-full">
                    {e.name}
                  </span>
                ))}
              </div>
            )}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] text-gray-400 font-medium">Total</p>
                <p className="text-2xl font-bold text-gray-900">{getCurrentPrice().toFixed(0)} DA</p>
              </div>
              <button
                onClick={commitToCart}
                className="flex items-center gap-2 px-5 py-3 rounded-2xl text-white font-bold text-sm shadow-lg shadow-amber-200 hover:brightness-110 hover:scale-105 transition-all"
                style={{ backgroundColor: "#fe9a00" }}
              >
                <span>🛒</span>
                <span>{isAdding ? "Ajouté ✓" : "Ajouter"}</span>
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}