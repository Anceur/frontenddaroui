import { Routes, Route } from 'react-router-dom';
import TablesStatus from './pages/TablesStatus';
import PendingOrders from './pages/PendingOrders';
import ManualOrderEntry from './pages/ManualOrderEntry';
import ManualOnlineOrder from './pages/ManualOnlineOrder';
import OrdersHistory from './pages/OrdersHistory';
import CashierNavbar from '../shared/components/CashierNavbar';

export default function CashierApp() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-orange-50/30">
      <CashierNavbar />
      <Routes>
        <Route path="/" element={<TablesStatus />} />
        <Route path="/tables" element={<TablesStatus />} />
        <Route path="/orders" element={<PendingOrders />} />
        <Route path="/create-order" element={<ManualOrderEntry />} />
        <Route path="/manual-online-order" element={<ManualOnlineOrder />} />
        <Route path="/history" element={<OrdersHistory />} />
      </Routes>
    </div>
  );
}
