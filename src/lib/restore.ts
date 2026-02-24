export const API_KEY_STORAGE_KEY = "old_pic_gemini_api_key";

export function getStoredApiKey(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(API_KEY_STORAGE_KEY)?.trim() ?? null;
}

export async function restorePhoto(
  file: File,
  mimeType: string
): Promise<string> {
  const base64Data = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      resolve(result.split(",")[1] || "");
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });

  const apiKey = getStoredApiKey();
  const response = await fetch("/api/restore", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      data: base64Data,
      mimeType: mimeType || "image/jpeg",
      ...(apiKey ? { apiKey } : {}),
    }),
  });

  const result = (await response.json().catch(() => ({}))) as {
    image?: string;
    error?: string;
  };

  if (!response.ok) {
    throw new Error(result.error || `请求失败 (${response.status})`);
  }
  if (result.error) throw new Error(result.error);
  if (!result.image) throw new Error("AI 未能成功生成图像");
  return result.image;
}
