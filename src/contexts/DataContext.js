import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import API_BASE_URL from '../api';
import { useAuth } from './AuthContext'; // ✅ make sure this path is correct

const DataContext = createContext();

export function DataProvider({ children }) {
  const { user } = useAuth();
  const [folders, setFolders] = useState([]);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) return;

      const headers = { Authorization: `Bearer ${token}` };
      const [foldersRes, filesRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/folders`, { headers }),
        axios.get(`${API_BASE_URL}/files`, { headers }),
      ]);

      setFolders(foldersRes.data);
      setFiles(filesRes.data);
    } catch (error) {
      console.error('❌ FETCH ERROR:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchData();
    } else {
      setFolders([]);
      setFiles([]);
    }
  }, [user]);

  const getFoldersByParent = (parentId) => folders.filter(folder => folder.parentId === parentId);

  const getFilesByFolder = (folderId) => {
    return files.filter(file => {
      if (!file.folderId && folderId === null) return true;
      return file.folderId === folderId;
    });
  };

  const buildFolderTree = () => {
    const idMap = {};
    const tree = [];

    folders.forEach(folder => {
      idMap[folder._id] = { ...folder, id: folder._id, children: [], level: 0 };
    });

    folders.forEach(folder => {
      const current = idMap[folder._id];
      if (folder.parentId) {
        const parent = idMap[folder.parentId];
        if (parent) {
          current.level = parent.level + 1;
          parent.children.push(current);
        }
      } else {
        tree.push(current);
      }
    });

    return tree;
  };

  const getStats = () => {
    return {
      totalFiles: files.length,
      totalFolders: folders.length,
      totalSharedLinks: 0,
      recentActivity: getRecentFiles(5).length,
    };
  };

  const getRecentFiles = (count = 5) => {
    return [...files]
      .sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt))
      .slice(0, count);
  };

  const searchFiles = (query) => {
    return files.filter(file => file.name.toLowerCase().includes(query.toLowerCase()));
  };

  const searchFolders = (query) => {
    return folders.filter(folder => folder.name.toLowerCase().includes(query.toLowerCase()));
  };

  const deleteFile = async (fileId) => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      await axios.delete(`${API_BASE_URL}/files/${fileId}`, { headers });
      setFiles(prev => prev.filter(file => file._id !== fileId));
    } catch (error) {
      console.error('❌ DELETE FILE ERROR:', error);
    }
  };

  const deleteFolder = async (folderId) => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      await axios.delete(`${API_BASE_URL}/folders/${folderId}`, { headers });
      setFolders(prev => prev.filter(folder => folder._id !== folderId));
    } catch (error) {
      console.error('❌ DELETE FOLDER ERROR:', error);
    }
  };

  const addFolder = async ({ name, parentId = null }) => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      const response = await axios.post(`${API_BASE_URL}/folders`, { name, parentId }, { headers });
      console.log('✅ Folder created:', response.data);
      await fetchData();
    } catch (error) {
      console.error('❌ ADD FOLDER ERROR:', error?.response?.data || error.message);
    }
  };

  const addFile = async ({ file, folderId }) => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      const formData = new FormData();
      formData.append('file', file);
      if (folderId) formData.append('folderId', folderId);

      const response = await axios.post(`${API_BASE_URL}/files/upload`, formData, { headers });
      console.log('✅ File uploaded:', response.data);
      await fetchData();
    } catch (error) {
      console.error('❌ ADD FILE ERROR:', error?.response?.data || error.message);
    }
  };

  const getFolderById = (id) => folders.find(folder => folder._id === id);

  return (
    <DataContext.Provider
      value={{
        folders,
        files,
        loading,
        fetchData,
        getStats,
        getRecentFiles,
        getFoldersByParent,
        getFilesByFolder,
        searchFiles,
        searchFolders,
        deleteFile,
        deleteFolder,
        buildFolderTree,
        getFolderById,
        addFolder,
        addFile,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  return useContext(DataContext);
}
