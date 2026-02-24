import { NextResponse } from "next/server";

const RESTORE_PROMPT = `
You are a professional AI photo digitizer and restorer. 
TASK 1: OBJECT DETECTION & CROPPING. Detect the actual old photograph within this real-life shot. Crop out any desk, hands, or background elements. Perform perspective correction to make the photo rectangular.
TASK 2: RESTORATION. Remove scratches, dust, and noise. Sharpen the facial details.
TASK 3: COLORIZATION. Add natural, historically accurate colors.
OUTPUT: Return ONLY the cropped and fully restored image.
`;

const delays = [1000, 2000, 4000, 8000, 16000];
const maxRetries = 5;

async function fetchWithRetry(
  url: string,
  options: RequestInit
): Promise<unknown> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(url, options);
      if (!response.ok) {
        const text = await response.text();
        throw new Error(`HTTP ${response.status}: ${text}`);
      }
      return await response.json();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise((res) => setTimeout(res, delays[i]));
    }
  }
  throw new Error("Max retries exceeded");
}

export async function POST(req: Request) {
  try {
    const { data: base64Data, mimeType } = await req.json();

    if (!base64Data || !mimeType) {
      return NextResponse.json(
        { error: "Missing data or mimeType" },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "API key not configured" },
        { status: 500 }
      );
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image-preview:generateContent?key=${apiKey}`;

    const payload = {
      contents: [
        {
          role: "user",
          parts: [
            { text: RESTORE_PROMPT },
            {
              inlineData: {
                mimeType: mimeType || "image/jpeg",
                data: base64Data,
              },
            },
          ],
        },
      ],
      generationConfig: { responseModalities: ["IMAGE"] },
    };

    const result = (await fetchWithRetry(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })) as {
      candidates?: Array<{
        content?: {
          parts?: Array<{
            inlineData?: { mimeType?: string; data?: string };
          }>;
        };
      }>;
    };

    const imagePart = result.candidates?.[0]?.content?.parts?.find(
      (p) => p.inlineData
    );

    if (!imagePart?.inlineData?.data) {
      return NextResponse.json(
        { error: "AI did not generate an image" },
        { status: 500 }
      );
    }

    const imageDataUrl = `data:${imagePart.inlineData.mimeType || "image/png"};base64,${imagePart.inlineData.data}`;

    return NextResponse.json({ image: imageDataUrl });
  } catch (err) {
    console.error("Restore API error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Restore failed" },
      { status: 500 }
    );
  }
}
