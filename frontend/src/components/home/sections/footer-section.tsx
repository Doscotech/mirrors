'use client';

import { FlickeringGrid } from '@/components/home/ui/flickering-grid';
import { useMediaQuery } from '@/hooks/use-media-query';
import { siteConfig } from '@/lib/home';
import { ChevronRightIcon } from '@radix-ui/react-icons';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export function FooterSection() {
  const tablet = useMediaQuery('(max-width: 1024px)');
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <footer id="footer" className="w-full pb-0 px-6">
        <div className="w-full mx-auto">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between p-10">
            <div className="flex flex-col items-start justify-start gap-y-5 max-w-xs mx-0">
              <Link href="/" className="flex items-center gap-2">
                <span className="text-2xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">Xera</span>
              </Link>
              <p className="tracking-tight text-muted-foreground font-medium">
                {siteConfig.hero.description}
              </p>

              {/* Social links removed per request */}
              {/* <div className="flex items-center gap-2 dark:hidden">
                <Icons.soc2 className="size-12" />
                <Icons.hipaa className="size-12" />
                <Icons.gdpr className="size-12" />
              </div>
              <div className="dark:flex items-center gap-2 hidden">
                <Icons.soc2Dark className="size-12" />
                <Icons.hipaaDark className="size-12" />
                <Icons.gdprDark className="size-12" />
              </div> */}
            </div>
            <div className="pt-5 md:w-1/2">
          <div className="flex flex-col items-start justify-start md:flex-row md:items-center md:justify-between gap-y-5 lg:pl-10">
            {siteConfig.footerLinks.map((column, columnIndex) => (
              <ul key={columnIndex} className="flex flex-col gap-y-2">
                <li className="mb-2 text-sm font-semibold text-primary">
                  {column.title}
                </li>
                {column.links.map((link) => {
                  const isExternal = /^https?:\/\//.test(link.url) || link.url.startsWith('mailto:');
                  return (
                    <li
                      key={link.id}
                      className="group inline-flex cursor-pointer items-center justify-start gap-1 text-[15px]/snug text-muted-foreground"
                    >
                      {isExternal ? (
                        <a href={link.url} target="_blank" rel="noopener noreferrer">
                          {link.title}
                        </a>
                      ) : (
                        <Link href={link.url}>{link.title}</Link>
                      )}
                      <div className="flex size-4 items-center justify-center border border-border rounded translate-x-0 transform opacity-0 transition-all duration-300 ease-out group-hover:translate-x-1 group-hover:opacity-100">
                        <ChevronRightIcon className="h-4 w-4 " />
                      </div>
                    </li>
                  );
                })}
              </ul>
            ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      <Link
        href="https://www.youtube.com/watch?v=nuf5BF1jvjQ"
        target="_blank"
        rel="noopener noreferrer"
        className="block w-full h-48 md:h-64 relative mt-24 z-0 cursor-pointer"
      >
        <div className="absolute inset-0 bg-gradient-to-t from-transparent to-background z-10 from-40%" />
        <div className="absolute inset-0 ">
          <FlickeringGrid
            text={tablet ? 'Agents' : 'Agents Agents Agents'}
            fontSize={tablet ? 60 : 90}
            className="h-full w-full"
            squareSize={2}
            gridGap={tablet ? 2 : 3}
            color="#6B7280"
            maxOpacity={0.3}
            flickerChance={0.1}
          />
        </div>
      </Link>
    </footer>
  );
}
