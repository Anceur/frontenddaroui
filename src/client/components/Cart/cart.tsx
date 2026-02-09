"use client"
import { motion, AnimatePresence } from "framer-motion"
import { useState } from "react"
import { useCart } from "./../../context/CartContext"
import DeliveryDetailsDrawer from "../DeliveryDetails/DeliveryDetailsDrawer"

interface CartDrawerProps {
  isOpen: boolean
  onClose: () => void
  tableNumber?: string | null
}

export default function CartDrawer({ isOpen, onClose, tableNumber }: CartDrawerProps) {
  const { cartItems, updateQuantity, removeFromCart, clearCart } = useCart()
  const [showDeliveryDetails, setShowDeliveryDetails] = useState(false)

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const tax = 100
  const total = subtotal + tax

  return (
    <>
      <AnimatePresence>
        {isOpen && !showDeliveryDetails && (
          <>
            <motion.div
              className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-40"
              onClick={onClose}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />

            <motion.div
              className="fixed top-0 right-0 h-full w-full sm:w-80 md:w-96 bg-white text-black shadow-2xl z-50 p-4 sm:p-5 flex flex-col"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 100, damping: 20 }}
            >
              {/* En-tête */}
              <div className="flex justify-between items-center mb-4 sm:mb-5 pb-3 sm:pb-4 border-b border-gray-200 flex-shrink-0">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Votre panier</h2>
                <div className="flex items-center gap-2">
                  {cartItems.length > 0 && (
                    <button
                      onClick={clearCart}
                      className="text-red-500 hover:text-red-700 text-sm font-medium px-3 py-1.5 border border-red-500 rounded-lg hover:bg-red-50 transition-all"
                      title="Vider le panier"
                    >
                      Vider
                    </button>
                  )}
                  <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-600 text-2xl font-light w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-all"
                  >
                    &times;
                  </button>
                </div>
              </div>

              {/* Articles */}
              <div className="flex-1 overflow-y-auto space-y-2 sm:space-y-3 pr-1 sm:pr-2 min-h-0">
                {cartItems.length === 0 ? (
                  <div className="flex flex-col items-center justify-center mt-10 sm:mt-20">
                    <div className="text-5xl sm:text-6xl mb-3 sm:mb-4">🛒</div>
                    <p className="text-center text-gray-500 text-base sm:text-lg font-medium">
                      Votre panier est vide
                    </p>
                    <p className="text-center text-gray-400 text-xs sm:text-sm mt-2">
                      Ajoutez des articles pour commencer !
                    </p>
                  </div>
                ) : (
                  cartItems.map(item => (
                    <div
                      key={item.id}
                      className="flex justify-between items-start border border-gray-200 rounded-lg sm:rounded-xl p-3 sm:p-4 bg-gray-50 hover:bg-gray-100 transition-all shadow-sm"
                    >
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-800 mb-1 text-sm sm:text-base truncate">
                          {item.name}
                        </h3>
                        <p className="text-xs sm:text-sm text-gray-600 mb-1 sm:mb-2">
                          {item.price.toFixed(2)} DA × {item.quantity}
                        </p>
                        <p className="text-sm sm:text-base font-bold text-amber-600">
                          {(item.price * item.quantity).toFixed(2)} DA
                        </p>
                      </div>

                      <div className="flex items-center gap-1 sm:gap-2 ml-2 sm:ml-3 flex-shrink-0">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center bg-white border border-gray-300 hover:bg-gray-100 rounded-lg text-base sm:text-lg font-semibold text-gray-700 transition-all shadow-sm"
                        >
                          −
                        </button>

                        <span className="w-8 sm:w-10 text-center text-sm sm:text-base font-semibold text-gray-800">
                          {item.quantity}
                        </span>

                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-base sm:text-lg font-semibold transition-all shadow-md"
                        >
                          +
                        </button>

                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center bg-red-500 hover:bg-red-600 text-white rounded-lg text-xs sm:text-sm transition-all shadow-sm"
                          title="Supprimer l’article"
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Pied de page */}
              {cartItems.length > 0 && (
                <div className="mt-3 sm:mt-4 border-t border-gray-200 pt-3 sm:pt-4 bg-white flex-shrink-0">
                  <div className="space-y-1.5 sm:space-y-2 mb-3 sm:mb-4">
                    <div className="flex justify-between text-xs sm:text-sm text-gray-600">
                      <span>Sous-total</span>
                      <span className="font-medium">{subtotal.toFixed(2)} DA</span>
                    </div>
                    <div className="flex justify-between text-xs sm:text-sm text-gray-600 mt-1">
                      <span>Taxe</span>
                      <span className="font-medium">{tax.toFixed(2)} DA</span>
                    </div>

                    <div className="flex justify-between font-bold text-lg sm:text-xl mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-gray-200">
                      <span className="text-gray-800">Total</span>
                      <span className="text-amber-600">{total.toFixed(2)} DA</span>
                    </div>
                  </div>

                  <button
                    onClick={() => setShowDeliveryDetails(true)}
                    className="w-full bg-[#e7c078] hover:bg-[#d9b76b] text-white py-3 sm:py-3.5 mt-3 sm:mt-4 rounded-lg sm:rounded-xl text-sm sm:text-base font-semibold transition-all shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]"
                  >
                    Passer à la livraison
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Tiroir des détails de livraison */}
      <DeliveryDetailsDrawer
        isOpen={showDeliveryDetails}
        onClose={() => {
          setShowDeliveryDetails(false)
          onClose()
        }}
        onBack={() => setShowDeliveryDetails(false)}
      />
    </>
  )
}
