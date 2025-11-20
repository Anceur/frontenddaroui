"use client"

import { X, ChefHat, Pizza, Sandwich, UtensilsCrossed, IceCream, Coffee, Sparkles } from "lucide-react"

interface SidebarProps {
  selectedCategory: string
  onSelectCategory: (category: string) => void
  categories: Array<{ id: string; label: string }>
  isOpen?: boolean
  onClose?: () => void
}

const categoryIcons: Record<string, any> = {
  popular: Sparkles,
  burger: ChefHat,
  sandwich: Sandwich,
  pizza: Pizza,
  plat: UtensilsCrossed,
  tacos: UtensilsCrossed,
  desserts: IceCream,
  drinks: Coffee,
}

export default function Sidebar({ selectedCategory, onSelectCategory, categories, isOpen = false, onClose }: SidebarProps) {
  const handleCategoryClick = (categoryId: string) => {
    onSelectCategory(categoryId)
    if (onClose) {
      onClose()
    }
  }

  return (
    <>
      {/* Mobile Full-Screen Overlay */}
      <div
        className={`
          md:hidden fixed inset-0 bg-white z-50
          ${isOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'}
        `}
        style={{
          transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 400ms cubic-bezier(0.25, 0.46, 0.45, 0.94), opacity 400ms cubic-bezier(0.25, 0.46, 0.45, 0.94)',
          willChange: 'transform, opacity'
        }}
      >
        {/* Mobile Header */}
        <div className="bg-[#e7c078] text-white p-4 flex items-center justify-between border-b border-[#d9b76b]">
          <h2 className="text-xl font-black">Categories</h2>
          <button
            onClick={onClose}
            className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
            aria-label="Close menu"
          >
            <X size={24} />
          </button>
        </div>

        {/* Categories List - Full Screen */}
        <div className="h-[calc(100vh-73px)] overflow-y-auto p-6">
          <nav className="space-y-3">
            {categories.map((category) => {
              const Icon = categoryIcons[category.id] || UtensilsCrossed
              const isSelected = selectedCategory === category.id
              return (
                <button
                  key={category.id}
                  onClick={() => handleCategoryClick(category.id)}
                  className={`w-full flex items-center gap-4 px-5 py-4 rounded-xl transition-all duration-200 text-base font-semibold ${
                    isSelected
                      ? "bg-[#e7c078] text-white shadow-lg scale-105"
                      : "text-gray-700 hover:bg-[#fef7eb] hover:text-[#e7c078]"
                  }`}
                >
                  <Icon size={24} className="flex-shrink-0" style={isSelected ? { color: 'white' } : { color: '#e7c078' }} />
                  <span className="flex-1 text-left">{category.label}</span>
                  {isSelected && (
                    <div className="w-2 h-2 bg-white rounded-full flex-shrink-0"></div>
                  )}
                </button>
              )
            })}
          </nav>
        </div>
      </div>

      {/* Desktop Sidebar - Always visible */}
      <aside className="hidden md:block sticky top-0 right-0 h-screen w-72 bg-white border-l border-gray-200 shadow-lg z-40">
        <div className="h-full overflow-y-auto p-6">
          <div className="mb-6">
            <h2 className="text-xl font-black text-gray-900 mb-2">Categories</h2>
            <div className="h-1 w-20 bg-[#e7c078] rounded-full"></div>
          </div>
          <nav className="space-y-2">
            {categories.map((category) => {
              const Icon = categoryIcons[category.id] || UtensilsCrossed
              const isSelected = selectedCategory === category.id
              return (
                <button
                  key={category.id}
                  onClick={() => handleCategoryClick(category.id)}
                  className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-200 text-base font-semibold ${
                    isSelected
                      ? "bg-[#e7c078] text-white shadow-lg"
                      : "text-gray-700 hover:bg-[#fef7eb] hover:text-[#e7c078]"
                  }`}
                >
                  <Icon size={20} className="flex-shrink-0" style={isSelected ? { color: 'white' } : { color: '#e7c078' }} />
                  <span className="flex-1 text-left truncate">{category.label}</span>
                  {isSelected && (
                    <div className="w-2 h-2 bg-white rounded-full flex-shrink-0"></div>
                  )}
                </button>
              )
            })}
          </nav>
        </div>
      </aside>
    </>
  )
}
