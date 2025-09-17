'use client';

import React from 'react';
import { RedirectPage } from './redirect-page';

interface ThreadPageProps {
  params: { threadId: string };
  // searchParams could be present; include for future-proofing
  searchParams?: Record<string, string | string[] | undefined>;
}

export default function ThreadPage(props: ThreadPageProps) {
  const { threadId } = props.params;
  return <RedirectPage threadId={threadId} />;
}