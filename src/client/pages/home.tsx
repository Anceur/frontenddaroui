"use client"
import { useState, useEffect } from "react"
import Header from "../components/Header/header"
import Sidebar from "../components/Sidebar/sidebar"
import MenuGrid from "../components/Menu-grid/menu-grid"
import CartDrawer from "../components/Cart/cart"
import { useCart } from "../context/CartContext"
import { fetchMenuItems } from "../lib/api"  // <-- استبدل import السابق

export default function HomePage() {
  const [selectedCategory, setSelectedCategory] = useState("popular")
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false) // Hidden by default
  const { cartItems } = useCart()
  const [tableNumber, setTableNumber] = useState<string | null>(null)
  const [menuItems, setMenuItems] = useState<any[]>([])  // بيانات من API
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const table = params.get("table")
    console.log("URL table param:", table) 
    if (table) {
      setTableNumber(table)
    } else {
      setTableNumber(null)
    }

    // جلب البيانات من API
    setLoading(true)
    setError(null)
    fetchMenuItems()
      .then((data) => {
        console.log("Menu items fetched:", data)
        setMenuItems(data)
        setLoading(false)
      })
      .catch((err) => {
        console.error("Error fetching menu items:", err)
        setError(err.message || "Failed to load menu items")
        setLoading(false)
      })
  }, [])

  const filteredItems =
    selectedCategory === "popular"
      ? menuItems
      : menuItems.filter((item) => item.category === selectedCategory)

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header 
        tableNumber={tableNumber} 
        isMenuOpen={isSidebarOpen}
        onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)}
      />

      <div className="flex flex-1 relative overflow-hidden">
        {/* Sidebar - Single instance, responsive */}
        <Sidebar
          selectedCategory={selectedCategory}
          onSelectCategory={(category) => {
            setSelectedCategory(category)
            setIsSidebarOpen(false)
          }}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          categories={[
            { id: 'popular', label: 'All' },
            { id: 'burger', label: 'Burger' },
            { id: 'sandwich', label: 'Sandwich & Specials' },
            { id: 'pizza', label: 'Pizza' },
            { id: 'plat', label: 'Plat' },
            { id: 'tacos', label: 'Tacos' },
            { id: 'desserts', label: 'Desserts' },
            { id: 'drinks', label: 'Drinks' },
          ]}
        />

        {/* Main Content - Full width on mobile */}
        <div className="flex-1 w-full md:w-auto min-w-0">
          {loading ? (
            <div className="flex-1 flex items-center justify-center min-h-[60vh]">
              <p className="text-gray-500">Loading menu items...</p>
            </div>
          ) : error ? (
            <div className="flex-1 flex items-center justify-center min-h-[60vh] px-4">
              <div className="text-center">
                <p className="text-red-500 font-semibold mb-2">Error loading menu items</p>
                <p className="text-gray-600 text-sm">{error}</p>
                <button 
                  onClick={() => window.location.reload()} 
                  className="mt-4 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600"
                >
                  Retry
                </button>
              </div>
            </div>
          ) : (
            <MenuGrid items={filteredItems} />
          )}
        </div>
      </div>
<div
  className="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-50 animate-bounce-cart cursor-pointer"
  onClick={() => setIsCartOpen(true)}
>
  <div className="relative bg-[#e7c078] hover:bg-[#d9b76b] text-white px-4 py-3 md:px-6 md:py-4 rounded-full transition-all flex items-center gap-2 md:gap-3 shadow-2xl hover:shadow-[#e7c078]/50 hover:scale-110 active:scale-95">
    <span className="text-xl md:text-2xl">🛒</span>
    <span className="font-black text-sm md:text-base hidden sm:inline">Panier</span>

    {cartItems.length > 0 && (
      <span className="absolute -top-1 -right-1 md:-top-2 md:-right-2 bg-[#e7c078] text-white text-xs font-black rounded-full px-2 md:px-2.5 py-0.5 md:py-1 shadow-lg ring-2 ring-white">
        {cartItems.length}
      </span>
    )}
  </div>
</div>

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        tableNumber={tableNumber}
      />
    </div>
  )
}
