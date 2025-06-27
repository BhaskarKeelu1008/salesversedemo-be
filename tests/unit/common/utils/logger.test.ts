import winston from 'winston';

interface LogInfo {
  correlationId?: string;
  timestamp?: string;
  level?: string;
  message?: string;
  [key: string]: any;
}

// Mock winston before importing logger
const mockCreateLogger = jest.fn();
const mockFormat = {
  combine: jest.fn(),
  timestamp: jest.fn(),
  printf: jest.fn(),
  colorize: jest.fn(),
  errors: jest.fn(),
  json: jest.fn(),
  format: jest.fn((fn: (info: LogInfo) => LogInfo) => (info: LogInfo) => ({ ...info, correlationId: info?.correlationId || 'test-id' })),
};

const mockLogger = {
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn(),
  http: jest.fn(),
  child: jest.fn().mockReturnValue({
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
    http: jest.fn(),
  }),
  add: jest.fn(),
};

mockCreateLogger.mockReturnValue(mockLogger);

jest.mock('winston', () => ({
  format: mockFormat,
  createLogger: mockCreateLogger,
  transports: {
    Console: jest.fn(),
    MongoDB: jest.fn(),
  },
}));

// Mock winston-daily-rotate-file
jest.mock('winston-daily-rotate-file', () => {
  return jest.fn().mockImplementation(() => ({}));
});

// Import logger after mocks are set up
const { default: logger, createChildLogger, stream } = require('@/common/utils/logger');

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
    expect(logger.http).toBeDefined();
  });

  describe('logger instance', () => {
    it('should be a winston logger instance', () => {
      expect(mockCreateLogger).toHaveBeenCalled();
      expect(logger).toBeDefined();
    });

    it('should use the correct log level based on NODE_ENV', () => {
      const originalEnv = process.env.NODE_ENV;

      // Test production environment
      process.env.NODE_ENV = 'production';
      jest.isolateModules(() => {
        require('@/common/utils/logger');
        expect(mockCreateLogger).toHaveBeenLastCalledWith(
          expect.objectContaining({ level: 'info' })
        );
      });

      // Test staging environment
      process.env.NODE_ENV = 'staging';
      jest.isolateModules(() => {
        require('@/common/utils/logger');
        expect(mockCreateLogger).toHaveBeenLastCalledWith(
          expect.objectContaining({ level: 'debug' })
        );
      });

      // Test development environment
      process.env.NODE_ENV = 'development';
      jest.isolateModules(() => {
        require('@/common/utils/logger');
        expect(mockCreateLogger).toHaveBeenLastCalledWith(
          expect.objectContaining({ level: 'debug' })
        );
      });

      process.env.NODE_ENV = originalEnv;
    });

    it('should use the correct default metadata', () => {
      expect(mockCreateLogger).toHaveBeenCalledWith(
        expect.objectContaining({
          defaultMeta: {
            service: 'salesverse-api',
            environment: expect.any(String),
          },
        })
      );
    });

    it('should configure MongoDB transport when MONGODB_URI is set', () => {
      const originalUri = process.env.MONGODB_URI;
      const originalEnv = process.env.NODE_ENV;

      process.env.MONGODB_URI = 'mongodb://localhost:27017/test';
      process.env.NODE_ENV = 'development';

      jest.isolateModules(() => {
        require('@/common/utils/logger');
        expect(mockLogger.add).toHaveBeenCalled();
      });

      process.env.MONGODB_URI = originalUri;
      process.env.NODE_ENV = originalEnv;
    });

    it('should not configure MongoDB transport when in test environment', () => {
      const originalUri = process.env.MONGODB_URI;
      const originalEnv = process.env.NODE_ENV;

      process.env.MONGODB_URI = 'mongodb://localhost:27017/test';
      process.env.NODE_ENV = 'test';

      jest.isolateModules(() => {
        require('@/common/utils/logger');
        expect(mockLogger.add).not.toHaveBeenCalled();
      });

      process.env.MONGODB_URI = originalUri;
      process.env.NODE_ENV = originalEnv;
    });
  });

  describe('createChildLogger', () => {
    it('should create a child logger with correlation ID', () => {
      const correlationId = '123';
      const childLogger = createChildLogger(correlationId);
      expect(childLogger).toBeDefined();
      expect(mockLogger.child).toHaveBeenCalledWith({ correlationId });
    });
  });

  describe('stream', () => {
    it('should write messages at http level', () => {
      const message = 'Test message\n';
      stream.write(message);
      expect(mockLogger.http).toHaveBeenCalledWith('Test message');
    });

    it('should trim whitespace from messages', () => {
      const message = '  Test message  \n';
      stream.write(message);
      expect(mockLogger.http).toHaveBeenCalledWith('Test message');
    });
  });
});
