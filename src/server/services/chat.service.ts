import { openai } from "@/server/lib/ai";
import { chatRepository } from "@/server/repository/chat.repository";
import { getAppConfig } from "@/shared/constants/apps.constants";
import { SYSTEM_PROMPT } from "@/shared/constants/chat.constants";

export const chatService = {
  getHistory: (appId: string) => chatRepository.getAllByApp(appId),

  send: async (appId: string, message: string): Promise<string> => {
    await chatRepository.insertUser(appId, message);

    const recent = await chatRepository.getRecentByApp(appId);
    const appConfig = getAppConfig(appId);
    const systemPrompt = appConfig ? appConfig.systemPrompt : SYSTEM_PROMPT;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        ...recent.map(m => ({
          role: m.role as "user" | "assistant",
          content: m.content,
        })),
      ],
    });

    const reply = completion.choices[0].message.content ?? "";
    await chatRepository.insertAssistant(appId, reply);
    return reply;
  },

  clearHistory: (appId: string) => chatRepository.deleteByApp(appId),
};
