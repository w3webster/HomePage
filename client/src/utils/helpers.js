/**
 * Helper functions for the bookmark manager app
 */

/**
 * Extract domain from URL
 * @param {string} url - URL to extract domain from
 * @returns {string} Domain name
 */
export const extractDomain = (url) => {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname;
  } catch (error) {
    console.error('Invalid URL:', url);
    return '';
  }
};

/**
 * Generate colors based on domain for bookmark tiles
 * @param {string} domain - Domain to generate color for
 * @returns {Object} Background and text colors
 */
export const generateColorFromDomain = (domain) => {
  if (!domain) {
    return { bgColor: '#E6E6E6', textColor: '#333333' };
  }
  
  // Simple hash function for string
  let hash = 0;
  for (let i = 0; i < domain.length; i++) {
    hash = domain.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  // Generate HSL color with muted saturation for Metro design style
  const h = Math.abs(hash) % 360;
  const s = 25; // Low saturation for muted colors
  const l = 65; // Lighter color for background
  
  // Ensure text is readable on the background
  const textL = l > 65 ? 20 : 95;
  
  return {
    bgColor: `hsl(${h}, ${s}%, ${l}%)`,
    textColor: `hsl(${h}, 10%, ${textL}%)`
  };
};

/**
 * Safely download JSON data as a file
 * @param {Object} data - Data to download
 * @param {string} filename - Name of the file
 */
export const downloadJson = (data, filename) => {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  
  // Cleanup
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 0);
};

/**
 * Try to fetch favicon for a URL
 * @param {string} url - URL to get favicon for
 * @returns {string} Favicon URL
 */
export const getFaviconUrl = (url) => {
  try {
    const domain = extractDomain(url);
    if (!domain) return '';
    
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
  } catch (error) {
    console.error('Error getting favicon:', error);
    return '';
  }
};

/**
 * Format date for display
 * @param {string} dateString - ISO date string
 * @returns {string} Formatted date
 */
export const formatDate = (dateString) => {
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  } catch (error) {
    return '';
  }
};

/**
 * Simple fuzzy search
 * @param {string} query - Search query
 * @param {string} text - Text to search in
 * @returns {boolean} True if match found
 */
export const fuzzySearch = (query, text) => {
  if (!query || !text) return false;
  
  query = query.toLowerCase().replace(/\s+/g, '');
  text = text.toLowerCase();
  
  let i = 0;
  let j = 0;
  
  while (i < query.length && j < text.length) {
    if (query[i] === text[j]) {
      i++;
    }
    j++;
  }
  
  return i === query.length;
};

/**
 * Fetch webpage title from URL
 * @param {string} url - URL to fetch title from
 * @returns {Promise<string>} Page title or empty string if failed
 */
export const fetchPageTitle = async (url) => {
  try {
    // Use a CORS proxy if needed
    const corsProxy = ''; // You might need to use a CORS proxy in production
    const response = await fetch(`${corsProxy}${url}`);
    const html = await response.text();
    
    // Extract title using regex
    const titleMatch = html.match(/<title>(.*?)<\/title>/i);
    return titleMatch ? titleMatch[1].trim() : '';
  } catch (error) {
    console.error('Error fetching page title:', error);
    return '';
  }
};

/**
 * Create a throttled function that only invokes func at most once per wait period
 * @param {Function} func - Function to throttle
 * @param {number} wait - Wait period in ms
 * @returns {Function} Throttled function
 */
export const throttle = (func, wait = 300) => {
  let waiting = false;
  
  return function(...args) {
    if (!waiting) {
      func.apply(this, args);
      waiting = true;
      setTimeout(() => {
        waiting = false;
      }, wait);
    }
  };
};
