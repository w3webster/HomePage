import React from 'react';
import './styles/global.css';
import './App.css';

function App() {
  // Static demo data
  const folders = [
    { id: 'default', name: 'Default' },
    { id: 'work', name: 'Work' },
    { id: 'personal', name: 'Personal' }
  ];
  
  const bookmarks = [
    {
      id: '1',
      title: 'Google',
      url: 'https://google.com',
      folderId: 'default',
      icon: 'https://www.google.com/favicon.ico'
    },
    {
      id: '2',
      title: 'GitHub',
      url: 'https://github.com',
      folderId: 'work'
    },
    {
      id: '3',
      title: 'Stack Overflow',
      url: 'https://stackoverflow.com',
      folderId: 'work'
    }
  ];

  return (
    <div className="app">
      <header className="app-header">
        <h1>BookmarkHome</h1>
        <div className="search-container">
          <input 
            type="text" 
            placeholder="Search bookmarks..."
            className="search-input"
          />
        </div>
        <div className="header-actions">
          <button className="btn primary">Add Bookmark</button>
          <button className="btn">Add Folder</button>
        </div>
      </header>
      
      <main className="app-content">
        <aside className="folders-sidebar">
          <h2>Folders</h2>
          <ul className="folder-list">
            {folders.map(folder => (
              <li 
                key={folder.id} 
                className={`folder-item ${folder.id === 'default' ? 'active' : ''}`}
              >
                <span className="folder-name">{folder.name}</span>
              </li>
            ))}
          </ul>
        </aside>
        
        <section className="bookmarks-grid">
          <h2>Default</h2>
          
          <div className="bookmarks-container">
            {bookmarks
              .filter(bookmark => bookmark.folderId === 'default')
              .map(bookmark => (
                <div key={bookmark.id} className="bookmark-tile">
                  <a 
                    href={bookmark.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="bookmark-content"
                  >
                    {bookmark.icon ? (
                      <img 
                        src={bookmark.icon} 
                        alt={`${bookmark.title} icon`} 
                        className="bookmark-icon" 
                      />
                    ) : (
                      <div className="bookmark-icon-placeholder">
                        {bookmark.title.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <h3 className="bookmark-title">{bookmark.title}</h3>
                    <p className="bookmark-url">{new URL(bookmark.url).hostname}</p>
                  </a>
                </div>
              ))
            }
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;
