import * as React from "react";
import { Bot, User } from "lucide-react";

import { cn } from "@/lib/utils";
import { KaTeXRenderer } from "@/components/ui/katex-renderer";

interface ChatBubbleProps {
  role: "STUDENT" | "TUTOR";
  content: string;
  timestamp?: Date;
}

export function ChatBubble({ role, content, timestamp }: ChatBubbleProps): React.JSX.Element {
  const isTutor = role === "TUTOR";

  return (
    <div className={cn("flex w-full gap-2.5", isTutor ? "justify-start" : "justify-end")}>
      {isTutor ? (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-100 text-primary-700">
          <Bot className="h-4 w-4" aria-hidden="true" />
        </div>
      ) : null}
      <div
        className={cn(
          "max-w-[80%] rounded-2xl px-4 py-2.5 text-sm shadow-sm animate-slide-in-right",
          isTutor ? "rounded-tl-sm bg-muted text-foreground" : "rounded-tr-sm bg-primary text-primary-foreground",
        )}
      >
        <KaTeXRenderer content={content} />
        {timestamp ? (
          <time
            dateTime={timestamp.toISOString()}
            className={cn("mt-1 block text-[11px] opacity-70", isTutor ? "text-muted-foreground" : "text-primary-100")}
          >
            {timestamp.toLocaleTimeString("cs-CZ", { hour: "2-digit", minute: "2-digit" })}
          </time>
        ) : null}
      </div>
      {!isTutor ? (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-foreground">
          <User className="h-4 w-4" aria-hidden="true" />
        </div>
      ) : null}
    </div>
  );
}
