"use client";

import { useState, FormEvent } from "react";
import { Lock, Eye, EyeOff, Loader2 } from "lucide-react";

export default function LockPage() {
  const [code, setCode] = useState("");
  const [showCode, setShowCode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!code) return;

    setIsLoading(true);
    setError("");

    try {
      const res = await fetch("/api/unlock", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        // Redirect to home page
        window.location.href = "/";
      } else {
        setError(data.error || "Incorrect access code.");
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen p-4 overflow-hidden bg-gradient-to-b from-zinc-900 to-zinc-950 select-none">
      {/* Background elegant gradient blobs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 pointer-events-none" />

      {/* Main card */}
      <div className="relative w-full max-w-md p-8 md:p-10 border border-zinc-800/80 bg-zinc-900/60 backdrop-blur-xl rounded-2xl shadow-2xl transition-all duration-300">
        
        {/* Lock icon header */}
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center justify-center w-14 h-14 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.1)] mb-4">
            <Lock className="w-6 h-6 animate-pulse" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Private Preview</h1>
          <p className="text-sm text-zinc-400 mt-2 text-center">
            This website is under private staging. Enter the access code below to unlock.
          </p>
        </div>

        {/* Access Code Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="code" className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Access Code
            </label>
            <div className="relative">
              <input
                id="code"
                type={showCode ? "text" : "password"}
                placeholder="••••••••"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                disabled={isLoading}
                className="w-full px-4 py-3 bg-zinc-950/80 border border-zinc-800 text-white rounded-lg focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50 transition-all placeholder:text-zinc-600"
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowCode(!showCode)}
                disabled={isLoading}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-zinc-500 hover:text-zinc-300 transition-colors"
              >
                {showCode ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {error && (
            <div className="p-3 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg text-center font-medium animate-pulse">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading || !code}
            className="w-full flex items-center justify-center px-4 py-3 font-semibold text-white bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg shadow-lg hover:shadow-emerald-500/20 transition-all duration-200"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              "Unlock Access"
            )}
          </button>
        </form>
      </div>

      {/* Footer info */}
      <div className="relative mt-8 text-xs text-zinc-600 text-center">
        &copy; {new Date().getFullYear()} Golan Heights Wiki. All rights reserved.
      </div>
    </div>
  );
}
