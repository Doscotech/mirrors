// Curated featured template IDs for "Featured by Xpathedge"
// Populate with template_id values to pin specific agents in the spotlight row
const LOCAL_CURATED: string[] = [
  // 'tmpl_example_1',
  // 'tmpl_example_2',
];

// Optional env override (comma-separated)
const fromEnv = (process.env.NEXT_PUBLIC_CURATED_TEMPLATE_IDS || '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

export const CURATED_FEATURED_TEMPLATE_IDS: string[] = fromEnv.length > 0 ? fromEnv : LOCAL_CURATED;
