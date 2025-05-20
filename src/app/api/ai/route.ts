import { getServerSession } from "next-auth";
import OpenAi from "openai";
import { NextRequest, NextResponse } from "next/server";

import { authOptions } from "@/libs/auth";
import prisma from "@/libs/prisma";

const openai = new OpenAi({ apiKey: process.env.OPEN_API_KEY });

interface AiRequest {
  prompt: string;
  role: "user" | "assistant";
}

interface ErrorResponse {
  error: string;
}

export async function POST(
  req: NextRequest,
): Promise<NextResponse<any | ErrorResponse>> {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { prompt, role } = (await req.json()) as AiRequest;

    if (!prompt || !role) {
      return NextResponse.json(
        { error: "Please provide a prompt and role" },
        { status: 400 },
      );
    }

    const chatCompletion = await openai.chat.completions.create({
      messages: [{ role, content: prompt }],
      model: "gpt-3.5-turbo",
    });

    const chatMessages = [
      { content: prompt, role },
      chatCompletion.choices[0].message,
    ];

    await Promise.all(
      chatMessages.map(async (message) => {
        const { role, content } = message;

        await prisma.aiChat.create({
          data: {
            role,
            content,
            userId: session.user.id,
          },
        });
      }),
    );

    return NextResponse.json(chatCompletion, {
      status: 200,
      statusText: "AI Result",
    });
  } catch (error) {
    console.error("Failed to process AI request:", error);
    return NextResponse.json(
      { error: "Failed to process AI request" },
      { status: 500 },
    );
  }
}

export async function GET(
  req: NextRequest,
): Promise<NextResponse<any | ErrorResponse>> {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { aiChat: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user, {
      status: 200,
      statusText: "Successful",
    });
  } catch (error) {
    console.error("Failed to fetch chat history:", error);
    return NextResponse.json(
      { error: "Failed to fetch chat history" },
      { status: 500 },
    );
  }
}
