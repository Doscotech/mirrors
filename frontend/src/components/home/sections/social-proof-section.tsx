import Link from 'next/link';

export function SocialProofSection() {
  return (
    <section className="relative w-full flex items-center justify-center py-24 overflow-hidden px-4">
      <div className="w-full max-w-6xl mx-auto relative z-10 flex flex-col items-center justify-center rounded-3xl px-8 py-20 bg-background/60 backdrop-blur-xl border border-border">
        <h2 className="text-xl text-muted-foreground mb-6">Trusted by builders</h2>
        <div className="flex flex-wrap gap-6 items-center justify-center opacity-80">
          <LogoBadge label="Vercel" />
          <LogoBadge label="Supabase" />
          <LogoBadge label="Stripe" />
          <LogoBadge label="OpenAI" />
          <LogoBadge label="LangChain" />
        </div>
        <div className="mt-8 text-sm text-muted-foreground text-center">
          <p>
            Join teams shipping with autonomous agents. <Link className="underline underline-offset-4" href="/auth">Start free</Link>
          </p>
        </div>
      </div>
    </section>
  );
}

function LogoBadge({ label }: { label: string }) {
  return (
    <div className="px-4 py-2 rounded-full border border-border/60 bg-background/40 text-foreground/80 text-sm">
      {label}
    </div>
  );
}
