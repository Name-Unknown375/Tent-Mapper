import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAppStore } from './stores/useAppStore';
import { LoginPage, EditorPage, EmbedPage } from './pages';

// Protected route wrapper
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAppStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Login page */}
        <Route path="/login" element={<LoginPage />} />

        {/* Protected editor */}
        <Route
          path="/editor"
          element={
            <ProtectedRoute>
              <EditorPage />
            </ProtectedRoute>
          }
        />

        {/* Embeddable version - no auth required */}
        <Route path="/embed" element={<EmbedPage />} />
        <Route path="/embed/:layoutId" element={<EmbedPage />} />

        {/* Default redirect */}
        <Route path="/" element={<Navigate to="/embed" replace />} />

        {/* 404 - redirect to embed */}
        <Route path="*" element={<Navigate to="/embed" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
