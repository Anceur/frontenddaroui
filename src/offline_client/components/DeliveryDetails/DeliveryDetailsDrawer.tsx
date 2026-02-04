import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { useState } from "react";
import { useCart } from "../../context/CartContext";
import { useTableSession } from "../../context/TableSessionContext";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || 'https://backenddaroui.onrender.com';

interface DeliveryDetailsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onBack: () => void;
}

export default function DeliveryDetailsDrawer({
  isOpen,
  onClose,
  onBack,
}: DeliveryDetailsDrawerProps) {
  const { cartItems, clearCart } = useCart();
  const { session } = useTableSession();

  const [loyaltyNumber, setLoyaltyNumber] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<{ orderId: string; message: string } | null>(null);

  const calculateSubtotal = () => {
    const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    return Math.round(subtotal * 100) / 100;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (cartItems.length === 0) {
      setError("Votre panier est vide.");
      return;
    }

    if (!session) {
      setError("Session active introuvable. Veuillez rafraîchir la page.");
      return;
    }

    setIsSubmitting(true);
    try {
      const orderData = {
        session_token: session.token,
        items: cartItems.map((item) => ({
          item_id: parseInt(item.id) || 0,
          quantity: item.quantity,
          notes: ''
        })),
        notes: notes.trim(),
        ...(loyaltyNumber.trim() && { loyalty_number: loyaltyNumber.trim() })
      };

      const response = await axios.post(`${API_URL}/public/table-sessions/order/`, orderData, {
        withCredentials: false
      });

      if (response.data.success) {
        setSuccess({
          orderId: response.data.order.id.toString(),
          message: "Commande passée avec succès !",
        });
        clearCart();
        setLoyaltyNumber("");
        setNotes("");
        setTimeout(() => {
          onClose();
          setSuccess(null);
        }, 3000);
      }
    } catch (err: any) {
      console.error("Erreur lors de la commande :", err);
      setError(err.response?.data?.error || err.message || "Échec de la commande.");
    } finally {
      setIsSubmitting(false);
    }
  };

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
            className="fixed top-0 right-0 h-full w-full sm:w-96 bg-white text-black shadow-lg z-50 p-6 flex flex-col"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 100, damping: 20 }}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Détails de la commande</h2>
              <button onClick={onClose} className="text-gray-500 hover:text-black text-2xl">
                &times;
              </button>
            </div>

            <div className="flex-1 overflow-y-auto pr-1">
              {success ? (
                <div className="flex flex-col items-center justify-center space-y-4 py-8 text-center">
                  <CheckCircle className="w-16 h-16 text-green-500" />
                  <h3 className="text-xl font-bold text-green-700">Commande passée !</h3>
                  <p className="text-gray-600">{success.message}</p>
                  <p className="text-xs text-gray-500">ID de commande : {success.orderId}</p>
                  <p className="text-sm font-semibold mt-2">Table : {session?.table.number}</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
                      <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-red-700">{error}</p>
                    </div>
                  )}

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                    <p className="text-sm text-blue-800 font-semibold mb-1">Table actuelle</p>
                    <p className="text-2xl font-bold text-blue-900">{session?.table.number}</p>
                    <p className="text-xs text-blue-600 mt-1">Cette table est réservée pour votre session</p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-1">Numéro de fidélité (optionnel)</label>
                    <input
                      type="text"
                      value={loyaltyNumber}
                      onChange={(e) => setLoyaltyNumber(e.target.value)}
                      disabled={isSubmitting}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      placeholder="Code à 8 chiffres"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-1">Notes / Instructions</label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      disabled={isSubmitting}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 resize-none"
                      rows={2}
                      placeholder="Ex : Pas épicé, sauce supplémentaire..."
                    />
                  </div>

                  <div className="pt-4 border-t border-gray-100">
                    <div className="flex justify-between font-bold text-lg mb-4">
                      <span>Total</span>
                      <span className="text-amber-600">{calculateSubtotal().toFixed(2)} DA</span>
                    </div>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-amber-500 hover:bg-amber-600 text-white py-3 rounded-lg font-bold flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : null}
                      Passer la commande
                    </button>
                  </div>
                </form>
              )}
            </div>

            {!success && (
              <div className="mt-6 pt-6 border-t border-gray-100">
                <button
                  onClick={onBack}
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center gap-2 text-gray-500 hover:text-gray-800 transition-colors py-2"
                >
                  <ArrowLeft size={16} />
                  <span>Retour au panier</span>
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
