"use client"
import { useState, useEffect } from "react"
import Header from "../components/Header/header"
import Sidebar from "../components/Sidebar/sidebar"
import MenuGrid from "../components/Menu-grid/menu-grid"
import CartDrawer from "../components/Cart/cart"
import { useCart } from "../context/CartContext"
import { fetchMenuItems, fetchPromotions, fetchRestaurantStatus } from "../lib/api"
import type { Promotion } from "../lib/api"
import SweetcoMenu from "../components/Menu/menu"

export default function HomePage() {
  const [selectedCategory, setSelectedCategory] = useState("popular")
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const { cartItems } = useCart()

  const [tableNumber, setTableNumber] = useState<string | null>(null)
  const [menuItems, setMenuItems] = useState<any[]>([])
  const [promotions, setPromotions] = useState<Promotion[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isClosed, setIsClosed] = useState(false)
  const [closedInfo, setClosedInfo] = useState<{open: string, close: string} | null>(null)

  // 🔍 Search state
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    setTableNumber(params.get("table"))

    setLoading(true)
    setError(null)

    Promise.all([fetchMenuItems(), fetchPromotions(), fetchRestaurantStatus()])
      .then(([items, promos, status]) => {
        setMenuItems(items)
        setPromotions(promos)
        
        if (status && status.is_open === false) {
            setIsClosed(true)
            setClosedInfo({ open: status.opening_time, close: status.closing_time })
        }
        
        setLoading(false)
      })
      .catch((err) => {
        setError(err.message || "Failed to load data")
        setLoading(false)
      })
  }, [])

  // 🔍 Filter by category + search
  const filteredItems = menuItems.filter((item) => {
    const matchesCategory =
      selectedCategory === "popular" || item.category === selectedCategory

    const matchesSearch =
      searchQuery === "" ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchQuery.toLowerCase())

    return matchesCategory && matchesSearch
  })

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header
        tableNumber={tableNumber}
        isMenuOpen={isSidebarOpen}
        onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        onCartOpen={() => setIsCartOpen(true)}
        cartItemCount={cartItems.length}

        // 🔍 search props
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      <SweetcoMenu
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <div className="overflow-hidden">
        <Sidebar
          onSelectCategory={(category) => {
            setSelectedCategory(category)
            setIsSidebarOpen(false)
          }}
          onClose={() => setIsSidebarOpen(false)}
          promotions={promotions}
        />

        <div className="flex-1 w-full min-w-0">
          {loading ? (
            <div className="flex items-center justify-center min-h-[60vh]">
              <p className="text-gray-500">Loading menu items...</p>
            </div>
          ) : isClosed ? (
            <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center bg-gray-50 py-10 rounded-lg m-4">
              <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-orange-600">
                  <circle cx="12" cy="12" r="10"/>
                  <polyline points="12 6 12 12 16 14"/>
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Restaurant Fermé</h1>
              <p className="text-gray-600 mb-6 max-w-md">
                Nous sommes actuellement fermés.
              </p>
              {closedInfo && (
                <div className="p-4 bg-white rounded-lg shadow-sm w-full max-w-sm border border-gray-100">
                  <p className="text-sm text-gray-500">
                    Heures d'ouverture: <br/>
                    <span className="font-semibold text-gray-700">{closedInfo.open} - {closedInfo.close}</span>
                  </p>
                </div>
              )}
            </div>
          ) : error ? (
            <div className="flex items-center justify-center min-h-[60vh] px-4">
              <div className="text-center">
                <p className="text-red-500 font-semibold mb-2">
                  Error loading menu items
                </p>
                <p className="text-gray-600 text-sm">{error}</p>
              </div>
            </div>
          ) : (
            <>
              <MenuGrid items={filteredItems} promotions={promotions} />
            </>
          )}
        </div>
      </div>

<div
  className="fixed bottom-3 right-3 md:bottom-6 md:right-6 z-50"
  onClick={() => setIsCartOpen(true)}
>
  <button className="shop-btn">
    <div className="dots_border"></div>

    {/* Cart Icon */}
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className="cart-icon"
    >
      <path d="M6 6h15l-1.5 9h-12L6 6z" />
      <circle cx="9" cy="20" r="1.5" />
      <circle cx="18" cy="20" r="1.5" />
    </svg>

    <span className="text_button">Cart</span>

    {/* Badge */}
    {cartItems.length > 0 && (
      <span className="badge">
        {cartItems.length}
      </span>
    )}


  </button>
</div>



      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        tableNumber={tableNumber}
      />
    </div>
  )
}
