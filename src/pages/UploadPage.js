import React, { useState } from 'react';
import { useData } from '../contexts/DataContext';
import DirectorySelector from '../components/DirectorySelector';
import CreateFolderModal from '../components/CreateFolderModal';
import { formatFileSize } from '../utils/formatters';

function UploadPage() {
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [showCreateFolder, setShowCreateFolder] = useState(false);
  const [selectedFolderId, setSelectedFolderId] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const { addFile, getFolderById } = useData();

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleFiles = (files) => {
    const newUploads = files.map(file => ({
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      file,
      progress: 0,
      status: 'pending'
    }));
    setUploadedFiles(prev => [...prev, ...newUploads]);
    setShowConfirmation(true);
  };

  const simulateUpload = (uploadId) => {
    setUploadedFiles(prev =>
      prev.map(upload =>
        upload.id === uploadId ? { ...upload, status: 'uploading' } : upload
      )
    );

    const interval = setInterval(() => {
      setUploadedFiles(prev =>
        prev.map(upload => {
          if (upload.id === uploadId) {
            const newProgress = Math.min(upload.progress + Math.random() * 20, 100);
            const isCompleted = newProgress >= 100;

            if (isCompleted) {
              clearInterval(interval);
              addFile({
              file: upload.file,
              folderId: selectedFolderId
              });

            }

            return {
              ...upload,
              progress: newProgress,
              status: isCompleted ? 'completed' : 'uploading'
            };
          }
          return upload;
        })
      );
    }, 500);
  };

  const handleFileSelect = (e) => {
    if (e.target.files) {
      handleFiles(Array.from(e.target.files));
    }
  };

  const confirmUpload = () => {
    uploadedFiles.forEach(upload => {
      if (upload.status === 'pending') {
        simulateUpload(upload.id);
      }
    });
    setShowConfirmation(false);
  };

  const cancelUpload = () => {
    setUploadedFiles([]);
    setShowConfirmation(false);
  };

  const selectedFolder = selectedFolderId ? getFolderById(selectedFolderId) : null;

  return (
    <div className="main-content p-4">
      <div className="container-fluid" style={{ maxWidth: '900px' }}>
        <div className="text-center mb-5">
          <h1 className="display-6 fw-bold mb-2">Upload Files</h1>
          <p className="text-muted">Drag and drop files or create folders to organize your content</p>
        </div>

        <DirectorySelector 
          onSelect={setSelectedFolderId} 
          currentFolderId={selectedFolderId} 
        />

        <div className="row g-4 mb-4">
          <div className="col-md-8">
            <div
              className={`upload-area ${dragActive ? 'drag-active' : ''}`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <i className="fas fa-cloud-upload-alt fa-4x text-primary mb-3"></i>
              <h4 className="mb-3">Drop files here to upload</h4>
              <p className="text-muted mb-4">or click the button below to browse</p>

              <input
                type="file"
                multiple
                className="d-none"
                id="fileInput"
                onChange={handleFileSelect}
              />
              <label htmlFor="fileInput" className="btn btn-primary-custom btn-lg">
                <i className="fas fa-plus me-2"></i>
                Select Files
              </label>

              {selectedFolder && (
                <div className="mt-3">
                  <small className="text-primary">
                    <i className="fas fa-folder me-1"></i>
                    Uploading to: {selectedFolder.name}
                  </small>
                </div>
              )}
            </div>
          </div>

          <div className="col-md-4">
            <div
              className="create-folder-area h-100 d-flex flex-column justify-content-center"
              onClick={() => setShowCreateFolder(true)}
            >
              <i className="fas fa-folder-plus fa-3x text-warning mb-3"></i>
              <h5 className="mb-2">Create Folder</h5>
              <p className="text-muted mb-3" style={{ fontSize: '0.9rem' }}>
                Organize your files with custom folders
              </p>
              <button className="btn btn-warning-custom">
                <i className="fas fa-folder-plus me-2"></i>
                New Folder
              </button>
            </div>
          </div>
        </div>

        {uploadedFiles.length > 0 && (
          <div className="card-custom">
            <div className="card-header" style={{ 
              background: 'var(--muted)', 
              border: 'none', 
              borderBottom: '1px solid var(--border)',
              borderRadius: '12px 12px 0 0',
              padding: '1.5rem'
            }}>
              <h5 className="card-title mb-0">
                <i className="fas fa-file-alt me-2"></i>
                File Upload Queue
              </h5>
            </div>
            <div className="card-body">
              {showConfirmation && (
                <div className="upload-confirmation mb-4">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <h6 className="mb-1">Ready to upload {uploadedFiles.filter(f => f.status === 'pending').length} files</h6>
                      <small className="text-muted">
                        Destination: {selectedFolder ? selectedFolder.name : 'Root Directory'}
                      </small>
                    </div>
                    <div className="btn-group">
                      <button
                        className="btn btn-success-custom"
                        onClick={confirmUpload}
                      >
                        <i className="fas fa-upload me-1"></i>
                        Confirm Upload
                      </button>
                      <button
                        className="btn btn-danger-custom"
                        onClick={cancelUpload}
                      >
                        <i className="fas fa-times me-1"></i>
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {uploadedFiles.map((upload, index) => (
                <div key={upload.id} className={`mb-4 pb-4 ${index < uploadedFiles.length - 1 ? 'border-bottom' : ''}`} style={{ borderColor: 'var(--border)' }}>
                  <div className="d-flex align-items-center justify-content-between mb-2">
                    <div className="d-flex align-items-center">
                      {upload.status === 'completed' ? (
                        <i className="fas fa-check-circle text-success fa-lg me-3"></i>
                      ) : upload.status === 'uploading' ? (
                        <i className="fas fa-spinner fa-spin text-primary fa-lg me-3"></i>
                      ) : (
                        <i className="fas fa-file text-muted fa-lg me-3"></i>
                      )}
                      <div>
                        <h6 className="mb-1">{upload.file.name}</h6>
                        <small className="text-muted">
                          {formatFileSize(upload.file.size)}
                        </small>
                      </div>
                    </div>
                    <div className="text-end">
                      <span className={`badge-custom ${
                        upload.status === 'completed' ? 'badge-success' :
                        upload.status === 'uploading' ? 'badge-primary' :
                        'badge-warning'
                      }`}>
                        {upload.status === 'completed' ? 'Completed' :
                         upload.status === 'uploading' ? `${Math.round(upload.progress)}%` :
                         'Pending'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <CreateFolderModal
        show={showCreateFolder}
        onClose={() => setShowCreateFolder(false)}
        currentPath={selectedFolder ? selectedFolder.path : ""}
        currentFolderId={selectedFolderId}
      />
    </div>
  );
}

export default UploadPage;
