"use client";

import { Layers, DownloadCloud, Loader2, Settings, Wand2 } from "lucide-react";

interface HeaderProps {
  hasStoredKey: boolean;
  hasFinishedTasks: boolean;
  isBulkProcessing: boolean;
  tasksCount: number;
  doneCount: number;
  hasPendingTasks: boolean;
  onOpenSettings: () => void;
  onDownloadAll: () => void;
  onStartRestore: () => void;
}

export default function Header({
  hasStoredKey,
  hasFinishedTasks,
  isBulkProcessing,
  tasksCount,
  doneCount,
  hasPendingTasks,
  onOpenSettings,
  onDownloadAll,
  onStartRestore,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 border-b border-white/5 bg-zinc-950/90 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenSettings}
            className="relative cursor-pointer rounded-lg p-2 text-zinc-400 transition-colors hover:bg-white/5 hover:text-white"
            title="API 配置"
            aria-label="API 配置"
          >
            <Settings className="h-5 w-5" />
            {hasStoredKey && (
              <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-zinc-950" />
            )}
          </button>
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sky-500">
            <Layers className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-base font-semibold tracking-tight">
              时光印记 Pro
            </h1>
            <p className="text-[10px] uppercase tracking-widest text-zinc-500">
              AI Bulk Restoration
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {hasFinishedTasks && !isBulkProcessing && (
            <button
              onClick={onDownloadAll}
              className="flex cursor-pointer items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-zinc-200 transition-colors hover:bg-white/10"
            >
              <DownloadCloud className="h-4 w-4 text-sky-400" />
              下载全部 ({doneCount})
            </button>
          )}

          {tasksCount > 0 && (
            <button
              onClick={onStartRestore}
              disabled={isBulkProcessing || !hasPendingTasks}
              className="flex cursor-pointer items-center gap-2 rounded-lg bg-sky-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-sky-400 disabled:cursor-not-allowed disabled:bg-zinc-800 disabled:text-zinc-500"
            >
              {isBulkProcessing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Wand2 className="h-4 w-4" />
              )}
              {isBulkProcessing ? "批量处理中..." : "开始批量修复"}
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
