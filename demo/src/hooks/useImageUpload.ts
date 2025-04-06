import { useState } from 'react';

interface UseImageUploadResult {
  uploadedImage: HTMLImageElement | null;
  isUploading: boolean;
  uploadError: string | null;
  loadImage: (file: File) => Promise<HTMLImageElement>;
  clearImage: () => void;
}

export function useImageUpload(): UseImageUploadResult {
  const [uploadedImage, setUploadedImage] = useState<HTMLImageElement | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const loadImage = async (file: File): Promise<HTMLImageElement> => {
    if (!file || !file.type.match('image.*')) {
      setUploadError('O arquivo selecionado não é uma imagem válida.');
      return Promise.reject('Arquivo inválido');
    }

    setIsUploading(true);
    setUploadError(null);

    try {
      const img = new Image();
      const url = URL.createObjectURL(file);
      
      const loadPromise = new Promise<HTMLImageElement>((resolve, reject) => {
        img.onload = () => {
          setUploadedImage(img);
          setIsUploading(false);
          resolve(img);
        };
        
        img.onerror = () => {
          setUploadError('Erro ao carregar a imagem.');
          setIsUploading(false);
          URL.revokeObjectURL(url);
          reject('Erro ao carregar imagem');
        };
      });
      
      img.src = url;
      return loadPromise;
    } catch (error) {
      setUploadError('Erro ao processar a imagem.');
      setIsUploading(false);
      return Promise.reject(error);
    }
  };

  const clearImage = () => {
    if (uploadedImage && uploadedImage.src) {
      URL.revokeObjectURL(uploadedImage.src);
    }
    setUploadedImage(null);
    setUploadError(null);
  };

  return {
    uploadedImage,
    isUploading,
    uploadError,
    loadImage,
    clearImage
  };
} 