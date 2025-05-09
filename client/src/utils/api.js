/**
 * API utilities for interacting with the bookmark manager backend
 */

const API_URL = 'http://localhost:3001/api';

/**
 * Fetch all bookmarks and folders
 * @returns {Promise<Object>} Object containing bookmarks and folders data
 */
export const fetchBookmarks = async () => {
  try {
    const response = await fetch(`${API_URL}/bookmarks`);
    if (!response.ok) {
      throw new Error('Failed to fetch bookmarks');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching bookmarks:', error);
    throw error;
  }
};

/**
 * Create a new bookmark
 * @param {Object} bookmark - Bookmark data to create
 * @returns {Promise<Object>} Created bookmark object
 */
export const createBookmark = async (bookmark) => {
  try {
    const response = await fetch(`${API_URL}/bookmarks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(bookmark),
    });
    
    if (!response.ok) {
      throw new Error('Failed to create bookmark');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error creating bookmark:', error);
    throw error;
  }
};

/**
 * Update an existing bookmark
 * @param {string} id - Bookmark ID to update
 * @param {Object} data - Updated bookmark data
 * @returns {Promise<Object>} Updated bookmark object
 */
export const updateBookmark = async (id, data) => {
  try {
    const response = await fetch(`${API_URL}/bookmarks/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error('Failed to update bookmark');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error updating bookmark:', error);
    throw error;
  }
};

/**
 * Delete a bookmark
 * @param {string} id - Bookmark ID to delete
 * @returns {Promise<Object>} Success response
 */
export const deleteBookmark = async (id) => {
  try {
    const response = await fetch(`${API_URL}/bookmarks/${id}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error('Failed to delete bookmark');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error deleting bookmark:', error);
    throw error;
  }
};

/**
 * Create a new folder
 * @param {Object} folder - Folder data to create
 * @returns {Promise<Object>} Created folder object
 */
export const createFolder = async (folder) => {
  try {
    const response = await fetch(`${API_URL}/folders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(folder),
    });
    
    if (!response.ok) {
      throw new Error('Failed to create folder');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error creating folder:', error);
    throw error;
  }
};

/**
 * Update an existing folder
 * @param {string} id - Folder ID to update
 * @param {Object} data - Updated folder data
 * @returns {Promise<Object>} Updated folder object
 */
export const updateFolder = async (id, data) => {
  try {
    const response = await fetch(`${API_URL}/folders/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error('Failed to update folder');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error updating folder:', error);
    throw error;
  }
};

/**
 * Delete a folder
 * @param {string} id - Folder ID to delete
 * @returns {Promise<Object>} Success response
 */
export const deleteFolder = async (id) => {
  try {
    const response = await fetch(`${API_URL}/folders/${id}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error('Failed to delete folder');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error deleting folder:', error);
    throw error;
  }
};

/**
 * Export bookmarks data
 * @returns {Promise<Object>} Export data object
 */
export const exportBookmarks = async () => {
  try {
    const response = await fetch(`${API_URL}/export`, {
      method: 'POST',
    });
    
    if (!response.ok) {
      throw new Error('Failed to export bookmarks');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error exporting bookmarks:', error);
    throw error;
  }
};

/**
 * Import bookmarks data
 * @param {Object} data - Import data object
 * @param {string} strategy - Import strategy ('merge' or 'replace')
 * @returns {Promise<Object>} Success response
 */
export const importBookmarks = async (data, strategy = 'merge') => {
  try {
    const response = await fetch(`${API_URL}/import?strategy=${strategy}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error('Failed to import bookmarks');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error importing bookmarks:', error);
    throw error;
  }
};

/**
 * Extract page title from URL
 * @param {string} url - URL to get title from
 * @returns {Promise<string>} Extracted title or URL hostname
 */
export const fetchPageTitle = async (url) => {
  try {
    // Since we can't fetch cross-origin content directly from the browser,
    // and our server might not be available, let's use a fallback approach:
    // Just extract a title from the domain name
    
    const urlObj = new URL(url);
    const hostname = urlObj.hostname;
    
    // Convert hostname to a title format
    // For example: "www.google.com" -> "Google"
    let title = hostname
      .replace(/^www\./, '') // Remove www. prefix
      .split('.')[0]; // Take the first part before the first dot
    
    // Capitalize first letter
    title = title.charAt(0).toUpperCase() + title.slice(1);
    
    return title;
  } catch (error) {
    console.error('Error generating title from URL:', error);
    return '';
  }
};
