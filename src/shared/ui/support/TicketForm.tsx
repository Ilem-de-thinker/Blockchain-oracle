import React, { useState } from "react";
import { PlusCircle, Loader2, AlertCircle } from "lucide-react";
import { SupportUser } from "./types";

interface TicketFormProps {
  currentUser: SupportUser;
  onSubmit: (subject: string, description: string) => Promise<void>;
  buttonColor: string;
}

export default function TicketForm({ currentUser, onSubmit, buttonColor }: TicketFormProps) {
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim()) {
      setErrorMsg("Please provide a concise subject.");
      return;
    }
    if (!description.trim()) {
      setErrorMsg("Please explain your issue in the description.");
      return;
    }

    setSubmitting(true);
    setErrorMsg("");
    setSuccess(false);

    try {
      await onSubmit(subject.trim(), description.trim());
      setSubject("");
      setDescription("");
      setSuccess(true);
      setTimeout(() => setSuccess(false), 4000);
    } catch (err: any) {
      setErrorMsg(err.message || "An unexpected error occurred.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-surface/90 rounded-xl border border-border shadow-xl p-4 sm:p-5">
      <div className="flex items-center gap-2 mb-4">
        <div className="bg-primary/10 p-2 rounded-lg text-primary border border-primary/10">
          <PlusCircle className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-bold text-[15px] text-text">SUBMIT NEW CASE</h3>
          <p className="text-xs text-text-muted">Initiate a request to be handled by the administrator team</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3.5">
        {errorMsg && (
          <div className="bg-red-500/10 text-red-300 text-xs p-3 rounded-lg flex items-start gap-2 border border-red-500/20" id="ticket-form-error">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        {success && (
          <div className="bg-primary/10 text-primary text-xs p-3 rounded-lg border border-primary/20" id="ticket-form-success">
            Ticket submitted successfully! Support staff have been notified.
          </div>
        )}

        <div>
          <label htmlFor="subject-input" className="block text-[10px] font-bold uppercase tracking-wider text-text-muted mb-1 font-mono">
            Subject Summary
          </label>
          <input
            id="subject-input"
            type="text"
            className="w-full text-xs border border-border rounded-lg px-3.5 py-2 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary bg-surface-alt hover:bg-surface-alt/80 transition-all text-text placeholder-text-muted"
            placeholder="e.g. Issue with course enrollment"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            disabled={submitting}
          />
        </div>

        <div>
          <label htmlFor="description-input" className="block text-[10px] font-bold uppercase tracking-wider text-text-muted mb-1 font-mono">
            Detailed Description
          </label>
          <textarea
            id="description-input"
            rows={4}
            className="w-full text-xs border border-border rounded-lg px-3.5 py-2 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary bg-surface-alt hover:bg-surface-alt/80 transition-all text-text placeholder-text-muted resize-none font-sans"
            placeholder="Describe your issue with full details so we can assist..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={submitting}
          />
        </div>

         <div className="bg-surface-alt/90 border-t border-border -mx-4 -mb-4 sm:-mx-5 sm:-mb-5 p-3.5 px-4 sm:px-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-b-xl">
           <div className="flex items-start gap-2.5 font-mono">
             <img
               src={currentUser.avatar || `https://i.pravatar.cc/100?u=${currentUser.email}`}
               alt={currentUser.full_name}
               className="w-8 h-8 sm:w-5 sm:h-5 rounded-full object-cover ring-1 ring-border mt-0.5 sm:mt-0"
               referrerPolicy="no-referrer"
             />
             <div className="flex flex-col">
               <span className="text-[9px] text-text-muted font-bold uppercase tracking-wider">Filing Identity</span>
               <span className="text-sm sm:text-[10px] text-text-secondary font-semibold">{currentUser.full_name}</span>
             </div>
           </div>
          <button
            type="submit"
            id="submit-ticket-btn"
            disabled={submitting}
            className="px-5 py-2 text-xs font-bold text-white bg-primary hover:bg-primary-hover disabled:bg-surface disabled:text-text-muted rounded-full flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
          >
            {submitting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Submitting...</span>
              </>
            ) : (
              <span>Submit Ticket</span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
