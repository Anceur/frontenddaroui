"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import {
  Grid3x3,
  ShoppingCart,
  FileText,
  Coffee,
  IceCream,
  Sandwich,
  Star,
  HelpCircle,
  Moon,
} from "lucide-react";

interface MenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SweetcoMenu({ isOpen, onClose }: MenuProps) {
  const [activeItem, setActiveItem] = useState("Commande en ligne client");

  // Empêcher le scroll du body lorsque le menu est ouvert - FIX pour mobile
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      const originalPosition = document.body.style.position;
      const originalTop = document.body.style.top;
      const scrollY = window.scrollY;

      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      document.body.style.overflow = 'hidden';

      return () => {
        document.body.style.position = originalPosition;
        document.body.style.top = originalTop;
        document.body.style.width = '';
        document.body.style.overflow = originalOverflow;
        window.scrollTo(0, scrollY);
      };
    }
  }, [isOpen]);

  const menuItems = [
    {
      section: "Support",
      items: [
        {
          icon: HelpCircle,
          label: "Aide / Contact",
          onClick: () => {
            alert("Numéro de contact : +213 661 23 45 67");
          }
        }
      ],
    },
  ];

  const bottomItems = [{ icon: Moon, label: "Mode sombre" }];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* FOND */}
          <motion.div
            className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-40"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* MENU */}
          <motion.div
            className="fixed top-0 left-0 h-full w-[280px] sm:w-64 md:w-80 bg-white text-black shadow-2xl z-50 flex flex-col"
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            {/* EN-TÊTE */}
            <div className="flex-shrink-0 p-4 pb-3 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-[#392c1c] rounded-full flex items-center justify-center overflow-hidden shadow-md">
                    <img
                        src="https://firebasestorage.googleapis.com/v0/b/daroui.firebasestorage.app/o/imageapp%2Flogo.png?alt=media&token=baa79678-993f-4229-bf66-a89f5fa28a8a"
                      className="w-10 h-10 object-contain"
                      alt="logo"
                    />
                  </div>
                  <span className="text-xl font-bold text-gray-800">
                    Nostalgie
                  </span>
                </div>

                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600 text-2xl font-light w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-all"
                >
                  ×
                </button>
              </div>
            </div>

            {/* LISTE DU MENU - Scrollable */}
            <div 
              className="flex-1 overflow-y-auto overflow-x-hidden px-4 py-4"
              style={{
                WebkitOverflowScrolling: 'touch',
                touchAction: 'pan-y'
              }}
            >
              {menuItems.map((section, index) => (
                <div key={index} className="mb-6">
                  <p className="text-sm text-gray-500 uppercase font-semibold mb-3 px-2">
                    {section.section}
                  </p>

                  <div className="space-y-2">
                    {section.items.map((item) => {
                      const Icon = item.icon;
                      const isActive = activeItem === item.label;

                      return (
                        <button
                          key={item.label}
                          onClick={() => {
                            setActiveItem(item.label);
                            if (item.onClick) item.onClick(); // <-- affiche le numéro
                          }}
                          className={`
                            w-full flex items-center gap-4 px-4 py-4 rounded-xl text-base shadow-sm 
                            ${isActive ? "bg-orange-100 text-orange-600 border-l-4 border-orange-600" : "bg-gray-50 text-gray-800"}
                            active:scale-95 transition-all
                          `}
                        >
                          <Icon className="w-5 h-5 flex-shrink-0" />
                          <span className="truncate">{item.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* SECTION BAS - Fixe */}
            <div className="flex-shrink-0 border-t border-gray-200 p-4">
              {bottomItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.label}
                    className="w-full flex items-center gap-4 px-4 py-4 text-base text-gray-800 bg-gray-50 rounded-xl hover:bg-gray-100 active:scale-95 transition-all"
                  >
                    <Icon className="w-5 h-5" />
                    {item.label}
                  </button>
                );
              })}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
