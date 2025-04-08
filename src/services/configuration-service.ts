/**
 * Configuration service for detection options
 */
import { DetectionOptions, Environment } from '../types/types';

export class ConfigurationService {
  /**
   * Combines current options with new options
   */
  static mergeOptions(current: DetectionOptions, newOptions: DetectionOptions): DetectionOptions {
    return {
      ...current,
      ...newOptions,
      environment: newOptions.environment || current.environment,
      scoreThreshold: newOptions.scoreThreshold ?? current.scoreThreshold,
      maxFaces: newOptions.maxFaces ?? current.maxFaces,
      enableTracking: newOptions.enableTracking ?? current.enableTracking
    };
  }
  
  /**
   * Creates default options for the specified environment
   */
  static createDefaultOptions(environment: Environment): DetectionOptions {
    return {
      environment,
      scoreThreshold: 0.5,
      maxFaces: 10,
      enableTracking: true
    };
  }
  
  /**
   * Checks if options have changed
   */
  static hasOptionsChanged(current: DetectionOptions, newOptions: DetectionOptions): boolean {
    return (
      newOptions.scoreThreshold !== undefined && current.scoreThreshold !== newOptions.scoreThreshold ||
      newOptions.maxFaces !== undefined && current.maxFaces !== newOptions.maxFaces ||
      newOptions.enableTracking !== undefined && current.enableTracking !== newOptions.enableTracking ||
      newOptions.environment !== undefined && current.environment !== newOptions.environment
    );
  }
} 