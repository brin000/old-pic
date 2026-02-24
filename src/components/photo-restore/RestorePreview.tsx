"use client";

import { Download, Lightbulb, AlertCircle, RefreshCw, Loader2 } from "lucide-react";
import ImageSlider from "../ImageSlider";
import type { Task } from "./types";

interface RestorePreviewProps {
  task: Task;
  onDownload: (url: string, name: string) => void;
  onRetry?: () => void;
}

export default function RestorePreview({ task, onDownload, onRetry }: RestorePreviewProps) {
  const isError = task.status === "error";
  const isProcessing = task.status === "processing";

  return (
    <div className="animate-fade-in rounded-xl border border-white/5 bg-zinc-900/50 p-6">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">
            {isError ? "修复失败" : isProcessing ? "处理中" : "修复预览"}
          </h3>
          <p className="text-sm text-zinc-500">
            {isError
              ? ""
              : isProcessing
                ? "正在调用 AI 修复，请稍候..."
                : "对比实拍原图与 AI 自动裁剪修复后的结果"}
          </p>
        </div>
        {!isError && !isProcessing && task.restoredPreview && (
          <button
            onClick={() => onDownload(task.restoredPreview!, task.file.name)}
            className="cursor-pointer rounded-lg p-2.5 transition-colors hover:bg-white/10"
            title="下载当前照片"
            aria-label="下载"
          >
            <Download className="h-5 w-5" />
          </button>
        )}
      </div>
      {isError ? (
        <div
          className="flex flex-col items-center justify-center gap-4 rounded-xl border border-red-500/20 bg-red-500/5 p-8"
          role="alert"
          aria-live="assertive"
        >
          <AlertCircle className="h-12 w-12 text-red-400" />
          <div className="text-center">
            <p className="text-sm font-medium text-red-400">处理失败</p>
            <p className="mt-1 max-w-md text-sm text-zinc-400">
              {task.errorMsg ?? "未知错误，请重试"}
            </p>
          </div>
          <img
            src={task.originalPreview}
            alt=""
            className="max-h-48 rounded-lg border border-white/5 object-contain"
          />
          {onRetry && (
            <button
              onClick={onRetry}
              className="flex items-center gap-2 rounded-lg bg-sky-500 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-sky-400 cursor-pointer"
              aria-label="重新处理"
            >
              <RefreshCw className="h-4 w-4" />
              重新处理
            </button>
          )}
        </div>
      ) : isProcessing ? (
        <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-white/5 bg-zinc-800/50 p-12">
          <Loader2 className="h-12 w-12 animate-spin text-sky-400" />
          <p className="text-sm text-zinc-400">正在处理中...</p>
          <img
            src={task.originalPreview}
            alt=""
            className="max-h-48 rounded-lg border border-white/5 object-contain opacity-60"
          />
        </div>
      ) : (
        <ImageSlider
          before={task.originalPreview}
          after={task.restoredPreview!}
        />
      )}
      <div className="mt-5 flex items-start gap-3 rounded-lg border border-sky-500/10 bg-sky-500/5 p-4">
        <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-sky-400" />
        <p className="text-xs leading-relaxed text-zinc-400">
          {isError
            ? "可点击「重新处理」直接重试，或移除后重新上传。"
            : isProcessing
              ? "请勿关闭页面，等待处理完成。"
              : "提示：AI 已自动识别照片主体，剔除了拍摄时的多余背景并进行了透视校正。如果结果不满意，可尝试更垂直的角度重拍并再次处理。"}
        </p>
      </div>
    </div>
  );
}
