import React, { useRef, useEffect } from 'react';
import { useFaceDetection } from '../context/FaceDetectionContext';

const VideoDisplay = () => {
  const { 
    mediaStream, 
    isProcessing, 
    facesDetected,
    showLandmarks,
    processImage
  } = useFaceDetection();
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Conectar o vídeo ao MediaStream quando disponível
  useEffect(() => {
    const videoElement = videoRef.current;
    if (videoElement && mediaStream) {
      videoElement.srcObject = mediaStream;
      videoElement.onloadedmetadata = () => {
        videoElement.play();
      };
    }
  }, [mediaStream]);
  
  // Redimensionar o canvas quando o vídeo carregar
  useEffect(() => {
    const videoElement = videoRef.current;
    const canvasElement = canvasRef.current;
    
    if (videoElement && canvasElement && mediaStream) {
      const handleVideoMetadata = () => {
        canvasElement.width = videoElement.videoWidth;
        canvasElement.height = videoElement.videoHeight;
      };
      
      videoElement.addEventListener('loadedmetadata', handleVideoMetadata);
      
      return () => {
        videoElement.removeEventListener('loadedmetadata', handleVideoMetadata);
      };
    }
  }, [mediaStream]);
  
  // Processar frames do vídeo
  useEffect(() => {
    if (!isProcessing || !mediaStream || !videoRef.current) return;
    
    let animationFrame: number;
    let lastProcessed = 0;
    const PROCESS_INTERVAL = 100; // Limitar para 10 FPS para melhor performance
    
    const processVideoFrame = async (timestamp: number) => {
      if (videoRef.current) {
        // Limitar a taxa de processamento para não sobrecarregar
        if (timestamp - lastProcessed >= PROCESS_INTERVAL) {
          await processImage(videoRef.current);
          lastProcessed = timestamp;
        }
      }
      
      if (isProcessing) {
        animationFrame = requestAnimationFrame(processVideoFrame);
      }
    };
    
    animationFrame = requestAnimationFrame(processVideoFrame);
    
    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [isProcessing, mediaStream, processImage]);
  
  // Renderizar detecções no canvas
  useEffect(() => {
    const canvasElement = canvasRef.current;
    const videoElement = videoRef.current;
    
    if (!canvasElement || !videoElement) return;
    
    const ctx = canvasElement.getContext('2d');
    if (!ctx) return;
    
    // Limpar o canvas
    ctx.clearRect(0, 0, canvasElement.width, canvasElement.height);
    
    // Desenhar o vídeo ou a imagem no canvas
    if (mediaStream) {
      ctx.drawImage(videoElement, 0, 0, canvasElement.width, canvasElement.height);
    }
    
    // Desenhar as detecções
    facesDetected.forEach(face => {
      const { box, score } = face.detection;
      
      // Desenhar caixa delimitadora
      ctx.strokeStyle = `rgba(0, 255, 0, ${score})`;
      ctx.lineWidth = 2;
      ctx.strokeRect(box.x, box.y, box.width, box.height);
      
      // Desenhar score
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.fillRect(box.x, box.y - 20, 80, 20);
      ctx.fillStyle = 'white';
      ctx.font = '12px Arial';
      ctx.fillText(`${Math.round(score * 100)}%`, box.x + 5, box.y - 5);
      
      // Desenhar landmarks se disponíveis
      if (face.landmarks && showLandmarks) {
        ctx.fillStyle = 'rgba(255, 0, 0, 0.7)';
        face.landmarks.positions.forEach(point => {
          ctx.beginPath();
          ctx.arc(point.x, point.y, 2, 0, 2 * Math.PI);
          ctx.fill();
        });
      }
    });
  }, [facesDetected, mediaStream, showLandmarks]);
  
  return (
    <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
      <video 
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-contain"
        playsInline
        muted
        autoPlay
      />
      <canvas 
        ref={canvasRef}
        className="absolute inset-0 w-full h-full object-contain z-10"
      />
      
      {!mediaStream && facesDetected.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center text-white">
          <p>Inicie a câmera ou carregue uma imagem para começar a detecção facial</p>
        </div>
      )}
      
      {mediaStream && facesDetected.length === 0 && (
        <div className="absolute top-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded">
          <p>Nenhum rosto detectado</p>
        </div>
      )}
    </div>
  );
};

export default VideoDisplay; 