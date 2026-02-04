import type { Promotion } from "../../lib/api"
import MenuCard from "../Menu-card/menu-card"
import ComboCard from "../Menu-card/combo-card"

interface MenuItem {
  id: string
  name: string
  category: string
  price: number
  weight: string
  image: string
  featured?: boolean
  tags?: string[]
}

interface MenuGridProps {
  items: MenuItem[]
  promotions: Promotion[]
}

export default function MenuGrid({ items, promotions }: MenuGridProps) {
  return (
    <main className="bg-gradient-to-br min-h-screen py-4 md:py-10 flex-1 overflow-y-auto">
      <div className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8 max-w-7xl">
        {items.length === 0 ? (
          <div className="text-center py-16 md:py-24 px-4">
            <div className="inline-block bg-white p-6 md:p-8 rounded-3xl shadow-xl mb-6">
              <div className="text-6xl md:text-7xl mb-4">🍽️</div>
            </div>
            <p className="text-gray-700 text-lg md:text-xl font-bold mb-2">No items found in this category</p>
            <p className="text-gray-500 text-sm">Try selecting a different category</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 md:gap-6 lg:gap-8">
            {/* Show Combo Packs at the top of the menu */}
            {promotions
              .filter(p => p.promotion_type === 'combo_fixed_price' && p.display_status === 'Live')
              .map(promo => (
                <ComboCard key={`combo_${promo.id}`} promotion={promo} />
              ))
            }

            {items.map((item) => (
              <MenuCard key={item.id} item={item} promotions={promotions} />
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
