import type { Message } from "@/shared/types/message.types";

export function ChatBubble({ message }: { message: Message }) {
  const isUser = message.role === "user";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
          isUser
            ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
            : "bg-white text-zinc-800 border border-zinc-200 dark:bg-zinc-800 dark:text-zinc-100 dark:border-zinc-700"
        }`}
      >
        {message.content}
      </div>
    </div>
  );
}
