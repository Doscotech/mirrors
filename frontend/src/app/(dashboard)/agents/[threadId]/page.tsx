'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { RedirectPage } from './redirect-page';

export default function ThreadPage() {
  // Using useParams inside a client component avoids PageProps generic inference issues
  const params = useParams<{ threadId: string }>();
  const threadId = params.threadId;
  return <RedirectPage threadId={threadId} />;
}