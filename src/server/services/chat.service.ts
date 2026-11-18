import { openai } from "@/server/lib/ai";
import { directChatRepository } from "@/server/repository/direct-chat.repository";
import { memoryChatRepository } from "@/server/repository/memory-chat.repository";
import { getAppConfig } from "@/shared/constants/apps.constants";
import { SYSTEM_PROMPT } from "@/shared/constants/chat.constants";

export const chatService = {
  // --- Direct Chat (Left Widget: direct_messages model) ---
  getDirectHistory: (appId: string) => directChatRepository.getAllByApp(appId),

  sendDirect: async (appId: string, message: string): Promise<string> => {
    await directChatRepository.insertUser(appId, message);

    const recent = await directChatRepository.getRecentByApp(appId);
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
    await directChatRepository.insertAssistant(appId, reply);
    return reply;
  },

  clearDirectHistory: (appId: string) => directChatRepository.deleteByApp(appId),

  // --- Memory Chat (Right Widget: memory_messages model) ---
  getMemoryHistory: (appId: string) => memoryChatRepository.getAllByApp(appId),

  sendMemory: async (appId: string, message: string): Promise<string> => {
    await memoryChatRepository.insertUser(appId, message);

    const recent = await memoryChatRepository.getRecentByApp(appId);
    const appConfig = getAppConfig(appId);
    const baseSystemPrompt = appConfig ? appConfig.systemPrompt : SYSTEM_PROMPT;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: baseSystemPrompt },
        ...recent.map(m => ({
          role: m.role as "user" | "assistant",
          content: m.content,
        })),
      ],
    });

    const reply = completion.choices[0].message.content ?? "";
    await memoryChatRepository.insertAssistant(appId, reply);
    return reply;
  },

  clearMemoryHistory: (appId: string) => memoryChatRepository.deleteByApp(appId),

  // --- Aggregate / Batch Helpers ---
  getAllHistory: async (appId: string) => {
    const [direct, memory] = await Promise.all([
      directChatRepository.getAllByApp(appId),
      memoryChatRepository.getAllByApp(appId),
    ]);
    return { direct, memory };
  },

  clearAllHistory: async (appId: string) => {
    await Promise.all([
      directChatRepository.deleteByApp(appId),
      memoryChatRepository.deleteByApp(appId),
    ]);
  },

  // Legacy mappings
  getHistory: (appId: string) => directChatRepository.getAllByApp(appId),
  send: (appId: string, message: string) => chatService.sendDirect(appId, message),
  clearHistory: (appId: string) => directChatRepository.deleteByApp(appId),
};
