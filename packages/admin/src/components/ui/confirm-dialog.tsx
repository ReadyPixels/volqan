'use client';

/**
 * @file components/ui/confirm-dialog.tsx
 * @description Accessible confirmation dialog for destructive actions.
 * Replaces native confirm() prompts across the admin panel.
 */

import * as React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';

export interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Dialog heading, e.g. "Delete media file" */
  title: string;
  /** Consequence description; include the entity name, e.g. "hero.jpg will be permanently deleted." */
  description: React.ReactNode;
  /** Confirm button label (default "Delete") */
  confirmLabel?: string;
  /** Cancel button label (default "Cancel") */
  cancelLabel?: string;
  /** Visual intent of the confirm button */
  destructive?: boolean;
  /** Shows a spinner and disables buttons while the action runs */
  loading?: boolean;
  onConfirm: () => void | Promise<void>;
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = 'Delete',
  cancelLabel = 'Cancel',
  destructive = true,
  loading = false,
  onConfirm,
}: ConfirmDialogProps) {
  const confirmRef = React.useRef<HTMLButtonElement>(null);

  // Move focus into the dialog when it opens
  React.useEffect(() => {
    if (open) {
      const t = setTimeout(() => confirmRef.current?.focus(), 0);
      return () => clearTimeout(t);
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={(v) => !loading && onOpenChange(v)}>
      <DialogContent size="sm" aria-labelledby="confirm-dialog-title" aria-describedby="confirm-dialog-desc">
        <DialogHeader>
          <div className="flex items-center gap-2">
            {destructive && (
              <AlertTriangle className="w-4 h-4 text-[hsl(var(--destructive))]" aria-hidden="true" />
            )}
            <DialogTitle id="confirm-dialog-title">{title}</DialogTitle>
          </div>
          <DialogDescription id="confirm-dialog-desc">{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button
            ref={confirmRef}
            size="sm"
            variant={destructive ? 'destructive' : 'default'}
            loading={loading}
            onClick={() => void onConfirm()}
          >
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
