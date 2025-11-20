"use client"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowLeft } from "lucide-react"
import { useState } from "react"
import { useCart } from "../../context/CartContext"
import { OrderService } from "../../services/orderService"
import { CheckCircle, AlertCircle, Loader2 } from "lucide-react"

interface DeliveryDetailsDrawerProps {
  isOpen: boolean
  onClose: () => void
  onBack: () => void
}

export default function DeliveryDetailsDrawer({
  isOpen,
  onClose,
  onBack,
}: DeliveryDetailsDrawerProps) {
  const { cartItems, clearCart } = useCart()
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [address, setAddress] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<{ orderId: string; message: string } | null>(null)

  const calculateTotal = () => {
    const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
    const tax = subtotal * 0.1
    const total = subtotal + tax
    // Round to 2 decimal places to avoid precision issues
    return Math.round(total * 100) / 100
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    
    // Validate cart
    if (cartItems.length === 0) {
      setError("Your cart is empty. Please add items before placing an order.")
      return
    }

    // Prepare order data
    const orderData = {
      customer: name.trim(),
      phone: phone.trim(),
      address: address.trim(),
      items: cartItems.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
      })),
      total: calculateTotal(),
      orderType: 'delivery' as const,
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
      setName("")
      setPhone("")
      setAddress("")
      
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
    <AnimatePresence>
      {isOpen && (
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
              <h2 className="text-xl font-bold">Delivery Details</h2>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-black text-2xl"
              >
                &times;
              </button>
            </div>

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
            <form onSubmit={handleSubmit} className="flex-1 flex flex-col space-y-4">
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                )}

              <div>
                <label className="block text-sm font-semibold mb-1">
                    Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
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
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                    disabled={isSubmitting}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white text-black focus:ring-2 focus:ring-amber-400 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="e.g. +213 555 123 456"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1">
                    Delivery Address <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  required
                    disabled={isSubmitting}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 h-24 bg-white text-black focus:ring-2 focus:ring-amber-400 focus:outline-none resize-none disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="e.g. 12 Rue Didouche Mourad, Alger"
                />
              </div>

                <div className="border-t pt-4 mt-auto">
                  <div className="flex justify-between text-sm mb-2">
                    <span>Total:</span>
                    <span className="font-bold text-lg">{calculateTotal().toFixed(2)} DA</span>
                  </div>
              <button
                type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-amber-500 hover:bg-amber-600 text-white py-3 rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Placing Order...</span>
                      </>
                    ) : (
                      "Confirm Delivery Order"
                    )}
              </button>
                </div>
            </form>
            )}

            {!success && (
            <div className="mt-auto pt-6">
              <button
                onClick={onBack}
                  disabled={isSubmitting}
                  className="w-full border border-gray-300 py-3 rounded-lg flex items-center justify-center gap-2 hover:bg-gray-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Order Type</span>
              </button>
            </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
