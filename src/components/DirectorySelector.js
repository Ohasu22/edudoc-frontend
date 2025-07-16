import React from 'react';
import { useData } from '../contexts/DataContext';

function DirectorySelector({ onSelect, currentFolderId }) {
  const { buildFolderTree } = useData();
  const folderTree = buildFolderTree();

  const renderFolder = (folder) => (
    <option key={folder.id} value={folder.id}>
      {'  '.repeat(folder.level)}📁 {folder.name}
    </option>
  );

  const renderFolderTree = (folders) => {
    return folders.map(folder => [
      renderFolder(folder),
      ...renderFolderTree(folder.children)
    ]).flat();
  };

  return (
    <div className="directory-selector">
      <label className="form-label fw-bold">
        <i className="fas fa-folder me-2"></i>
        Select Upload Directory
      </label>
      <select 
        className="form-control-custom" 
        value={currentFolderId || ''} 
        onChange={(e) => onSelect(e.target.value || null)}
      >
        <option value="">📁 Root Directory</option>
        {renderFolderTree(folderTree)}
      </select>
      <small className="text-muted">Choose where to upload your files</small>
    </div>
  );
}

export default DirectorySelector;
