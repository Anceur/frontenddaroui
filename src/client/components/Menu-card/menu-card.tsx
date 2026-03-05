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

function ExtrasPanel({
  extras,
  selectedExtras,
  onToggle,
  onClose,
}: {
  extras: MenuItemExtra[]
  selectedExtras: MenuItemExtra[]
  onToggle: (extra: MenuItemExtra) => void
  onClose: () => void
}) {
  const totalSelected = selectedExtras.length
  const totalPrice = selectedExtras.reduce((s, e) => s + Number(e.price), 0)

  return (
    <div className="flex flex-col h-full p-5 bg-[#fdf8f2]">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-lg">✨</span>
          <span className="text-sm font-bold text-gray-700 uppercase tracking-widest">
            Suppléments
          </span>
          {totalSelected > 0 && (
            <span className="text-xs font-bold px-2 py-0.5 rounded-full text-white bg-amber-500">
              {totalSelected}
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={onClose}
          className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-amber-100 transition-colors text-gray-500 hover:text-amber-600"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      </div>

      {/* Extras list */}
      <div className="flex flex-col gap-2 flex-grow overflow-y-auto">
        {extras.map(extra => {
          const isSelected = selectedExtras.some(e => e.id === extra.id)
          return (
            <button
              key={extra.id}
              type="button"
              onClick={() => onToggle(extra)}
              className={`
                w-full flex items-center justify-between
                px-3.5 py-2.5 rounded-xl border-2
                transition-all duration-200 text-left
                ${isSelected
                  ? "border-amber-400 bg-amber-50 shadow-sm shadow-amber-100"
                  : "border-gray-100 bg-white hover:border-amber-200 hover:bg-amber-50/40"
                }
              `}
            >
              <div className="flex items-center gap-2.5">
                <div className={`
                  w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0
                  border-2 transition-all duration-200
                  ${isSelected ? "border-amber-500 bg-amber-500" : "border-gray-300 bg-white"}
                `}>
                  {isSelected && (
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <span className={`text-sm font-semibold transition-colors ${isSelected ? "text-gray-900" : "text-gray-600"}`}>
                  {extra.name}
                </span>
              </div>
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full flex-shrink-0 transition-all ${isSelected ? "bg-amber-500 text-white" : "bg-gray-100 text-gray-500"}`}>
                +{Number(extra.price).toFixed(0)} DA
              </span>
            </button>
          )
        })}
      </div>

      {/* Summary */}
      {totalSelected > 0 && (
        <div className="mt-3 px-3 py-2 bg-amber-50 rounded-xl border border-amber-100 flex items-center justify-between">
          <span className="text-xs text-amber-700 font-medium truncate">
            {selectedExtras.map(e => e.name).join(", ")}
          </span>
          <span className="text-xs font-bold text-amber-600 flex-shrink-0 ml-2">
            +{totalPrice.toFixed(0)} DA
          </span>
        </div>
      )}
    </div>
  )
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

    let finalPrice = basePrice;
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
    <>
      {/* Flip card styles injected once */}
      <style>{`
        .flip-card-inner {
          transition: transform 0.55s cubic-bezier(0.45, 0.05, 0.55, 0.95);
          transform-style: preserve-3d;
          position: relative;
          width: 100%;
          height: 100%;
        }
        .flip-card-inner.flipped {
          transform: rotateY(180deg);
        }
        .flip-face {
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
          position: absolute;
          top: 0; left: 0;
          width: 100%; height: 100%;
          border-radius: 1rem;
          overflow: hidden;
        }
        .flip-face-back {
          transform: rotateY(180deg);
        }
      `}</style>

      <div
        className="rounded-2xl overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 h-full w-full"
        style={{ perspective: "1000px", background: "transparent" }}
      >
        <div className={`flip-card-inner ${isFlipped ? "flipped" : ""}`}>

          {/* ── FRONT FACE ── */}
          <div className="flip-face bg-[#f5e6d3] flex flex-col">
            {/* Image */}
            <div className="relative w-full h-56 overflow-hidden rounded-t-3xl flex-shrink-0">
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

              {item.featured && (
                <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm text-amber-600 text-xs font-bold px-3 py-2 rounded-full shadow-lg flex items-center gap-1.5">
                  <span className="text-base">⭐</span>
                  <span>Vedette</span>
                </div>
              )}

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

              {/* Extras trigger button (flip) */}
              {item.extras && item.extras.length > 0 && (
                <div className="mb-4">
                  <button
                    type="button"
                    onClick={() => setIsFlipped(true)}
                    className={`
                      w-full flex items-center justify-between
                      px-4 py-3 rounded-2xl
                      border-2 transition-all duration-200
                      ${selectedExtras.length > 0
                        ? "border-amber-300 bg-amber-50"
                        : "border-gray-100 bg-white hover:border-amber-200"
                      }
                    `}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-base">✨</span>
                      <span className="text-xs font-bold text-gray-600 uppercase tracking-widest">
                        Suppléments
                      </span>
                      {selectedExtras.length > 0 && (
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full text-white bg-amber-500">
                          {selectedExtras.length}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {selectedExtras.length > 0 && (
                        <span className="text-xs font-bold text-amber-600">
                          +{selectedExtras.reduce((s, e) => s + Number(e.price), 0).toFixed(0)} DA
                        </span>
                      )}
                      <svg
                        className="w-4 h-4 text-amber-500"
                        fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </button>
                </div>
              )}

              <div className="flex-grow" />

              {/* Footer */}
              <div className="pt-4 border-t border-gray-100">
                <div className="flex items-end justify-between gap-1">
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

                  <button
                    onClick={handleAddToCart}
                    disabled={isButtonDisabled}
                    className={`
                      flex-shrink
                      min-w-[130px]
                      max-w-[180px]
                      h-[40px]
                      flex items-center justify-center gap-1.5
                      rounded-2xl
                      font-bold text-sm
                      shadow-lg
                      transition-all
                      px-3
                      overflow-hidden
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

          {/* ── BACK FACE (Extras) ── */}
          <div className="flip-face flip-face-back bg-[#fdf8f2]">
            {item.extras && item.extras.length > 0 && (
              <ExtrasPanel
                extras={item.extras}
                selectedExtras={selectedExtras}
                onToggle={toggleExtra}
                onClose={() => setIsFlipped(false)}
              />
            )}
          </div>

        </div>
      </div>
    </>
  )
}