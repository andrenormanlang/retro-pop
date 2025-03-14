# Docker Setup for Retro Pop Comic App

This directory contains Docker configuration for running the Retro Pop Comic application in containers.

## Files

- `Dockerfile` - Multi-stage build configuration for the Next.js application
- `docker-compose.yml` - Docker Compose configuration for orchestrating services
- `.dockerignore` - Specifies files and directories to exclude from the Docker build

## Prerequisites

- [Docker](https://www.docker.com/products/docker-desktop/) installed on your machine
- [Docker Compose](https://docs.docker.com/compose/install/) (usually bundled with Docker Desktop)

## Getting Started

### Building and Running the Application

1. From the project root directory, run:

```bash
# Build and start the containers in detached mode
docker-compose -f docker/docker-compose.yml up -d --build
```

2. Access the application at http://localhost:3000

### Stopping the Application

```bash
# Stop all running containers
docker-compose -f docker/docker-compose.yml down
```

## Environment Variables

For production deployments, you'll need to ensure your environment variables are properly set. You can modify the `docker-compose.yml` file to include necessary environment variables or use a `.env` file.

### Using .env File with Docker Compose

Create a `.env` file in the project root with your environment variables:

```
GEMINI_API_KEY=your_gemini_api_key
COMIC_VINE_API_KEY=your_comic_vine_api_key
```

These variables will be automatically loaded by Docker Compose.

## Volumes

The Docker Compose configuration mounts the local `public` directory to preserve those files between container restarts. You may want to add additional volumes for persistent data.

## Production Deployment

For production deployment, consider:

1. Using Docker secrets for sensitive information
2. Setting up proper logging and monitoring
3. Configuring a reverse proxy (like Nginx) in front of the application
4. Enabling HTTPS with SSL certificates

## Troubleshooting

If you encounter issues:

1. Check container logs:
```bash
docker-compose -f docker/docker-compose.yml logs
```

2. Access the running container:
```bash
docker exec -it retro-pop-app sh
``` 
