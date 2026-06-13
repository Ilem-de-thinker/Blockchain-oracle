export interface SupportUser {
  id: number;
  username: string;
  full_name: string;
  email: string;
  avatar?: string;
}

export type TicketStatus = "pending" | "open" | "resolved" | "closed";

export interface SupportTicket {
  id: number;
  user: SupportUser;
  subject: string;
  description: string;
  status: TicketStatus;
  assigned_to: SupportUser | null;
  created_at: string;
  updated_at: string;
}

export interface SupportMessage {
  id: number;
  ticket: number;
  sender: SupportUser;
  message: string;
  created_at: string;
}

export interface NotificationLog {
  id: number;
  ticket_id: number;
  type: "email" | "in_app";
  recipient: string;
  title: string;
  body: string;
  created_at: string;
}
