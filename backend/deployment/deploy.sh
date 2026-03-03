#!/bin/bash
# ============================================================
# ATS Production Deploy Script
# Run this from the backend/ directory on your Linux server
# ============================================================

set -e

echo "==> Pulling latest code..."
git pull origin main

echo "==> Installing Composer dependencies (no dev)..."
composer install --no-dev --optimize-autoloader

echo "==> Caching config, routes, views..."
php artisan config:cache
php artisan route:cache
php artisan view:cache

echo "==> Running database migrations..."
php artisan migrate --force

echo "==> Clearing old caches..."
php artisan cache:clear
php artisan queue:restart

echo "==> Setting storage permissions..."
chmod -R 775 storage bootstrap/cache
chown -R www-data:www-data storage bootstrap/cache

echo "==> Reloading Supervisor workers..."
supervisorctl reread
supervisorctl update
supervisorctl restart ats-worker:*

echo ""
echo "Deploy complete!"
