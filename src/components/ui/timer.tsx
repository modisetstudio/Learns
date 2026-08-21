"use client";

import * as React from "react";
import { Clock, AlertTriangle } from "lucide-react";

import { cn, formatDuration } from "@/lib/utils";

interface TimerProps {
  totalSeconds: number;
  remainingSeconds: number;
  onExpire?: () => void;
  className?: string;
}

const WARNING_THRESHOLD_RATIO = 0.2; // posledních 20 % času -> amber
const DANGER_THRESHOLD_SECONDS = 60; // poslední minuta -> červená

export function Timer({ totalSeconds, remainingSeconds, onExpire, className }: TimerProps): React.JSX.Element {
  const hasExpiredRef = React.useRef(false);

  React.useEffect(() => {
    if (remainingSeconds <= 0 && !hasExpiredRef.current) {
      hasExpiredRef.current = true;
      onExpire?.();
    }
  }, [remainingSeconds, onExpire]);

  const isDanger = remainingSeconds <= DANGER_THRESHOLD_SECONDS;
  const isWarning = !isDanger && remainingSeconds <= totalSeconds * WARNING_THRESHOLD_RATIO;

  return (
    <div
      role="timer"
      aria-live={isDanger ? "assertive" : "polite"}
      aria-label={`Zbývající čas: ${formatDuration(Math.max(remainingSeconds, 0))}`}
      className={cn(
        "inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 font-mono text-sm font-semibold tabular-nums transition-colors",
        isDanger && "animate-pulse-ring border-danger-500 bg-danger-50 text-danger-600",
        isWarning && "border-warning-500 bg-warning-50 text-warning-600",
        !isDanger && !isWarning && "border-border bg-muted text-foreground",
        className,
      )}
    >
      {isDanger ? <AlertTriangle className="h-4 w-4" aria-hidden="true" /> : <Clock className="h-4 w-4" aria-hidden="true" />}
      {formatDuration(Math.max(remainingSeconds, 0))}
    </div>
  );
}
