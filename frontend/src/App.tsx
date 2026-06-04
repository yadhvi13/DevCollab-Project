import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import AuthPage from './pages/AuthPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import DashboardPage from './pages/DashboardPage';
import RepoPage from './pages/RepoPage';
import ProfilePage from './pages/ProfilePage';
import SocialFeedPage from './pages/SocialFeedPage';
import GlobalChatPage from './pages/GlobalChatPage';

import CreateRepoPage from './pages/CreateRepoPage';
import ImportRepoPage from './pages/ImportRepoPage';
import NewProjectPage from './pages/NewProjectPage';
import ExplorePage from './pages/ExplorePage';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center text-white">Loading...</div>;
  if (!user) return <Navigate to="/auth" />;
  return <>{children}</>;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/" element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        } />
        <Route path="/create" element={
          <ProtectedRoute>
            <CreateRepoPage />
          </ProtectedRoute>
        } />
        <Route path="/import" element={
          <ProtectedRoute>
            <ImportRepoPage />
          </ProtectedRoute>
        } />
        <Route path="/project/new" element={
          <ProtectedRoute>
            <NewProjectPage />
          </ProtectedRoute>
        } />
        <Route path="/explore" element={
          <ProtectedRoute>
            <ExplorePage />
          </ProtectedRoute>
        } />
        <Route path="/feed" element={
          <ProtectedRoute>
            <SocialFeedPage />
          </ProtectedRoute>
        } />
        <Route path="/chat" element={
          <ProtectedRoute>
            <GlobalChatPage />
          </ProtectedRoute>
        } />
        <Route path="/profile" element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        } />
        <Route path="/repo/:id" element={
          <ProtectedRoute>
            <RepoPage />
          </ProtectedRoute>
        } />
      </Routes>
      </BrowserRouter>
  );
}

export default App;
