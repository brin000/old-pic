"use client";

import { useCallback } from "react";
import { Upload } from "lucide-react";

interface UploadZoneProps {
  onFilesSelected: (files: FileList | File[]) => void;
}

export default function UploadZone({ onFilesSelected }: UploadZoneProps) {
  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      if (e.dataTransfer.files) onFilesSelected(e.dataTransfer.files);
    },
    [onFilesSelected]
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) onFilesSelected(e.target.files);
  };

  return (
    <div
      className="mt-16 flex flex-col items-center"
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
    >
      <label className="group relative block w-full max-w-xl cursor-pointer">
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-zinc-700 bg-zinc-900/50 py-16 transition-colors group-hover:border-sky-500/50">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-lg bg-zinc-800 transition-transform duration-200 group-hover:scale-105">
            <Upload className="h-8 w-8 text-sky-400" />
          </div>
          <h3 className="mb-1 text-xl font-semibold">上传老照片实拍图</h3>
          <p className="max-w-sm text-center text-sm text-zinc-500">
            支持多选。AI 会自动识别照片边缘、裁剪背景、并完成修复上色
          </p>
          <input
            type="file"
            multiple
            className="hidden"
            onChange={handleChange}
            accept="image/*"
          />
        </div>
      </label>
    </div>
  );
}
