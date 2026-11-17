export function TypingIndicator() {
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
