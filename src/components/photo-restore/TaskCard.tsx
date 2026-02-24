"use client";

import { X, CheckCircle2, Loader2, AlertCircle, RefreshCw } from "lucide-react";
import type { Task } from "./types";

interface TaskCardProps {
  task: Task;
  isSelected: boolean;
  isBulkProcessing: boolean;
  onSelect: () => void;
  onRemove: () => void;
  onRetry?: () => void;
}

export default function TaskCard({
  task,
  isSelected,
  isBulkProcessing,
  onSelect,
  onRemove,
  onRetry,
}: TaskCardProps) {
  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onRemove();
  };
  const handleRetry = (e: React.MouseEvent) => {
    e.stopPropagation();
    onRetry?.();
  };

  const isSelectable =
    task.status === "done" ||
    task.status === "error" ||
    task.status === "processing";

  return (
    <div
      onClick={isSelectable ? onSelect : undefined}
      className={`group relative flex items-center gap-4 rounded-xl border p-3 transition-colors ${
        isSelectable ? "cursor-pointer" : ""
      } ${isSelected
        ? "border-sky-500/50 bg-sky-500/10"
        : "border-white/5 bg-zinc-900/50 hover:border-white/10"
      }`}
    >
      <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-zinc-800">
        <img
          src={task.originalPreview}
          className="h-full w-full object-cover"
          alt=""
        />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{task.file.name}</p>
        <div className="flex items-center gap-1">
          {task.status === "pending" && (
            <span className="rounded-full bg-zinc-800 px-2 py-0.5 text-[10px] text-zinc-400">
              等待中
            </span>
          )}
          {task.status === "processing" && (
            <span className="flex items-center gap-1 rounded-full bg-sky-500/20 px-2 py-0.5 text-[10px] text-sky-400">
              <Loader2 className="h-2.5 w-2.5 animate-spin" />
              处理中
            </span>
          )}
          {task.status === "done" && (
            <span className="flex items-center gap-1 rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] text-emerald-400">
              <CheckCircle2 className="h-2.5 w-2.5" /> 已修复
            </span>
          )}
          {task.status === "error" && (
            <span
              className="flex items-center gap-1 rounded-full bg-red-500/20 px-2 py-0.5 text-[10px] text-red-400"
              role="alert"
              title={task.errorMsg ?? undefined}
            >
              <AlertCircle className="h-2.5 w-2.5 shrink-0" />
              {task.errorMsg ? (
                <span className="truncate max-w-[120px]">{task.errorMsg}</span>
              ) : (
                "错误"
              )}
            </span>
          )}
        </div>
      </div>
      {!isBulkProcessing && (
        <div className="flex items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
          {task.status === "error" && onRetry && (
            <button
              onClick={handleRetry}
              className="rounded p-1.5 text-zinc-500 transition-colors hover:bg-sky-500/20 hover:text-sky-400 cursor-pointer"
              aria-label="重新处理"
              title="重新处理"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          )}
          <button
            onClick={handleRemove}
            className="rounded p-1.5 text-zinc-500 transition-colors hover:bg-red-500/20 hover:text-red-400 cursor-pointer"
            aria-label="移除"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
