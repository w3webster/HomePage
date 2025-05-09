# BookmarkHome Installation Script for Windows
# This script installs the BookmarkHome application and configures it to run at startup

# Ensure we're running as administrator
if (-NOT ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")) {
    Write-Warning "Please run this script as Administrator!"
    exit 1
}

# Configuration
$appName = "BookmarkHome"
$appPath = $PSScriptRoot | Split-Path -Parent
$serverJs = Join-Path -Path $appPath -ChildPath "server\server.js"
$installedPath = "$env:LOCALAPPDATA\$appName"
$startupPath = "$env:APPDATA\Microsoft\Windows\Start Menu\Programs\Startup"
$startupScriptPath = "$startupPath\$appName.vbs"
$browserUrl = "http://localhost:3001"
$nodeExe = "node"

# Check if Node.js is installed
try {
    $nodeVersion = cmd.exe /c "node --version 2>&1"
    Write-Host "Node.js found: $nodeVersion"
}
catch {
    Write-Error "Node.js is not installed. Please install it before continuing."
    exit 1
}

# Create the installation directory if it doesn't exist
Write-Host "Installing $appName to $installedPath..."
if (-not (Test-Path $installedPath)) {
    New-Item -Path $installedPath -ItemType Directory | Out-Null
}

# Copy the application files
try {
    Write-Host "Copying application files..."
    Copy-Item -Path "$appPath\*" -Destination $installedPath -Recurse -Force
    Write-Host "Files copied successfully."
} catch {
    Write-Error "Failed to copy application files: $_"
    exit 1
}

# Install dependencies
Write-Host "Installing application dependencies..."
try {
    Set-Location -Path $installedPath
    & npm install --production | Out-Null
    & cd client && npm install --production | Out-Null
    & npm run build | Out-Null
    Write-Host "Dependencies installed successfully."
} catch {
    Write-Error "Failed to install dependencies: $_"
    exit 1
}

# Create a VBScript to launch the application silently at startup
Write-Host "Creating startup script..."
$startupScript = @"
Set WshShell = CreateObject("WScript.Shell")
WshShell.CurrentDirectory = "$installedPath"
WshShell.Run "cmd /c cd $installedPath && $nodeExe server\server.js", 0, False
WScript.Sleep 2000
WshShell.Run "$browserUrl", 1, False
"@

try {
    $startupScript | Out-File -FilePath $startupScriptPath -Encoding ASCII -Force
    Write-Host "Startup script created: $startupScriptPath"
} catch {
    Write-Error "Failed to create startup script: $_"
    exit 1
}

# Create a task in Task Scheduler to run at logon (alternative to startup folder)
Write-Host "Setting up Windows Task Scheduler task..."
try {
    $action = New-ScheduledTaskAction -Execute "wscript.exe" -Argument "$startupScriptPath"
    $trigger = New-ScheduledTaskTrigger -AtLogOn
    $settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries
    $principal = New-ScheduledTaskPrincipal -UserId $env:USERNAME -LogonType Interactive -RunLevel Limited
    
    # Check if task already exists
    $existingTask = Get-ScheduledTask -TaskName $appName -ErrorAction SilentlyContinue
    if ($existingTask) {
        Unregister-ScheduledTask -TaskName $appName -Confirm:$false
    }
    
    Register-ScheduledTask -TaskName $appName -Action $action -Trigger $trigger -Settings $settings -Principal $principal
    Write-Host "Task created successfully."
} catch {
    Write-Warning "Failed to create scheduled task: $_"
    Write-Host "The application will still start from the startup folder."
}

Write-Host "`nInstallation completed successfully!"
Write-Host "BookmarkHome will launch automatically when you log in."
Write-Host "You can also launch it manually by running the server and navigating to: $browserUrl"

# Ask user if they want to start the application now
$startNow = Read-Host "Do you want to start BookmarkHome now? (Y/N)"
if ($startNow -eq "Y" -or $startNow -eq "y") {
    Write-Host "Starting BookmarkHome..."
    Start-Process "wscript.exe" -ArgumentList $startupScriptPath
    Write-Host "BookmarkHome started. Please wait a few seconds for the browser to open."
}
