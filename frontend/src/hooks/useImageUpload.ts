import { useState, useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { api } from '../lib/api';
import type { UploadedImage } from '../components/common/ImageUpload';

// Re-export UploadedImage type for convenience
export type { UploadedImage } from '../components/common/ImageUpload';

interface UploadResponse {
  success: boolean;
  data?: {
    url: string;
    filename: string;
    originalName: string;
    size: number;
    mimetype: string;
  };
  message?: string;
}

interface UseImageUploadOptions {
  endpoint?: string;
  category?: 'gallery' | 'services' | 'parts' | 'issues' | 'temp';
  onSuccess?: (response: UploadResponse) => void;
  onError?: (error: string) => void;
  invalidateQueries?: string[];
}

export const useImageUpload = (options: UseImageUploadOptions = {}) => {
  const {
    endpoint = '/upload/image',
    category = 'temp',
    onSuccess,
    onError,
    invalidateQueries = []
  } = options;

  const queryClient = useQueryClient();
  const [uploadProgress, setUploadProgress] = useState<number>(0);

  // Single image upload mutation
  const uploadMutation = useMutation({
    mutationFn: async (file: File): Promise<UploadResponse> => {
      const formData = new FormData();
      formData.append('image', file);

      // Send category as query parameter for multer to access in destination callback
      const url = `${endpoint}?category=${encodeURIComponent(category)}`;

      const response = await api.post(url, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(progress);
          }
        },
      });

      return response.data;
    },
    onSuccess: (response) => {
      setUploadProgress(0);
      onSuccess?.(response);
      
      // Invalidate specified queries
      invalidateQueries.forEach(queryKey => {
        queryClient.invalidateQueries({ queryKey: [queryKey] });
      });
    },
    onError: (error: any) => {
      setUploadProgress(0);
      const errorMessage = error.response?.data?.message || error.message || 'Upload failed';
      onError?.(errorMessage);
      toast.error(errorMessage);
    },
  });

  // Multiple images upload mutation
  const uploadMultipleMutation = useMutation({
    mutationFn: async (files: File[]): Promise<UploadResponse[]> => {
      const formData = new FormData();
      files.forEach((file) => {
        formData.append('images', file);
      });

      // Send category as query parameter for multer to access in destination callback
      const url = `/upload/multiple?category=${encodeURIComponent(category)}`;

      const response = await api.post(url, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(progress);
          }
        },
      });

      return response.data;
    },
    onSuccess: () => {
      setUploadProgress(0);
      
      // Invalidate specified queries
      invalidateQueries.forEach(queryKey => {
        queryClient.invalidateQueries({ queryKey: [queryKey] });
      });
    },
    onError: (error: any) => {
      setUploadProgress(0);
      const errorMessage = error.response?.data?.message || error.message || 'Upload failed';
      onError?.(errorMessage);
      toast.error(errorMessage);
    },
  });

  // Upload single image
  const uploadImage = useCallback(async (file: File): Promise<string> => {
    const response = await uploadMutation.mutateAsync(file);
    if (response.success && response.data) {
      return response.data.url;
    }
    throw new Error(response.message || 'Upload failed');
  }, [uploadMutation]);

  // Upload multiple images
  const uploadImages = useCallback(async (files: File[]): Promise<string[]> => {
    const responses = await uploadMultipleMutation.mutateAsync(files);
    return responses
      .filter(response => response.success && response.data)
      .map(response => response.data!.url);
  }, [uploadMultipleMutation]);

  // Convert UploadedImage to API format
  const processUploadedImages = useCallback(async (images: UploadedImage[]): Promise<string[]> => {
    const filesToUpload = images.filter(img => img.file);
    const existingUrls = images.filter(img => !img.file).map(img => img.url);

    if (filesToUpload.length === 0) {
      return existingUrls;
    }

    const uploadedUrls = await uploadImages(filesToUpload.map(img => img.file!));
    return [...existingUrls, ...uploadedUrls];
  }, [uploadImages]);

  // Delete image
  const deleteImageMutation = useMutation({
    mutationFn: async (imageUrl: string): Promise<void> => {
      await api.delete('/upload/image', {
        data: { url: imageUrl }
      });
    },
    onSuccess: () => {
      // Invalidate specified queries
      invalidateQueries.forEach(queryKey => {
        queryClient.invalidateQueries({ queryKey: [queryKey] });
      });
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || error.message || 'Delete failed';
      toast.error(errorMessage);
    },
  });

  const deleteImage = useCallback(async (imageUrl: string): Promise<void> => {
    await deleteImageMutation.mutateAsync(imageUrl);
    toast.success('Image deleted successfully');
  }, [deleteImageMutation]);

  return {
    // Upload functions
    uploadImage,
    uploadImages,
    processUploadedImages,
    deleteImage,
    
    // State
    isUploading: uploadMutation.isPending || uploadMultipleMutation.isPending,
    isDeleting: deleteImageMutation.isPending,
    uploadProgress,
    
    // Mutations (for advanced usage)
    uploadMutation,
    uploadMultipleMutation,
    deleteImageMutation,
  };
};

// Utility functions for image handling
export const imageUtils = {
  // Validate image file
  validateImage: (file: File, options: {
    maxSize?: number; // in MB
    allowedTypes?: string[];
    minWidth?: number;
    minHeight?: number;
    maxWidth?: number;
    maxHeight?: number;
  } = {}): Promise<{ valid: boolean; error?: string }> => {
    const {
      maxSize = 10,
      allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
      minWidth = 100,
      minHeight = 100,
      maxWidth = 4000,
      maxHeight = 4000
    } = options;

    return new Promise((resolve) => {
      // Check file type
      if (!allowedTypes.includes(file.type)) {
        resolve({
          valid: false,
          error: `Invalid file type. Allowed types: ${allowedTypes.join(', ')}`
        });
        return;
      }

      // Check file size
      const fileSizeMB = file.size / (1024 * 1024);
      if (fileSizeMB > maxSize) {
        resolve({
          valid: false,
          error: `File too large. Maximum size: ${maxSize}MB`
        });
        return;
      }

      // Check image dimensions
      const img = new Image();
      img.onload = () => {
        if (img.width < minWidth || img.height < minHeight) {
          resolve({
            valid: false,
            error: `Image too small. Minimum dimensions: ${minWidth}x${minHeight}px`
          });
          return;
        }

        if (img.width > maxWidth || img.height > maxHeight) {
          resolve({
            valid: false,
            error: `Image too large. Maximum dimensions: ${maxWidth}x${maxHeight}px`
          });
          return;
        }

        resolve({ valid: true });
      };

      img.onerror = () => {
        resolve({
          valid: false,
          error: 'Invalid image file'
        });
      };

      img.src = URL.createObjectURL(file);
    });
  },

  // Resize image
  resizeImage: (file: File, options: {
    maxWidth?: number;
    maxHeight?: number;
    quality?: number;
    format?: 'jpeg' | 'png' | 'webp';
  } = {}): Promise<File> => {
    const {
      maxWidth = 1920,
      maxHeight = 1080,
      quality = 0.8,
      format = 'jpeg'
    } = options;

    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        // Calculate new dimensions
        let { width, height } = img;
        
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
        
        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }

        // Set canvas dimensions
        canvas.width = width;
        canvas.height = height;

        // Draw and resize image
        ctx?.drawImage(img, 0, 0, width, height);

        // Convert to blob
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const resizedFile = new File([blob], file.name, {
                type: `image/${format}`,
                lastModified: Date.now()
              });
              resolve(resizedFile);
            } else {
              reject(new Error('Failed to resize image'));
            }
          },
          `image/${format}`,
          quality
        );
      };

      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = URL.createObjectURL(file);
    });
  },

  // Generate thumbnail
  generateThumbnail: (file: File, size: number = 300): Promise<string> => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        // Set canvas to square thumbnail size
        canvas.width = size;
        canvas.height = size;

        // Calculate crop dimensions for square aspect ratio
        const minDimension = Math.min(img.width, img.height);
        const cropX = (img.width - minDimension) / 2;
        const cropY = (img.height - minDimension) / 2;

        // Draw cropped and resized image
        ctx?.drawImage(
          img,
          cropX, cropY, minDimension, minDimension,
          0, 0, size, size
        );

        // Convert to data URL
        const thumbnailUrl = canvas.toDataURL('image/jpeg', 0.8);
        resolve(thumbnailUrl);
      };

      img.onerror = () => reject(new Error('Failed to generate thumbnail'));
      img.src = URL.createObjectURL(file);
    });
  },

  // Convert file to base64
  fileToBase64: (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  },

  // Format file size
  formatFileSize: (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  },

  // Get image dimensions
  getImageDimensions: (file: File): Promise<{ width: number; height: number }> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve({ width: img.width, height: img.height });
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = URL.createObjectURL(file);
    });
  }
};

export default useImageUpload;