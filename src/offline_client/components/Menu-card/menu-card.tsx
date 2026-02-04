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
  const hasOnlyDefaultSize = item.sizes && item.sizes.length === 1 && item.sizes[0].size === "M"
  const [selectedSize, setSelectedSize] = useState<string | null>(
    hasOnlyDefaultSize ? "M" : null
  )
  const [isAdding, setIsAdding] = useState(false)
  const { addToCart } = useCart()

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

  const colors = categoryColors[item.category] || {
    bg: "bg-gray-50",
    text: "text-gray-700",
  }

  const getCurrentPrice = () => {
    let basePrice = Number(item.price);
    if (item.sizes && selectedSize) {
      const sizeOption = item.sizes.find((s) => s.size === selectedSize)
      if (sizeOption) basePrice = Number(sizeOption.price);
    }
    if (activePromo) {
      if (activePromo.promotion_type === 'percentage') {
        return basePrice * (1 - parseFloat(activePromo.value) / 100);
      } else if (activePromo.promotion_type === 'fixed_amount') {
        return Math.max(0, basePrice - parseFloat(activePromo.value));
      }
    }
    return basePrice;
  }

  const getOriginalPrice = () => {
    if (item.sizes && selectedSize) {
      const sizeOption = item.sizes.find((s) => s.size === selectedSize)
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

  const isButtonDisabled = isAdding || (item.sizes && item.sizes.length > 1 && !selectedSize)

  return (
   <div className="bg-[#f5e6d3] rounded-2xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 flex flex-col h-full w-full">

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
                      ? "bg-gradient-to-r from-purple-600 to-pink-500 text-white shadow-lg scale-105"
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
              {item.sizes && item.sizes.length > 1 ? (
                selectedSize ? (
                  <div className={`text-3xl font-bold ${activePromo ? 'bg-gradient-to-r from-red-500 to-pink-500 bg-clip-text text-transparent' : 'text-gray-900'}`}>
                    {getCurrentPrice().toFixed(0)} DA
                  </div>
                ) : (
                  <div className="text-3xl font-bold text-gray-900">
                    {Number(item.price).toFixed(0)} DA
                  </div>
                )
              ) : (
                <div className={`text-3xl font-bold ${activePromo ? 'bg-gradient-to-r from-red-500 to-pink-500 bg-clip-text text-transparent' : 'text-gray-900'}`}>
                  {getCurrentPrice().toFixed(0)} DA
                </div>
              )}
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
  )
}
