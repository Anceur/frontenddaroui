"use client"

import { Menu, X } from "lucide-react"
import React from "react"

interface HeaderProps {
  tableNumber?: string | null
  isMenuOpen?: boolean
  onMenuToggle?: () => void
  onCartOpen?: () => void
  cartItemCount?: number

  // 🔍 Recherche / Filtre
  searchQuery?: string
  onSearchChange?: (value: string) => void
  onFilter?: (query: string) => void
}

export default function Header({
  tableNumber,
  isMenuOpen = false,
  onMenuToggle,
  onCartOpen,
  cartItemCount = 0,
  searchQuery = "",
  onSearchChange,
  onFilter
}: HeaderProps) {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSearchChange?.(e.target.value)
  }

  const handleFilterClick = () => {
    onFilter?.(searchQuery)
  }

  return (
    <header className="py-3 md:py-4 px-4 md:px-6 sticky top-0 z-50 w-full bg-[#3A2C1C] shadow-md">
      <div className="container mx-auto flex justify-between items-center gap-3 w-full">

        {/* ☰ Bouton Menu */}
        <button
          onClick={onMenuToggle}
          className="p-3 bg-[#E9C79B] text-[#3A2C1C] rounded-2xl shadow-md hover:bg-[#dcb88a] transition-all duration-200 flex-shrink-0"
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* 🔍 Recherche / Filtre */}
        <div className="flex-1 relative max-w-3xl">
          {/* Icône de recherche */}
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#7A6244]">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
          </div>

          <input
            type="text"
            placeholder="Filtrer par nom ou catégorie…"
            value={searchQuery}
            onChange={handleInputChange}
            className="
              w-full
              pl-12
              pr-24
              py-3
              bg-white
              border
              border-[#7A6244]
              text-[#3A2C1C]
              placeholder-[#7A6244]
              rounded-2xl
              focus:outline-none
              focus:ring-2
              focus:ring-[#E9C79B]
            "
          />

          {/* 🧹 Bouton Filtrer */}
          <button
            onClick={handleFilterClick}
            className="
              absolute
              right-2
              top-1/2
              -translate-y-1/2
              bg-[#E9C79B]
              text-[#3A2C1C]
              px-4
              py-2
              rounded-xl
              text-sm
              font-semibold
              shadow-md
              hover:bg-[#dcb88a]
              transition
              flex
              items-center
              gap-1
            "
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M3 4h18l-7 8v6l-4 2v-8L3 4z" />
            </svg>
            Filtrer
          </button>
        </div>

        {/* 🛒 Bouton Panier */}
        <div className="relative flex-shrink-0">
          <button
            onClick={onCartOpen}
            className="
              relative
              p-3
              rounded-2xl
              bg-[#CDA56A]
              border
              border-[#E9C79B]
              shadow-[0_8px_20px_rgba(205,165,106,0.35)]
              transition-all
              duration-300
              hover:bg-[#b89258]
              hover:scale-105
              active:scale-95
              focus:outline-none
            "
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
          </button>

          {/* 🔴 Badge du panier */}
          {cartItemCount > 0 && (
            <span
              className="
                absolute
                -top-2
                -right-2
                min-w-[22px]
                h-[22px]
                px-1
                rounded-full
                bg-[#f8347e]
                text-white
                text-xs
                font-bold
                flex
                items-center
                justify-center
                shadow-[0_4px_10px_rgba(248,52,126,0.6)]
                animate-pulse
              "
            >
              {cartItemCount}
            </span>
          )}
        </div>
      </div>
    </header>
  )
}
