// src/utils/imageUtils.ts

export const getImageUrl = (imagePath: string | undefined | null): string => {
  if (!imagePath) return '/placeholder.svg';
  
  // Handle absolute URLs (external images)
  if (imagePath.startsWith('http')) {
    // Add cache-busting parameter for CORS issues in Chromium browsers
    return `${imagePath}?${new Date().getTime()}`;
  }
  
  // Handle local server paths
  const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
  
  // Normalize path - remove any leading slashes and replace backslashes
  const normalizedPath = imagePath
    .replace(/\\/g, '/')
    .replace(/^\/+/, '');
  
  return `${baseUrl}/${normalizedPath}`;
};

// Make sure this function is properly exported
export const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>): void => {
  const target = e.target as HTMLImageElement;
  console.error('Image failed to load:', target.src);
  
  // Set placeholder image
  target.src = '/placeholder.svg';
  target.onerror = null; // Prevent infinite loop
};

// Optional: Function to get all images for a product gallery
export const getAllImageUrls = (images: string[] | undefined): string[] => {
  if (!images || images.length === 0) return ['/placeholder.svg'];
  
  return images.map(image => getImageUrl(image));
};


// Debug function to check image URLs
export const debugImageUrl = (imagePath: string | undefined | null): string => {
  if (!imagePath) {
    console.log('No image path provided');
    return '/placeholder.svg';
  }
  
  const finalUrl = getImageUrl(imagePath);
  console.log('Image URL debug:', {
    originalPath: imagePath,
    finalUrl: finalUrl,
    isAbsolute: imagePath.startsWith('http'),
    isRelative: !imagePath.startsWith('http')
  });
  
  return finalUrl;
};

// Test if an image URL is accessible
export const testImageUrl = (url: string): Promise<boolean> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = url;
  });
};