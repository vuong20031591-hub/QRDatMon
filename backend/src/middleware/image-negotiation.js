/**
 * Image Content Negotiation Middleware
 * Determines optimal image format and size based on client capabilities
 * Requirements: 3.1, 3.2, 3.3, 3.4
 */

// Available sizes in order of preference (smallest to largest)
const SIZE_ORDER = ['thumbnail', 'small', 'medium', 'large', 'original'];
const SIZE_WIDTHS = {
  thumbnail: 150,
  small: 320,
  medium: 640,
  large: 1024,
  original: Infinity
};

/**
 * Parse Accept header to determine preferred image format
 * Priority: AVIF > WebP > JPEG
 * @param {string} acceptHeader - Accept header value
 * @returns {string} Preferred format
 */
const parseAcceptHeader = (acceptHeader) => {
  if (!acceptHeader) return 'jpeg';
  
  const header = acceptHeader.toLowerCase();
  
  // Check for AVIF support (highest priority)
  if (header.includes('image/avif')) {
    return 'avif';
  }
  
  // Check for WebP support
  if (header.includes('image/webp')) {
    return 'webp';
  }
  
  // Default to JPEG
  return 'jpeg';
};

/**
 * Select appropriate size based on requested width
 * Returns smallest size >= requested width, or largest if exceeds all
 * @param {number} requestedWidth - Requested width in pixels
 * @param {Array} availableSizes - Array of available size names
 * @returns {string} Selected size name
 */
const selectSize = (requestedWidth, availableSizes = SIZE_ORDER) => {
  if (!requestedWidth || requestedWidth <= 0) {
    return 'medium'; // Default size
  }
  
  // Find smallest size that is >= requested width
  for (const size of SIZE_ORDER) {
    if (!availableSizes.includes(size)) continue;
    
    if (SIZE_WIDTHS[size] >= requestedWidth) {
      return size;
    }
  }
  
  // If requested exceeds all sizes, return largest available
  for (let i = SIZE_ORDER.length - 1; i >= 0; i--) {
    if (availableSizes.includes(SIZE_ORDER[i])) {
      return SIZE_ORDER[i];
    }
  }
  
  return 'original';
};

/**
 * Content negotiation middleware
 * Adds preferredFormat and preferredSize to request object
 */
const imageNegotiation = (req, res, next) => {
  const acceptHeader = req.get('Accept') || '';
  const widthParam = parseInt(req.query.width || req.query.w, 10);
  
  req.imagePreferences = {
    preferredFormat: parseAcceptHeader(acceptHeader),
    preferredSize: selectSize(widthParam),
    requestedWidth: widthParam || null
  };
  
  next();
};

/**
 * Find best matching variant from available variants
 * @param {Array} variants - Available image variants
 * @param {string} preferredFormat - Preferred format
 * @param {string} preferredSize - Preferred size
 * @returns {Object|null} Best matching variant or null
 */
const findBestVariant = (variants, preferredFormat, preferredSize) => {
  if (!variants || variants.length === 0) return null;
  
  // Try exact match first
  let variant = variants.find(v => 
    v.format === preferredFormat && v.size === preferredSize
  );
  
  if (variant) return variant;
  
  // Try same size with different format (fallback order: webp, jpeg)
  const formatFallback = ['webp', 'jpeg'];
  for (const format of formatFallback) {
    variant = variants.find(v => 
      v.format === format && v.size === preferredSize
    );
    if (variant) return variant;
  }
  
  // Try same format with different size
  const sizeIndex = SIZE_ORDER.indexOf(preferredSize);
  for (let i = sizeIndex; i < SIZE_ORDER.length; i++) {
    variant = variants.find(v => 
      v.format === preferredFormat && v.size === SIZE_ORDER[i]
    );
    if (variant) return variant;
  }
  
  // Return any available variant
  return variants[0];
};

module.exports = {
  imageNegotiation,
  parseAcceptHeader,
  selectSize,
  findBestVariant,
  SIZE_ORDER,
  SIZE_WIDTHS
};
