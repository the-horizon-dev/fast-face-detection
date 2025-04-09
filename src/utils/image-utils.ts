/**
 * Utility functions for image processing
 */
import { Box, Point } from '../types/types';

// Define compatible input types for downscaling
type DownscaleInput = HTMLImageElement | HTMLVideoElement | HTMLCanvasElement;

export class ImageUtils {
  /**
   * Crops a face from an image based on the bounding box
   * @returns An object containing the cropped canvas and the top-left offset used
   */
  public static cropFace(
    canvas: HTMLCanvasElement,
    box: Box,
    margin: number = 0
  ): { croppedCanvas: HTMLCanvasElement; offsetX: number; offsetY: number } {
    const { x, y, width, height } = box;
    
    // Apply margin (with limits to prevent going beyond the edges)
    const marginX = width * margin;
    const marginY = height * margin;
    
    const offsetX = Math.max(0, x - marginX);
    const offsetY = Math.max(0, y - marginY);
    const cropWidth = Math.min(canvas.width - offsetX, width + 2 * marginX);
    const cropHeight = Math.min(canvas.height - offsetY, height + 2 * marginY);
    
    // Create canvas for the cropped face
    const faceCanvas = document.createElement('canvas');
    faceCanvas.width = cropWidth;
    faceCanvas.height = cropHeight;
    
    // Crop the face region
    const ctx = faceCanvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(
        canvas,
        offsetX, offsetY, cropWidth, cropHeight,
        0, 0, cropWidth, cropHeight
      );
    }
    
    return { croppedCanvas: faceCanvas, offsetX, offsetY };
  }
  
  /**
   * Draws facial landmarks on a canvas
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
   * Draws a bounding box on a canvas
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
   * Converts an image or video to canvas
   */
  public static elementToCanvas(
    element: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement
  ): HTMLCanvasElement {
    // If it's already a canvas, just return it
    if (element instanceof HTMLCanvasElement) {
      return element;
    }
    
    // Create a new canvas
    const canvas = document.createElement('canvas');
    
    // Set dimensions based on element type
    if (element instanceof HTMLVideoElement) {
      canvas.width = element.videoWidth;
      canvas.height = element.videoHeight;
    } else {
      canvas.width = element.width;
      canvas.height = element.height;
    }
    
    // Draw the element on the canvas
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(element, 0, 0);
    }
    
    return canvas;
  }
  
  /**
   * Downscales an image element to a target width, maintaining aspect ratio.
   * Only works in browser environments.
   * @param element The input image, video, or canvas.
   * @param targetWidth The desired width for the downscaled image.
   * @returns Object containing the downscaled canvas and the scaling factor used.
   */
  public static downscaleImage(
    element: DownscaleInput,
    targetWidth: number
  ): { downscaledCanvas: HTMLCanvasElement; scaleFactor: number } {
    if (typeof document === 'undefined') {
      throw new Error('Image downscaling is only supported in browser environments.');
    }

    const originalCanvas = this.elementToCanvas(element);
    const originalWidth = originalCanvas.width;
    const originalHeight = originalCanvas.height;

    // If already smaller than target, return original (or copy?)
    if (originalWidth <= targetWidth) {
      // Return a copy to avoid modifying the original if it was a canvas
      const copyCanvas = document.createElement('canvas');
      copyCanvas.width = originalWidth;
      copyCanvas.height = originalHeight;
      const ctx = copyCanvas.getContext('2d');
      if (ctx) {
          ctx.drawImage(originalCanvas, 0, 0);
      }
      return { downscaledCanvas: copyCanvas, scaleFactor: 1 };
    }

    const scaleFactor = targetWidth / originalWidth;
    const targetHeight = Math.round(originalHeight * scaleFactor);

    const downscaledCanvas = document.createElement('canvas');
    downscaledCanvas.width = targetWidth;
    downscaledCanvas.height = targetHeight;

    const ctx = downscaledCanvas.getContext('2d');
    if (ctx) {
      // Use drawImage for built-in browser downscaling (usually decent quality)
      ctx.drawImage(originalCanvas, 0, 0, targetWidth, targetHeight);
    } else {
      throw new Error('Failed to get 2D context for downscaling.');
    }

    return { downscaledCanvas, scaleFactor };
  }
} 