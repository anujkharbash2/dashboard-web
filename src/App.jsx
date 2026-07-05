import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './lib/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ApiKeys from './pages/ApiKeys';
import Usage from './pages/Usage';
import Quickstart from './pages/Quickstart';
import Playground from './pages/Playground';

function ProtectedRoute({ children }) {
  const { session, loading } = useAuth();
  if (loading) return <p>Loading...</p>;
  return session ? children : <Navigate to="/login" />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/keys" element={<ProtectedRoute><ApiKeys /></ProtectedRoute>} />
      <Route path="/usage" element={<ProtectedRoute><Usage /></ProtectedRoute>} />
      <Route path="/quickstart" element={<Quickstart />} />
      <Route path="/playground" element={<ProtectedRoute><Playground /></ProtectedRoute>} />

      <Route path="*" element={<Navigate to="/dashboard" />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}

export default App;