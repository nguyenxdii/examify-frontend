import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import NotFound from "./pages/NotFound";
import AdminDashboard from "./pages/dashboard/AdminDashboard";
import UserDashboard from "./pages/dashboard/UserDashboard";
import DashboardRedirect from "./pages/dashboard/DashboardRedirect";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Dashboard Routes */}
        <Route path="/dashboard" element={<DashboardRedirect />} />
        <Route path="/dashboard/admin" element={<AdminDashboard />} />
        <Route path="/dashboard/user" element={<UserDashboard />} />
        
        {/* Placeholder sub-routes */}
        <Route path="/dashboard/*" element={<div className="p-20 text-center"><h1>Sub-page Placeholder</h1><p>Tính năng đang phát triển!</p></div>} />
        {/* Catch-all route for 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
