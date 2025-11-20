import { Routes, Route } from 'react-router-dom';
import TablesStatus from './pages/TablesStatus';
import PendingOrders from './pages/PendingOrders';
import ManualOrderEntry from './pages/ManualOrderEntry';
import CashierNavbar from '../shared/components/CashierNavbar';

export default function CashierApp() {
  return (
    <div className="min-h-screen bg-gray-50">
      <CashierNavbar />
      <Routes>
        <Route path="/" element={<TablesStatus />} />
        <Route path="/tables" element={<TablesStatus />} />
        <Route path="/orders" element={<PendingOrders />} />
        <Route path="/create-order" element={<ManualOrderEntry />} />
      </Routes>
    </div>
  );
}


