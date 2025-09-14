'use client';

import React from 'react';
import { ThreadComponent } from '@/components/thread/ThreadComponent';

export default function ThreadPage({ params }: { params: { projectId: string; threadId: string } }) {
  const { projectId, threadId } = params;

  return <ThreadComponent projectId={projectId} threadId={threadId} />;
}
