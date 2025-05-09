import React, { useState } from 'react';
import { useBookmarks } from '../../context/BookmarkContext';
import { throttle } from '../../utils/helpers';
import './Header.css';

const Header = () => {
  const { state, setSearchQuery, openModal } = useBookmarks();
  const [localSearch, setLocalSearch] = useState('');
  
  // Throttle search updates to avoid excessive re-renders
  const handleSearchChange = throttle((value) => {
    setSearchQuery(value);
  }, 300);
  
  const onSearchInputChange = (e) => {
    const value = e.target.value;
    setLocalSearch(value);
    handleSearchChange(value);
  };
  
  return (
    <header className="header">
      <div className="header-content">
        <div className="header-left">
          <h1 className="app-title">BookmarkHome</h1>
        </div>
        
        <div className="header-center">
          <div className="search-container">
            <input
              type="text"
              className="search-input"
              placeholder="Search bookmarks..."
              value={localSearch}
              onChange={onSearchInputChange}
            />
            {localSearch && (
              <button 
                className="search-clear" 
                onClick={() => {
                  setLocalSearch('');
                  setSearchQuery('');
                }}
              >
                ×
              </button>
            )}
          </div>
        </div>
        
        <div className="header-right">
          <button 
            className="btn btn-primary add-bookmark-btn"
            onClick={() => openModal('addBookmark')}
          >
            Add Bookmark
          </button>
          <button 
            className="btn add-folder-btn"
            onClick={() => openModal('addFolder')}
          >
            Add Folder
          </button>
          <button 
            className="btn settings-btn"
            onClick={() => openModal('settings')}
          >
            Settings
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
