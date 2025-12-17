import { GoogleGenAI } from "@google/genai";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { ChatRequestSchema } from "@/lib/validations";
import { NextRequest, NextResponse } from "next/server";

// إعداد Rate Limiting (اختياري إذا كانت المتغيرات موجودة)
let ratelimit: Ratelimit | undefined;

if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
  ratelimit = new Ratelimit({
    redis: new Redis({
      url: process.env.KV_REST_API_URL,
      token: process.env.KV_REST_API_TOKEN,
    }),
    limiter: Ratelimit.slidingWindow(10, "60 s"), // 10 رسائل في الدقيقة
  });
}

export async function POST(req: NextRequest) {
  try {
    // 1. التحقق من الأمان (Rate Limiting)
    if (ratelimit) {
      const ip = req.headers.get("x-forwarded-for") ?? "127.0.0.1";
      const { success } = await ratelimit.limit(ip);
      if (!success) {
        return new NextResponse("تجاوزت الحد المسموح من الطلبات. يرجى المحاولة لاحقاً.", { status: 429 });
      }
    }

    // 2. التحقق من صحة البيانات (Input Validation)
    const body = await req.json();
    const validationResult = ChatRequestSchema.safeParse(body);

    if (!validationResult.success) {
      return new NextResponse("بيانات غير صالحة", { status: 400 });
    }

    const { messages } = validationResult.data;
    const lastMessage = messages[messages.length - 1].content;

    // 3. الاتصال بـ Google GenAI
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      return new NextResponse("API Key not configured", { status: 500 });
    }

    const ai = new GoogleGenAI({ apiKey });
    
    // 4. إنشاء البث (Streaming Response)
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // FIX: Correctly structure the `contents` and `systemInstruction` for generateContentStream.
          const response = await ai.models.generateContentStream({
            model: 'gemini-2.5-flash',
            contents: [{ parts: [{ text: lastMessage }] }],
            config: {
              systemInstruction: "أنت مساعد إسلامي ذكي ومؤدب. أجب باختصار ودقة. استخدم اللغة العربية.",
            }
          });

          for await (const chunk of response) {
            const text = chunk.text;
            if (text) {
              controller.enqueue(new TextEncoder().encode(text));
            }
          }
          controller.close();
        } catch (error) {
          controller.error(error);
        }
      },
    });

    return new NextResponse(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
      },
    });

  } catch (error) {
    console.error("Chat API Error:", error);
    return new NextResponse("حدث خطأ في الخادم", { status: 500 });
  }
}