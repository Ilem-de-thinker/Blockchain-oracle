import React, { useEffect, useRef } from "react";
import { SupportTicket, SupportMessage, TicketStatus } from "./types";
import { Send, AlertTriangle, CheckCircle, FolderOpen, Lock, Shield, Loader2, RefreshCw } from "lucide-react";

interface ChatInterfaceProps {
  ticket: SupportTicket;
  messages: SupportMessage[];
  currentUserId: number;
  isAdmin: boolean;
  newMessageText: string;
  sending: boolean;
  updatingStatus: string | null;
  messagesLoading: boolean;
  messagesError: string;
  onNewMessageChange: (text: string) => void;
  onSendMessage: (e: React.FormEvent) => void;
  onUpdateStatus: (status: TicketStatus) => void;
  onFetchMessages: () => void;
}

export default function ChatInterface({
  ticket,
  messages,
  currentUserId,
  isAdmin,
  newMessageText,
  sending,
  updatingStatus,
  messagesLoading,
  messagesError,
  onNewMessageChange,
  onSendMessage,
  onUpdateStatus,
  onFetchMessages,
}: ChatInterfaceProps) {
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const getStatusBanner = () => {
    switch (ticket.status) {
      case "pending":
        return (
          <div className="bg-amber-500/10 border border-amber-500/25 text-amber-300 text-xs px-3.5 py-2.5 rounded-lg flex items-center gap-2 font-mono">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            <div>
              <span className="font-bold uppercase text-amber-400">PENDING QUEUE</span> - This ticket has not been assigned to a representative yet.
            </div>
          </div>
        );
      case "resolved":
        return (
          <div className="bg-primary/10 border border-primary/25 text-primary text-xs px-3.5 py-2.5 rounded-lg flex items-center gap-2 font-mono">
            <CheckCircle className="w-4 h-4 text-primary shrink-0" />
            <div>
              <span className="font-bold uppercase text-primary">ISSUE RESOLVED</span> - An administrator marked this ticket as resolved.
            </div>
          </div>
        );
      case "closed":
        return (
          <div className="bg-surface/25 border border-border text-text-muted text-xs px-3.5 py-2.5 rounded-lg flex items-center gap-2 font-mono">
            <Lock className="w-4 h-4 text-text-muted shrink-0" />
            <div>
              <span className="font-bold uppercase text-text-muted">ARCHIVE RECORD LOCKED</span> - This ticket has been finalized.
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div id={`chat-workspace-${ticket.id}`} className="bg-surface/90 rounded-xl border border-border shadow-xl flex flex-col h-full min-h-[450px]">
      <div className="p-4 border-b border-border bg-surface/90 flex flex-col gap-3">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[10px] font-mono font-bold text-primary bg-primary/10 border border-primary/20 px-1.5 py-0.5 rounded">
                REF_ID: #{ticket.id}
              </span>
              <span className="text-xs text-text-muted font-mono">Sender: {ticket.user.full_name}</span>
            </div>
            <h2 className="font-bold text-sm text-text leading-snug">
              {ticket.subject}
            </h2>
          </div>

          <button
            onClick={onFetchMessages}
            title="Reload messages"
            className="p-1.5 border border-border bg-surface-alt/80 text-text-muted rounded-lg hover:text-text"
            id="reload-messages-btn"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>

        <p className="text-xs text-text-secondary bg-surface-alt p-4 rounded-lg border border-border shadow-inner leading-relaxed whitespace-pre-wrap font-sans">
          {ticket.description}
        </p>

        {getStatusBanner()}

        {isAdmin && (
          <div className="bg-surface-alt p-3.5 rounded-lg border border-border mt-1" id="admin-controls-dashboard">
            <div className="flex items-center gap-1.5 mb-2.5">
              <Shield className="w-3.5 h-3.5 text-primary" />
              <span className="text-[9px] font-bold text-text-muted uppercase tracking-widest font-mono">
                Admin Console Controls
              </span>
            </div>

            <div className="flex flex-wrap gap-2 font-mono text-[10px]">
              {ticket.status === "pending" && (
                <button
                  onClick={() => onUpdateStatus("open")}
                  disabled={updatingStatus !== null}
                  id="admin-accept-ticket-btn"
                  className="px-3 py-1.5 font-bold bg-primary hover:bg-primary-hover text-white rounded transition-all cursor-pointer disabled:bg-surface disabled:text-text-muted"
                >
                  {updatingStatus === "open" ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <FolderOpen className="w-3 h-3" />
                  )}
                  Accept & Assign
                </button>
              )}

              {ticket.status !== "resolved" && ticket.status !== "closed" && (
                <button
                  onClick={() => onUpdateStatus("resolved")}
                  disabled={updatingStatus !== null}
                  id="admin-resolve-ticket-btn"
                  className="px-3 py-1.5 font-bold bg-surface border border-primary/30 hover:border-primary/50 text-primary rounded shadow-xs flex items-center gap-1 cursor-pointer disabled:opacity-40"
                >
                  {updatingStatus === "resolved" ? (
                    <Loader2 className="w-3 h-3 animate-spin text-primary" />
                  ) : (
                    <CheckCircle className="w-3 h-3" />
                  )}
                  Resolve Issue
                </button>
              )}

              {ticket.status !== "closed" && (
                <button
                  onClick={() => onUpdateStatus("closed")}
                  disabled={updatingStatus !== null}
                  id="admin-close-ticket-btn"
                  className="px-3 py-1.5 font-bold bg-surface border border-border hover:border-border-hover text-text-muted rounded shadow-xs flex items-center gap-1 cursor-pointer disabled:opacity-40"
                >
                  {updatingStatus === "closed" ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <Lock className="w-3 h-3" />
                  )}
                  Close Case
                </button>
              )}

              {ticket.status !== "pending" && ticket.status !== "open" && (
                <button
                  onClick={() => onUpdateStatus("pending")}
                  disabled={updatingStatus !== null}
                  id="admin-reopen-ticket-btn"
                  className="px-3 py-1.5 font-bold bg-surface border border-amber-500/20 hover:border-amber-400 text-amber-400 rounded shadow-xs flex items-center gap-1 cursor-pointer disabled:opacity-40"
                >
                  Reopen
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-bg/50 min-h-[180px]">
        {messagesLoading && messages.length === 0 ? (
          <div className="h-full flex items-center justify-center p-10">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : messagesError ? (
          <div className="text-center p-4 text-xs text-red-400 font-mono">
            {messagesError}
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center p-8 text-xs text-text-muted font-mono">
            No messages yet. Be the first to start communicating.
          </div>
        ) : (
          messages.map((item) => {
            const isMe = item.sender.id === currentUserId;
            const isSenderAdmin = item.sender.id === 1 || item.sender.id === 2;
            const messageSentAt = new Date(item.created_at).toLocaleTimeString(undefined, {
              hour: "2-digit",
              minute: "2-digit",
            });

            return (
              <div
                key={item.id}
                id={`chat-msg-${item.id}`}
                className={`flex gap-3 max-w-[85%] ${
                  isMe ? "ml-auto flex-row-reverse text-right" : "text-left"
                }`}
              >
                <img
                  src={item.sender.avatar || `https://i.pravatar.cc/100?u=${item.sender.email}`}
                  alt={item.sender.full_name}
                  className="w-8 h-8 rounded-full object-cover shrink-0 ring-1 ring-border"
                  referrerPolicy="no-referrer"
                />

                <div className="space-y-1">
                  <div className={`flex items-center gap-1.5 text-[10px] text-text-muted font-mono ${isMe ? "justify-end" : ""}`}>
                    <span className="font-bold text-text-secondary">{item.sender.full_name}</span>
                    {isSenderAdmin && (
                      <span className="px-1.5 py-0.2 bg-red-450/10 text-red-400 text-[8px] font-bold uppercase rounded border border-red-500/20">
                        Admin
                      </span>
                    )}
                    <span>•</span>
                    <span>{messageSentAt}</span>
                  </div>

                  <div
                    className={`p-3 rounded-xl text-[12px] font-sans shadow-md border leading-relaxed break-words text-left ${
                      isMe
                        ? "bg-primary/10 border-primary/30 text-primary rounded-tr-none"
                        : "bg-surface border-border text-text-secondary rounded-tl-none"
                    }`}
                  >
                    {item.message}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={chatEndRef} />
      </div>

      <div className="p-3 bg-surface/95 border-t border-border">
        {ticket.status === "closed" ? (
          <div className="bg-surface-alt/90 text-text-muted border border-border p-2 text-center rounded-lg text-xs font-mono flex items-center justify-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-text-muted" />
            <span>Support Chat Thread is Locked (Ticket is Closed)</span>
          </div>
        ) : (
          <form onSubmit={onSendMessage} className="flex gap-2">
            <input
              id="message-input-field"
              type="text"
              placeholder="Type your support reply here..."
              className="flex-1 bg-surface-alt text-xs border border-border rounded-lg px-4 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-text placeholder-text-muted"
              value={newMessageText}
              onChange={(e) => onNewMessageChange(e.target.value)}
              disabled={sending}
            />
            <button
              type="submit"
              id="send-message-btn"
              disabled={sending || !newMessageText.trim()}
              className="px-4.5 bg-primary hover:bg-primary-hover disabled:bg-surface disabled:opacity-40 text-white py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
            >
              {sending ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <>
                  <Send className="w-3 h-3.5" />
                  <span className="hidden sm:inline">Send</span>
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
