import type { SVGProps } from "react";

export function StudyMentorIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z" />
      <path d="M22 10v6" />
      <path d="M6 12.5V16a6 3 0 0 0 12 0v-3.5" />
    </svg>
  );
}

export function FitnessCoachIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="m6.5 6.5 11 11" />
      <path d="m21 21-1-1a2 2 0 0 0-2.83 0l-1.41 1.41a2 2 0 0 1-2.83 0l-7.76-7.75a2 2 0 0 1 0-2.83L7.58 6.42a2 2 0 0 0 0-2.83L6.58 2.59a2 2 0 0 0-2.83 0L2.34 4a2 2 0 0 0 0 2.83l1.41 1.41a2 2 0 0 1 0 2.83L11.5 18.83a2 2 0 0 0 2.83 0l1.41-1.41a2 2 0 0 1 2.83 0l1.41 1.41a2 2 0 0 0 2.83 0L21 21z" />
      <path d="m14.5 9.5 3-3" />
    </svg>
  );
}

export function WearableHealthIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <rect x="5" y="6" width="14" height="12" rx="4" />
      <path d="M9 6V2h6v4" />
      <path d="M9 18v4h6v-4" />
      <path d="M8 12h2l1-2 2 4 1-2h2" />
    </svg>
  );
}

export function MedicalAssistantIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 1 0 .3.3" />
      <path d="M8 15v1a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6v-4" />
      <circle cx="20" cy="10" r="2" />
    </svg>
  );
}

export function YouTubeCompanionIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17" />
      <polygon points="10 15 15 12 10 9 10 15" fill="currentColor" />
    </svg>
  );
}

export function AppIcon({ id, className = "w-6 h-6" }: { id: string; className?: string }) {
  switch (id) {
    case "study-mentor":
      return <StudyMentorIcon className={className} />;
    case "fitness-coach":
      return <FitnessCoachIcon className={className} />;
    case "wearable-health":
      return <WearableHealthIcon className={className} />;
    case "medical-assistant":
      return <MedicalAssistantIcon className={className} />;
    case "youtube-companion":
      return <YouTubeCompanionIcon className={className} />;
    default:
      return null;
  }
}
