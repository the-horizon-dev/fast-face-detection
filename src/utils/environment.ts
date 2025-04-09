/**
 * Environment detection utilities
 */
import { Environment } from '../types/types';

/**
 * Detects the current JavaScript runtime environment
 */
export function detectEnvironment(): Environment {
  // Check if we are in a Node.js environment
  if (typeof process !== 'undefined' && 
      process.versions != null && 
      process.versions.node != null) {
    return 'node';
  }
  
  // Check if we are in a React Native environment
  if (typeof navigator !== 'undefined' && 
      typeof navigator.userAgent === 'string' &&
      navigator.userAgent.includes('ReactNative')) {
    return 'react-native';
  }
  
  // Check if we are in a browser environment
  if (typeof window !== 'undefined' && 
      typeof document !== 'undefined') {
    return 'browser';
  }
  
  // Fallback to browser as default environment
  return 'browser';
}

/**
 * Checks if the current environment supports WebGL rendering
 */
export function isWebGLSupported(): boolean {
  if (typeof document === 'undefined') {
    return false;
  }
  
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || 
               canvas.getContext('experimental-webgl');
    return gl !== null;
  } catch {
    return false;
  }
}

/**
 * Gets information about the current environment
 */
export function getEnvironmentInfo(): { environment: Environment; webglSupported: boolean } {
  return {
    environment: detectEnvironment(),
    webglSupported: isWebGLSupported()
  };
} 