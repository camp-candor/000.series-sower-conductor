import { resolveCoordinationEndpoint } from './endpointResolver.buzz.js';

export interface HttpRequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  endpointPath: string;
  headers?: Record<string, string>;
  body?: any;
  timeoutMs?: number;
}

export interface HttpResponseReceipt<T = any> {
  ok: boolean;
  status: number;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  durationMs: number;
}

export async function dispatchEdgeHttpRequest<T = any>(
  options: HttpRequestOptions
): Promise<HttpResponseReceipt<T>> {
  const { resolvedUrl } = resolveCoordinationEndpoint();
  const url = `${resolvedUrl}${options.endpointPath.startsWith('/') ? '' : '/'}${options.endpointPath}`;
  const timeoutMs = options.timeoutMs ?? 5000;
  const startTime = Date.now();

  const controller = new AbortController();
  const timeoutHandle = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const requestHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(options.headers || {}),
    };

    const response = await fetch(url, {
      method: options.method ?? 'GET',
      headers: requestHeaders,
      body: options.body ? JSON.stringify(options.body) : undefined,
      signal: controller.signal,
    });

    clearTimeout(timeoutHandle);
    const durationMs = Date.now() - startTime;

    if (!response.ok) {
      let errorDetails: any = null;
      try {
        errorDetails = await response.json();
      } catch {
        errorDetails = await response.text();
      }

      let errorCode = 'HTTP_REQUEST_FAILED';
      if (response.status === 412) errorCode = 'DIRTY_SCENE_REJECTED';
      else if (response.status === 409) errorCode = 'ZOMBIE_LEASE_EPOCH';
      else if (response.status === 401) errorCode = 'UNAUTHORIZED_COORDINATION_TOKEN';
      else if (response.status === 503) errorCode = 'EDGE_GATEWAY_UNAVAILABLE';

      const receipt: HttpResponseReceipt<T> = {
        ok: false,
        status: response.status,
        error: {
          code: errorCode,
          message: `Request failed with status ${response.status}`,
          details: errorDetails,
        },
        durationMs,
      };

      process.stderr.write(
        `>> [REST] [FAIL] ${options.method || 'GET'} ${url} -> ${response.status} (${errorCode})\n`
      );
      return receipt;
    }

    const data = (await response.json()) as T;
    process.stdout.write(
      `>> [REST] [OK] ${options.method || 'GET'} ${url} -> ${response.status} (${durationMs}ms)\n`
    );

    return {
      ok: true,
      status: response.status,
      data,
      durationMs,
    };
  } catch (err: any) {
    clearTimeout(timeoutHandle);
    const durationMs = Date.now() - startTime;
    const isAbort = err.name === 'AbortError';
    const errorCode = isAbort ? 'REQUEST_TIMEOUT' : 'NETWORK_TRANSPORT_ERROR';

    process.stderr.write(`>> [REST] [FAIL] ${options.method || 'GET'} ${url} -> ${errorCode}: ${err.message}\n`);

    return {
      ok: false,
      status: isAbort ? 408 : 500,
      error: {
        code: errorCode,
        message: err.message,
      },
      durationMs,
    };
  }
}
