import Link from "next/link";
import { APPS } from "@/shared/constants/apps.constants";
import { AppIcon } from "@/client/components/app-icons";

export default function HubPage() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col">
      {/* Top Banner / Header */}
      <header className="border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 flex items-center justify-center font-bold text-sm shadow-xs">
              AI
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                  GenAI Apps Hub
                </h1>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
                  5 Companions
                </span>
              </div>
              <p className="text-xs text-zinc-500">
                Specialized AI assistants with isolated chat histories
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="hidden sm:inline-flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Ready
            </span>
          </div>
        </div>
      </header>

      {/* Main Hub Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-10">
        {/* Hero Section */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
            Choose Your AI Assistant
          </h2>
          <p className="mt-3 text-sm sm:text-base text-zinc-600 dark:text-zinc-400 leading-relaxed">
            Every assistant is tuned with a dedicated persona and maintains its own independent
            conversation history in the database.
          </p>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {APPS.map(app => (
            <div
              key={app.id}
              className="group flex flex-col justify-between rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-xs hover:shadow-md hover:border-zinc-300 dark:hover:border-zinc-700 transition-all duration-200"
            >
              <div>
                {/* Header: Icon & Badge */}
                <div className="flex items-center justify-between mb-4">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center ${app.accent.bgSoft} ${app.accent.text} border ${app.accent.border}`}
                  >
                    <AppIcon id={app.id} className="w-6 h-6" />
                  </div>
                  <span
                    className={`text-[11px] font-medium px-2.5 py-1 rounded-full border ${app.accent.bgSoft} ${app.accent.text} ${app.accent.border}`}
                  >
                    {app.badge}
                  </span>
                </div>

                {/* Title & Tagline */}
                <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-zinc-800 transition-colors">
                  {app.name}
                </h3>
                <p className="mt-1.5 text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                  {app.tagline}
                </p>

                {/* Suggested Starters */}
                <div className="mt-5 pt-4 border-t border-zinc-100 dark:border-zinc-800/80">
                  <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block mb-2">
                    Key Topics
                  </span>
                  <ul className="space-y-1.5">
                    {app.suggestedPrompts.slice(0, 2).map((prompt, i) => (
                      <li
                        key={i}
                        className="text-xs text-zinc-600 dark:text-zinc-400 flex items-start gap-1.5"
                      >
                        <span className="text-zinc-400 shrink-0">•</span>
                        <span className="line-clamp-1">{prompt}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Action Link */}
              <div className="mt-6 pt-4 border-t border-zinc-100 dark:border-zinc-800/80">
                <Link
                  href={`/apps/${app.id}`}
                  className={`w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold shadow-xs transition-all ${app.accent.button}`}
                >
                  <span>Chat with {app.shortName}</span>
                  <svg
                    className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M5 12h14" />
                    <path d="m12 5 7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Feature Highlights Footer Bar */}
        <div className="mt-14 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 text-center sm:text-left">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center shrink-0 text-zinc-700 dark:text-zinc-300 text-xs font-bold">
                1
              </div>
              <div>
                <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                  Isolated Histories
                </h4>
                <p className="text-[11px] text-zinc-500 mt-0.5">
                  Messages are saved per app in PostgreSQL, keeping contexts separate.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center shrink-0 text-zinc-700 dark:text-zinc-300 text-xs font-bold">
                2
              </div>
              <div>
                <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                  Targeted Personas
                </h4>
                <p className="text-[11px] text-zinc-500 mt-0.5">
                  Each assistant has its own system prompt for deep domain expertise.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center shrink-0 text-zinc-700 dark:text-zinc-300 text-xs font-bold">
                3
              </div>
              <div>
                <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                  Instant Access
                </h4>
                <p className="text-[11px] text-zinc-500 mt-0.5">
                  No login or authentication friction—jump directly into any conversation.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
