import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, CheckCircle, AlertCircle, Loader2, MapPin, ChevronDown, ChevronUp } from "lucide-react";
import { useState, useEffect } from "react";
import { useCart } from "../../context/CartContext";
import { OrderService } from "../../services/orderService";
import { getUserLocation } from "../../utils/location";

export default function DeliveryDetailsDrawer({
  isOpen,
  onClose,
  onBack,
}: DeliveryDetailsDrawerProps) {
  const { cartItems, clearCart } = useCart();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [loyaltyNumber, setLoyaltyNumber] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<{ orderId: string; message: string } | null>(null);
  const [isFetchingLocation, setIsFetchingLocation] = useState(false);
  const [showNotesField, setShowNotesField] = useState(false); // New state for toggling notes

  // 📍 Récupérer automatiquement l'adresse à l'ouverture du tiroir
  useEffect(() => {
    if (isOpen && !address) {
      fetchAddressFromLocation();
    }
  }, [isOpen]);

  const fetchAddressFromLocation = async () => {
    setIsFetchingLocation(true);
    const location = await getUserLocation();
    if (location) {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${location.latitude}&lon=${location.longitude}`
        );
        const data = await res.json();
        setAddress(data.display_name || "");
      } catch (err) {
        console.error("Échec de la récupération de l'adresse :", err);
      }
    }
    setIsFetchingLocation(false);
  };

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

    const subtotal = calculateSubtotal();
    const taxAmount = 100;
    const total = subtotal + taxAmount;

    const orderData = {
      customer: name.trim(),
      phone: phone.trim(),
      address: address.trim(),
      items: cartItems.map((item) => ({
        id: item.id.toString(),
        name: item.name,
        price: item.price,
        quantity: item.quantity,
      })),
      subtotal,
      tax_amount: taxAmount,
      total,
      orderType: "delivery" as const,
      notes: notes.trim(),
      ...(loyaltyNumber.trim() && { loyalty_number: loyaltyNumber.trim() }),
    };

    setIsSubmitting(true);
    try {
      const response = await OrderService.submitOrder(orderData);
      setSuccess({
        orderId: response.order.id,
        message: response.message || "Commande passée avec succès !",
      });
      clearCart();
      setName("");
      setPhone("");
      setAddress("");
      setNotes("");
      setLoyaltyNumber("");
      setTimeout(() => {
        onClose();
        setSuccess(null);
      }, 3000);
    } catch (err: any) {
      console.error("Erreur lors de la commande :", err);
      setError(err.message || "Échec de la commande.");
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
            {/* En-tête */}
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Détails de livraison</h2>
              <button onClick={onClose} className="text-gray-500 hover:text-black text-2xl">
                &times;
              </button>
            </div>

            <div className="flex-1 overflow-y-auto pr-1">
              {success ? (
                <div className="flex flex-col items-center justify-center space-y-4 py-8 text-center">
                  <CheckCircle className="w-16 h-16 text-green-500" />
                  <h3 className="text-xl font-bold text-green-700">Commande confirmée !</h3>
                  <p className="text-gray-600">{success.message}</p>
                  <p className="text-xs text-gray-500">ID de commande : {success.orderId}</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
                      <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-red-700">{error}</p>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-semibold mb-1">Nom complet *</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      disabled={isSubmitting}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      placeholder="Ahmed Benali"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-1">Numéro de téléphone *</label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                      disabled={isSubmitting}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      placeholder="0555 123 456"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-1 flex justify-between items-center">
                      Adresse de livraison *
                      <span className="text-sm text-gray-500">
                        {isFetchingLocation ? "Localisation en cours..." : ""}
                      </span>
                    </label>
                    <textarea
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      required
                      disabled={isSubmitting}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 resize-none"
                      rows={2}
                      placeholder="Adresse détaillée..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-1">
                      Numéro de fidélité (optionnel)
                    </label>
                    <input
                      type="text"
                      value={loyaltyNumber}
                      onChange={(e) => setLoyaltyNumber(e.target.value)}
                      disabled={isSubmitting}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      placeholder="Code à 8 chiffres"
                    />
                  </div>

                  {/* Votre panier - Clickable to show Notes */}
                  <div>
                    <button
                      type="button"
                      onClick={() => setShowNotesField(!showNotesField)}
                      className="w-full flex items-center justify-between text-sm font-semibold mb-1 hover:text-amber-600 transition-colors"
                    >
                      <span>Votre panier</span>
                      {showNotesField ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </button>
                    
                    <AnimatePresence>
                      {showNotesField && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="pt-2">
                            <label className="block text-xs text-gray-600 mb-1">
                              Notes / Instructions
                            </label>
                            <textarea
                              value={notes}
                              onChange={(e) => setNotes(e.target.value)}
                              disabled={isSubmitting}
                              className="w-full border border-gray-300 rounded-lg px-3 py-2 resize-none"
                              rows={2}
                              placeholder="Ex : appeler avant d'arriver, pas épicé…"
                            />
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <div className="pt-4 border-t border-gray-100">
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>Sous-total</span>
                      <span>{calculateSubtotal().toFixed(2)} DA</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-600 mb-2">
                      <span>Taxe</span>
                      <span>100.00 DA</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg mb-4">
                      <span>Total</span>
                      <span className="text-amber-600">
                        {(calculateSubtotal() + 100).toFixed(2)} DA
                      </span>
                    </div>
                    <button
                      type="submit"
                      disabled={isSubmitting || !name.trim() || !phone.trim() || !address.trim()}
                      className="w-full bg-amber-500 hover:bg-amber-600 text-white py-3 rounded-lg font-bold flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : null}
                      Confirmer la livraison
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