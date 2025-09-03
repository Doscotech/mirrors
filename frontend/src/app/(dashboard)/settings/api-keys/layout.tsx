import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'API Keys | Xera',
  description: 'Manage your API keys for programmatic access to Xera',
  openGraph: {
    title: 'API Keys | Xera',
    description: 'Manage your API keys for programmatic access to Xera',
    type: 'website',
  },
};

export default async function APIKeysLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
