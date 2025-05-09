import React, { useState, useMemo } from 'react';
import { useBookmarks } from '../../context/BookmarkContext';
import { extractDomain, generateColorFromDomain, fuzzySearch } from '../../utils/helpers';
import BookmarkTile from './BookmarkTile';
import './BookmarkGrid.css';

const BookmarkGrid = () => {
  const { state, openModal, deleteBookmark } = useBookmarks();
  const { bookmarks, folders, currentFolder, searchQuery } = state;
  const [draggedTileId, setDraggedTileId] = useState(null);
  
  // Get the current folder name
  const currentFolderName = useMemo(() => {
    const folder = folders.find(f => f.id === currentFolder);
    return folder ? folder.name : 'All Bookmarks';
  }, [folders, currentFolder]);
  
  // Filter bookmarks by current folder and search query
  const filteredBookmarks = useMemo(() => {
    let filtered = bookmarks;
    
    // Filter by folder if not searching
    if (currentFolder && !searchQuery) {
      filtered = filtered.filter(bookmark => bookmark.folderId === currentFolder);
    }
    
    // Filter by search query if provided
    if (searchQuery) {
      filtered = filtered.filter(bookmark => {
        return (
          fuzzySearch(searchQuery, bookmark.title) || 
          fuzzySearch(searchQuery, bookmark.url) ||
          fuzzySearch(searchQuery, extractDomain(bookmark.url))
        );
      });
    }
    
    // Sort by order property
    return [...filtered].sort((a, b) => a.order - b.order);
  }, [bookmarks, currentFolder, searchQuery]);
  
  // Handle bookmark click to navigate to URL
  const handleBookmarkClick = (bookmark) => {
    window.open(bookmark.url, '_blank', 'noopener,noreferrer');
  };
  
  // Handle edit bookmark
  const handleEditBookmark = (e, bookmark) => {
    e.stopPropagation();
    openModal('editBookmark', bookmark);
  };
  
  // Handle delete bookmark
  const handleDeleteBookmark = async (e, bookmarkId) => {
    e.stopPropagation();
    
    if (window.confirm('Are you sure you want to delete this bookmark?')) {
      try {
        await deleteBookmark(bookmarkId);
      } catch (error) {
        console.error('Error deleting bookmark:', error);
      }
    }
  };
  
  // Drag and drop handlers for reordering
  const handleDragStart = (e, bookmarkId) => {
    setDraggedTileId(bookmarkId);
    e.dataTransfer.effectAllowed = 'move';
    // Make the drag image transparent
    const dragImage = document.createElement('div');
    dragImage.style.width = '1px';
    dragImage.style.height = '1px';
    document.body.appendChild(dragImage);
    e.dataTransfer.setDragImage(dragImage, 0, 0);
    setTimeout(() => {
      document.body.removeChild(dragImage);
    }, 0);
  };
  
  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };
  
  const handleDrop = (e, targetId) => {
    e.preventDefault();
    if (draggedTileId === targetId) return;
    
    // In a real app, we would update the order of bookmarks here
    // and save the new order to the server
    console.log(`Moved bookmark ${draggedTileId} to position of ${targetId}`);
    setDraggedTileId(null);
  };
  
  return (
    <div className="bookmark-grid-container">
      <div className="bookmark-grid-header">
        <h2 className="folder-title">
          {searchQuery 
            ? `Search Results for "${searchQuery}"` 
            : currentFolderName
          }
        </h2>
        
        <div className="bookmark-count">
          {filteredBookmarks.length} bookmark{filteredBookmarks.length !== 1 ? 's' : ''}
        </div>
      </div>
      
      {filteredBookmarks.length === 0 ? (
        <div className="empty-state">
          {searchQuery 
            ? `No bookmarks found matching "${searchQuery}"` 
            : 'No bookmarks in this folder yet.'
          }
          <button 
            className="btn btn-primary add-bookmark-btn"
            onClick={() => openModal('addBookmark', { folderId: currentFolder })}
          >
            Add Bookmark
          </button>
        </div>
      ) : (
        <div className="bookmark-grid">
          {filteredBookmarks.map(bookmark => (
            <BookmarkTile
              key={bookmark.id}
              bookmark={bookmark}
              onClick={() => handleBookmarkClick(bookmark)}
              onEdit={(e) => handleEditBookmark(e, bookmark)}
              onDelete={(e) => handleDeleteBookmark(e, bookmark.id)}
              draggable={!searchQuery}
              onDragStart={(e) => handleDragStart(e, bookmark.id)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, bookmark.id)}
              isDragging={draggedTileId === bookmark.id}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default BookmarkGrid;
