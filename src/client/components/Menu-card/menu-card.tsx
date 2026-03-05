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

  // NEW STATE FOR FLIP
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

    const extrasPrice = selectedExtras.reduce(
      (sum, extra) => sum + Number(extra.price),
      0
    )

    return finalPrice + extrasPrice
  }

  const getOriginalPrice = () => {

    let basePrice = Number(item.price)

    if (item.sizes && selectedSize) {
      const sizeOption = item.sizes.find(s => s.size === selectedSize)
      if (sizeOption) basePrice = Number(sizeOption.price)
    }

    const extrasPrice = selectedExtras.reduce(
      (sum, extra) => sum + Number(extra.price),
      0
    )

    return basePrice + extrasPrice
  }

  const handleAddToCart = () => {

    if (item.sizes && item.sizes.length > 1 && !selectedSize) return

    setIsAdding(true)

    const extrasKey =
      selectedExtras.length > 0
        ? "-" + selectedExtras.map(e => e.id).sort().join("-")
        : ""

    addToCart({
      id: String(item.id) + (selectedSize ? `-${selectedSize}` : "") + extrasKey,
      name:
        item.name +
        (selectedSize && item.sizes && item.sizes.length > 1
          ? ` (${selectedSize})`
          : ""),
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

    <div className="group perspective w-full h-full">

      <div
        className={`relative w-full h-full transition-transform duration-700 preserve-3d ${
          isFlipped ? "rotate-y-180" : ""
        }`}
      >

        {/* FRONT CARD */}

        <div className="backface-hidden bg-[#f5e6d3] rounded-2xl overflow-hidden shadow-md flex flex-col h-full w-full">

          {/* IMAGE */}

          <div className="relative w-full h-56 overflow-hidden rounded-t-3xl">

            {item.image ? (
              <img
                src={item.image}
                alt={item.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-100">
                🍽️
              </div>
            )}

          </div>

          {/* CONTENT */}

          <div className="px-5 pb-5 pt-4 flex flex-col flex-grow bg-[#fdf8f2]">

            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {item.name}
            </h3>

            <p className="text-sm text-gray-500 mb-4 line-clamp-2">
              {item.description}
            </p>

            {/* SIZES */}

            {item.sizes && item.sizes.length > 1 && (

              <div className="mb-4">

                <p className="text-xs font-semibold text-gray-400 mb-2 uppercase">
                  Choisir la taille
                </p>

                <div className="flex gap-2">

                  {item.sizes.map(sizeOption => (

                    <button
                      key={sizeOption.size}
                      onClick={() => setSelectedSize(sizeOption.size)}
                      className={`flex-1 py-2 rounded-xl border ${
                        selectedSize === sizeOption.size
                          ? "border-orange-500"
                          : "border-gray-200"
                      }`}
                    >
                      {sizeOption.size}
                    </button>

                  ))}

                </div>

              </div>
            )}

            {/* BUTTON TO OPEN SUPPLEMENTS */}

            {item.extras && item.extras.length > 0 && (
              <button
                onClick={() => setIsFlipped(true)}
                className="mb-4 w-full py-2 rounded-xl border border-gray-200 hover:bg-gray-50 font-semibold text-sm"
              >
                Voir les suppléments
              </button>
            )}

            <div className="flex-grow"></div>

            {/* FOOTER */}

            <div className="flex items-end justify-between">

              <div>
                {activePromo && (
                  <span className="text-sm line-through text-gray-400">
                    {getOriginalPrice().toFixed(0)} DA
                  </span>
                )}

                <div className="text-2xl font-bold">
                  {getCurrentPrice().toFixed(0)} DA
                </div>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={isButtonDisabled}
                className="bg-orange-500 text-white px-4 py-2 rounded-xl"
              >
                {isAdding ? "Ajouté" : "Ajouter"}
              </button>

            </div>

          </div>

        </div>

        {/* BACK CARD (SUPPLEMENTS) */}

        <div className="absolute inset-0 rotate-y-180 backface-hidden bg-[#fdf8f2] rounded-2xl p-5 flex flex-col">

          <h3 className="text-lg font-bold mb-4">
            Suppléments
          </h3>

          <div className="flex flex-col gap-2 flex-grow">

            {item.extras?.map(extra => (

              <label
                key={extra.id}
                className="flex items-center justify-between p-2 rounded-xl border border-gray-200"
              >

                <div className="flex items-center gap-2">

                  <input
                    type="checkbox"
                    checked={selectedExtras.some(e => e.id === extra.id)}
                    onChange={() => toggleExtra(extra)}
                  />

                  <span>{extra.name}</span>

                </div>

                <span>
                  +{Number(extra.price).toFixed(0)} DA
                </span>

              </label>

            ))}

          </div>

          <button
            onClick={() => setIsFlipped(false)}
            className="mt-4 w-full py-2 rounded-xl bg-orange-500 text-white"
          >
            Retour
          </button>

        </div>

      </div>

    </div>
  )
}