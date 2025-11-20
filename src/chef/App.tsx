// @ts-nocheck
import React from 'react'
import ChefNavbar from '../shared/components/Chefnavbar'
import { Routes, Route } from 'react-router-dom'
import Orders from './pages/Orders'
import OrderDetails from './pages/OrderDetails'
import Menu from './pages/Menu'
import Stats from './pages/Stats'
import Ingredients from './pages/Ingredients'
import MenuItemIngredients from './pages/MenuItemIngredients'
export default function ChefApp() {
  return (
    <div>
        <ChefNavbar />
        <div style={{ padding: '16px' }}>
          <Routes>
            <Route path="/" element={<Orders />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/orders/:orderId" element={<OrderDetails />} />
            <Route path="/menu" element={<Menu />} />
            <Route path="/menu/:menuItemId/ingredients" element={<MenuItemIngredients />} />
            <Route path="/ingredients" element={<Ingredients />} />
            <Route path="/stats" element={<Stats />} />
          </Routes>
        </div>
    </div>
  )
}
