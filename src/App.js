import React from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { DataProvider } from './contexts/DataContext';
import Router from './Router';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import UploadPage from './pages/UploadPage';
import ManageFilesPage from './pages/ManageFilesPage';
import Sidebar from './components/Sidebar';
import { useAuth } from './contexts/AuthContext';
import NotesPage from './pages/NotesPage'

function Layout({ children }) {
  return (
    <div>
      <Sidebar />
      {children}
    </div>
  );
}

function AppRoutes() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <Layout>
      <Router>
        <Route path="/dashboard"><DashboardPage /></Route>
        <Route path="/upload"><UploadPage /></Route>
        <Route path="/manage"><ManageFilesPage /></Route>
        <Route path="/notes"><NotesPage /></Route>
      </Router>
    </Layout>
  );
}

function Route({ children }) {
  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <DataProvider>
          <AppRoutes />
        </DataProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}
