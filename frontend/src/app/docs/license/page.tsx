'use client';

import * as React from 'react';
import { 
  DocsHeader,
  DocsCard,
  DocsBody,
  DocsBullets,
  DocsBulletItem,
  DocsImage,
} from '@/components/ui/docs-index';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Ripple } from '@/components/ui/ripple';
import { Icon } from 'lucide-react';

const breadcrumbs = [
  { title: 'Docs', onClick: () => window.location.href = '/docs' },
  { title: 'License' }
];

export default function LicensePage() {
  return (
    <>
      <DocsHeader
        title="Legal"
        description="Xera is a SaaS product. This page links to our Terms, Privacy, and acceptable use information."
        breadcrumbs={breadcrumbs}
        lastUpdated="August 2025"
        showSeparator
        size="lg"
        className="mb-8 sm:mb-12"
      />
      <DocsBody className="w-full px-8 py-8 relative overflow-hidden rounded-3xl border bg-background mb-12">
        <div className="space-y-2">
          <h2 className="text-xl font-semibold">Overview</h2>
          <p className="text-muted-foreground">
            Xera is provided as a hosted service. Self-hosting details and source code references from the legacy project are no longer applicable.
          </p>
        </div>
      </DocsBody>
      <section className="mb-12">
        <DocsBody className="mb-8">
          <h2 id="policies">Policies</h2>
          <p className="text-lg mb-6">
            Find the latest versions of our Terms of Service and Privacy Policy below.
          </p>
        </DocsBody>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <DocsCard
            title="Terms of Service"
            description="Read the terms that govern your use of Xera."
            clickable
            actions={[{ label: 'View Terms', variant: 'default', onClick: () => window.open('/legal#terms', '_self') }]}
          />
          <DocsCard
            title="Privacy Policy"
            description="Learn how we collect, use, and protect your data."
            clickable
            actions={[{ label: 'View Privacy', variant: 'default', onClick: () => window.open('/legal#privacy', '_self') }]}
          />
        </div>
      </section>
      {/* Legacy open-source content removed for SaaS positioning */}
    </>
  );
} 