"use client";

import * as React from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Send, Lightbulb } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ChatBubble } from "@/components/ui/chat-bubble";
import { toast } from "@/components/ui/toast";
import type { ChatMessageClient } from "@/types";

interface ChatPanelProps {
  chatSessionId: string;
  initialMessages: ChatMessageClient[];
  onHintUsed?: () => void;
}

async function postChatMessage(payload: { chatSessionId: string; content: string }): Promise<{ reply: string }> {
  const response = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const body = (await response.json().catch(() => ({}))) as { error?: string };
    throw new Error(body.error ?? "Nepodařilo se odeslat zprávu.");
  }
  return (await response.json()) as { reply: string };
}

export function ChatPanel({ chatSessionId, initialMessages, onHintUsed }: ChatPanelProps): React.JSX.Element {
  const [messages, setMessages] = React.useState<ChatMessageClient[]>(initialMessages);
  const [draft, setDraft] = React.useState("");
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  React.useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const mutation = useMutation({
    mutationFn: postChatMessage,
    onMutate: async (payload) => {
      const optimisticStudentMessage: ChatMessageClient = {
        id: `optimistic-${Date.now()}`,
        role: "STUDENT",
        content: payload.content,
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, optimisticStudentMessage]);
      onHintUsed?.();
    },
    onSuccess: (data) => {
      const tutorMessage: ChatMessageClient = {
        id: `tutor-${Date.now()}`,
        role: "TUTOR",
        content: data.reply,
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, tutorMessage]);
    },
    onError: (error: Error) => {
      toast.error(error.message);
      setMessages((prev) => prev.slice(0, -1));
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: ["chat-session", chatSessionId] });
    },
  });

  function handleSubmit(event: React.FormEvent): void {
    event.preventDefault();
    const trimmed = draft.trim();
    if (!trimmed || mutation.isPending) return;
    mutation.mutate({ chatSessionId, content: trimmed });
    setDraft("");
  }

  return (
    <div className="flex h-full flex-col">
      <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto p-4 scrollbar-thin">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-2 text-center text-sm text-muted-foreground">
            <Lightbulb className="h-8 w-8 text-primary-400" aria-hidden="true" />
            <p>Napiš, kde váháš, nebo co jsi zatím zkusil/a — tutor tě navede otázkami.</p>
          </div>
        ) : (
          messages.map((message) => (
            <ChatBubble
              key={message.id}
              role={message.role}
              content={message.content}
              timestamp={new Date(message.createdAt)}
            />
          ))
        )}
        {mutation.isPending ? (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="h-2 w-2 animate-pulse rounded-full bg-primary-400" />
            <span className="h-2 w-2 animate-pulse rounded-full bg-primary-400 [animation-delay:150ms]" />
            <span className="h-2 w-2 animate-pulse rounded-full bg-primary-400 [animation-delay:300ms]" />
            Tutor přemýšlí…
          </div>
        ) : null}
      </div>

      <form onSubmit={handleSubmit} className="flex items-end gap-2 border-t border-border p-3">
        <label htmlFor="chat-input" className="sr-only">
          Napsat zprávu tutorovi
        </label>
        <textarea
          id="chat-input"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              handleSubmit(event);
            }
          }}
          rows={1}
          maxLength={1000}
          placeholder="Napiš zprávu tutorovi…"
          className="max-h-32 flex-1 resize-none rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
        <Button type="submit" size="icon" isLoading={mutation.isPending} aria-label="Odeslat zprávu">
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}
