import { Routes, Route, useParams } from "react-router-dom"
import HomePage from "./pages/home"
import { CartProvider } from "./context/CartContext" 

export default function OfflineClientApp() {
  const { tableNumber } = useParams<{ tableNumber: string }>()
  
  return (
    <CartProvider>
      <Routes>
        <Route path="/" element={<HomePage tableNumber={tableNumber || null} />} />
      </Routes>
    </CartProvider>
  )
}
