"use client";

import { Image as ImageIcon, Loader2 } from "lucide-react";

interface RestorePlaceholderProps {
  isBulkProcessing: boolean;
}

export default function RestorePlaceholder({
  isBulkProcessing,
}: RestorePlaceholderProps) {
  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center rounded-xl border border-dashed border-zinc-700 bg-zinc-900/30">
      {isBulkProcessing ? (
        <div className="text-center">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-sky-500/20">
            <Loader2 className="h-8 w-8 animate-spin text-sky-400" />
          </div>
          <h3 className="text-lg font-medium">正在批量修复中...</h3>
          <p className="mt-2 text-sm text-zinc-500">
            请勿关闭页面，AI 正在逐一处理队列
          </p>
        </div>
      ) : (
        <div className="text-center text-zinc-500">
          <ImageIcon className="mx-auto mb-4 h-12 w-12 opacity-20" />
          <p className="text-sm">
            从左侧列表中选择已完成的任务以查看对比
          </p>
        </div>
      )}
    </div>
  );
}
