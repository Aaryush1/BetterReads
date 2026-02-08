"use client";

import { useState } from "react";
import type { Shelf } from "@/types/book";

interface ShelfWithCount extends Shelf {
  bookCount: number;
}

interface ShelfManagerProps {
  shelves: ShelfWithCount[];
  onUpdate: () => void;
  onClose: () => void;
}

export default function ShelfManager({
  shelves,
  onUpdate,
  onClose,
}: ShelfManagerProps) {
  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function createShelf() {
    const name = newName.trim();
    if (!name) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/shelves", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to create shelf");
        return;
      }
      setNewName("");
      onUpdate();
    } catch {
      setError("Failed to create shelf");
    } finally {
      setLoading(false);
    }
  }

  async function renameShelf(id: string) {
    const name = editName.trim();
    if (!name) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/shelves/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to rename shelf");
        return;
      }
      setEditingId(null);
      onUpdate();
    } catch {
      setError("Failed to rename shelf");
    } finally {
      setLoading(false);
    }
  }

  async function deleteShelf(id: string) {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/shelves/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to delete shelf");
        return;
      }
      setDeleteConfirmId(null);
      onUpdate();
    } catch {
      setError("Failed to delete shelf");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-[var(--radius-lg)] border border-border bg-bg-card shadow-[var(--shadow-md)]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border-light px-5 py-4">
          <h3 className="font-display text-lg font-medium text-text-primary">
            Manage Shelves
          </h3>
          <button
            onClick={onClose}
            className="text-text-tertiary transition-colors hover:text-text-primary"
          >
            ✕
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="mx-5 mt-4 rounded-[var(--radius-sm)] border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
            {error}
          </div>
        )}

        {/* Shelf list */}
        <div className="max-h-72 overflow-y-auto px-5 py-4">
          <div className="flex flex-col gap-1">
            {shelves.map((shelf) => (
              <div key={shelf.id}>
                {deleteConfirmId === shelf.id ? (
                  <div className="rounded-[var(--radius-sm)] border border-red-200 bg-red-50 p-3 dark:border-red-800 dark:bg-red-900/20">
                    <p className="text-sm text-red-700 dark:text-red-400">
                      Delete &ldquo;{shelf.name}&rdquo;?{" "}
                      {shelf.bookCount > 0 && (
                        <span className="font-medium">
                          {shelf.bookCount} book{shelf.bookCount !== 1 ? "s" : ""} will
                          be removed.
                        </span>
                      )}
                    </p>
                    <div className="mt-2 flex gap-2">
                      <button
                        onClick={() => deleteShelf(shelf.id)}
                        disabled={loading}
                        className="rounded-[var(--radius-sm)] bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700 disabled:opacity-60"
                      >
                        Delete
                      </button>
                      <button
                        onClick={() => setDeleteConfirmId(null)}
                        className="rounded-[var(--radius-sm)] px-3 py-1.5 text-xs font-medium text-text-secondary hover:text-text-primary"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : editingId === shelf.id ? (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      renameShelf(shelf.id);
                    }}
                    className="flex items-center gap-2 py-1"
                  >
                    <input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      autoFocus
                      className="flex-1 rounded-[var(--radius-sm)] border border-border bg-bg-card px-3 py-1.5 text-sm text-text-primary outline-none focus:border-green-deep"
                    />
                    <button
                      type="submit"
                      disabled={loading || !editName.trim()}
                      className="rounded-[var(--radius-sm)] bg-green-deep px-3 py-1.5 text-xs font-medium text-white hover:bg-green-medium disabled:opacity-60"
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingId(null)}
                      className="text-xs text-text-tertiary hover:text-text-primary"
                    >
                      Cancel
                    </button>
                  </form>
                ) : (
                  <div className="group flex items-center justify-between rounded-[var(--radius-sm)] px-3 py-2.5 transition-colors hover:bg-bg-warm">
                    <div className="flex items-center gap-2">
                      {shelf.isDefault && (
                        <span className="text-text-tertiary" title="Default shelf">
                          🔒
                        </span>
                      )}
                      <span className="text-sm font-medium text-text-primary">
                        {shelf.name}
                      </span>
                      <span className="rounded-full bg-border-light px-2 py-0.5 text-xs font-medium text-text-tertiary">
                        {shelf.bookCount}
                      </span>
                    </div>
                    {!shelf.isDefault && (
                      <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                        <button
                          onClick={() => {
                            setEditingId(shelf.id);
                            setEditName(shelf.name);
                          }}
                          className="rounded px-2 py-1 text-xs text-text-tertiary hover:bg-border-light hover:text-text-primary"
                        >
                          Rename
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(shelf.id)}
                          className="rounded px-2 py-1 text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Create new shelf */}
        <div className="border-t border-border-light px-5 py-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              createShelf();
            }}
            className="flex gap-2"
          >
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="New shelf name..."
              className="flex-1 rounded-[var(--radius-sm)] border border-border bg-bg-card px-3 py-2 text-sm text-text-primary placeholder:text-text-tertiary outline-none focus:border-green-deep"
            />
            <button
              type="submit"
              disabled={loading || !newName.trim()}
              className="rounded-[var(--radius-sm)] bg-green-deep px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-medium disabled:opacity-60"
            >
              Add
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
