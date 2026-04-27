FROM php:8.2-fpm

# Install system dependencies
RUN apt-get update && apt-get install -y \
    git \
    curl \
    libpq-dev \
    libonig-dev \
    libxml2-dev \
    zip \
    unzip

# Clear cache
RUN apt-get clean && rm -rf /var/lib/apt/lists/*

# Install PHP extensions
RUN docker-php-ext-install pdo pdo_mysql mbstring exif pcntl bcmath

# Install composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Set working directory
WORKDIR /var/www

# Copy application code
COPY . .

# Install dependencies
RUN composer install --no-dev --optimize-autoloader

# Generate APP_KEY if not exists
RUN php artisan key:generate --force || true

# Run migrations
RUN php artisan migrate --force || true

# Create cache directories
RUN mkdir -p storage/framework/cache storage/framework/views storage/logs && \
    chmod -R 777 storage bootstrap/cache

EXPOSE 8000

CMD ["php", "-d", "variables_order=EGPCS", "artisan", "serve", "--host=0.0.0.0", "--port=8000"]
