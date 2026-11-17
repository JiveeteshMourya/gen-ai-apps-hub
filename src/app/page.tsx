"use client";

import { useEffect, useRef, useState } from "react";
import type { Message } from "@/db/schema";

const API_URL = "/api/chat";

// ── Sub-components ─────────────────────────────────────────────────────────────

function ChatBubble({ message }: { message: Message }) {
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

function TypingIndicator() {
  return (
    <div className="flex justify-start">
      <div className="bg-white border border-zinc-200 dark:bg-zinc-800 dark:border-zinc-700 rounded-2xl px-4 py-2.5">
        <span className="flex gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 animate-bounce [animation-delay:0ms]" />
          <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 animate-bounce [animation-delay:150ms]" />
          <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 animate-bounce [animation-delay:300ms]" />
        </span>
      </div>
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch(API_URL)
      .then(r => r.json())
      .then(setMessages);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;

    setInput("");
    setLoading(true);

    // Optimistic user bubble
    const optimistic: Message = {
      id: Date.now(),
      role: "user",
      content: text,
      createdAt: new Date(),
    };
    setMessages(prev => [...prev, optimistic]);

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Unknown error");

      const reply: Message = {
        id: Date.now() + 1,
        role: "assistant",
        content: data.reply,
        createdAt: new Date(),
      };
      setMessages(prev => [...prev, reply]);
    } catch (err) {
      console.error(err);
      const errMsg: Message = {
        id: Date.now() + 1,
        role: "assistant",
        content: "⚠️ Something went wrong. Check the server logs.",
        createdAt: new Date(),
      };
      setMessages(prev => [...prev, errMsg]);
    } finally {
      setLoading(false);
    }
  };

  const clearHistory = async () => {
    await fetch(API_URL, { method: "DELETE" });
    setMessages([]);
  };

  return (
    <div className="flex flex-col h-screen bg-zinc-50 dark:bg-zinc-950">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
        <div className="flex items-center gap-2">
          <span className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            OpenAI Wrapper
          </span>
          <span className="text-xs rounded-full px-2 py-0.5 bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400 font-medium">
            demo
          </span>
        </div>
        <button
          onClick={clearHistory}
          className="text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
        >
          Clear history
        </button>
      </header>

      {/* Messages */}
      <main className="flex-1 overflow-y-auto px-4 py-6">
        <div className="mx-auto max-w-2xl flex flex-col gap-4">
          {messages.length === 0 && !loading && (
            <p className="text-center text-sm text-zinc-400 mt-20">
              Send a message to get started.
            </p>
          )}

          {messages.map(m => (
            <ChatBubble key={m.id} message={m} />
          ))}

          {loading && <TypingIndicator />}

          <div ref={bottomRef} />
        </div>
      </main>

      {/* Input */}
      <footer className="px-4 pb-6 pt-2 bg-zinc-50 dark:bg-zinc-950">
        <div className="mx-auto max-w-2xl flex gap-2 items-end">
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
            placeholder="Message..."
            className="flex-1 resize-none rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-4 py-3 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 transition"
          />
          <button
            onClick={send}
            disabled={loading || !input.trim()}
            className="rounded-xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 px-4 py-3 text-sm font-medium transition hover:bg-zinc-700 dark:hover:bg-zinc-300 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Send
          </button>
        </div>
      </footer>
    </div>
  );
}
