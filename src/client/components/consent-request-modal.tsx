"use client";

import { useState } from "react";
import { MEMORY_CATEGORIES } from "@/server/validators/vault-context.validator";

interface ConsentRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  appId: string;
  appName: string;
}

export function ConsentRequestModal({ isOpen, onClose, appId, appName }: ConsentRequestModalProps) {
  const [selectedCategories, setSelectedCategories] = useState<string[]>(["health", "activity"]);
  const [operation, setOperation] = useState<"read" | "write">("read");
  const [maxSensitivity, setMaxSensitivity] = useState<"personal" | "private" | "protected">(
    "personal"
  );
  const [reason, setReason] = useState(
    `To personalize ${appName} recommendations based on your personal routines and health.`
  );
  const [submitting, setSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  if (!isOpen) return null;

  const toggleCategory = (cat: string) => {
    setSelectedCategories(prev =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedCategories.length === 0 || !reason.trim() || submitting) return;

    setSubmitting(true);
    setStatusMessage(null);

    try {
      const res = await fetch("/api/vault/consent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          appId,
          operation,
          categories: selectedCategories,
          maxSensitivity,
          reason: reason.trim(),
        }),
      });

      const body = await res.json();
      if (!res.ok || !body.success) {
        throw new Error(body.message || "Failed to submit consent request");
      }

      setStatusMessage({
        type: "success",
        text: "Access request submitted! Check your Personal Memory Vault dashboard to approve.",
      });
      setTimeout(() => {
        onClose();
        setStatusMessage(null);
      }, 2500);
    } catch (err: unknown) {
      setStatusMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Failed to submit request",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl w-full max-w-lg shadow-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-base font-bold text-zinc-900 dark:text-zinc-100">
              Request Vault Access
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
              POST /consent-requests
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 text-sm px-2 py-1 rounded-lg"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <p className="text-xs text-zinc-600 dark:text-zinc-400">
            Ask the Personal Memory Vault owner for permissions that <strong>{appName}</strong>{" "}
            doesn’t have yet. This request will appear on your Vault dashboard for approval.
          </p>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Operation:
            </label>
            <div className="flex gap-3 text-xs">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="operation"
                  value="read"
                  checked={operation === "read"}
                  onChange={() => setOperation("read")}
                  className="accent-purple-600"
                />
                <span>Read Context</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="operation"
                  value="write"
                  checked={operation === "write"}
                  onChange={() => setOperation("write")}
                  className="accent-purple-600"
                />
                <span>Write Memories</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
              Categories to Request ({selectedCategories.length} selected):
            </label>
            <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto p-1.5 border border-zinc-200 dark:border-zinc-800 rounded-xl bg-zinc-50 dark:bg-zinc-950/40">
              {MEMORY_CATEGORIES.map(cat => {
                const selected = selectedCategories.includes(cat);
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => toggleCategory(cat)}
                    className={`px-2 py-1 rounded-md text-[11px] font-medium transition-all ${
                      selected
                        ? "bg-purple-600 text-white shadow-xs"
                        : "bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700 hover:border-zinc-300"
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Maximum Sensitivity Tier:
            </label>
            <select
              value={maxSensitivity}
              onChange={e =>
                setMaxSensitivity(e.target.value as "personal" | "private" | "protected")
              }
              className="w-full text-xs rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-zinc-900 dark:text-zinc-100 outline-none"
            >
              <option value="shareable">Shareable (Low)</option>
              <option value="personal">Personal (Standard)</option>
              <option value="private">Private (Sensitive)</option>
              <option value="protected">Protected (Special/Medical)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Reason shown to Owner (required):
            </label>
            <textarea
              rows={2}
              value={reason}
              onChange={e => setReason(e.target.value)}
              maxLength={300}
              placeholder="Explain why this access improves the app experience..."
              className="w-full text-xs rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-2.5 text-zinc-900 dark:text-zinc-100 outline-none resize-none"
            />
            <span className="text-[10px] text-zinc-400 block text-right">{reason.length}/300</span>
          </div>

          {statusMessage && (
            <div
              className={`p-2.5 rounded-xl text-xs font-medium ${
                statusMessage.type === "success"
                  ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                  : "bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800"
              }`}
            >
              {statusMessage.text}
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-200 dark:border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-3 py-1.5 text-xs text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || selectedCategories.length === 0 || !reason.trim()}
              className="px-4 py-1.5 text-xs font-semibold bg-purple-600 hover:bg-purple-700 text-white rounded-lg shadow-xs disabled:opacity-40"
            >
              {submitting ? "Sending..." : "Submit Consent Request"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
