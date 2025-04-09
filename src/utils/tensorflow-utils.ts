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
 * Type definition for the tfjs-react-native module
 */
interface TFJSReactNative {
  ready: () => Promise<void>;
  [key: string]: unknown;
}

/**
 * Initializes the appropriate TensorFlow.js backend
 */
export async function initTensorflowBackend(environment: Environment): Promise<void> {
  // Check if the backend is already initialized
  if (!tf.getBackend()) {
    Logger.debug('Initializing internal resources...');
    
    // Select appropriate backend based on environment
    if (environment === 'node') {
      try {
        // For Node.js, try to use the specialized Node.js backend first
        const nodeBackendLoaded = await loadBackend('node');
        
        // If tfjs-node isn't available or failed to load, fall back to CPU
        if (!nodeBackendLoaded) {
          await loadBackend('cpu');
          await tf.setBackend('cpu');
          Logger.debug('Using CPU backend in Node.js environment');
        } else {
          Logger.debug('Using Node.js native TensorFlow backend');
        }
      } catch (error) {
        // Last resort fallback if everything fails
        Logger.warn('Error initializing resources in Node.js, attempting CPU fallback', error as Error);
        try {
          await loadBackend('cpu');
          await tf.setBackend('cpu');
        } catch (cpuError) {
          Logger.error('Failed to initialize CPU backend as fallback', cpuError as Error);
          throw new Error(`Failed to initialize TensorFlow in Node.js: ${(error as Error).message}`);
        }
      }
    } else if (environment === 'react-native') {
      try {
        let reactNativeModule: TFJSReactNative | null = null;
        
        try {
          const module = await import('@tensorflow/tfjs-react-native');
          reactNativeModule = module as unknown as TFJSReactNative;
        } catch (e) {
          Logger.warn('Unable to import tfjs-react-native module', e as Error);
          reactNativeModule = null;
        }
        
        if (!reactNativeModule) {
          throw new Error('Failed to load module for React Native - ensure @tensorflow/tfjs-react-native is installed');
        }
        
        if (typeof reactNativeModule.ready === 'function') {
          await reactNativeModule.ready();
          Logger.debug('Resources for React Native initialized successfully');
        } else {
          throw new Error('tfjs-react-native module does not have the expected ready() method');
        }
        
      } catch (error) {
        Logger.warn('Error initializing resources in React Native', error as Error);
        Logger.info('For React Native, make sure to install @tensorflow/tfjs-react-native');
        
        // Fallback to CPU in case of error
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
    
    Logger.debug(`Internal resources initialized with backend: ${tf.getBackend()}`);
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