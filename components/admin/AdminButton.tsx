'use client';

import { useTransition } from "react";

// 1. THIS INTERFACE IS WHAT PREVENTS YOUR ERROR
interface AdminButtonProps {
  action: () => Promise<any>; // Accepts the server action
  label: string;
  loadingLabel?: string;
  confirmMessage?: string;
  className?: string;
}

export default function AdminButton({
  action,
  label,
  loadingLabel = "Loading...",
  confirmMessage,
  className = ""
}: AdminButtonProps) {
  const [isPending, startTransition] = useTransition();

  const handlePress = async () => {
    if (confirmMessage && !confirm(confirmMessage)) return;

    startTransition(async () => {
      await action();
    });
  };

  return (
    <button onClick={handlePress} disabled={isPending} className={className}>
      {isPending ? loadingLabel : label}
    </button>
  );
}