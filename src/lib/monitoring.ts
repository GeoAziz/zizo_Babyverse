type ErrorWithMessage = {
  message: string;
  stack?: string;
  status?: number;
  code?: string;
};

export class MonitoringService {
  static logError(error: unknown) {
    const errorWithMessage = MonitoringService.toErrorWithMessage(error);
    console.error('ERROR:', {
      message: errorWithMessage.message,
      stack: errorWithMessage.stack,
      status: errorWithMessage.status,
      code: errorWithMessage.code,
      timestamp: new Date().toISOString(),
    });
  }

  static logInfo(message: string, data?: Record<string, unknown>) {
    console.info('INFO:', {
      message,
      data,
      timestamp: new Date().toISOString(),
    });
  }

  static logWarning(message: string, data?: Record<string, unknown>) {
    console.warn('WARNING:', {
      message,
      data,
      timestamp: new Date().toISOString(),
    });
  }

  private static toErrorWithMessage(maybeError: unknown): ErrorWithMessage {
    if (MonitoringService.isErrorWithMessage(maybeError)) return maybeError;
    try {
      return new Error(JSON.stringify(maybeError));
    } catch {
      return new Error(String(maybeError));
    }
  }

  private static isErrorWithMessage(error: unknown): error is ErrorWithMessage {
    return (
      typeof error === 'object' &&
      error !== null &&
      'message' in error &&
      typeof (error as Record<string, unknown>).message === 'string'
    );
  }

  // Performance monitoring
  static startPerformanceTimer(label: string) {
    console.time(label);
    return () => {
      console.timeEnd(label);
    };
  }

  // Memory usage monitoring
  static logMemoryUsage() {
    const used = process.memoryUsage();
    return {
      heapTotal: `${Math.round(used.heapTotal / 1024 / 1024 * 100) / 100} MB`,
      heapUsed: `${Math.round(used.heapUsed / 1024 / 1024 * 100) / 100} MB`,
      rss: `${Math.round(used.rss / 1024 / 1024 * 100) / 100} MB`,
    };
  }
}