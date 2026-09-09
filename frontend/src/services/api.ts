const gatewayUrl =
  import.meta.env.VITE_GATEWAY_URL || "http://localhost:3000/api";

export async function apiRequest<T = unknown>(
  path: string,
  token: string,
  options: RequestInit = {},
): Promise<T> {
  const response = await fetch(`${gatewayUrl}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(options.headers || {}),
    },
  });

  const body = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(body.message || "Error de servidor");
  }

  return body as T;
}
