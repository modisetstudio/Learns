"use client";

import { Toaster as SonnerToaster, toast } from "sonner";
import { useTheme } from "next-themes";
import type { ComponentProps } from "react";

type ToasterProps = ComponentProps<typeof SonnerToaster>;

function Toaster(props: ToasterProps): React.JSX.Element {
  const { resolvedTheme } = useTheme();

  return (
    <SonnerToaster
      theme={resolvedTheme === "dark" ? "dark" : "light"}
      className="toaster group"
      position="top-right"
      richColors
      closeButton
      toastOptions={{
        classNames: {
          toast: "group toast rounded-lg border border-border bg-card text-card-foreground shadow-lg",
          description: "text-muted-foreground",
          actionButton: "bg-primary text-primary-foreground",
          cancelButton: "bg-muted text-muted-foreground",
        },
      }}
      {...props}
    />
  );
}

export { Toaster, toast };
