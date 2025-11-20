import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import HomePage from "./pages/home"
import { CartProvider } from "./context/CartContext" 
export default function ClientApp() {
  return (
    <CartProvider>
        <Routes>
          <Route path="/" element={<HomePage />} />
        </Routes>
    </CartProvider>
  )
}
