import { useRef, useState, ReactNode, useCallback } from 'react';
import { Upload, X, FileText, Image, File, AlertCircle, CheckCircle } from 'lucide-react';

interface FileUploadProps {
  onFileSelect?: (file: File) => void;
  onFileRemove?: () => void;
  onUploadSuccess?: (result: any) => void;
  onUploadError?: (error: string) => void;
  accept?: string;
  multiple?: boolean;
  maxSize?: number; // MB cinsinden
  className?: string;
  disabled?: boolean;
  children?: ReactNode;
  showPreview?: boolean;
}

export function FileUpload({
  onFileSelect,
  onFileRemove,
  onUploadSuccess,
  onUploadError,
  accept = '.pdf,.jpg,.jpeg,.png,.txt',
  multiple = false,
  maxSize = 10,
  className = '',
  disabled = false,
  children,
  showPreview = true
}: FileUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string>('');
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const inputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): boolean => {
    setError('');
    setUploadSuccess(false);

    // Dosya boyutu kontrolü
    if (file.size > maxSize * 1024 * 1024) {
      const errorMsg = `Dosya boyutu ${maxSize}MB'dan büyük olamaz (Mevcut: ${(file.size / 1024 / 1024).toFixed(2)}MB)`;
      setError(errorMsg);
      onUploadError?.(errorMsg);
      return false;
    }

    // Dosya tipi kontrolü
    if (accept) {
      const acceptedTypes = accept.split(',').map(type => type.trim());
      const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
      
      if (!acceptedTypes.includes(fileExtension)) {
        const errorMsg = `Desteklenen dosya tipleri: ${accept}`;
        setError(errorMsg);
        onUploadError?.(errorMsg);
        return false;
      }
    }

    // Dosya ismi kontrolü
    if (file.name.length > 255) {
      const errorMsg = 'Dosya ismi çok uzun (max 255 karakter)';
      setError(errorMsg);
      onUploadError?.(errorMsg);
      return false;
    }

    return true;
  };

  const handleFileSelect = useCallback((file: File) => {
    if (validateFile(file)) {
      setSelectedFile(file);
      setUploadSuccess(true);
      
      // Preview URL oluştur (sadece resim dosyaları için)
      if (showPreview && file.type.startsWith('image/')) {
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
      }
      
      onFileSelect?.(file);
      onUploadSuccess?.(file);
    }
  }, [onFileSelect, onUploadSuccess, showPreview, validateFile]);

  const handleFileRemove = useCallback(() => {
    setSelectedFile(null);
    setError('');
    setUploadSuccess(false);
    
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl('');
    }
    
    onFileRemove?.();
    
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  }, [onFileRemove, previewUrl]);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (disabled) return;

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFileSelect(files[0]);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      handleFileSelect(files[0]);
    }
  };

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension || '')) {
      return <Image size={20} />;
    } else if (['pdf'].includes(extension || '')) {
      return <FileText size={20} />;
    } else {
      return <File size={20} />;
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={`w-full ${className}`}>
      {!selectedFile ? (
        <div
          className={`
            relative border-2 border-dashed rounded-lg p-6 transition-colors
            ${dragActive 
              ? 'border-primary-500 bg-primary-50' 
              : 'border-gray-300 hover:border-gray-400'
            }
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          `}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => !disabled && inputRef.current?.click()}
        >
          <input
            ref={inputRef}
            type="file"
            accept={accept}
            multiple={multiple}
            onChange={handleInputChange}
            disabled={disabled}
            className="hidden"
          />
          
          <div className="text-center">
            <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            {children || (
              <>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Dosya Yükle
                </h3>
                <p className="text-gray-600 mb-2">
                  Dosyayı sürükleyip bırakın veya seçmek için tıklayın
                </p>
                <p className="text-sm text-gray-500">
                  Desteklenen formatlar: {accept}
                </p>
                <p className="text-sm text-gray-500">
                  Maksimum boyut: {maxSize}MB
                </p>
              </>
            )}
          </div>
        </div>
      ) : (
        <div className="border border-gray-300 rounded-lg bg-gray-50">
          {/* File Info Section */}
          <div className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`text-${uploadSuccess ? 'green' : 'primary'}-600`}>
                  {uploadSuccess ? <CheckCircle size={20} /> : getFileIcon(selectedFile.name)}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {selectedFile.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatFileSize(selectedFile.size)}
                  </p>
                  {uploadSuccess && (
                    <p className="text-xs text-green-600 font-medium">
                      ✓ Dosya başarıyla seçildi
                    </p>
                  )}
                </div>
              </div>
              <button
                onClick={handleFileRemove}
                className="text-gray-400 hover:text-red-500 transition-colors"
                disabled={disabled}
                aria-label="Dosyayı kaldır"
              >
                <X size={20} />
              </button>
            </div>
          </div>
          
          {/* Preview Section */}
          {showPreview && previewUrl && (
            <div className="border-t border-gray-200 p-4">
              <p className="text-sm font-medium text-gray-700 mb-2">Önizleme:</p>
              <img 
                src={previewUrl} 
                alt="Dosya önizleme"
                className="max-w-full h-32 object-contain rounded border"
                onError={() => setPreviewUrl('')}
              />
            </div>
          )}
        </div>
      )}
      
      {error && (
        <div className="mt-2 p-3 bg-red-50 border-l-4 border-red-400 rounded">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
            <p className="text-sm text-red-700 font-medium">
              {error}
            </p>
          </div>
        </div>
      )}
      
      {uploadSuccess && !error && (
        <div className="mt-2 p-3 bg-green-50 border-l-4 border-green-400 rounded">
          <div className="flex items-center">
            <CheckCircle className="h-5 w-5 text-green-400 mr-2" />
            <p className="text-sm text-green-700 font-medium">
              Dosya başarıyla seçildi ve doğrulandı!
            </p>
          </div>
        </div>
      )}
    </div>
  );
}