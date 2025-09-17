"use client";
import React, { useState } from 'react';

export interface FavoriteToggleProps {
  defaultValue?: boolean;
  onChange?: (val: boolean) => void;
}

export function FavoriteToggle({ defaultValue = false, onChange }: FavoriteToggleProps) {
  const [fav, setFav] = useState(defaultValue);
  return (
    <button
      type="button"
      onClick={() => { const next = !fav; setFav(next); onChange?.(next); }}
      aria-pressed={fav}
      aria-label={fav ? 'Unfavorite' : 'Favorite'}
      className={[
        'h-8 w-8 rounded-full flex items-center justify-center transition-colors border',
        fav ? 'bg-rose-500 text-white border-rose-500' : 'bg-muted/30 border-muted/50 hover:bg-muted/50'
      ].join(' ')}
    >
      {fav ? '★' : '☆'}
    </button>
  );
}

export default FavoriteToggle;
