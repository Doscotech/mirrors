export const siteConfig = {
  name: 'Xera',
  url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  description: 'The Generalist AI Worker that can act on your behalf.',
  links: {
    twitter: 'https://x.com/xera',
    github: 'https://github.com/',
    linkedin: 'https://www.linkedin.com/company/xera/',
  },
};

export type SiteConfig = typeof siteConfig;
