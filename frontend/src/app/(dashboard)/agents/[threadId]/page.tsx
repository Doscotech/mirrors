'use client';

import React from 'react';
import { RedirectPage } from './redirect-page';

// Accept params directly (Next.js supplies plain object) to avoid experimental React.use promise unwrap
export default function ThreadPage({ params }: { params: { threadId: string } }) {
  const { threadId } = params;
  return <RedirectPage threadId={threadId} />;
}