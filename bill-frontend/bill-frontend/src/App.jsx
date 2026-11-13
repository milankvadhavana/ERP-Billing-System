import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Register from "./Register";
import Login from "./Login";
import Dashboard from "./Dashboard";
<<<<<<< HEAD
import Customers from "./Customers";
import Products from "./Products";
import Invoices from "./Invoices";
import CreateInvoice from "./CreateInvoice";
import Ledger from "./Ledger";
import Payments from "./Payments";
=======
>>>>>>> 3d3b6fc4a115c150cc9fbed80a4e0a369d613c0d

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
<<<<<<< HEAD
        
        {/* Protected Routes */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/customers" element={<Customers />} />
        
        {/* Add dummy routes for other sidebar links to prevent errors */}
        <Route path="/products" element={<Products />} />
        <Route path="/invoices" element={<Invoices />} />
        <Route path="/invoices/create" element={<CreateInvoice />} />
        <Route path="/invoices/edit/:id" element={<CreateInvoice />} />
        <Route path="/payments" element={<Payments />} />
        <Route path="/ledger" element={<Ledger />} />
<Route path="/ledger/:customerId" element={<Ledger />} />
=======
        <Route path="/dashboard" element={<Dashboard />} />
>>>>>>> 3d3b6fc4a115c150cc9fbed80a4e0a369d613c0d
      </Routes>
    </BrowserRouter>
  );
}

export default App;