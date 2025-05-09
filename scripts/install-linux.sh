#!/bin/bash
# BookmarkHome Installation Script for Linux
# This script installs the BookmarkHome application and configures it to run at startup

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

# Configuration
APP_NAME="BookmarkHome"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
APP_DIR="$(dirname "$SCRIPT_DIR")"
INSTALL_DIR="$HOME/.local/share/$APP_NAME"
SYSTEMD_USER_DIR="$HOME/.config/systemd/user"
AUTOSTART_DIR="$HOME/.config/autostart"
BROWSER_URL="http://localhost:3001"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}Error: Node.js is not installed. Please install Node.js before continuing.${NC}"
    exit 1
else
    NODE_VERSION=$(node --version)
    echo -e "${GREEN}Node.js found: $NODE_VERSION${NC}"
fi

# Create installation directory
echo "Installing $APP_NAME to $INSTALL_DIR..."
mkdir -p "$INSTALL_DIR"

# Copy application files
echo "Copying application files..."
cp -R "$APP_DIR/"* "$INSTALL_DIR"
echo -e "${GREEN}Files copied successfully.${NC}"

# Install dependencies
echo "Installing application dependencies..."
cd "$INSTALL_DIR" || exit 1
npm install --production
cd "$INSTALL_DIR/client" || exit 1
npm install --production
npm run build
cd "$INSTALL_DIR" || exit 1
echo -e "${GREEN}Dependencies installed successfully.${NC}"

# Create systemd user service directory if it doesn't exist
mkdir -p "$SYSTEMD_USER_DIR"

# Create systemd user service file
echo "Creating systemd user service..."
cat > "$SYSTEMD_USER_DIR/$APP_NAME.service" << EOL
[Unit]
Description=$APP_NAME Server
After=network.target

[Service]
Type=simple
ExecStart=/usr/bin/node $INSTALL_DIR/server/server.js
WorkingDirectory=$INSTALL_DIR
Restart=on-failure
RestartSec=5

[Install]
WantedBy=default.target
EOL

# Enable and start the service
systemctl --user daemon-reload
systemctl --user enable "$APP_NAME.service"
echo -e "${GREEN}Systemd user service created and enabled.${NC}"

# Create autostart directory if it doesn't exist
mkdir -p "$AUTOSTART_DIR"

# Create desktop entry for browser autostart
echo "Creating browser autostart entry..."
cat > "$AUTOSTART_DIR/$APP_NAME-browser.desktop" << EOL
[Desktop Entry]
Type=Application
Name=$APP_NAME Browser
Exec=/usr/bin/xdg-open $BROWSER_URL
Terminal=false
X-GNOME-Autostart-Delay=3
X-GNOME-Autostart-enabled=true
EOL

chmod +x "$AUTOSTART_DIR/$APP_NAME-browser.desktop"
echo -e "${GREEN}Browser autostart entry created.${NC}"

# Create desktop entry for application launcher
echo "Creating application launcher..."
cat > "$HOME/.local/share/applications/$APP_NAME.desktop" << EOL
[Desktop Entry]
Type=Application
Name=$APP_NAME
Exec=/usr/bin/xdg-open $BROWSER_URL
Icon=$INSTALL_DIR/client/public/favicon.ico
Terminal=false
Categories=Utility;
EOL

chmod +x "$HOME/.local/share/applications/$APP_NAME.desktop"
echo -e "${GREEN}Application launcher created.${NC}"

echo -e "\n${GREEN}Installation completed successfully!${NC}"
echo "BookmarkHome will launch automatically when you log in."
echo "You can also launch it manually from your applications menu or by navigating to: $BROWSER_URL"

# Ask user if they want to start the application now
read -p "Do you want to start BookmarkHome now? (Y/n) " START_NOW
START_NOW=${START_NOW:-Y}
if [[ $START_NOW =~ ^[Yy]$ ]]; then
    echo "Starting BookmarkHome..."
    systemctl --user start "$APP_NAME.service"
    sleep 2
    xdg-open "$BROWSER_URL" &> /dev/null
    echo -e "${GREEN}BookmarkHome started. The browser should open shortly.${NC}"
fi
