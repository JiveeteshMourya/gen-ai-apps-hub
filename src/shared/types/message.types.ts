import { ROLES } from "../constants/chat.constants";
import type { AppId } from "../constants/apps.constants";

export type Role = (typeof ROLES)[number];

export type ChatWidgetType = "direct" | "memory";

export interface Message {
  id: number;
  appId: AppId | string;
  role: Role | string;
  content: string;
  createdAt: Date | string;
}

export type DirectMessage = Message;

export interface MemoryMessage extends Message {
  context?: string | null;
  metadata?: Record<string, unknown> | null;
}

export interface ChatHistoryResponse {
  direct: DirectMessage[];
  memory: MemoryMessage[];
}
