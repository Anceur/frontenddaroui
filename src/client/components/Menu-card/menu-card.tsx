"use client"
import { useState } from "react"
import { useCart } from "../../context/CartContext"

interface MenuItemSize {
  size: "M" | "L" | "Mega"
  price: number | string
}

interface MenuItem {
  id: string
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
  pizza: { bg: "bg-[#fdf6e5]", text: "text-[#e7c078]" },
  salad: { bg: "bg-green-50", text: "text-green-700" },
  burger: { bg: "bg-[#fdf6e5]", text: "text-[#e7c078]" },
  deserts: { bg: "bg-purple-50", text: "text-purple-700" },
  meat: { bg: "bg-red-50", text: "text-red-700" },
  pasta: { bg: "bg-blue-50", text: "text-blue-700" },
}

interface MenuCardProps {
  item: MenuItem
}

export default function MenuCard({ item }: MenuCardProps) {
  const [selectedSize, setSelectedSize] = useState<"M" | "L" | "Mega" | null>(null)
  const [isAdding, setIsAdding] = useState(false)
  const { addToCart } = useCart()

  const colors = categoryColors[item.category] || {
    bg: "bg-gray-50",
    text: "text-gray-700",
  }

  const getCurrentPrice = () => {
    if (item.sizes && selectedSize) {
      const sizeOption = item.sizes.find((s) => s.size === selectedSize)
      return sizeOption ? Number(sizeOption.price) : Number(item.price)
    }
    return Number(item.price)
  }

  const handleAddToCart = () => {
    if (item.sizes && item.sizes.length > 0 && !selectedSize) return
    
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

  const isButtonDisabled = isAdding || (item.sizes && item.sizes.length > 0 && !selectedSize)

  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 flex flex-col h-full w-full border border-gray-200 hover:border-[#e7c078] group">
      <div className="relative h-40 overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
        {item.image ? (
          <img
            src={item.image}
            alt={item.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Crect fill='%23f3f4f6' width='400' height='300'/%3E%3Ctext fill='%239ca3af' font-family='sans-serif' font-size='20' dy='10.5' font-weight='bold' x='50%25' y='50%25' text-anchor='middle'%3E%3C/text%3E%3C/svg%3E";
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center">
              <div className="text-4xl mb-1 opacity-40">🍽️</div>
              <p className="text-gray-400 text-xs font-medium">No Image</p>
            </div>
          </div>
        )}

        {item.featured && (
          <div className="absolute top-2 right-2 bg-[#e7c078] text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-lg flex items-center gap-1">
            <span>⭐</span>
            <span>Featured</span>
          </div>
        )}

        <div className="absolute top-2 left-2">
          <span className={`${colors.bg} ${colors.text} text-xs font-bold px-2 py-0.5 rounded-md shadow-sm`}>
            {item.category}
          </span>
        </div>
      </div>

      <div className="p-4 flex flex-col flex-grow bg-white">
        <h3 className="text-base font-bold text-gray-900 mb-1.5 leading-tight line-clamp-1">
          {item.name}
        </h3>

        {item.description && (
          <p className="text-xs text-gray-600 leading-snug mb-3 line-clamp-2">
            {item.description}
          </p>
        )}

        {item.sizes && item.sizes.length > 0 && (
          <div className="mb-3">
            <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">Choose Size</p>
            <div className="flex gap-1.5">
              {item.sizes.map((sizeOption) => (
                <button
                  key={sizeOption.size}
                  onClick={() => setSelectedSize(sizeOption.size)}
                  className={`flex-1 py-2 px-2 rounded-lg font-semibold text-xs transition-all duration-200 ${
                    selectedSize === sizeOption.size
                      ? "bg-[#e7c078] text-white shadow-md ring-2 ring-[#d9b76b]"
                      : "bg-gray-100 text-gray-700 hover:bg-[#fdf6e5] hover:text-[#e7c078] border border-gray-200"
                  }`}
                >
                  <div className="text-center">
                    <div className="text-xs font-bold">{sizeOption.size}</div>
                    <div className="text-[10px] mt-0.5 opacity-90">${Number(sizeOption.price).toFixed(2)}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex-grow min-h-[0.5rem]"></div>

        <div className="border-t border-gray-100 pt-3 mt-1">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="text-xl font-bold text-[#e7c078]">
                ${getCurrentPrice().toFixed(2)}
              </div>
              <div className="text-[10px] text-gray-500">DA</div>
            </div>
          </div>

          <button
            onClick={handleAddToCart}
            disabled={isButtonDisabled}
            className={`w-full py-2.5 rounded-lg font-bold text-xs transition-all duration-300 flex items-center justify-center gap-2 ${
              isAdding
                ? "bg-green-500 text-white scale-95"
                : isButtonDisabled
                ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                : "bg-[#e7c078] hover:bg-[#d9b76b] text-white shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-95"
            }`}
          >
            {isAdding ? (
              <>
                <span>✓</span>
                <span>Ajouté!</span>
              </>
            ) : (item.sizes && item.sizes.length > 0 && !selectedSize) ? (
              <>
                <span>⚠️</span>
                <span>Sélectionnez une taille</span>
              </>
            ) : (
              <>
                <span>🛒</span>
                <span>Ajouter au panier</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
