import { ThemeProvider } from '@/components/home/theme-provider';
import { siteConfig } from '@/lib/site';
import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import { vujahdayScript } from './fonts';
import { Toaster } from '@/components/ui/sonner';
import { Analytics } from '@vercel/analytics/react';
import { GoogleAnalytics } from '@next/third-parties/google';
import { SpeedInsights } from '@vercel/speed-insights/next';
import Script from 'next/script';
import { PostHogIdentify } from '@/components/posthog-identify';
import '@/lib/polyfills'; // Load polyfills early

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const viewport: Viewport = {
  themeColor: 'black',
};

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.name,
    template: `%s - ${siteConfig.name}`,
  },
  description:
    'Xera is a SaaS platform to build, manage, and train your AI Workforce. Launch agents, connect tools, and orchestrate real work end-to-end with observability.',
  keywords: [
    'AI',
    'AI Worker',
    'Generalist AI',
    'Autonomous Agent',
    'Agent Orchestration',
    'Workflows',
    'Observability',
  ],
  authors: [{ name: 'Xera', url: siteConfig.url }],
  creator: 'Xera',
  publisher: 'Xera',
  category: 'Technology',
  applicationName: 'Xera',
  formatDetection: {
    telephone: false,
    email: false,
    address: false,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  openGraph: {
    title: 'Xera – Build, manage and train your AI Workforce',
    description:
      'Xera is a SaaS platform to build, manage, and train your AI Workforce. Launch agents, connect tools, and orchestrate real work end-to-end with observability.',
    url: siteConfig.url,
    siteName: 'Xera',
    images: [
      {
        url: '/banner.png',
        width: 1200,
        height: 630,
        alt: 'Xera – Build, manage and train your AI Workforce',
        type: 'image/png',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Xera – Build, manage and train your AI Workforce',
    description:
      'Xera is a SaaS platform to build, manage, and train your AI Workforce. Launch agents, connect tools, and orchestrate real work end-to-end with observability.',
    creator: '@xera',
    site: '@xera',
    images: [
      {
        url: '/banner.png',
        width: 1200,
        height: 630,
        alt: 'Xera – Build, manage and train your AI Workforce',
      },
    ],
  },
  icons: {
    icon: [{ url: '/favicon.png', sizes: 'any' }],
    shortcut: '/favicon.png',
  },
  // manifest: "/manifest.json",
  alternates: {
    canonical: siteConfig.url,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Google Tag Manager */}
        <Script id="google-tag-manager" strategy="afterInteractive">
          {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
          new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
          j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
          'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
          })(window,document,'script','dataLayer','GTM-PCHSN4M2');`}
        </Script>
        <Script async src="https://cdn.tolt.io/tolt.js" data-tolt={process.env.NEXT_PUBLIC_TOLT_REFERRAL_ID}></Script>
      </head>

      <body
        className={`${geistSans.variable} ${geistMono.variable} ${vujahdayScript.variable} antialiased font-sans bg-background`}
      >
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-PCHSN4M2"
            height="0"
            width="0"
            style={{ display: 'none', visibility: 'hidden' }}
          />
        </noscript>
        {/* End Google Tag Manager (noscript) */}

        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Providers>
            {children}
            <Toaster />
          </Providers>
          <Analytics />
          <GoogleAnalytics gaId="G-6ETJFB3PT3" />
          <SpeedInsights />
          <PostHogIdentify />
        </ThemeProvider>
      </body>
    </html>
  );
}
