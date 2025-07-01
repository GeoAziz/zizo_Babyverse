interface ErrorLogData {
  message: string;
  error: unknown;
  metadata?: Record<string, any>;
}

interface MetricData {
  name: string;
  value: number;
  tags?: Record<string, string | number | boolean>;
  timestamp?: Date;
}

class MonitoringSystem {
  private static instance: MonitoringSystem;
  private metricsBuffer: MetricData[] = [];
  private readonly flushInterval = 10000; // 10 seconds

  private constructor() {
    this.setupPeriodicFlush();
  }

  public static getInstance(): MonitoringSystem {
    if (!MonitoringSystem.instance) {
      MonitoringSystem.instance = new MonitoringSystem();
    }
    return MonitoringSystem.instance;
  }

  private setupPeriodicFlush() {
    setInterval(() => {
      this.flushMetrics();
    }, this.flushInterval);
  }

  private async flushMetrics() {
    if (this.metricsBuffer.length === 0) return;

    const metrics = [...this.metricsBuffer];
    this.metricsBuffer = [];

    try {
      await fetch('/api/metrics/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ metrics }),
      });
    } catch (error) {
      console.error('Failed to flush metrics:', error);
    }
  }

  public async logError({ message, error, metadata }: ErrorLogData) {
    const errorData = {
      timestamp: new Date(),
      message,
      error: error instanceof Error ? {
        name: error.name,
        message: error.message,
        stack: error.stack,
      } : error,
      metadata,
    };

    console.error(JSON.stringify(errorData, null, 2));

    try {
      await fetch('/api/logs/error', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(errorData),
      });
    } catch (e) {
      console.error('Failed to send error log:', e);
    }
  }

  public trackMetric(name: string, value: number, tags?: Record<string, string | number | boolean>) {
    this.metricsBuffer.push({
      name,
      value,
      tags,
      timestamp: new Date(),
    });
  }

  public async trackPerformance(name: string, duration: number, metadata?: Record<string, any>) {
    this.trackMetric(`performance.${name}`, duration, metadata);
  }
}

// Export singleton instance
const monitoring = MonitoringSystem.getInstance();

// Utility functions
export const logError = (message: string, error: unknown, metadata?: Record<string, any>) => {
  monitoring.logError({ message, error, metadata });
};

export const incrementMetric = (name: string, tags?: Record<string, string | number | boolean>) => {
  monitoring.trackMetric(name, 1, tags);
};

export const trackMetric = (name: string, value: number, tags?: Record<string, string | number | boolean>) => {
  monitoring.trackMetric(name, value, tags);
};

export const trackPerformance = (name: string, duration: number, metadata?: Record<string, any>) => {
  monitoring.trackPerformance(name, duration, metadata);
};

// Performance monitoring middleware
export const withPerformanceTracking = (handler: Function, name: string) => {
  return async (...args: any[]) => {
    const start = performance.now();
    try {
      return await handler(...args);
    } finally {
      const duration = performance.now() - start;
      trackPerformance(name, duration);
    }
  };
};