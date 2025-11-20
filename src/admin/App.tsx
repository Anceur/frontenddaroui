import { Routes, Route } from "react-router-dom";
import { useState, useCallback } from "react";
import NostalgieSidebar from "../shared/components/Sidebar";
import NostalgieNavbar from '../shared/components/Navbar';
import NostalgieDashboard from './pages/Dashboard';
import OrdersManagement from './pages/Orders';
import KitchenDisplay from './pages/Kitchen';
import MenuProducts from "./pages/Menu";
import StaffManagement from "./pages/Staff";
import SettingsPage from "./pages/Settings";
import Analytics from "./pages/Analytics";
import ChangePasswordPage from "./pages/ChangePassword";
import IngredientsManagement from "./pages/Ingredients";
import MenuItemSizesManagement from "./pages/MenuItemSizes";
import IngredientTracesManagement from "./pages/IngredientTraces";
import IngredientStockManagement from "./pages/IngredientStock";
import TablesManagement from "./pages/Tables";
import OfflineOrdersManagement from "./pages/OfflineOrders";
import CustomersManagement from "./pages/Customers";
import NotificationsPage from "./pages/Notifications";

function AdminApp() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  const handleMenuClick = useCallback(() => {
    console.log('Opening mobile menu');
    setIsMobileMenuOpen(true);
  }, []);

  const handleMenuClose = useCallback(() => {
    console.log('Closing mobile menu');
    setIsMobileMenuOpen(false);
  }, []);

  return (
    <div className="flex min-h-screen">
      <NostalgieSidebar 
        isMobileOpen={isMobileMenuOpen}
        onMobileClose={handleMenuClose}
      />

      <main className="flex-1 w-full lg:w-auto lg:ml-0 overflow-x-hidden relative">
        <NostalgieNavbar onMenuClick={handleMenuClick} />
        <div className="bg-[var(--color-bg)]">
          <Routes>
            <Route path="/" element={<NostalgieDashboard />} />
            <Route path="/orders" element={<OrdersManagement />} />
            <Route path="/offline-orders" element={<OfflineOrdersManagement />} />
            <Route path="/tables" element={<TablesManagement />} />
            <Route path="menu" element={<MenuProducts />} />
            <Route path="menu-item-sizes" element={<MenuItemSizesManagement />} />
            <Route path="ingredients" element={<IngredientsManagement />} />
            <Route path="ingredient-stock" element={<IngredientStockManagement />} />
            <Route path="ingredient-traces" element={<IngredientTracesManagement />} />
            <Route path="staff" element={<StaffManagement />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="notifications" element={<NotificationsPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="/change-password" element={<ChangePasswordPage />} />
          </Routes>
        </div>
      </main>
    </div>
  )
}

export default AdminApp
