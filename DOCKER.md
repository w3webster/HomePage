# Docker Deployment Guide for BookmarkHome

This document provides instructions for deploying the BookmarkHome application using Docker.

## Prerequisites

- [Docker](https://www.docker.com/get-started) installed on your system
- [Docker Compose](https://docs.docker.com/compose/install/) (included with Docker Desktop on Windows and Mac)

## Quick Start

1. **Build and start the application**:

   ```bash
   docker-compose up -d
   ```

2. **Access the application**:

   Open your browser and navigate to [http://localhost:3001](http://localhost:3001)

3. **Stop the application**:

   ```bash
   docker-compose down
   ```

## Configuration Options

### Changing the Port

To run the application on a different port (e.g., 8080):

1. Edit `docker-compose.yml`:

   ```yaml
   ports:
     - "8080:8080"  # Change both host and container ports
   environment:
     - PORT=8080    # Set the internal port
   ```

2. Restart the container:

   ```bash
   docker-compose down
   docker-compose up -d
   ```

### Data Persistence

Bookmark data is stored in a Docker volume named `bookmark-data`. This ensures your data persists between container restarts.

To manage this volume:

- **List volumes**:

  ```bash
  docker volume ls
  ```

- **Delete volume** (this will delete all bookmark data):

  ```bash
  docker volume rm bookmark-data
  ```

## Manual Docker Commands

If you prefer not to use Docker Compose:

1. **Build the image**:

   ```bash
   docker build -t bookmark-homepage .
   ```

2. **Run the container**:

   ```bash
   docker run -d -p 3001:3001 -v bookmark-data:/app/server/data --name bookmark-homepage bookmark-homepage
   ```

3. **Stop the container**:

   ```bash
   docker stop bookmark-homepage
   ```

4. **Remove the container**:

   ```bash
   docker rm bookmark-homepage
   ```

## Environment Variables

- `PORT`: The port the application will run on (default: 3001)

## Troubleshooting

- **Cannot access the application**:
  
  Ensure the container is running:
  ```bash
  docker ps
  ```

- **Port conflict**:
  
  If port 3001 is already in use, change the port as described in the Configuration section.

- **View container logs**:
  
  ```bash
  docker logs bookmark-homepage
  ```
  or
  ```bash
  docker-compose logs
  ```

## Rebuilding After Changes

After making changes to the application code, rebuild and restart:

```bash
docker-compose up -d --build
```

This will rebuild the image and restart the container with the updated code.
