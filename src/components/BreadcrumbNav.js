import React from 'react';

function BreadcrumbNav({ path, onNavigate }) {
  const pathParts = (path || '').split('/').filter(part => part);

  return (
    <div className="breadcrumb-custom">
      <nav className="d-flex align-items-center mb-3">
        <button
          className="btn btn-sm btn-outline-secondary me-2"
          onClick={() => onNavigate('')}
        >
          <i className="fas fa-home me-1"></i>
          Root
        </button>

        {pathParts.map((part, index) => {
          const fullPath = pathParts.slice(0, index + 1).join('/');
          const isLast = index === pathParts.length - 1;

          return (
            <div key={fullPath} className="d-flex align-items-center">
              <i className="fas fa-chevron-right text-muted mx-2"></i>
              {isLast ? (
                <span className="fw-medium">{part}</span>
              ) : (
                <button
                  className="btn btn-sm btn-link p-0"
                  onClick={() => onNavigate(fullPath)}
                >
                  {part}
                </button>
              )}
            </div>
          );
        })}
      </nav>

      {pathParts.length > 0 && (
        <button
          className="btn btn-sm btn-outline-secondary"
          onClick={() => onNavigate(pathParts.slice(0, -1).join('/'))}
        >
          <i className="fas fa-arrow-left me-1"></i>
          Back
        </button>
      )}
    </div>
  );
}

export default BreadcrumbNav;
