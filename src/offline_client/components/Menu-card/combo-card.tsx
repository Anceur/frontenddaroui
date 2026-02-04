import { useState } from "react";
import { Package, Check } from "lucide-react";
import { useCart } from "../../context/CartContext";
import type { Promotion } from "../../lib/api";

interface ComboCardProps {
    promotion: Promotion;
}

export default function ComboCard({ promotion }: ComboCardProps) {
    const [isAdding, setIsAdding] = useState(false);
    const { addToCart } = useCart();

    const handleAdd = () => {
        setIsAdding(true);
        addToCart({
            id: `promo_${promotion.id}`,
            name: promotion.name,
            price: parseFloat(promotion.value),
            quantity: 1,
        });
        setTimeout(() => setIsAdding(false), 1000);
    };

    return (
      <div className="rounded-3xl overflow-visible shadow-lg hover:shadow-2xl transition-all duration-300 flex flex-col h-full w-full border-0 group relative pt-8 mb-6"
           style={{ background: 'linear-gradient(135deg, #f5e6d3 0%, #f9d9b1 100%)' }}>

            {/* Icône circulaire en haut */}
            <div className="flex justify-center -mt-10 mb-2">
                <div className="relative w-32 h-32 rounded-full overflow-hidden bg-gradient-to-br from-amber-400 to-orange-500 shadow-xl ring-4 ring-white flex items-center justify-center">
                    <Package size={48} className="text-white" />
                    
                    {/* Badge exclusif */}
                    <div className="absolute -top-1 -right-1 bg-amber-500 text-white text-xs font-bold w-8 h-8 rounded-full shadow-lg flex items-center justify-center">
                        <span>⭐</span>
                    </div>
                </div>
            </div>

            <div className="px-5 pb-5 pt-2 flex flex-col flex-grow bg-[#f5e6d3] rounded-3xl">

                {/* Badge de catégorie */}
                <div className="flex justify-center mb-2">
                    <span className="bg-amber-50 text-amber-600 text-xs font-bold px-3 py-1 rounded-full">
                        Pack Exclusif
                    </span>
                </div>

                {/* Titre */}
                <h3 className="text-lg font-bold text-gray-900 mb-2 leading-tight text-center">
                    {promotion.name}
                </h3>

                {/* Items du combo */}
                <div className="mb-3 bg-gray-50 rounded-2xl p-3 border border-gray-100">
                    <p className="text-[10px] font-bold text-amber-600 uppercase tracking-wider mb-2 text-center">
                        Sélection Soignée
                    </p>
                    <div className="space-y-2">
                        {promotion.combo_items.map((item, idx) => (
                            <div key={idx} className="flex justify-between items-center text-xs text-gray-700">
                                <span className="font-medium">
                                    {item.menu_item_name}
                                    {item.size_label && (
                                        <span className="text-[10px] text-gray-400 ml-1">({item.size_label})</span>
                                    )}
                                </span>
                                <span className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full text-[10px] font-bold">
                                    x{item.quantity}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex-grow min-h-[0.5rem]"></div>

                {/* Pied de carte : Prix & Bouton */}
                <div className="pt-3 mt-1">
                    <div className="flex items-center justify-between gap-3">
                        <div className="text-left">
                            <div className="text-xs text-gray-500 font-semibold mb-0.5 uppercase tracking-wide">
                                Prix fixe
                            </div>
                            <div className="text-2xl font-bold text-gray-900">
                                {parseFloat(promotion.value).toFixed(0)} DA
                            </div>
                        </div>

                        <button
                            onClick={handleAdd}
                            disabled={isAdding}
                            className={`w-12 h-12 rounded-full font-bold text-lg transition-all duration-300 flex items-center justify-center shadow-lg ${
                                isAdding
                                    ? "bg-green-500 text-white scale-95"
                                    : "bg-amber-500 hover:bg-amber-600 text-white hover:shadow-xl hover:scale-110 active:scale-95"
                            }`}
                        >
                            {isAdding ? <Check size={24} /> : <span>+</span>}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
