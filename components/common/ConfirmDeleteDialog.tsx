"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

interface ConfirmDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  itemName?: string;
  onConfirm: () => void;
  isPending?: boolean;
}

export function ConfirmDeleteDialog({
  open,
  onOpenChange,
  title = "Are you absolutely sure?",
  description,
  itemName,
  onConfirm,
  isPending = false,
}: ConfirmDeleteDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="space-y-3">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <DialogTitle className="text-center font-display text-2xl">{title}</DialogTitle>
          <DialogDescription className="text-center text-sm leading-relaxed">
            {description || (
              <>
                This action cannot be undone. This will permanently delete{" "}
                <span className="font-semibold text-foreground">{itemName || "this item"}</span>.
              </>
            )}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variant="outline" className="rounded-xl" onClick={() => onOpenChange(false)} disabled={isPending}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            className="rounded-xl"
            disabled={isPending}
            onClick={() => {
              onConfirm();
              onOpenChange(false);
            }}
          >
            {isPending ? "Deleting..." : "Delete permanently"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
