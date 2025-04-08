import { Logger } from '../../../src/services/logger-service';

describe('Logger Service', () => {
  // Save original console methods
  const originalConsoleError = console.error;
  const originalConsoleWarn = console.warn;
  const originalConsoleInfo = console.info;
  const originalConsoleDebug = console.debug;
  
  // Mock console methods
  beforeEach(() => {
    console.error = jest.fn();
    console.warn = jest.fn();
    console.info = jest.fn();
    console.debug = jest.fn();
  });
  
  // Restore original console methods
  afterEach(() => {
    console.error = originalConsoleError;
    console.warn = originalConsoleWarn;
    console.info = originalConsoleInfo;
    console.debug = originalConsoleDebug;
  });
  
  describe('error', () => {
    test('should call console.error with formatted message', () => {
      const message = 'Test error message';
      Logger.error(message);
      
      expect(console.error).toHaveBeenCalledWith(
        '[Face Detection Error] Test error message',
        undefined
      );
    });
    
    test('should include error object when provided', () => {
      const message = 'Test error message';
      const error = new Error('Error details');
      
      Logger.error(message, error);
      
      expect(console.error).toHaveBeenCalledWith(
        '[Face Detection Error] Test error message',
        error
      );
    });
  });
  
  describe('warn', () => {
    test('should call console.warn with formatted message', () => {
      const message = 'Test warning message';
      Logger.warn(message);
      
      expect(console.warn).toHaveBeenCalledWith(
        '[Face Detection Warning] Test warning message',
        undefined
      );
    });
    
    test('should include error object when provided', () => {
      const message = 'Test warning message';
      const error = new Error('Warning details');
      
      Logger.warn(message, error);
      
      expect(console.warn).toHaveBeenCalledWith(
        '[Face Detection Warning] Test warning message',
        error
      );
    });
  });
  
  describe('info', () => {
    test('should call console.info with formatted message', () => {
      const message = 'Test info message';
      Logger.info(message);
      
      expect(console.info).toHaveBeenCalledWith(
        '[Face Detection Info] Test info message'
      );
    });
  });
  
  describe('debug', () => {
    test('should not call console.debug when debug mode is disabled', () => {
      // Ensure debug mode is disabled
      Logger.setDebug(false);
      
      Logger.debug('Test debug message');
      
      expect(console.debug).not.toHaveBeenCalled();
    });
    
    test('should call console.debug with formatted message when debug mode is enabled', () => {
      // Enable debug mode
      Logger.setDebug(true);
      
      const message = 'Test debug message';
      Logger.debug(message);
      
      expect(console.debug).toHaveBeenCalledWith(
        '[Face Detection Debug] Test debug message'
      );
    });
    
    test('should include additional arguments when provided', () => {
      // Enable debug mode
      Logger.setDebug(true);
      
      const message = 'Test debug message';
      const additionalData = { key: 'value' };
      
      Logger.debug(message, additionalData);
      
      expect(console.debug).toHaveBeenCalledWith(
        '[Face Detection Debug] Test debug message',
        additionalData
      );
    });
  });
  
  describe('performance', () => {
    test('should not call console.debug when debug mode is disabled', () => {
      // Ensure debug mode is disabled
      Logger.setDebug(false);
      
      Logger.performance('Test operation', 100);
      
      expect(console.debug).not.toHaveBeenCalled();
    });
    
    test('should call console.debug with formatted message when debug mode is enabled', () => {
      // Enable debug mode
      Logger.setDebug(true);
      
      const operation = 'Test operation';
      const duration = 100;
      
      Logger.performance(operation, duration);
      
      expect(console.debug).toHaveBeenCalledWith(
        '[Face Detection Performance] Test operation: 100ms'
      );
    });
  });
  
  describe('setDebug', () => {
    test('should enable debug mode', () => {
      // Set debug mode to a known state
      Logger.setDebug(false);
      
      // Test debug mode when disabled
      Logger.debug('Should not be logged');
      expect(console.debug).not.toHaveBeenCalled();
      
      // Enable debug mode
      Logger.setDebug(true);
      
      // Test debug mode when enabled
      Logger.debug('Should be logged');
      expect(console.debug).toHaveBeenCalledWith(
        '[Face Detection Debug] Should be logged'
      );
    });
    
    test('should disable debug mode', () => {
      // Set debug mode to a known state
      Logger.setDebug(true);
      
      // Clear previous calls
      jest.clearAllMocks();
      
      // Disable debug mode
      Logger.setDebug(false);
      
      // Test debug mode when disabled
      Logger.debug('Should not be logged');
      expect(console.debug).not.toHaveBeenCalled();
    });
  });
}); 