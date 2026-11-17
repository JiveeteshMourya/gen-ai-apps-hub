"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { Message } from "@/shared/types/message.types";
import { ChatBubble } from "@/client/components/chat-bubble";
import { TypingIndicator } from "@/client/components/typing-indicator";
import { AppIcon } from "@/client/components/app-icons";
import { APPS, getAppConfig, type AppId } from "@/shared/constants/apps.constants";

interface ChatPageProps {
  appId: AppId | string;
}

export function ChatPage({ appId }: ChatPageProps) {
  const appConfig = getAppConfig(appId);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [clearing, setClearing] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Fetch messages scoped to this specific app
  useEffect(() => {
    let isMounted = true;

    fetch(`/api/chat?appId=${encodeURIComponent(appId)}`)
      .then(r => r.json())
      .then(res => {
        if (isMounted && res.success && Array.isArray(res.data)) {
          setMessages(res.data);
        }
      })
      .catch(console.error)
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [appId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const send = async (contentToSend?: string) => {
    const text = (contentToSend ?? input).trim();
    if (!text || loading) return;

    if (!contentToSend) {
      setInput("");
    }
    setLoading(true);

    const optimistic: Message = {
      id: Date.now(),
      appId,
      role: "user",
      content: text,
      createdAt: new Date(),
    };
    setMessages(prev => [...prev, optimistic]);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, appId }),
      });
      const body = await res.json();
      if (!res.ok || !body.success) {
        throw new Error(body.message ?? "Unknown error occurred");
      }

      const reply: Message = {
        id: Date.now() + 1,
        appId,
        role: "assistant",
        content: body.data.reply,
        createdAt: new Date(),
      };
      setMessages(prev => [...prev, reply]);
    } catch (err: unknown) {
      console.error(err);
      const errMsg: Message = {
        id: Date.now() + 1,
        appId,
        role: "assistant",
        content:
          err instanceof Error
            ? `⚠️ ${err.message}`
            : "⚠️ Something went wrong. Check server logs.",
        createdAt: new Date(),
      };
      setMessages(prev => [...prev, errMsg]);
    } finally {
      setLoading(false);
    }
  };

  const clearHistory = async () => {
    if (clearing) return;
    setClearing(true);
    try {
      await fetch(`/api/chat?appId=${encodeURIComponent(appId)}`, {
        method: "DELETE",
      });
      setMessages([]);
    } catch (err) {
      console.error("Failed to clear history", err);
    } finally {
      setClearing(false);
    }
  };

  if (!appConfig) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center">
        <h1 className="text-2xl font-bold mb-2">AI App Not Found</h1>
        <p className="text-zinc-500 mb-6">
          The requested assistant &quot;{appId}&quot; does not exist in the Hub.
        </p>
        <Link
          href="/"
          className="px-4 py-2 bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 rounded-lg text-sm font-medium"
        >
          Return to Hub
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-zinc-50 dark:bg-zinc-950">
      {/* Top Navigation Bar */}
      <header className="shrink-0 flex items-center justify-between px-4 sm:px-6 py-3 border-b border-zinc-200 dark:border-zinc-800 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md z-10">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-xs font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors px-2 py-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            <svg
              className="w-4 h-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m15 18-6-6 6-6" />
            </svg>
            <span className="hidden sm:inline">Hub</span>
          </Link>

          <div className="h-4 w-px bg-zinc-200 dark:bg-zinc-800" />

          <div className="flex items-center gap-2.5">
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center ${appConfig.accent.bgSoft} ${appConfig.accent.text}`}
            >
              <AppIcon id={appConfig.id} className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
                  {appConfig.name}
                </span>
                <span
                  className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${appConfig.accent.bgSoft} ${appConfig.accent.text} ${appConfig.accent.border}`}
                >
                  {appConfig.badge}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick App Switcher & Actions */}
        <div className="flex items-center gap-2">
          {/* Quick switcher menu */}
          <div className="hidden md:flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800/80 p-1 rounded-xl text-xs">
            {APPS.map(otherApp => {
              const isActive = otherApp.id === appConfig.id;
              return (
                <Link
                  key={otherApp.id}
                  href={`/apps/${otherApp.id}`}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                    isActive
                      ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-xs"
                      : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200"
                  }`}
                  title={otherApp.name}
                >
                  {otherApp.shortName}
                </Link>
              );
            })}
          </div>

          <button
            onClick={clearHistory}
            disabled={clearing || messages.length === 0}
            className="text-xs text-zinc-500 hover:text-rose-600 dark:hover:text-rose-400 px-2.5 py-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {clearing ? "Clearing..." : "Clear history"}
          </button>
        </div>
      </header>

      {/* Message Feed */}
      <main className="flex-1 overflow-y-auto px-4 py-6">
        <div className="mx-auto max-w-3xl flex flex-col gap-5">
          {/* Empty State / Welcome Hero */}
          {messages.length === 0 && !loading && (
            <div className="flex flex-col items-center justify-center my-auto py-12 text-center animate-fade-in">
              <div
                className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 ${appConfig.accent.bgSoft} ${appConfig.accent.text} border ${appConfig.accent.border} shadow-sm`}
              >
                <AppIcon id={appConfig.id} className="w-7 h-7" />
              </div>
              <h2 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                {appConfig.name}
              </h2>
              <p className="mt-1.5 text-sm text-zinc-500 max-w-md">{appConfig.tagline}</p>

              <div className="mt-8 w-full max-w-lg">
                <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-3 text-left">
                  Suggested Prompts
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-left">
                  {appConfig.suggestedPrompts.map((prompt, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setInput(prompt);
                      }}
                      className="p-3 text-xs text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-xs transition-all text-left"
                    >
                      <span className="line-clamp-2">{prompt}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Messages */}
          {messages.map(m => (
            <ChatBubble key={m.id} message={m} accentColor={appConfig.accent.color} />
          ))}

          {loading && <TypingIndicator />}

          <div ref={bottomRef} />
        </div>
      </main>

      {/* Input Footer */}
      <footer className="shrink-0 px-4 pb-5 pt-2 bg-zinc-50/80 dark:bg-zinc-950/80 backdrop-blur-xs border-t border-zinc-200/60 dark:border-zinc-800/60">
        <div className="mx-auto max-w-3xl flex gap-2.5 items-end">
          <textarea
            rows={1}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
            placeholder={`Ask ${appConfig.shortName}...`}
            className="flex-1 resize-none rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-4 py-3 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 transition shadow-xs"
          />
          <button
            onClick={() => send()}
            disabled={loading || !input.trim()}
            className={`rounded-xl px-4 py-3 text-sm font-medium transition shadow-xs disabled:opacity-40 disabled:cursor-not-allowed ${appConfig.accent.button}`}
          >
            Send
          </button>
        </div>
        <div className="text-center mt-2">
          <span className="text-[11px] text-zinc-400 dark:text-zinc-600">
            {appConfig.shortName} maintains its own independent message history.
          </span>
        </div>
      </footer>
    </div>
  );
}
