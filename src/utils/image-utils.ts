import { Box, Point } from '../types/types';

/**
 * Classe com utilitários para manipulação de imagens e resultados de detecção
 */
export class ImageUtils {
  /**
   * Recorta uma face de uma imagem a partir da caixa delimitadora
   */
  public static cropFace(
    canvas: HTMLCanvasElement,
    box: Box,
    margin: number = 0
  ): HTMLCanvasElement {
    const { x, y, width, height } = box;
    
    // Aplicar margem (com limites para não ultrapassar as bordas)
    const marginX = width * margin;
    const marginY = height * margin;
    
    const offsetX = Math.max(0, x - marginX);
    const offsetY = Math.max(0, y - marginY);
    const cropWidth = Math.min(canvas.width - offsetX, width + 2 * marginX);
    const cropHeight = Math.min(canvas.height - offsetY, height + 2 * marginY);
    
    // Criar canvas para a face recortada
    const faceCanvas = document.createElement('canvas');
    faceCanvas.width = cropWidth;
    faceCanvas.height = cropHeight;
    
    // Recortar a região da face
    const ctx = faceCanvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(
        canvas,
        offsetX, offsetY, cropWidth, cropHeight,
        0, 0, cropWidth, cropHeight
      );
    }
    
    return faceCanvas;
  }
  
  /**
   * Desenha as landmarks faciais em um canvas
   */
  public static drawLandmarks(
    canvas: HTMLCanvasElement,
    points: Point[],
    color: string = 'rgba(0, 255, 0, 0.8)',
    size: number = 2
  ): void {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.fillStyle = color;
    
    points.forEach(point => {
      ctx.beginPath();
      ctx.arc(point.x, point.y, size, 0, 2 * Math.PI);
      ctx.fill();
    });
  }
  
  /**
   * Desenha uma caixa delimitadora em um canvas
   */
  public static drawBox(
    canvas: HTMLCanvasElement,
    box: Box,
    color: string = 'rgba(0, 255, 0, 0.8)',
    lineWidth: number = 2
  ): void {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const { x, y, width, height } = box;
    
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.strokeRect(x, y, width, height);
  }
  
  /**
   * Converte uma imagem ou vídeo para canvas
   */
  public static elementToCanvas(
    element: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement
  ): HTMLCanvasElement {
    // Se já é um canvas, apenas retornamos
    if (element instanceof HTMLCanvasElement) {
      return element;
    }
    
    // Criamos um novo canvas
    const canvas = document.createElement('canvas');
    
    // Definimos as dimensões baseadas no tipo do elemento
    if (element instanceof HTMLVideoElement) {
      canvas.width = element.videoWidth;
      canvas.height = element.videoHeight;
    } else {
      canvas.width = element.width;
      canvas.height = element.height;
    }
    
    // Desenhamos o elemento no canvas
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(element, 0, 0);
    }
    
    return canvas;
  }
} 