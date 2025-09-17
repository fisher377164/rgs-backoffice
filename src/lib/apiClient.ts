import { showToast } from "@/lib/toastStore";

const DEFAULT_API_BASE_URL = "http://builder-web.192.168.49.2.nip.io";

const showErrorToast = (message: string) => {
  showToast({
    variant: "error",
    title: "Request failed",
    message,
    hideButtonLabel: "Dismiss",
  });
};

const ensureTrailingSlash = (value: string) => (value.endsWith("/") ? value : `${value}/`);
const removeLeadingSlash = (value: string) => value.replace(/^\/+/, "");

const resolveBaseUrl = () => {
  const envBaseUrl =
    typeof window === "undefined"
      ? process.env.NEXT_PUBLIC_API_BASE_URL ?? process.env.API_BASE_URL
      : process.env.NEXT_PUBLIC_API_BASE_URL;

  const sanitized = envBaseUrl?.trim();
  if (sanitized && sanitized.length > 0) {
    return sanitized;
  }

  return DEFAULT_API_BASE_URL;
};

const buildRequestUrl = (endpoint: string) => {
  if (!endpoint) {
    throw new Error("API endpoint is required");
  }

  if (/^https?:\/\//i.test(endpoint)) {
    return endpoint;
  }

  const baseUrl = resolveBaseUrl();
  const normalizedBase = ensureTrailingSlash(baseUrl.replace(/\/+$/, "/"));
  const normalizedEndpoint = removeLeadingSlash(endpoint);

  return `${normalizedBase}${normalizedEndpoint}`;
};

export class ApiError extends Error {
  constructor(public readonly status: number, message: string) {
    super(message);
    this.name = "ApiError";
  }
}

const getErrorDetails = async (response: Response) => {
  const contentType = response.headers.get("content-type") ?? "";

  try {
    if (contentType.includes("application/json")) {
      const payload = await response.json();

      if (typeof payload === "string") {
        return payload;
      }

      if (payload && typeof payload === "object") {
        const message =
          ("message" in payload && typeof payload.message === "string"
            ? payload.message
            : undefined) ??
          ("error" in payload && typeof payload.error === "string"
            ? payload.error
            : undefined);

        if (message) {
          return message;
        }

        const entries = Object.entries(payload)
          .map(([key, value]) => `${key}: ${String(value)}`)
          .join(", ");

        if (entries.length > 0) {
          return entries;
        }
      }
    } else {
      const text = await response.text();
      if (text) {
        return text;
      }
    }
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    return `Unable to parse error response: ${reason}`;
  }

  return undefined;
};

export const fetchJson = async <TResponse>(
  endpoint: string,
  init?: RequestInit
): Promise<TResponse> => {
  const url = buildRequestUrl(endpoint);

  let response: Response;
  try {
    response = await fetch(url, init);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unexpected error occurred";
    const errorMessage = `Request to ${url} failed: ${message}`;
    showErrorToast(errorMessage);
    throw new ApiError(0, errorMessage);
  }

  if (!response.ok) {
    const details = await getErrorDetails(response);
    const errorMessage =
      `Request to ${url} failed with status ${response.status}` +
      (details ? ` - ${details}` : "");
    showErrorToast(errorMessage);
    throw new ApiError(response.status, errorMessage);
  }

  if (response.status === 204) {
    return undefined as TResponse;
  }

  try {
    return (await response.json()) as TResponse;
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    const errorMessage = `Failed to parse JSON response from ${url}: ${reason}`;
    showErrorToast(errorMessage);
    throw new ApiError(response.status, errorMessage);
  }
};

export default fetchJson;
