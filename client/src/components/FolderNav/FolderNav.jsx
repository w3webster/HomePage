import React, { useState } from 'react';
import { useBookmarks } from '../../context/BookmarkContext';
import './FolderNav.css';

const FolderNav = () => {
  const { state, setCurrentFolder, openModal, deleteFolder } = useBookmarks();
  const { folders, currentFolder } = state;
  const [menuOpen, setMenuOpen] = useState(null);
  
  // Sort folders by their order property
  const sortedFolders = [...folders].sort((a, b) => a.order - b.order);
  
  const handleFolderClick = (folderId) => {
    setCurrentFolder(folderId);
  };
  
  const handleMenuToggle = (e, folderId) => {
    e.stopPropagation();
    setMenuOpen(menuOpen === folderId ? null : folderId);
  };
  
  const handleMenuClose = () => {
    setMenuOpen(null);
  };
  
  const handleEditFolder = (e, folder) => {
    e.stopPropagation();
    openModal('editFolder', folder);
    handleMenuClose();
  };
  
  const handleDeleteFolder = async (e, folderId) => {
    e.stopPropagation();
    
    if (folderId === 'default') {
      alert('Cannot delete the default folder');
      return;
    }
    
    if (window.confirm('Are you sure you want to delete this folder? All bookmarks will be moved to the Default folder.')) {
      try {
        await deleteFolder(folderId);
      } catch (error) {
        console.error('Error deleting folder:', error);
      }
    }
    
    handleMenuClose();
  };
  
  return (
    <nav className="folder-nav">
      <div className="folder-nav-header">
        <h2>Folders</h2>
        <button 
          className="btn btn-icon add-folder-btn" 
          onClick={() => openModal('addFolder')}
          title="Add folder"
        >
          +
        </button>
      </div>
      
      <ul className="folder-list">
        {sortedFolders.map(folder => (
          <li 
            key={folder.id}
            className={`folder-item ${currentFolder === folder.id ? 'active' : ''}`}
            onClick={() => handleFolderClick(folder.id)}
          >
            <span className="folder-name">{folder.name}</span>
            
            <button 
              className="folder-menu-btn"
              onClick={(e) => handleMenuToggle(e, folder.id)}
            >
              ⋮
            </button>
            
            {menuOpen === folder.id && (
              <div className="folder-menu">
                <button onClick={(e) => handleEditFolder(e, folder)}>
                  Edit
                </button>
                <button 
                  onClick={(e) => handleDeleteFolder(e, folder.id)}
                  disabled={folder.id === 'default'}
                  className={folder.id === 'default' ? 'disabled' : ''}
                >
                  Delete
                </button>
              </div>
            )}
          </li>
        ))}
      </ul>
      
      {/* Invisible overlay to close menu when clicking outside */}
      {menuOpen && (
        <div className="menu-overlay" onClick={handleMenuClose} />
      )}
    </nav>
  );
};

export default FolderNav;
