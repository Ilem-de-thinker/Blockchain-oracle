import React, { useState } from "react";
import { SupportTicket, TicketStatus } from "./types";
import { Search, User, UserCheck, Calendar, Filter, Archive } from "lucide-react";

interface TicketListProps {
  tickets: SupportTicket[];
  selectedTicketId: number | null;
  onSelectTicket: (ticket: SupportTicket) => void;
  isAdminMode: boolean;
  adminStatusFilter: string;
  onAdminStatusFilterChange: (status: string) => void;
  buttonColor: string;
}

export default function TicketList({
  tickets,
  selectedTicketId,
  onSelectTicket,
  isAdminMode,
  adminStatusFilter,
  onAdminStatusFilterChange,
  buttonColor,
}: TicketListProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const searchedTickets = tickets.filter((t) => {
    const term = searchTerm.toLowerCase();
    return (
      t.subject.toLowerCase().includes(term) ||
      t.description.toLowerCase().includes(term) ||
      t.user.full_name.toLowerCase().includes(term) ||
      (t.assigned_to?.full_name || "").toLowerCase().includes(term)
    );
  });

  const getStatusBadge = (status: TicketStatus) => {
    switch (status) {
      case "pending":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-400/15 text-amber-400 border border-amber-500/20">
            PENDING
          </span>
        );
      case "open":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-blue-400/15 text-blue-400 border border-blue-500/20">
            OPEN
          </span>
        );
      case "resolved":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-primary/15 text-primary border border-primary/20">
            RESOLVED
          </span>
        );
      case "closed":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-text-muted/10 text-text-muted border border-gray-600/20">
            CLOSED
          </span>
        );
    }
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="flex flex-col h-full bg-surface/90 rounded-xl border border-border shadow-xl overflow-hidden min-h-[400px]">
      <div className="p-4 border-b border-border space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-xs tracking-wider text-text-secondary uppercase flex items-center gap-1.5">
            <Archive className="text-primary w-3.5 h-3.5" />
            <span>{isAdminMode ? "TICKET QUEUE" : "MY TICKETS"}</span>
          </h3>
          <span className="text-[10px] font-mono font-bold text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-full">
            {searchedTickets.length} ITEMS
          </span>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-text-muted" />
          <input
            id="ticket-search-input"
            type="text"
            placeholder="Filter tickets..."
            className="w-full text-xs border border-border rounded-lg pl-9 pr-3 py-1.5 bg-surface-alt hover:bg-surface-alt/80 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all text-text placeholder-text-muted"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {isAdminMode && (
          <div className="pt-2 border-t border-border">
            <div className="flex items-center gap-1.5 mb-1.5">
              <Filter className="w-3 text-primary" />
              <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">
                Filter Status
              </span>
            </div>
            <div className="grid grid-cols-5 gap-1" id="admin-status-filters">
              {[
                { label: "ALL", value: "" },
                { label: "PEND", value: "pending" },
                { label: "OPEN", value: "open" },
                { label: "RESOLV", value: "resolved" },
                { label: "CLOSED", value: "closed" },
              ].map((filter) => (
                <button
                  key={filter.value}
                  onClick={() => onAdminStatusFilterChange(filter.value)}
                  className={`py-1 text-[9px] font-bold font-mono rounded text-center transition-all border ${
                    adminStatusFilter === filter.value
                      ? "bg-primary text-white border-primary hover:bg-primary-hover"
                      : "bg-surface-alt hover:bg-surface-alt/65 text-text-muted border-border"
                  }`}
                  id={`filter-btn-${filter.value || "all"}`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto divide-y divide-border bg-surface-alt/20">
        {searchedTickets.length === 0 ? (
          <div className="p-8 text-center" id="ticket-list-empty">
            <p className="text-xs text-text-muted font-mono">No matching records found.</p>
            {!isAdminMode ? (
              <p className="text-[10px] text-text-muted mt-1 font-mono">Submit your first support ticket on the right panel.</p>
            ) : (
              <p className="text-[10px] text-text-muted mt-1 font-mono">Try selecting a different status filter above.</p>
            )}
          </div>
        ) : (
          searchedTickets.map((ticket) => {
            const isSelected = selectedTicketId === ticket.id;
            return (
              <button
                key={ticket.id}
                id={`ticket-card-${ticket.id}`}
                onClick={() => onSelectTicket(ticket)}
                className={`w-full p-4 text-left flex flex-col gap-2.5 transition-all outline-none border-l-4 ${
                  isSelected
                    ? "bg-surface/20 border-l-primary"
                    : "bg-surface/30 hover:bg-surface/40 border-l-transparent"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-mono font-bold text-text-secondary bg-surface-alt border border-border px-2 py-0.5 rounded">
                    #ID_0{ticket.id}
                  </span>
                  {getStatusBadge(ticket.status)}
                </div>

                <div>
                  <h4 className="font-bold text-xs text-text line-clamp-1">
                    {ticket.subject}
                  </h4>
                  <p className="text-[11px] text-text-muted line-clamp-2 mt-0.5 leading-relaxed font-sans">
                    {ticket.description}
                  </p>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] text-text-muted pt-2 border-t border-border max-w-full font-mono">
                  <div className="flex items-center gap-1 min-w-0" title={`Filed by ${ticket.user.full_name}`}>
                    <User className="w-3 h-3 text-text-muted shrink-0" />
                    <span className="truncate max-w-[100px] text-text-secondary font-semibold">{ticket.user.full_name}</span>
                  </div>

                  <div className="flex items-center gap-1 min-w-0" title={`Assigned to ${ticket.assigned_to?.full_name || 'Unassigned'}`}>
                    <UserCheck className="w-3 h-3 text-text-muted shrink-0" />
                    <span className="truncate max-w-[100px]">
                      {ticket.assigned_to ? (
                        <span className="text-primary font-bold">{ticket.assigned_to.full_name}</span>
                      ) : (
                        <span className="text-text-muted italic font-normal">No Admin</span>
                      )}
                    </span>
                  </div>

                  <div className="flex items-center gap-0.5 text-text-muted shrink-0">
                    <Calendar className="w-3 h-3 shrink-0 text-text-muted" />
                    <span className="text-text-muted">{formatDate(ticket.created_at)}</span>
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
