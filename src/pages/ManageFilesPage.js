import React, { useState } from 'react';
import { useData } from '../contexts/DataContext';
import SearchAndFilter from '../components/SearchAndFilter';
import BreadcrumbNav from '../components/BreadcrumbNav';
import ShareableLinkModal from '../components/ShareableLinkModal';
import { getFileIcon, formatFileSize } from '../utils/formatters';

const API_BASE = process.env.REACT_APP_API_URL;

function ManageFilesPage() {
  const [currentPath, setCurrentPath] = useState('');
  const [currentFolderId, setCurrentFolderId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilters, setActiveFilters] = useState([]);
  const [viewMode, setViewMode] = useState('list');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [targetFolderId, setTargetFolderId] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [showShareModal, setShowShareModal] = useState(false);

  const {
    folders,
    getFoldersByParent,
    getFilesByFolder,
    searchFiles,
    searchFolders,
    deleteFile,
    deleteFolder,
    fetchData,
  } = useData();

  const filters = [
    { key: 'folders', label: 'Folders', icon: 'fas fa-folder' },
    { key: 'documents', label: 'Documents', icon: 'fas fa-file-alt' },
    { key: 'images', label: 'Images', icon: 'fas fa-image' },
    { key: 'recent', label: 'Recent', icon: 'fas fa-clock' },
  ];

  const currentFolders = searchTerm ? searchFolders(searchTerm) : getFoldersByParent(currentFolderId);
  const currentFiles = searchTerm ? searchFiles(searchTerm) : getFilesByFolder(currentFolderId);

  const items = [
    ...currentFolders.map(f => ({ ...f, type: 'folder' })),
    ...currentFiles.map(f => ({ ...f, type: 'file' }))
  ].filter(item => {
    if (!activeFilters.length) return true;
    if (activeFilters.includes('folders') && item.type === 'folder') return true;
    if (activeFilters.includes('documents') && item.type === 'file' && /\.(pdf|docx?|txt)$/i.test(item.name)) return true;
    if (activeFilters.includes('images') && item.type === 'file' && /\.(png|jpe?g|gif)$/i.test(item.name)) return true;
    return false;
  });

  const handleFolderDoubleClick = (folder) => {
    setCurrentPath(prev => (prev ? `${prev}/${folder.name}` : folder.name));
    setCurrentFolderId(folder._id);
  };

  const handleNavigate = (path) => {
    setCurrentPath(path);
    if (!path) return setCurrentFolderId(null);
    const folder = folders.find(f => f.name === path.split('/').pop());
    setCurrentFolderId(folder?._id || null);
  };

  const toggleCheckbox = (fileId) => {
    setSelectedFiles(prev => prev.includes(fileId)
      ? prev.filter(id => id !== fileId)
      : [...prev, fileId]);
  };

  const handleMove = async () => {
    if (!selectedFiles.length || !targetFolderId) return alert('Select files and a target folder.');
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/files/move`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ fileIds: selectedFiles, targetFolderId }),
      });
      const result = await response.json();
      if (response.ok) {
        alert('Files moved successfully.');
        setSelectedFiles([]);
        fetchData();
      } else {
        alert(result.message || 'Failed to move files.');
      }
    } catch (err) {
      console.error('Move error:', err);
      alert('Error moving files.');
    }
  };

  const handleDelete = (item) => {
    if (!window.confirm(`Are you sure you want to delete ${item.name}?`)) return;
    item.type === 'file' ? deleteFile(item._id) : deleteFolder(item._id);
  };

  const renderList = () => (
    <div className="list-group list-group-flush">
      {items.map(item => {
        const checked = selectedFiles.includes(item._id);
        return (
          <div key={item._id} className="list-group-item d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center flex-grow-1">
              {item.type === 'file' && (
                <input
                  type="checkbox"
                  className="form-check-input me-2"
                  checked={checked}
                  onChange={() => toggleCheckbox(item._id)}
                  onClick={e => e.stopPropagation()}
                />
              )}
              <i className={`${item.type === 'folder' ? 'fas fa-folder' : getFileIcon(item.type)} fa-lg me-3`} />
              <div
                className="text-truncate"
                onDoubleClick={() =>
                  item.type === 'folder'
                    ? handleFolderDoubleClick(item)
                    : window.open(item.url, '_blank')
                }
                style={{ cursor: 'pointer' }}
              >
                <h6 className="mb-0">{item.name}</h6>
              </div>
            </div>
            <div className="text-end">
              {item.size && <p className="mb-1 text-muted small">{formatFileSize(item.size)}</p>}
              <div className="btn-group">
                <button className="btn btn-sm btn-outline-primary" onClick={() => { setSelectedFile(item); setShowShareModal(true); }}>
                  <i className="fas fa-share me-1"></i> Share
                </button>
                <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(item)}>
                  <i className="fas fa-trash-alt me-1"></i> Delete
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );

  const renderGrid = () => (
    <div className="row row-cols-1 row-cols-md-3 g-4">
      {items.map(item => {
        const checked = selectedFiles.includes(item._id);
        return (
          <div key={item._id} className="col">
            <div className="card-custom p-3 h-100">
              {item.type === 'file' && (
                <input
                  type="checkbox"
                  className="form-check-input"
                  checked={checked}
                  onChange={() => toggleCheckbox(item._id)}
                />
              )}
              <div
                className="text-center mb-3"
                onDoubleClick={() =>
                  item.type === 'folder'
                    ? handleFolderDoubleClick(item)
                    : window.open(item.url, '_blank')
                }
              >
                <i className={`${item.type === 'folder' ? 'fas fa-folder' : getFileIcon(item.type)} fa-3x mb-2`} />
                <h6 className="fw-bold text-truncate">{item.name}</h6>
                {item.size && <p className="text-muted small">{formatFileSize(item.size)}</p>}
              </div>
              <div className="d-flex justify-content-between">
                <button className="btn btn-sm btn-info-custom" onClick={() => { setSelectedFile(item); setShowShareModal(true); }}>
                  <i className="fas fa-share me-1"></i> Share
                </button>
                <button className="btn btn-sm btn-danger-custom" onClick={() => handleDelete(item)}>
                  <i className="fas fa-trash-alt me-1"></i> Delete
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="main-content p-4">
      <div className="container-fluid">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h1 className="display-6 fw-bold">Manage Files</h1>
            <p className="text-muted">Organize and manage your documents</p>
          </div>
        </div>

        <SearchAndFilter
          onSearch={setSearchTerm}
          onFilter={(key) =>
            setActiveFilters(prev =>
              prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
            )
          }
          filters={filters}
          activeFilters={activeFilters}
          searchTerm={searchTerm}
        />

        <BreadcrumbNav path={currentPath} onNavigate={handleNavigate} />

        <div className="mb-3">
          <select value={targetFolderId} onChange={(e) => setTargetFolderId(e.target.value)} className="form-select">
            <option value="">Select target folder</option>
            {folders.map(folder => (
              <option key={folder._id} value={folder._id}>{folder.name}</option>
            ))}
          </select>
          <button onClick={handleMove} className="btn btn-success mt-2">Move Selected Files</button>
        </div>

        <div className="card-custom">
          <div className="card-header d-flex justify-content-between align-items-center">
            <h5 className="card-title mb-0">
              <i className="fas fa-folder-open me-2"></i>
              {currentPath || 'Root'} ({items.length} items)
            </h5>
            <div className="btn-group">
              <button className={`btn btn-sm ${viewMode === 'list' ? 'btn-primary' : 'btn-outline-primary'}`} onClick={() => setViewMode('list')}>
                <i className="fas fa-list"></i>
              </button>
              <button className={`btn btn-sm ${viewMode === 'grid' ? 'btn-primary' : 'btn-outline-primary'}`} onClick={() => setViewMode('grid')}>
                <i className="fas fa-th"></i>
              </button>
            </div>
          </div>

          <div className="card-body">
            {items.length === 0 ? (
              <div className="text-center py-5 text-muted">
                <i className="fas fa-folder-open fa-3x mb-3"></i>
                <p>No items to display</p>
              </div>
            ) : (
              viewMode === 'grid' ? renderGrid() : renderList()
            )}
          </div>
        </div>
      </div>

      <ShareableLinkModal show={showShareModal} onClose={() => setShowShareModal(false)} file={selectedFile} />
    </div>
  );
}

export default ManageFilesPage;
