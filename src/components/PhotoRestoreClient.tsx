"use client";

import { useState, useRef, useCallback } from "react";
import {
  Upload,
  Download,
  Wand2,
  Image as ImageIcon,
  X,
  CheckCircle2,
  Loader2,
  Layers,
  DownloadCloud,
} from "lucide-react";
import ImageSlider from "./ImageSlider";

interface Task {
  id: string;
  file: File;
  originalPreview: string;
  restoredPreview: string | null;
  status: "pending" | "processing" | "done" | "error";
  errorMsg: string | null;
  mimeType: string;
}

const fetchWithRetry = async (
  url: string,
  options: RequestInit,
  maxRetries = 5
) => {
  const delays = [1000, 2000, 4000, 8000, 16000];
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(url, options);
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(
          (data as { error?: string }).error ||
            `HTTP error! status: ${response.status}`
        );
      }
      return await response.json();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise((res) => setTimeout(res, delays[i]));
    }
  }
  throw new Error("Max retries exceeded");
};

export default function PhotoRestoreClient() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [currentTaskId, setCurrentTaskId] = useState<string | null>(null);
  const [isBulkProcessing, setIsBulkProcessing] = useState(false);
  const [viewingTaskId, setViewingTaskId] = useState<string | null>(null);

  const handleFiles = (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    const newTasks: Task[] = fileArray.map((file) => ({
      id: crypto.randomUUID(),
      file,
      originalPreview: URL.createObjectURL(file),
      restoredPreview: null,
      status: "pending",
      errorMsg: null,
      mimeType: file.type,
    }));
    setTasks((prev) => [...prev, ...newTasks]);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) handleFiles(e.target.files);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files) handleFiles(e.dataTransfer.files);
  }, []);

  const removeTask = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    if (viewingTaskId === id) setViewingTaskId(null);
  };

  const restoreSinglePhoto = async (task: Task): Promise<string> => {
    const reader = new FileReader();
    const base64Promise = new Promise<string>((resolve) => {
      reader.onload = (e) => {
        const result = e.target?.result as string;
        resolve(result.split(",")[1] || "");
      };
      reader.readAsDataURL(task.file);
    });

    const base64Data = await base64Promise;

    const result = (await fetchWithRetry("/api/restore", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        data: base64Data,
        mimeType: task.mimeType || "image/jpeg",
      }),
    })) as { image?: string; error?: string };

    if (result.error) throw new Error(result.error);
    if (!result.image) throw new Error("AI 未能成功生成图像");

    return result.image;
  };

  const startBulkRestore = async () => {
    if (isBulkProcessing) return;
    setIsBulkProcessing(true);

    for (const task of tasks) {
      if (task.status === "done" || task.status === "processing") continue;

      setCurrentTaskId(task.id);
      setTasks((prev) =>
        prev.map((t) =>
          t.id === task.id ? { ...t, status: "processing" as const } : t
        )
      );

      try {
        const restoredUrl = await restoreSinglePhoto(task);
        setTasks((prev) =>
          prev.map((t) =>
            t.id === task.id
              ? { ...t, status: "done" as const, restoredPreview: restoredUrl }
              : t
          )
        );
      } catch {
        setTasks((prev) =>
          prev.map((t) =>
            t.id === task.id
              ? {
                  ...t,
                  status: "error" as const,
                  errorMsg: "修复失败",
                }
              : t
          )
        );
      }
    }

    setIsBulkProcessing(false);
    setCurrentTaskId(null);
  };

  const downloadImg = (url: string, name: string) => {
    if (!url) return;
    const a = document.createElement("a");
    a.href = url;
    a.download = `Restored_${name}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const downloadAllFinished = () => {
    const finishedTasks = tasks.filter(
      (t) => t.status === "done" && t.restoredPreview
    );
    finishedTasks.forEach((task, index) => {
      setTimeout(() => {
        downloadImg(task.restoredPreview!, task.file.name);
      }, index * 300);
    });
  };

  const viewingTask = tasks.find((t) => t.id === viewingTaskId);
  const hasFinishedTasks = tasks.some((t) => t.status === "done");

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-gray-100 font-sans">
      <header className="border-b border-white/5 bg-black/40 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Layers className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight">
                时光印记 Pro
              </h1>
              <p className="text-[10px] text-indigo-400 uppercase tracking-widest font-bold">
                AI Bulk Restoration
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {hasFinishedTasks && !isBulkProcessing && (
              <button
                onClick={downloadAllFinished}
                className="flex items-center px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 transition-all font-medium text-sm text-gray-200"
              >
                <DownloadCloud className="w-4 h-4 mr-2 text-indigo-400" />
                下载全部 ({tasks.filter((t) => t.status === "done").length})
              </button>
            )}

            {tasks.length > 0 && (
              <button
                onClick={startBulkRestore}
                disabled={
                  isBulkProcessing ||
                  !tasks.some((t) => t.status === "pending")
                }
                className="flex items-center px-5 py-2 rounded-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-gray-800 disabled:text-gray-500 transition-all font-medium text-sm shadow-lg shadow-indigo-500/20"
              >
                {isBulkProcessing ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Wand2 className="w-4 h-4 mr-2" />
                )}
                {isBulkProcessing ? "批量处理中..." : "开始批量修复"}
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {tasks.length === 0 ? (
          <div
            className="mt-20 flex flex-col items-center"
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
          >
            <label className="w-full max-w-2xl group relative cursor-pointer">
              <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-3xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
              <div className="relative flex flex-col items-center justify-center py-20 bg-gray-900 border-2 border-dashed border-gray-800 group-hover:border-indigo-500/50 rounded-3xl transition-all">
                <div className="w-20 h-20 mb-6 bg-gray-800 rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500">
                  <Upload className="w-10 h-10 text-indigo-400" />
                </div>
                <h3 className="text-2xl font-bold mb-2">上传老照片实拍图</h3>
                <p className="text-gray-500 text-center max-w-sm">
                  支持多选。AI 会自动识别照片边缘、裁剪背景、并完成修复上色
                </p>
                <input
                  type="file"
                  multiple
                  className="hidden"
                  onChange={handleFileChange}
                  accept="image/*"
                />
              </div>
            </label>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 space-y-4 max-h-[calc(100vh-160px)] overflow-y-auto pr-2 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-gray-900/50 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-gray-700">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
                  待处理队列 ({tasks.length})
                </h2>
                <button
                  onClick={() => setTasks([])}
                  className="text-xs text-gray-500 hover:text-red-400"
                >
                  清空全部
                </button>
              </div>

              {tasks.map((task) => (
                <div
                  key={task.id}
                  onClick={() =>
                    task.status === "done" && setViewingTaskId(task.id)
                  }
                  className={`p-3 rounded-2xl border transition-all cursor-pointer relative group ${
                    viewingTaskId === task.id
                      ? "bg-indigo-600/10 border-indigo-500/50"
                      : "bg-gray-900/50 border-white/5 hover:border-white/10"
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-black flex-shrink-0">
                      <img
                        src={task.originalPreview}
                        className="w-full h-full object-cover"
                        alt="Thumb"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate mb-1">
                        {task.file.name}
                      </p>
                      <div className="flex items-center">
                        {task.status === "pending" && (
                          <span className="text-[10px] bg-gray-800 text-gray-400 px-2 py-0.5 rounded-full">
                            等待中
                          </span>
                        )}
                        {task.status === "processing" && (
                          <span className="text-[10px] bg-indigo-500/20 text-indigo-400 px-2 py-0.5 rounded-full flex items-center">
                            <Loader2 className="w-2.5 h-2.5 mr-1 animate-spin" />{" "}
                            处理中
                          </span>
                        )}
                        {task.status === "done" && (
                          <span className="text-[10px] bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full flex items-center">
                            <CheckCircle2 className="w-2.5 h-2.5 mr-1" /> 已修复
                          </span>
                        )}
                        {task.status === "error" && (
                          <span className="text-[10px] bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full">
                            错误
                          </span>
                        )}
                      </div>
                    </div>
                    {!isBulkProcessing && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeTask(task.id);
                        }}
                        className="p-1.5 hover:bg-red-500/20 rounded-lg text-gray-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}

              <label className="block w-full p-4 border-2 border-dashed border-gray-800 hover:border-indigo-500/50 rounded-2xl text-center text-sm text-gray-500 cursor-pointer transition-colors">
                <input
                  type="file"
                  multiple
                  className="hidden"
                  onChange={handleFileChange}
                />
                + 添加更多照片
              </label>
            </div>

            <div className="lg:col-span-2">
              {viewingTask ? (
                <div className="bg-gray-900/40 rounded-3xl p-6 border border-white/5 animate-fade-in">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-xl font-bold">修复预览</h3>
                      <p className="text-sm text-gray-500">
                        对比实拍原图与 AI 自动裁剪修复后的结果
                      </p>
                    </div>
                    <button
                      onClick={() =>
                        downloadImg(
                          viewingTask.restoredPreview!,
                          viewingTask.file.name
                        )
                      }
                      className="p-3 bg-white/10 hover:bg-white/20 rounded-2xl transition-colors"
                      title="下载当前照片"
                    >
                      <Download className="w-5 h-5" />
                    </button>
                  </div>
                  <ImageSlider
                    before={viewingTask.originalPreview}
                    after={viewingTask.restoredPreview!}
                  />
                  <div className="mt-6 p-4 bg-indigo-500/5 rounded-2xl border border-indigo-500/10">
                    <p className="text-xs text-indigo-300 leading-relaxed italic">
                      💡 提示：AI 已自动识别照片主体，剔除了拍摄时的多余背景并进行了透视校正。如果结果不满意，可尝试更垂直的角度重拍并再次处理。
                    </p>
                  </div>
                </div>
              ) : (
                <div className="h-full min-h-[400px] flex flex-col items-center justify-center bg-gray-900/20 border border-dashed border-gray-800 rounded-3xl">
                  {isBulkProcessing ? (
                    <div className="text-center">
                      <div className="w-20 h-20 bg-indigo-600/20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
                      </div>
                      <h3 className="text-xl font-medium">正在批量修复中...</h3>
                      <p className="text-gray-500 mt-2">
                        请勿关闭页面，AI 正在逐一处理队列
                      </p>
                    </div>
                  ) : (
                    <div className="text-center text-gray-600">
                      <ImageIcon className="w-12 h-12 mx-auto mb-4 opacity-20" />
                      <p>从左侧列表中选择已完成的任务以查看对比</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
