"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ConnectionForm, type ConnectionFormValues } from "@/components/connections/ConnectionForm";

export type ConnectionDialogMode = "create" | "edit";

type ConnectionDialogProps = {
  open: boolean;
  mode: ConnectionDialogMode;
  initialValues?: Partial<ConnectionFormValues>;
  onClose: () => void;
  onSave: (values: ConnectionFormValues) => void;
};

export function ConnectionDialog({
  open,
  mode,
  initialValues,
  onClose,
  onSave,
}: ConnectionDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(nextOpen) => (!nextOpen ? onClose() : null)}>
      <DialogContent className="max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Add connection" : "Edit connection"}
          </DialogTitle>
        </DialogHeader>
        <ConnectionForm initialValues={initialValues} onSave={onSave} />
      </DialogContent>
    </Dialog>
  );
}
