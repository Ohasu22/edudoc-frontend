import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import API_BASE_URL from '../api';
import { useAuth } from './AuthContext';

const DataContext = createContext();

export function DataProvider({ children }) {
  const { user } = useAuth();
  const [folders, setFolders] = useState([]);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    setToken(storedToken);

    if (user && storedToken) {
      fetchData(storedToken);
    } else {
      setFolders([]);
      setFiles([]);
    }
  }, [user]);

  const fetchData = async (authToken = token) => {
    try {
      setLoading(true);
      if (!authToken) return;

      const headers = { Authorization: `Bearer ${authToken}` };
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

  const getFoldersByParent = (parentId) =>
    folders.filter((folder) => folder.parentId === parentId);

  const getFilesByFolder = (folderId) => {
    return files.filter((file) => {
      if (!file.folderId && folderId === null) return true;
      return file.folderId === folderId;
    });
  };

  const buildFolderTree = () => {
    const idMap = {};
    const tree = [];

    folders.forEach((folder) => {
      idMap[folder._id] = { ...folder, id: folder._id, children: [], level: 0 };
    });

    folders.forEach((folder) => {
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

  const getStats = () => ({
    totalFiles: files.length,
    totalFolders: folders.length,
    totalSharedLinks: 0, // Placeholder if you add sharing later
    recentActivity: getRecentFiles(5).length,
  });

  const getRecentFiles = (count = 5) => {
    return [...files]
      .sort((a, b) =>
        new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt)
      )
      .slice(0, count);
  };

  const searchFiles = (query) =>
    files.filter((file) => file.name.toLowerCase().includes(query.toLowerCase()));

  const searchFolders = (query) =>
    folders.filter((folder) => folder.name.toLowerCase().includes(query.toLowerCase()));

  const deleteFile = async (fileId) => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      await axios.delete(`${API_BASE_URL}/files/${fileId}`, { headers });
      setFiles((prev) => prev.filter((file) => file._id !== fileId));
    } catch (error) {
      console.error('❌ DELETE FILE ERROR:', error);
    }
  };

  const deleteFolder = async (folderId) => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      await axios.delete(`${API_BASE_URL}/folders/${folderId}`, { headers });
      setFolders((prev) => prev.filter((folder) => folder._id !== folderId));
    } catch (error) {
      console.error('❌ DELETE FOLDER ERROR:', error);
    }
  };

  const addFolder = async ({ name, parentId = null }) => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      await axios.post(
        `${API_BASE_URL}/folders`,
        { name, parentId },
        { headers }
      );
      await fetchData();
    } catch (error) {
      console.error('❌ ADD FOLDER ERROR:', error?.response?.data || error.message);
    }
  };

  const addFile = async ({ file, folderId }) => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const formData = new FormData();
      formData.append('file', file);
      if (folderId) formData.append('folderId', folderId);

      await axios.post(`${API_BASE_URL}/files/upload`, formData, { headers });
      await fetchData();
    } catch (error) {
      console.error('❌ ADD FILE ERROR:', error?.response?.data || error.message);
    }
  };

  const getFolderById = (id) => folders.find((folder) => folder._id === id);

  return (
    <DataContext.Provider
      value={{
        folders,
        files,
        loading,
        token, // ✅ Make token available to components
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
