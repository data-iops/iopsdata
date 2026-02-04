export type ApiError = {
  message: string;
  status: number;
  details?: unknown;
};

export type ApiRequestOptions = RequestInit & {
  baseUrl?: string;
  parseJson?: boolean;
};

const defaultHeaders: HeadersInit = {
  "Content-Type": "application/json",
};

const getApiBaseUrl = () => process.env.NEXT_PUBLIC_API_URL ?? "";

export async function apiFetch<T>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<T> {
  const { baseUrl = getApiBaseUrl(), parseJson = true, headers, ...init } = options;
  const response = await fetch(`${baseUrl}${path}`, {
    ...init,
    headers: {
      ...defaultHeaders,
      ...headers,
    },
  });

  if (!response.ok) {
    let details: unknown = null;
    if (parseJson) {
      try {
        details = await response.json();
      } catch {
        details = await response.text();
      }
    }

    const error: ApiError = {
      message: response.statusText || "Request failed",
      status: response.status,
      details,
    };
    throw error;
  }

  if (!parseJson) {
    return response.text() as T;
  }

  return (await response.json()) as T;
}
