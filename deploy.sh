#!/bin/bash
set -e

echo "=== MoneySecurity Deploy ==="

# Pull latest code
echo "[1/4] Pulling latest code..."
git pull origin main

# Build images
echo "[2/4] Building Docker images..."
docker compose build

# Stop old containers & start new ones
echo "[3/4] Restarting services..."
docker compose down
docker compose up -d

# Show status
echo "[4/4] Service status:"
docker compose ps

echo ""
echo "=== Deploy complete ==="
echo "App running at: http://localhost"
echo "API health: http://localhost/api/health"
