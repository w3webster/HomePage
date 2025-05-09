# BookmarkHome

A modern, minimalist bookmark manager with a Metro-inspired design that can be hosted locally on Windows or Linux desktops.

## Features

- 🔖 Easy bookmark management with add, remove, sort, and categorize capabilities
- 📂 Organize bookmarks in customizable folders
- 🔍 Search functionality to quickly find bookmarks
- 🎨 Clean, modern Metro-inspired UI
- 💻 Cross-platform support for Windows and Linux
- 🔄 Manual sync between computers via file export/import
- 🚀 Auto-start on system boot
- 🖌️ Customized tiles with automatically generated colors based on domain

## Tech Stack

- **Frontend**: React, CSS3
- **Backend**: Node.js, Express
- **Data Storage**: Local JSON files
- **Installation**: PowerShell (Windows) and Bash (Linux) scripts

## Installation

### Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

### Quick Setup

1. Clone the repository:
```
git clone https://github.com/yourusername/bookmark-homepage.git
cd bookmark-homepage
```

2. Install dependencies:
```
npm run install:all
```

3. Build the application:
```
npm run build
```

4. Start the server:
```
npm start
```

5. Access the application at `http://localhost:3001`

### Automated Installation

#### Windows Installation

1. Open PowerShell as Administrator
2. Navigate to the project directory
3. Run the installation script:

```powershell
.\scripts\install-windows.ps1
```

This will:
- Install all dependencies
- Build the application
- Set up the application to start when Windows boots
- Create a desktop shortcut

#### Linux Installation

1. Open a terminal
2. Navigate to the project directory
3. Make the installation script executable and run it:

```bash
chmod +x ./scripts/install-linux.sh
sudo bash ./scripts/install-linux.sh
```

This will:
- Install all dependencies
- Build the application
- Set up a systemd service to run on boot
- Create a desktop shortcut

## Usage

### Adding Bookmarks

1. Click the "Add Bookmark" button in the header
2. Enter the title and URL of the bookmark
3. Select a folder (category) for the bookmark
4. Click "Save"

### Managing Folders

1. Click the "Add Folder" button to create a new category
2. Click a folder to view its bookmarks
3. Use the menu button next to a folder to rename or delete it

### Search

Use the search bar in the header to find bookmarks across all folders.

### Syncing Between Computers

1. On the source computer, click the "Export" button in settings
2. Save the generated JSON file
3. On the target computer, go to settings and choose "Import"
4. Select the previously exported JSON file
5. Choose whether to merge or replace existing bookmarks

## Development

### Project Structure

```
bookmark-homepage/
├── client/            # React frontend
│   ├── public/        # Static files
│   └── src/           # React source code
├── scripts/           # Installation scripts
├── server/            # Express backend
│   ├── data/          # Local storage
│   ├── routes/        # API endpoints
│   └── server.js      # Server entry point
└── package.json       # Project configuration
```

### Running in Development Mode

```
npm run dev:all
```

This starts both the backend server and frontend development server with hot reloading.

## License

This project is licensed under the ISC License.

## Acknowledgements

- Built with React, Express, and Node.js
- Inspired by the Metro design system
