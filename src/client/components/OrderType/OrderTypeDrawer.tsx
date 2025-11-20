
"use client"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowLeft, QrCode, Truck, CheckCircle, AlertCircle, Loader2 } from "lucide-react"
import { useState } from "react"
import DeliveryDetailsDrawer from "../DeliveryDetails/DeliveryDetailsDrawer"
import { useCart } from "../../context/CartContext"
import { OrderService } from "../../services/orderService"

interface OrderTypeDrawerProps {
  isOpen: boolean
  onClose: () => void
  onBack: () => void
  tableNumber?: string | null
}

export default function OrderTypeDrawer({
  isOpen,
  onClose,
  onBack,
  tableNumber,
}: OrderTypeDrawerProps) {
  const { cartItems, clearCart } = useCart()
  const [showDeliveryDetails, setShowDeliveryDetails] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<{ orderId: string; message: string } | null>(null)
  const [customerName, setCustomerName] = useState("")
  const [customerPhone, setCustomerPhone] = useState("")
  
  console.log("OrderTypeDrawer tableNumber:", tableNumber, "isOpen:", isOpen)

  const calculateTotal = () => {
    const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
    const tax = subtotal * 0.1
    const total = subtotal + tax
    // Round to 2 decimal places to avoid precision issues
    return Math.round(total * 100) / 100
  }

  const handleDineInOrder = async () => {
    setError(null)
    setSuccess(null)

    // Validate cart
    if (cartItems.length === 0) {
      setError("Your cart is empty. Please add items before placing an order.")
      return
    }

    // Validate customer info for dine-in
    if (!customerName.trim()) {
      setError("Please enter your name for the order.")
      return
    }

    if (!customerPhone.trim()) {
      setError("Please enter your phone number for the order.")
      return
    }

    // Prepare order data
    const orderData = {
      customer: customerName.trim(),
      phone: customerPhone.trim(),
      address: `Table ${tableNumber}`,
      items: cartItems.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
      })),
      total: calculateTotal(),
      orderType: 'dine_in' as const,
      tableNumber: tableNumber || undefined,
    }

    // Validate order data
    const validation = OrderService.validateOrderData(orderData)
    if (!validation.isValid) {
      setError(validation.errors.join(", "))
      return
    }

    setIsSubmitting(true)
    try {
      const response = await OrderService.submitOrder(orderData)
      
      // Success - show confirmation
      setSuccess({
        orderId: response.order.id,
        message: response.message || "Order placed successfully!"
      })
      
      // Clear cart after successful order
      clearCart()
      
      // Reset form
      setCustomerName("")
      setCustomerPhone("")
      
      // Close drawer after 3 seconds
      setTimeout(() => {
        onClose()
        setSuccess(null)
      }, 3000)
    } catch (err: any) {
      console.error("Error placing order:", err)
      setError(err.message || "Failed to place order. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

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
              className="fixed top-0 right-0 h-full w-96 bg-white text-black shadow-lg z-50 p-6 flex flex-col"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 100, damping: 20 }}
            >
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-xl font-bold">Select Order Type</h2>
                <button
                  onClick={onClose}
                  className="text-gray-500 hover:text-black text-2xl"
                >
                  &times;
                </button>
              </div>

              <p className="text-center text-gray-600 mb-8">
                {tableNumber
                  ? `You're ordering from Table ${tableNumber} 🍽️`
                  : "How would you like to order?"}
              </p>

              {success ? (
                <div className="flex-1 flex flex-col items-center justify-center space-y-4 p-8">
                  <CheckCircle className="w-16 h-16 text-green-500" />
                  <div className="text-center">
                    <h3 className="text-xl font-bold text-green-700 mb-2">Order Placed Successfully!</h3>
                    <p className="text-gray-600 mb-2">{success.message}</p>
                    <p className="text-sm text-gray-500">Order ID: <span className="font-semibold">{success.orderId}</span></p>
                    <p className="text-sm text-gray-500 mt-4">Redirecting...</p>
                  </div>
                </div>
              ) : (
              <div className="space-y-4 flex flex-col items-center w-full">
                  {error && (
                    <div className="w-full bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
                      <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-red-700">{error}</p>
                    </div>
                  )}
               
                {tableNumber ? (
                    <div className="w-full space-y-4">
                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                        <p className="text-sm font-semibold text-amber-800 mb-2">
                          You're ordering for Table {tableNumber}
                        </p>
                        <p className="text-xs text-amber-700">
                          Please provide your details below
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold mb-1">
                          Your Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={customerName}
                          onChange={(e) => setCustomerName(e.target.value)}
                          required
                          disabled={isSubmitting}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white text-black focus:ring-2 focus:ring-amber-400 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                          placeholder="e.g. Ahmed Benali"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold mb-1">
                          Phone Number <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="tel"
                          value={customerPhone}
                          onChange={(e) => setCustomerPhone(e.target.value)}
                          required
                          disabled={isSubmitting}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white text-black focus:ring-2 focus:ring-amber-400 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                          placeholder="e.g. +213 555 123 456"
                        />
                      </div>

                      <div className="border-t pt-4 w-full">
                        <div className="flex justify-between text-sm mb-3">
                          <span>Total:</span>
                          <span className="font-bold text-lg">{calculateTotal().toFixed(2)} DA</span>
                        </div>
                  <button
                          onClick={handleDineInOrder}
                          disabled={isSubmitting || !customerName.trim() || !customerPhone.trim()}
                          className="w-full bg-amber-500 hover:bg-amber-600 text-white py-3 rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                          {isSubmitting ? (
                            <>
                              <Loader2 className="w-5 h-5 animate-spin" />
                              <span>Placing Order...</span>
                            </>
                          ) : (
                            <>
                    <QrCode className="w-5 h-5" />
                              <span>Confirm Order for Table {tableNumber}</span>
                            </>
                          )}
                  </button>
                      </div>
                    </div>
                ) : (
                  <>
                    <button
                      onClick={() => setShowDeliveryDetails(true)}
                      className="w-full border border-gray-300 py-4 rounded-lg flex items-center justify-center gap-3 hover:bg-gray-100 transition"
                    >
                      <Truck className="w-5 h-5" />
                      <span className="font-medium">Online Delivery</span>
                    </button>
                  </>
                )}
              </div>
              )}

              {!success && (
              <div className="mt-auto pt-8 w-full">
                <button
                  onClick={onBack}
                    disabled={isSubmitting}
                    className="w-full border border-gray-300 py-3 rounded-lg flex items-center justify-center gap-2 hover:bg-gray-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Cart</span>
                </button>
              </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

   
      {!tableNumber && (
        <DeliveryDetailsDrawer
          isOpen={showDeliveryDetails}
          onClose={() => {
            setShowDeliveryDetails(false)
            onClose()
          }}
          onBack={() => setShowDeliveryDetails(false)}
        />
      )}
    </>
  )
}
