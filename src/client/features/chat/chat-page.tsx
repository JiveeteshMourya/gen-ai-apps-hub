"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Message } from "@/shared/types/message.types";
import { AppIcon } from "@/client/components/app-icons";
import { ChatWidgetPanel } from "@/client/components/chat-widget-panel";
import { APPS, getAppConfig, type AppId } from "@/shared/constants/apps.constants";

interface ChatPageProps {
  appId: AppId | string;
}

export function ChatPage({ appId }: ChatPageProps) {
  const appConfig = getAppConfig(appId);

  // Left Widget state (Direct OpenAI)
  const [directMessages, setDirectMessages] = useState<Message[]>([]);
  const [directLoading, setDirectLoading] = useState(false);
  const [directClearing, setDirectClearing] = useState(false);

  // Right Widget state (Memory Engine)
  const [memoryMessages, setMemoryMessages] = useState<Message[]>([]);
  const [memoryLoading, setMemoryLoading] = useState(false);
  const [memoryClearing, setMemoryClearing] = useState(false);

  // Shared states
  const [input, setInput] = useState("");
  const [initialLoading, setInitialLoading] = useState(true);
  const [clearingAll, setClearingAll] = useState(false);

  // Mobile active tab view ("both" on desktop, "direct" | "memory" on mobile)
  const [mobileTab, setMobileTab] = useState<"direct" | "memory">("direct");

  // Fetch initial chat histories for both models
  useEffect(() => {
    let isMounted = true;

    fetch(`/api/chat?appId=${encodeURIComponent(appId)}`)
      .then(r => r.json())
      .then(res => {
        if (!isMounted) return;
        if (res.success && res.data) {
          if (Array.isArray(res.data.direct)) {
            setDirectMessages(res.data.direct);
          }
          if (Array.isArray(res.data.memory)) {
            setMemoryMessages(res.data.memory);
          }
        }
      })
      .catch(console.error)
      .finally(() => {
        if (isMounted) setInitialLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [appId]);

  // Send single user prompt to BOTH chat widgets
  const sendToBoth = async (contentToSend?: string) => {
    const text = (contentToSend ?? input).trim();
    if (!text || directLoading || memoryLoading) return;

    if (!contentToSend) {
      setInput("");
    }

    const optimisticTimestamp = new Date();

    // 1. Optimistically append user message to Left Widget (Direct)
    const directOptimistic: Message = {
      id: Date.now(),
      appId,
      role: "user",
      content: text,
      createdAt: optimisticTimestamp,
    };
    setDirectMessages(prev => [...prev, directOptimistic]);
    setDirectLoading(true);

    // 2. Optimistically append user message to Right Widget (Memory)
    const memoryOptimistic: Message = {
      id: Date.now() + 1,
      appId,
      role: "user",
      content: text,
      createdAt: optimisticTimestamp,
    };
    setMemoryMessages(prev => [...prev, memoryOptimistic]);
    setMemoryLoading(true);

    // 3. Dispatch to Direct OpenAI endpoint (Left Widget)
    const directPromise = fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: text, appId, type: "direct" }),
    })
      .then(async res => {
        const body = await res.json();
        if (!res.ok || !body.success) {
          throw new Error(body.message ?? "Failed to get direct reply");
        }
        const reply: Message = {
          id: Date.now() + 2,
          appId,
          role: "assistant",
          content: body.data.reply,
          createdAt: new Date(),
        };
        setDirectMessages(prev => [...prev, reply]);
      })
      .catch(err => {
        console.error("Direct chat error:", err);
        const errMsg: Message = {
          id: Date.now() + 2,
          appId,
          role: "assistant",
          content: err instanceof Error ? `⚠️ ${err.message}` : "⚠️ Direct OpenAI call failed.",
          createdAt: new Date(),
        };
        setDirectMessages(prev => [...prev, errMsg]);
      })
      .finally(() => {
        setDirectLoading(false);
      });

    // 4. Dispatch to Memory Engine endpoint (Right Widget)
    const memoryPromise = fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: text, appId, type: "memory" }),
    })
      .then(async res => {
        const body = await res.json();
        if (!res.ok || !body.success) {
          throw new Error(body.message ?? "Failed to get memory reply");
        }
        const reply: Message = {
          id: Date.now() + 3,
          appId,
          role: "assistant",
          content: body.data.reply,
          createdAt: new Date(),
        };
        setMemoryMessages(prev => [...prev, reply]);
      })
      .catch(err => {
        console.error("Memory chat error:", err);
        const errMsg: Message = {
          id: Date.now() + 3,
          appId,
          role: "assistant",
          content: err instanceof Error ? `⚠️ ${err.message}` : "⚠️ Memory Engine call failed.",
          createdAt: new Date(),
        };
        setMemoryMessages(prev => [...prev, errMsg]);
      })
      .finally(() => {
        setMemoryLoading(false);
      });

    await Promise.allSettled([directPromise, memoryPromise]);
  };

  // Clear Left (Direct) history only
  const clearDirect = async () => {
    if (directClearing) return;
    setDirectClearing(true);
    try {
      await fetch(`/api/chat?appId=${encodeURIComponent(appId)}&type=direct`, {
        method: "DELETE",
      });
      setDirectMessages([]);
    } catch (err) {
      console.error("Failed to clear direct history", err);
    } finally {
      setDirectClearing(false);
    }
  };

  // Clear Right (Memory) history only
  const clearMemory = async () => {
    if (memoryClearing) return;
    setMemoryClearing(true);
    try {
      await fetch(`/api/chat?appId=${encodeURIComponent(appId)}&type=memory`, {
        method: "DELETE",
      });
      setMemoryMessages([]);
    } catch (err) {
      console.error("Failed to clear memory history", err);
    } finally {
      setMemoryClearing(false);
    }
  };

  // Clear Both histories
  const clearAll = async () => {
    if (clearingAll) return;
    setClearingAll(true);
    try {
      await fetch(`/api/chat?appId=${encodeURIComponent(appId)}&type=all`, {
        method: "DELETE",
      });
      setDirectMessages([]);
      setMemoryMessages([]);
    } catch (err) {
      console.error("Failed to clear all histories", err);
    } finally {
      setClearingAll(false);
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

  const isSending = directLoading || memoryLoading;
  const hasAnyMessages = directMessages.length > 0 || memoryMessages.length > 0;

  return (
    <div className="flex flex-col h-screen bg-zinc-50 dark:bg-zinc-950 overflow-hidden">
      {/* Top Navigation Bar */}
      <header className="shrink-0 flex items-center justify-between px-4 sm:px-6 py-2.5 border-b border-zinc-200 dark:border-zinc-800 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md z-10">
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
          <div className="hidden lg:flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800/80 p-1 rounded-xl text-xs">
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
            onClick={clearAll}
            disabled={clearingAll || !hasAnyMessages}
            className="text-xs text-zinc-500 hover:text-rose-600 dark:hover:text-rose-400 px-2.5 py-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            title="Clear message history across both widgets"
          >
            {clearingAll ? "Clearing..." : "Clear both"}
          </button>
        </div>
      </header>

      {/* Mobile Tab Selector (Visible on mobile only: < md) */}
      <div className="md:hidden shrink-0 flex items-center justify-center p-2 bg-zinc-100/90 dark:bg-zinc-900/90 border-b border-zinc-200 dark:border-zinc-800">
        <div className="inline-flex rounded-lg bg-zinc-200 dark:bg-zinc-800 p-0.5 text-xs font-medium">
          <button
            onClick={() => setMobileTab("direct")}
            className={`px-3 py-1.5 rounded-md transition-all ${
              mobileTab === "direct"
                ? "bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-xs"
                : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900"
            }`}
          >
            ⚡ Direct OpenAI ({directMessages.length})
          </button>
          <button
            onClick={() => setMobileTab("memory")}
            className={`px-3 py-1.5 rounded-md transition-all ${
              mobileTab === "memory"
                ? "bg-purple-600 text-white shadow-xs"
                : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900"
            }`}
          >
            🧠 Memory Engine ({memoryMessages.length})
          </button>
        </div>
      </div>

      {/* Main Dual Chat Container */}
      <main className="flex-1 overflow-hidden p-3 sm:p-4 lg:p-5">
        <div className="h-full grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 lg:gap-5 max-w-7xl mx-auto">
          {/* LEFT WIDGET: Direct OpenAI */}
          <div
            className={`h-full overflow-hidden ${
              mobileTab === "direct" ? "block" : "hidden md:block"
            }`}
          >
            <ChatWidgetPanel
              id="direct"
              title="Direct OpenAI"
              badge="Direct LLM"
              subtitle="Direct OpenAI calls without memory engine"
              accentColor={appConfig.accent.color}
              messages={directMessages}
              loading={directLoading || initialLoading}
              clearing={directClearing}
              onClear={clearDirect}
              emptyTitle="Direct OpenAI Model"
              emptyDescription="This widget sends your prompt directly to OpenAI using standard model context, without memory vault integration."
              suggestedPrompts={appConfig.suggestedPrompts}
              onSelectPrompt={p => setInput(p)}
            />
          </div>

          {/* RIGHT WIDGET: Memory Engine */}
          <div
            className={`h-full overflow-hidden ${
              mobileTab === "memory" ? "block" : "hidden md:block"
            }`}
          >
            <ChatWidgetPanel
              id="memory"
              title="Memory Engine"
              badge="Memory Model"
              subtitle="Dedicated DB model ready for Memory Engine"
              accentColor={appConfig.accent.color}
              messages={memoryMessages}
              loading={memoryLoading || initialLoading}
              clearing={memoryClearing}
              onClear={clearMemory}
              emptyTitle="Memory Engine Model"
              emptyDescription="This widget maintains its own separate database model. It receives the same input and will connect to your memory engine."
              suggestedPrompts={appConfig.suggestedPrompts}
              onSelectPrompt={p => setInput(p)}
            />
          </div>
        </div>
      </main>

      {/* Shared Single Chat Input Box at Bottom */}
      <footer className="shrink-0 px-4 pb-4 pt-2 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md border-t border-zinc-200 dark:border-zinc-800">
        <div className="max-w-4xl mx-auto">
          <div className="flex gap-2.5 items-end">
            <textarea
              rows={1}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendToBoth();
                }
              }}
              placeholder={`Send message to both widgets (${appConfig.shortName})...`}
              className="flex-1 resize-none rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/80 px-4 py-3 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 transition shadow-xs"
            />
            <button
              onClick={() => sendToBoth()}
              disabled={isSending || !input.trim()}
              className={`rounded-xl px-5 py-3 text-sm font-medium transition shadow-xs disabled:opacity-40 disabled:cursor-not-allowed ${appConfig.accent.button}`}
            >
              {isSending ? "Sending..." : "Send to Both"}
            </button>
          </div>

          <div className="flex items-center justify-between mt-2 px-1 text-[11px] text-zinc-400 dark:text-zinc-500">
            <span>
              Left: <strong className="text-zinc-600 dark:text-zinc-300">Direct OpenAI</strong> •
              Right: <strong className="text-purple-600 dark:text-purple-400">Memory Engine</strong>
            </span>
            <span className="hidden sm:inline">
              Single prompt dispatches to both widgets in parallel
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
