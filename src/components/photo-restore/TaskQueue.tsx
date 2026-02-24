"use client";

import type { Task } from "./types";
import TaskCard from "./TaskCard";

interface TaskQueueProps {
  tasks: Task[];
  viewingTaskId: string | null;
  isBulkProcessing: boolean;
  onSelectTask: (id: string) => void;
  onRemoveTask: (id: string) => void;
  onRetryTask?: (id: string) => void;
  onClearAll: () => void;
  onFilesSelected: (files: FileList | File[]) => void;
}

export default function TaskQueue({
  tasks,
  viewingTaskId,
  isBulkProcessing,
  onSelectTask,
  onRemoveTask,
  onRetryTask,
  onClearAll,
  onFilesSelected,
}: TaskQueueProps) {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) onFilesSelected(e.target.files);
  };

  return (
    <div className="max-h-[calc(100vh-140px)] space-y-3 overflow-y-auto pr-1 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-zinc-700">
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-xs font-medium uppercase tracking-wider text-zinc-500">
          待处理队列 ({tasks.length})
        </h2>
        <button
          onClick={onClearAll}
          className="cursor-pointer text-xs text-zinc-500 transition-colors hover:text-red-400"
        >
          清空全部
        </button>
      </div>

      {tasks.map((task) => (
        <TaskCard
          key={task.id}
          task={task}
          isSelected={viewingTaskId === task.id}
          isBulkProcessing={isBulkProcessing}
          onSelect={() => onSelectTask(task.id)}
          onRemove={() => onRemoveTask(task.id)}
          onRetry={task.status === "error" && onRetryTask ? () => onRetryTask(task.id) : undefined}
        />
      ))}

      <label className="block cursor-pointer rounded-xl border-2 border-dashed border-zinc-700 p-4 text-center text-sm text-zinc-500 transition-colors hover:border-sky-500/50">
        <input
          type="file"
          multiple
          className="hidden"
          onChange={handleFileChange}
        />
        + 添加更多照片
      </label>
    </div>
  );
}
