"use client";

import * as React from "react";
import katex from "katex";
import "katex/dist/katex.min.css";

import { cn } from "@/lib/utils";

interface KaTeXRendererProps {
  /**
   * Text that may mix plain Czech text with inline math delimited by $...$
   * and display math delimited by $$...$$. This mirrors how CERMAT task
   * statements are authored in the admin panel.
   */
  content: string;
  className?: string;
}

interface Segment {
  type: "text" | "inline" | "block";
  value: string;
}

function parseSegments(content: string): Segment[] {
  const segments: Segment[] = [];
  const pattern = /\$\$([^$]+)\$\$|\$([^$]+)\$/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(content)) !== null) {
    if (match.index > lastIndex) {
      segments.push({ type: "text", value: content.slice(lastIndex, match.index) });
    }
    if (match[1] !== undefined) {
      segments.push({ type: "block", value: match[1] });
    } else if (match[2] !== undefined) {
      segments.push({ type: "inline", value: match[2] });
    }
    lastIndex = pattern.lastIndex;
  }
  if (lastIndex < content.length) {
    segments.push({ type: "text", value: content.slice(lastIndex) });
  }
  return segments;
}

function renderMathHtml(value: string, displayMode: boolean): string {
  try {
    return katex.renderToString(value, {
      throwOnError: false,
      displayMode,
      strict: "ignore",
    });
  } catch {
    return "";
  }
}

function SafeMath({ value, display }: { value: string; display: boolean }): React.JSX.Element {
  const html = React.useMemo(() => renderMathHtml(value, display), [value, display]);

  if (!html) {
    return (
      <code className="rounded bg-danger-50 px-1 py-0.5 text-danger-600" aria-label="Chyba ve vzorci">
        {value}
      </code>
    );
  }

  return display ? (
    // eslint-disable-next-line react/no-danger
    <div dangerouslySetInnerHTML={{ __html: html }} />
  ) : (
    // eslint-disable-next-line react/no-danger
    <span dangerouslySetInnerHTML={{ __html: html }} />
  );
}

export function KaTeXRenderer({ content, className }: KaTeXRendererProps): React.JSX.Element {
  const segments = React.useMemo(() => parseSegments(content), [content]);

  return (
    <div className={cn("leading-relaxed text-foreground", className)}>
      {segments.map((segment, index) => {
        const key = `${segment.type}-${index}`;
        if (segment.type === "text") {
          return (
            <span key={key} className="whitespace-pre-wrap">
              {segment.value}
            </span>
          );
        }
        return <SafeMath key={key} value={segment.value} display={segment.type === "block"} />;
      })}
    </div>
  );
}
