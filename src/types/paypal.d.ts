declare module '@paypal/checkout-server-sdk' {
  namespace core {
    class PayPalHttpClient {
      constructor(environment: any, refreshToken?: string);
    }
  }
  namespace orders {
    class OrdersCreateRequest {
      prefer(prefer: string): this;
      requestBody(body: any): this;
    }
    class OrdersCaptureRequest {
      constructor(orderId: string);
    }
  }
  namespace environment {
    class SandboxEnvironment {
      constructor(clientId: string, clientSecret: string);
    }
    class LiveEnvironment {
      constructor(clientId: string, clientSecret: string);
    }
  }
}