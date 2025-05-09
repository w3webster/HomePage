const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const bookmarkRoutes = require('./routes/bookmarks');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../client/build')));

// Ensure data directory exists
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Ensure bookmarks.json exists
const bookmarksFile = path.join(dataDir, 'bookmarks.json');
if (!fs.existsSync(bookmarksFile)) {
  fs.writeFileSync(bookmarksFile, JSON.stringify({
    folders: [
      {
        id: 'default',
        name: 'Default',
        order: 0
      }
    ],
    bookmarks: []
  }, null, 2));
}

// Routes
app.use('/api', bookmarkRoutes);

// Serve React app for any other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build/index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`API endpoints available at http://localhost:${PORT}/api`);
});
