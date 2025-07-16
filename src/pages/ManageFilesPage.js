import React, { useState } from 'react';
import { useData } from '../contexts/DataContext';
import SearchAndFilter from '../components/SearchAndFilter';
import BreadcrumbNav from '../components/BreadcrumbNav';
import ShareableLinkModal from '../components/ShareableLinkModal';
import { getFileIcon, formatFileSize } from '../utils/formatters';

function ManageFilesPage() {
  const [currentPath, setCurrentPath] = useState('');
  const [currentFolderId, setCurrentFolderId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilters, setActiveFilters] = useState([]);
  const [showShareModal, setShowShareModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [viewMode, setViewMode] = useState('list');

  const {
    getFoldersByParent,
    getFilesByFolder,
    searchFiles,
    searchFolders,
    folders,
    deleteFile,
    deleteFolder,
  } = useData();

  const filters = [
    { key: 'folders', label: 'Folders', icon: 'fas fa-folder' },
    { key: 'documents', label: 'Documents', icon: 'fas fa-file-alt' },
    { key: 'images', label: 'Images', icon: 'fas fa-image' },
    { key: 'recent', label: 'Recent', icon: 'fas fa-clock' },
  ];

  const currentFolders = searchTerm ? searchFolders(searchTerm) : getFoldersByParent(currentFolderId);
  const currentFiles = searchTerm ? searchFiles(searchTerm) : getFilesByFolder(currentFolderId);

  const getCurrentItems = () => {
    let allItems = [
      ...currentFolders.map((f) => ({ ...f, type: 'folder' })),
      ...currentFiles.map((f) => ({ ...f, type: 'file' })),
    ];

    if (activeFilters.length > 0) {
      allItems = allItems.filter((item) => {
        if (activeFilters.includes('folders') && item.type === 'folder') return true;
        if (
          activeFilters.includes('documents') &&
          item.type === 'file' &&
          ['pdf', 'doc', 'docx', 'txt'].some((ext) => item.name.toLowerCase().includes(ext))
        ) return true;
        if (
          activeFilters.includes('images') &&
          item.type === 'file' &&
          ['png', 'jpg', 'jpeg', 'gif'].some((ext) => item.name.toLowerCase().includes(ext))
        ) return true;
        return false;
      });
    }

    return allItems;
  };

  const handleFolderDoubleClick = (folder) => {
    const newPath = currentPath ? `${currentPath}/${folder.name}` : folder.name;
    setCurrentPath(newPath);
    setCurrentFolderId(folder._id);
  };

  const handleNavigate = (path) => {
    setCurrentPath(path);
    if (path === '') {
      setCurrentFolderId(null);
    } else {
      const lastPart = path.split('/').pop();
      const targetFolder = folders.find((f) => f.name === lastPart);
      setCurrentFolderId(targetFolder?._id || null);
    }
  };

  const handleSearch = (term) => setSearchTerm(term);
  const handleFilter = (key) => setActiveFilters((prev) =>
    prev.includes(key) ? prev.filter((f) => f !== key) : [...prev, key]);

  const handleShareFile = (file) => {
    setSelectedFile(file);
    setShowShareModal(true);
  };

  const handleDeleteConfirm = (item) => {
    const msg = item.type === 'folder'
      ? `Delete folder "${item.name}" and all its contents?`
      : `Delete file "${item.name}"?`;

    if (window.confirm(msg)) {
      item.type === 'folder' ? deleteFolder(item._id) : deleteFile(item._id);
    }
  };

  const items = getCurrentItems();

  return (
    <div className="main-content p-4">
      <div className="container-fluid">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h1 className="display-6 fw-bold">Manage Files</h1>
            <p className="text-muted">Organize and share your documents</p>
          </div>
        </div>

        <SearchAndFilter
          onSearch={handleSearch}
          onFilter={handleFilter}
          filters={filters}
          activeFilters={activeFilters}
          searchTerm={searchTerm}
        />

        <BreadcrumbNav path={currentPath} onNavigate={handleNavigate} />

        <div className="card-custom">
          <div className="card-header d-flex justify-content-between align-items-center">
            <h5 className="card-title mb-0">
              <i className="fas fa-folder-open me-2"></i>
              {currentPath || 'Root Directory'} ({items.length} items)
            </h5>
            <div className="btn-group">
              <button
                className={`btn btn-sm ${viewMode === 'list' ? 'btn-primary' : 'btn-outline-primary'}`}
                onClick={() => setViewMode('list')}
              >
                <i className="fas fa-list"></i>
              </button>
              <button
                className={`btn btn-sm ${viewMode === 'grid' ? 'btn-primary' : 'btn-outline-primary'}`}
                onClick={() => setViewMode('grid')}
              >
                <i className="fas fa-th"></i>
              </button>
            </div>
          </div>

          <div className="card-body">
            {items.length === 0 ? (
              <div className="text-center py-5">
                <i className="fas fa-folder-open fa-3x text-muted mb-3"></i>
                <p className="text-muted">No items to display</p>
              </div>
            ) : (
              <div className={viewMode === 'grid' ? 'row row-cols-1 row-cols-md-3 g-4' : 'list-group list-group-flush'}>
                {items.map(item => {
                  const key = item._id || item.id;
                  return viewMode === 'grid' ? (
                    <div key={key} className="col">
                      <div
                        className="card-custom p-3 h-100"
                        onDoubleClick={() => {
                          if (item.type === 'folder') handleFolderDoubleClick(item);
                          else if (item.type === 'file' && item.url) window.open(item.url, '_blank');
                        }}
                        style={{ cursor: 'pointer' }}
                      >
                        <div className="text-center mb-3">
                          <i className={`${item.type === 'folder' ? 'fas fa-folder' : getFileIcon(item.type)} fa-3x mb-2`}></i>
                          <h6 className="fw-bold text-truncate">{item.name}</h6>
                          {item.size && item.type === 'file' && <p className="text-muted small">{formatFileSize(item.size)}</p>}
                        </div>
                        <div className="d-flex justify-content-between">
                          <button className="btn btn-sm btn-info-custom" onClick={() => handleShareFile(item)}>
                            <i className="fas fa-share me-1"></i> Share
                          </button>
                          <button className="btn btn-sm btn-danger-custom" onClick={() => handleDeleteConfirm(item)}>
                            <i className="fas fa-trash-alt me-1"></i> Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div key={key} className="list-group-item d-flex justify-content-between align-items-center clickable"
                      style={{ background: 'var(--card)', borderBottom: '1px solid var(--border)' }}
                      onDoubleClick={() => {
                        if (item.type === 'folder') handleFolderDoubleClick(item);
                        else if (item.type === 'file' && item.url) window.open(item.url, '_blank');
                      }}
                    >
                      <div className="d-flex align-items-center">
                        <i className={`${item.type === 'folder' ? 'fas fa-folder' : getFileIcon(item.type)} fa-lg me-3`}></i>
                        <div>
                          <h6 className="mb-0">{item.name}</h6>
                        </div>
                      </div>
                      <div className="text-end">
                        {item.size && item.type === 'file' && <p className="mb-1 text-muted small">{formatFileSize(item.size)}</p>}
                        <div className="btn-group">
                          <button className="btn btn-sm btn-outline-primary" onClick={() => handleShareFile(item)}>
                            <i className="fas fa-share me-1"></i> Share
                          </button>
                          <button className="btn btn-sm btn-outline-danger" onClick={() => handleDeleteConfirm(item)}>
                            <i className="fas fa-trash-alt me-1"></i> Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      <ShareableLinkModal show={showShareModal} onClose={() => setShowShareModal(false)} file={selectedFile} />
    </div>
  );
}

export default ManageFilesPage;
