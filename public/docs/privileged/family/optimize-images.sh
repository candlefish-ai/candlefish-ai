#!/bin/bash

# Image optimization script for Candlefish AI Family Letter
# This script creates optimized versions of the logo in multiple formats and sizes

# Check if required tools are installed
check_dependencies() {
    local missing=()

    command -v convert >/dev/null 2>&1 || missing+=("imagemagick")
    command -v cwebp >/dev/null 2>&1 || missing+=("webp")
    command -v pngquant >/dev/null 2>&1 || missing+=("pngquant")

    if [ ${#missing[@]} -ne 0 ]; then
        echo "Missing dependencies: ${missing[*]}"
        echo "Install with: brew install ${missing[*]}"
        exit 1
    fi
}

# Create assets directory if it doesn't exist
mkdir -p assets

# Original image
ORIGINAL="candlefish_original.png"

if [ ! -f "$ORIGINAL" ]; then
    echo "Error: $ORIGINAL not found!"
    exit 1
fi

echo "Starting image optimization..."

# Get original file size
ORIGINAL_SIZE=$(stat -f%z "$ORIGINAL" 2>/dev/null || stat -c%s "$ORIGINAL" 2>/dev/null)
echo "Original size: $(($ORIGINAL_SIZE / 1024 / 1024))MB"

# Create different sizes
echo "Creating responsive images..."

# 150px version (standard display)
convert "$ORIGINAL" -resize 150x150 -quality 85 "assets/candlefish-logo-150.png"

# 300px version (retina display)
convert "$ORIGINAL" -resize 300x300 -quality 85 "assets/candlefish-logo-300.png"

# 75px version (mobile)
convert "$ORIGINAL" -resize 75x75 -quality 85 "assets/candlefish-logo-75.png"

# Optimize PNGs with pngquant
echo "Optimizing PNG files..."
for file in assets/candlefish-logo-*.png; do
    pngquant --quality=65-80 --force --output "$file" "$file"
done

# Create WebP versions
echo "Creating WebP versions..."
cwebp -q 85 "assets/candlefish-logo-150.png" -o "assets/candlefish-logo-150.webp"
cwebp -q 85 "assets/candlefish-logo-300.png" -o "assets/candlefish-logo-300.webp"
cwebp -q 85 "assets/candlefish-logo-75.png" -o "assets/candlefish-logo-75.webp"

# Create a favicon
echo "Creating favicon..."
convert "$ORIGINAL" -resize 32x32 "assets/favicon-32x32.png"
convert "$ORIGINAL" -resize 16x16 "assets/favicon-16x16.png"
convert "assets/favicon-16x16.png" "assets/favicon-32x32.png" "assets/favicon.ico"

# Create Apple touch icon
convert "$ORIGINAL" -resize 180x180 "assets/apple-touch-icon.png"

# Report file sizes
echo ""
echo "Optimization complete! File sizes:"
echo "=================================="
for file in assets/*; do
    if [ -f "$file" ]; then
        SIZE=$(stat -f%z "$file" 2>/dev/null || stat -c%s "$file" 2>/dev/null)
        printf "%-40s %10s KB\n" "$(basename "$file")" "$((SIZE / 1024))"
    fi
done

# Calculate total savings
TOTAL_NEW_SIZE=$(find assets -name "candlefish-logo-150.*" -exec stat -f%z {} \; 2>/dev/null | head -1)
if [ -z "$TOTAL_NEW_SIZE" ]; then
    TOTAL_NEW_SIZE=$(find assets -name "candlefish-logo-150.*" -exec stat -c%s {} \; 2>/dev/null | head -1)
fi

SAVINGS=$(( (ORIGINAL_SIZE - TOTAL_NEW_SIZE) * 100 / ORIGINAL_SIZE ))
echo ""
echo "Size reduction for 150px image: ${SAVINGS}%"
echo ""
echo "Next steps:"
echo "1. Update HTML files to use optimized images"
echo "2. Implement <picture> element for WebP support"
echo "3. Add width and height attributes to prevent layout shift"
echo "4. Configure server to serve WebP to supported browsers"
