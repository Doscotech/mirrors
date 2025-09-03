import { Metadata } from 'next';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Agent Conversation | Xera',
  description: 'Interactive agent conversation powered by Xera',
  openGraph: {
    title: 'Agent Conversation | Xera',
    description: 'Interactive agent conversation powered by Xera',
    type: 'website',
  },
};

export default async function AgentsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
