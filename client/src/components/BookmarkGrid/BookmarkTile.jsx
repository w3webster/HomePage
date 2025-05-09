import React from 'react';
import { extractDomain, generateColorFromDomain } from '../../utils/helpers';
import './BookmarkTile.css';

const BookmarkTile = ({ 
  bookmark, 
  onClick, 
  onEdit,
  onDelete,
  draggable = true,
  onDragStart,
  onDragOver,
  onDrop,
  isDragging = false
}) => {
  const domain = extractDomain(bookmark.url);
  const { bgColor, textColor } = generateColorFromDomain(domain);
  
  // Determine if bookmark has a favicon or should use default
  const hasFavicon = Boolean(bookmark.icon);
  
  return (
    <div 
      className={`bookmark-tile ${isDragging ? 'dragging' : ''}`}
      onClick={onClick}
      draggable={draggable}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      style={{
        '--tile-bg-color': hasFavicon ? 'var(--color-bg-secondary)' : bgColor,
        '--tile-text-color': hasFavicon ? 'var(--color-text-primary)' : textColor
      }}
    >
      <div className="bookmark-content">
        {bookmark.icon ? (
          <img 
            src={bookmark.icon} 
            alt={`${bookmark.title} favicon`} 
            className="bookmark-icon"
            onError={(e) => {
              // If favicon fails to load, remove it and fall back to domain-based color
              e.target.style.display = 'none';
              e.target.parentNode.parentNode.style.setProperty('--tile-bg-color', bgColor);
              e.target.parentNode.parentNode.style.setProperty('--tile-text-color', textColor);
            }}
          />
        ) : (
          <div className="bookmark-icon-placeholder">
            {domain.charAt(0).toUpperCase()}
          </div>
        )}
        
        <h3 className="bookmark-title">{bookmark.title}</h3>
        <div className="bookmark-url">{domain}</div>
      </div>
      
      <div className="bookmark-actions">
        <button 
          className="bookmark-action-btn edit-btn"
          onClick={onEdit}
          title="Edit bookmark"
        >
          ✎
        </button>
        <button 
          className="bookmark-action-btn delete-btn"
          onClick={onDelete}
          title="Delete bookmark"
        >
          ✕
        </button>
      </div>
    </div>
  );
};

export default BookmarkTile;
