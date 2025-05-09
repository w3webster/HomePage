import React, { useState } from 'react';
import './styles/global.css';
import './App.css';
import { BookmarkProvider, useBookmarks } from './context/BookmarkContext';

// Main app component that wraps everything with the BookmarkProvider
function App() {
  return (
    <BookmarkProvider>
      <HomePage />
    </BookmarkProvider>
  );
}

// Home page component that uses the bookmark context
function HomePage() {
  // Get state and methods from the bookmark context
  const { 
    state, 
    addBookmark, 
    addFolder,
    deleteBookmark,
    deleteFolder,
    setCurrentFolder,
    importData
  } = useBookmarks();

  const { bookmarks, folders, currentFolder, isLoading } = state;

  // State for the search query
  const [searchQuery, setSearchQuery] = useState('');

  // State for the modal
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState(null); // 'bookmark' or 'folder'
  
  // State for the form inputs
  const [newBookmark, setNewBookmark] = useState({
    title: '',
    url: '',
    folderId: 'default'
  });
  
  const [newFolder, setNewFolder] = useState({
    name: ''
  });

  // Function to open the modal
  const openModal = (type) => {
    setModalType(type);
    setModalOpen(true);
  };

  // Function to close the modal
  const closeModal = () => {
    setModalOpen(false);
    setModalType(null);
  };

  // Handle input changes for bookmark form
  const handleBookmarkChange = (e) => {
    const { name, value } = e.target;
    setNewBookmark(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle input changes for folder form
  const handleFolderChange = (e) => {
    const { name, value } = e.target;
    setNewFolder(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle bookmark form submission - Now uses the context's addBookmark method
  const handleAddBookmark = async (e) => {
    e.preventDefault();
    
    try {
      // Use context method to add bookmark to the server
      await addBookmark({
        ...newBookmark,
        folderId: newBookmark.folderId || currentFolder
      });
      
      // Reset form and close modal
      setNewBookmark({
        title: '',
        url: '',
        folderId: currentFolder
      });
      closeModal();
    } catch (error) {
      console.error('Failed to add bookmark:', error);
      // Could add error handling UI here
    }
  };

  // Handle folder form submission - Now uses the context's addFolder method
  const handleAddFolder = async (e) => {
    e.preventDefault();
    
    try {
      // Check if folder name already exists
      const folderExists = folders.some(folder => 
        folder.name.toLowerCase() === newFolder.name.toLowerCase()
      );
      
      if (folderExists) {
        alert(`A folder with the name "${newFolder.name}" already exists.`);
        return;
      }
      
      // Use context method to add folder to the server
      await addFolder(newFolder);
      
      // Reset form and close modal
      setNewFolder({
        name: ''
      });
      closeModal();
    } catch (error) {
      console.error('Failed to add folder:', error);
      // Could add error handling UI here
    }
  };

  // Handle folder selection - Now uses the context's setCurrentFolder method
  const handleFolderClick = (folderId) => {
    setCurrentFolder(folderId);
  };

  // Get the current folder name
  const currentFolderName = folders.find(folder => folder.id === currentFolder)?.name || 'Default';

  // Show loading state if data is still loading
  if (isLoading) {
    return (
      <div className="app">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading your bookmarks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>BookmarkHome</h1>
        <div className="search-container">
          <input 
            type="text" 
            placeholder="Search bookmarks..."
            className="search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button 
              className="search-clear" 
              onClick={() => setSearchQuery('')}
            >
              ×
            </button>
          )}
        </div>
        <div className="header-actions">
          <button className="btn primary" onClick={() => openModal('bookmark')}>Add Bookmark</button>
          <button className="btn" onClick={() => openModal('folder')}>Add Folder</button>
          <button className="btn" onClick={() => openModal('settings')}>Settings</button>
        </div>
      </header>
      
      <main className="app-content">
        <aside className="folders-sidebar">
          <h2>Folders</h2>
          <ul className="folder-list">
            {folders.map(folder => (
              <li 
                key={folder.id} 
                className={`folder-item ${folder.id === currentFolder ? 'active' : ''}`}
              >
                <span className="folder-name" onClick={() => handleFolderClick(folder.id)}>
                  {folder.name}
                </span>
                {/* Don't show delete button for the default folder */}
                {folder.id !== 'default' && (
                  <button 
                    className="folder-delete-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (window.confirm(`Delete folder "${folder.name}"? All bookmarks will be moved to Default folder.`)) {
                        deleteFolder(folder.id);
                      }
                    }}
                    title="Delete folder"
                  >
                    ×
                  </button>
                )}
              </li>
            ))}
          </ul>
        </aside>
        
        <section className="bookmarks-grid">
          <h2>
            {searchQuery && searchQuery.trim() !== '' 
              ? `Search Results for "${searchQuery}"` 
              : currentFolderName}
          </h2>
          
          <div className="bookmarks-container">
            {bookmarks
              .filter(bookmark => {
                // If there's a search query, show bookmarks from all folders that match the search
                if (searchQuery && searchQuery.trim() !== '') {
                  // Search in title and URL
                  const query = searchQuery.toLowerCase();
                  const titleMatch = bookmark.title.toLowerCase().includes(query);
                  const urlMatch = bookmark.url.toLowerCase().includes(query);
                  
                  return titleMatch || urlMatch;
                }
                
                // If no search query, only show bookmarks from current folder
                return bookmark.folderId === currentFolder;
              })
              .map(bookmark => (
              <div key={bookmark.id} className="bookmark-tile">
                <div className="bookmark-actions">
                  <button 
                    className="delete-button" 
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (window.confirm(`Delete bookmark "${bookmark.title}"?`)) {
                        deleteBookmark(bookmark.id);
                      }
                    }}
                    title="Delete bookmark"
                  >
                    ×
                  </button>
                </div>
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
      
      {modalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            {modalType === 'bookmark' && (
              <div className="modal-content">
                <h2>Add Bookmark</h2>
                <form onSubmit={handleAddBookmark}>
                  <div className="form-group">
                    <label htmlFor="title">Title</label>
                    <input 
                      type="text" 
                      id="title" 
                      name="title"
                      value={newBookmark.title}
                      onChange={handleBookmarkChange}
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="url">URL</label>
                    <div className="url-input-container">
                      <input 
                        type="url" 
                        id="url" 
                        name="url"
                        value={newBookmark.url}
                        onChange={handleBookmarkChange}
                        placeholder="https://"
                        required
                      />
                      {newBookmark.url && (
                        <button 
                          type="button"
                          className="fetch-title-btn"
                          onClick={async () => {
                            try {
                              // Show loading state
                              const titleBtn = document.querySelector('.fetch-title-btn');
                              if (titleBtn) titleBtn.textContent = 'Loading...';
                              
                              // Use the API endpoint to fetch the page title
                              const { fetchPageTitle } = await import('./utils/api');
                              const title = await fetchPageTitle(newBookmark.url);
                              
                              if (title) {
                                setNewBookmark(prev => ({
                                  ...prev,
                                  title
                                }));
                              } else {
                                alert('Could not fetch title from URL');
                              }
                              
                              // Reset button
                              if (titleBtn) titleBtn.textContent = 'Get Title';
                            } catch (error) {
                              console.error('Error fetching title:', error);
                              alert('Error fetching page title');
                              
                              // Reset button on error
                              const titleBtn = document.querySelector('.fetch-title-btn');
                              if (titleBtn) titleBtn.textContent = 'Get Title';
                            }
                          }}
                        >
                          Get Title
                        </button>
                      )}
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="folderId">Folder</label>
                    <select 
                      id="folderId" 
                      name="folderId"
                      value={newBookmark.folderId || currentFolder}
                      onChange={handleBookmarkChange}
                    >
                      {folders.map(folder => (
                        <option key={folder.id} value={folder.id}>
                          {folder.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="modal-actions">
                    <button type="button" className="btn" onClick={closeModal}>Cancel</button>
                    <button type="submit" className="btn primary">Add Bookmark</button>
                  </div>
                </form>
              </div>
            )}
            
            {modalType === 'folder' && (
              <div className="modal-content">
                <h2>Add Folder</h2>
                <form onSubmit={handleAddFolder}>
                  <div className="form-group">
                    <label htmlFor="name">Folder Name</label>
                    <input 
                      type="text" 
                      id="name" 
                      name="name"
                      value={newFolder.name}
                      onChange={handleFolderChange}
                      required
                    />
                  </div>
                  
                  <div className="modal-actions">
                    <button type="button" className="btn" onClick={closeModal}>Cancel</button>
                    <button type="submit" className="btn primary">Add Folder</button>
                  </div>
                </form>
              </div>
            )}
            
            {modalType === 'settings' && (
              <div className="modal-content">
                <h2>Settings</h2>
                <div className="settings-section">
                  <h3>Export / Import</h3>
                  <div className="settings-actions">
                    <button 
                      className="btn"
                      onClick={() => {
                        // Create export data in the format expected by the import function
                        const exportData = {
                          data: {
                            bookmarks: bookmarks,
                            folders: folders
                          },
                          exportedAt: new Date().toISOString(),
                          version: "1.0"
                        };
                        
                        console.log("Exporting data:", exportData);
                        
                        const dataStr = JSON.stringify(exportData, null, 2);
                        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
                        
                        const exportFileDefaultName = `bookmarks-${new Date().toISOString().slice(0, 10)}.json`;
                        
                        const linkElement = document.createElement('a');
                        linkElement.setAttribute('href', dataUri);
                        linkElement.setAttribute('download', exportFileDefaultName);
                        linkElement.click();
                      }}
                    >
                      Export Bookmarks
                    </button>
                    
                    <button 
                      className="btn"
                      onClick={async () => {
                        try {
                          // Create a sample bookmark for testing in the format expected by the server
                          // Generate a unique sample folder ID first
                          const sampleFolderId = "sample-folder-" + Date.now();
                          
                          const sampleData = {
                            data: {
                              bookmarks: [
                                {
                                  id: "sample-id-" + Date.now(),
                                  title: "Example Bookmark",
                                  url: "https://example.com",
                                  folderId: sampleFolderId, // Use the new folder's ID
                                  icon: "https://example.com/favicon.ico"
                                }
                              ],
                              folders: [
                                {
                                  id: "default",
                                  name: "Default"
                                },
                                {
                                  id: sampleFolderId, // Use the same ID here
                                  name: "Sample Folder"
                                }
                              ]
                            },
                            exportedAt: new Date().toISOString(),
                            version: "1.0"
                          };
                          
                          await importData(sampleData, 'merge');
                          alert('Test bookmark imported successfully!');
                          closeModal();
                        } catch (error) {
                          console.error('Error during sample import:', error);
                          alert('Failed to import sample: ' + error.message);
                        }
                      }}
                    >
                      Import Test Bookmark
                    </button>
                    
                    <div className="import-section">
                      <h4>Import Bookmarks</h4>
                      <input
                        type="file"
                        id="importFile"
                        accept=".json"
                        className="import-file-input"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (!file) return;
                          
                          const reader = new FileReader();
                          reader.onload = (event) => {
                            try {
                              // First try to parse the JSON
                              const content = event.target.result;
                              console.log('Import file content:', content);
                              
                              const importedData = JSON.parse(content);
                              console.log('Parsed import data:', importedData);
                              
                              // Verify data structure and wrap in the expected format
                              let dataToImport;
                              
                              // Check if this is a direct export from our app (already wrapped in data property)
                              if (importedData.data && importedData.data.bookmarks && importedData.data.folders) {
                                dataToImport = importedData;
                              } 
                              // Check if this is a bare bookmarks/folders format
                              else if (importedData.bookmarks && Array.isArray(importedData.bookmarks) &&
                                       importedData.folders && Array.isArray(importedData.folders)) {
                                // Wrap in the expected format
                                dataToImport = {
                                  data: importedData,
                                  exportedAt: new Date().toISOString(),
                                  version: "1.0"
                                };
                              } else {
                                alert('Invalid import format: bookmarks and folders arrays are required');
                                return;
                              }
                              
                              console.log('Importing with data:', dataToImport);
                              
                              // Now try to import the correctly formatted data
                              importData(dataToImport, 'merge')
                                .then(() => {
                                  alert('Bookmarks imported successfully!');
                                  closeModal();
                                })
                                .catch(error => {
                                  console.error('Error during import:', error);
                                  alert('Failed to import: ' + error.message);
                                });
                              
                            } catch (error) {
                              console.error('Error parsing import file:', error);
                              alert('Failed to parse import file. Make sure it is a valid JSON file. Error: ' + error.message);
                            }
                          };
                          
                          reader.onerror = () => {
                            console.error('Error reading file');
                            alert('Failed to read file. Please try again.');
                          };
                          
                          reader.readAsText(file);
                        }}
                      />
                      <button 
                        className="btn"
                        onClick={() => {
                          document.getElementById('importFile').click();
                        }}
                      >
                        Select Import File
                      </button>
                    </div>
                  </div>
                </div>
                <div className="modal-actions">
                  <button className="btn" onClick={closeModal}>Close</button>
                </div>
              </div>
            )}
            <button className="modal-close" onClick={closeModal}>×</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
