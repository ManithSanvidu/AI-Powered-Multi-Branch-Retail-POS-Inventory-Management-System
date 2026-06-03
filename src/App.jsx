import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./routes/ProtectedRoute";

import Login          from "./pages/auth/Login";
import Register       from "./pages/auth/Register";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword  from "./pages/auth/ResetPassword";
import Profile        from "./pages/auth/Profile";

// Placeholder pages
const Dashboard    = () => <h1>📊 Dashboard (All Roles)</h1>;
const AdminPanel   = () => <h1>🔐 Admin Panel</h1>;
const Unauthorized = () => <h1>⛔ Unauthorized Access</h1>;

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/login"           element={<Login />} />
          <Route path="/register"        element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/unauthorized"    element={<Unauthorized />} />

          {/* Private - All Roles */}
          <Route path="/dashboard" element={
            <ProtectedRoute roles={["admin","manager","cashier"]}>
              <Dashboard />
            </ProtectedRoute>
          }/>

          {/* Private - Profile */}
          <Route path="/profile" element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }/>

          {/* Private - Admin Only */}
          <Route path="/admin" element={
            <ProtectedRoute roles={["admin"]}>
              <AdminPanel />
            </ProtectedRoute>
          }/>

          {/* Default redirect */}
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;