import { ROLES } from "../constants/chat.constants";

export type Role = (typeof ROLES)[number];

export interface Message {
  id: number;
  role: Role | string;
  content: string;
  createdAt: Date;
}
