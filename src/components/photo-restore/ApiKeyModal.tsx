"use client";

import { useState, useEffect } from "react";
import {
  X,
  Key,
  ExternalLink,
  Eye,
  EyeOff,
  Trash2,
  CheckCircle2,
} from "lucide-react";

interface ApiKeyModalProps {
  isOpen: boolean;
  initialApiKey: string;
  onClose: () => void;
  onSave: (key: string) => void;
}

export default function ApiKeyModal({
  isOpen,
  initialApiKey,
  onClose,
  onSave,
}: ApiKeyModalProps) {
  const [customApiKey, setCustomApiKey] = useState(initialApiKey);
  const [showKey, setShowKey] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) setCustomApiKey(initialApiKey);
  }, [isOpen, initialApiKey]);

  if (!isOpen) return null;

  const handleSave = () => {
    const val = customApiKey.trim();
    onSave(val);
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      onClose();
    }, 800);
  };

  const handleClear = () => {
    setCustomApiKey("");
    onSave("");
  };

  return (
    <div
      className="fixed inset-0 z-100 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md overflow-hidden rounded-xl border border-white/10 bg-zinc-900"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-base font-semibold">
              <Key className="h-4 w-4 text-sky-400" />
              API Key 配置
            </h3>
            <button
              onClick={onClose}
              className="cursor-pointer rounded-lg p-2 text-zinc-400 transition-colors hover:bg-white/5 hover:text-white"
              aria-label="关闭"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <p className="mb-4 text-sm leading-relaxed text-zinc-400">
            填写您的 Gemini API Key，将优先于服务端配置使用。保存后会在本设备上持久化（localStorage），下次无需重填。
          </p>

          <a
            href="https://aistudio.google.com/apikey"
            target="_blank"
            rel="noopener noreferrer"
            className="mb-4 inline-flex cursor-pointer items-center gap-1.5 text-sm text-sky-400 transition-colors hover:text-sky-300"
          >
            <ExternalLink className="h-4 w-4" />
            前往 Google AI Studio 获取 Key
          </a>

          <div className="relative mb-2">
            <input
              type={showKey ? "text" : "password"}
              value={customApiKey}
              onChange={(e) => setCustomApiKey(e.target.value)}
              placeholder="AIza..."
              className="w-full rounded-lg border border-white/10 bg-zinc-950 px-4 py-3 pr-11 text-zinc-100 outline-none transition-colors placeholder:text-zinc-500 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
            />
            <button
              type="button"
              onClick={() => setShowKey(!showKey)}
              className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer rounded p-1.5 text-zinc-400 transition-colors hover:bg-white/5 hover:text-white"
              aria-label={showKey ? "隐藏" : "显示"}
            >
              {showKey ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>

          {customApiKey.trim() && (
            <p className="mb-4 text-xs text-zinc-500">
              ✓ 已配置 · 仅保存在本机 localStorage，不会上传
            </p>
          )}

          <div className="flex gap-2">
            <button
              onClick={handleSave}
              className={`flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg py-2.5 font-medium transition-colors ${
                saveSuccess
                  ? "bg-emerald-600 text-white"
                  : "bg-sky-500 text-white hover:bg-sky-400"
              }`}
            >
              {saveSuccess ? (
                <>
                  <CheckCircle2 className="h-5 w-5" />
                  已保存
                </>
              ) : (
                "保存"
              )}
            </button>
            <button
              onClick={handleClear}
              className="flex cursor-pointer items-center gap-2 rounded-lg bg-white/5 px-4 py-2.5 font-medium text-zinc-400 transition-colors hover:bg-red-500/20 hover:text-red-400"
              title="清除已保存的 Key"
            >
              <Trash2 className="h-4 w-4" />
              清除
            </button>
            <button
              onClick={onClose}
              className="cursor-pointer rounded-lg bg-white/5 px-4 py-2.5 font-medium text-zinc-300 transition-colors hover:bg-white/10"
            >
              关闭
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
