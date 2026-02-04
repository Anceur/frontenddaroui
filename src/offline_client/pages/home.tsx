"use client"
import { useState, useEffect } from "react"
import Header from "../components/Header/header"
import Sidebar from "../components/Sidebar/sidebar"
import MenuGrid from "../components/Menu-grid/menu-grid"
import CartDrawer from "../components/Cart/cart"
import { useCart } from "../context/CartContext"
import { fetchMenuItems, fetchPromotions } from "../lib/api"
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

  // 🔍 Search state
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    setTableNumber(params.get("table"))

    setLoading(true)
    setError(null)

    Promise.all([fetchMenuItems(), fetchPromotions()])
      .then(([items, promos]) => {
        setMenuItems(items)
        setPromotions(promos)
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

    {/* CSS INSIDE COMPONENT */}
    <style jsx>{`
      .shop-btn {
        --active: 0;
        cursor: pointer;
        position: relative;
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 14px 22px;
        border-radius: 999px;
        border: none;
        background: transparent;
        transform: scale(1);
        transition: transform 0.3s ease;
      }

      .shop-btn:hover {
        --active: 1;
        transform: scale(1.08);
      }

      .shop-btn::before {
        content: "";
        position: absolute;
        inset: 0;
       background: #3A2C1C; 
        border-radius: 999px;
        box-shadow: 0 10px 25px rgba(0,0,0,.35);
        z-index: 0;
      }

      .shop-btn::after {
        content: "";
        position: absolute;
        inset: 0;
        background: radial-gradient(circle at top, #ffd86a, #e5c348);
        opacity: var(--active);
        transition: opacity 0.3s ease;
        border-radius: 999px;
        z-index: 1;
      }

      .dots_border {
        position: absolute;
        inset: -2px;
        border-radius: 999px;
        overflow: hidden;
        z-index: -1;
      }

      .dots_border::before {
        content: "";
        position: absolute;
        width: 100%;
        height: 32px;
        background: white;
        animation: spin 2s linear infinite;
        mask: linear-gradient(transparent, white, transparent);
      }

      @keyframes spin {
        to {
          transform: rotate(360deg);
        }
      }

      .cart-icon {
        width: 22px;
        color: white;
        z-index: 2;
      }

      .text_button {
        color: white;
        font-weight: 800;
        letter-spacing: 1px;
        z-index: 2;
      }

      .badge {
        position: absolute;
        top: -6px;
        right: -6px;
        background: white;
        color: #111;
        font-size: 11px;
        font-weight: 900;
        padding: 3px 7px;
        border-radius: 999px;
        z-index: 3;
        box-shadow: 0 4px 10px rgba(0,0,0,.25);
      }
    `}</style>
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
