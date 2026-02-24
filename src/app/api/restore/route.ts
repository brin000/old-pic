import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

const RESTORE_PROMPT = `You are a professional AI photo digitizer and restorer.
TASK 1: OBJECT DETECTION & CROPPING. Detect the actual old photograph within this real-life shot. Crop out any desk, hands, or background elements. Perform perspective correction to make the photo rectangular.
TASK 2: RESTORATION. Faithfully restore this image with high fidelity to modern photograph quality. Remove scratches, dust, and noise. Sharpen the facial details.
TASK 3: COLORIZATION. Add natural, historically accurate colors in full color.
OUTPUT: Return ONLY the cropped and fully restored image.`;

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
const GEMINI_MODEL = "gemini-2.5-flash-image";
const MAX_IMAGE_SIZE_BYTES = 20 * 1024 * 1024; // 20MB

interface RestoreRequestBody {
  data?: string;
  mimeType?: string;
  apiKey?: string;
}

export async function POST(req: Request) {
  let body: RestoreRequestBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "请求数据格式错误" }, { status: 400 });
  }

  const { data: base64Data, mimeType, apiKey: customApiKey } = body;

  if (typeof base64Data !== "string" || !base64Data.trim()) {
    return NextResponse.json(
      { error: "缺少或无效的图片数据" },
      { status: 400 },
    );
  }

  const normalizedMime = (mimeType ?? "image/jpeg").toLowerCase();
  
  if (
    !ALLOWED_MIME_TYPES.includes(
      normalizedMime as (typeof ALLOWED_MIME_TYPES)[number],
    )
  ) {
    return NextResponse.json(
      { error: "仅支持 JPG、PNG、WebP 格式的图片" },
      { status: 400 },
    );
  }

  const estimatedSize = (base64Data.length * 3) / 4;
  if (estimatedSize > MAX_IMAGE_SIZE_BYTES) {
    return NextResponse.json(
      { error: "图片过大，请上传 20MB 以内的图片" },
      { status: 400 },
    );
  }

  const apiKey = customApiKey?.trim() || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "请先在设置中配置 Gemini API 密钥" },
      { status: 500 },
    );
  }

  const ai = new GoogleGenAI({ apiKey });

  let response;
  try {
    response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: [
        { inlineData: { mimeType: normalizedMime, data: base64Data } },
        RESTORE_PROMPT,
      ],
      config: {
        responseModalities: ["IMAGE"],
      },
    });
  } catch (error) {
    console.error("Error generating AI reply:", error);
    const msg =
      error instanceof Error && "AI 修复失败，请检查网络或稍后重试";
    return NextResponse.json({ error: msg }, { status: 500 });
  }

  type PartWithInlineData = {
    inlineData?: { mimeType?: string; data?: string };
  };
  const imagePart = response.candidates?.[0]?.content?.parts?.find(
    (p: PartWithInlineData) => p.inlineData?.data,
  ) as PartWithInlineData | undefined;

  if (!imagePart?.inlineData?.data) {
    return NextResponse.json(
      { error: "AI 未能生成修复图像，请重试" },
      { status: 500 },
    );
  }

  const outMime = imagePart.inlineData.mimeType || "image/png";
  const imageDataUrl = `data:${outMime};base64,${imagePart.inlineData.data}`;

  return NextResponse.json({ image: imageDataUrl });
}
