"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";

export type ConfirmationDialogProps = {
  triggerLabel: string;
  title: string;
  description?: string;
  confirmLabel?: string;
  onConfirm: () => void;
  isDestructive?: boolean;
  triggerClassName?: string;
  disabled?: boolean;
};

export function ConfirmationDialog({
  triggerLabel,
  title,
  description,
  confirmLabel,
  onConfirm,
  isDestructive = true,
  triggerClassName,
  disabled = false,
}: ConfirmationDialogProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        variant="outline"
        className={triggerClassName}
        onClick={() => setOpen(true)}
        disabled={disabled}
      >
        {triggerLabel}
      </Button>
      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title={title}
        description={description}
        confirmLabel={confirmLabel}
        isDestructive={isDestructive}
        onConfirm={() => {
          onConfirm();
          setOpen(false);
        }}
      />
    </>
  );
}
