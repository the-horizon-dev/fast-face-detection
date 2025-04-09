/**
 * TensorFlow.js backend initialization utilities
 */
import * as tf from '@tensorflow/tfjs-core';

import { Environment } from '../types/types';
import { Logger } from '../services/logger-service';

// Remove the module declaration which causes errors
// Map of loaded backends to avoid duplicate loading
const loadedBackends = new Set<string>();

/**
 * Dynamically loads a specific TensorFlow.js backend
 * @returns true if backend was loaded successfully, false if it should fall back
 */
async function loadBackend(backend: 'webgl' | 'cpu' | 'node'): Promise<boolean> {
  if (loadedBackends.has(backend)) return true;
  
  try {
    if (backend === 'webgl') {
      await import('@tensorflow/tfjs-backend-webgl');
      Logger.debug('WebGL backend loaded');
      loadedBackends.add(backend);
      return true;
    } else if (backend === 'cpu') {
      await import('@tensorflow/tfjs-backend-cpu');
      Logger.debug('CPU backend loaded');
      loadedBackends.add(backend);
      return true;
    } else if (backend === 'node') {
      try {
        // Using try/catch with require instead of dynamic import
        require('@tensorflow/tfjs-node');
        Logger.debug('Node.js backend loaded');
        loadedBackends.add(backend);
        return true;
      } catch {
        // Don't throw here, just log the issue and signal to fall back
        Logger.info('For better performance in Node.js, install @tensorflow/tfjs-node package');
        return false;
      }
    }
    return false;
  } catch (error) {
    Logger.warn(`Error loading ${backend} backend`, error as Error);
    return false;
  }
}

/**
 * Initializes the appropriate TensorFlow.js backend
 */
export async function initTensorflowBackend(environment: Environment): Promise<void> {
  // Check if the backend is already initialized
  if (tf.getBackend()) {
    return;
  }

  if (environment === 'node') {
    try {
      await loadBackend('node');
      await tf.setBackend('node');
    } catch (error) {
      Logger.warn('Node backend unavailable, falling back to CPU', error as Error);
      await loadBackend('cpu');
      await tf.setBackend('cpu');
    }
  } else {
    // Browser - try WebGL first, with fallback to CPU
    try {
      const webglLoaded = await loadBackend('webgl');
      if (webglLoaded) {
        await tf.setBackend('webgl');
      } else {
        throw new Error('WebGL backend loading failed');
      }
    } catch (error) {
      Logger.warn('WebGL unavailable, using CPU as alternative', error as Error);
      try {
        await loadBackend('cpu');
        await tf.setBackend('cpu');
      } catch (cpuError) {
        Logger.error('Failed to initialize both WebGL and CPU backends', cpuError as Error);
        throw new Error('Could not initialize any TensorFlow backend');
      }
    }
  }
}

/**
 * Checks if a TensorFlow.js backend has been initialized
 */
export function isTensorflowBackendInitialized(): boolean {
  return !!tf.getBackend();
}

/**
 * Returns the name of the current active TensorFlow.js backend
 */
export function getTensorflowBackend(): string | null {
  return tf.getBackend() || null;
} 