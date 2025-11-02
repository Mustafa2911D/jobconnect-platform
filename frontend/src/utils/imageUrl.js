// frontend/src/utils/imageUrl.js
export const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  
  // If it's already a full URL, return as-is
  if (imagePath.startsWith('http')) {
    return imagePath;
  }
  
  // Use environment variable with proper fallback
  const baseUrl = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'https://jobconnect-backend-yyho.onrender.com';
  
  // Handle different image path formats
  if (imagePath.startsWith('uploads/')) {
    return `${baseUrl}/${imagePath}`;
  }
  
  // Default to profile images path
  return `${baseUrl}/uploads/profile-images/${imagePath}`;
};

export default getImageUrl;