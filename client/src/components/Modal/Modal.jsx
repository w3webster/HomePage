import React, { useState, useEffect } from 'react';
import { useBookmarks } from '../../context/BookmarkContext';
import { downloadJson } from '../../utils/helpers';
import './Modal.css';

const Modal = () => {
  const { state, closeModal, addBookmark, updateBookmark, addFolder, updateFolder, exportData, importData } = useBookmarks();
  const { modalState } = state;
  const { isOpen, type, data } = modalState;
  
  // Form state for different modal types
  const [bookmarkForm, setBookmarkForm] = useState({
    title: '',
    url: '',
    folderId: 'default',
    icon: ''
  });
  
  const [folderForm, setFolderForm] = useState({
    name: ''
  });
  
  const [importStrategy, setImportStrategy] = useState('merge');
  const [importFile, setImportFile] = useState(null);
  const [importing, setImporting] = useState(false);
  
  // Reset form state when modal type or data changes
  useEffect(() => {
    if (!isOpen) return;
    
    if (type === 'addBookmark') {
      setBookmarkForm({
        title: '',
        url: '',
        folderId: data?.folderId || 'default',
        icon: ''
      });
    } 
    else if (type === 'editBookmark' && data) {
      setBookmarkForm({
        title: data.title || '',
        url: data.url || '',
        folderId: data.folderId || 'default',
        icon: data.icon || ''
      });
    }
    else if (type === 'addFolder') {
      setFolderForm({
        name: ''
      });
    }
    else if (type === 'editFolder' && data) {
      setFolderForm({
        name: data.name || ''
      });
    }
  }, [isOpen, type, data]);
  
  // Handlers for bookmark form
  const handleBookmarkChange = (e) => {
    const { name, value } = e.target;
    setBookmarkForm(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleBookmarkSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (type === 'addBookmark') {
        await addBookmark(bookmarkForm);
      } else if (type === 'editBookmark' && data) {
        await updateBookmark(data.id, bookmarkForm);
      }
      closeModal();
    } catch (error) {
      console.error('Error saving bookmark:', error);
      alert('Failed to save bookmark. Please try again.');
    }
  };
  
  // Handlers for folder form
  const handleFolderChange = (e) => {
    const { name, value } = e.target;
    setFolderForm(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleFolderSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (type === 'addFolder') {
        await addFolder(folderForm);
      } else if (type === 'editFolder' && data) {
        await updateFolder(data.id, folderForm);
      }
      closeModal();
    } catch (error) {
      console.error('Error saving folder:', error);
      alert('Failed to save folder. Please try again.');
    }
  };
  
  // Handler for exporting bookmarks
  const handleExport = async () => {
    try {
      const exportedData = await exportData();
      downloadJson(exportedData, `bookmarks-${new Date().toISOString().slice(0, 10)}.json`);
      closeModal();
    } catch (error) {
      console.error('Error exporting bookmarks:', error);
      alert('Failed to export bookmarks. Please try again.');
    }
  };
  
  // Handlers for importing bookmarks
  const handleImportFileChange = (e) => {
    setImportFile(e.target.files[0]);
  };
  
  const handleImport = async (e) => {
    e.preventDefault();
    
    if (!importFile) {
      alert('Please select a file to import.');
      return;
    }
    
    try {
      setImporting(true);
      
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const importedData = JSON.parse(event.target.result);
          await importData(importedData, importStrategy);
          closeModal();
        } catch (error) {
          console.error('Error parsing import file:', error);
          alert('Failed to parse import file. Make sure it is a valid JSON file.');
        } finally {
          setImporting(false);
        }
      };
      
      reader.onerror = () => {
        console.error('Error reading file');
        alert('Failed to read file. Please try again.');
        setImporting(false);
      };
      
      reader.readAsText(importFile);
    } catch (error) {
      console.error('Error importing bookmarks:', error);
      alert('Failed to import bookmarks. Please try again.');
      setImporting(false);
    }
  };
  
  // If modal is not open, don't render anything
  if (!isOpen) return null;

  // Render the appropriate modal content based on type
  return (
    <div className="modal-overlay" onClick={closeModal}>
      <div className="modal-container" onClick={e => e.stopPropagation()}>
        {/* Bookmark Form */}
        {(type === 'addBookmark' || type === 'editBookmark') && (
          <div className="modal-content">
            <h2 className="modal-title">
              {type === 'addBookmark' ? 'Add Bookmark' : 'Edit Bookmark'}
            </h2>
            
            <form onSubmit={handleBookmarkSubmit}>
              <div className="form-group">
                <label htmlFor="title">Title</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={bookmarkForm.title}
                  onChange={handleBookmarkChange}
                  required
                  autoFocus
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="url">URL</label>
                <input
                  type="url"
                  id="url"
                  name="url"
                  value={bookmarkForm.url}
                  onChange={handleBookmarkChange}
                  required
                  placeholder="https://"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="folderId">Folder</label>
                <select
                  id="folderId"
                  name="folderId"
                  value={bookmarkForm.folderId}
                  onChange={handleBookmarkChange}
                >
                  {state.folders.map(folder => (
                    <option key={folder.id} value={folder.id}>
                      {folder.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="modal-actions">
                <button type="button" className="btn" onClick={closeModal}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save
                </button>
              </div>
            </form>
          </div>
        )}
        
        {/* Folder Form */}
        {(type === 'addFolder' || type === 'editFolder') && (
          <div className="modal-content">
            <h2 className="modal-title">
              {type === 'addFolder' ? 'Add Folder' : 'Edit Folder'}
            </h2>
            
            <form onSubmit={handleFolderSubmit}>
              <div className="form-group">
                <label htmlFor="name">Folder Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={folderForm.name}
                  onChange={handleFolderChange}
                  required
                  autoFocus
                />
              </div>
              
              <div className="modal-actions">
                <button type="button" className="btn" onClick={closeModal}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save
                </button>
              </div>
            </form>
          </div>
        )}
        
        {/* Settings Modal */}
        {type === 'settings' && (
          <div className="modal-content">
            <h2 className="modal-title">Settings</h2>
            
            <div className="settings-section">
              <h3>Export / Import</h3>
              
              <div className="settings-actions">
                <button 
                  className="btn"
                  onClick={handleExport}
                >
                  Export Bookmarks
                </button>
                
                <div className="import-section">
                  <h4>Import Bookmarks</h4>
                  <form onSubmit={handleImport}>
                    <div className="form-group">
                      <label htmlFor="importFile">Select File</label>
                      <input
                        type="file"
                        id="importFile"
                        accept=".json"
                        onChange={handleImportFileChange}
                        required
                      />
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="importStrategy">Import Strategy</label>
                      <select
                        id="importStrategy"
                        value={importStrategy}
                        onChange={e => setImportStrategy(e.target.value)}
                      >
                        <option value="merge">Merge (Keep both, prefer newer)</option>
                        <option value="replace">Replace (Delete existing)</option>
                      </select>
                    </div>
                    
                    <button 
                      type="submit" 
                      className="btn btn-primary"
                      disabled={importing || !importFile}
                    >
                      {importing ? 'Importing...' : 'Import'}
                    </button>
                  </form>
                </div>
              </div>
            </div>
            
            <div className="modal-actions">
              <button className="btn" onClick={closeModal}>
                Close
              </button>
            </div>
          </div>
        )}
        
        <button className="modal-close-btn" onClick={closeModal} aria-label="Close modal">
          ✕
        </button>
      </div>
    </div>
  );
};

export default Modal;
