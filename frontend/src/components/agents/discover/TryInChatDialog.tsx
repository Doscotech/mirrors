"use client";
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

interface TryInChatDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  agentName: string;
  onPreview?: () => void; // Primary action: go to agent preview
  onInstall?: () => void; // Secondary: install directly (optional)
}

export const TryInChatDialog: React.FC<TryInChatDialogProps> = ({ open, onOpenChange, onPreview, onInstall, agentName }) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Try {agentName} in Chat</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          You can preview this agent first to learn what it does and see its requirements.
          {/* TODO(Option B): replace preview-first copy when ephemeral chat is available */}
        </p>
        <DialogFooter className="mt-4">
          <button onClick={() => onOpenChange(false)} className="rounded-lg border px-4 py-2 text-sm">Cancel</button>
          <div className="flex items-center gap-2">
            {onInstall && (
              <button onClick={onInstall} className="rounded-lg border px-4 py-2 text-sm">Install instead</button>
            )}
            <button onClick={onPreview} className="rounded-lg bg-primary px-4 py-2 text-sm text-primary-foreground">Open preview</button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
