import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { Link } from '../Router';

export default function Sidebar() {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const [location, setLocation] = useState(window.location.hash.slice(1) || '/dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const handleHashChange = () => {
      setLocation(window.location.hash.slice(1) || '/dashboard');
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navItems = [
    { path: '/dashboard', icon: 'fas fa-tachometer-alt', label: 'Dashboard', class: 'dashboard' },
    { path: '/upload', icon: 'fas fa-cloud-upload-alt', label: 'Upload Files', class: 'upload' },
    { path: '/manage', icon: 'fas fa-folder-open', label: 'Manage Files', class: 'manage' }
  ];

  return (
    <>
      <button 
        className="d-md-none mobile-menu-btn"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        <i className="fas fa-bars"></i>
      </button>

      <div className={`sidebar-fixed ${sidebarOpen ? 'show' : ''} d-flex flex-column p-3`}>
        <div className="text-center">
          <div className="sidebar-brand">EduDoc</div>
          <p className="text-muted mb-3">Enhanced Document Management</p>
        </div>

        {user && (
          <div className="user-info text-center">
            <i className="fas fa-user-circle fa-2x mb-2"></i>
            <div className="fw-bold">{user.name}</div>
            <small className="text-muted">{user.email}</small>
          </div>
        )}
        
        <div className="d-flex justify-content-center mb-4">
          <button onClick={toggleTheme} className="theme-toggle">
            <i className={`fas ${theme === 'light' ? 'fa-moon' : 'fa-sun'} me-2`}></i>
            {theme === 'light' ? 'Dark' : 'Light'} Mode
          </button>
        </div>

        <nav className="d-flex flex-column gap-1 flex-grow-1">
          {navItems.map((item) => (
            <Link key={item.path} href={item.path}>
              <button className={`nav-btn ${item.class} ${location === item.path ? 'active' : ''}`}>
                <i className={item.icon}></i>
                {item.label}
              </button>
            </Link>
          ))}
        </nav>

        <div>
          <button className="nav-btn logout" onClick={logout}>
            <i className="fas fa-sign-out-alt"></i>
            Logout
          </button>
        </div>
      </div>
    </>
  );
}
