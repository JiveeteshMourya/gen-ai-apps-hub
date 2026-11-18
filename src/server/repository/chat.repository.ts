import { directChatRepository } from "./direct-chat.repository";
import { memoryChatRepository } from "./memory-chat.repository";

export { directChatRepository, memoryChatRepository };

// Backward-compatible default chatRepository mapping to directChatRepository
export const chatRepository = directChatRepository;
