import React, { createContext, useState, useContext, useEffect, useCallback, ReactNode } from 'react';
import { mediapipeFace, FaceAPI } from '@the-horizon-dev/fast-face-detection';

interface DetectionOptions {
  scoreThreshold?: number;
  maxFaces?: number;
  enableTracking?: boolean;
}

interface FaceDetection {
  detection: {
    box: {
      x: number;
      y: number;
      width: number;
      height: number;
    };
    score: number;
  };
  landmarks?: {
    positions: Array<{ x: number; y: number }>;
  };
}

interface FaceDetectionContextType {
  // Estado
  mediaStream: MediaStream | null;
  faceAPI: FaceAPI | null;
  detectionOptions: DetectionOptions;
  isProcessing: boolean;
  facesDetected: FaceDetection[];
  processingTime: number;
  showLandmarks: boolean;
  
  // Métodos
  setDetectionOptions: (options: DetectionOptions) => void;
  setShowLandmarks: (show: boolean) => void;
  startCamera: () => Promise<void>;
  stopCamera: () => void;
  toggleCamera: () => Promise<void>;
  takePhoto: () => void;
  processImage: (input: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement) => Promise<void>;
  handleImageUpload: (file: File) => Promise<void>;
}

const FaceDetectionContext = createContext<FaceDetectionContextType | undefined>(undefined);

export function FaceDetectionProvider({ children }: { children: ReactNode }) {
  // Estado para armazenar a stream de vídeo
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  
  // Estado para a API de detecção facial
  const [faceAPI, setFaceAPI] = useState<FaceAPI | null>(null);
  
  // Estado para opções de detecção
  const [detectionOptions, setDetectionOptions] = useState<DetectionOptions>({
    scoreThreshold: 0.5,
    maxFaces: 5
  });
  
  // Estado para processamento
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Estado para resultados da detecção
  const [facesDetected, setFacesDetected] = useState<FaceDetection[]>([]);
  
  // Estado para tempo de processamento
  const [processingTime, setProcessingTime] = useState(0);
  
  // Estado para exibir landmarks
  const [showLandmarks, setShowLandmarks] = useState(true);

  // Inicializar API de detecção facial
  useEffect(() => {
    initFaceAPI();
  }, []);

  // Atualizar opções quando mudam
  useEffect(() => {
    if (faceAPI) {
      faceAPI.updateOptions(detectionOptions);
    }
  }, [detectionOptions, faceAPI]);

  // Inicializar a API
  async function initFaceAPI() {
    try {
      setFaceAPI(null); // Limpar qualquer instância anterior
      
      console.log('Inicializando FaceAPI...');
      const api = new FaceAPI(detectionOptions);
      
      // Garantir que um detector é inicializado testando uma pequena amostra
      const testCanvas = document.createElement('canvas');
      testCanvas.width = 100;
      testCanvas.height = 100;
      const ctx = testCanvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, 100, 100);
      }
      
      // Tentar uma detecção simples para verificar se está tudo configurado
      await api.detectFaces(testCanvas);
      
      setFaceAPI(api);
      console.log('FaceAPI inicializada com sucesso');
    } catch (error) {
      console.error('Erro ao inicializar FaceAPI:', error);
      // Tentar novamente após um delay se falhar por problemas de carregamento
      setTimeout(() => {
        initFaceAPI();
      }, 3000);
    }
  }

  // Iniciar câmera
  const startCamera = async () => {
    try {
      const constraints = {
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        }
      };
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      setMediaStream(stream);
      setIsProcessing(true);
      
      return Promise.resolve();
    } catch (error) {
      console.error('Erro ao acessar câmera:', error);
      return Promise.reject(error);
    }
  };

  // Parar câmera
  const stopCamera = () => {
    if (mediaStream) {
      mediaStream.getTracks().forEach(track => track.stop());
      setMediaStream(null);
      setIsProcessing(false);
    }
  };

  // Alternar câmera
  const toggleCamera = async () => {
    if (mediaStream) {
      stopCamera();
    } else {
      await startCamera();
    }
  };

  // Tirar foto
  const takePhoto = () => {
    setIsProcessing(false);
    // O processamento da foto será feito pelo VideoDisplay
    setTimeout(() => {
      setIsProcessing(true);
    }, 1000);
  };

  // Processar imagem
  const processImage = async (input: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement) => {
    if (!faceAPI) {
      console.warn('FaceAPI não está inicializada ainda');
      return;
    }
    
    const startTime = performance.now();
    let faces;
    
    try {
      if (showLandmarks) {
        faces = await faceAPI.detectFacesWithLandmarks(input);
      } else {
        faces = await faceAPI.detectFaces(input);
      }
      
      const endTime = performance.now();
      setProcessingTime(Math.round(endTime - startTime));
      setFacesDetected(faces);
      
    } catch (error) {
      console.error('Erro na detecção:', error);
      setFacesDetected([]);
      
      // Se houver erro persistente, pode ser problema com a inicialização da API
      if (processImage.toString().includes('Error')) {
        console.warn('Tentando reinicializar a API após erro de detecção');
        initFaceAPI();
      }
    }
  };

  // Carregar e processar imagem
  const handleImageUpload = async (file: File) => {
    if (!file || !file.type.match('image.*')) return Promise.reject('Arquivo inválido');
    
    // Parar a câmera se estiver ligada
    stopCamera();
    
    try {
      const img = new Image();
      img.src = URL.createObjectURL(file);
      
      return new Promise<void>((resolve, reject) => {
        img.onload = async () => {
          await processImage(img);
          resolve();
        };
        img.onerror = reject;
      });
    } catch (error) {
      console.error('Erro ao processar imagem:', error);
      return Promise.reject(error);
    }
  };

  return (
    <FaceDetectionContext.Provider 
      value={{
        mediaStream,
        faceAPI,
        detectionOptions,
        isProcessing,
        facesDetected,
        processingTime,
        showLandmarks,
        setDetectionOptions,
        setShowLandmarks,
        startCamera,
        stopCamera,
        toggleCamera,
        takePhoto,
        processImage,
        handleImageUpload
      }}
    >
      {children}
    </FaceDetectionContext.Provider>
  );
}

export function useFaceDetection() {
  const context = useContext(FaceDetectionContext);
  if (context === undefined) {
    throw new Error('useFaceDetection must be used within a FaceDetectionProvider');
  }
  return context;
} 