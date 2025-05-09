import React, { createContext, useReducer, useEffect, useContext } from 'react';
import * as api from '../utils/api';
import { getFaviconUrl } from '../utils/helpers';

// Create context
export const BookmarkContext = createContext();

// Initial state
const initialState = {
  bookmarks: [],
  folders: [],
  currentFolder: 'default',
  searchQuery: '',
  isLoading: true,
  error: null,
  modalState: {
    isOpen: false,
    type: null, // 'addBookmark', 'editBookmark', 'addFolder', 'editFolder', 'settings', etc.
    data: null,
  },
};

// Action types
const ActionTypes = {
  FETCH_BOOKMARKS_START: 'FETCH_BOOKMARKS_START',
  FETCH_BOOKMARKS_SUCCESS: 'FETCH_BOOKMARKS_SUCCESS',
  FETCH_BOOKMARKS_ERROR: 'FETCH_BOOKMARKS_ERROR',
  ADD_BOOKMARK: 'ADD_BOOKMARK',
  UPDATE_BOOKMARK: 'UPDATE_BOOKMARK',
  DELETE_BOOKMARK: 'DELETE_BOOKMARK',
  ADD_FOLDER: 'ADD_FOLDER',
  UPDATE_FOLDER: 'UPDATE_FOLDER',
  DELETE_FOLDER: 'DELETE_FOLDER',
  SET_CURRENT_FOLDER: 'SET_CURRENT_FOLDER',
  SET_SEARCH_QUERY: 'SET_SEARCH_QUERY',
  OPEN_MODAL: 'OPEN_MODAL',
  CLOSE_MODAL: 'CLOSE_MODAL',
};

// Reducer function
const bookmarkReducer = (state, action) => {
  switch (action.type) {
    case ActionTypes.FETCH_BOOKMARKS_START:
      return {
        ...state,
        isLoading: true,
        error: null,
      };
    
    case ActionTypes.FETCH_BOOKMARKS_SUCCESS:
      return {
        ...state,
        bookmarks: action.payload.bookmarks,
        folders: action.payload.folders,
        isLoading: false,
        error: null,
      };
    
    case ActionTypes.FETCH_BOOKMARKS_ERROR:
      return {
        ...state,
        isLoading: false,
        error: action.payload,
      };
    
    case ActionTypes.ADD_BOOKMARK:
      return {
        ...state,
        bookmarks: [...state.bookmarks, action.payload],
      };
    
    case ActionTypes.UPDATE_BOOKMARK:
      return {
        ...state,
        bookmarks: state.bookmarks.map(bookmark => 
          bookmark.id === action.payload.id ? action.payload : bookmark
        ),
      };
    
    case ActionTypes.DELETE_BOOKMARK:
      return {
        ...state,
        bookmarks: state.bookmarks.filter(bookmark => bookmark.id !== action.payload),
      };
    
    case ActionTypes.ADD_FOLDER:
      return {
        ...state,
        folders: [...state.folders, action.payload],
      };
    
    case ActionTypes.UPDATE_FOLDER:
      return {
        ...state,
        folders: state.folders.map(folder => 
          folder.id === action.payload.id ? action.payload : folder
        ),
      };
    
    case ActionTypes.DELETE_FOLDER:
      // When deleting a folder, update current folder to default if needed
      return {
        ...state,
        folders: state.folders.filter(folder => folder.id !== action.payload),
        currentFolder: state.currentFolder === action.payload ? 'default' : state.currentFolder,
      };
    
    case ActionTypes.SET_CURRENT_FOLDER:
      return {
        ...state,
        currentFolder: action.payload,
      };
    
    case ActionTypes.SET_SEARCH_QUERY:
      return {
        ...state,
        searchQuery: action.payload,
      };
    
    case ActionTypes.OPEN_MODAL:
      return {
        ...state,
        modalState: {
          isOpen: true,
          type: action.payload.type,
          data: action.payload.data || null,
        },
      };
    
    case ActionTypes.CLOSE_MODAL:
      return {
        ...state,
        modalState: {
          isOpen: false,
          type: null,
          data: null,
        },
      };
    
    default:
      return state;
  }
};

// Provider component
export const BookmarkProvider = ({ children }) => {
  const [state, dispatch] = useReducer(bookmarkReducer, initialState);
  
  // Fetch bookmarks on mount
  useEffect(() => {
    const fetchData = async () => {
      dispatch({ type: ActionTypes.FETCH_BOOKMARKS_START });
      
      try {
        const data = await api.fetchBookmarks();
        dispatch({ 
          type: ActionTypes.FETCH_BOOKMARKS_SUCCESS, 
          payload: data 
        });
      } catch (error) {
        dispatch({ 
          type: ActionTypes.FETCH_BOOKMARKS_ERROR, 
          payload: error.message 
        });
      }
    };
    
    fetchData();
  }, []);
  
  // Helper functions for BookmarkContext actions
  const addBookmark = async (bookmarkData) => {
    try {
      // Get favicon if not provided
      if (!bookmarkData.icon) {
        bookmarkData.icon = getFaviconUrl(bookmarkData.url);
      }
      
      const bookmark = await api.createBookmark(bookmarkData);
      dispatch({ type: ActionTypes.ADD_BOOKMARK, payload: bookmark });
      return bookmark;
    } catch (error) {
      console.error('Error adding bookmark:', error);
      throw error;
    }
  };
  
  const updateBookmark = async (id, bookmarkData) => {
    try {
      const updatedBookmark = await api.updateBookmark(id, bookmarkData);
      dispatch({ type: ActionTypes.UPDATE_BOOKMARK, payload: updatedBookmark });
      return updatedBookmark;
    } catch (error) {
      console.error('Error updating bookmark:', error);
      throw error;
    }
  };
  
  const deleteBookmark = async (id) => {
    try {
      await api.deleteBookmark(id);
      dispatch({ type: ActionTypes.DELETE_BOOKMARK, payload: id });
    } catch (error) {
      console.error('Error deleting bookmark:', error);
      throw error;
    }
  };
  
  const addFolder = async (folderData) => {
    try {
      const folder = await api.createFolder(folderData);
      dispatch({ type: ActionTypes.ADD_FOLDER, payload: folder });
      return folder;
    } catch (error) {
      console.error('Error adding folder:', error);
      throw error;
    }
  };
  
  const updateFolder = async (id, folderData) => {
    try {
      const updatedFolder = await api.updateFolder(id, folderData);
      dispatch({ type: ActionTypes.UPDATE_FOLDER, payload: updatedFolder });
      return updatedFolder;
    } catch (error) {
      console.error('Error updating folder:', error);
      throw error;
    }
  };
  
  const deleteFolder = async (id) => {
    try {
      await api.deleteFolder(id);
      dispatch({ type: ActionTypes.DELETE_FOLDER, payload: id });
    } catch (error) {
      console.error('Error deleting folder:', error);
      throw error;
    }
  };
  
  const setCurrentFolder = (folderId) => {
    dispatch({ type: ActionTypes.SET_CURRENT_FOLDER, payload: folderId });
  };
  
  const setSearchQuery = (query) => {
    dispatch({ type: ActionTypes.SET_SEARCH_QUERY, payload: query });
  };
  
  const openModal = (modalType, data = null) => {
    dispatch({ 
      type: ActionTypes.OPEN_MODAL, 
      payload: { type: modalType, data } 
    });
  };
  
  const closeModal = () => {
    dispatch({ type: ActionTypes.CLOSE_MODAL });
  };
  
  const exportData = async () => {
    try {
      return await api.exportBookmarks();
    } catch (error) {
      console.error('Error exporting bookmarks:', error);
      throw error;
    }
  };
  
  const importData = async (data, strategy) => {
    try {
      await api.importBookmarks(data, strategy);
      // Refresh bookmarks after import
      const refreshedData = await api.fetchBookmarks();
      dispatch({ 
        type: ActionTypes.FETCH_BOOKMARKS_SUCCESS, 
        payload: refreshedData 
      });
    } catch (error) {
      console.error('Error importing bookmarks:', error);
      throw error;
    }
  };
  
  // Values to expose in context
  const contextValue = {
    state,
    addBookmark,
    updateBookmark,
    deleteBookmark,
    addFolder,
    updateFolder,
    deleteFolder,
    setCurrentFolder,
    setSearchQuery,
    openModal,
    closeModal,
    exportData,
    importData,
  };
  
  return (
    <BookmarkContext.Provider value={contextValue}>
      {children}
    </BookmarkContext.Provider>
  );
};

// Custom hook for using bookmark context
export const useBookmarks = () => {
  const context = useContext(BookmarkContext);
  
  if (!context) {
    throw new Error('useBookmarks must be used within a BookmarkProvider');
  }
  
  return context;
};
