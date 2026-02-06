import React, { useState, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Upload, 
  X, 
  AlertCircle, 
  Check,
  Loader2,
  Plus,
  Eye,
  Trash2
} from 'lucide-react';
import { toast } from 'react-hot-toast';

export interface UploadedImage {
  id: string;
  file?: File;
  url: string;
  name: string;
  size: number;
  type: string;
  preview?: string;
}

interface ImageUploadProps {
  // Basic props
  value?: UploadedImage | UploadedImage[];
  onChange: (images: UploadedImage | UploadedImage[] | null) => void;
  
  // Configuration
  multiple?: boolean;
  maxFiles?: number;
  maxSize?: number; // in MB
  acceptedTypes?: string[];
  
  // UI customization
  className?: string;
  placeholder?: string;
  showPreview?: boolean;
  previewSize?: 'sm' | 'md' | 'lg';
  
  // Validation
  required?: boolean;
  disabled?: boolean;
  
  // Callbacks
  onUploadStart?: () => void;
  onUploadComplete?: (images: UploadedImage[]) => void;
  onUploadError?: (error: string) => void;
  onRemove?: (image: UploadedImage) => void;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  value,
  onChange,
  multiple = false,
  maxFiles = 5,
  maxSize = 10, // 10MB default
  acceptedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  className = '',
  placeholder,
  showPreview = true,
  previewSize = 'md',
  required = false,
  disabled = false,
  onUploadStart,
  onUploadComplete,
  onUploadError,
  onRemove
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Convert value to array for consistent handling
  const images: UploadedImage[] = useMemo(() => {
    return Array.isArray(value) ? value : (value ? [value] : []);
  }, [value]);

  // Size classes for preview
  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32'
  };

  // Validate file
  const validateFile = useCallback((file: File): string | null => {
    // Check file type
    if (!acceptedTypes.includes(file.type)) {
      return `Invalid file type. Accepted types: ${acceptedTypes.join(', ')}`;
    }

    // Check file size
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > maxSize) {
      return `File too large. Maximum size: ${maxSize}MB`;
    }

    // Check max files limit
    if (multiple && images.length >= maxFiles) {
      return `Maximum ${maxFiles} files allowed`;
    }

    return null;
  }, [acceptedTypes, maxSize, maxFiles, images.length, multiple]);

  // Create image object from file
  const createImageObject = useCallback((file: File): Promise<UploadedImage> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => {
        resolve({
          id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          file,
          url: reader.result as string,
          name: file.name,
          size: file.size,
          type: file.type,
          preview: reader.result as string
        });
      };
      reader.readAsDataURL(file);
    });
  }, []);

  // Handle file selection
  const handleFiles = useCallback(async (files: FileList) => {
    if (disabled) return;

    const fileArray = Array.from(files);
    const validFiles: File[] = [];
    
    // Validate each file
    for (const file of fileArray) {
      const error = validateFile(file);
      if (error) {
        toast.error(error);
        onUploadError?.(error);
        continue;
      }
      validFiles.push(file);
    }

    if (validFiles.length === 0) return;

    setIsUploading(true);
    onUploadStart?.();

    try {
      // Create image objects
      const newImages = await Promise.all(
        validFiles.map(file => createImageObject(file))
      );

      // Update value based on multiple prop
      if (multiple) {
        const updatedImages = [...images, ...newImages];
        onChange(updatedImages as UploadedImage[]);
        onUploadComplete?.(newImages);
      } else {
        onChange(newImages[0]);
        onUploadComplete?.(newImages);
      }

      toast.success(`${newImages.length} image(s) uploaded successfully`);
    } catch {
      const errorMessage = 'Failed to process images';
      toast.error(errorMessage);
      onUploadError?.(errorMessage);
    } finally {
      setIsUploading(false);
    }
  }, [disabled, validateFile, images, multiple, onChange, onUploadStart, onUploadComplete, onUploadError, createImageObject]);

  // Handle drag events
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) setIsDragOver(true);
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    if (disabled) return;
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFiles(files);
    }
  }, [disabled, handleFiles]);

  // Handle file input change
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFiles(files);
    }
    // Reset input value to allow selecting the same file again
    e.target.value = '';
  }, [handleFiles]);

  // Remove image
  const removeImage = useCallback((imageToRemove: UploadedImage) => {
    if (disabled) return;

    if (multiple) {
      const updatedImages = images.filter(img => img.id !== imageToRemove.id);
      onChange(updatedImages.length > 0 ? (updatedImages as UploadedImage[]) : null);
    } else {
      onChange(null);
    }

    onRemove?.(imageToRemove);
    toast.success('Image removed');
  }, [disabled, multiple, images, onChange, onRemove]);

  // Open file dialog
  const openFileDialog = useCallback(() => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, [disabled]);

  // Preview image in modal
  const openPreview = useCallback((image: UploadedImage) => {
    setPreviewImage(image.url);
  }, []);

  const closePreview = useCallback(() => {
    setPreviewImage(null);
  }, []);

  return (
    <>
      <div className={`space-y-4 ${className}`}>
        {/* Upload Area */}
        <div
          className={`
            relative border-2 border-dashed rounded-lg p-6 text-center transition-all duration-200
            ${isDragOver 
              ? 'border-primary-500 bg-primary-50' 
              : 'border-gray-300 hover:border-gray-400'
            }
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            ${isUploading ? 'pointer-events-none' : ''}
          `}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={openFileDialog}
        >
          <input
            ref={fileInputRef}
            type="file"
            className="sr-only"
            accept={acceptedTypes.join(',')}
            multiple={multiple}
            onChange={handleInputChange}
            disabled={disabled}
          />

          {isUploading ? (
            <div className="space-y-2">
              <Loader2 className="mx-auto h-12 w-12 text-primary-600 animate-spin" />
              <p className="text-sm text-gray-600">Uploading images...</p>
            </div>
          ) : (
            <div className="space-y-2">
              <Upload className="mx-auto h-12 w-12 text-gray-400" />
              <div className="text-sm text-gray-600">
                <span className="font-medium text-primary-600">
                  {placeholder || 'Click to upload'}
                </span>
                {' or drag and drop'}
              </div>
              <p className="text-xs text-gray-500">
                {acceptedTypes.map(type => type.split('/')[1]).join(', ').toUpperCase()} 
                {' '}up to {maxSize}MB
                {multiple && ` (max ${maxFiles} files)`}
              </p>
            </div>
          )}

          {required && images.length === 0 && (
            <div className="absolute top-2 right-2">
              <AlertCircle className="h-4 w-4 text-red-500" />
            </div>
          )}
        </div>

        {/* Image Previews */}
        {showPreview && images.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-700">
              Uploaded Images ({images.length})
            </h4>
            
            <div className={`grid gap-3 ${
              multiple 
                ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6' 
                : 'grid-cols-1 max-w-xs'
            }`}>
              <AnimatePresence>
                {images.map((image) => (
                  <motion.div
                    key={image.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="relative group"
                  >
                    <div className={`
                      relative ${sizeClasses[previewSize]} rounded-lg overflow-hidden 
                      border border-gray-200 bg-gray-50
                    `}>
                      <img
                        src={image.url}
                        alt={image.name}
                        className="w-full h-full object-cover"
                      />
                      
                      {/* Overlay */}
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-200 flex items-center justify-center">
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex space-x-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openPreview(image);
                            }}
                            className="p-1 bg-white rounded-full text-gray-700 hover:text-primary-600 transition-colors"
                            title="Preview"
                          >
                            <Eye className="h-3 w-3" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              removeImage(image);
                            }}
                            className="p-1 bg-white rounded-full text-gray-700 hover:text-red-600 transition-colors"
                            title="Remove"
                            disabled={disabled}
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      </div>

                      {/* Success indicator */}
                      {!image.file && (
                        <div className="absolute top-1 right-1">
                          <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                            <Check className="h-2 w-2 text-white" />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Image info */}
                    <div className="mt-1 text-xs text-gray-500 truncate">
                      {image.name}
                    </div>
                    <div className="text-xs text-gray-400">
                      {(image.size / 1024).toFixed(1)} KB
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Add more button for multiple uploads */}
              {multiple && images.length < maxFiles && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={`
                    ${sizeClasses[previewSize]} rounded-lg border-2 border-dashed border-gray-300 
                    flex items-center justify-center cursor-pointer hover:border-primary-500 
                    hover:bg-primary-50 transition-all duration-200
                    ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
                  `}
                  onClick={openFileDialog}
                >
                  <Plus className="h-6 w-6 text-gray-400" />
                </motion.div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Preview Modal */}
      <AnimatePresence>
        {previewImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-75"
            onClick={closePreview}
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              className="relative max-w-4xl max-h-full"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={closePreview}
                className="absolute top-4 right-4 z-10 p-2 bg-black bg-opacity-50 rounded-full text-white hover:bg-opacity-75 transition-all"
              >
                <X className="h-5 w-5" />
              </button>
              
              <img
                src={previewImage}
                alt="Preview"
                className="max-w-full max-h-full object-contain rounded-lg"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export { ImageUpload };
export default ImageUpload;