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
      className={`flex flex-col h-full rounded-2xl border bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md overflow-hidden shadow-xs transition-all ${
        isMemory
          ? "border-purple-200/80 dark:border-purple-900/50 shadow-purple-500/5 ring-1 ring-purple-500/10"
          : "border-zinc-200/90 dark:border-zinc-800/90 ring-1 ring-zinc-500/5"
      }`}
    >
      {/* Widget Header */}
      <div
        className={`shrink-0 flex items-center justify-between px-4 py-3 border-b ${
          isMemory
            ? "border-purple-100 dark:border-purple-900/40 bg-gradient-to-r from-purple-50/70 to-indigo-50/40 dark:from-purple-950/30 dark:to-zinc-900/50"
            : "border-zinc-200/80 dark:border-zinc-800/80 bg-zinc-50/80 dark:bg-zinc-900/60"
        }`}
      >
        <div className="flex items-center gap-2.5">
          <div
            className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shadow-xs ${
              isMemory
                ? "bg-purple-600 text-white shadow-purple-500/20"
                : "bg-zinc-800 text-white dark:bg-zinc-200 dark:text-zinc-900 shadow-zinc-500/20"
            }`}
          >
            {isMemory ? (
              <svg
                className="w-4 h-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 4.44-2.04" />
                <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-4.44-2.04" />
              </svg>
            ) : (
              <svg
                className="w-4 h-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path d="m13 2-2 10h5L11 22l2-10H8l5-10z" />
              </svg>
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
                {title}
              </span>
              <span
                className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${
                  isMemory
                    ? "bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-950/70 dark:text-purple-300 dark:border-purple-800"
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
              className="text-[11px] font-medium text-purple-600 dark:text-purple-400 bg-purple-100/70 dark:bg-purple-950/60 hover:bg-purple-200/70 border border-purple-200 dark:border-purple-800 px-2 py-1 rounded-md transition-colors flex items-center gap-1"
              title="Request new category grants from vault owner"
            >
              <span>+</span>
              <span>Access</span>
            </button>
          )}

          {isMemory && onRetract && (
            <button
              onClick={onRetract}
              disabled={retracting}
              className="text-[11px] text-zinc-400 hover:text-amber-600 dark:hover:text-amber-400 px-2 py-1 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              title="Retract all memories stored in Vault by this app"
            >
              {retracting ? "..." : "Retract"}
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
      <div className="flex-1 overflow-y-auto px-4 sm:px-5 py-5 space-y-4">
        {messages.length === 0 && !loading ? (
          <div className="h-full min-h-[360px] flex flex-col items-center justify-center text-center p-4 my-auto animate-fade-in">
            {/* Polished Hero Badge Icon */}
            <div className="relative mb-3.5 group">
              <div
                className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-transform duration-300 group-hover:scale-105 shadow-sm ${
                  isMemory
                    ? "bg-gradient-to-br from-purple-500/15 via-indigo-500/10 to-purple-600/20 text-purple-600 dark:text-purple-400 border border-purple-200/90 dark:border-purple-800/80 shadow-purple-500/10"
                    : "bg-gradient-to-br from-zinc-100 to-zinc-200/60 dark:from-zinc-800 dark:to-zinc-800/50 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700/80"
                }`}
              >
                {isMemory ? (
                  <svg
                    className="w-7 h-7"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1.8}
                  >
                    <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 4.44-2.04" />
                    <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-4.44-2.04" />
                  </svg>
                ) : (
                  <svg
                    className="w-7 h-7"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1.8}
                  >
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    <path
                      d="M8 10h.01M12 10h.01M16 10h.01"
                      strokeWidth={2.5}
                      strokeLinecap="round"
                    />
                  </svg>
                )}
              </div>
            </div>

            {/* Mode Tag */}
            <div className="mb-1.5">
              <span
                className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full border ${
                  isMemory
                    ? "bg-purple-50 text-purple-700 border-purple-200/80 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800"
                    : "bg-zinc-100 text-zinc-600 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700"
                }`}
              >
                {isMemory ? "Memory-Augmented" : "Isolated Direct LLM"}
              </span>
            </div>

            {/* Title & Description */}
            <h4 className="text-base font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
              {emptyTitle}
            </h4>
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400 max-w-sm leading-relaxed">
              {emptyDescription}
            </p>

            {/* Interactive Suggested Prompts */}
            {suggestedPrompts && suggestedPrompts.length > 0 && onSelectPrompt && (
              <div className="w-full max-w-md mt-6 text-left">
                <div className="flex items-center justify-between mb-2 px-1">
                  <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                    Try Asking
                  </span>
                  <span className="text-[10px] text-zinc-400 dark:text-zinc-500">
                    Click to fill input
                  </span>
                </div>

                <div className="flex flex-col gap-2">
                  {suggestedPrompts.slice(0, 3).map((prompt, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => onSelectPrompt(prompt)}
                      className="group flex items-start gap-3 p-3 rounded-xl border border-zinc-200/90 dark:border-zinc-800/90 bg-white dark:bg-zinc-900/90 hover:bg-zinc-50 dark:hover:bg-zinc-800/80 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all duration-150 text-left shadow-xs hover:shadow-sm"
                    >
                      <div className="w-5 h-5 rounded-md bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200/60 dark:border-amber-800/50 flex items-center justify-center shrink-0 mt-0.5 text-[11px]">
                        💡
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-zinc-700 dark:text-zinc-300 group-hover:text-zinc-900 dark:group-hover:text-zinc-100 leading-snug line-clamp-2">
                          {prompt}
                        </p>
                      </div>
                      <svg
                        className="w-4 h-4 text-zinc-400 group-hover:text-zinc-700 dark:group-hover:text-zinc-200 shrink-0 mt-0.5 transition-transform group-hover:translate-x-0.5"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="m9 18 6-6-6-6" />
                      </svg>
                    </button>
                  ))}
                </div>
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

        {loading && <TypingIndicator variant={isMemory ? "memory" : "direct"} />}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
