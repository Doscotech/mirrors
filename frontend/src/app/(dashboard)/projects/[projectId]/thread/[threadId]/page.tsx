'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { ThreadComponent } from '@/components/thread/ThreadComponent';

export default function ThreadPage() {
  const params = useParams<{ projectId: string; threadId: string }>();
  return <ThreadComponent projectId={params.projectId} threadId={params.threadId} />;
}
