'use client';

import React, { useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogContent, AlertDialogHeader } from '../ui/alert-dialog';
import { AlertDialogDescription, AlertDialogTitle } from '@radix-ui/react-alert-dialog';

interface TourConfirmationDialogProps {
  open: boolean;
  onAccept: () => void;
  onDecline: () => void;
}

export const TourConfirmationDialog = React.memo(({ open, onAccept, onDecline }: TourConfirmationDialogProps) => {
  const handleOpenChange = useCallback((isOpen: boolean) => {
    if (!isOpen) {
      onDecline();
    }
  }, [onDecline]);

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent className="max-w-md w-[90vw] p-0 overflow-hidden [&>button]:hidden">
        <div className="relative">
          <AlertDialogHeader className="p-6 pb-4">
            {/* Glass header tile replacing old logo */}
            <div className='h-32 w-full rounded-xl border bg-white/60 dark:bg-white/10 backdrop-blur-xl flex items-center justify-center shadow-[0_10px_40px_-10px_rgba(0,0,0,0.25)]'>
              <div className="relative h-14 w-14">
                <div className="absolute -inset-[2px] rounded-2xl opacity-40" style={{ background: 'conic-gradient(from 180deg at 50% 50%, #6366f1 0deg, #22d3ee 120deg, #a855f7 240deg, #6366f1 360deg)' }} />
                <div className="absolute inset-0 rounded-2xl border border-white/60 bg-white/70 dark:border-white/10 dark:bg-white/10" />
                <div className="absolute inset-[2px] rounded-xl bg-gradient-to-b from-white/80 to-white/50 dark:from-zinc-900/50 dark:to-zinc-900/30" />
                <div className="relative z-10 h-full w-full flex items-center justify-center">
                  <span className="text-sm font-semibold tracking-wide text-zinc-800 dark:text-zinc-200">X</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4 mt-4">
              <div>
                <AlertDialogTitle className="text-xl font-semibold">
                  Welcome to Xera
                </AlertDialogTitle>
              </div>
            </div>
            <AlertDialogDescription>
            Would you like a quick guided tour to help you get started? We’ll highlight the essentials so you can make the most of Xera.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex items-center justify-between p-6">
            <Button
              variant="outline"
              onClick={onDecline}
              className="flex-1 mr-3"
            >
              Skip Tour
            </Button>
            <Button
              onClick={onAccept}
              className="flex-1"
            >
              Start Tour
            </Button>
          </div>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
});

TourConfirmationDialog.displayName = 'TourConfirmationDialog'; 