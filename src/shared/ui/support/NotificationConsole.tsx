import React, { useState } from "react";
import { NotificationLog } from "./types";
import { Mail, Bell, RefreshCw, Trash2, ShieldAlert } from "lucide-react";

interface NotificationConsoleProps {
  notifications: NotificationLog[];
  onRefresh: () => void;
  onClear: () => void;
  buttonColor: string;
}

export default function NotificationConsole({
  notifications,
  onRefresh,
  onClear,
  buttonColor,
}: NotificationConsoleProps) {
  const [activeTab, setActiveTab] = useState<"all" | "email" | "in_app">("all");

  const filtered = notifications.filter((n) => {
    if (activeTab === "all") return true;
    return n.type === activeTab;
  });

  return (
    <div className="bg-surface/90 rounded-xl border border-border shadow-xl overflow-hidden flex flex-col h-[320px] lg:h-full">
      <div className="bg-surface border-b border-border px-4 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="bg-primary/10 p-1.5 rounded-lg text-primary border border-primary/20">
            <Bell className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-xs tracking-wider text-text uppercase">System Notification Outbox</h3>
            <p className="text-[10px] text-text-muted font-mono">Mail & Push Notification Logs</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={onRefresh}
            id="refresh-notifications-btn"
            title="Refresh Notification Outbox"
            className="p-1 px-2.5 rounded-lg border border-border bg-surface-alt text-text-muted hover:text-text text-xs hover:bg-surface-alt/80 flex items-center gap-1 transition-all"
          >
            <RefreshCw className="w-3 h-3" />
            <span className="text-[10.5px] font-mono font-bold">RELOAD</span>
          </button>
          <button
            onClick={onClear}
            id="clear-notifications-btn"
            title="Clear Log Outbox"
            className="p-2 text-rose-450 hover:bg-rose-500/10 bg-surface-alt border border-border hover:border-rose-500/30 rounded-lg transition-all"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="bg-surface border-b border-border px-3 py-2 flex gap-1.5 items-center font-mono">
        <button
          onClick={() => setActiveTab("all")}
          className={`px-2.5 py-1 text-[10px] uppercase font-bold rounded transition-all cursor-pointer ${
            activeTab === "all"
              ? "bg-text text-bg font-extrabold"
              : "bg-surface-alt text-text-muted hover:text-text border border-border"
          }`}
          id="notif-tab-all"
        >
          ALL LOGS ({notifications.length})
        </button>
        <button
          onClick={() => setActiveTab("email")}
          className={`px-2.5 py-1 text-[10px] uppercase font-bold rounded transition-all cursor-pointer flex items-center gap-1 ${
            activeTab === "email"
              ? "bg-primary text-white font-extrabold"
              : "bg-surface-alt text-text-muted hover:text-text border border-border"
          }`}
          id="notif-tab-email"
        >
          <Mail className="w-3 h-3" />
          MAILS ({notifications.filter((n) => n.type === "email").length})
        </button>
        <button
          onClick={() => setActiveTab("in_app")}
          className={`px-2.5 py-1 text-[10px] uppercase font-bold rounded transition-all cursor-pointer flex items-center gap-1 ${
            activeTab === "in_app"
              ? "bg-primary text-white font-extrabold"
              : "bg-surface-alt text-text-muted hover:text-text border border-border"
          }`}
          id="notif-tab-in-app"
        >
          <Bell className="w-3 h-3" />
          ALERTS ({notifications.filter((n) => n.type === "in_app").length})
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-surface-alt text-text-secondary font-mono text-xs">
        {filtered.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-text-muted py-10 font-mono">
            <ShieldAlert className="w-8 h-8 mb-2 opacity-30 text-primary" />
            <p className="text-center font-bold">No event hooks recorded.</p>
            <p className="text-[9.5px] text-center max-w-[280px] mt-1 opacity-50 leading-relaxed">
              Submitting tickets or changing support states will trigger automated system alerts down here.
            </p>
          </div>
        ) : (
          filtered.map((log) => {
            const formattedTime = new Date(log.created_at).toLocaleTimeString();
            return (
              <div
                key={log.id}
                id={`notif-log-${log.id}`}
                className={`p-3 rounded-lg border text-left transition-all ${
                  log.type === "email"
                    ? "bg-blue-950/30 border-blue-800/50 text-blue-300"
                    : "bg-emerald-950/30 border-emerald-800/50 text-emerald-300"
                }`}
              >
                <div className="flex items-center justify-between gap-1 mb-1.5 border-b border-indigo-900/10 pb-1 font-mono">
                  <div className="flex items-center gap-1.5 font-extrabold uppercase tracking-widest text-[9px]">
                    {log.type === "email" ? (
                      <>
                        <Mail className="w-3 h-3 text-blue-400" />
                        <span>SMTP EMAIL TRIGGERED</span>
                      </>
                    ) : (
                      <>
                        <Bell className="w-3 h-3 text-primary" />
                        <span>IN-APP DISPATCH</span>
                      </>
                    )}
                  </div>
                  <span className="text-[10px] text-text-muted">{formattedTime}</span>
                </div>

                <div className="space-y-1 text-[11px] font-mono text-text-muted">
                  <div>
                    <span className="text-text-muted font-bold uppercase text-[9px]">To:</span>{" "}
                    <span className="text-primary/80 select-all font-semibold">{log.recipient}</span>
                  </div>
                  <div>
                    <span className="text-text-muted font-bold uppercase text-[9px]">Subject:</span>{" "}
                    <span className="text-text font-semibold">{log.title}</span>
                  </div>
                  <div className="mt-1.5 pt-1.5 border-t border-border/40 text-text-muted break-words bg-bg/40 p-2 rounded text-[10px] leading-relaxed">
                    {log.body}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
