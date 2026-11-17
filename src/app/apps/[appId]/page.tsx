import { Suspense } from "react";
import { notFound } from "next/navigation";
import { ChatPage } from "@/client/features/chat/chat-page";
import { APPS, getAppConfig, isValidAppId } from "@/shared/constants/apps.constants";

export function generateStaticParams() {
  return APPS.map(app => ({
    appId: app.id,
  }));
}

export async function generateMetadata({ params }: { params: Promise<{ appId: string }> }) {
  const { appId } = await params;
  const app = getAppConfig(appId);
  if (!app) return { title: "App Not Found" };

  return {
    title: `${app.name} — AI Apps Hub`,
    description: app.tagline,
  };
}

async function AppContent({ params }: { params: Promise<{ appId: string }> }) {
  const { appId } = await params;

  if (!isValidAppId(appId)) {
    notFound();
  }

  return <ChatPage appId={appId} />;
}

export default function AppPage({ params }: { params: Promise<{ appId: string }> }) {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-screen bg-zinc-50 dark:bg-zinc-950">
          <div className="w-6 h-6 border-2 border-zinc-400 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <AppContent params={params} />
    </Suspense>
  );
}
