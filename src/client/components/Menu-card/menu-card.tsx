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
  const [showExtras, setShowExtras] = useState(false)
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

  const hasExtras = item.extras && item.extras.length > 0

  return (
    <div className="w-full relative overflow-hidden rounded-2xl shadow-md bg-[#f5e6d3]">

      {/* ── FRONT PANEL ── */}
      <div
        className="w-full flex flex-col bg-[#f5e6d3] rounded-2xl transition-transform duration-500 ease-in-out"
        style={{ transform: showExtras ? "translateX(-100%)" : "translateX(0)" }}
      >
        {/* Image */}
        <div className="relative w-full h-52 overflow-hidden rounded-t-2xl flex-shrink-0">
          {item.image ? (
            <img
              src={item.image}
              alt={item.name}
              className="w-full h-full object-cover transition-transform duration-700 hover:scale-110"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-[#f3f4f6]">
              <span className="text-4xl">🍽️</span>
            </div>
          )}

          {/* Featured Badge */}
          {item.featured && (
            <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm text-amber-600 text-xs font-bold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1">
              <span>⭐</span>
              <span>Vedette</span>
            </div>
          )}

          {/* Promo Badge */}
          {activePromo && (
            <div
              className="absolute top-3 left-3 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-xl"
              style={{ backgroundColor: "#DC2626" }}
            >
              {activePromo.promotion_type === "percentage"
                ? `${parseInt(activePromo.value)}% OFF`
                : "OFFRE SPÉCIALE"}
            </div>
          )}

          {/* Category */}
          <div className="absolute bottom-3 left-3">
            <span className="bg-white/95 backdrop-blur-sm text-gray-800 text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
              {item.category.toUpperCase()}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="px-4 pt-3 pb-4 flex flex-col bg-[#fdf8f2]">
          {/* Title */}
          <h3 className="text-lg font-bold text-gray-900 mb-1 leading-tight">{item.name}</h3>

          {/* Description */}
          <p className="text-xs text-gray-500 leading-relaxed mb-3 line-clamp-2">
            {item.description ||
              "Savourez notre spécialité préparée avec soin, à base d'ingrédients de qualité."}
          </p>

          {/* Sizes */}
          {item.sizes && item.sizes.length > 1 && (
            <div className="mb-3">
              <p className="text-[10px] font-semibold text-gray-400 mb-2 uppercase tracking-wider">
                Choisir la taille
              </p>
              <div className="flex gap-2">
                {item.sizes.map(sizeOption => (
                  <button
                    key={sizeOption.size}
                    onClick={() => setSelectedSize(sizeOption.size)}
                    className={`flex-1 py-2.5 px-2 rounded-xl font-semibold text-sm border-2 transition-all ${
                      selectedSize === sizeOption.size
                        ? "bg-[#FDF8F2] text-gray-900 border-amber-500"
                        : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    <div className="font-bold text-sm">{sizeOption.size}</div>
                    <div className="text-xs">{Number(sizeOption.price).toFixed(0)} DA</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Supplements trigger */}
          {hasExtras && (
            <button
              onClick={() => setShowExtras(true)}
              className="mb-3 w-full flex items-center justify-between px-4 py-2.5 rounded-xl border-2 border-amber-200 bg-amber-50 hover:bg-amber-100 hover:border-amber-400 transition-all group"
            >
              <div className="flex items-center gap-2">
                <span className="text-amber-500">✨</span>
                <span className="text-sm font-semibold text-gray-700">Suppléments</span>
                {selectedExtras.length > 0 && (
                  <span className="bg-amber-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                    {selectedExtras.length}
                  </span>
                )}
              </div>
              <span className="text-amber-500 font-bold group-hover:translate-x-1 transition-transform">→</span>
            </button>
          )}

          {/* Selected extras chips */}
          {selectedExtras.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
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

          {/* Footer: Price + Button */}
          <div className="pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
            <div className="flex flex-col">
              {activePromo && (
                <span className="text-xs text-gray-400 line-through font-semibold">
                  {getOriginalPrice().toFixed(0)} DA
                </span>
              )}
              <div className="text-2xl font-bold text-gray-900 leading-none whitespace-nowrap">
                {getCurrentPrice().toFixed(0)} DA
              </div>
            </div>

            <button
              onClick={handleAddToCart}
              disabled={!!isButtonDisabled}
              className={`flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl font-bold text-sm shadow-md transition-all flex-shrink-0 ${
                isButtonDisabled
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                  : "bg-[#fe9a00] text-white hover:brightness-110 hover:scale-105 active:scale-95"
              }`}
            >
              <span>🛒</span>
              <span>{isAdding ? "Ajouté" : "Ajouter"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── EXTRAS PANEL (slides in from the right, absolutely positioned over the card) ── */}
      {hasExtras && (
        <div
          className="absolute inset-0 flex flex-col bg-[#fdf8f2] rounded-2xl transition-transform duration-500 ease-in-out"
          style={{ transform: showExtras ? "translateX(0)" : "translateX(100%)" }}
        >
          {/* Extras header */}
          <div className="bg-[#fe9a00] px-4 py-3 flex items-center justify-between flex-shrink-0 rounded-t-2xl">
            <div>
              <h3 className="text-white font-bold text-base leading-tight">{item.name}</h3>
              <p className="text-amber-100 text-xs">Choisissez vos suppléments</p>
            </div>
            <button
              onClick={() => setShowExtras(false)}
              className="bg-white/20 hover:bg-white/30 text-white rounded-full w-8 h-8 flex items-center justify-center transition-colors font-bold text-lg"
            >
              ←
            </button>
          </div>

          {/* Extras list */}
          <div className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-2">
            {item.extras && item.extras.map(extra => {
              const checked = selectedExtras.some(e => e.id === extra.id)
              return (
                <label
                  key={extra.id}
                  className={`flex items-center justify-between p-3 rounded-xl border-2 cursor-pointer transition-all ${
                    checked
                      ? "border-amber-400 bg-amber-50"
                      : "border-gray-200 bg-white hover:border-amber-300"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                        checked ? "border-amber-500 bg-amber-500" : "border-gray-300 bg-white"
                      }`}
                    >
                      {checked && (
                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <span className={`text-sm font-semibold ${checked ? "text-gray-900" : "text-gray-600"}`}>
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

          {/* Extras footer */}
          <div className="px-4 py-3 border-t border-gray-100 bg-white rounded-b-2xl flex-shrink-0">
            {selectedExtras.length > 0 && (
              <p className="text-xs text-gray-400 mb-1">
                {selectedExtras.length} supplément{selectedExtras.length !== 1 ? "s" : ""} · +{selectedExtras.reduce((s, e) => s + Number(e.price), 0).toFixed(0)} DA
              </p>
            )}
            <div className="flex items-center justify-between gap-2">
              <div>
                {activePromo && (
                  <span className="text-xs text-gray-400 line-through font-semibold block">
                    {getOriginalPrice().toFixed(0)} DA
                  </span>
                )}
                <div className="text-xl font-bold text-gray-900 leading-none">
                  {getCurrentPrice().toFixed(0)} DA
                </div>
              </div>

              <button
                onClick={() => { handleAddToCart(); setShowExtras(false) }}
                disabled={!!isButtonDisabled}
                className={`flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl font-bold text-sm shadow-md transition-all ${
                  isButtonDisabled
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                    : "bg-[#fe9a00] text-white hover:brightness-110 hover:scale-105 active:scale-95"
                }`}
              >
                <span>🛒</span>
                <span>{isAdding ? "Ajouté ✓" : "Ajouter"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}