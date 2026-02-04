import { Routes, Route, useParams, Navigate } from "react-router-dom"
import HomePage from "./pages/home"
import { CartProvider } from "./context/CartContext"
import { TableSessionProvider, useTableSession } from "./context/TableSessionContext"
import FullscreenLoader from "../shared/components/FullscreenLoader"

function OfflineAppContent() {
  const { loading, error, session } = useTableSession();

  if (loading) {
    return <FullscreenLoader message="Occupying table..." />;
  }

  if (error) {
    if (error.toLowerCase().includes('closed')) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center bg-gray-50">
          <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-orange-600">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12 6 12 12 16 14"/>
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Restaurant Fermé</h1>
          <p className="text-gray-600 mb-6 max-w-md">{error}</p>
          <div className="p-4 bg-white rounded-lg shadow-sm w-full max-w-sm border border-gray-100">
            <p className="text-sm text-gray-500">
              Nous serons ravis de vous accueillir pendant nos heures d'ouverture.
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
        <h1 className="text-2xl font-bold text-red-600 mb-2">Unable to access table</h1>
        <p className="text-gray-600 mb-4">{error}</p>
        <p className="text-sm text-gray-500">Please scan a valid QR code or ask a staff member.</p>
      </div>
    );
  }

  if (!session) {
    return <div className="text-center p-10">Initializing session...</div>;
  }

  // Session is active and table is occupied for this user
  return (
    <CartProvider>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </CartProvider>
  );
}

export default function OfflineClientApp() {
  // We get tableNumber from the parent route in RoleRouter (/:tableNumber/*)
  const params = useParams();
  const tableNumber = params.tableNumber; // Assuming the route param is named tableNumber

  if (!tableNumber) {
    return <div className="text-center p-10">Invalid URL: Missing Table Number</div>;
  }

  return (
    <TableSessionProvider tableNumber={tableNumber}>
      <OfflineAppContent />
    </TableSessionProvider>
  )
}
