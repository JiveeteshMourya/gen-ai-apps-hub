import { ROLES } from "../constants/chat.constants";
import type { AppId } from "../constants/apps.constants";

export type Role = (typeof ROLES)[number];

export interface Message {
  id: number;
  appId: AppId | string;
  role: Role | string;
  content: string;
  createdAt: Date;
}
