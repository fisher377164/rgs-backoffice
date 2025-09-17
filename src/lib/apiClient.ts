const DEFAULT_API_BASE_URL = "http://builder-web.192.168.49.2.nip.io";

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

export const fetchJson = async <TResponse>(
  endpoint: string,
  init?: RequestInit
): Promise<TResponse> => {
  const url = buildRequestUrl(endpoint);
  const response = await fetch(url, init);

  if (!response.ok) {
    const errorMessage = `Request to ${url} failed with status ${response.status}`;
    throw new ApiError(response.status, errorMessage);
  }

  if (response.status === 204) {
    return undefined as TResponse;
  }

  return (await response.json()) as TResponse;
};

export default fetchJson;
