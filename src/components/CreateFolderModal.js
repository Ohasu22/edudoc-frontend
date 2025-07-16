import React, { useEffect, useState } from 'react';
import { useData } from '../contexts/DataContext';

function CreateFolderModal({ show, onClose, currentPath, currentFolderId }) {
  const [folderName, setFolderName] = useState('');
  const { addFolder } = useData();

  // Reset input fields when modal is closed
  const resetModal = () => {
    setFolderName('');
  };

  useEffect(() => {
    if (!show) resetModal();
  }, [show]);

  // Create folder handler
  const createFolder = () => {
    if (!folderName.trim()) {
      alert('Please enter a folder name');
      return;
    }

    const newPath = currentPath ? `${currentPath}/${folderName}` : folderName;

    addFolder({
      name: folderName,
      parentId: currentFolderId,
      path: newPath
    });

    alert('Folder created successfully!');
    onClose();
  };

  if (!show) return null;

  const folderPathPreview = currentPath
    ? `${currentPath}/${folderName || '...'}`
    : folderName || 'Root';

  return (
    <div className="modal d-block" tabIndex="-1" role="dialog">
      <div className="modal-dialog" role="document">
        <div className="modal-content rounded shadow">
          <div className="modal-header modal-header-custom">
            <h5 className="modal-title">
              <i className="fas fa-folder-plus me-2"></i>
              Create New Folder
            </h5>
            <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
          </div>

          <div className="modal-body p-4">
            <div className="mb-3 text-start">
              <label htmlFor="folderName" className="form-label fw-bold">Folder Name</label>
              <input
                id="folderName"
                type="text"
                className="form-control"
                value={folderName}
                onChange={(e) => setFolderName(e.target.value)}
                placeholder="Enter folder name..."
                autoFocus
              />
            </div>

            <div className="mb-3">
              <small className="text-primary">
                <i className="fas fa-info-circle me-1"></i>
                Folder will be created in: <strong>{folderPathPreview}</strong>
              </small>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="button" className="btn btn-primary-custom" onClick={createFolder}>
              <i className="fas fa-folder-plus me-1"></i>
              Create Folder
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CreateFolderModal;
