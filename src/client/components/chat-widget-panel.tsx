"use client";

import { useEffect, useRef } from "react";
import type { Message } from "@/shared/types/message.types";
import { ChatBubble } from "@/client/components/chat-bubble";
import { TypingIndicator } from "@/client/components/typing-indicator";

interface ChatWidgetPanelProps {
  id: "direct" | "memory";
  title: string;
  badge: string;
  subtitle: string;
  accentColor: string;
  messages: Message[];
  loading: boolean;
  clearing: boolean;
  onClear: () => void;
  onRequestAccess?: () => void;
  onRetract?: () => void;
  retracting?: boolean;
  emptyTitle: string;
  emptyDescription: string;
  emptyIcon?: React.ReactNode;
  suggestedPrompts?: string[];
  onSelectPrompt?: (prompt: string) => void;
}

export function ChatWidgetPanel({
  id,
  title,
  badge,
  subtitle,
  accentColor,
  messages,
  loading,
  clearing,
  onClear,
  onRequestAccess,
  onRetract,
  retracting = false,
  emptyTitle,
  emptyDescription,
  emptyIcon,
  suggestedPrompts,
  onSelectPrompt,
}: ChatWidgetPanelProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const isMemory = id === "memory";

  return (
    <div
      className={`flex flex-col h-full rounded-2xl border bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xs overflow-hidden shadow-xs transition-all ${
        isMemory
          ? "border-purple-200/90 dark:border-purple-900/60 shadow-purple-500/5"
          : "border-zinc-200 dark:border-zinc-800"
      }`}
    >
      {/* Widget Header */}
      <div
        className={`shrink-0 flex items-center justify-between px-4 py-3 border-b ${
          isMemory
            ? "border-purple-100 dark:border-purple-900/40 bg-purple-50/50 dark:bg-purple-950/20"
            : "border-zinc-200/80 dark:border-zinc-800/80 bg-zinc-50/60 dark:bg-zinc-900/50"
        }`}
      >
        <div className="flex items-center gap-2.5">
          <div
            className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${
              isMemory
                ? "bg-purple-600 text-white shadow-xs"
                : "bg-zinc-800 text-white dark:bg-zinc-200 dark:text-zinc-900 shadow-xs"
            }`}
          >
            {isMemory ? "🧠" : "⚡"}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
                {title}
              </span>
              <span
                className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${
                  isMemory
                    ? "bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800"
                    : "bg-zinc-100 text-zinc-600 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700"
                }`}
              >
                {badge}
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 dark:text-zinc-500 line-clamp-1">{subtitle}</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {isMemory && onRequestAccess && (
            <button
              onClick={onRequestAccess}
              className="text-[11px] font-medium text-purple-600 dark:text-purple-400 bg-purple-100/70 dark:bg-purple-950/60 hover:bg-purple-200/70 border border-purple-200 dark:border-purple-800 px-2 py-1 rounded-md transition-colors"
              title="Request new category grants from vault owner"
            >
              + Request Access
            </button>
          )}

          {isMemory && onRetract && (
            <button
              onClick={onRetract}
              disabled={retracting}
              className="text-[11px] text-zinc-400 hover:text-amber-600 dark:hover:text-amber-400 px-2 py-1 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              title="Retract all memories stored in Vault by this app"
            >
              {retracting ? "Retracting..." : "Retract"}
            </button>
          )}

          {messages.length > 0 && (
            <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-500">
              {messages.length} msg{messages.length === 1 ? "" : "s"}
            </span>
          )}

          <button
            onClick={onClear}
            disabled={clearing || messages.length === 0}
            title={`Clear ${title} history`}
            className="text-[11px] text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 px-2 py-1 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            {clearing ? "..." : "Clear"}
          </button>
        </div>
      </div>

      {/* Widget Message Body */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.length === 0 && !loading ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 my-auto animate-fade-in">
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 text-lg border ${
                isMemory
                  ? "bg-purple-50 text-purple-600 border-purple-200 dark:bg-purple-950/40 dark:border-purple-800"
                  : "bg-zinc-100 text-zinc-600 border-zinc-200 dark:bg-zinc-800/60 dark:text-zinc-400 dark:border-zinc-700"
              }`}
            >
              {emptyIcon ?? (isMemory ? "🧠" : "💬")}
            </div>
            <h4 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 mb-1">
              {emptyTitle}
            </h4>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-xs leading-relaxed mb-4">
              {emptyDescription}
            </p>

            {suggestedPrompts && suggestedPrompts.length > 0 && onSelectPrompt && (
              <div className="w-full max-w-xs space-y-1.5 text-left">
                <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block mb-1">
                  Try asking:
                </span>
                {suggestedPrompts.slice(0, 2).map((prompt, idx) => (
                  <button
                    key={idx}
                    onClick={() => onSelectPrompt(prompt)}
                    className="w-full text-left p-2 rounded-lg text-xs bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-800/60 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200/60 dark:border-zinc-700/60 transition-colors line-clamp-1"
                  >
                    💡 {prompt}
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          messages.map(m => (
            <ChatBubble
              key={m.id}
              message={m}
              accentColor={accentColor}
              variant={isMemory ? "memory" : "direct"}
            />
          ))
        )}

        {loading && <TypingIndicator />}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
