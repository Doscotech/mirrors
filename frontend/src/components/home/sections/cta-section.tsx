import Image from 'next/image';
import { siteConfig } from '@/lib/home';
import Link from 'next/link';
import { HeroVideoSection } from './hero-video-section';

export function CTASection() {
  const { ctaSection } = siteConfig;
  const title = ctaSection.title;
  const lower = title.toLowerCase();
  const needle = 'ai agent';
  const idx = lower.indexOf(needle);

  return (
    <section
      id="cta"
      className="flex flex-col items-center justify-center w-full pt-10 pb-10 px-6"
    >
      <div className="w-full mx-auto">
        <div className="max-w-6xl mx-auto">
          <div className="h-[220px] md:h-[260px] overflow-hidden shadow-lg w-full border border-border rounded-xl bg-secondary relative z-20">
          <div className="absolute inset-0 -top-20 md:-top-24 flex flex-col items-center justify-center">
            <h1 className="xera-headline text-white max-w-xs md:max-w-xl text-center">
              {idx === -1 ? (
                title
              ) : (
                <>
                  {title.slice(0, idx)}
                  <span className="xera-accent xera-accent-md">{title.slice(idx, idx + needle.length)}</span>
                  {title.slice(idx + needle.length)}
                </>
              )}
            </h1>
            <div className="absolute bottom-6 flex flex-col items-center justify-center gap-2">
              <Link
                href={ctaSection.button.href}
                className="bg-white text-black font-semibold text-xs h-9 w-fit px-3 rounded-full flex items-center justify-center shadow-md"
              >
                {ctaSection.button.text}
              </Link>
              <span className="text-white text-xs">{ctaSection.subtext}</span>
            </div>
          </div>
          </div>
        </div>
      </div>
    </section>
  );
}
