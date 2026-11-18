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
  const metadata = memoryMsg.metadata as Record<string, unknown> | undefined;

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
    <div className={`flex flex-col ${isUser ? "items-end" : "items-start"} group`}>
      {/* Header Info */}
      <div className="flex items-center gap-1.5 mb-1 px-1 text-[11px] font-medium text-zinc-400 dark:text-zinc-500">
        {!isUser && (
          <span
            className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[8px] font-bold ${
              variant === "memory"
                ? "bg-purple-600 text-white"
                : "bg-zinc-800 text-white dark:bg-zinc-200 dark:text-zinc-900"
            }`}
          >
            {variant === "memory" ? "🧠" : "⚡"}
          </span>
        )}
        <span>
          {isUser ? "You" : variant === "memory" ? "Memory Assistant" : "Direct Assistant"}
        </span>
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

      {/* Main Message Bubble */}
      <div
        className={`max-w-[92%] sm:max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap shadow-xs transition-all ${
          isUser
            ? variant === "memory"
              ? `${getAccentClass()} rounded-br-xs`
              : "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 rounded-br-xs"
            : variant === "memory"
              ? "bg-white text-zinc-900 border border-purple-200/90 dark:bg-zinc-900 dark:text-zinc-100 dark:border-purple-900/60 rounded-bl-xs shadow-purple-500/5 ring-1 ring-purple-500/5"
              : "bg-white text-zinc-900 border border-zinc-200/90 dark:bg-zinc-900 dark:text-zinc-100 dark:border-zinc-800 rounded-bl-xs shadow-xs"
        }`}
      >
        {message.content}

        {/* Memory Vault Context Drawer for Memory Widget */}
        {hasContext && (
          <div className="mt-3 pt-2.5 border-t border-purple-100 dark:border-purple-900/50">
            <button
              onClick={() => setShowContext(!showContext)}
              className="text-[11px] font-semibold text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 flex items-center justify-between w-full py-1 px-2 rounded-lg bg-purple-50/70 dark:bg-purple-950/40 border border-purple-100 dark:border-purple-900/60 transition-colors"
            >
              <span className="flex items-center gap-1.5">
                <span>🧠</span>
                <span>{showContext ? "Hide Vault Context" : "View Context from Memory Vault"}</span>
              </span>
              <span className="text-[10px]">{showContext ? "▲" : "▼"}</span>
            </button>

            {showContext && (
              <div className="mt-2 p-3 bg-purple-50/90 dark:bg-purple-950/50 rounded-xl text-xs text-purple-900 dark:text-purple-200 border border-purple-200/80 dark:border-purple-800/80 animate-fade-in space-y-2">
                <div className="flex items-center justify-between text-[10px] uppercase font-bold tracking-wider text-purple-600 dark:text-purple-400">
                  <span>Injected Vault Knowledge:</span>
                </div>
                <p className="italic leading-relaxed text-zinc-700 dark:text-zinc-300">
                  &ldquo;{memoryMsg.context}&rdquo;
                </p>

                {metadata && (
                  <div className="flex flex-wrap gap-1.5 pt-1 text-[10px] border-t border-purple-200/50 dark:border-purple-800/50">
                    {typeof metadata.storedMemoriesCount === "number" && (
                      <span className="px-1.5 py-0.5 rounded bg-purple-200/60 dark:bg-purple-900/60 text-purple-800 dark:text-purple-200 font-medium">
                        ✨ {metadata.storedMemoriesCount} new memory saved
                      </span>
                    )}
                    {Array.isArray(metadata.sources) && metadata.sources.length > 0 && (
                      <span className="px-1.5 py-0.5 rounded bg-purple-200/60 dark:bg-purple-900/60 text-purple-800 dark:text-purple-200 font-medium">
                        📚 {metadata.sources.length} sources used
                      </span>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
