"use client"
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import Header from "../components/Header/header"
import Sidebar from "../components/Sidebar/sidebar"
import MenuGrid from "../components/Menu-grid/menu-grid"
import CartDrawer from "../components/Cart/cart"
import { useCart } from "../context/CartContext"
import { fetchMenuItems } from "../lib/api"
import axios from "axios"
import { API } from "../../shared/api/API"

interface HomePageProps {
  tableNumber?: string | null
}

export default function HomePage({ tableNumber: tableNumberProp }: HomePageProps) {
  const [selectedCategory, setSelectedCategory] = useState("popular")
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false) // Hidden by default
  const { cartItems } = useCart()
  const [tableNumber, setTableNumber] = useState<string | null>(tableNumberProp || null)
  const [menuItems, setMenuItems] = useState<any[]>([])  // بيانات من API
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tableValid, setTableValid] = useState<boolean | null>(null)
  const [tableOccupied, setTableOccupied] = useState<boolean>(false)
  const navigate = useNavigate()

  useEffect(() => {
    // Validate table number if provided
    const validateTable = async () => {
      if (tableNumberProp) {
        setTableNumber(tableNumberProp)
        console.log("Table number from props:", tableNumberProp)
        
        try {
          // Check if table exists and if it's occupied using public endpoint
          const response = await axios.get(`${API}/tables/validate/`, {
            params: { number: tableNumberProp },
            withCredentials: true,
          })
          
          if (!response.data.exists) {
            setTableValid(false)
            setError(`Table ${tableNumberProp} does not exist. Please scan a valid QR code.`)
            setLoading(false)
            return
          }
          
          // Check if table is occupied
          if (response.data.is_occupied) {
            setTableValid(true)
            setTableOccupied(true)
            setError(`Table ${tableNumberProp} is currently occupied. Please wait or contact staff.`)
            setLoading(false)
            return
          }
          
          setTableValid(true)
          setTableOccupied(false)
        } catch (err: any) {
          console.error("Error validating table:", err)
          // If table doesn't exist (404), show error
          if (err.response?.status === 404 || err.response?.data?.exists === false) {
            setTableValid(false)
            setError(`Table ${tableNumberProp} does not exist. Please scan a valid QR code.`)
            setLoading(false)
            return
          }
          // For other errors, still allow access but show warning
          setTableValid(true)
          setTableOccupied(false)
        }
      } else {
        setTableValid(true)
        setTableOccupied(false)
      }
    }

    validateTable()
  }, [tableNumberProp])

  useEffect(() => {
    // Only fetch menu items if table is valid and not occupied
    if (tableValid === null || tableOccupied) return
    
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
  }, [tableValid, tableOccupied])

  const filteredItems =
    selectedCategory === "popular"
      ? menuItems
      : menuItems.filter((item) => item.category === selectedCategory)

  // Show error if table doesn't exist or is occupied
  if (tableValid === false) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50 items-center justify-center px-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <div className="text-6xl mb-4">🚫</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Invalid Table</h2>
          <p className="text-gray-600 mb-6">
            Table <span className="font-semibold">{tableNumberProp}</span> does not exist.
            <br />
            Please scan a valid QR code or contact staff.
          </p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-semibold"
          >
            Go to Home
          </button>
        </div>
      </div>
    )
  }

  // Show occupied message if table is occupied
  if (tableValid === true && tableOccupied) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50 items-center justify-center px-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <div className="text-6xl mb-4">🪑</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Table Occupied</h2>
          <p className="text-gray-600 mb-6">
            Table <span className="font-semibold">{tableNumberProp}</span> is currently in use.
            <br />
            Please wait for the table to become available or contact staff.
          </p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-semibold"
          >
            Go to Home
          </button>
        </div>
      </div>
    )
  }

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
