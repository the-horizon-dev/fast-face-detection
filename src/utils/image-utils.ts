/**
 * Utility functions for image processing
 */
import { Box, Point } from '../types/types';

export class ImageUtils {
  /**
   * Crops a face from an image based on the bounding box
   */
  public static cropFace(
    canvas: HTMLCanvasElement,
    box: Box,
    margin: number = 0
  ): HTMLCanvasElement {
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
    
    return faceCanvas;
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
} 