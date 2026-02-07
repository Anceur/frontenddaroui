import { Routes, Route } from "react-router-dom"
import HomePage from "./pages/home"
import TableOrder from "./pages/TableOrder"
import { CartProvider } from "./context/CartContext"
export default function ClientApp() {
  return (
    <CartProvider>
      <Routes>
        <Route index element={<HomePage />} />
        <Route path="table/:tableId" element={<TableOrder />} />
        <Route path="*" element={<HomePage />} />
      </Routes>
    </CartProvider>
  )
}
