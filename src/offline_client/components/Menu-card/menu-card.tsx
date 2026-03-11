import { useState, useMemo } from "react"
import { useCart } from "../../context/CartContext"
import type { Promotion } from "../../lib/api"

interface MenuItemSize {
  id: number
  size: string
  price: number | string
}

interface MenuItemExtra {
  id: number;
  name: string;
  price: number | string;
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
  const hasOnlyDefaultSize = item.sizes && item.sizes.length === 1 && item.sizes[0].size === "M"
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
      const currentSizeObj = item.sizes.find(s => s.size === selectedSize);
      if (currentSizeObj) {
        const sizePromo = promotions.find(p =>
          p.applicable_sizes.includes(Number(currentSizeObj.id)) &&
          p.display_status === 'Live'
        );
        if (sizePromo) return sizePromo;
      }
    }
    return promotions.find(p =>
      p.applicable_items.includes(Number(item.id)) &&
      p.display_status === 'Live'
    );
  }, [promotions, item.id, selectedSize, item.sizes]);



  const getCurrentPrice = () => {
    let basePrice = Number(item.price);
    if (item.sizes && selectedSize) {
      const sizeOption = item.sizes.find((s) => s.size === selectedSize)
      if (sizeOption) basePrice = Number(sizeOption.price);
    }
    
    let finalPrice = basePrice;
    if (activePromo) {
      if (activePromo.promotion_type === 'percentage') {
        finalPrice = basePrice * (1 - parseFloat(activePromo.value) / 100);
      } else if (activePromo.promotion_type === 'fixed_amount') {
        finalPrice = Math.max(0, basePrice - parseFloat(activePromo.value));
      }
    }
    
    const extrasPrice = selectedExtras.reduce((sum, extra) => sum + Number(extra.price), 0);
    return finalPrice + extrasPrice;
  }

  const getOriginalPrice = () => {
    let basePrice = Number(item.price);
    if (item.sizes && selectedSize) {
      const sizeOption = item.sizes.find((s) => s.size === selectedSize)
      if (sizeOption) basePrice = Number(sizeOption.price);
    }
    const extrasPrice = selectedExtras.reduce((sum, extra) => sum + Number(extra.price), 0);
    return basePrice + extrasPrice;
  }

  const handleAddToCart = () => {
    if (item.sizes && item.sizes.length > 1 && !selectedSize) return
    setIsAdding(true)
    
    const extrasKey = selectedExtras.length > 0
      ? "-" + selectedExtras.map(e => e.id).sort().join("-")
      : ""

    addToCart({
      id: String(item.id) + (selectedSize || "") + extrasKey,
      name: item.name + (selectedSize && item.sizes && item.sizes.length > 1 ? ` (${selectedSize})` : ""),
      price: getCurrentPrice(),
      image: item.image || undefined,
      quantity: 1,
      extras: selectedExtras,
    })
    setTimeout(() => setIsAdding(false), 600)
  }

  const isButtonDisabled = isAdding || (item.sizes && item.sizes.length > 1 && !selectedSize)
  const hasExtras = item.extras && item.extras.length > 0

  return (
   <div className="bg-[#f5e6d3] rounded-2xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 flex flex-col h-full w-full relative">

      {/* ── FRONT PANEL ── */}
      <div 
        className="flex flex-col h-full w-full transition-transform duration-500 ease-in-out"
        style={{ transform: showExtras ? "translateX(-100%)" : "translateX(0)" }}
      >
        {/* Image avec overlay gradient */}
        <div className="relative w-full h-56 overflow-hidden rounded-t-3xl">
          {item.image ? (
            <img
              src={item.image}
              alt={item.name}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Crect fill='%23f3f4f6' width='400' height='300'/%3E%3C/svg%3E";
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-[#f3f4f6]">
              <div className="text-gray-400 text-sm font-medium">🍽️</div>
            </div>
          )}

          {/* Badge Featured */}
          {item.featured && (
            <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm text-amber-600 text-xs font-bold px-3 py-2 rounded-full shadow-lg flex items-center gap-1.5">
              <span className="text-base">⭐</span>
              <span>En vedette</span>
            </div>
          )}

          {/* Badge Promotion */}
          {activePromo && (
            <div
              className="absolute top-4 left-4 text-white text-xs font-bold px-4 py-2 rounded-full shadow-xl"
              style={{ backgroundColor: '#DC2626' }}
            >
              {activePromo.promotion_type === 'percentage'
                ? `${parseInt(activePromo.value)}% OFF`
                : 'SPÉCIAL'}
            </div>
          )}

          {/* Badge catégorie en bas */}
          <div className="absolute bottom-4 left-4">
            <span className="bg-white/95 backdrop-blur-sm text-gray-800 text-xs font-bold px-4 py-2 rounded-full shadow-lg border border-white/20">
              {item.category.toUpperCase()}
            </span>
          </div>
        </div>

        {/* Section contenu */}
        <div className="px-5 pb-5 pt-4 flex flex-col flex-grow bg-[#fdf8f2]">

          {/* Titre */}
          <h3 className="text-xl font-bold text-gray-900 mb-2 leading-tight">
            {item.name}
          </h3>

          {/* Description */}
          <p className="text-sm text-gray-500 leading-relaxed mb-4 line-clamp-2">
            {item.description || "Savourez notre préparation soigneusement élaborée, réalisée avec les meilleurs ingrédients pour une expérience gustative nostalgique."}
          </p>

          {/* Sélection taille */}
          {item.sizes && item.sizes.length > 1 && (
            <div className="mb-4">
              <p className="text-xs font-semibold text-gray-400 mb-2.5 uppercase tracking-wider">Sélectionnez la taille</p>
              <div className="flex gap-2">
                {item.sizes.map((sizeOption) => (
                  <button
                    key={sizeOption.size}
                    onClick={() => setSelectedSize(sizeOption.size)}
                    className={`flex-1 py-3 px-3 rounded-xl font-semibold text-sm transition-all duration-200 ${
                      selectedSize === sizeOption.size
                        ? "bg-gradient-to-r from-[#fe9a00] to-orange-500 text-white shadow-lg scale-105"
                        : "bg-gray-50 text-gray-700 hover:bg-gray-100 border-2 border-gray-200"
                    }`}
                  >
                    <div className="text-center">
                      <div className="font-bold">{sizeOption.size}</div>
                      <div className="text-xs mt-0.5 opacity-90">{Number(sizeOption.price).toFixed(0)} DA</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Supplements trigger */}
          {hasExtras && (
            <button
              onClick={() => setShowExtras(true)}
              className="mb-4 w-full flex items-center justify-between px-5 py-3.5 rounded-2xl border-2 border-amber-200 bg-amber-50/50 hover:bg-amber-100/50 hover:border-amber-400 transition-all group shadow-sm"
            >
              <div className="flex items-center gap-3">
                <span className="text-xl text-amber-500">✨</span>
                <span className="text-base font-bold text-gray-700">Suppléments</span>
                {selectedExtras.length > 0 && (
                  <span className="bg-[#fe9a00] text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-sm ml-1">
                    {selectedExtras.length}
                  </span>
                )}
              </div>
              <span className="text-amber-500 font-bold group-hover:translate-x-1 transition-transform text-xl">→</span>
            </button>
          )}

          {/* Selected extras chips */}
          {selectedExtras.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {selectedExtras.map(e => (
                <span
                  key={e.id}
                  className="bg-amber-100/80 border border-amber-300/50 text-amber-800 text-xs font-bold px-3 py-1.5 rounded-full shadow-sm flex items-center gap-1.5"
                >
                  <span className="text-amber-500">✓</span>
                  {e.name}
                </span>
              ))}
            </div>
          )}

          <div className="flex-grow"></div>

          {/* Pied de carte : Prix & Action */}
          <div className="pt-4 mt-2 border-t border-gray-100">
            <div className="flex items-center justify-between gap-4">
              <div className="text-left">
                {activePromo && (
                  <span className="text-sm text-gray-400 line-through font-semibold mb-1 block">
                    {getOriginalPrice().toFixed(0)} DA
                  </span>
                )}
                <div className={`text-3xl font-bold ${activePromo ? 'text-red-600' : 'text-gray-900'}`}>
                  {getCurrentPrice().toFixed(0)} DA
                </div>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={isButtonDisabled}
                className={`px-8 py-3.5 rounded-2xl font-bold text-sm transition-all duration-300 
                  flex items-center justify-center gap-2 shadow-lg
                  ${
                    isAdding
                      ? "bg-[#fe9a00] text-white scale-95"
                      : isButtonDisabled
                      ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                      : "bg-[#fe9a00] hover:brightness-110 text-white shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95"
                  }`}
              >
                {isAdding ? (
                  <>
                    <span className="text-lg">✓</span>
                    <span>Ajouté</span>
                  </>
                ) : (
                  <>
                    <span className="text-lg">🛒</span>
                    <span>Ajouter au Panier</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>  
      </div>

      {/* ── EXTRAS PANEL ── */}
      {hasExtras && (
        <div
          className="absolute inset-0 flex flex-col bg-[#fdf8f2] transition-transform duration-500 ease-in-out z-10"
          style={{ transform: showExtras ? "translateX(0)" : "translateX(100%)" }}
        >
          {/* Extras header */}
          <div className="bg-[#fe9a00] px-6 py-5 flex items-center justify-between flex-shrink-0">
            <div>
              <h3 className="text-white font-bold text-xl leading-tight">{item.name}</h3>
              <p className="text-amber-100 text-sm mt-1">Personnalisez votre commande</p>
            </div>
            <button
              onClick={() => setShowExtras(false)}
              className="bg-white/20 hover:bg-white/30 text-white rounded-full w-10 h-10 flex items-center justify-center transition-colors font-bold text-2xl shadow-inner"
            >
              ←
            </button>
          </div>

          {/* Extras list */}
          <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-3 color-scrollbar">
            {item.extras && item.extras.map(extra => {
              const checked = selectedExtras.some(e => e.id === extra.id)
              return (
                <label
                  key={extra.id}
                  className={`flex items-center justify-between p-4 rounded-2xl border-2 cursor-pointer transition-all duration-200 shadow-sm ${
                    checked
                      ? "border-[#fe9a00] bg-orange-50 shadow-md transform scale-[1.02]"
                      : "border-gray-200 bg-white hover:border-amber-300"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                        checked ? "border-[#fe9a00] bg-[#fe9a00]" : "border-gray-300 bg-white"
                      }`}
                    >
                      {checked && (
                        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <span className={`text-base font-bold ${checked ? "text-gray-900" : "text-gray-700"}`}>
                      {extra.name}
                    </span>
                  </div>
                  <span className={`text-base font-black ml-2 flex-shrink-0 ${checked ? "text-[#fe9a00]" : "text-gray-400"}`}>
                    +{Number(extra.price).toFixed(0)} DA
                  </span>
                  <input type="checkbox" checked={checked} onChange={() => toggleExtra(extra)} className="sr-only" />
                </label>
              )
            })}
          </div>

          {/* Extras footer */}
          <div className="px-6 py-6 border-t border-gray-100 bg-white shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-bold text-gray-400 mb-1 uppercase tracking-wider">Prix Total</p>
                <div className="text-3xl font-black text-gray-900 leading-none">
                  {getCurrentPrice().toFixed(0)} DA
                </div>
              </div>

              <button
                onClick={() => { handleAddToCart(); setShowExtras(false) }}
                disabled={isButtonDisabled}
                className={`flex-1 max-w-[200px] flex items-center justify-center gap-3 px-6 py-4 rounded-2xl font-bold text-base shadow-lg transition-all ${
                  isButtonDisabled
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                    : "bg-[#fe9a00] text-white hover:brightness-110 hover:scale-105 active:scale-95 shadow-orange-200"
                }`}
              >
                <span className="text-xl">🛒</span>
                <span>{isAdding ? "Ajouté !" : "Confirmer"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
