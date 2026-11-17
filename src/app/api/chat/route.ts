import { db } from "@/db";
import { messages } from "@/db/schema";
import { asc, desc } from "drizzle-orm";
import OpenAI from "openai";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const SYSTEM_PROMPT = "You are a helpful, concise assistant. Answer clearly and directly.";

export async function GET() {
  try {
    const history = await db.select().from(messages).orderBy(asc(messages.createdAt));
    return Response.json(history);
  } catch (err) {
    console.error("[GET /api/chat]", err);
    return Response.json({ error: "Failed to load messages" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { message } = await req.json();

    await db.insert(messages).values({ role: "user", content: message });

    const history = await db.select().from(messages).orderBy(asc(messages.createdAt));

    // Fetch only the most recent 5 messages for OpenAI context
    const recent = await db
      .select()
      .from(messages)
      .orderBy(desc(messages.createdAt))
      .limit(5)
      .then(rows => rows.reverse()); // back to chronological order

    const chatMessages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      { role: "system", content: SYSTEM_PROMPT },
      ...recent.map(m => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
    ];

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: chatMessages,
    });

    const reply = completion.choices[0].message.content ?? "";

    await db.insert(messages).values({ role: "assistant", content: reply });

    return Response.json({ reply });
  } catch (err) {
    console.error("[POST /api/chat]", err);
    return Response.json({ error: "Something went wrong" }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    await db.delete(messages);
    return Response.json({ ok: true });
  } catch (err) {
    console.error("[DELETE /api/chat]", err);
    return Response.json({ error: "Failed to clear history" }, { status: 500 });
  }
}
