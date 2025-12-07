import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

// 强制使用 Edge Runtime (Cloudflare Workers 需要)
export const runtime = 'edge';

export async function POST(req: Request) {
  try {
    // 1. 获取 API Key (修改为匹配 Cloudflare 的变量名)
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        return NextResponse.json(
            { error: "服务器端未配置 GEMINI_API_KEY" },
            { status: 500 }
        );
    }

    // 2. 解析前端传来的数据
    const body = await req.json();
    const { prompt, systemContext } = body;

    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt 不能为空" },
        { status: 400 }
      );
    }

    // 3. 初始化 Gemini
    const ai = new GoogleGenAI({ apiKey: apiKey });

    // 4. 调用模型
    const fullContent = systemContext 
      ? `${systemContext}\n\n用户问题: ${prompt}`
      : prompt;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: fullContent,
    });

    const text = response.text;

    return NextResponse.json({ text });

  } catch (error: any) {
    console.error("Gemini API Error:", error);
    return NextResponse.json(
      { error: error.message || "AI 服务响应异常" },
      { status: 500 }
    );
  }
}