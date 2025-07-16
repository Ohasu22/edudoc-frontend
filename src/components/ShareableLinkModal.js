import React, { useEffect, useState } from 'react';

function ShareableLinkModal({ show, onClose, file }) {
  const [link, setLink] = useState('');

  useEffect(() => {
    if (file) {
      // Simulate a shareable link based on file ID or name
      setLink(`${window.location.origin}/share/${file.id || file.name.replace(/\s+/g, '-')}`);
    }
  }, [file]);

  const handleCopy = () => {
    navigator.clipboard.writeText(link).then(() => {
      alert('Link copied to clipboard!');
    });
  };

  if (!show || !file) return null;

  return (
    <div className="modal-custom">
      <div className="modal-content-custom">
        <div className="modal-header-custom">
          <h5 className="modal-title">
            <i className="fas fa-share-alt me-2"></i>
            Share File
          </h5>
          <button className="btn-close-custom" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>

        <div className="modal-body-custom">
          <p className="text-muted mb-2">
            Shareable link for: <strong>{file.name}</strong>
          </p>
          <div className="input-group">
            <input
              type="text"
              readOnly
              className="form-control-custom"
              value={link}
            />
            <button className="btn btn-primary-custom" onClick={handleCopy}>
              <i className="fas fa-copy me-1"></i>
              Copy Link
            </button>
          </div>
        </div>

        <div className="modal-footer-custom">
          <button className="btn btn-outline-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default ShareableLinkModal;
