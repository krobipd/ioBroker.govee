import * as https from "node:https";

/**
 * Module-level keep-alive Agent — vermeidet TLS-Handshake (~200ms) pro
 * Request. maxSockets begrenzt parallele Verbindungen pro Host damit wir
 * nicht aus Versehen Govee mit 100 gleichzeitigen Calls treffen.
 */
const keepAliveAgent = new https.Agent({ keepAlive: true, maxSockets: 4 });

/** Options for an HTTPS request */
export interface HttpRequestOptions {
  /** HTTP method */
  method: "GET" | "POST";
  /** Full URL */
  url: string;
  /** HTTP headers */
  headers: Record<string, string>;
  /** Request body (POST only, will be JSON-serialized) */
  body?: unknown;
  /** Timeout in milliseconds (default 15000) */
  timeout?: number;
  /** Optional AbortSignal — wird der Request abgebrochen sobald abort() */
  signal?: AbortSignal;
}

/**
 * Signature der httpsRequest-Funktion. Cloud/Mqtt-Clients nehmen das als
 * optionalen DI-Parameter — Default ist die echte httpsRequest, Tests können
 * einen Mock injizieren ohne Module-Replacement.
 */
export type HttpsRequestFn = <T>(options: HttpRequestOptions) => Promise<T>;

/**
 * Perform an HTTPS request and parse the JSON response.
 *
 * @param options Request options
 */
export function httpsRequest<T>(options: HttpRequestOptions): Promise<T> {
  return new Promise((resolve, reject) => {
    const u = new URL(options.url);
    const postData = options.body ? JSON.stringify(options.body) : undefined;

    const reqOptions: https.RequestOptions = {
      method: options.method,
      hostname: u.hostname,
      path: u.pathname + u.search,
      headers: {
        ...options.headers,
        ...(postData
          ? {
              "Content-Type": "application/json",
              "Content-Length": Buffer.byteLength(postData),
            }
          : {}),
      },
      timeout: options.timeout ?? 15_000,
      agent: keepAliveAgent,
    };

    const req = https.request(reqOptions, res => {
      const chunks: Buffer[] = [];
      res.on("data", (chunk: Buffer) => chunks.push(chunk));
      res.on("end", () => {
        const raw = Buffer.concat(chunks).toString();
        const statusCode = res.statusCode ?? 0;

        if (statusCode < 200 || statusCode >= 400) {
          // M4 — Body-Snippet aus Error-Message rausnehmen damit
          // Tokens/API-Keys nicht im warn-Log auftauchen wenn der
          // Server sie reflektiert. responseBody bleibt für debug
          // separat verfügbar.
          reject(new HttpError(`HTTP ${statusCode}`, statusCode, res.headers, raw));
          return;
        }

        try {
          resolve(JSON.parse(raw) as T);
        } catch {
          reject(new Error(`Invalid JSON in HTTP ${statusCode} response`));
        }
      });
    });

    req.on("error", reject);
    req.on("timeout", () => req.destroy(new Error("Timeout")));

    // M3 — AbortSignal-Support. Wer den Request macht kann ihn abbrechen
    // (z.B. Adapter-onUnload via AbortController) damit der Stop nicht
    // 15s auf das Timeout warten muss.
    if (options.signal) {
      if (options.signal.aborted) {
        req.destroy(new Error("Aborted"));
        reject(new Error("Aborted"));
        return;
      }
      const onAbort = (): void => {
        req.destroy(new Error("Aborted"));
        reject(new Error("Aborted"));
      };
      options.signal.addEventListener("abort", onAbort, { once: true });
    }

    if (postData) {
      req.write(postData);
    }
    req.end();
  });
}

/** HTTP error with status code, response headers, and response body (debug-only) */
export class HttpError extends Error {
  /** HTTP status code */
  readonly statusCode: number;
  /** Response headers */
  readonly headers: Record<string, string | string[] | undefined>;
  /**
   * Raw response body — NICHT in `message` damit Tokens/API-Keys nicht
   * via warn-Log geleakt werden. Nur für gezieltes debug-Logging beim
   * Caller verfügbar.
   */
  readonly responseBody: string;

  /**
   * @param message Error message (Body-frei)
   * @param statusCode HTTP status code
   * @param headers Response headers
   * @param responseBody Raw response body (kann sensitive Echo-Daten enthalten)
   */
  constructor(
    message: string,
    statusCode: number,
    headers: Record<string, string | string[] | undefined> = {},
    responseBody: string = "",
  ) {
    super(message);
    this.name = "HttpError";
    this.statusCode = statusCode;
    this.headers = headers;
    this.responseBody = responseBody;
  }
}
