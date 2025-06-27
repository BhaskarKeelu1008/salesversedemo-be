import winston from 'winston';
import logger, { createChildLogger, stream } from '@/common/utils/logger';
import { v4 as uuidv4 } from 'uuid';

jest.mock('winston', () => ({
  format: {
    combine: jest.fn(),
    timestamp: jest.fn(),
    printf: jest.fn(),
    colorize: jest.fn(),
    errors: jest.fn(),
    json: jest.fn(),
    format: jest.fn().mockReturnValue(jest.fn()),
  },
  createLogger: jest.fn().mockReturnValue({
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  }),
  transports: {
    Console: jest.fn(),
  },
}));

jest.mock('winston-daily-rotate-file', () => {
  return jest.fn().mockImplementation(() => ({
    on: jest.fn(),
  }));
});

jest.mock('uuid', () => ({
  v4: jest.fn().mockReturnValue('test-uuid'),
}));

describe('Logger', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(logger).toBeDefined();
  });

  it('should have all log levels', () => {
    expect(logger.info).toBeDefined();
    expect(logger.error).toBeDefined();
    expect(logger.warn).toBeDefined();
    expect(logger.debug).toBeDefined();
  });

  describe('logger instance', () => {
    it('should be a winston logger instance', () => {
      expect(winston.createLogger).toHaveBeenCalled();
      expect(logger).toBeDefined();
    });

    it('should use the correct log level based on NODE_ENV', () => {
      const originalEnv = process.env.NODE_ENV;

      // Test production environment
      process.env.NODE_ENV = 'production';
      const productionLogger = require('@/common/utils/logger').default;
      expect(winston.createLogger).toHaveBeenCalledWith(
        expect.objectContaining({
          level: 'info',
        }),
      );

      // Test staging environment
      process.env.NODE_ENV = 'staging';
      const stagingLogger = require('@/common/utils/logger').default;
      expect(winston.createLogger).toHaveBeenCalledWith(
        expect.objectContaining({
          level: 'debug',
        }),
      );

      // Test development environment
      process.env.NODE_ENV = 'development';
      const devLogger = require('@/common/utils/logger').default;
      expect(winston.createLogger).toHaveBeenCalledWith(
        expect.objectContaining({
          level: 'debug',
        }),
      );

      process.env.NODE_ENV = originalEnv;
    });

    it('should use the correct default metadata', () => {
      expect(winston.createLogger).toHaveBeenCalledWith(
        expect.objectContaining({
          defaultMeta: {
            service: 'salesverse-api',
            environment: expect.any(String),
          },
        }),
      );
    });

    it('should configure MongoDB transport when MONGODB_URI is set', () => {
      const originalUri = process.env.MONGODB_URI;
      const originalEnv = process.env.NODE_ENV;

      process.env.MONGODB_URI = 'mongodb://localhost:27017/test';
      process.env.NODE_ENV = 'development';

      const testLogger = require('@/common/utils/logger').default;
      expect(testLogger.add).toHaveBeenCalled();

      process.env.MONGODB_URI = originalUri;
      process.env.NODE_ENV = originalEnv;
    });

    it('should not configure MongoDB transport when in test environment', () => {
      const originalUri = process.env.MONGODB_URI;
      const originalEnv = process.env.NODE_ENV;

      process.env.MONGODB_URI = 'mongodb://localhost:27017/test';
      process.env.NODE_ENV = 'test';

      const testLogger = require('@/common/utils/logger').default;
      expect(testLogger.add).not.toHaveBeenCalled();

      process.env.MONGODB_URI = originalUri;
      process.env.NODE_ENV = originalEnv;
    });
  });

  describe('createChildLogger', () => {
    it('should create a child logger with correlation ID', () => {
      const correlationId = uuidv4();
      const childLogger = createChildLogger(correlationId);

      expect(logger.child).toHaveBeenCalledWith({ correlationId });
      expect(childLogger).toBeDefined();
    });
  });

  describe('stream', () => {
    it('should write messages at http level', () => {
      const message = 'Test message\n';
      stream.write(message);

      expect(logger.http).toHaveBeenCalledWith('Test message');
    });

    it('should trim whitespace from messages', () => {
      const message = '  Test message  \n';
      stream.write(message);

      expect(logger.http).toHaveBeenCalledWith('Test message');
    });
  });
}); 