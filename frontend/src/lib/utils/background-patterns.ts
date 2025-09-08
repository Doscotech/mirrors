export const backgroundPatterns = {
  grid: `
    radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0) 
    0 0 / 40px 40px
  `,
  dots: `
    radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0) 
    0 0 / 20px 20px
  `,
  noise: `
    url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")
  `
};

export const getBackgroundPattern = (
  type: 'grid' | 'dots' | 'noise' = 'grid', 
  color: string = 'currentColor'
) => {
  const pattern = backgroundPatterns[type].replace('currentColor', color);
  return pattern;
};
