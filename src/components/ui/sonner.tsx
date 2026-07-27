"use client";

import { Toaster as Sonner } from "sonner";
import { CheckCircle2, Info, Loader2, TriangleAlert, XCircle } from "lucide-react";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ className, icons, toastOptions, ...props }: ToasterProps) => {
  return (
    <Sonner
      {...props}
      richColors={false}
      className={["toaster group", className].filter(Boolean).join(" ")}
      icons={{
        success: <CheckCircle2 className="h-4 w-4 text-primary" />,
        info: <Info className="h-4 w-4 text-primary" />,
        warning: <TriangleAlert className="h-4 w-4 text-accent" />,
        error: <XCircle className="h-4 w-4 text-destructive" />,
        loading: <Loader2 className="h-4 w-4 animate-spin text-primary" />,
        ...(icons ?? {}),
      }}
      toastOptions={{
        ...toastOptions,
        classNames: {
          toast:
            "group toast group-[.toaster]:rounded-2xl group-[.toaster]:border-border group-[.toaster]:bg-card group-[.toaster]:text-card-foreground group-[.toaster]:shadow-card",
          success: "group-[.toaster]:border-primary/40",
          info: "group-[.toaster]:border-primary/40",
          warning: "group-[.toaster]:border-accent/50",
          error: "group-[.toaster]:border-destructive/50",
          description: "group-[.toast]:text-muted-foreground",
          actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
          closeButton: "group-[.toast]:border-border group-[.toast]:bg-card group-[.toast]:text-card-foreground",
          ...(toastOptions?.classNames ?? {}),
        },
      }}
    />
  );
};

export { Toaster };
