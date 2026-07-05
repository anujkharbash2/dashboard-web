import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './lib/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ApiKeys from './pages/ApiKeys';
import Usage from './pages/Usage';
import Quickstart from './pages/Quickstart';
import Playground from './pages/Playground';
import { AppShell } from './components/app-shell';
import Collections from './pages/Collections';

function ProtectedRoute({ children }) {
  const { session, loading } = useAuth();
  if (loading) return <p className="p-6 text-sm text-muted-foreground">Loading…</p>;
  if (!session) return <Navigate to="/login" />;
  return <AppShell>{children}</AppShell>;
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
      <Route path="/collections" element={<ProtectedRoute><Collections /></ProtectedRoute>} />
      <Route path="/collections" element={<ProtectedRoute><Collections /></ProtectedRoute>} />

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