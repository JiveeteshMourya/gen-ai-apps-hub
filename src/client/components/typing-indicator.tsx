"use client";

export function TypingIndicator({ variant = "direct" }: { variant?: "direct" | "memory" }) {
  const isMemory = variant === "memory";

  return (
    <div className="flex items-center gap-2 animate-fade-in my-1">
      <div
        className={`w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-bold shrink-0 ${
          isMemory
            ? "bg-purple-600 text-white shadow-xs"
            : "bg-zinc-800 text-white dark:bg-zinc-200 dark:text-zinc-900 shadow-xs"
        }`}
      >
        {isMemory ? "🧠" : "⚡"}
      </div>

      <div
        className={`rounded-2xl px-4 py-2.5 shadow-xs border flex items-center gap-1.5 ${
          isMemory
            ? "bg-purple-50/80 dark:bg-purple-950/40 border-purple-200/80 dark:border-purple-900/60"
            : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800"
        }`}
      >
        <span className="flex gap-1 items-center">
          <span
            className={`w-1.5 h-1.5 rounded-full animate-bounce [animation-delay:0ms] ${
              isMemory ? "bg-purple-500" : "bg-zinc-400 dark:bg-zinc-500"
            }`}
          />
          <span
            className={`w-1.5 h-1.5 rounded-full animate-bounce [animation-delay:150ms] ${
              isMemory ? "bg-purple-500" : "bg-zinc-400 dark:bg-zinc-500"
            }`}
          />
          <span
            className={`w-1.5 h-1.5 rounded-full animate-bounce [animation-delay:300ms] ${
              isMemory ? "bg-purple-500" : "bg-zinc-400 dark:bg-zinc-500"
            }`}
          />
        </span>
        <span className="text-[11px] text-zinc-400 dark:text-zinc-500 ml-1">
          {isMemory ? "Retrieving & reasoning..." : "Thinking..."}
        </span>
      </div>
    </div>
  );
}
