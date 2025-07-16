import React, { useState, useEffect } from 'react';

// Main Router component
export default function Router({ children, fallback = null }) {
  const [currentPath, setCurrentPath] = useState(getCurrentPath());

  // Get current hash path or default to "/dashboard"
  function getCurrentPath() {
    return window.location.hash.slice(1) || '/dashboard';
  }

  useEffect(() => {
    const handleHashChange = () => {
      setCurrentPath(getCurrentPath());
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Try to find matching route
  const matchedRoute = React.Children.toArray(children).find(
    child => child.props.path === currentPath
  );

  return matchedRoute ? matchedRoute.props.children : fallback;
}

// Navigate programmatically to a route (e.g. navigate("/dashboard"))
export function navigate(path) {
  window.location.hash = path;
}

// Link component for navigation
export function Link({ href, children, className = '', ...props }) {
  return (
    <a
      href={`#${href}`}
      className={className}
      onClick={(e) => {
        e.preventDefault();
        navigate(href);
      }}
      {...props}
    >
      {children}
    </a>
  );
}
