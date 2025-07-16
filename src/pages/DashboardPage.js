import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import SearchAndFilter from '../components/SearchAndFilter';
import { getFileIcon, formatFileSize, formatDate } from '../utils/formatters';

function DashboardPage() {
  const { user } = useAuth();
  const { files, getStats, getRecentFiles, loading } = useData();

  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilters, setActiveFilters] = useState([]);
  const [recentFiles, setRecentFiles] = useState([]);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    if (!loading) {
      setStats(getStats());
      const allRecent = getRecentFiles(5);
      const filtered = allRecent.filter(file =>
        file.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setRecentFiles(filtered);
    }
  }, [loading, files, searchTerm]);

  const filters = [
    { key: 'recent', label: 'Recent', icon: 'fas fa-clock' },
    { key: 'shared', label: 'Shared', icon: 'fas fa-share' },
    { key: 'favorites', label: 'Favorites', icon: 'fas fa-star' }
  ];

  const handleSearch = (term) => setSearchTerm(term);

  const handleFilter = (key) => {
    setActiveFilters(prev =>
      prev.includes(key) ? prev.filter(f => f !== key) : [...prev, key]
    );
  };

  const statCards = stats ? [
    { title: 'Total Files', count: stats.totalFiles, icon: 'fas fa-file-alt', color: 'text-success' },
    { title: 'Folders', count: stats.totalFolders, icon: 'fas fa-folder', color: 'text-primary' },
    { title: 'Shared Links', count: stats.totalSharedLinks, icon: 'fas fa-share', color: 'text-warning' },
    { title: 'Recent Activity', count: stats.recentActivity, icon: 'fas fa-clock', color: 'text-danger' }
  ] : [];

  const totalStorage = 10 * 1024 * 1024 * 1024; // 10 GB
  const usedStorage = files.reduce((sum, file) => sum + (file.size || 0), 0);
  const usedPercentage = Math.min((usedStorage / totalStorage) * 100, 100);
  const formattedUsed = formatFileSize(usedStorage);
  const formattedTotal = formatFileSize(totalStorage);

  const getStorageBarColor = (percent) => {
    if (percent < 50) return 'bg-success';
    if (percent < 80) return 'bg-warning';
    return 'bg-danger';
  };

  const mostAccessed = [...files]
    .sort((a, b) => (b.accessCount || 0) - (a.accessCount || 0))
    .slice(0, 5);

  if (loading || !stats) {
    return (
      <div className="main-content p-4 text-center">
        <i className="fas fa-spinner fa-spin fa-2x text-primary"></i>
        <p className="text-muted mt-2">Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <div className="main-content p-4">
      <div className="container-fluid">
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h1 className="display-6 fw-bold">Dashboard</h1>
            <p className="text-muted">
            Welcome back, {user?.email?.split('@')[0]}!
            </p>

          </div>
          <div className="text-end">
            <p className="small text-muted">Last login: Today</p>
          </div>
        </div>

        {/* Search & Filter */}
        <SearchAndFilter
          onSearch={handleSearch}
          onFilter={handleFilter}
          filters={filters}
          activeFilters={activeFilters}
          searchTerm={searchTerm}
        />

        {/* Stats */}
        <div className="row g-4 mb-4">
          {statCards.map((stat, i) => (
            <div key={i} className="col-md-6 col-lg-3">
              <div className="stats-card h-100">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h3 className="fw-bold">{stat.count}</h3>
                    <p className="text-muted small mb-0">{stat.title}</p>
                  </div>
                  <i className={`${stat.icon} fa-2x ${stat.color}`}></i>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="row g-4">
          {/* Recent Activity */}
          <div className="col-lg-8">
            <div className="card-custom">
              <div className="card-header bg-light border-bottom fw-semibold">
                <i className="fas fa-clock me-2"></i>Recent Activity
              </div>
              <div className="card-body p-0">
                {recentFiles.length > 0 ? (
                  <div className="list-group list-group-flush">
                    {recentFiles.map(file => (
                      <div key={file._id} className="list-group-item d-flex justify-content-between">
                        <div className="d-flex align-items-center">
                          <i className={`${getFileIcon(file.type)} me-3`}></i>
                          <div>
                            <h6 className="mb-1">{file.name}</h6>
                            <p className="text-muted small mb-0">
                              {file.type} • {formatFileSize(file.size)}
                            </p>
                          </div>
                        </div>
                        <small className="text-muted">
                        {formatDate(file.updatedAt || file.createdAt || file.uploadedAt || null)}
                        </small>

                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-5">
                    <i className="fas fa-file-alt fa-3x text-muted mb-3"></i>
                    <p className="text-muted">No recent activity</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="col-lg-4">
            {/* Most Accessed */}
            <div className="card-custom mb-4">
              <div className="card-header bg-light border-bottom fw-semibold">
                <i className="fas fa-chart-line me-2"></i>Most Accessed
              </div>
              <div className="card-body">
                <ul className="list-group list-group-flush">
                  {mostAccessed.map(item => (
                    <li key={item._id} className="list-group-item d-flex justify-content-between align-items-center">
                      <div className="d-flex align-items-center">
                        <i className={`${getFileIcon(item.type)} me-3`}></i>
                        <div>
                          <h6 className="mb-0">{item.name}</h6>
                          <small className="text-muted">{formatFileSize(item.size)}</small>
                        </div>
                      </div>
                      <span className="badge bg-secondary rounded-pill">{item.accessCount || 0}x</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Storage Usage */}
            <div className="card-custom">
              <div className="card-header bg-light border-bottom fw-semibold">Storage Usage</div>
              <div className="card-body">
                <div className="progress" style={{ height: '10px' }}>
                  <div
                    className={`progress-bar ${getStorageBarColor(usedPercentage)}`}
                    role="progressbar"
                    style={{ width: `${usedPercentage}%` }}
                  ></div>
                </div>
                <p className="small text-muted mt-2 text-center">
                  {formattedUsed} of {formattedTotal} used
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;
