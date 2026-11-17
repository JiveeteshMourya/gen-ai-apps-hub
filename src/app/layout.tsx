import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Apps Hub",
  description: "A hub of specialized AI assistants.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col font-sans bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50">
        {children}
      </body>
    </html>
  );
}
