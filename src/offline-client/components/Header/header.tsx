import { Menu, X, Utensils } from "lucide-react"

interface HeaderProps {
  tableNumber?: string | null
  isMenuOpen?: boolean
  onMenuToggle?: () => void
}

export default function Header({ tableNumber, isMenuOpen = false, onMenuToggle }: HeaderProps) {
  return (
    <header className="bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500 text-white py-3 md:py-5 px-4 md:px-6 sticky top-0 z-50 shadow-xl backdrop-blur-sm w-full">
      <div className="container mx-auto flex justify-between items-center w-full">
        <div className="flex items-center gap-2 md:gap-4 flex-1 min-w-0">
          <div className="bg-white/20 backdrop-blur-md p-2 md:p-3 rounded-xl md:rounded-2xl shadow-lg flex-shrink-0">
            <Utensils size={20} className="md:w-7 md:h-7 text-white" />
          </div>
          <div className="flex flex-col min-w-0">
            <h1 className="text-xl md:text-3xl font-black tracking-tight truncate">Our Menu</h1>
            {tableNumber && (
              <div className="flex items-center gap-2 mt-0.5 md:mt-1">
                <span className="text-amber-200 text-xs md:text-sm font-semibold bg-white/20 px-2 md:px-3 py-0.5 md:py-1 rounded-full backdrop-blur-sm whitespace-nowrap">
                  🪑 Table {tableNumber}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Hamburger Menu Button - Always visible on mobile */}
        <button
          onClick={onMenuToggle}
          className="md:hidden p-2 bg-white/20 backdrop-blur-md text-white rounded-xl shadow-xl hover:bg-white/30 hover:scale-105 active:scale-95 transition-all duration-200 flex-shrink-0 ml-2"
          aria-label="Toggle menu"
        >
          {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>
    </header>
  )
}