'use client';

import * as React from 'react';
import { DocsHeader, DocsBody } from '@/components/ui/docs-index';
import { Separator } from '@/components/ui/separator';

const breadcrumbs = [
  { title: 'Documentation', onClick: () => (window.location.href = '/docs') },
  { title: 'Knowledge Base' }
];

export default function KnowledgeBaseDocsPage() {
  return (
    <>
      <DocsHeader
        title="Knowledge Base"
        subtitle="Connect documents and data so agents can search, cite, and reason with your content."
        breadcrumbs={breadcrumbs}
        lastUpdated="September 2025"
        showSeparator
        size="lg"
        className="mb-8 sm:mb-12"
      />

      <DocsBody>
        <h2 id="overview">Overview</h2>
        <p className="mb-6">
          The knowledge base indexes your files and data sources for retrieval‑augmented generation. Agents fetch relevant chunks, ground their answers, and include citations.
        </p>

        <h3 id="sources" className="mt-8 mb-2">Sources</h3>
        <ul className="list-disc pl-6 space-y-2 mb-6">
          <li>Upload files (PDF, DOCX, TXT, CSV, PPTX, MD).</li>
          <li>Connect cloud drives (Google Drive) and select folders.</li>
          <li>Sync from URLs or sitemaps with the web crawler.</li>
        </ul>

        <h3 id="syncing" className="mt-8 mb-2">Syncing and versioning</h3>
        <ul className="list-disc pl-6 space-y-2 mb-6">
          <li>Automatic background sync keeps indexes fresh.</li>
          <li>Delta updates minimize re‑processing large sources.</li>
          <li>Manual reindex available per source and per file.</li>
        </ul>

        <h3 id="chunking" className="mt-8 mb-2">Chunking and embeddings</h3>
        <ul className="list-disc pl-6 space-y-2 mb-6">
          <li>Adaptive chunking based on structure (headings, lists, tables).</li>
          <li>Embeddings stored with metadata: file, page, section, tags.</li>
          <li>Configurable max tokens and overlap for your domain.</li>
        </ul>

        <h3 id="retrieval" className="mt-8 mb-2">Retrieval and citations</h3>
        <ul className="list-disc pl-6 space-y-2 mb-6">
          <li>Hybrid search (semantic + keyword) improves recall.</li>
          <li>Per‑agent top‑k and score thresholds control grounding.</li>
          <li>Answers include clickable citations to original passages.</li>
        </ul>

        <h3 id="permissions" className="mt-8 mb-2">Permissions</h3>
        <ul className="list-disc pl-6 space-y-2 mb-6">
          <li>Project‑scoped access: agents only see sources added to the project.</li>
          <li>Optional per‑source visibility and redaction rules.</li>
        </ul>

        <h3 id="best-practices" className="mt-8 mb-2">Best practices</h3>
        <ul className="list-disc pl-6 space-y-2 mb-6">
          <li>Prefer well‑structured documents; add headings for context.</li>
          <li>Tag sources by topic; agents can filter by tags.</li>
          <li>Keep large tables in CSV for accurate parsing.</li>
        </ul>

        <h3 id="troubleshooting" className="mt-8 mb-2">Troubleshooting</h3>
        <ul className="list-disc pl-6 space-y-2 mb-6">
          <li>If citations look wrong, reduce chunk size or increase overlap.</li>
          <li>Re‑sync after major edits; stale chunks can surface.</li>
          <li>Check the processing log for extraction errors per file.</li>
        </ul>
      </DocsBody>
      <Separator className="my-8" />
    </>
  );
}
