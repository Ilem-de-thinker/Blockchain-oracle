import React, { useState, useEffect, useCallback, useRef } from "react";
import { User, UserRole } from "@/types";
import { useTheme } from "@/contexts/ThemeContext";
import { supportApi } from "@/src/api/support";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { LifeBuoy, Users, ShieldAlert, Loader2, PlusCircle, RefreshCw, Archive, HelpCircle, Sparkles } from "lucide-react";
import TicketList from "@/src/shared/ui/support/TicketList";
import TicketForm from "@/src/shared/ui/support/TicketForm";
import ChatInterface from "@/src/shared/ui/support/ChatInterface";
import { SupportTicket, SupportMessage, TicketStatus, SupportUser } from "@/src/shared/ui/support/types";

interface SupportPageProps {
  user: User | null;
}

const mapRealStatus = (real: string): TicketStatus => {
  switch (real) {
    case "open": return "pending";
    case "in_progress": return "open";
    case "waiting_for_customer": return "open";
    case "resolved": return "resolved";
    case "closed": return "closed";
    default: return "pending";
  }
};

const mapToSandboxTicket = (t: any): SupportTicket => ({
  id: t.id,
  user: {
    id: t.user?.id || 0,
    username: t.user?.username || "",
    full_name: t.user?.full_name || "Unknown",
    email: t.user?.email || "",
    avatar: undefined,
  },
  subject: t.subject || "",
  description: t.description || "",
  status: mapRealStatus(t.status),
  assigned_to: t.assigned_to
    ? {
        id: t.assigned_to.id,
        username: t.assigned_to.username || "",
        full_name: t.assigned_to.full_name || "",
        email: t.assigned_to.email || "",
        avatar: undefined,
      }
    : null,
  created_at: t.created_at,
  updated_at: t.updated_at,
});

const mapToSandboxMessage = (m: any): SupportMessage => ({
  id: m.id,
  ticket: m.ticket || 0,
  sender: {
    id: m.sender?.id || 0,
    username: m.sender?.username || "",
    full_name: m.sender?.full_name || "Unknown",
    email: m.sender?.email || "",
    avatar: undefined,
  },
  message: m.message || "",
  created_at: m.created_at,
});

const SupportPage: React.FC<SupportPageProps> = ({ user }) => {
  const { buttonColor } = useTheme();

  const isCurrentUserAdmin = user?.role === UserRole.ADMIN || user?.role === UserRole.SUPER_ADMIN;
  const isSuperAdmin = user?.role === UserRole.SUPER_ADMIN;

  const currentSupportUser: SupportUser = {
    id: Number(user?.id) || 0,
    username: user?.name || "",
    full_name: user?.name || "User",
    email: user?.email || "",
    avatar: user?.avatar,
  };

  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [persistedTicketId, setPersistedTicketId] = useLocalStorage<number | null>('support_selected_ticket_id', null);
  const [adminStatusFilter, setAdminStatusFilter] = useState<string>("");
  const [isCreatingNewTicket, setIsCreatingNewTicket] = useState<boolean>(false);
  const [mobileActiveTab, setMobileActiveTab] = useState<"queue" | "workspace">("queue");
  const [roleMode, setRoleMode] = useState<"user" | "admin">(isCurrentUserAdmin ? "admin" : "user");
  const [loadingTickets, setLoadingTickets] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [syncingAll, setSyncingAll] = useState<boolean>(false);

  // ChatInterface state
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [newMessageText, setNewMessageText] = useState("");
  const [sending, setSending] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [messagesError, setMessagesError] = useState("");

  const hasUnsavedMessage = newMessageText.trim().length > 0;
  const hasUnsavedRef = useRef(hasUnsavedMessage);
  hasUnsavedRef.current = hasUnsavedMessage;

  useEffect(() => {
    if (hasUnsavedMessage) {
      const handler = (e: BeforeUnloadEvent) => {
        e.preventDefault();
        e.returnValue = "";
      };
      window.addEventListener("beforeunload", handler);
      return () => window.removeEventListener("beforeunload", handler);
    }
  }, [hasUnsavedMessage]);

  useEffect(() => {
    const originalPushState = window.history.pushState.bind(window.history);
    const originalReplaceState = window.history.replaceState.bind(window.history);
    let suppressing = false;

    const confirmLeave = (): boolean => {
      if (!hasUnsavedRef.current) return true;
      return window.confirm(
        "You have an unsent message. If you leave now, it will not be saved. Are you sure you want to leave?"
      );
    };

    window.history.pushState = function (data, unused, url) {
      if (suppressing) {
        suppressing = false;
        return originalPushState(data, unused, url);
      }
      if (!confirmLeave()) return;
      return originalPushState(data, unused, url);
    };

    window.history.replaceState = function (data, unused, url) {
      if (!confirmLeave()) return;
      return originalReplaceState(data, unused, url);
    };

    const handlePopState = () => {
      if (hasUnsavedRef.current && !confirmLeave()) {
        suppressing = true;
        window.history.pushState(null, "", window.location.href);
      }
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.history.pushState = originalPushState;
      window.history.replaceState = originalReplaceState;
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  useEffect(() => {
    if (persistedTicketId && tickets.length > 0 && !selectedTicket) {
      const match = tickets.find(t => t.id === persistedTicketId);
      if (match) {
        setSelectedTicket(match);
        setMobileActiveTab("workspace");
      }
    }
  }, [tickets, persistedTicketId]);

  const fetchMessages = useCallback(async (ticketId: number) => {
    setMessagesLoading(true);
    setMessagesError("");
    try {
      const data = await supportApi.getTicketMessages(ticketId);
      const mapped = (Array.isArray(data) ? data : []).map(mapToSandboxMessage);
      setMessages(mapped);
    } catch (err: any) {
      setMessagesError(err.message || "Could not retrieve comments.");
    } finally {
      setMessagesLoading(false);
    }
  }, []);

  useEffect(() => {
    if (selectedTicket) {
      fetchMessages(selectedTicket.id);
    } else {
      setMessages([]);
    }
  }, [selectedTicket, fetchMessages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessageText.trim() || !selectedTicket || sending) return;
    setSending(true);
    setMessagesError("");
    try {
      const result = await supportApi.sendMessage(selectedTicket.id, newMessageText.trim());
      const mapped = mapToSandboxMessage(result);
      setMessages((prev) => [...prev, mapped]);
      setNewMessageText("");
    } catch (err: any) {
      setMessagesError(err.message || "Failed to send message.");
    } finally {
      setSending(false);
    }
  };

  const handleUpdateStatus = async (targetStatus: TicketStatus) => {
    if (!selectedTicket) return;
    setUpdatingStatus(targetStatus);
    setMessagesError("");
    try {
      const realStatus = targetStatus === "pending" ? "open" : targetStatus === "open" ? "in_progress" : targetStatus;
      await supportApi.adminUpdateTicket(selectedTicket.id, { status: realStatus });
      const updated = await supportApi.getTicketDetails(selectedTicket.id);
      const mapped = mapToSandboxTicket(updated);
      setSelectedTicket(mapped);
      setTickets((prev) => prev.map((t) => (t.id === mapped.id ? mapped : t)));
      fetchMessages(mapped.id);
    } catch (err: any) {
      setMessagesError(err.message || "Failed to update ticket status.");
    } finally {
      setUpdatingStatus(null);
    }
  };

  const fetchTickets = async () => {
    setLoadingTickets(true);
    setErrorMessage("");
    try {
      const params = isCurrentUserAdmin && adminStatusFilter
        ? { status: adminStatusFilter }
        : {};

      let data: any[];
      if (isCurrentUserAdmin) {
        const response = await supportApi.adminGetAllTickets(params);
        data = response.results || response;
      } else {
        const response = await supportApi.getMyTickets(params);
        data = response.results || response;
      }

      const mapped = (Array.isArray(data) ? data : []).map(mapToSandboxTicket);
      setTickets(mapped);

      if (selectedTicket) {
        const updated = mapped.find((t: SupportTicket) => t.id === selectedTicket.id);
        if (updated) setSelectedTicket(updated);
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Unable to retrieve support tickets.");
    } finally {
      setLoadingTickets(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [adminStatusFilter, isCurrentUserAdmin]);

  const handleSelectTicket = (ticket: SupportTicket) => {
    setSelectedTicket(ticket);
    setPersistedTicketId(ticket.id);
    setIsCreatingNewTicket(false);
    setMobileActiveTab("workspace");
  };

  const handleCreateTicket = async (subject: string, description: string) => {
    await supportApi.createTicket({ subject, description });
    await fetchTickets();
    setIsCreatingNewTicket(false);
    setMobileActiveTab("queue");
  };

  const handleTicketUpdate = (updated: SupportTicket) => {
    setSelectedTicket(updated);
    setTickets((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
  };

  return (
    <div className="min-h-screen bg-bg flex flex-col font-sans text-text antialiased selection:bg-primary/20 selection:text-primary leading-normal">
      <header className="bg-surface text-text border-b border-border shadow-md shrink-0">
        <div className="max-w-7xl mx-auto px-4 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="bg-primary p-2 rounded-lg text-white">
              <LifeBuoy className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-bold text-base tracking-tight text-text flex items-center gap-1.5">
                SUPPORT HUB
                <span className="text-[10px] font-mono font-bold text-primary bg-primary/10 rounded px-1.5 py-0.2 border border-primary/20 uppercase tracking-widest">v2</span>
              </h1>
              <p className="text-[10px] text-text-muted font-mono tracking-wider uppercase">
                Ticketing & Notification Console
              </p>
            </div>
          </div>

          {isCurrentUserAdmin && (
            <button
              onClick={() => { setSelectedTicket(null); setIsCreatingNewTicket(false); setAdminStatusFilter(""); fetchTickets(); }}
              disabled={syncingAll}
              title="Refresh all tickets"
              className="px-3.5 py-1.5 border border-border bg-surface-alt/80 hover:bg-surface-alt text-text-muted hover:text-text text-xs rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 active:scale-95 disabled:opacity-40 font-mono"
            >
              <RefreshCw className={`w-3 ${syncingAll ? "animate-spin" : ""}`} />
              <span className="hidden leading-none xs:inline">Refresh</span>
            </button>
          )}
        </div>
      </header>

      {isCurrentUserAdmin && (
        <div className="bg-surface-alt border-b border-border/80 shrink-0">
          <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex bg-surface p-1.5 rounded-xl border border-border w-full md:w-auto relative overflow-hidden" id="role-mode-selector">
              <button
                onClick={() => setRoleMode("user")}
                className={`flex-1 md:flex-initial px-4.5 py-2 text-[11px] font-semibold font-mono tracking-wider transition-all flex items-center justify-center gap-2 rounded-lg cursor-pointer ${
                  roleMode === "user"
                    ? "bg-primary text-white shadow-inner font-extrabold"
                    : "text-text-muted hover:text-text"
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>USER VIEW</span>
              </button>
              <button
                onClick={() => setRoleMode("admin")}
                className={`flex-1 md:flex-initial px-4.5 py-2 text-[11px] font-semibold font-mono tracking-wider transition-all flex items-center justify-center gap-2 rounded-lg cursor-pointer ${
                  roleMode === "admin"
                    ? "bg-rose-600 text-white shadow-inner font-extrabold"
                    : "text-text-muted hover:text-text"
                }`}
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>ADMIN HUD</span>
              </button>
            </div>
          </div>
        </div>
      )}

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 flex flex-col lg:grid lg:grid-cols-12 gap-4 overflow-hidden min-h-0">

        <div className="lg:hidden flex items-center justify-between p-1 bg-surface border border-border rounded-xl mb-1 flex-wrap sm:flex-nowrap gap-1 shrink-0 font-mono">
          <button
            onClick={() => setMobileActiveTab("queue")}
            className={`flex-1 py-2.5 px-3 rounded-lg text-[11px] font-bold tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              mobileActiveTab === "queue"
                ? "bg-primary text-white font-extrabold border border-primary"
                : "bg-transparent text-text-muted hover:text-text border border-transparent"
            }`}
          >
            <Archive className="w-3.5 h-3.5" />
            <span>QUEUE</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono font-black ${
              mobileActiveTab === "queue" ? "bg-black/20 text-white" : "bg-surface border border-border text-text-muted"
            }`}>
              {tickets.length}
            </span>
          </button>

          <button
            onClick={() => setMobileActiveTab("workspace")}
            className={`flex-1 py-2.5 px-3 rounded-lg text-[11px] font-bold tracking-wider transition-all flex items-center justify-center gap-1.5 relative cursor-pointer ${
              mobileActiveTab === "workspace"
                ? "bg-primary text-white font-extrabold border border-primary"
                : "bg-transparent text-text-muted hover:text-text border border-transparent"
            }`}
          >
            <LifeBuoy className="w-3.5 h-3.5" />
            <span>WORKSPACE</span>
            {(selectedTicket || isCreatingNewTicket) && (
              <span className="absolute top-1 right-1 flex h-1.5 w-1.5">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                  mobileActiveTab === "workspace" ? "bg-text-inverse" : "bg-primary"
                }`}></span>
                <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${
                  mobileActiveTab === "workspace" ? "bg-text-inverse" : "bg-primary"
                }`}></span>
              </span>
            )}
          </button>

        </div>

        <section className={`lg:col-span-4 flex flex-col gap-3 min-h-0 ${mobileActiveTab === "queue" ? "flex" : "hidden lg:flex"}`}>

          {roleMode === "user" && (
            <button
              onClick={() => { setSelectedTicket(null); setIsCreatingNewTicket(true); setMobileActiveTab("workspace"); }}
              id="create-new-ticket-cta"
              className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer ${
                isCreatingNewTicket
                  ? "bg-surface text-text border border-border"
                  : "bg-primary hover:bg-primary-hover text-white"
              }`}
            >
              <PlusCircle className="w-4 h-4" />
              <span>Submit New Ticket</span>
            </button>
          )}

          <div className="flex items-center justify-between text-[10px] font-bold tracking-widest text-text-muted uppercase px-1">
            <span>Tickets</span>
            <button
              onClick={fetchTickets}
              id="refresh-tickets-btn"
              className="hover:text-primary flex items-center gap-1 transition-all"
              disabled={loadingTickets}
            >
              <RefreshCw className={`w-3 h-3 ${loadingTickets ? "animate-spin" : ""}`} />
              <span>Refresh</span>
            </button>
          </div>

          <div className="flex-1 min-h-0">
            {loadingTickets && tickets.length === 0 ? (
              <div className="p-8 text-center bg-surface rounded-xl border border-border text-text-muted text-xs flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-primary" />
                Loading tickets...
              </div>
            ) : (
              <TicketList
                tickets={tickets}
                selectedTicketId={selectedTicket?.id || null}
                onSelectTicket={handleSelectTicket}
                isAdminMode={roleMode === "admin"}
                adminStatusFilter={adminStatusFilter}
                onAdminStatusFilterChange={(val) => setAdminStatusFilter(val)}
                buttonColor={buttonColor}
              />
            )}
          </div>
        </section>

        <section className={`lg:col-span-8 flex flex-col lg:grid lg:grid-rows-12 gap-4 min-h-0 ${
          mobileActiveTab === "workspace" ? "flex" : "hidden lg:flex"
        }`}>

          <div className={`lg:row-span-12 flex flex-col min-h-0 ${
            mobileActiveTab === "workspace" ? "flex" : "hidden lg:flex"
          }`}>
            {isCreatingNewTicket ? (
              <TicketForm currentUser={currentSupportUser} onSubmit={handleCreateTicket} buttonColor={buttonColor} />
            ) : selectedTicket ? (
              <ChatInterface
                ticket={selectedTicket}
                messages={messages}
                currentUserId={currentSupportUser.id}
                isAdmin={roleMode === "admin"}
                newMessageText={newMessageText}
                sending={sending}
                updatingStatus={updatingStatus}
                messagesLoading={messagesLoading}
                messagesError={messagesError}
                onNewMessageChange={setNewMessageText}
                onSendMessage={handleSendMessage}
                onUpdateStatus={handleUpdateStatus}
                onFetchMessages={() => fetchMessages(selectedTicket.id)}
              />
            ) : (
              <div id="empty-dashboard-splash" className="bg-surface rounded-xl border border-border shadow-sm p-6 sm:p-10 flex flex-col items-center justify-center text-center flex-1 min-h-[300px]">
                <div className="bg-primary/10 p-4 rounded-2xl text-primary mb-4 ring-4 ring-primary/5">
                  <LifeBuoy className="w-10 h-10 text-primary" />
                </div>

                <h3 className="text-xl font-bold text-text mb-2">
                  {roleMode === "admin" ? "ADMIN HUD" : "SUPPORT PORTAL"}
                </h3>
                <p className="text-xs text-text-muted max-w-md mx-auto leading-relaxed mb-6 font-sans">
                  {roleMode === "admin"
                    ? "Manage the support pipeline, configure state transitions, and respond to user tickets."
                    : "Submit support requests, review your ticket queue, and chat with administrators."
                  }
                </p>

                <div className="bg-surface-alt p-4 rounded-xl border border-border/80 mb-6 max-w-lg text-left" id="demo-guide">
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-primary mb-2 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-primary" />
                    <span>Quick Guide:</span>
                  </h4>
                  {roleMode === "admin" ? (
                    <ol className="text-[11px] text-text-muted space-y-2 list-decimal list-inside font-mono leading-relaxed">
                      <li>Select a ticket from the queue sidebar to view details.</li>
                      <li>Set status overrides and respond to user messages.</li>
                    </ol>
                  ) : (
                    <ol className="text-[11px] text-text-muted space-y-2 list-decimal list-inside font-mono leading-relaxed">
                      <li>Click <span className="font-bold text-primary">Submit New Ticket</span> to create a request.</li>
                      <li>Track your ticket status in the sidebar queue.</li>
                      <li>Chat with admins once they pick up your ticket.</li>
                    </ol>
                  )}
                </div>

                {roleMode === "user" && (
                  <button
                    onClick={() => { setIsCreatingNewTicket(true); setMobileActiveTab("workspace"); }}
                    className="px-5 py-2.5 bg-primary hover:bg-primary-hover text-white font-semibold text-xs rounded-full flex items-center gap-1.5 shadow-md cursor-pointer transition-all active:scale-95"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>Create Support Ticket</span>
                  </button>
                )}

                {roleMode === "admin" && (
                  <div className="text-[11px] border border-dashed border-border rounded p-2 px-3 text-text-muted flex items-center gap-2 font-mono">
                    <HelpCircle className="w-4 h-4 text-primary" />
                    <span>Select a ticket from the queue to view and respond.</span>
                  </div>
                )}
              </div>
            )}
          </div>

        </section>

      </main>
    </div>
  );
};

export default SupportPage;
