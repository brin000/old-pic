export const AUTH_COOKIE_NAME = "old_pic_auth";

export async function getAuthCookieValue(): Promise<string | null> {
  const key = process.env.ACCESS_KEY?.trim();
  if (!key) return null;
  const data = new TextEncoder().encode(key);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashHex = Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return hashHex;
}

export function isAccessKeyConfigured(): boolean {
  return Boolean(process.env.ACCESS_KEY?.trim());
}
