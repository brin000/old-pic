import { Key } from "lucide-react";
import { verifyAccessKey } from "./actions";

const ERROR_MESSAGES: Record<string, string> = {
  empty: "请输入访问密钥",
  invalid: "密钥错误",
};

export default async function AuthPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  const error = params.error ? ERROR_MESSAGES[params.error] ?? "验证失败" : null;

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 p-4">
      <div className="w-full max-w-md overflow-hidden rounded-xl border border-white/10 bg-zinc-900 p-6">
        <div className="mb-6 flex items-center gap-2">
          <Key className="h-5 w-5 text-sky-400" />
          <h1 className="text-lg font-semibold">访问验证</h1>
        </div>
        <p className="mb-4 text-sm text-zinc-400">
          请输入访问密钥以继续使用时光印记 Pro
        </p>
        <form action={verifyAccessKey} className="space-y-4">
          <div>
            <input
              type="password"
              name="key"
              placeholder="输入密钥"
              autoComplete="current-password"
              className="w-full rounded-lg border border-white/10 bg-zinc-950 px-4 py-3 text-zinc-100 outline-none transition-colors placeholder:text-zinc-500 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
            />
          </div>
          {error && (
            <p className="text-sm text-red-400">{error}</p>
          )}
          <button
            type="submit"
            className="w-full cursor-pointer rounded-lg bg-sky-500 py-2.5 font-medium text-white transition-colors hover:bg-sky-400"
          >
            进入
          </button>
        </form>
      </div>
    </div>
  );
}
