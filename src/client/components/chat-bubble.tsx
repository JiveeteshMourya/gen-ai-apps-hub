"use client";

import { useState } from "react";
import type { Message, MemoryMessage } from "@/shared/types/message.types";

export function ChatBubble({
  message,
  accentColor = "indigo",
  variant = "direct",
}: {
  message: Message | MemoryMessage;
  accentColor?: string;
  variant?: "direct" | "memory";
}) {
  const isUser = message.role === "user";
  const [showContext, setShowContext] = useState(false);
  const memoryMsg = message as MemoryMessage;
  const hasContext = Boolean(memoryMsg.context);

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
        <span>{isUser ? "You" : variant === "memory" ? "Memory Assistant" : "Assistant"}</span>
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
        className={`max-w-[90%] sm:max-w-[82%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap shadow-xs ${
          isUser
            ? variant === "memory"
              ? `${getAccentClass()} rounded-br-xs`
              : "bg-zinc-800 text-white dark:bg-zinc-200 dark:text-zinc-900 rounded-br-xs"
            : variant === "memory"
              ? "bg-white text-zinc-900 border border-purple-200/80 dark:bg-zinc-900 dark:text-zinc-100 dark:border-purple-900/60 rounded-bl-xs shadow-xs"
              : "bg-white text-zinc-900 border border-zinc-200/80 dark:bg-zinc-900 dark:text-zinc-100 dark:border-zinc-800 rounded-bl-xs shadow-xs"
        }`}
      >
        {message.content}

        {hasContext && (
          <div className="mt-2.5 pt-2 border-t border-purple-100 dark:border-purple-900/50">
            <button
              onClick={() => setShowContext(!showContext)}
              className="text-[11px] font-medium text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1"
            >
              <span>{showContext ? "Hide Memory Context" : "View Memory Context"}</span>
              <span>{showContext ? "▲" : "▼"}</span>
            </button>
            {showContext && (
              <div className="mt-1.5 p-2 bg-purple-50/80 dark:bg-purple-950/40 rounded-lg text-xs text-purple-900 dark:text-purple-200 border border-purple-100 dark:border-purple-900">
                {memoryMsg.context}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
