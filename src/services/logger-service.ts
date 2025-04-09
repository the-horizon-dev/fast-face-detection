/**
 * @file Logger service for consistent logging throughout the library
 * 
 * This service provides a centralized logging mechanism with support for
 * different log levels and formatted output. It helps with debugging and
 * troubleshooting by providing consistent log formatting and control over
 * verbosity.
 */

/**
 * Service responsible for consistent logging across the face detection library.
 * All library logs are channeled through this service to ensure uniform formatting
 * and to allow global control over log verbosity.
 * 
 * @example
 * // Basic usage
 * Logger.info('Processing started');
 * Logger.error('Failed to load model', new Error('Network error'));
 * 
 * // Enable debug logs
 * Logger.setDebug(true);
 * Logger.debug('Detailed processing information');
 */
export class Logger {
  /** Flag to control debug logging visibility */
  private static isDebugEnabled: boolean = false;
  
  /**
   * Enables or disables debug mode for detailed logging.
   * When debug mode is disabled, debug and performance logs won't be shown.
   * 
   * @param {boolean} enabled - Whether to enable debug logging
   * 
   * @example
   * // Enable debug logs during development
   * Logger.setDebug(true);
   * 
   * // Disable debug logs in production
   * Logger.setDebug(false);
   */
  static setDebug(enabled: boolean): void {
    this.isDebugEnabled = enabled;
  }
  
  /**
   * Logs an error message and optional error object.
   * Use this for critical errors that prevent normal operation.
   * 
   * @param {string} message - The error message to display
   * @param {Error} [error] - Optional error object with stack trace
   * 
   * @example
   * try {
   *   // Some operation that might fail
   * } catch (error) {
   *   Logger.error('Failed to process image', error as Error);
   * }
   */
  static error(message: string, error?: Error): void {
    console.error(`[Face Detection Error] ${message}`, error);
  }
  
  /**
   * Logs a warning message and optional error object.
   * Use this for non-critical issues that allow continued operation.
   * 
   * @param {string} message - The warning message to display
   * @param {Error} [error] - Optional error object with details
   * 
   * @example
   * if (!isOptimalFormat) {
   *   Logger.warn('Image format not optimal, processing may be slower');
   * }
   */
  static warn(message: string, error?: Error): void {
    console.warn(`[Face Detection Warning] ${message}`, error);
  }
  
  /**
   * Logs an informational message.
   * Use this for general status updates and important events.
   * 
   * @param {string} message - The information message to display
   * 
   * @example
   * Logger.info('Face detection model loaded successfully');
   * Logger.info(`Detected ${faces.length} faces in the image`);
   */
  static info(message: string): void {
    console.info(`[Face Detection Info] ${message}`);
  }
  
  /**
   * Logs a debug message with optional additional arguments.
   * Debug messages are only shown when debug mode is enabled.
   * 
   * @param {string} message - The debug message to display
   * @param {...unknown[]} args - Optional additional arguments to log
   * 
   * @example
   * // Log a simple debug message
   * Logger.debug('Processing step 1');
   * 
   * // Log with additional data
   * Logger.debug('Face detected', { x: 100, y: 200 });
   */
  static debug(message: string, ...args: unknown[]): void {
    if (!this.isDebugEnabled) return;
    
    console.debug(`[DEBUG] ${message}`, ...args);
  }
  
  /**
   * Logs performance metrics for operations.
   * These messages only appear if debug mode is enabled.
   * Use this to track execution time of performance-critical operations.
   * 
   * @param {string} operation - Name of the operation being measured
   * @param {number} durationMs - Duration in milliseconds
   * 
   * @example
   * const startTime = performance.now();
   * // ... perform face detection ...
   * const endTime = performance.now();
   * Logger.performance('Face detection', endTime - startTime);
   */
  static performance(operation: string, durationMs: number): void {
    if (this.isDebugEnabled) {
      console.debug(`[Face Detection Performance] ${operation}: ${durationMs}ms`);
    }
  }
} 