const express = require('express');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const router = express.Router();
const fetch = require('node-fetch');

// Path to bookmarks data file
const dataPath = path.join(__dirname, '../data/bookmarks.json');

// Helper function to read bookmarks data
const getBookmarksData = () => {
  try {
    const jsonData = fs.readFileSync(dataPath);
    return JSON.parse(jsonData);
  } catch (error) {
    console.error('Error reading bookmarks data:', error);
    return { folders: [], bookmarks: [] };
  }
};

// Helper function to write bookmarks data
const saveBookmarksData = (data) => {
  try {
    fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error('Error writing bookmarks data:', error);
    return false;
  }
};

// GET all bookmarks and folders
router.get('/bookmarks', (req, res) => {
  const data = getBookmarksData();
  res.json(data);
});

// POST create new bookmark
router.post('/bookmarks', (req, res) => {
  try {
    const data = getBookmarksData();
    const newBookmark = {
      id: uuidv4(),
      title: req.body.title,
      url: req.body.url,
      folderId: req.body.folderId || 'default',
      icon: req.body.icon || '',
      createdAt: new Date().toISOString(),
      modifiedAt: new Date().toISOString(),
      order: data.bookmarks.filter(b => b.folderId === (req.body.folderId || 'default')).length
    };
    
    data.bookmarks.push(newBookmark);
    saveBookmarksData(data);
    
    res.status(201).json(newBookmark);
  } catch (error) {
    console.error('Error creating bookmark:', error);
    res.status(500).json({ error: 'Failed to create bookmark' });
  }
});

// PUT update bookmark
router.put('/bookmarks/:id', (req, res) => {
  try {
    const data = getBookmarksData();
    const bookmarkIndex = data.bookmarks.findIndex(b => b.id === req.params.id);
    
    if (bookmarkIndex === -1) {
      return res.status(404).json({ error: 'Bookmark not found' });
    }
    
    data.bookmarks[bookmarkIndex] = {
      ...data.bookmarks[bookmarkIndex],
      ...req.body,
      modifiedAt: new Date().toISOString()
    };
    
    saveBookmarksData(data);
    res.json(data.bookmarks[bookmarkIndex]);
  } catch (error) {
    console.error('Error updating bookmark:', error);
    res.status(500).json({ error: 'Failed to update bookmark' });
  }
});

// DELETE bookmark
router.delete('/bookmarks/:id', (req, res) => {
  try {
    const data = getBookmarksData();
    const bookmarkIndex = data.bookmarks.findIndex(b => b.id === req.params.id);
    
    if (bookmarkIndex === -1) {
      return res.status(404).json({ error: 'Bookmark not found' });
    }
    
    data.bookmarks.splice(bookmarkIndex, 1);
    saveBookmarksData(data);
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting bookmark:', error);
    res.status(500).json({ error: 'Failed to delete bookmark' });
  }
});

// GET all folders
router.get('/folders', (req, res) => {
  const data = getBookmarksData();
  res.json(data.folders);
});

// POST create new folder
router.post('/folders', (req, res) => {
  try {
    const data = getBookmarksData();
    const newFolder = {
      id: uuidv4(),
      name: req.body.name,
      order: data.folders.length,
      createdAt: new Date().toISOString(),
      modifiedAt: new Date().toISOString()
    };
    
    data.folders.push(newFolder);
    saveBookmarksData(data);
    
    res.status(201).json(newFolder);
  } catch (error) {
    console.error('Error creating folder:', error);
    res.status(500).json({ error: 'Failed to create folder' });
  }
});

// PUT update folder
router.put('/folders/:id', (req, res) => {
  try {
    const data = getBookmarksData();
    const folderIndex = data.folders.findIndex(f => f.id === req.params.id);
    
    if (folderIndex === -1) {
      return res.status(404).json({ error: 'Folder not found' });
    }
    
    data.folders[folderIndex] = {
      ...data.folders[folderIndex],
      ...req.body,
      modifiedAt: new Date().toISOString()
    };
    
    saveBookmarksData(data);
    res.json(data.folders[folderIndex]);
  } catch (error) {
    console.error('Error updating folder:', error);
    res.status(500).json({ error: 'Failed to update folder' });
  }
});

// DELETE folder and associated bookmarks
router.delete('/folders/:id', (req, res) => {
  try {
    const data = getBookmarksData();
    const folderIndex = data.folders.findIndex(f => f.id === req.params.id);
    
    if (folderIndex === -1) {
      return res.status(404).json({ error: 'Folder not found' });
    }
    
    // Don't allow deleting the default folder
    if (data.folders[folderIndex].id === 'default') {
      return res.status(400).json({ error: 'Cannot delete the default folder' });
    }
    
    // Remove folder
    data.folders.splice(folderIndex, 1);
    
    // Move associated bookmarks to default folder
    data.bookmarks.forEach(bookmark => {
      if (bookmark.folderId === req.params.id) {
        bookmark.folderId = 'default';
      }
    });
    
    saveBookmarksData(data);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting folder:', error);
    res.status(500).json({ error: 'Failed to delete folder' });
  }
});

// POST export bookmarks
router.post('/export', (req, res) => {
  try {
    const data = getBookmarksData();
    res.json({
      data,
      exportedAt: new Date().toISOString(),
      version: '1.0'
    });
  } catch (error) {
    console.error('Error exporting bookmarks:', error);
    res.status(500).json({ error: 'Failed to export bookmarks' });
  }
});

// GET fetch page title
router.get('/fetch-title', async (req, res) => {
  const url = req.query.url;
  
  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }
  
  try {
    const response = await fetch(url);
    const html = await response.text();
    
    // Extract title using regex
    const titleMatch = html.match(/<title>(.*?)<\/title>/i);
    const title = titleMatch ? titleMatch[1].trim() : '';
    
    res.json({ title });
  } catch (error) {
    console.error('Error fetching page title:', error);
    res.status(500).json({ error: 'Failed to fetch page title' });
  }
});

// POST import bookmarks
router.post('/import', (req, res) => {
  try {
    const importData = req.body;
    
    if (!importData.data || !importData.data.folders || !importData.data.bookmarks) {
      return res.status(400).json({ error: 'Invalid import data format' });
    }
    
    // Handle import strategy (replace or merge)
    if (req.query.strategy === 'replace') {
      saveBookmarksData(importData.data);
    } else {
      // Merge strategy
      const currentData = getBookmarksData();
      
      // Merge folders
      const folderIds = new Set(currentData.folders.map(f => f.id));
      importData.data.folders.forEach(folder => {
        if (!folderIds.has(folder.id)) {
          currentData.folders.push(folder);
          folderIds.add(folder.id);
        }
      });
      
      // Merge bookmarks
      const bookmarkUrls = new Map(currentData.bookmarks.map(b => [b.url, b]));
      importData.data.bookmarks.forEach(bookmark => {
        const existing = bookmarkUrls.get(bookmark.url);
        if (!existing) {
          currentData.bookmarks.push(bookmark);
          bookmarkUrls.set(bookmark.url, bookmark);
        } else if (new Date(bookmark.modifiedAt) > new Date(existing.modifiedAt)) {
          // Update if imported bookmark is newer
          Object.assign(existing, {
            ...bookmark,
            id: existing.id // Keep existing ID
          });
        }
      });
      
      saveBookmarksData(currentData);
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error importing bookmarks:', error);
    res.status(500).json({ error: 'Failed to import bookmarks' });
  }
});

module.exports = router;
