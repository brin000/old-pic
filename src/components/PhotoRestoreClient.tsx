"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Header,
  ApiKeyModal,
  UploadZone,
  TaskQueue,
  RestorePreview,
  RestorePlaceholder,
} from "./photo-restore";
import type { Task } from "./photo-restore";
import {
  API_KEY_STORAGE_KEY,
  restorePhoto,
} from "@/lib/restore";

function createTask(file: File): Task {
  return {
    id: crypto.randomUUID(),
    file,
    originalPreview: URL.createObjectURL(file),
    restoredPreview: null,
    status: "pending",
    errorMsg: null,
    mimeType: file.type,
  };
}

function downloadImg(url: string, name: string) {
  if (!url) return;
  const a = document.createElement("a");
  a.href = url;
  a.download = `Restored_${name}`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

export default function PhotoRestoreClient() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [customApiKey, setCustomApiKey] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const [viewingTaskId, setViewingTaskId] = useState<string | null>(null);
  const [isBulkProcessing, setIsBulkProcessing] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(API_KEY_STORAGE_KEY);
      if (stored) setCustomApiKey(stored);
    }
  }, []);

  const handleSaveApiKey = useCallback((val: string) => {
    if (val.trim()) {
      localStorage.setItem(API_KEY_STORAGE_KEY, val.trim());
      setCustomApiKey(val.trim());
    } else {
      localStorage.removeItem(API_KEY_STORAGE_KEY);
      setCustomApiKey("");
    }
  }, []);

  const handleFiles = useCallback((files: FileList | File[]) => {
    const newTasks = Array.from(files).map(createTask);
    setTasks((prev) => [...prev, ...newTasks]);
  }, []);

  const removeTask = useCallback((id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    setViewingTaskId((current) => (current === id ? null : current));
  }, []);

  const retryTask = useCallback(async (id: string) => {
    const task = tasks.find((t) => t.id === id);
    if (!task || task.status !== "error") return;
    if (isBulkProcessing) return;

    setTasks((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, status: "processing" as const, errorMsg: null } : t
      )
    );

    try {
      const restoredUrl = await restorePhoto(task.file, task.mimeType);
      setTasks((prev) =>
        prev.map((t) =>
          t.id === id
            ? { ...t, status: "done" as const, restoredPreview: restoredUrl }
            : t
        )
      );
    } catch (e) {
      const msg = e instanceof Error ? e.message : "修复失败";
      setTasks((prev) =>
        prev.map((t) =>
          t.id === id ? { ...t, status: "error" as const, errorMsg: msg } : t
        )
      );
    }
  }, [tasks, isBulkProcessing]);

  const startBulkRestore = useCallback(async () => {
    if (isBulkProcessing) return;
    setIsBulkProcessing(true);

    for (const task of tasks) {
      if (task.status === "done" || task.status === "processing") continue;

      setTasks((prev) =>
        prev.map((t) =>
          t.id === task.id ? { ...t, status: "processing" as const } : t
        )
      );

      try {
        const restoredUrl = await restorePhoto(task.file, task.mimeType);
        setTasks((prev) =>
          prev.map((t) =>
            t.id === task.id
              ? { ...t, status: "done" as const, restoredPreview: restoredUrl }
              : t
          )
        );
      } catch (e) {
        const msg = e instanceof Error ? e.message : "修复失败";
        setTasks((prev) =>
          prev.map((t) =>
            t.id === task.id
              ? { ...t, status: "error" as const, errorMsg: msg }
              : t
          )
        );
      }
    }

    setIsBulkProcessing(false);
  }, [tasks, isBulkProcessing]);

  const downloadAllFinished = useCallback(() => {
    const finished = tasks.filter(
      (t) => t.status === "done" && t.restoredPreview
    );
    finished.forEach((task, i) => {
      setTimeout(
        () => downloadImg(task.restoredPreview!, task.file.name),
        i * 300
      );
    });
  }, [tasks]);

  const viewingTask = tasks.find((t) => t.id === viewingTaskId);
  const hasFinishedTasks = tasks.some((t) => t.status === "done");
  const hasPendingTasks = tasks.some((t) => t.status === "pending");
  const doneCount = tasks.filter((t) => t.status === "done").length;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50">
      <Header
        hasStoredKey={customApiKey.trim().length > 0}
        hasFinishedTasks={hasFinishedTasks}
        isBulkProcessing={isBulkProcessing}
        tasksCount={tasks.length}
        doneCount={doneCount}
        hasPendingTasks={hasPendingTasks}
        onOpenSettings={() => setShowSettings(true)}
        onDownloadAll={downloadAllFinished}
        onStartRestore={startBulkRestore}
      />

      <ApiKeyModal
        isOpen={showSettings}
        initialApiKey={customApiKey}
        onClose={() => setShowSettings(false)}
        onSave={handleSaveApiKey}
      />

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        {tasks.length === 0 ? (
          <UploadZone onFilesSelected={handleFiles} />
        ) : (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="lg:col-span-1">
              <TaskQueue
                tasks={tasks}
                viewingTaskId={viewingTaskId}
                isBulkProcessing={isBulkProcessing}
                onSelectTask={setViewingTaskId}
                onRemoveTask={removeTask}
                onRetryTask={retryTask}
                onClearAll={() => {
                  setTasks([]);
                  setViewingTaskId(null);
                }}
                onFilesSelected={handleFiles}
              />
            </div>

            <div className="lg:col-span-2">
              {viewingTask ? (
                <RestorePreview
                  task={viewingTask}
                  onDownload={downloadImg}
                  onRetry={viewingTask.status === "error" ? () => retryTask(viewingTask.id) : undefined}
                />
              ) : (
                <RestorePlaceholder isBulkProcessing={isBulkProcessing} />
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
