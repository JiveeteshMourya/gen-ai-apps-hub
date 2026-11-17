import type { Message } from "@/shared/types/message.types";

export function ChatBubble({
  message,
  accentColor = "indigo",
}: {
  message: Message;
  accentColor?: string;
}) {
  const isUser = message.role === "user";

  const getAccentClass = () => {
    switch (accentColor) {
      case "emerald":
        return "bg-emerald-600 text-white";
      case "cyan":
        return "bg-cyan-600 text-white";
      case "rose":
        return "bg-rose-600 text-white";
      case "amber":
        return "bg-amber-600 text-white";
      case "indigo":
      default:
        return "bg-indigo-600 text-white";
    }
  };

  return (
    <div className={`flex flex-col ${isUser ? "items-end" : "items-start"}`}>
      <div className="flex items-center gap-1.5 mb-1 px-1 text-[11px] font-medium text-zinc-400 dark:text-zinc-500">
        <span>{isUser ? "You" : "Assistant"}</span>
        {message.createdAt && (
          <span>
            •{" "}
            {new Date(message.createdAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        )}
      </div>

      <div
        className={`max-w-[85%] sm:max-w-[78%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap shadow-xs ${
          isUser
            ? `${getAccentClass()} rounded-br-xs`
            : "bg-white text-zinc-900 border border-zinc-200/80 dark:bg-zinc-900 dark:text-zinc-100 dark:border-zinc-800 rounded-bl-xs"
        }`}
      >
        {message.content}
      </div>
    </div>
  );
}
