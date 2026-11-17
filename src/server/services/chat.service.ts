import { openai } from "@/server/lib/ai";
import { chatRepository } from "@/server/repository/chat.repository";
import { SYSTEM_PROMPT } from "@/shared/constants/chat.constants";

export const chatService = {
  getHistory: () => chatRepository.getAll(),

  send: async (message: string): Promise<string> => {
    await chatRepository.insertUser(message);

    const recent = await chatRepository.getRecent();

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        ...recent.map(m => ({
          role: m.role as "user" | "assistant",
          content: m.content,
        })),
      ],
    });

    const reply = completion.choices[0].message.content ?? "";
    await chatRepository.insertAssistant(reply);
    return reply;
  },

  clearHistory: () => chatRepository.deleteAll(),
};
