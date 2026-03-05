import { useState, useMemo, useEffect } from "react"
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

/* ─────────────────────────────────────────
   Side Drawer Component
───────────────────────────────────────── */
function ExtrasDrawer({
  open,
  onClose,
  item,
  selectedExtras,
  onToggle,
  onConfirm,
  currentPrice,
}: {
  open: boolean
  onClose: () => void
  item: MenuItem
  selectedExtras: MenuItemExtra[]
  onToggle: (extra: MenuItemExtra) => void
  onConfirm: () => void
  currentPrice: number
}) {
  useEffect(() => {
    if (open) document.body.style.overflow = "hidden"
    else document.body.style.overflow = ""
    return () => { document.body.style.overflow = "" }
  }, [open])

  const extrasTotal = selectedExtras.reduce((s, e) => s + Number(e.price), 0)

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        className={`fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      />

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full z-50 w-[340px] max-w-[92vw] bg-[#fdf8f2] shadow-2xl flex flex-col
          transition-transform duration-300 ease-in-out
          ${open ? "translate-x-0" : "translate-x-full"}
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-8 pb-5 border-b border-gray-100">
          <div>
            <p className="text-xs font-bold text-amber-500 uppercase tracking-widest mb-1">
              Personnaliser
            </p>
            <h2 className="text-lg font-bold text-gray-900 leading-tight">{item.name}</h2>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Item preview */}
        <div className="flex items-center gap-3 px-6 py-4 bg-white border-b border-gray-100">
          {item.image ? (
            <img src={item.image} alt={item.name} className="w-14 h-14 rounded-xl object-cover flex-shrink-0" />
          ) : (
            <div className="w-14 h-14 rounded-xl bg-gray-100 flex items-center justify-center text-2xl flex-shrink-0">🍽️</div>
          )}
          <div>
            <p className="text-sm font-semibold text-gray-700">{item.name}</p>
            <p className="text-xs text-gray-400 mt-0.5">{item.category.toUpperCase()}</p>
          </div>
        </div>

        {/* Extras list */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">
            ✨ Choisissez vos suppléments
          </p>
          <div className="flex flex-col gap-3">
            {(item.extras || []).map(extra => {
              const isSelected = selectedExtras.some(e => e.id === extra.id)
              return (
                <button
                  key={extra.id}
                  type="button"
                  onClick={() => onToggle(extra)}
                  className={`
                    flex items-center justify-between w-full
                    px-4 py-3.5 rounded-2xl border-2
                    transition-all duration-200 text-left
                    ${isSelected
                      ? "border-amber-400 bg-amber-50 shadow-md shadow-amber-100"
                      : "border-gray-100 bg-white hover:border-amber-200"
                    }
                  `}
                >
                  <div className="flex items-center gap-3">
                    <div className={`
                      w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0
                      border-2 transition-all duration-200
                      ${isSelected ? "border-amber-500 bg-amber-500" : "border-gray-300 bg-white"}
                    `}>
                      {isSelected && (
                        <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <span className={`text-sm font-semibold ${isSelected ? "text-gray-900" : "text-gray-600"}`}>
                      {extra.name}
                    </span>
                  </div>
                  <span className={`
                    text-xs font-bold px-3 py-1.5 rounded-full flex-shrink-0 transition-all
                    ${isSelected ? "bg-amber-500 text-white" : "bg-gray-100 text-gray-500"}
                  `}>
                    +{Number(extra.price).toFixed(0)} DA
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 pb-8 pt-4 border-t border-gray-100 bg-[#fdf8f2]">
          {selectedExtras.length > 0 && (
            <div className="mb-4 px-4 py-3 bg-amber-50 rounded-2xl border border-amber-100">
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs font-bold text-amber-600 uppercase tracking-wide">Sélectionnés</p>
                <span className="text-xs font-bold text-amber-600">+{extrasTotal.toFixed(0)} DA</span>
              </div>
              <p className="text-xs text-gray-600 font-medium leading-relaxed">
                {selectedExtras.map(e => e.name).join(" · ")}
              </p>
            </div>
          )}
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-gray-500 font-medium">Total</span>
            <span className="text-2xl font-bold text-gray-900">{currentPrice.toFixed(0)} DA</span>
          </div>
          <button
            onClick={() => { onConfirm(); onClose() }}
            className="w-full py-4 rounded-2xl text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-200 hover:brightness-110 transition-all"
            style={{ backgroundColor: "#fe9a00" }}
          >
            <span className="text-base">🛒</span>
            Ajouter au panier
          </button>
        </div>
      </div>
    </>
  )
}

/* ─────────────────────────────────────────
   Menu Card
───────────────────────────────────────── */
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
  const [drawerOpen, setDrawerOpen] = useState(false)
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
    if (item.extras && item.extras.length > 0) {
      setDrawerOpen(true)
      return
    }
    commitToCart()
  }

  const commitToCart = () => {
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
    <>
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

          {/* Extras selected badge */}
          {hasExtras && selectedExtras.length > 0 && (
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              className="mb-4 w-full flex items-center justify-between px-4 py-2.5 rounded-2xl bg-amber-50 border border-amber-200 hover:bg-amber-100 transition-colors"
            >
              <div className="flex items-center gap-2">
                <span className="text-sm">✨</span>
                <span className="text-xs font-semibold text-amber-700">
                  {selectedExtras.length} supplément{selectedExtras.length > 1 ? "s" : ""} choisi{selectedExtras.length > 1 ? "s" : ""}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-amber-600">
                  +{selectedExtras.reduce((s, e) => s + Number(e.price), 0).toFixed(0)} DA
                </span>
                <svg className="w-3.5 h-3.5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </button>
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
                  flex-shrink min-w-[130px] max-w-[180px] h-[40px]
                  flex items-center justify-center gap-1.5
                  rounded-2xl font-bold text-sm shadow-lg transition-all px-3 overflow-hidden
                  ${isButtonDisabled
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                    : "bg-[#fe9a00] text-white hover:brightness-110 hover:scale-105"
                  }
                `}
              >
                <span className="text-base leading-none">{hasExtras ? "✨" : "🛒"}</span>
                <span className="leading-none">
                  {isAdding ? "Ajouté" : hasExtras ? "Personnaliser" : "Ajouter"}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Side Drawer */}
      {hasExtras && (
        <ExtrasDrawer
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          item={item}
          selectedExtras={selectedExtras}
          onToggle={toggleExtra}
          onConfirm={commitToCart}
          currentPrice={getCurrentPrice()}
        />
      )}
    </>
  )
}